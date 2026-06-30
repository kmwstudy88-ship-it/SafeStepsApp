import React from "react";
import { BackToChildHome, BulletList, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";

const prompts = [
  "Who helps me feel safe?",
  "Who listens calmly?",
  "Who can I talk to if I feel worried?",
  "Who helps me make safe choices?",
  "Who should be contacted if I ask for help?",
];

export default function SafePeopleScreen() {
  return (
    <ChildScreenShell
      title="My Safe People"
      subtitle="A child-controlled list of trusted people who help the child feel safe, heard, and supported."
    >
      <PrivacyNotice />

      <SectionTitle>Safe People Prompts</SectionTitle>

      <InfoCard title="Questions">
        <BulletList items={prompts} />
      </InfoCard>

      <BackToChildHome />
    </ChildScreenShell>
  );
}