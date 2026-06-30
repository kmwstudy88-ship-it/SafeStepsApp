import React from "react";
import { visitPreparationPrompts } from "../../../lib/child/childData";
import { BackToChildHome, BulletList, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../../lib/child/components";

export default function VisitPreparationScreen() {
  return (
    <ChildScreenShell
      title="Visit Preparation"
      subtitle="A calm tool to help the child prepare emotionally before a visit."
    >
      <PrivacyNotice />

      <SectionTitle>Before the Visit</SectionTitle>

      <InfoCard title="Prompts">
        <BulletList items={visitPreparationPrompts} />
      </InfoCard>

      <InfoCard
        title="Child Choice"
        description="The child can keep this private or choose to share selected parts with a caseworker, parent, or both."
      />

      <BackToChildHome />
    </ChildScreenShell>
  );
}