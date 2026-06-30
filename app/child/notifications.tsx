import React from "react";
import { childRequests } from "../../lib/child/childData";
import { BackToChildHome, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";

export default function ChildNotificationsScreen() {
  return (
    <ChildScreenShell
      title="Child Notifications"
      subtitle="Outgoing child-controlled messages that can appear in the parent-child section or caseworker dashboard."
    >
      <PrivacyNotice />

      <SectionTitle>Notification Types</SectionTitle>

      {childRequests.map((request) => (
        <InfoCard
          key={request.title}
          title={request.title}
          description={request.description}
        />
      ))}

      <BackToChildHome />
    </ChildScreenShell>
  );
}