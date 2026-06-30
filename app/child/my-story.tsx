import React from "react";
import { myStorySections } from "../../lib/child/childData";
import { BackToChildHome, BulletList, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";

export default function MyStoryScreen() {
  return (
    <ChildScreenShell
      title="My Story"
      subtitle="A private child space for feelings, drawings, hopes, worries, safe people, achievements, and visit reflections."
    >
      <PrivacyNotice />

      <SectionTitle>My Private Space</SectionTitle>

      <InfoCard title="This space can include">
        <BulletList items={myStorySections} />
      </InfoCard>

      <InfoCard
        title="Parent Access"
        description="Parents cannot see My Story unless the child chooses to share a specific item."
      />

      <BackToChildHome />
    </ChildScreenShell>
  );
}