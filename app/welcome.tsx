import { Link, router } from "expo-router";
import { useState } from "react";
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
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);

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

      <View
        style={{
          padding: 16,
          backgroundColor: "#ffffff",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#d8e5dd",
          gap: 14,
          marginTop: 4,
        }}
      >
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedDisclaimer }}
          onPress={() => setAcceptedDisclaimer((current) => !current)}
          style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 5,
              borderWidth: 2,
              borderColor: acceptedDisclaimer ? "#2f5f4a" : "#8aa096",
              backgroundColor: acceptedDisclaimer ? "#2f5f4a" : "#ffffff",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 1,
            }}
          >
            {acceptedDisclaimer ? (
              <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 16 }}>X</Text>
            ) : null}
          </View>
          <Text style={{ flex: 1, color: "#33443a", lineHeight: 22 }}>
            I understand that SAFE STEPS is a support and documentation tool, and its use does not
            guarantee or promise that family reunification will occur. All decisions regarding
            reunification remain with the relevant authorities.
          </Text>
        </Pressable>

        <Pressable
          disabled={!acceptedDisclaimer}
          onPress={() => router.push("/assessments")}
          style={{
            padding: 16,
            backgroundColor: acceptedDisclaimer ? "#2f5f4a" : "#c7d1cb",
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: acceptedDisclaimer ? "#ffffff" : "#64736b", fontWeight: "bold" }}>
            Get Started
          </Text>
        </Pressable>
      </View>

      <View style={{ gap: 10 }}>
        <ActionCard
          title="Continue to Dashboard"
          description="Go straight to your SafeSteps dashboard and start exploring."
          href="/dashboard"
        />
      </View>
    </ScrollView>
  );
}
