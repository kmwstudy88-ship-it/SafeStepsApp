import React from "react";
import { useLocalSearchParams } from "expo-router";
import { childLessons } from "../../../lib/child/childData";
import { BackToChildHome, BulletList, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../../lib/child/components";

export default function ChildLessonDetailScreen() {
  const params = useLocalSearchParams<{ lessonId?: string | string[] }>();
  const rawLessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId;
  const lesson = childLessons.find((item) => item.id === rawLessonId) ?? childLessons[0];

  return (
    <ChildScreenShell
      title={lesson.title}
      subtitle={lesson.description}
    >
      <PrivacyNotice />

      <InfoCard
        title={`Week ${lesson.week}`}
        description={lesson.sharing}
      />

      <SectionTitle>Learning Objectives</SectionTitle>
      <InfoCard title="What this lesson helps with">
        <BulletList items={lesson.objectives} />
      </InfoCard>

      <SectionTitle>Tasks</SectionTitle>
      <InfoCard title="Child-friendly activities">
        <BulletList items={lesson.tasks} />
      </InfoCard>

      <SectionTitle>Evidence</SectionTitle>
      <InfoCard title="Optional evidence choices">
        <BulletList items={lesson.evidence} />
      </InfoCard>

      <BackToChildHome />
    </ChildScreenShell>
  );
}