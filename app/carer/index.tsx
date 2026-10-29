import { Link } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { AppBottomNav } from "../../components/AppBottomNav";
import { globalStyles } from "../../lib/styles";

const carerItems = [
  {
    title: "Kinship & Foster Carer Clinical Toolkits",
    body: "Complete the Kinship/Foster Carer ProQOL check, manage secondary trauma boundaries, and access neuro-sleep sensory load presets.",
    href: "/ai-support-coach/specialized-toolkits",
  },
  {
    title: "Contact Visit Transition Coach",
    body: "Developmentally tailored visit transitions (0–4, 5–8, 9–12, 13–17 yrs), emotional buffering, and reunification evidence notes.",
    href: "/visits/transition-coach",
  },
  {
    title: "Child Three Houses & 5-Finger Safety Hand",
    body: "Explore the Signs of Safety House of Good Things, Worries, Dreams, and 5-Finger Safety Network adult contacts.",
    href: "/child/three-houses-playroom",
  },
  {
    title: "Kinship & Foster Carer AI Support Coach",
    body: "Trauma-informed co-regulation, contact handover buffering, sensory decompression, and carer respite coaching.",
    href: "/ai-support-coach",
  },
  {
    title: "Carer Strain & Protective Scales (50+ Instruments)",
    body: "Administer the Kinship/Foster Carer ProQOL, SDQ child summary, and family protective scales.",
    href: "/ai-support-coach/check-in-scales",
  },
  {
    title: "Child wellbeing observations",
    body: "Record sleep, mood, behaviour, routines, and changes before or after family contact.",
    href: "/child/evidence",
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
