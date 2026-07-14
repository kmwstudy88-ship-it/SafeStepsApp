import { Link } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import { globalStyles } from "../../lib/styles";

const carerItems = [
  {
    title: "Child wellbeing observations",
    body: "Record sleep, mood, behaviour, routines, and changes before or after family contact.",
    href: "/child/evidence",
  },
  {
    title: "Visit preparation",
    body: "Use the child visit preparation tools before contact.",
    href: "/child/visits/prepare",
  },
  {
    title: "Visit reflection",
    body: "Capture child-centred observations after contact visits.",
    href: "/child/visits/reflection",
  },
  {
    title: "Message support team",
    body: "Use monitored communication routes for case-related observations and support needs.",
    href: "/notifications",
  },
];

export default function CarerPortalScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Foster / Kinship Carer Portal</Text>
      <Text style={globalStyles.subtitle}>
        A carer-facing place for child wellbeing observations, visit preparation, post-contact reflections, and support communication.
      </Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Privacy boundary</Text>
        <Text style={globalStyles.cardText}>
          Carer observations are for the assigned support team and statutory review. Parent scores and private parent reflections are not shown here.
        </Text>
      </View>

      {carerItems.map((item) => (
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
