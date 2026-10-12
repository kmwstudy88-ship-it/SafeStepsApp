import { Link } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import { globalStyles } from "../../lib/styles";

const advocateItems = [
  {
    title: "Shared progress summary",
    body: "Review progress surfaces the parent has chosen to share.",
    href: "/progress",
  },
  {
    title: "Shared reports",
    body: "Open report summaries and evidence-of-change records when explicitly shared.",
    href: "/reports",
  },
  {
    title: "Resources",
    body: "Access SafeSteps resources that help explain the program and parent rights in plain language.",
    href: "/resources",
  },
  {
    title: "Evidence uploads",
    body: "Support the parent to prepare evidence, without accessing unshared private case records.",
    href: "/evidence",
  },
];

export default function AdvocatePortalScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Independent Advocate Access</Text>
      <Text style={globalStyles.subtitle}>
        Limited, consent-based access for a parent&apos;s chosen support person. Every category should remain explicitly shared by the parent.
      </Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Consent rule</Text>
        <Text style={globalStyles.cardText}>
          Advocate access should default to no visibility. Shared records must be limited to categories the parent has chosen to disclose.
        </Text>
      </View>

      {advocateItems.map((item) => (
        <View key={item.title} style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>{item.title}</Text>
          <Text style={globalStyles.cardText}>{item.body}</Text>
          <Link href={item.href as never} asChild>
            <TouchableOpacity style={globalStyles.secondaryButton}>
              <Text style={globalStyles.secondaryButtonText}>Open</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ))}

      <AppBottomNav />
    </ScrollView>
  );
}
