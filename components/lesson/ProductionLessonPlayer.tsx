import React, { useEffect, useMemo, useState } from "react";
import { useEventListener } from "expo";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { router } from "expo-router";
import {
  completeLessonAndUnlockNext,
  markLessonInProgress,
} from "../../lib/platform/progress";
import {
  getProductionLessonResponse,
  saveProductionLessonResponse,
} from "../../lib/platform/productionResponses";
import {
  hasProductionLessonContent,
  nextProductionLessonStep,
  previousProductionLessonStep,
  PRODUCTION_LESSON_STEPS,
  productionStepLabel,
  scoreProductionQuiz,
  type ProductionLessonStep,
  type QuizAnswerMap,
} from "../../lib/platform/productionLessonFlow";
import type {
  LessonRecord,
  ProductionActivity,
  ProductionLessonVideo,
  ProductionQuizQuestion,
  ProductionTeachingSection,
} from "../../lib/platform/types";
import {
  getSafeStepsLessonWatercolorPalette,
  safestepsLessonTheme,
} from "../../lib/safestepsLessonTheme";

type Props = {
  lesson: LessonRecord;
  enrolmentId?: string;
};

type ResponseMap = Record<string, unknown>;
type VideoProgressMap = Record<string, number>;

function valueAsString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalise(value: string) {
  return value.trim().toLocaleLowerCase();
}

function mediaUrl(video: ProductionLessonVideo) {
  return video.VideoUrl || video.MediaUrl || video.Url || "";
}

function responseKey(prefix: string, id: string | undefined, index: number) {
  return `${prefix}:${id || index}`;
}

