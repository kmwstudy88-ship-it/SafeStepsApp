import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

function ActionCard({
  title,
  description,
  href,
  primary = false,
}: {
  title: string;
  description: string;
  href: "/assessments" | "/dashboard";
  primary?: boolean;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        style={{
          padding: 16,
          backgroundColor: primary ? "#2f5f4a" : "#f1f5f3",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: primary ? "#2f5f4a" : "#d8e5dd",
          gap: 6,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: primary ? "#ffffff" : "#102033",
          }}
        >
          {title}
        </Text>
        <Text style={{ color: primary ? "#ffffff" : "#33443a", lineHeight: 21 }}>
          {description}
        </Text>
      </Pressable>
    </Link>
  );
}

function SummaryItem({ title, body }: { title: string; body: string }) {
  return (
    <View
      style={{
        padding: 14,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#d8e5dd",
        gap: 5,
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: "bold", color: "#102033" }}>
        {title}
      </Text>
      <Text style={{ color: "#33443a", lineHeight: 21 }}>{body}</Text>
    </View>
  );
}

export default function WelcomeScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: 20,
        gap: 14,
        backgroundColor: "#eef5ef",
      }}
    >
      <Text style={{ fontSize: 32, fontWeight: "bold", color: "#102033" }}>
        Welcome to SafeSteps
      </Text>

      <Text style={{ fontSize: 16, lineHeight: 23, color: "#33443a" }}>
        SafeSteps helps families work through structured programs, practical
        tasks, reflections, evidence, and progress tracking in one place.
      </Text>

      <View
        style={{
          padding: 16,
          backgroundColor: "#dcefe8",
          borderRadius: 12,
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#102033" }}>
          What you can do here
        </Text>
        <Text style={{ color: "#33443a", lineHeight: 22 }}>
          Choose a SafeSteps pathway, complete lessons and reflections, record
          parenting practice, upload evidence, track growth, and build a clear
          record of progress over time.
        </Text>
      </View>

      <SummaryItem
        title="Programs and courses"
        body="Start a structured program such as reunification, Home Again, Back on Track, or a custom pathway."
      />
      <SummaryItem
        title="Tasks and evidence"
        body="Turn learning into real actions, then save notes, photos, documents, and practice records."
      />
      <SummaryItem
        title="Progress and reports"
        body="See completed lessons, reflections, certificates, and growth information in one connected dashboard."
      />

      <View style={{ gap: 10, marginTop: 4 }}>
        <ActionCard
          title="Start Intake and Assessment"
          description="Begin with your first check-in so SafeSteps can start building your progress record."
          href="/assessments"
          primary
        />
        <ActionCard
          title="Continue to Dashboard"
          description="Go straight to your SafeSteps dashboard and start exploring."
          href="/dashboard"
        />
      </View>
    </ScrollView>
  );
}
