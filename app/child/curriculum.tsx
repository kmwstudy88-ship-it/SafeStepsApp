import React from "react";
import { childCurriculumTracks } from "../../lib/child/childData";
import { BackToChildHome, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";

export default function ChildCurriculumScreen() {
  return (
    <ChildScreenShell
      title="Child Curriculum"
      subtitle="A completely separate child curriculum focused on feelings, safety, communication, boundaries, visits, and self-esteem."
    >
      <PrivacyNotice />

      <SectionTitle>Learning Tracks</SectionTitle>

      {childCurriculumTracks.map((track) => (
        <InfoCard
          key={track.title}
          title={track.title}
          description={`${track.focus} Age track: ${track.ageTrack}.`}
        />
      ))}

      <BackToChildHome />
    </ChildScreenShell>
  );
}