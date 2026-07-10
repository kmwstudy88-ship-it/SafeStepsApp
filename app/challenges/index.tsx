import { Link, Redirect, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import { safestepsParentChallenges } from "../../lib/data/safestepsParentChallenges";
import { globalStyles } from "../../lib/styles";

const TYPES = ["all", "daily", "weekly", "monthly"] as const;

export default function ChallengesScreen() {
  const { initializing, user } = useAuth();
  const [type, setType] = useState<(typeof TYPES)[number]>("all");
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();

  const categories = useMemo(
    () => new Set(safestepsParentChallenges.map((challenge) => challenge.category)).size,
    [],
  );
  const filtered = useMemo(
    () =>
      safestepsParentChallenges.filter(
        (challenge) =>
          (type === "all" || challenge.challengeType === type) &&
          (!search ||
            `${challenge.displayTitle} ${challenge.category} ${challenge.purpose} ${challenge.tags.join(" ")}`
              .toLowerCase()
              .includes(search)),
      ),
    [search, type],
  );

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Challenges</Text>
      <Text style={globalStyles.subtitle}>
        Turn practical parenting skills into daily, weekly, or monthly actions with reflection and evidence.
      </Text>

      <View style={globalStyles.inlineRow}>
        <Text style={globalStyles.pill}>{safestepsParentChallenges.length} challenges</Text>
        <Text style={globalStyles.pill}>{categories} categories</Text>
      </View>

      <TextInput
        accessibilityLabel="Search challenges"
        value={query}
        onChangeText={setQuery}
        placeholder="Search challenges or skills"
        placeholderTextColor="#667085"
        style={globalStyles.input}
      />

      <View style={globalStyles.segmentedRow}>
        {TYPES.map((value) => (
          <Pressable
            key={value}
            onPress={() => setType(value)}
            style={type === value ? globalStyles.segmentSelected : globalStyles.segment}
          >
            <Text style={type === value ? globalStyles.segmentTextSelected : globalStyles.segmentText}>
              {value === "all" ? "All" : `${value[0].toUpperCase()}${value.slice(1)}`}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={globalStyles.mutedText}>{filtered.length} results</Text>
      {filtered.map((challenge) => (
        <Link
          key={challenge.id}
          href={{ pathname: "/challenges/[challengeId]", params: { challengeId: challenge.id } } as unknown as Href}
          asChild
        >
          <Pressable style={globalStyles.card}>
            <View style={globalStyles.inlineRow}>
              <Text style={globalStyles.pill}>{challenge.challengeType}</Text>
              <Text style={globalStyles.pill}>{challenge.estimatedTime}</Text>
            </View>
            <Text style={globalStyles.cardTitle}>{challenge.displayTitle}</Text>
            <Text style={globalStyles.mutedText}>{challenge.category}</Text>
            <Text style={globalStyles.cardText}>{challenge.purpose}</Text>
          </Pressable>
        </Link>
      ))}
      <AppBottomNav />
    </ScrollView>
  );
}
