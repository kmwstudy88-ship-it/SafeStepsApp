import React from "react";
import { childDashboardItems } from "../../lib/child/childData";
import { ChildScreenShell, PrivacyNotice, RouteCard, SectionTitle } from "../../lib/child/components";

export default function ChildDashboardScreen() {
  return (
    <ChildScreenShell
      title="Child Home"
      subtitle="A private, child-controlled space for feelings, lessons, safety, visits, achievements, and sharing choices."
    >
      <PrivacyNotice />

      <SectionTitle>Today</SectionTitle>

      {childDashboardItems.map((item) => (
        <RouteCard
          key={item.href}
          title={item.title}
          description={item.description}
          href={item.href}
          badge={item.badge}
        />
      ))}
    </ChildScreenShell>
  );
}