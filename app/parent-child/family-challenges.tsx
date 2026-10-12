import React from "react";
import { Link, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { BackToParentChildHome, ParentChildCard, ParentChildShell } from "../../lib/parentChild/components";
import { familyChallengeCategories, familyChallenges } from "../../lib/data/familyChallenges";

export default function ParentChildFamilyChallengesScreen() {
  return (
    <ParentChildShell
      title="Family Challenges"
      subtitle="Family-use challenges for connection, routines, communication, care, safety, age-stage support, co-parenting, and child voice."
    >
      <ParentChildCard
        title={`${familyChallenges.length} family-use challenges`}
        description={`${familyChallengeCategories.length} categories. Child requests for these challenges appear in Child Requests when the child chooses to share them.`}
        badge="Shared use"
        href="/parent-child/requests"
      />

      {familyChallenges.map((challenge) => (
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
