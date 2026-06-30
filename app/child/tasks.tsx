import React from "react";
import { childTasks } from "../../lib/child/childData";
import { BackToChildHome, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";

export default function ChildTasksScreen() {
  return (
    <ChildScreenShell
      title="Child Tasks"
      subtitle="Interactive, child-friendly, trauma-informed tasks that can stay private or be shared by choice."
    >
      <PrivacyNotice />

      <SectionTitle>Task Types</SectionTitle>

      {childTasks.map((task) => (
        <InfoCard
          key={task.title}
          title={task.title}
          description={`${task.description} Privacy: ${task.privacy}.`}
        />
      ))}

      <BackToChildHome />
    </ChildScreenShell>
  );
}