export default function ProductionLessonPlayer({ lesson, enrolmentId }: Props) {
  const content = lesson.production_content;
  if (!hasProductionLessonContent(content)) {
    throw new Error("Production lesson content is missing or invalid.");
  }

  const [step, setStep] = useState<ProductionLessonStep>("definition");
  const [responses, setResponses] = useState<ResponseMap>({});
  const [videoProgress, setVideoProgress] = useState<VideoProgressMap>({});
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswerMap>({});
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [assessmentStatus, setAssessmentStatus] = useState<
    "not_started" | "draft" | "submitted" | "reviewed"
  >("not_started");
  const [feedback, setFeedback] = useState("");
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [saving, setSaving] = useState(false);

  const palette = useMemo(
    () => getSafeStepsLessonWatercolorPalette(lesson.id),
    [lesson.id],
  );
  const stepIndex = Math.max(PRODUCTION_LESSON_STEPS.indexOf(step), 0);
  const quizResult = useMemo(
    () => scoreProductionQuiz(content.Quiz, quizAnswers),
    [content.Quiz, quizAnswers],
  );

  useEffect(() => {
    let mounted = true;

    async function loadSaved() {
      try {
        const saved = await getProductionLessonResponse(lesson.id, enrolmentId);
        if (!mounted || !saved) return;
        const savedData = (saved.response_data ?? {}) as ResponseMap;
        setResponses(
          savedData.responses && typeof savedData.responses === "object"
            ? (savedData.responses as ResponseMap)
            : {},
        );
        setVideoProgress(
          savedData.videoProgress && typeof savedData.videoProgress === "object"
            ? (savedData.videoProgress as VideoProgressMap)
            : {},
        );
        setQuizAnswers(
          savedData.quizAnswers && typeof savedData.quizAnswers === "object"
            ? (savedData.quizAnswers as QuizAnswerMap)
            : {},
        );
        setCompletedSteps(saved.completed_steps ?? []);
        setAssessmentStatus(saved.assessment_status ?? "not_started");
        if (
          saved.current_step &&
          PRODUCTION_LESSON_STEPS.includes(saved.current_step as ProductionLessonStep)
        ) {
          setStep(saved.current_step as ProductionLessonStep);
        }
      } catch (error) {
        Alert.alert(
          "Saved progress",
          error instanceof Error
            ? error.message
            : "Could not restore saved production lesson progress.",
        );
      } finally {
        if (mounted) setLoadingSaved(false);
      }
    }

    loadSaved();
    return () => {
      mounted = false;
    };
  }, [enrolmentId, lesson.id]);

  useEffect(() => {
    if (!enrolmentId || loadingSaved) return;
    markLessonInProgress(enrolmentId, lesson.id, step).catch(() => undefined);
  }, [enrolmentId, lesson.id, loadingSaved, step]);

  function setResponse(key: string, value: unknown) {
    setResponses((current) => ({ ...current, [key]: value }));
    setFeedback("");
  }

  async function persist(
    currentStep: ProductionLessonStep,
    complete = false,
    nextCompletedSteps = completedSteps,
  ) {
    await saveProductionLessonResponse({
      lessonId: lesson.id,
      enrolmentId,
      currentStep,
      completedSteps: nextCompletedSteps,
      responseData: { responses, videoProgress, quizAnswers },
      quizScore: quizResult.percent,
      quizPassed: quizResult.passed,
      assessmentStatus,
      completedAt: complete ? new Date().toISOString() : null,
    });
  }

  function validateDefinition() {
    const answer = valueAsString(responses.definition).trim();
    const minimum = content.DefinitionGate?.MinimumCharacters ?? 100;
    if (answer.length < minimum) {
      throw new Error(`Write at least ${minimum} characters before continuing.`);
    }
  }

  function validateVideo(index: number) {
    const video = content.Videos?.[index];
    if (!video) return;
    const id = video.VideoId || `video-${index + 1}`;
    const url = mediaUrl(video);
    const minimumWatch = video.MinimumWatchPercent ?? 95;
    if (url && (videoProgress[id] ?? 0) < minimumWatch) {
      throw new Error(`Watch at least ${minimumWatch}% of this video before continuing.`);
    }
    if (!url && responses[`video_ack:${id}`] !== true) {
      throw new Error("Read the complete video script and tick the completion box first.");
    }
    const prompt = video.PostVideoInteraction?.Prompt;
    if (prompt) {
      const answer = valueAsString(responses[`video_response:${id}`]).trim();
      const minimum = video.PostVideoInteraction?.MinimumCharacters ?? 60;
      if (answer.length < minimum) {
        throw new Error(`Complete the video response using at least ${minimum} characters.`);
      }
    }
  }

  function validateTeaching(index: number) {
    const section = content.TeachingSections?.[index];
    const check = section?.KnowledgeCheck;
    if (!check?.Prompt) return;
    const key = responseKey("knowledge", section?.SectionId, index);
    const answer = valueAsString(responses[key]);
    if (!answer) throw new Error("Answer the knowledge check first.");
    if (check.CorrectAnswer && normalise(answer) !== normalise(check.CorrectAnswer)) {
      setFeedback(
        check.Feedback ||
          check.Explanation ||
          "Review this teaching section and try the knowledge check again.",
      );
      throw new Error("The knowledge-check answer is not correct yet.");
    }
  }

  function validateActivity(index: number) {
    const activity = content.InteractiveActivities?.[index];
    if (!activity) return;
    const items = activity.Items ?? [];
    if (!items.length) {
      const key = responseKey("activity", activity.ActivityId, index);
      if (valueAsString(responses[key]).trim().length < 100) {
        throw new Error("Complete the activity response before continuing.");
      }
      return;
    }

    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      const key = responseKey(
        `activity:${activity.ActivityId || index}`,
        items[itemIndex].Field || items[itemIndex].Component,
        itemIndex,
      );
      if (valueAsString(responses[key]).trim().length < 20) {
        throw new Error("Complete every activity field before continuing.");
      }
    }
  }

  function validateCaseStudy() {
    const questions = content.CaseStudy?.LearnerQuestions ?? [];
    for (let index = 0; index < questions.length; index += 1) {
      if (valueAsString(responses[`case:${index}`]).trim().length < 40) {
        throw new Error("Answer every case-study question before continuing.");
      }
    }
  }

  function validateHomePractice() {
    const answer = valueAsString(responses.home_practice).trim();
    if (answer.length < 180) {
      throw new Error("Write a detailed home-practice plan of at least 180 characters.");
    }
    if (!valueAsString(responses.home_evidence_option)) {
      throw new Error("Choose a privacy-safe evidence option.");
    }
  }

  function validateAssessment() {
    const answer = valueAsString(responses.formal_assessment).trim();
    if (answer.length < 600) {
      throw new Error("Complete the formal assessment using at least 600 characters.");
    }
    if (responses.assessment_declaration !== true) {
      throw new Error("Confirm that the assessment is your own completed response.");
    }
    setAssessmentStatus("submitted");
  }

  function validateQuiz() {
    const questions = content.Quiz?.Questions ?? [];
    for (const question of questions) {
      if (!question.QuestionId) continue;
      const answer = quizAnswers[question.QuestionId];
      const unanswered =
        typeof answer === "undefined" ||
        answer === "" ||
        (Array.isArray(answer) && answer.length === 0);
      if (unanswered) throw new Error("Answer every quiz question first.");
    }
    if (!quizResult.passed) {
      const criticalMessage = quizResult.criticalSafetyPassed
        ? ""
        : " Every critical-safety question must also be correct.";
      setFeedback(
        `Score: ${quizResult.percent}%. You need at least ${
          content.Quiz?.PassPercent ?? 80
        }%.${criticalMessage}`,
      );
      throw new Error("The quiz pass requirements have not been met yet.");
    }
  }

  function validateFinalReflection() {
    const answer = valueAsString(responses.final_reflection).trim();
    const minimum = content.FinalReflection?.MinimumCharacters ?? 220;
    if (answer.length < minimum) {
      throw new Error(`Complete the final reflection using at least ${minimum} characters.`);
    }
  }

  function validateCurrentStep() {
    if (step === "definition") validateDefinition();
    if (step === "video_1") validateVideo(0);
    if (step === "teaching_1") validateTeaching(0);
    if (step === "video_2") validateVideo(1);
    if (step === "activity_1") validateActivity(0);
    if (step === "teaching_2") validateTeaching(1);
    if (step === "video_3") validateVideo(2);
    if (step === "case_study") validateCaseStudy();
    if (step === "teaching_3") validateTeaching(2);
    if (step === "video_4") validateVideo(3);
    if (step === "activity_2") validateActivity(1);
    if (step === "home_practice") validateHomePractice();
    if (step === "formal_assessment") validateAssessment();
    if (step === "quiz") validateQuiz();
    if (step === "final_reflection") validateFinalReflection();
  }

  async function goNext() {
    try {
      setSaving(true);
      setFeedback("");
      validateCurrentStep();

      const nextCompletedSteps = Array.from(new Set([...completedSteps, step]));
      setCompletedSteps(nextCompletedSteps);

      if (step === "final_reflection") {
        await persist(step, true, nextCompletedSteps);
        if (enrolmentId) await completeLessonAndUnlockNext(enrolmentId, lesson.id);
        Alert.alert(
          "Lesson complete",
          content.FinalReflection?.CompletionMessage ||
            "Your responses and progress have been saved.",
        );
        router.back();
        return;
      }

      const next = nextProductionLessonStep(step);
      if (!next) return;
      await persist(next, false, nextCompletedSteps);
      setStep(next);
    } catch (error) {
      Alert.alert(
        "Could not continue",
        error instanceof Error ? error.message : "Unknown lesson error.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveDraft() {
    try {
      setSaving(true);
      await persist(step);
      Alert.alert("Draft saved", "Your current lesson responses were saved.");
    } catch (error) {
      Alert.alert(
        "Could not save",
        error instanceof Error ? error.message : "Unknown save error.",
      );
    } finally {
      setSaving(false);
    }
  }

  function goBack() {
    const previous = previousProductionLessonStep(step);
    if (previous) setStep(previous);
  }

  if (loadingSaved) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.body}>Loading production lesson...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.pagePill}>
          Page {stepIndex + 1} of {PRODUCTION_LESSON_STEPS.length}
        </Text>
      </View>

      <View style={styles.progressRow}>
        {PRODUCTION_LESSON_STEPS.map((item, index) => (
          <View
            key={item}
            style={[
              styles.progressSegment,
              index <= stepIndex && { backgroundColor: palette.accent },
            ]}
          />
        ))}
      </View>

      <View style={[styles.heroWash, { backgroundColor: palette.wash }]}>
        <Text style={styles.kicker}>{productionStepLabel(step, content)}</Text>
        <Text style={styles.brand}>SafeSteps</Text>
        <Text style={styles.title}>{content.Title}</Text>
        {!!content.Subtitle && <Text style={styles.subtitle}>{content.Subtitle}</Text>}
        <Text style={styles.counter}>
          Course lesson {content.CourseSequence ?? lesson.day_number}
          {content.LessonNumber ? ` • SafeSteps lesson ${content.LessonNumber}` : ""}
        </Text>
      </View>

      {step === "definition" && (
        <DefinitionStep
          content={content}
          value={valueAsString(responses.definition)}
          onChange={(value) => setResponse("definition", value)}
          accent={palette.accent}
        />
      )}
      {step === "video_1" && renderVideo(0)}
      {step === "teaching_1" && renderTeaching(0)}
      {step === "video_2" && renderVideo(1)}
      {step === "activity_1" && renderActivity(0)}
      {step === "teaching_2" && renderTeaching(1)}
      {step === "video_3" && renderVideo(2)}
      {step === "case_study" && (
        <CaseStudyStep
          lesson={lesson}
          responses={responses}
          setResponse={setResponse}
          accent={palette.accent}
        />
      )}
      {step === "teaching_3" && renderTeaching(2)}
      {step === "video_4" && renderVideo(3)}
      {step === "activity_2" && renderActivity(1)}
      {step === "home_practice" && (
        <HomePracticeStep
          lesson={lesson}
          responses={responses}
          setResponse={setResponse}
          accent={palette.accent}
        />
      )}
      {step === "formal_assessment" && (
        <FormalAssessmentStep
          lesson={lesson}
          responses={responses}
          setResponse={setResponse}
          status={assessmentStatus}
          accent={palette.accent}
        />
      )}
      {step === "quiz" && (
        <QuizStep
          lesson={lesson}
          answers={quizAnswers}
          setAnswers={setQuizAnswers}
          result={quizResult}
          accent={palette.accent}
        />
      )}
      {step === "final_reflection" && (
        <FinalReflectionStep
          lesson={lesson}
          value={valueAsString(responses.final_reflection)}
          onChange={(value) => setResponse("final_reflection", value)}
          accent={palette.accent}
        />
      )}

      {!!feedback && (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedback}>{feedback}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          style={[styles.secondaryButton, { borderColor: palette.accentDark }]}
          onPress={saveDraft}
          disabled={saving}
        >
          <Text style={styles.secondaryButtonText}>Save draft</Text>
        </Pressable>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[
            styles.secondaryButton,
            { borderColor: palette.accentDark },
            !previousProductionLessonStep(step) && styles.disabled,
          ]}
          onPress={goBack}
          disabled={!previousProductionLessonStep(step) || saving}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: palette.accentDark }]}
          onPress={goNext}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {step === "final_reflection"
              ? "Complete lesson"
              : saving
                ? "Saving..."
                : "Continue"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  function renderVideo(index: number) {
    const video = content.Videos?.[index];
    if (!video) {
      return (
        <Card title={`Video ${index + 1}`} accent={palette.accent}>
          <Text style={styles.body}>Video content has not been added.</Text>
        </Card>
      );
    }
    const id = video.VideoId || `video-${index + 1}`;
    return (
      <VideoStep
        video={video}
        progress={videoProgress[id] ?? 0}
        onProgress={(percent) =>
          setVideoProgress((current) => ({
            ...current,
            [id]: Math.max(current[id] ?? 0, percent),
          }))
        }
        acknowledged={responses[`video_ack:${id}`] === true}
        onAcknowledged={(value) => setResponse(`video_ack:${id}`, value)}
        response={valueAsString(responses[`video_response:${id}`])}
        onResponse={(value) => setResponse(`video_response:${id}`, value)}
        accent={palette.accent}
      />
    );
  }

  function renderTeaching(index: number) {
    const section = content.TeachingSections?.[index];
    if (!section) {
      return (
        <Card title={`Teaching ${index + 1}`} accent={palette.accent}>
          <Text style={styles.body}>Teaching content has not been added.</Text>
        </Card>
      );
    }
    const key = responseKey("knowledge", section.SectionId, index);
    return (
      <TeachingStep
        section={section}
        answer={valueAsString(responses[key])}
        onAnswer={(value) => setResponse(key, value)}
        accent={palette.accent}
      />
    );
  }

  function renderActivity(index: number) {
    const activity = content.InteractiveActivities?.[index];
    if (!activity) {
      return (
        <Card title={`Activity ${index + 1}`} accent={palette.accent}>
          <Text style={styles.body}>Activity content has not been added.</Text>
        </Card>
      );
    }
    return (
      <ActivityStep
        activity={activity}
        activityIndex={index}
        responses={responses}
        setResponse={setResponse}
        accent={palette.accent}
      />
    );
  }
}

