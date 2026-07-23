import React from "react";
import { Link, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { BackToParentChildHome, ParentChildCard, ParentChildShell } from "../../lib/parentChild/components";
import { weekendActivityChallenges } from "../../lib/data/familyChallenges";

export default function ParentChildWeekendActivitiesScreen() {
  return (
    <ParentChildShell
      title="Weekend Activities"
      subtitle="Family activities and challenges suited to shared weekend time, routines, care, communication, and child voice."
    >
      <ParentChildCard
        title={`${weekendActivityChallenges.length} weekend-ready activities`}
        description="Children can request these from their dashboard. Shared requests appear in Child Requests for parent response and scheduling."
        badge="Weekend"
        href="/parent-child/requests"
      />

      {weekendActivityChallenges.map((challenge) => (
        <Link
          key={challenge.id}
          href={{ pathname: "/challenges/[challengeId]", params: { challengeId: challenge.id } } as unknown as Href}
          asChild
        >
          <Pressable>
            <ParentChildCard
              title={challenge.displayTitle}
              description={challenge.purpose}
              badge={challenge.challengeType}
            >
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                <Text style={{ color: "#53665A", fontWeight: "800" }}>{challenge.category}</Text>
                <Text style={{ color: "#53665A" }}>{challenge.estimatedTime}</Text>
              </View>
            </ParentChildCard>
          </Pressable>
        </Link>
      ))}

      <BackToParentChildHome />
    </ParentChildShell>
  );
}
