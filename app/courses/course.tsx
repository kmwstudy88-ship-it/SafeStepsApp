import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CourseLessonContent } from "../../components/CourseLessonContent";
import { ChallengeRecommendations } from "../../components/ChallengeRecommendations";
import { areAllCourseLessonsViewed, getCourseById } from "../../curriculum/courses";
import {
  CertificateRecord,
  findMatchingCertificate,
  issueCertificate,
  listMyCertificates,
} from "../../lib/platform/certificates";
import { getSafeStepsLessonWatercolorPalette, safestepsLessonTheme } from "../../lib/safestepsLessonTheme";
import { globalStyles } from "../../lib/styles";

export default function CoursePlayerScreen() {
  const params = useLocalSearchParams();
  const courseId = String(params.courseId ?? "");

  const course = getCourseById(courseId);

  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [issuing, setIssuing] = useState(false);
  const [message, setMessage] = useState("");
  const [viewedLessons, setViewedLessons] = useState<Record<number, boolean>>(
    {}
  );
  const [parentMeanings, setParentMeanings] = useState<Record<number, string>>(
    {}
  );

  const certificateTitle = course ? `${course.title} completion` : "";
  const courseCertificate = findMatchingCertificate(
    certificates,
    "standalone_course",
    certificateTitle,
    { courseId: course?.id ?? null },
  );

  const allLessonsViewed = useMemo(() => {
    return course ? areAllCourseLessonsViewed(course, viewedLessons) : false;
  }, [course, viewedLessons]);

  async function loadCertificates() {
    try {
      setCertificates(await listMyCertificates());
    } catch {
      setCertificates([]);
    }
  }

  useEffect(() => {
    loadCertificates();
  }, []);

  async function issueCourseCertificate() {
    if (!course || !allLessonsViewed || issuing) return;

    setIssuing(true);
    setMessage("");

    try {
      if (courseCertificate) {
        setMessage(`Certificate already issued: ${courseCertificate.certificate_number}.`);
        return;
      }

      await issueCertificate({
        courseId: course.id,
        certificateType: "standalone_course",
        levelTitle: certificateTitle,
      });
      await loadCertificates();
      setMessage("Course certificate issued.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not issue course certificate.");
    } finally {
      setIssuing(false);
    }
  }

  if (!course) {
    return (
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
          Course not found
        </Text>
        <Text>
          This standalone course is not available in the current SafeSteps library.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/safesteps-course-background.png")}
      resizeMode="cover"
      style={globalStyles.courseBackground}
    >
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.courseScreen}>
      <Text style={styles.courseTitle}>{course.title}</Text>

      <Text style={styles.courseSubtitle}>{course.description}</Text>

      <ChallengeRecommendations
        context={`${course.title} ${course.description} ${course.lessons.map((lesson) => `${lesson.title} ${lesson.summary ?? ""}`).join(" ")}`}
        title="Challenges for this course"
      />

      <View
        style={styles.structureCard}
      >
        <View style={styles.cardAccent} />
        <Text style={styles.cardTitle}>
          Course Structure
        </Text>
        <Text style={styles.cardText}>
          This is a standalone course. It uses simple lessons and a final
          completion step. It does not use monthly or weekly program structure.
        </Text>
      </View>

      {course.lessons.map((lesson) => {
        const palette = getSafeStepsLessonWatercolorPalette(`${course.id}-${lesson.lessonNumber}-${lesson.title}`);
        const hasParentMeaning = (parentMeanings[lesson.lessonNumber] ?? "").trim().length > 0;
        const viewed = viewedLessons[lesson.lessonNumber];

        return (
        <View
          key={lesson.lessonNumber}
          style={[styles.lessonCard, { backgroundColor: palette.wash }]}
        >
          <View style={[styles.lessonAccent, { backgroundColor: palette.accent }]} />
          <Text style={styles.lessonTitle}>
            Lesson {lesson.lessonNumber}: {lesson.title}
          </Text>

          <Text style={styles.durationText}>
            Duration: {lesson.durationMinutes} minutes
          </Text>

          {lesson.summary ? (
            <Text style={styles.lessonSummary}>
              {lesson.summary}
            </Text>
          ) : (
            <Text style={styles.lessonSummary}>
              Practise the skill, record what it means to you, then mark the lesson
              viewed when it is ready to count toward course completion.
            </Text>
          )}

          <View style={{ marginTop: 14 }}>
            <CourseLessonContent
              lesson={lesson}
              parentMeaning={parentMeanings[lesson.lessonNumber] ?? ""}
              onParentMeaningChange={(value) =>
                setParentMeanings((current) => ({
                  ...current,
                  [lesson.lessonNumber]: value,
                }))
              }
            />
          </View>

          <Pressable
            disabled={!hasParentMeaning}
            onPress={() =>
              setViewedLessons((current) => ({
                ...current,
                [lesson.lessonNumber]: true,
              }))
            }
            style={[
              styles.lessonButton,
              {
                backgroundColor: viewed ? palette.accent : hasParentMeaning ? palette.accentDark : safestepsLessonTheme.colors.line,
                opacity: hasParentMeaning ? 1 : 0.75,
              },
            ]}
          >
            <Text style={styles.lessonButtonText}>
              {viewed
                ? "Lesson Viewed"
                : hasParentMeaning
                ? "Mark Lesson Viewed"
                : "Add Parent Meaning First"}
            </Text>
          </Pressable>
        </View>
        );
      })}

      <View
        style={[styles.certificateCard, { backgroundColor: allLessonsViewed ? safestepsLessonTheme.colors.lavender : safestepsLessonTheme.colors.card }]}
      >
        <Text style={styles.cardTitle}>
          {courseCertificate
            ? "Course Certificate Issued"
            : allLessonsViewed
            ? "Course Ready for Completion"
            : "Complete all course lessons first"}
        </Text>

        <Text style={styles.cardText}>
          {courseCertificate
            ? `Certificate number: ${courseCertificate.certificate_number}`
            : allLessonsViewed
            ? "Issue a standalone course certificate for this completed course."
            : "Mark every lesson viewed to unlock certificate generation."}
        </Text>

        <Pressable
          disabled={!allLessonsViewed || issuing || Boolean(courseCertificate)}
          onPress={issueCourseCertificate}
          style={[
            styles.certificateButton,
            {
              backgroundColor: allLessonsViewed && !courseCertificate ? safestepsLessonTheme.colors.purpleDark : safestepsLessonTheme.colors.line,
              opacity: issuing ? 0.65 : 1,
            },
          ]}
        >
          <Text style={[styles.certificateButtonText, { color: allLessonsViewed && !courseCertificate ? safestepsLessonTheme.colors.white : safestepsLessonTheme.colors.navy }]}>
            {issuing ? "Issuing..." : courseCertificate ? "Certificate Issued" : "Issue Course Certificate"}
          </Text>
        </Pressable>

        {message ? (
          <Text style={styles.messageText}>{message}</Text>
        ) : null}
      </View>
    </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  courseScreen: {
    padding: 20,
    gap: 16,
    backgroundColor: safestepsLessonTheme.colors.background,
  },
  courseTitle: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "900",
    textAlign: "center",
  },
  courseSubtitle: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
  },
  structureCard: {
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 18,
    gap: 10,
    backgroundColor: safestepsLessonTheme.colors.card,
    ...safestepsLessonTheme.shadow,
  },
  cardAccent: {
    width: 56,
    height: 7,
    borderRadius: safestepsLessonTheme.radius.pill,
    backgroundColor: safestepsLessonTheme.colors.peach,
  },
  cardTitle: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },
  cardText: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 16,
    lineHeight: 24,
  },
  lessonCard: {
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 18,
    gap: 10,
    ...safestepsLessonTheme.shadow,
  },
  lessonAccent: {
    width: 48,
    height: 7,
    borderRadius: safestepsLessonTheme.radius.pill,
  },
  lessonTitle: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },
  durationText: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontWeight: "800",
  },
  lessonSummary: {
    color: safestepsLessonTheme.colors.navy,
    fontSize: 16,
    lineHeight: 24,
  },
  lessonButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: safestepsLessonTheme.radius.pill,
    alignItems: "center",
  },
  lessonButtonText: {
    color: safestepsLessonTheme.colors.white,
    fontWeight: "900",
  },
  certificateCard: {
    borderRadius: safestepsLessonTheme.radius.large,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    padding: 18,
    gap: 10,
    marginBottom: 40,
  },
  certificateButton: {
    marginTop: 8,
    padding: 14,
    borderRadius: safestepsLessonTheme.radius.pill,
    alignItems: "center",
  },
  certificateButtonText: {
    fontWeight: "900",
  },
  messageText: {
    color: safestepsLessonTheme.colors.purpleDark,
    fontWeight: "800",
  },
});
