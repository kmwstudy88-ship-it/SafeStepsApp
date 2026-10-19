import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CourseProgress,
  createInitialProgress,
  getCourseCompletionPercentage,
  isLessonUnlocked,
  loadCourseProgress,
  saveCourseProgress,
  scoreFinalAssessment,
  scoreQuestion,
  scoreQuestionSet,
} from './courseProgress';
import { syncCourseProgress } from './courseProgressSync';
import {
  CourseQuestion,
  UNDERSTANDING_HARM_COURSE as course,
} from './understandingHarmCourse';

type CourseView = 'overview' | 'lesson' | 'assessment' | 'certificate';

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.bulletList}>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <Text style={styles.bulletMark}>•</Text>
          <Text style={styles.bodyText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function QuestionBlock({
  question,
  value,
  onChange,
  showFeedback = true,
}: {
  question: CourseQuestion;
  value?: string;
  onChange: (choiceId: string) => void;
  showFeedback?: boolean;
}) {
  const [showHint, setShowHint] = useState(false);
  const selected = question.choices.find((choice) => choice.id === value);

  return (
    <View style={styles.questionBlock}>
      <Text style={styles.questionText}>{question.prompt}</Text>
      <View style={styles.choiceList}>
        {question.choices.map((choice) => {
          const isSelected = value === choice.id;
          return (
            <Pressable
              key={choice.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={choice.text}
              onPress={() => onChange(choice.id)}
              style={({ pressed }) => [
                styles.choice,
                isSelected && styles.choiceSelected,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.radio,
                  isSelected && styles.radioSelected,
                ]}
              >
                {isSelected ? <View style={styles.radioDot} /> : null}
              </View>
              <Text
                style={[
                  styles.choiceLabel,
                  isSelected && styles.choiceLabelSelected,
                ]}
              >
                {choice.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {question.hint && !value ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowHint((current) => !current)}
          style={styles.textButton}
        >
          <Text style={styles.textButtonLabel}>
            {showHint ? 'Hide hint' : 'Show hint'}
          </Text>
        </Pressable>
      ) : null}
      {showHint && !value ? (
        <Text style={styles.hintText}>{question.hint}</Text>
      ) : null}
      {showFeedback && selected?.feedback ? (
        <View
          style={[
            styles.feedbackPanel,
            selected.score === 100
              ? styles.feedbackPositive
              : styles.feedbackReview,
          ]}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.feedbackText}>{selected.feedback}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function UnderstandingHarmCourseScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [view, setView] = useState<CourseView>('overview');
  const [progress, setProgress] = useState<CourseProgress>(() =>
    createInitialProgress(course.courseId),
  );
  const [lessonIndex, setLessonIndex] = useState(0);
  const [scenarioAnswer, setScenarioAnswer] = useState<string>();
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [activityComplete, setActivityComplete] = useState(false);
  const [assessmentAnswers, setAssessmentAnswers] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    let active = true;

    loadCourseProgress(course.courseId)
      .then((saved) => {
        if (!active) return;
        setProgress(saved);
        if (saved.completedAt) setView('certificate');
      })
      .catch((error) => {
        if (!active) return;
        setErrorMessage(
          error instanceof Error
            ? `Progress could not be loaded: ${error.message}`
            : 'Progress could not be loaded.',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const completionPercentage = useMemo(
    () => getCourseCompletionPercentage(course, progress),
    [progress],
  );
  const allLessonsComplete =
    progress.completedLessonIds.length === course.sections.length;
  const latestAssessment =
    progress.assessmentAttempts[progress.assessmentAttempts.length - 1];
  const lesson = course.sections[lessonIndex];
  const contentWidth = Math.min(width - 32, 760);

  const persistAndSync = async (
    nextProgress: CourseProgress,
    successMessage: string,
  ) => {
    setSaving(true);
    setErrorMessage(undefined);
    try {
      await saveCourseProgress(nextProgress);
      setProgress(nextProgress);
      const syncResult = await syncCourseProgress(nextProgress);
      setStatusMessage(`${successMessage} ${syncResult.message}`);
      if (syncResult.status === 'error') {
        setErrorMessage(syncResult.message);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `Progress could not be saved: ${error.message}`
          : 'Progress could not be saved.',
      );
    } finally {
      setSaving(false);
    }
  };

  const openLesson = (index: number) => {
    if (!isLessonUnlocked(course, progress, index)) return;
    setLessonIndex(index);
    setScenarioAnswer(undefined);
    setQuizAnswers({});
    setActivityComplete(false);
    setStatusMessage(undefined);
    setErrorMessage(undefined);
    setView('lesson');
  };

  const completeLesson = async () => {
    if (!scenarioAnswer || !activityComplete) return;
    if (lesson.quiz.some((question) => !quizAnswers[question.id])) return;

    const completedLessonIds = progress.completedLessonIds.includes(lesson.id)
      ? progress.completedLessonIds
      : [...progress.completedLessonIds, lesson.id];
    const now = new Date().toISOString();
    const nextProgress: CourseProgress = {
      ...progress,
      completedLessonIds,
      lessonResults: {
        ...progress.lessonResults,
        [lesson.id]: {
          scenarioScore: scoreQuestion(lesson.scenario, scenarioAnswer),
          quizScore: scoreQuestionSet(lesson.quiz, quizAnswers),
          completedAt: now,
        },
      },
      updatedAt: now,
    };

    await persistAndSync(nextProgress, `${lesson.title} completed.`);
    const nextIndex = lessonIndex + 1;
    if (nextIndex < course.sections.length) {
      setLessonIndex(nextIndex);
      setScenarioAnswer(undefined);
      setQuizAnswers({});
      setActivityComplete(false);
    } else {
      setView('overview');
    }
  };

  const submitAssessment = async () => {
    if (
      course.finalAssessment.questions.some(
        (question) => !assessmentAnswers[question.id],
      )
    ) {
      return;
    }

    const attemptNumber = progress.assessmentAttempts.length + 1;
    const result = scoreFinalAssessment(
      course,
      assessmentAnswers,
      attemptNumber,
    );
    const now = new Date().toISOString();
    const nextProgress: CourseProgress = {
      ...progress,
      assessmentAttempts: [...progress.assessmentAttempts, result],
      completedAt: result.passed ? now : null,
      updatedAt: now,
    };

    await persistAndSync(
      nextProgress,
      result.passed
        ? 'Foundation assessment passed.'
        : 'Assessment saved. Review the suggested lessons before trying again.',
    );
    if (result.passed) {
      setView('certificate');
    }
  };

  const setSharingConsent = async (enabled: boolean) => {
    const nextProgress = {
      ...progress,
      shareWithPractitioner: enabled,
      updatedAt: new Date().toISOString(),
    };
    await persistAndSync(
      nextProgress,
      enabled
        ? 'Practitioner sharing consent recorded.'
        : 'Practitioner sharing consent withdrawn.',
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loading}>
          <ActivityIndicator color="#208AEF" size="large" />
          <Text style={styles.bodyText}>Loading your course progress…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderStatus = () => (
    <>
      {errorMessage ? (
        <View style={styles.errorPanel} accessibilityLiveRegion="assertive">
          <Text style={styles.errorTitle}>Progress needs attention</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
      {statusMessage ? (
        <View style={styles.statusPanel} accessibilityLiveRegion="polite">
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      ) : null}
    </>
  );

  const renderOverview = () => (
    <>
      <View style={styles.intro}>
        <View style={styles.draftBanner}>
          <Text style={styles.draftTitle}>{course.reviewStatus.label}</Text>
          <Text style={styles.draftText}>
            {course.reviewStatus.learnerNotice}
          </Text>
        </View>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.lead}>{course.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{course.level}</Text>
          <Text style={styles.metaDivider}>•</Text>
          <Text style={styles.metaText}>6 lessons</Text>
          <Text style={styles.metaDivider}>•</Text>
          <Text style={styles.metaText}>About 4½ hours</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeadingRow}>
          <Text style={styles.sectionTitle}>Your progress</Text>
          <Text style={styles.progressValue}>{completionPercentage}%</Text>
        </View>
        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: completionPercentage,
          }}
        >
          <View
            style={[
              styles.progressFill,
              { width: `${completionPercentage}%` },
            ]}
          />
        </View>
        <Text style={styles.supportingText}>
          {progress.completedLessonIds.length} of {course.sections.length}{' '}
          lessons complete
        </Text>
      </View>

      <View style={styles.privacySection}>
        <View style={styles.privacyCopy}>
          <Text style={styles.sectionTitle}>Share structured progress</Text>
          <Text style={styles.supportingText}>
            With your consent, your assigned practitioner can see lesson
            completion and unverified self-guided assessment results. Reflection
            text and personal notes stay private.
          </Text>
        </View>
        <Switch
          accessibilityLabel="Share course progress with assigned practitioner"
          value={progress.shareWithPractitioner}
          onValueChange={setSharingConsent}
          disabled={saving}
          trackColor={{ false: '#CBD5E0', true: '#9EE6DC' }}
          thumbColor={
            progress.shareWithPractitioner ? '#19766C' : '#FFFFFF'
          }
        />
      </View>

      {renderStatus()}

      <View style={styles.outcomesSection}>
        <Text style={styles.sectionTitle}>What you will practise</Text>
        <BulletList items={course.learningOutcomes} />
      </View>

      <View style={styles.lessonSection}>
        <Text style={styles.sectionTitle}>Course lessons</Text>
        <View style={styles.lessonList}>
          {course.sections.map((item, index) => {
            const complete = progress.completedLessonIds.includes(item.id);
            const unlocked = isLessonUnlocked(course, progress, index);
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ disabled: !unlocked }}
                accessibilityLabel={`${item.title}. ${
                  complete
                    ? 'Complete'
                    : unlocked
                      ? 'Available'
                      : 'Locked until the previous lesson is complete'
                }`}
                disabled={!unlocked}
                onPress={() => openLesson(index)}
                style={({ pressed }) => [
                  styles.lessonRow,
                  !unlocked && styles.lessonRowLocked,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.lessonMarker,
                    complete && styles.lessonMarkerComplete,
                  ]}
                >
                  <Text
                    style={[
                      styles.lessonMarkerText,
                      complete && styles.lessonMarkerTextComplete,
                    ]}
                  >
                    {complete ? '✓' : index + 1}
                  </Text>
                </View>
                <View style={styles.lessonCopy}>
                  <Text style={styles.lessonTitle}>{item.title}</Text>
                  <Text style={styles.supportingText}>
                    {item.durationMinutes} minutes ·{' '}
                    {complete ? 'Complete' : unlocked ? 'Ready' : 'Locked'}
                  </Text>
                </View>
                <Text style={styles.chevron}>{unlocked ? '›' : '—'}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.assessmentSection}>
        <Text style={styles.sectionTitle}>Foundation assessment</Text>
        <Text style={styles.bodyText}>
          Complete all six lessons, then score at least{' '}
          {course.finalAssessment.passMark}% overall and in each competency.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !allLessonsComplete }}
          disabled={!allLessonsComplete}
          onPress={() => {
            if (latestAssessment?.passed) {
              setView('certificate');
            } else {
              setAssessmentAnswers({});
              setView('assessment');
            }
          }}
          style={({ pressed }) => [
            styles.primaryButton,
            !allLessonsComplete && styles.buttonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonLabel}>
            {allLessonsComplete
              ? latestAssessment?.passed
                ? 'View completion certificate'
                : 'Start foundation assessment'
              : 'Complete every lesson to unlock'}
          </Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/sos')}
        style={styles.supportLink}
      >
        <Text style={styles.supportLinkTitle}>Need support right now?</Text>
        <Text style={styles.supportLinkText}>
          Open calming and urgent-support guidance
        </Text>
      </Pressable>
    </>
  );

  const renderLesson = () => {
    const quizComplete = lesson.quiz.every(
      (question) => quizAnswers[question.id],
    );
    const canComplete = Boolean(
      scenarioAnswer && quizComplete && activityComplete,
    );

    return (
      <>
        <Pressable
          accessibilityRole="button"
          onPress={() => setView('overview')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonLabel}>‹ Course overview</Text>
        </Pressable>

        <View style={styles.lessonHero}>
          <Text style={styles.lessonCount}>
            Lesson {lessonIndex + 1} of {course.sections.length}
          </Text>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.lead}>{lesson.content.title}</Text>
          <Text style={styles.supportingText}>
            About {lesson.durationMinutes} minutes · You may pause or return
            later
          </Text>
        </View>

        <View style={styles.facilitatorPanel}>
          <Text style={styles.facilitatorName}>SafeSteps Learning Coach</Text>
          <Text style={styles.facilitatorText}>
            {lesson.facilitator.openingScript}
          </Text>
        </View>

        <View style={styles.readingSection}>
          <Text style={styles.sectionTitle}>Start here</Text>
          <Text style={styles.bodyText}>{lesson.content.overview}</Text>
          <Text style={styles.bodyText}>{lesson.content.psychoeducation}</Text>
        </View>

        <View style={styles.readingSection}>
          <Text style={styles.sectionTitle}>Learning goals</Text>
          <BulletList items={lesson.content.learning_goals} />
        </View>

        <View style={styles.readingSection}>
          <Text style={styles.sectionTitle}>A safer sequence</Text>
          {lesson.content.step_by_step.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.bodyText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.scriptSection}>
          <Text style={styles.sectionTitle}>Words you can use</Text>
          {lesson.content.parent_scripts.map((script) => (
            <Text key={script} style={styles.scriptText}>
              “{script}”
            </Text>
          ))}
        </View>

        <View style={styles.readingSection}>
          <Text style={styles.sectionTitle}>Practise with a scenario</Text>
          <QuestionBlock
            question={lesson.scenario}
            value={scenarioAnswer}
            onChange={setScenarioAnswer}
          />
        </View>

        <View style={styles.readingSection}>
          <Text style={styles.sectionTitle}>Knowledge check</Text>
          {lesson.quiz.map((question) => (
            <QuestionBlock
              key={question.id}
              question={question}
              value={quizAnswers[question.id]}
              onChange={(choiceId) =>
                setQuizAnswers((current) => ({
                  ...current,
                  [question.id]: choiceId,
                }))
              }
            />
          ))}
        </View>

        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>{lesson.activities[0].title}</Text>
          <Text style={styles.bodyText}>
            {lesson.activities[0].instructions}
          </Text>
          <Text style={styles.promptText}>
            {lesson.activities[0].completionPrompt}
          </Text>
          <Text style={styles.privateNote}>
            Your reflection stays on this device and is not shared with your
            practitioner.
          </Text>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: activityComplete }}
            onPress={() => setActivityComplete((current) => !current)}
            style={({ pressed }) => [
              styles.checkRow,
              activityComplete && styles.checkRowSelected,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.checkbox,
                activityComplete && styles.checkboxSelected,
              ]}
            >
              {activityComplete ? (
                <Text style={styles.checkboxTick}>✓</Text>
              ) : null}
            </View>
            <Text style={styles.checkLabel}>
              I completed this activity privately
            </Text>
          </Pressable>
        </View>

        <View style={styles.homePracticeSection}>
          <Text style={styles.sectionTitle}>Home practice</Text>
          <Text style={styles.bodyText}>{lesson.homePractice}</Text>
        </View>

        <View style={styles.safetyPanel}>
          <Text style={styles.safetyTitle}>Pause learning and get help if</Text>
          <BulletList items={lesson.safety_guidance.red_flags} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/sos')}
            style={styles.safetyButton}
          >
            <Text style={styles.safetyButtonLabel}>Open support guidance</Text>
          </Pressable>
        </View>

        {renderStatus()}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canComplete || saving }}
          disabled={!canComplete || saving}
          onPress={completeLesson}
          style={({ pressed }) => [
            styles.primaryButton,
            (!canComplete || saving) && styles.buttonDisabled,
            pressed && styles.pressed,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonLabel}>
              {lessonIndex === course.sections.length - 1
                ? 'Complete lesson and return'
                : 'Complete lesson and continue'}
            </Text>
          )}
        </Pressable>
      </>
    );
  };

  const renderAssessment = () => {
    const attemptsUsed = progress.assessmentAttempts.length;
    const attemptsRemaining =
      course.finalAssessment.attemptsAllowed - attemptsUsed;
    const allAnswered = course.finalAssessment.questions.every(
      (question) => assessmentAnswers[question.id],
    );
    const attemptsExhausted =
      attemptsRemaining <= 0 && !latestAssessment?.passed;

    return (
      <>
        <Pressable
          accessibilityRole="button"
          onPress={() => setView('overview')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonLabel}>‹ Course overview</Text>
        </Pressable>

        <View style={styles.lessonHero}>
          <Text style={styles.title}>{course.finalAssessment.title}</Text>
          <Text style={styles.lead}>
            Choose the safest response. You need {course.finalAssessment.passMark}
            % overall and in each competency.
          </Text>
          <Text style={styles.supportingText}>
            {attemptsRemaining} of {course.finalAssessment.attemptsAllowed}{' '}
            attempts remaining
          </Text>
        </View>

        {latestAssessment && !latestAssessment.passed ? (
          <View style={styles.remediationPanel}>
            <Text style={styles.remediationTitle}>
              Latest score: {latestAssessment.score}%
            </Text>
            <Text style={styles.bodyText}>
              Review the lessons linked to your lower competency scores. A score
              is a learning guide, not a judgement about you or your family.
            </Text>
            {course.competencies.map((competency) => (
              <Text key={competency.id} style={styles.competencyText}>
                {competency.name}:{' '}
                {latestAssessment.competencyScores[competency.id] ?? 0}%
              </Text>
            ))}
          </View>
        ) : null}

        {attemptsExhausted ? (
          <View style={styles.errorPanel}>
            <Text style={styles.errorTitle}>Supported review recommended</Text>
            <Text style={styles.errorText}>
              Three attempts have been used. Your progress is saved. Review the
              missed concepts with a practitioner before another assessment is
              enabled.
            </Text>
          </View>
        ) : (
          <View style={styles.assessmentQuestions}>
            {course.finalAssessment.questions.map((question, index) => (
              <View key={question.id} style={styles.assessmentQuestion}>
                <Text style={styles.questionNumber}>
                  Question {index + 1} of{' '}
                  {course.finalAssessment.questions.length}
                </Text>
                <QuestionBlock
                  question={question}
                  value={assessmentAnswers[question.id]}
                  showFeedback={false}
                  onChange={(choiceId) =>
                    setAssessmentAnswers((current) => ({
                      ...current,
                      [question.id]: choiceId,
                    }))
                  }
                />
              </View>
            ))}
          </View>
        )}

        {renderStatus()}

        {!attemptsExhausted ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !allAnswered || saving }}
            disabled={!allAnswered || saving}
            onPress={submitAssessment}
            style={({ pressed }) => [
              styles.primaryButton,
              (!allAnswered || saving) && styles.buttonDisabled,
              pressed && styles.pressed,
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonLabel}>
                Submit assessment
              </Text>
            )}
          </Pressable>
        ) : null}
      </>
    );
  };

  const renderCertificate = () => (
    <>
      <View style={styles.certificate}>
        <Text style={styles.certificateBrand}>SafeSteps</Text>
        <Text style={styles.certificateTitle}>{course.certificate.title}</Text>
        <Text style={styles.certificateText}>
          Course completed
          {progress.completedAt
            ? ` on ${new Date(progress.completedAt).toLocaleDateString()}`
            : ''}
        </Text>
        <View style={styles.certificateRule} />
        <Text style={styles.certificateScore}>
          Foundation assessment: {latestAssessment?.score ?? 0}%
        </Text>
        <Text style={styles.certificateDisclaimer}>
          {course.certificate.disclaimer}
        </Text>
      </View>

      {renderStatus()}

      <View style={styles.privacySection}>
        <View style={styles.privacyCopy}>
          <Text style={styles.sectionTitle}>Practitioner sharing</Text>
          <Text style={styles.supportingText}>
            You can change consent at any time. Only structured progress and
            unverified self-guided assessment results are shared.
          </Text>
        </View>
        <Switch
          accessibilityLabel="Share course progress with assigned practitioner"
          value={progress.shareWithPractitioner}
          onValueChange={setSharingConsent}
          disabled={saving}
          trackColor={{ false: '#CBD5E0', true: '#9EE6DC' }}
          thumbColor={
            progress.shareWithPractitioner ? '#19766C' : '#FFFFFF'
          }
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setView('overview')}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonLabel}>Review course</Text>
      </Pressable>
    </>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { width: contentWidth },
        ]}
      >
        {view === 'overview' ? renderOverview() : null}
        {view === 'lesson' ? renderLesson() : null}
        {view === 'assessment' ? renderAssessment() : null}
        {view === 'certificate' ? renderCertificate() : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollContent: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 24,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  intro: { gap: 10 },
  title: {
    color: '#102033',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  lead: {
    color: '#425466',
    fontSize: 17,
    lineHeight: 25,
  },
  bodyText: {
    flex: 1,
    color: '#334155',
    fontSize: 16,
    lineHeight: 24,
  },
  supportingText: {
    color: '#5F6F80',
    fontSize: 14,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    color: '#425466',
    fontSize: 14,
    fontWeight: '600',
  },
  metaDivider: {
    color: '#94A3B8',
    fontSize: 14,
  },
  draftBanner: {
    backgroundColor: '#FFF7D6',
    borderColor: '#D99C14',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  draftTitle: {
    color: '#674C00',
    fontSize: 14,
    fontWeight: '800',
  },
  draftText: {
    color: '#674C00',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: '#172A3A',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  progressSection: { gap: 10 },
  progressHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressValue: {
    color: '#19766C',
    fontSize: 20,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: '#DDE6EE',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#268F83',
  },
  privacySection: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    borderColor: '#B7D9D5',
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: '#EFFAF8',
    padding: 16,
  },
  privacyCopy: { flex: 1, gap: 5 },
  outcomesSection: { gap: 12 },
  lessonSection: { gap: 12 },
  lessonList: {
    borderTopColor: '#D7E0E8',
    borderTopWidth: 1,
  },
  lessonRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomColor: '#D7E0E8',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  lessonRowLocked: { opacity: 0.52 },
  lessonMarker: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#A9B7C5',
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  lessonMarkerComplete: {
    borderColor: '#19766C',
    backgroundColor: '#19766C',
  },
  lessonMarkerText: {
    color: '#425466',
    fontSize: 15,
    fontWeight: '800',
  },
  lessonMarkerTextComplete: { color: '#FFFFFF' },
  lessonCopy: { flex: 1, gap: 3 },
  lessonTitle: {
    color: '#172A3A',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  chevron: {
    color: '#7B8B9B',
    fontSize: 28,
  },
  assessmentSection: {
    gap: 12,
    borderTopColor: '#D7E0E8',
    borderTopWidth: 1,
    paddingTop: 24,
  },
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#1476D4',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  secondaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#94A3B8',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
  },
  secondaryButtonLabel: {
    color: '#274158',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonDisabled: { opacity: 0.48 },
  supportLink: {
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: '#243B53',
    padding: 16,
  },
  supportLinkTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  supportLinkText: {
    color: '#D9E2EC',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },
  bulletList: { gap: 8 },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletMark: {
    color: '#268F83',
    fontSize: 20,
    lineHeight: 24,
  },
  backButton: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  backButtonLabel: {
    color: '#1469B8',
    fontSize: 16,
    fontWeight: '700',
  },
  lessonHero: { gap: 8 },
  lessonCount: {
    color: '#19766C',
    fontSize: 14,
    fontWeight: '800',
  },
  facilitatorPanel: {
    borderRadius: 14,
    backgroundColor: '#173D5B',
    padding: 18,
    gap: 7,
  },
  facilitatorName: {
    color: '#9EE6DC',
    fontSize: 14,
    fontWeight: '800',
  },
  facilitatorText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
  readingSection: { gap: 12 },
  scriptSection: {
    gap: 12,
    borderRadius: 14,
    backgroundColor: '#EAF4FD',
    padding: 18,
  },
  scriptText: {
    color: '#243B53',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 25,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 30,
    height: 30,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 30,
    textAlign: 'center',
    borderRadius: 15,
    backgroundColor: '#268F83',
  },
  questionBlock: { gap: 12 },
  questionText: {
    color: '#172A3A',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  choiceList: { gap: 10 },
  choice: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderColor: '#B7C4D0',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 13,
  },
  choiceSelected: {
    borderColor: '#1476D4',
    borderWidth: 2,
    backgroundColor: '#EAF4FD',
    padding: 12,
  },
  radio: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#7B8B9B',
    borderWidth: 2,
    borderRadius: 11,
  },
  radioSelected: { borderColor: '#1476D4' },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1476D4',
  },
  choiceLabel: {
    flex: 1,
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
  },
  choiceLabelSelected: {
    color: '#15496F',
    fontWeight: '700',
  },
  textButton: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  textButtonLabel: {
    color: '#1469B8',
    fontSize: 15,
    fontWeight: '700',
  },
  hintText: {
    color: '#425466',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 21,
  },
  feedbackPanel: {
    borderRadius: 10,
    padding: 13,
  },
  feedbackPositive: { backgroundColor: '#E7F7F1' },
  feedbackReview: { backgroundColor: '#FFF4DE' },
  feedbackText: {
    color: '#243B53',
    fontSize: 14,
    lineHeight: 21,
  },
  activitySection: {
    gap: 12,
    borderColor: '#C7D3DF',
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },
  promptText: {
    color: '#243B53',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  privateNote: {
    color: '#5F6F80',
    fontSize: 13,
    lineHeight: 19,
  },
  checkRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 10,
    backgroundColor: '#EFF3F7',
    padding: 12,
  },
  checkRowSelected: { backgroundColor: '#E7F7F1' },
  checkbox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#7B8B9B',
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    borderColor: '#19766C',
    backgroundColor: '#19766C',
  },
  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  checkLabel: {
    flex: 1,
    color: '#274158',
    fontSize: 15,
    fontWeight: '700',
  },
  homePracticeSection: {
    gap: 8,
    borderRadius: 14,
    backgroundColor: '#EDF8F6',
    padding: 18,
  },
  safetyPanel: {
    gap: 12,
    borderColor: '#E9A8A8',
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: '#FFF5F5',
    padding: 18,
  },
  safetyTitle: {
    color: '#842828',
    fontSize: 18,
    fontWeight: '800',
  },
  safetyButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#8D2E2E',
    padding: 12,
  },
  safetyButtonLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  statusPanel: {
    borderRadius: 10,
    backgroundColor: '#E7F7F1',
    padding: 13,
  },
  statusText: {
    color: '#185B53',
    fontSize: 14,
    lineHeight: 20,
  },
  errorPanel: {
    borderColor: '#E9A8A8',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#FFF5F5',
    padding: 14,
    gap: 5,
  },
  errorTitle: {
    color: '#842828',
    fontSize: 15,
    fontWeight: '800',
  },
  errorText: {
    color: '#842828',
    fontSize: 14,
    lineHeight: 20,
  },
  assessmentQuestions: { gap: 28 },
  assessmentQuestion: {
    gap: 10,
    borderBottomColor: '#D7E0E8',
    borderBottomWidth: 1,
    paddingBottom: 28,
  },
  questionNumber: {
    color: '#19766C',
    fontSize: 13,
    fontWeight: '800',
  },
  remediationPanel: {
    gap: 8,
    borderRadius: 14,
    backgroundColor: '#FFF4DE',
    padding: 18,
  },
  remediationTitle: {
    color: '#674C00',
    fontSize: 18,
    fontWeight: '800',
  },
  competencyText: {
    color: '#674C00',
    fontSize: 14,
    fontWeight: '700',
  },
  certificate: {
    borderColor: '#AAC6D8',
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
    gap: 14,
  },
  certificateBrand: {
    color: '#19766C',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  certificateTitle: {
    color: '#102033',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 35,
    textAlign: 'center',
  },
  certificateText: {
    color: '#425466',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  certificateRule: {
    width: 96,
    height: 2,
    backgroundColor: '#268F83',
    marginVertical: 6,
  },
  certificateScore: {
    color: '#173D5B',
    fontSize: 17,
    fontWeight: '800',
  },
  certificateDisclaimer: {
    color: '#5F6F80',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  pressed: { opacity: 0.78 },
});