function DefinitionStep({
  content,
  value,
  onChange,
  accent,
}: {
  content: NonNullable<LessonRecord["production_content"]>;
  value: string;
  onChange: (value: string) => void;
  accent: string;
}) {
  const gate = content.DefinitionGate;
  return (
    <Card title={gate?.ScreenTitle || "Before you begin"} accent={accent}>
      <Text style={styles.body}>
        {gate?.Prompt || "In your own words, explain what this lesson topic means to you."}
      </Text>
      {!!gate?.WhyItMatters && <InfoBox text={gate.WhyItMatters} />}
      <Input
        value={value}
        onChangeText={onChange}
        placeholder="Write your starting definition..."
        multiline
        maxLength={gate?.MaximumCharacters}
      />
      <CharacterCount value={value} minimum={gate?.MinimumCharacters ?? 100} />
    </Card>
  );
}

function VideoStep({
  video,
  progress,
  onProgress,
  acknowledged,
  onAcknowledged,
  response,
  onResponse,
  accent,
}: {
  video: ProductionLessonVideo;
  progress: number;
  onProgress: (percent: number) => void;
  acknowledged: boolean;
  onAcknowledged: (value: boolean) => void;
  response: string;
  onResponse: (value: string) => void;
  accent: string;
}) {
  const url = mediaUrl(video);
  const minimumWatch = video.MinimumWatchPercent ?? 95;

  return (
    <Card title={video.Title || "Lesson video"} accent={accent}>
      {!!video.Purpose && <Text style={styles.body}>{video.Purpose}</Text>}
      {url ? (
        <>
          <RenderedVideo url={url} onProgress={onProgress} accent={accent} />
          <Text style={styles.smallText}>
            Watched: {Math.round(progress)}% • Required: {minimumWatch}%
          </Text>
        </>
      ) : (
        <InfoBox
          text={
            video.AssetStatus ||
            "The rendered media has not been attached. Read the complete production script below."
          }
        />
      )}

      {!!video.VisualDirection && (
        <>
          <Text style={styles.sectionLabel}>Visual direction</Text>
          <Text style={styles.body}>{video.VisualDirection}</Text>
        </>
      )}

      <Text style={styles.sectionLabel}>Narration / transcript</Text>
      <Paragraphs text={video.NarrationScript || "Transcript not supplied."} />

      {!!video.OnScreenText?.length && (
        <>
          <Text style={styles.sectionLabel}>Key messages</Text>
          <BulletList items={video.OnScreenText} />
        </>
      )}

      {!url && (
        <Pressable
          style={[
            styles.checkRow,
            acknowledged && { borderColor: accent, backgroundColor: "#F5F0FA" },
          ]}
          onPress={() => onAcknowledged(!acknowledged)}
        >
          <View style={[styles.checkbox, acknowledged && { backgroundColor: accent }]}>
            {acknowledged && <Text style={styles.checkboxTick}>✓</Text>}
          </View>
          <Text style={styles.checkText}>I have read the complete video script.</Text>
        </Pressable>
      )}

      {!!video.PostVideoInteraction?.Prompt && (
        <>
          <Text style={styles.sectionLabel}>Video response</Text>
          <Text style={styles.body}>{video.PostVideoInteraction.Prompt}</Text>
          <Input
            value={response}
            onChangeText={onResponse}
            placeholder="Write your response..."
            multiline
          />
          <CharacterCount
            value={response}
            minimum={video.PostVideoInteraction.MinimumCharacters ?? 60}
          />
        </>
      )}
    </Card>
  );
}

