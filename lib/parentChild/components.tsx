import React from "react";
import { Link, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type ShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

type CardProps = {
  title: string;
  description?: string;
  badge?: string;
  href?: string;
  children?: React.ReactNode;
};

export function ParentChildShell({ title, subtitle, children }: ShellProps) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>SafeSteps Parent-Child Section</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Child-controlled sharing</Text>
        <Text style={styles.noticeText}>
          This section only shows items the child has chosen to share. Private child records stay hidden.
        </Text>
      </View>

      {children}
    </ScrollView>
  );
}

export function ParentChildCard({ title, description, badge, href, children }: CardProps) {
  const card = (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle}>{title}</Text>
        {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      </View>
      {description ? <Text style={styles.cardDescription}>{description}</Text> : null}
      {children}
    </View>
  );

  if (!href) {
    return card;
  }

  return (
    <Link href={href as Href} asChild>
      <Pressable>{card}</Pressable>
    </Link>
  );
}

export function BackToParentChildHome() {
  return (
    <Link href={"/parent-child" as Href} asChild>
      <Pressable style={styles.backButton}>
        <Text style={styles.backButtonText}>Back to Parent-Child Home</Text>
      </Pressable>
    </Link>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <View style={styles.error}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
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
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#C4D7C8",
  },
  kicker: {
    fontSize: 13,
    fontWeight: "800",
    color: "#426B54",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#20382B",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4A5F52",
    marginTop: 8,
  },
  notice: {
    backgroundColor: "#FFF9E8",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8DCA9",
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#4D4325",
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#5B5132",
    marginTop: 6,
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
    fontWeight: "900",
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
    fontWeight: "800",
    color: "#315D44",
    backgroundColor: "#E1F0E6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
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
    fontWeight: "900",
    textAlign: "center",
  },
  empty: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D7E2DA",
  },
  emptyText: {
    color: "#53665A",
    lineHeight: 21,
    textAlign: "center",
    fontWeight: "700",
  },
  error: {
    backgroundColor: "#FFECEC",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F0B4B4",
  },
  errorText: {
    color: "#7A2020",
    lineHeight: 21,
    fontWeight: "800",
    textAlign: "center",
  },
});