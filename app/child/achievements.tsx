import React from "react";
import { BackToChildHome, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";

const achievements = [
  "Completed a feelings check-in",
  "Named a safe person",
  "Finished a lesson",
  "Used a calm-down strategy",
  "Shared something by choice",
  "Asked for help",
  "Completed a visit reflection",
];

export default function AchievementsScreen() {
  return (
    <ChildScreenShell
      title="My Achievements"
      subtitle="A strengths-based space that celebrates progress, courage, learning, and safe choices."
    >
      <PrivacyNotice />

      <SectionTitle>Achievement Badges</SectionTitle>

      {achievements.map((achievement) => (
        <InfoCard
          key={achievement}
          title={achievement}
          description="This can become a badge, progress marker, or child-friendly celebration."
        />
      ))}

      <BackToChildHome />
    </ChildScreenShell>
  );
}