function RenderedVideo({
  url,
  onProgress,
  accent,
}: {
  url: string;
  onProgress: (percent: number) => void;
  accent: string;
}) {
  const [duration, setDuration] = useState(0);
  const player = useVideoPlayer(url, (instance) => {
    instance.timeUpdateEventInterval = 1;
  });

  useEventListener(player, "sourceLoad", (event) => setDuration(event.duration || 0));
  useEventListener(player, "timeUpdate", (event) => {
    if (duration > 0) onProgress(Math.min(100, (event.currentTime / duration) * 100));
  });
  useEventListener(player, "playToEnd", () => onProgress(100));

  return (
    <>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls
        fullscreenOptions={{ enable: true }}
      />
      <View style={styles.videoActions}>
        <Pressable
          style={[styles.miniButton, { backgroundColor: accent }]}
          onPress={() => player.play()}
        >
          <Text style={styles.miniButtonText}>Play</Text>
        </Pressable>
        <Pressable style={styles.miniSecondaryButton} onPress={() => player.pause()}>
          <Text style={styles.miniSecondaryText}>Pause</Text>
        </Pressable>
      </View>
    </>
  );
}

function TeachingStep({
  section,
  answer,
  onAnswer,
  accent,
}: {
  section: ProductionTeachingSection;
  answer: string;
  onAnswer: (value: string) => void;
  accent: string;
}) {
  const check = section.KnowledgeCheck;
  return (
    <Card title={section.Title || "Teaching content"} accent={accent}>
      <Paragraphs text={section.Content || "No teaching copy supplied."} />
      {!!section.KeyTakeaways?.length && (
        <>
          <Text style={styles.sectionLabel}>Key takeaways</Text>
          <BulletList items={section.KeyTakeaways} />
        </>
      )}
      {!!check?.Prompt && (
        <>
          <Text style={styles.sectionLabel}>Knowledge check</Text>
          <Text style={styles.body}>{check.Prompt}</Text>
          {!!check.Options?.length ? (
            check.Options.map((option) => (
              <Choice
                key={option}
                label={option}
                selected={answer === option}
                onPress={() => onAnswer(option)}
                accent={accent}
              />
            ))
          ) : (
            <Input
              value={answer}
              onChangeText={onAnswer}
              placeholder="Write your answer..."
              multiline
            />
          )}
        </>
      )}
    </Card>
  );
}

