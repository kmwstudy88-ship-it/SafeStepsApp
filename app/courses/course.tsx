import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, Text, View } from "react-native";
import { CourseLessonContent } from "../../components/CourseLessonContent";
import { ChallengeRecommendations } from "../../components/ChallengeRecommendations";
import { areAllCourseLessonsViewed, getCourseById } from "../../curriculum/courses";
import {
  CertificateRecord,
  findMatchingCertificate,
  issueCertificate,
  listMyCertificates,
} from "../../lib/platform/certificates";
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
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.courseScreen}>
      <Text style={globalStyles.courseTitle}>{course.title}</Text>

      <Text style={globalStyles.courseSubtitle}>{course.description}</Text>

      <ChallengeRecommendations
        context={`${course.title} ${course.description} ${course.lessons.map((lesson) => `${lesson.title} ${lesson.summary ?? ""}`).join(" ")}`}
        title="Challenges for this course"
      />

      <View
        style={{
          padding: 16,
          backgroundColor: "#f1f5f3",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Course Structure
        </Text>
        <Text style={{ marginTop: 6 }}>
          This is a standalone course. It uses simple lessons and a final
          completion step. It does not use monthly or weekly program structure.
        </Text>
      </View>

      {course.lessons.map((lesson) => (
        <View
          key={lesson.lessonNumber}
          style={{
            padding: 16,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#d8e5dd",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Lesson {lesson.lessonNumber}: {lesson.title}
          </Text>

          <Text style={{ marginTop: 6 }}>
            Duration: {lesson.durationMinutes} minutes
          </Text>

          {lesson.summary ? (
            <Text style={{ marginTop: 8, fontSize: 16, lineHeight: 23 }}>
              {lesson.summary}
            </Text>
          ) : (
            <Text style={{ marginTop: 8 }}>
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
            disabled={(parentMeanings[lesson.lessonNumber] ?? "").trim().length === 0}
            onPress={() =>
              setViewedLessons((current) => ({
                ...current,
                [lesson.lessonNumber]: true,
              }))
            }
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              backgroundColor: viewedLessons[lesson.lessonNumber]
                ? "#dcefe8"
                : (parentMeanings[lesson.lessonNumber] ?? "").trim().length > 0
                ? "#eef3f5"
                : "#e5e5e5",
              alignItems: "center",
              opacity: (parentMeanings[lesson.lessonNumber] ?? "").trim().length > 0 ? 1 : 0.75,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>
              {viewedLessons[lesson.lessonNumber]
                ? "Lesson Viewed"
                : (parentMeanings[lesson.lessonNumber] ?? "").trim().length > 0
                ? "Mark Lesson Viewed"
                : "Add Parent Meaning First"}
            </Text>
          </Pressable>
        </View>
      ))}

      <View
        style={{
          padding: 16,
          backgroundColor: allLessonsViewed ? "#dcefe8" : "#e5e5e5",
          borderRadius: 12,
          marginBottom: 40,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          {courseCertificate
            ? "Course Certificate Issued"
            : allLessonsViewed
            ? "Course Ready for Completion"
            : "Complete all course lessons first"}
        </Text>

        <Text style={{ marginTop: 6 }}>
          {courseCertificate
            ? `Certificate number: ${courseCertificate.certificate_number}`
            : allLessonsViewed
            ? "Issue a standalone course certificate for this completed course."
            : "Mark every lesson viewed to unlock certificate generation."}
        </Text>

        <Pressable
          disabled={!allLessonsViewed || issuing || Boolean(courseCertificate)}
          onPress={issueCourseCertificate}
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            backgroundColor: allLessonsViewed && !courseCertificate ? "#2f5f4a" : "#cbd8d0",
            alignItems: "center",
            opacity: issuing ? 0.65 : 1,
          }}
        >
          <Text style={{ color: allLessonsViewed && !courseCertificate ? "#ffffff" : "#22332b", fontWeight: "bold" }}>
            {issuing ? "Issuing..." : courseCertificate ? "Certificate Issued" : "Issue Course Certificate"}
          </Text>
        </Pressable>

        {message ? (
          <Text style={{ marginTop: 8, fontWeight: "bold" }}>{message}</Text>
        ) : null}
      </View>
    </ScrollView>
    </ImageBackground>
  );
}
