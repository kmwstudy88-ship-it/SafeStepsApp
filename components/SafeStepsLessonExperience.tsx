import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { CourseLesson } from "../curriculum/courses";
import type { ApiCurriculumCourseDetail, ApiCurriculumModuleLesson } from "../lib/curriculumApi";
import {
  getSafeStepsLessonWatercolorPalette,
  safestepsLessonTheme,
  type SafeStepsLessonWatercolorPalette,
} from "../lib/safestepsLessonTheme";

type LessonMode = "overview" | "activity" | "quiz" | "reflection";

type LessonItem = ApiCurriculumModuleLesson & {
  moduleTitle: string;
  moduleOrder: number;
  theme?: {
    summary?: string;
    estimatedMinutes?: number;
    goals?: string[];
    parentMeaningPrompt?: string;
  };
};

export type SafeStepsSingleLessonTheme = {
  id: string;
  title: string;
  summary: string;
  estimatedMinutes?: number;
  moduleTitle?: string;
  courseTitle?: string;
  goals?: string[];
  parentMeaningPrompt?: string;
  completionLabel?: string;
  completionMessage?: string;
  onComplete?: () => Promise<void> | void;
};

const FEELINGS = [
  { label: "Happy", face: ":)" },
  { label: "Calm", face: "-.-" },
  { label: "Anxious", face: ":/" },
  { label: "Sad", face: ":(" },
  { label: "Frustrated", face: ">:(" },
  { label: "Confused", face: "?" },
];

const SITUATIONS = [
  "I lost something important.",
  "Someone shared with me.",
  "I felt nervous before speaking.",
  "Someone yelled at me.",
];

const lessonColors = safestepsLessonTheme.colors;
const lessonRadius = safestepsLessonTheme.radius;
const lessonSpacing = safestepsLessonTheme.spacing;
const lessonShadow = safestepsLessonTheme.shadow;

function isCourseLesson(value: unknown): value is CourseLesson {
  if (!value || typeof value !== "object") return false;
  const lesson = value as Partial<CourseLesson>;
  return (
    typeof lesson.lessonNumber === "number" &&
    typeof lesson.title === "string" &&
    typeof lesson.durationMinutes === "number"
  );
}

function lessonSummary(item: LessonItem, richLesson: CourseLesson | null) {
  return (
    item.theme?.summary ??
    richLesson?.summary ??
    item.lesson.content ??
    item.lesson.body ??
    "Work through this lesson, notice what it means for your family, and choose one safe step to practise."
  );
}

function learningGoals(richLesson: CourseLesson | null, overrideGoals?: string[]) {
  if (overrideGoals?.length) return overrideGoals.slice(0, 3);

  const stepGoals = richLesson?.content?.steps?.slice(0, 3).map((step) => step.title);
  if (stepGoals?.length) return stepGoals;

  return ["Understand the key idea", "Connect it to family life", "Choose one safe step"];
}