function ActivityStep({
  activity,
  activityIndex,
  responses,
  setResponse,
  accent,
}: {
  activity: ProductionActivity;
  activityIndex: number;
  responses: ResponseMap;
  setResponse: (key: string, value: unknown) => void;
  accent: string;
}) {
  const items = activity.Items ?? [];
  return (
    <Card title={activity.Title || "Learning activity"} accent={accent}>
      {!!activity.Instructions && <Text style={styles.body}>{activity.Instructions}</Text>}
      {items.length ? (
        items.map((item, index) => {
          const key = responseKey(
            `activity:${activity.ActivityId || activityIndex}`,
            item.Field || item.Component,
            index,
          );
          return (
            <View key={key} style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                {item.Field || item.Component || `Response ${index + 1}`}
              </Text>
              <Text style={styles.body}>{item.Prompt}</Text>
              <Input
                value={valueAsString(responses[key])}
                onChangeText={(value) => setResponse(key, value)}
                placeholder="Write your response..."
                multiline
              />
            </View>
          );
        })
      ) : (
        <Input
          value={valueAsString(
            responses[responseKey("activity", activity.ActivityId, activityIndex)],
          )}
          onChangeText={(value) =>
            setResponse(responseKey("activity", activity.ActivityId, activityIndex), value)
          }
          placeholder="Complete the activity..."
          multiline
        />
      )}
      {!!activity.ModelGuidance && <InfoBox text={activity.ModelGuidance} />}
      {!!activity.CompletionRule && (
        <Text style={styles.smallText}>{activity.CompletionRule}</Text>
      )}
    </Card>
  );
}

