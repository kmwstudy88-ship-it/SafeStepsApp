import React from "react";
import { shareOptions } from "../../lib/child/childData";
import { BackToChildHome, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";

export default function ChildSharingScreen() {
  return (
    <ChildScreenShell
      title="Sharing Controls"
      subtitle="The child chooses what is shared, who sees it, and what stays private."
    >
      <PrivacyNotice />

      <SectionTitle>Sharing Options</SectionTitle>

      {shareOptions.map((option) => (
        <InfoCard
          key={option.value}
          title={option.label}
          description={option.description}
        />
      ))}

      <InfoCard
        title="Important"
        description="Child control must be enforced in Supabase Row Level Security, not only in the app screen."
      />

      <BackToChildHome />
    </ChildScreenShell>
  );
}