import { useVideoPlayer, VideoView } from "expo-video";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { useAuth } from "../lib/auth";
import {
  buildInteractiveVideoCourseCompletionPayload,
  getInteractiveVideoCourseAssetStatus,
  type InteractiveVideoCourse,
  type InteractiveVideoStep,
} from "../lib/data/interactiveVideoCourse";
import { completeInteractiveVideoLesson } from "../lib/platformData";

function VideoStepPlayer({ step, width }: { step: InteractiveVideoStep; width: number }) {
  const player = useVideoPlayer(step.url, (videoPlayer) => {
    videoPlayer.loop = false;
  });

  return (
    <View style={[styles.videoCard, { height: Math.max(190, (width - 40) * 0.5625) }]}>
      <VideoView
        style={styles.videoPlayer}
        player={player}
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture
        contentFit="contain"
      />
    </View>
  );
}

export function InteractiveVideoCourseScreen({ course }: { course: InteractiveVideoCourse }) {
  const { width } = useWindowDimensions();
  const { initializing, user } = useAuth();
  const userId = user?.id;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedQuizAnswerId, setSelectedQuizAnswerId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  const activeStep = course.steps[currentStepIndex];
  const isLastStep = currentStepIndex === course.steps.length - 1;
  const answer = answers[activeStep.id] ?? "";
  const assetStatus = getInteractiveVideoCourseAssetStatus(course);

  async function handleNext() {
    if (!userId) return;

    if (!activeStep.quiz && !answer.trim()) {
      Alert.alert("Reflection needed", "Please fill in your reflection answer before continuing.");
      return;
    }

    if (activeStep.quiz && selectedQuizAnswerId === null) {
      Alert.alert("Quiz answer needed", "Please select an option to complete the quiz challenge.");
      return;
    }

    if (!isLastStep) {
      setCurrentStepIndex((current) => current + 1);
      return;
    }

    try {
      setSaving(true);
      const payload = buildInteractiveVideoCourseCompletionPayload(course, {
        answers,
        selectedQuizAnswerId,
      });

      await completeInteractiveVideoLesson(userId, course.title, payload);
      Alert.alert("Lesson complete", "Your video lesson reflections and quiz result have been saved.", [
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        "Could not save lesson",
        error instanceof Error ? error.message : "Your progress could not be saved yet.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((current) => current - 1);
      return;
    }

    router.back();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{course.title}</Text>
        <View style={styles.progressBarContainer}>
          {course.steps.map((step, index) => (
            <View
              key={step.id}
              style={[
                styles.progressSegment,
                index <= currentStepIndex ? styles.progressActive : styles.progressInactive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepCounter}>Video {currentStepIndex + 1} of {course.steps.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleBlock}>
          <Text style={styles.videoTitle}>{activeStep.title}</Text>
          <Text style={styles.videoSubtitle}>{activeStep.subtitle}</Text>
          {activeStep.overview ? <Text style={styles.videoOverview}>{activeStep.overview}</Text> : null}
        </View>

        <VideoStepPlayer key={activeStep.id} step={activeStep} width={width} />

        {!assetStatus.isProductionReady ? (
          <View style={styles.assetNotice}>
            <Text style={styles.assetNoticeTitle}>Video preview in use</Text>
            <Text style={styles.assetNoticeText}>
              This lesson uses a temporary preview video while the final SafeSteps video is being prepared. Your
              reflections and quiz answers can still be saved.
            </Text>
            {activeStep.productionVideoUrl ? (
              <Text style={styles.assetNoticePath}>Final SafeSteps video asset is listed for production review.</Text>
            ) : null}
            {activeStep.assetManifest?.captionFile ? (
              <Text style={styles.assetNoticePath}>Captions are listed for final production review.</Text>
            ) : null}
          </View>
        ) : null}

        {activeStep.videoGoal ? (
          <View style={styles.infoCard}>
            <Text style={styles.promptLabel}>Video Focus</Text>
            <Text style={styles.infoText}>{activeStep.videoGoal}</Text>
          </View>
        ) : null}

        <View style={styles.interactionCard}>
          <Text style={styles.promptLabel}>Interactive Reflection Tool</Text>

          {activeStep.quiz ? (
            <View style={styles.quizWrapper}>
              <Text style={styles.quizQuestion}>{activeStep.quiz.question}</Text>
              {activeStep.quiz.options.map((option) => (
                <Pressable
                  key={option.id}
                  style={[
                    styles.quizOption,
                    selectedQuizAnswerId === option.id && styles.quizOptionSelected,
                  ]}
                  onPress={() => setSelectedQuizAnswerId(option.id)}
                >
                  <Text style={styles.quizOptionText}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <TextInput
              style={styles.inputField}
              multiline
              numberOfLines={4}
              placeholder={activeStep.reflectionPrompt}
              placeholderTextColor="#6B7280"
              value={answer}
              onChangeText={(text) => setAnswers((current) => ({ ...current, [activeStep.id]: text }))}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.backButton} onPress={handleBack} disabled={saving}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <Pressable style={styles.nextButton} onPress={handleNext} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.nextButtonText}>{isLastStep ? "Finish Lesson" : "Next Video"}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    color: "#5F6F76",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  progressBarContainer: {
    flexDirection: "row",
    height: 6,
    marginTop: 10,
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    borderRadius: 8,
  },
  progressActive: {
    backgroundColor: "#E8B83F",
  },
  progressInactive: {
    backgroundColor: "#E5E7EB",
  },
  stepCounter: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 28,
  },
  titleBlock: {
    marginBottom: 20,
  },
  videoTitle: {
    color: "#005766",
    fontSize: 24,
    fontWeight: "900",
  },
  videoSubtitle: {
    color: "#5F6F76",
    fontSize: 15,
    marginTop: 2,
    fontWeight: "700",
  },
  videoOverview: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  videoCard: {
    width: "100%",
    backgroundColor: "#000000",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  videoPlayer: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: "#EFF8F4",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#CFE9DF",
    marginBottom: 16,
  },
  assetNotice: {
    backgroundColor: "#FFF7ED",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDBA74",
    marginBottom: 16,
    gap: 6,
  },
  assetNoticeTitle: {
    color: "#9A3412",
    fontSize: 14,
    fontWeight: "900",
  },
  assetNoticeText: {
    color: "#7C2D12",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  assetNoticePath: {
    color: "#7C2D12",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
  },
  infoText: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  interactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  promptLabel: {
    color: "#005766",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 12,
  },
  inputField: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: "#1F2937",
    textAlignVertical: "top",
    minHeight: 108,
  },
  quizWrapper: {
    gap: 10,
  },
  quizQuestion: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  quizOption: {
    backgroundColor: "#F3F4F6",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quizOptionSelected: {
    borderColor: "#E8B83F",
    backgroundColor: "#FEFCE8",
  },
  quizOptionText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  backButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "#4B5563",
    fontSize: 15,
    fontWeight: "800",
  },
  nextButton: {
    flex: 2,
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: "#005766",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});