function CaseStudyStep({
  lesson,
  responses,
  setResponse,
  accent,
}: {
  lesson: LessonRecord;
  responses: ResponseMap;
  setResponse: (key: string, value: unknown) => void;
  accent: string;
}) {
  const item = lesson.production_content?.CaseStudy;
  const [showModel, setShowModel] = useState(false);
  return (
    <Card title={item?.Title || "Case study"} accent={accent}>
      <Text style={styles.body}>{item?.Scenario}</Text>
      {(item?.LearnerQuestions ?? []).map((question, index) => (
        <View key={`${index}-${question}`} style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Question {index + 1}</Text>
          <Text style={styles.body}>{question}</Text>
          <Input
            value={valueAsString(responses[`case:${index}`])}
            onChangeText={(value) => setResponse(`case:${index}`, value)}
            placeholder="Write your analysis..."
            multiline
          />
        </View>
      ))}
      <Pressable style={styles.textButton} onPress={() => setShowModel(!showModel)}>
        <Text style={[styles.textButtonText, { color: accent }]}>
          {showModel ? "Hide model response" : "Show model response"}
        </Text>
      </Pressable>
      {showModel && !!item?.ModelResponse && <InfoBox text={item.ModelResponse} />}
    </Card>
  );
}

function HomePracticeStep({
  lesson,
  responses,
  setResponse,
  accent,
}: {
  lesson: LessonRecord;
  responses: ResponseMap;
  setResponse: (key: string, value: unknown) => void;
  accent: string;
}) {
  const task = lesson.production_content?.HomePracticeTask;
  const selected = valueAsString(responses.home_evidence_option);
  return (
    <Card title={task?.Title || "Home practice"} accent={accent}>
      {!!task?.Duration && (
        <Text style={styles.smallText}>Suggested duration: {task.Duration}</Text>
      )}
      <BulletList items={task?.Instructions ?? []} />
      {!!task?.PrivacyReminder && <InfoBox text={task.PrivacyReminder} />}
      <Text style={styles.sectionLabel}>Your practice plan</Text>
      <Input
        value={valueAsString(responses.home_practice)}
        onChangeText={(value) => setResponse("home_practice", value)}
        placeholder="Write how, when and where you will practise..."
        multiline
      />
      <CharacterCount value={valueAsString(responses.home_practice)} minimum={180} />
      <Text style={styles.sectionLabel}>Evidence option</Text>
      {(task?.EvidenceOptions ?? []).map((option) => (
        <Choice
          key={option}
          label={option}
          selected={selected === option}
          onPress={() => setResponse("home_evidence_option", option)}
          accent={accent}
        />
      ))}
      {!!task?.SuccessCriteria?.length && (
        <>
          <Text style={styles.sectionLabel}>Success criteria</Text>
          <BulletList items={task.SuccessCriteria} />
        </>
      )}
    </Card>
  );
}

function FormalAssessmentStep({
  lesson,
  responses,
  setResponse,
  status,
  accent,
}: {
  lesson: LessonRecord;
  responses: ResponseMap;
  setResponse: (key: string, value: unknown) => void;
  status: string;
  accent: string;
}) {
  const assessment = lesson.production_content?.FormalAssessment;
  const answer = valueAsString(responses.formal_assessment);
  const declared = responses.assessment_declaration === true;
  return (
    <Card title={assessment?.Title || "Formal assessment"} accent={accent}>
      <Text style={styles.body}>{assessment?.Prompt}</Text>
      {!!assessment?.FormatOptions?.length && (
        <>
          <Text style={styles.sectionLabel}>Accepted formats</Text>
          <BulletList items={assessment.FormatOptions} />
        </>
      )}
      <Text style={styles.sectionLabel}>Assessment response</Text>
      <Input
        value={answer}
        onChangeText={(value) => setResponse("formal_assessment", value)}
        placeholder="Write your complete assessment..."
        multiline
        style={styles.assessmentInput}
      />
      <CharacterCount value={answer} minimum={600} />
      {!!assessment?.Rubric?.length && (
        <>
          <Text style={styles.sectionLabel}>Assessment rubric</Text>
          {assessment.Rubric.map((criterion, index) => (
            <View key={`${criterion.Criterion}-${index}`} style={styles.rubricRow}>
              <Text style={styles.fieldLabel}>
                {criterion.Criterion} ({criterion.WeightPercent ?? 0}%)
              </Text>
              <Text style={styles.body}>{criterion.HighStandard}</Text>
            </View>
          ))}
        </>
      )}
      <Pressable
        style={[
          styles.checkRow,
          declared && { borderColor: accent, backgroundColor: "#F5F0FA" },
        ]}
        onPress={() => setResponse("assessment_declaration", !declared)}
      >
        <View style={[styles.checkbox, declared && { backgroundColor: accent }]}>
          {declared && <Text style={styles.checkboxTick}>✓</Text>}
        </View>
        <Text style={styles.checkText}>
          I confirm this is my completed response and is ready to submit.
        </Text>
      </Pressable>
      <Text style={styles.smallText}>Status: {status.replace("_", " ")}</Text>
    </Card>
  );
}

