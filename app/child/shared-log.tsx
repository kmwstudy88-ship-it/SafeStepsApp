import React from "react";
import { BackToChildHome, BulletList, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";

const logFields = [
  "What was shared",
  "Who it was shared with",
  "When it was shared",
  "Whether it came from a feeling, task, lesson, visit reflection, or request",
  "Whether the child can change or remove sharing later",
];

export default function SharedItemsLogScreen() {
  return (
    <ChildScreenShell
      title="Shared Items Log"
      subtitle="A transparent record that shows the child what they chose to share and who can see it."
    >
      <PrivacyNotice />

      <SectionTitle>Log Includes</SectionTitle>

      <InfoCard title="Every shared item should record">
        <BulletList items={logFields} />
      </InfoCard>

      <BackToChildHome />
    </ChildScreenShell>
  );
}