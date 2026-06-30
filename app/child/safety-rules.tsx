import React from "react";
import { childSafetyRules } from "../../lib/child/childData";
import { BackToChildHome, BulletList, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";

export default function ChildSafetyRulesScreen() {
  return (
    <ChildScreenShell
      title="Child Safety Rules"
      subtitle="The core privacy rules that protect the child section."
    >
      <PrivacyNotice />

      <SectionTitle>Rules</SectionTitle>

      <InfoCard title="Parent visibility limits">
        <BulletList items={childSafetyRules} />
      </InfoCard>

      <InfoCard
        title="Important database rule"
        description="These privacy rules must be enforced with Supabase Row Level Security. The app screen alone is not enough protection."
      />

      <BackToChildHome />
    </ChildScreenShell>
  );
}