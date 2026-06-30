import React from "react";
import { ParentChildCard, ParentChildShell } from "../../lib/parentChild/components";

export default function ParentChildHomeScreen() {
  return (
    <ParentChildShell
      title="Parent-Child Section"
      subtitle="This is where parents can see child-shared requests, reflections, and messages without entering the private child space."
    >
      <ParentChildCard
        title="Shared Items"
        description="See feelings, lessons, visit reflections, messages, or tasks the child chose to share."
        badge="Shared"
        href="/parent-child/shared-items"
      />

      <ParentChildCard
        title="Child Requests"
        description="See game requests, talk requests, help requests, and parent improvement requests the child chose to send."
        badge="Requests"
        href="/parent-child/requests"
      />

      <ParentChildCard
        title="What parents cannot see"
        description="Parents cannot see private child feelings, child tasks, child evidence, child assessments, child progress, or child visit reflections unless the child chooses to share them."
        badge="Safety"
      />
    </ParentChildShell>
  );
}