function QuizStep({
  lesson,
  answers,
  setAnswers,
  result,
  accent,
}: {
  lesson: LessonRecord;
  answers: QuizAnswerMap;
  setAnswers: React.Dispatch<React.SetStateAction<QuizAnswerMap>>;
  result: ReturnType<typeof scoreProductionQuiz>;
  accent: string;
}) {
  const quiz = lesson.production_content?.Quiz;
  return (
    <Card title={quiz?.Title || "Knowledge quiz"} accent={accent}>
      <Text style={styles.body}>
        Pass mark: {quiz?.PassPercent ?? 80}%. Every critical-safety question must be correct.
      </Text>
      {(quiz?.Questions ?? []).map((question, index) => (
        <QuizQuestion
          key={question.QuestionId || index}
          question={question}
          index={index}
          answer={question.QuestionId ? answers[question.QuestionId] : undefined}
          onChange={(value) => {
            if (!question.QuestionId) return;
            setAnswers((current) => ({
              ...current,
              [question.QuestionId as string]: value,
            }));
          }}
          accent={accent}
        />
      ))}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreText}>Current score: {result.percent}%</Text>
        <Text style={styles.smallText}>
          Safety items: {result.criticalSafetyPassed ? "passed" : "not passed"}
        </Text>
      </View>
    </Card>
  );
}

function QuizQuestion({
  question,
  index,
  answer,
  onChange,
  accent,
}: {
  question: ProductionQuizQuestion;
  index: number;
  answer: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  accent: string;
}) {
  const multi = Array.isArray(question.CorrectAnswers) || question.Type === "MultiSelect";
  const selectedMany = Array.isArray(answer) ? answer : [];
  return (
    <View style={styles.quizQuestion}>
      <Text style={styles.fieldLabel}>
        {index + 1}. {question.Prompt}
        {question.CriticalSafetyQuestion ? " • Safety question" : ""}
      </Text>
      {(question.Options ?? []).map((option) => {
        const selected = multi ? selectedMany.includes(option) : answer === option;
        return (
          <Choice
            key={option}
            label={option}
            selected={selected}
            onPress={() => {
              if (!multi) {
                onChange(option);
                return;
              }
              onChange(
                selected
                  ? selectedMany.filter((item) => item !== option)
                  : [...selectedMany, option],
              );
            }}
            accent={accent}
          />
        );
      })}
      {!question.Options?.length && (
        <Input
          value={typeof answer === "string" ? answer : ""}
          onChangeText={onChange}
          placeholder="Write your answer..."
          multiline
        />
      )}
    </View>
  );
}

function FinalReflectionStep({
  lesson,
  value,
  onChange,
  accent,
}: {
  lesson: LessonRecord;
  value: string;
  onChange: (value: string) => void;
  accent: string;
}) {
  const reflection = lesson.production_content?.FinalReflection;
  return (
    <Card title="Final reflection" accent={accent}>
      <Text style={styles.body}>
        {reflection?.Prompt ||
          "What changed in your thinking and what will you practise next?"}
      </Text>
      <Input
        value={value}
        onChangeText={onChange}
        placeholder="Write your final reflection..."
        multiline
      />
      <CharacterCount value={value} minimum={reflection?.MinimumCharacters ?? 220} />
    </Card>
  );
}

