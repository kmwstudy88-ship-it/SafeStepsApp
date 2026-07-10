import { Link, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { getRecommendedChallenges } from "../lib/challenges/recommendations";
import { globalStyles } from "../lib/styles";

export function ChallengeRecommendations({
  context,
  title = "Practise with a challenge",
  limit = 4,
}: {
  context: string;
  title?: string;
  limit?: number;
}) {
  const challenges = getRecommendedChallenges(context, limit);
  if (challenges.length === 0) return null;

  return (
    <View style={globalStyles.card}>
      <Text style={globalStyles.cardTitle}>{title}</Text>
      <Text style={globalStyles.cardText}>
        These optional activities help apply this learning in everyday family life.
      </Text>
      {challenges.map((challenge) => (
        <Link
          key={challenge.id}
          href={{
            pathname: "/challenges/[challengeId]",
            params: { challengeId: challenge.id },
          } as unknown as Href}
          asChild
        >
          <Pressable style={globalStyles.selectableItem}>
            <View style={globalStyles.inlineRow}>
              <Text style={globalStyles.pill}>{challenge.challengeType}</Text>
              <Text style={globalStyles.mutedText}>{challenge.estimatedTime}</Text>
            </View>
            <Text style={globalStyles.cardTitle}>{challenge.displayTitle}</Text>
            <Text style={globalStyles.cardText}>{challenge.purpose}</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}
