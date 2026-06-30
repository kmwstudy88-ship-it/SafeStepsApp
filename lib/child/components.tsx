import React from "react";
import { Link, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type ChildScreenShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

type RouteCardProps = {
  title: string;
  description: string;
  href: string;
  badge?: string;
};

type InfoCardProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function ChildScreenShell({ title, subtitle, children }: ChildScreenShellProps) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>SafeSteps Child Space</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {children}
    </ScrollView>
  );
}

export function BackToChildHome() {
  return (
    <Link href={"/child" as Href} asChild>
      <Pressable style={styles.backButton}>
        <Text style={styles.backButtonText}>Back to Child Home</Text>
      </Pressable>
    </Link>
  );
}

export function RouteCard({ title, description, href, badge }: RouteCardProps) {
  return (
    <Link href={href as Href} asChild>
      <Pressable style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle}>{title}</Text>
          {badge ? <Text style={styles.badge}>{badge}</Text> : null}
        </View>
        <Text style={styles.cardDescription}>{description}</Text>
      </Pressable>
    </Link>
  );
}

export function InfoCard({ title, description, children }: InfoCardProps) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{title}</Text>
      {description ? <Text style={styles.infoDescription}>{description}</Text> : null}
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function PrivacyNotice() {
  return (
    <View style={styles.privacyBox}>
      <Text style={styles.privacyTitle}>Your choice matters here.</Text>
      <Text style={styles.privacyText}>
        This child space is private. Parents only see something when the child chooses to share it.
      </Text>
    </View>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.bulletList}>
      {items.map((item) => (
        <Text key={item} style={styles.bulletItem}>• {item}</Text>
      ))}
    </View>
  );
}

export function ChoiceButton({ label }: { label: string }) {
  return (
    <Pressable style={styles.choiceButton}>
      <Text style={styles.choiceButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EEF5EF",
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  header: {
    backgroundColor: "#D9E8DC",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#C4D7C8",
  },
  kicker: {
    fontSize: 13,
    fontWeight: "700",
    color: "#426B54",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#20382B",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4A5F52",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D7E2DA",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#20382B",
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#53665A",
    marginTop: 8,
  },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#315D44",
    backgroundColor: "#E1F0E6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D7E2DA",
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#20382B",
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#53665A",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#20382B",
    marginTop: 18,
    marginBottom: 10,
  },
  privacyBox: {
    backgroundColor: "#FFF9E8",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8DCA9",
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#4D4325",
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#5B5132",
    marginTop: 6,
  },
  bulletList: {
    marginTop: 10,
  },
  bulletItem: {
    fontSize: 14,
    lineHeight: 22,
    color: "#53665A",
  },
  choiceButton: {
    backgroundColor: "#315D44",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  choiceButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#D9E8DC",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#C4D7C8",
  },
  backButtonText: {
    color: "#20382B",
    fontWeight: "800",
    textAlign: "center",
  },
});