function Card({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardIcon, { backgroundColor: accent }]} />
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Paragraphs({ text }: { text: string }) {
  return (
    <View style={styles.paragraphGroup}>
      {text
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <Text key={`${paragraph.slice(0, 24)}-${index}`} style={styles.body}>
            {paragraph}
          </Text>
        ))}
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.bulletList}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.bulletRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={[styles.body, styles.bulletText]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function InfoBox({ text }: { text: string }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function Choice({
  label,
  selected,
  onPress,
  accent,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  accent: string;
}) {
  return (
    <Pressable
      style={[
        styles.option,
        selected && { borderColor: accent, backgroundColor: "#F5F0FA" },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.choiceDot,
          selected && { borderColor: accent, backgroundColor: accent },
        ]}
      />
      <Text style={styles.optionText}>{label}</Text>
    </Pressable>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      style={[styles.input, props.multiline && styles.multiline, props.style]}
      placeholderTextColor={safestepsLessonTheme.colors.muted}
    />
  );
}

function CharacterCount({ value, minimum }: { value: string; minimum: number }) {
  return (
    <Text
      style={[
        styles.smallText,
        value.trim().length >= minimum && styles.completeText,
      ]}
    >
      {value.trim().length}/{minimum} minimum characters
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    backgroundColor: safestepsLessonTheme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: safestepsLessonTheme.colors.card,
    ...safestepsLessonTheme.shadow,
  },
  backButtonText: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 30,
    fontWeight: "900",
  },
  pagePill: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    overflow: "hidden",
    backgroundColor: safestepsLessonTheme.colors.lavender,
    color: safestepsLessonTheme.colors.purpleDark,
    fontWeight: "800",
  },
  progressRow: { flexDirection: "row", gap: 3 },
  progressSegment: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: safestepsLessonTheme.colors.line,
  },
  heroWash: {
    borderRadius: 32,
    padding: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
  },
  kicker: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  brand: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  title: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 30,
    lineHeight: 37,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  counter: {
    color: safestepsLessonTheme.colors.muted,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "700",
  },
  body: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: safestepsLessonTheme.colors.card,
    borderRadius: 22,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
  },
  cardIcon: { width: 44, height: 6, borderRadius: 999 },
  cardTitle: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
  },
  sectionLabel: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  fieldGroup: { gap: 8, marginTop: 6 },
  fieldLabel: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
  input: {
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.line,
    borderRadius: 14,
    padding: 12,
    backgroundColor: safestepsLessonTheme.colors.white,
    color: safestepsLessonTheme.colors.navy,
    fontSize: 15,
  },
  multiline: { minHeight: 120, textAlignVertical: "top" },
  assessmentInput: { minHeight: 260 },
  option: {
    padding: 12,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.line,
    borderRadius: 14,
    backgroundColor: safestepsLessonTheme.colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  optionText: {
    color: safestepsLessonTheme.colors.navy,
    flex: 1,
    lineHeight: 21,
  },
  choiceDot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: safestepsLessonTheme.colors.line,
  },
  checkRow: {
    padding: 13,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.line,
    borderRadius: 14,
    backgroundColor: safestepsLessonTheme.colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxTick: { color: "#FFFFFF", fontWeight: "900" },
  checkText: {
    flex: 1,
    color: safestepsLessonTheme.colors.navy,
    lineHeight: 21,
  },
  paragraphGroup: { gap: 12 },
  bulletList: { gap: 8 },
  bulletRow: { flexDirection: "row", gap: 9 },
  bullet: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 22,
    lineHeight: 24,
  },
  bulletText: { flex: 1 },
  infoBox: {
    backgroundColor: "#F4F7FA",
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: "#D8E0E8",
  },
  infoText: {
    color: safestepsLessonTheme.colors.navy,
    lineHeight: 22,
  },
  feedbackCard: {
    backgroundColor: "#FFF1F1",
    borderWidth: 1,
    borderColor: "#E0A0A0",
    borderRadius: 14,
    padding: 13,
  },
  feedback: { color: "#7A2631", fontWeight: "700", lineHeight: 21 },
  smallText: {
    color: safestepsLessonTheme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  completeText: { color: "#26734D", fontWeight: "700" },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 14,
    backgroundColor: "#000000",
  },
  videoActions: { flexDirection: "row", gap: 10 },
  miniButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  miniButtonText: { color: "#FFFFFF", fontWeight: "800" },
  miniSecondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.line,
  },
  miniSecondaryText: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontWeight: "800",
  },
  textButton: { alignSelf: "flex-start", paddingVertical: 5 },
  textButtonText: { fontWeight: "800" },
  rubricRow: {
    borderLeftWidth: 4,
    borderLeftColor: safestepsLessonTheme.colors.lavender,
    paddingLeft: 12,
    gap: 5,
  },
  quizQuestion: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: safestepsLessonTheme.colors.line,
    paddingTop: 14,
  },
  scoreCard: {
    backgroundColor: "#F4F7FA",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  scoreText: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 20,
    fontWeight: "900",
  },
  actions: { flexDirection: "row", gap: 12 },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontWeight: "800" },
  secondaryButton: {
    flex: 1,
    backgroundColor: safestepsLessonTheme.colors.white,
    borderWidth: 1,
    padding: 15,
    borderRadius: 999,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontWeight: "800",
  },
  disabled: { opacity: 0.4 },
});