function ProgressPill({ progress, palette }: { progress: number; palette: SafeStepsLessonWatercolorPalette }) {
  return (
    <View style={styles.progressPill}>
      <Text style={styles.progressText}>{progress}% Complete</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(progress, 8)}%`, backgroundColor: palette.accent }]} />
      </View>
    </View>
  );
}

function Header({
  courseTitle,
  item,
  mode,
  progress,
  palette,
}: {
  courseTitle: string;
  item: LessonItem;
  mode: LessonMode;
  progress: number;
  palette: SafeStepsLessonWatercolorPalette;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.backCircle}>
        <Text style={styles.backText}>{"<"}</Text>
      </View>
      <Image source={require("../assets/safesteps-logo.png")} resizeMode="contain" style={styles.logo} />
      <View style={styles.breadcrumbRow}>
        <Text style={styles.breadcrumbHome}>Home</Text>
        <Text style={styles.breadcrumb}>Lessons</Text>
        <Text style={styles.breadcrumb}>{item.moduleTitle}</Text>
        <Text style={styles.breadcrumbActive}>{item.lesson.title}</Text>
        {mode !== "overview" ? <Text style={styles.breadcrumbActive}>{mode}</Text> : null}
      </View>
      <ProgressPill progress={progress} palette={palette} />
      <Text style={styles.courseLabel}>{courseTitle}</Text>
    </View>
  );
}

function SectionButton({
  icon,
  title,
  body,
  duration,
  onPress,
  palette,
}: {
  icon: string;
  title: string;
  body: string;
  duration: string;
  onPress: () => void;
  palette: SafeStepsLessonWatercolorPalette;
}) {
  return (
    <Pressable onPress={onPress} style={styles.sectionCard}>
      <View style={[styles.iconBubble, { backgroundColor: palette.washStrong }]}>
        <Text style={[styles.iconText, { color: palette.accentDark }]}>{icon}</Text>
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
      <View style={styles.sectionFooter}>
        <Text style={styles.durationText}>{duration}</Text>
        <Text style={styles.chevron}>{">"}</Text>
      </View>
    </Pressable>
  );
}

function OverviewScreen({
  item,
  richLesson,
  onModeChange,
  palette,
}: {
  item: LessonItem;
  richLesson: CourseLesson | null;
  onModeChange: (mode: LessonMode) => void;
  palette: SafeStepsLessonWatercolorPalette;
}) {
  const goals = learningGoals(richLesson, item.theme?.goals);
  const durationMinutes = item.theme?.estimatedMinutes ?? richLesson?.durationMinutes;
  const duration = durationMinutes ? `${durationMinutes} min` : "15-20 min";

  return (
    <>
      <View style={styles.heroCard}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{item.lesson.title}</Text>
          <View style={[styles.goldRule, { backgroundColor: palette.highlight }]} />
          <Text style={styles.heroBody}>{lessonSummary(item, richLesson)}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <View style={styles.smallIconBubble}>
                <Text style={[styles.smallIcon, { color: palette.accentDark }]}>T</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>Estimated Duration</Text>
                <Text style={styles.statValue}>{duration}</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <View style={styles.smallIconBubble}>
                <Text style={[styles.smallIcon, { color: palette.accentDark }]}>P</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>Your Progress</Text>
                <Text style={styles.statValue}>30%</Text>
              </View>
            </View>
          </View>
          <View style={styles.longProgressTrack}>
          <View style={[styles.longProgressFill, { backgroundColor: palette.accent }]} />
        </View>
      </View>
        <View style={[styles.heroArt, { backgroundColor: palette.wash }]}>
          <Text style={[styles.heroArtFace, { color: palette.accentDark }]}>:)</Text>
          <Text style={[styles.heroArtFaceMuted, { color: palette.accent }]}>:|</Text>
          <Text style={[styles.heroArtHead, { color: palette.accentDark }]}>SAFE</Text>
        </View>
      </View>

      <View style={styles.goalCard}>
        <Text style={styles.cardHeading}>Learning Goals</Text>
        <View style={styles.goalRow}>
          {goals.map((goal) => (
            <View key={goal} style={styles.goalItem}>
              <View style={styles.goalCircle} />
              <Text style={styles.goalText}>{goal}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.includedHeading}>Included in This Lesson</Text>
      <View style={styles.sectionGrid}>
        <SectionButton
          icon="P"
          title="Activities"
          body="Explore the idea with a simple guided practice."
          duration="8-10 min"
          onPress={() => onModeChange("activity")}
          palette={palette}
        />
        <SectionButton
          icon="Q"
          title="Quiz"
          body="Check your understanding with a short quiz."
          duration="3-5 min"
          onPress={() => onModeChange("quiz")}
          palette={palette}
        />
        <SectionButton
          icon="H"
          title="Reflection"
          body="Connect what you learned to your life."
          duration="4-5 min"
          onPress={() => onModeChange("reflection")}
          palette={palette}
        />
      </View>

      <Pressable onPress={() => onModeChange("activity")} style={[styles.primaryCta, { backgroundColor: palette.accentDark }]}>
        <Text style={[styles.spark, { color: palette.highlight }]}>*</Text>
        <Text style={styles.primaryCtaText}>Start Lesson</Text>
        <View style={styles.ctaArrow}>
          <Text style={styles.ctaArrowText}>{">"}</Text>
        </View>
      </Pressable>
    </>
  );
}

function ActivityScreen({
  onModeChange,
  palette,
}: {
  onModeChange: (mode: LessonMode) => void;
  palette: SafeStepsLessonWatercolorPalette;
}) {
  return (
    <View style={styles.panelCard}>
      <Text style={styles.eyebrow}>Activity</Text>
      <Text style={styles.screenTitle}>Match the Feeling</Text>
      <Text style={styles.screenIntro}>Look at each situation and match it with the feeling that best fits.</Text>
      <Text style={styles.centerLabel}>Feelings</Text>
      <View style={styles.tileGrid}>
        {FEELINGS.slice(0, 4).map((feeling) => (
          <View key={feeling.label} style={styles.feelingCard}>
            <Text style={[styles.feelingFace, { color: palette.accentDark }]}>{feeling.face}</Text>
            <Text style={styles.feelingLabel}>{feeling.label}</Text>
            <View style={styles.matchDot} />
          </View>
        ))}
      </View>
      <Text style={styles.centerLabel}>Situations</Text>
      <View style={styles.tileGrid}>
        {SITUATIONS.map((situation) => (
          <View key={situation} style={styles.situationCard}>
            <View style={styles.matchDotTop} />
            <Text style={styles.situationArt}>SAFE</Text>
            <Text style={styles.situationText}>{situation}</Text>
          </View>
        ))}
      </View>
      <View style={styles.tipCard}>
        <Text style={styles.tipText}>Tip: There are no wrong feelings. Every feeling is okay. What matters is how we respond.</Text>
      </View>
      <Pressable onPress={() => onModeChange("quiz")} style={[styles.primaryCta, { backgroundColor: palette.accentDark }]}>
        <Text style={styles.primaryCtaText}>Check Answers</Text>
        <View style={styles.ctaArrow}>
          <Text style={styles.ctaArrowText}>{">"}</Text>
        </View>
      </Pressable>
    </View>
  );
}

function QuizScreen({
  item,
  onModeChange,
  palette,
}: {
  item: LessonItem;
  onModeChange: (mode: LessonMode) => void;
  palette: SafeStepsLessonWatercolorPalette;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const options = [
    "Only what other people are thinking.",
    "What is happening inside us and around us.",
    "How to solve every problem right away.",
    "That we should ignore difficult feelings.",
  ];

  return (
    <View style={styles.panelCard}>
      <Text style={styles.eyebrow}>{item.lesson.title}</Text>
      <Text style={styles.screenTitle}>Quiz</Text>
      <Text style={styles.questionCount}>Question 2 of 5</Text>
      <View style={styles.quizProgressTrack}>
        <View style={[styles.quizProgressFill, { backgroundColor: palette.accent }]} />
      </View>
      <Text style={styles.questionText}>What can this lesson help us understand?</Text>
      {options.map((option) => (
        <Pressable key={option} onPress={() => setSelected(option)} style={styles.answerOption}>
          <View
            style={[
              selected === option ? styles.radioSelected : styles.radio,
              { borderColor: palette.accentDark },
            ]}
          />
          <Text style={styles.answerText}>{option}</Text>
        </Pressable>
      ))}
      <View style={styles.tipCard}>
        <Text style={styles.tipText}>Tip: Small clues can help us make thoughtful choices.</Text>
      </View>
      <View style={styles.actionRow}>
        <Pressable onPress={() => onModeChange("activity")} style={styles.secondaryCta}>
          <Text style={styles.secondaryCtaText}>Previous Question</Text>
        </Pressable>
        <Pressable onPress={() => onModeChange("reflection")} style={[styles.primaryCtaSmall, { backgroundColor: palette.accentDark }]}>
          <Text style={styles.primaryCtaText}>Next Question</Text>
          <View style={styles.ctaArrow}>
            <Text style={styles.ctaArrowText}>{">"}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function ReflectionScreen({
  richLesson,
  goalsOverride,
  promptOverride,
  onModeChange,
  palette,
}: {
  richLesson: CourseLesson | null;
  goalsOverride?: string[];
  promptOverride?: string;
  onModeChange: (mode: LessonMode) => void;
  palette: SafeStepsLessonWatercolorPalette;
}) {
  const [reflection, setReflection] = useState("");
  const [selectedFeeling, setSelectedFeeling] = useState("Happy");
  const goals = learningGoals(richLesson, goalsOverride);
  const prompt =
    promptOverride ??
    richLesson?.content?.parentMeaningPrompt ??
    "What stood out to you today, and what safe response could help your family?";

  return (
    <>
      <Text style={styles.wrapTitle}>Reflection & Wrap-Up</Text>
      <View style={styles.panelCard}>
        <Text style={styles.reflectionQuestion}>{prompt}</Text>
        <Text style={styles.screenIntro}>Take a moment to reflect and write your thoughts below.</Text>
        <TextInput
          value={reflection}
          onChangeText={setReflection}
          placeholder="Start typing here..."
          placeholderTextColor="#7A808A"
          multiline
          style={styles.reflectionInput}
        />
        <Text style={styles.screenIntro}>Or tap a feeling that fits:</Text>
        <View style={styles.feelingRow}>
          {FEELINGS.map((feeling) => (
            <Pressable key={feeling.label} onPress={() => setSelectedFeeling(feeling.label)} style={styles.feelingChip}>
              <Text
                style={[
                  selectedFeeling === feeling.label ? styles.feelingChipFaceSelected : styles.feelingChipFace,
                  {
                    backgroundColor: selectedFeeling === feeling.label ? palette.highlight : palette.washStrong,
                    color: palette.accentDark,
                  },
                ]}
              >
                {feeling.face}
              </Text>
              <Text style={styles.feelingChipLabel}>{feeling.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.encouragementCard}>
        <Text style={styles.tipText}>Great job taking time to reflect. Every step you take helps you grow.</Text>
      </View>
      <View style={styles.goalCard}>
        <Text style={styles.cardHeading}>What I Learned</Text>
        <Text style={styles.screenIntro}>Check the ideas you feel more confident about now.</Text>
        {goals.map((goal) => (
          <View key={goal} style={styles.checkRow}>
            <View style={styles.goalCircle} />
            <Text style={styles.goalText}>I can {goal.toLowerCase()}.</Text>
          </View>
        ))}
      </View>
      <Pressable onPress={() => onModeChange("overview")} style={[styles.primaryCta, { backgroundColor: palette.accentDark }]}>
        <Text style={[styles.spark, { color: palette.highlight }]}>*</Text>
        <Text style={styles.primaryCtaText}>Complete Lesson</Text>
        <View style={styles.ctaArrow}>
          <Text style={styles.ctaArrowText}>{">"}</Text>
        </View>
      </Pressable>
    </>
  );
}

function ThemedBottomNav() {
  return (
    <View style={styles.bottomNav}>
      {[
        ["Home", "H"],
        ["Lessons", "B"],
        ["Progress", "L"],
        ["Wellbeing", "W"],
        ["Profile", "P"],
      ].map(([label, icon]) => (
        <View key={label} style={label === "Lessons" ? styles.bottomNavItemActive : styles.bottomNavItem}>
          <Text style={styles.bottomNavIcon}>{icon}</Text>
          <Text style={styles.bottomNavLabel}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

export function SafeStepsLessonExperience({ course }: { course: ApiCurriculumCourseDetail }) {
  const lessons = useMemo<LessonItem[]>(
    () =>
      course.modules.flatMap((moduleLink) =>
        moduleLink.module.lessons.map((lessonLink) => ({
          ...lessonLink,
          moduleTitle: moduleLink.module.title,
          moduleOrder: moduleLink.order,
        })),
      ),
    [course.modules],
  );
  const [mode, setMode] = useState<LessonMode>("overview");
  const [lessonId, setLessonId] = useState(lessons[0]?.lesson.id ?? "");
  const selectedLesson = lessons.find((lesson) => lesson.lesson.id === lessonId) ?? lessons[0];
  const richLesson = isCourseLesson(selectedLesson?.lesson.raw) ? selectedLesson.lesson.raw : null;
  const progress = mode === "overview" ? 30 : mode === "activity" ? 45 : mode === "quiz" ? 60 : 80;
  const palette = getSafeStepsLessonWatercolorPalette(selectedLesson?.lesson.id ?? selectedLesson?.lesson.title ?? course.id);

  if (!selectedLesson) {
    return (
      <View style={styles.panelCard}>
        <Text style={styles.screenTitle}>No lessons available</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Header courseTitle={course.title} item={selectedLesson} mode={mode} progress={progress} palette={palette} />
      {lessons.length > 1 ? (
        <View style={styles.lessonRail}>
          {lessons.slice(0, 8).map((lesson, index) => (
            <Pressable
              key={lesson.lesson.id}
              onPress={() => {
                setLessonId(lesson.lesson.id);
                setMode("overview");
              }}
              style={lesson.lesson.id === selectedLesson.lesson.id ? styles.lessonRailItemActive : styles.lessonRailItem}
            >
              <Text style={lesson.lesson.id === selectedLesson.lesson.id ? styles.lessonRailTextActive : styles.lessonRailText}>
                {index + 1}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {mode === "overview" ? (
        <OverviewScreen item={selectedLesson} richLesson={richLesson} onModeChange={setMode} palette={palette} />
      ) : null}
      {mode === "activity" ? <ActivityScreen onModeChange={setMode} palette={palette} /> : null}
      {mode === "quiz" ? <QuizScreen item={selectedLesson} onModeChange={setMode} palette={palette} /> : null}
      {mode === "reflection" ? (
        <ReflectionScreen
          richLesson={richLesson}
          goalsOverride={selectedLesson.theme?.goals}
          promptOverride={selectedLesson.theme?.parentMeaningPrompt}
          onModeChange={setMode}
          palette={palette}
        />
      ) : null}
      <ThemedBottomNav />
    </View>
  );
}

export function SafeStepsSingleLessonExperience({ lesson }: { lesson: SafeStepsSingleLessonTheme }) {
  const [mode, setMode] = useState<LessonMode>("overview");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const palette = getSafeStepsLessonWatercolorPalette(lesson.id || lesson.title);
  const selectedLesson: LessonItem = {
    order: 1,
    moduleTitle: lesson.moduleTitle ?? "Lessons",
    moduleOrder: 1,
    lesson: {
      id: lesson.id,
      title: lesson.title,
      weekId: null,
      content: lesson.summary,
      body: lesson.summary,
      parentMeaningPrompt: lesson.parentMeaningPrompt ?? null,
      sourcePath: "app",
      raw: null,
      createdAt: "",
      updatedAt: "",
    },
    theme: {
      summary: lesson.summary,
      estimatedMinutes: lesson.estimatedMinutes,
      goals: lesson.goals,
      parentMeaningPrompt: lesson.parentMeaningPrompt,
    },
  };
  const progress = mode === "overview" ? 30 : mode === "activity" ? 45 : mode === "quiz" ? 60 : 80;

  const handleComplete = async () => {
    if (!lesson.onComplete) {
      setMode("overview");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await lesson.onComplete();
      setMessage(lesson.completionMessage ?? "Lesson saved.");
      setMode("overview");
    } catch {
      setMessage("Could not save this lesson yet. Try again shortly.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.page}>
      <Header courseTitle={lesson.courseTitle ?? "SafeSteps Lessons"} item={selectedLesson} mode={mode} progress={progress} palette={palette} />
      {mode === "overview" ? (
        <OverviewScreen item={selectedLesson} richLesson={null} onModeChange={setMode} palette={palette} />
      ) : null}
      {mode === "activity" ? <ActivityScreen onModeChange={setMode} palette={palette} /> : null}
      {mode === "quiz" ? <QuizScreen item={selectedLesson} onModeChange={setMode} palette={palette} /> : null}
      {mode === "reflection" ? (
        <>
          <ReflectionScreen
            richLesson={null}
            goalsOverride={lesson.goals}
            promptOverride={lesson.parentMeaningPrompt}
            onModeChange={setMode}
            palette={palette}
          />
          {message ? <Text style={message.startsWith("Could") ? styles.errorText : styles.noticeText}>{message}</Text> : null}
          <Pressable disabled={saving} onPress={handleComplete} style={[styles.primaryCta, { backgroundColor: palette.accentDark }, saving && styles.disabledCta]}>
            <Text style={[styles.spark, { color: palette.highlight }]}>*</Text>
            <Text style={styles.primaryCtaText}>{saving ? "Saving..." : lesson.completionLabel ?? "Complete Lesson"}</Text>
            <View style={styles.ctaArrow}>
              <Text style={styles.ctaArrowText}>{">"}</Text>
            </View>
          </Pressable>
        </>
      ) : null}
      <ThemedBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: 18,
    paddingBottom: 8,
    backgroundColor: lessonColors.background,
  },
  header: {
    alignItems: "center",
    gap: 12,
  },
  backCircle: {
    alignSelf: "flex-start",
    width: 56,
    height: 56,
    borderRadius: lessonRadius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lessonColors.card,
    ...lessonShadow,
  },
  backText: {
    color: lessonColors.purpleDark,
    fontSize: 28,
    fontWeight: "800",
  },
  logo: {
    width: 320,
    height: 92,
    maxWidth: "82%",
  },
  breadcrumbRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  breadcrumbHome: {
    color: lessonColors.teal,
    fontWeight: "800",
  },
  breadcrumb: {
    color: lessonColors.navy,
    fontSize: 15,
  },
  breadcrumbActive: {
    color: lessonColors.purpleDark,
    fontSize: 15,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  courseLabel: {
    alignSelf: "stretch",
    color: lessonColors.muted,
    fontSize: 13,
  },
  progressPill: {
    alignSelf: "flex-end",
    minWidth: 210,
    borderRadius: lessonRadius.pill,
    borderWidth: 1,
    borderColor: lessonColors.border,
    paddingHorizontal: 22,
    paddingVertical: 12,
    backgroundColor: lessonColors.card,
  },
  progressText: {
    color: lessonColors.purpleDark,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  progressTrack: {
    height: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lessonColors.line,
    overflow: "hidden",
    backgroundColor: lessonColors.lavender,
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: lessonColors.teal,
  },
  heroCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: lessonSpacing.lg,
    borderRadius: lessonRadius.large,
    borderWidth: 1,
    borderColor: lessonColors.border,
    padding: 28,
    backgroundColor: lessonColors.card,
    ...lessonShadow,
  },
  heroCopy: {
    flex: 1,
    minWidth: 280,
    gap: 18,
  },
  heroTitle: {
    color: lessonColors.navy,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "800",
  },
  goldRule: {
    width: 160,
    height: 5,
    borderRadius: 8,
    backgroundColor: lessonColors.peach,
  },
  heroBody: {
    color: lessonColors.navy,
    fontSize: 18,
    lineHeight: 28,
  },
  heroArt: {
    flex: 1,
    minWidth: 240,
    minHeight: 300,
    borderRadius: 180,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lessonColors.aqua,
  },
  heroArtFace: {
    position: "absolute",
    top: 34,
    left: 54,
    color: lessonColors.purpleDark,
    fontSize: 48,
    fontWeight: "800",
  },
  heroArtFaceMuted: {
    position: "absolute",
    top: 72,
    right: 48,
    color: lessonColors.purple,
    fontSize: 40,
    fontWeight: "800",
  },
  heroArtHead: {
    color: lessonColors.purpleDark,
    fontSize: 36,
    fontWeight: "900",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 22,
  },
  statBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statDivider: {
    width: 1,
    height: 46,
    backgroundColor: lessonColors.line,
  },
  smallIconBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lessonColors.lavender,
  },
  smallIcon: {
    color: lessonColors.purpleDark,
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: lessonColors.purpleDark,
    fontWeight: "700",
  },
  statValue: {
    color: lessonColors.navy,
    fontSize: 22,
  },
  longProgressTrack: {
    height: 14,
    borderRadius: 8,
    backgroundColor: lessonColors.lavender,
    overflow: "hidden",
  },
  longProgressFill: {
    width: "42%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: lessonColors.teal,
  },
  goalCard: {
    borderRadius: lessonRadius.medium,
    borderWidth: 1,
    borderColor: lessonColors.border,
    padding: 22,
    backgroundColor: lessonColors.card,
    gap: 14,
  },
  cardHeading: {
    color: lessonColors.navy,
    fontSize: 26,
    fontWeight: "800",
  },
  goalRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  goalItem: {
    flexGrow: 1,
    flexBasis: 190,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  goalCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: lessonColors.teal,
  },
  goalText: {
    flex: 1,
    color: lessonColors.navy,
    fontSize: 16,
    lineHeight: 22,
  },
  includedHeading: {
    color: lessonColors.navy,
    fontSize: 26,
    fontWeight: "800",
  },
  sectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  sectionCard: {
    flexGrow: 1,
    flexBasis: 220,
    minHeight: 200,
    borderRadius: lessonRadius.medium,
    borderWidth: 1,
    borderColor: lessonColors.border,
    padding: 20,
    backgroundColor: lessonColors.card,
    gap: 12,
  },
  iconBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lessonColors.lavender,
  },
  iconText: {
    color: lessonColors.purpleDark,
    fontSize: 28,
    fontWeight: "800",
  },
  sectionTitle: {
    color: lessonColors.navy,
    fontSize: 22,
    fontWeight: "800",
  },
  sectionBody: {
    color: lessonColors.navy,
    lineHeight: 22,
  },
  sectionFooter: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  durationText: {
    color: lessonColors.purpleDark,
    fontWeight: "700",
  },
  chevron: {
    color: lessonColors.purpleDark,
    fontSize: 24,
  },
  primaryCta: {
    alignSelf: "center",
    width: "88%",
    minHeight: 76,
    borderRadius: lessonRadius.pill,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: lessonColors.purpleDark,
    borderWidth: 1,
    borderColor: lessonColors.peach,
    ...lessonShadow,
  },
  primaryCtaSmall: {
    flex: 1,
    minHeight: 68,
    borderRadius: lessonRadius.pill,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: lessonColors.purpleDark,
  },
  primaryCtaText: {
    color: lessonColors.white,
    fontSize: 28,
    fontWeight: "800",
  },
  spark: {
    color: lessonColors.peach,
    fontSize: 32,
    fontWeight: "900",
  },
  ctaArrow: {
    width: 58,
    height: 58,
    borderRadius: lessonRadius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lessonColors.peach,
  },
  ctaArrowText: {
    color: lessonColors.purpleDark,
    fontSize: 26,
    fontWeight: "900",
  },
  lessonRail: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  lessonRailItem: {
    width: 40,
    height: 40,
    borderRadius: lessonRadius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: lessonColors.border,
    backgroundColor: lessonColors.white,
  },
  lessonRailItemActive: {
    width: 40,
    height: 40,
    borderRadius: lessonRadius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lessonColors.purpleDark,
  },
  lessonRailText: {
    color: lessonColors.purpleDark,
    fontWeight: "800",
  },
  lessonRailTextActive: {
    color: lessonColors.white,
    fontWeight: "800",
  },
  panelCard: {
    borderRadius: lessonRadius.large,
    borderWidth: 1,
    borderColor: lessonColors.border,
    padding: 28,
    backgroundColor: lessonColors.card,
    gap: 18,
  },
  eyebrow: {
    color: lessonColors.purpleDark,
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  screenTitle: {
    color: lessonColors.navy,
    fontSize: 48,
    lineHeight: 54,
    fontWeight: "900",
  },
  screenIntro: {
    color: lessonColors.navy,
    fontSize: 17,
    lineHeight: 25,
  },
  centerLabel: {
    alignSelf: "center",
    color: lessonColors.navy,
    fontSize: 22,
    fontWeight: "800",
  },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  feelingCard: {
    flexGrow: 1,
    flexBasis: 150,
    minHeight: 190,
    borderRadius: lessonRadius.medium,
    borderWidth: 1,
    borderColor: lessonColors.border,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: lessonColors.white,
  },
  feelingFace: {
    fontSize: 48,
    color: lessonColors.purpleDark,
    fontWeight: "900",
  },
  feelingLabel: {
    color: lessonColors.navy,
    fontSize: 22,
    fontWeight: "800",
  },
  matchDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: lessonColors.pink,
  },
  matchDotTop: {
    position: "absolute",
    top: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: lessonColors.pink,
  },
  situationCard: {
    flexGrow: 1,
    flexBasis: 150,
    minHeight: 210,
    borderRadius: lessonRadius.medium,
    borderWidth: 1,
    borderColor: lessonColors.border,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: lessonColors.white,
  },
  situationArt: {
    color: lessonColors.purple,
    fontWeight: "900",
  },
  situationText: {
    color: lessonColors.navy,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
  },
  tipCard: {
    borderRadius: lessonRadius.medium,
    borderWidth: 1,
    borderColor: lessonColors.border,
    padding: 18,
    backgroundColor: lessonColors.card,
  },
  tipText: {
    color: lessonColors.navy,
    fontSize: 17,
    lineHeight: 24,
  },
  questionCount: {
    color: lessonColors.purpleDark,
    fontSize: 22,
    fontWeight: "800",
  },
  quizProgressTrack: {
    height: 14,
    borderRadius: 8,
    backgroundColor: lessonColors.lavender,
    overflow: "hidden",
  },
  quizProgressFill: {
    width: "40%",
    height: "100%",
    backgroundColor: lessonColors.teal,
  },
  questionText: {
    color: lessonColors.navy,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
  },
  answerOption: {
    minHeight: 72,
    borderRadius: lessonRadius.medium,
    borderWidth: 1,
    borderColor: lessonColors.border,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: lessonColors.white,
  },
  radio: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: lessonColors.purpleDark,
  },
  radioSelected: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 9,
    borderColor: lessonColors.purpleDark,
  },
  answerText: {
    flex: 1,
    color: lessonColors.navy,
    fontSize: 18,
    lineHeight: 25,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  secondaryCta: {
    flex: 1,
    minHeight: 68,
    borderRadius: lessonRadius.pill,
    borderWidth: 2,
    borderColor: lessonColors.purpleDark,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: lessonColors.white,
  },
  secondaryCtaText: {
    color: lessonColors.purpleDark,
    fontSize: 18,
    fontWeight: "800",
  },
  wrapTitle: {
    color: lessonColors.navy,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
  },
  reflectionQuestion: {
    color: lessonColors.navy,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "800",
  },
  reflectionInput: {
    minHeight: 132,
    borderRadius: lessonRadius.medium,
    borderWidth: 1,
    borderColor: lessonColors.line,
    padding: 18,
    backgroundColor: lessonColors.white,
    color: lessonColors.navy,
    fontSize: 18,
    textAlignVertical: "top",
  },
  feelingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  feelingChip: {
    alignItems: "center",
    gap: 8,
  },
  feelingChipFace: {
    width: 72,
    height: 72,
    borderRadius: lessonRadius.pill,
    color: lessonColors.purpleDark,
    backgroundColor: lessonColors.lavender,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 24,
    fontWeight: "900",
  },
  feelingChipFaceSelected: {
    width: 72,
    height: 72,
    borderRadius: lessonRadius.pill,
    color: lessonColors.purpleDark,
    backgroundColor: lessonColors.peach,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 24,
    fontWeight: "900",
  },
  feelingChipLabel: {
    color: lessonColors.navy,
  },
  encouragementCard: {
    borderRadius: lessonRadius.medium,
    borderWidth: 1,
    borderColor: lessonColors.border,
    padding: 18,
    backgroundColor: lessonColors.card,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: lessonRadius.large,
    paddingVertical: 14,
    backgroundColor: lessonColors.card,
    borderWidth: 1,
    borderColor: lessonColors.border,
  },
  bottomNavItem: {
    alignItems: "center",
    gap: 4,
    minWidth: 64,
  },
  bottomNavItemActive: {
    alignItems: "center",
    gap: 4,
    minWidth: 80,
    borderRadius: lessonRadius.pill,
    paddingVertical: 10,
    backgroundColor: lessonColors.lavender,
  },
  bottomNavIcon: {
    color: lessonColors.purpleDark,
    fontSize: 24,
    fontWeight: "900",
  },
  bottomNavLabel: {
    color: lessonColors.purpleDark,
    fontWeight: "700",
  },
  noticeText: {
    color: lessonColors.purpleDark,
    fontWeight: "800",
    textAlign: "center",
  },
  errorText: {
    color: "#9E2B25",
    fontWeight: "800",
    textAlign: "center",
  },
  disabledCta: {
    opacity: 0.68,
  },
});
