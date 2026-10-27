import React from "react";
import { BackToChildHome, BulletList, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";

const evidenceTypes = [
  "Drawings",
  "Voice notes",
  "Safe non-identifying photos",
  "Written reflections",
  "Achievement badges",
  "Visit feedback",
];

const evidenceRules = [
  "Every evidence item is time-stamped.",
  "Every evidence item is linked to a task, lesson, or visit tool.",
  "Every evidence item has sharing controls.",
  "Parents cannot see evidence unless the child shares it.",
  "Caseworker visibility is role-restricted.",
];

export default function ChildEvidenceScreen() {
  return (
    <ChildScreenShell
      title="Child Evidence"
      subtitle="A safe space where children can create or upload child-controlled evidence."
    >
      <PrivacyNotice />

      <SectionTitle>Evidence Types</SectionTitle>
      <InfoCard title="Children can create or upload">
        <BulletList items={evidenceTypes} />
      </InfoCard>

      <SectionTitle>Evidence Rules</SectionTitle>
      <InfoCard title="Privacy and record rules">
        <BulletList items={evidenceRules} />
      </InfoCard>

      <BackToChildHome />
    </ChildScreenShell>
  );
}