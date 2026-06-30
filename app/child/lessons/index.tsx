import React from "react";
import { childLessons } from "../../../lib/child/childData";
import { BackToChildHome, ChildScreenShell, PrivacyNotice, RouteCard, SectionTitle } from "../../../lib/child/components";

export default function ChildLessonsScreen() {
  return (
    <ChildScreenShell
      title="Child Lessons"
      subtitle="Age-appropriate, trauma-informed lessons with child-controlled sharing."
    >
      <PrivacyNotice />

      <SectionTitle>Available Lessons</SectionTitle>

      {childLessons.map((lesson) => (
        <RouteCard
          key={lesson.id}
          title={`Week ${lesson.week}: ${lesson.title}`}
          description={lesson.description}
          href={`/child/lessons/${lesson.id}`}
          badge="Lesson"
        />
      ))}

      <BackToChildHome />
    </ChildScreenShell>
  );
}