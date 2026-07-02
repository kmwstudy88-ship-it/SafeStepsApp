import { Link, type Href } from "expo-router";
import React from "react";
import { ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export const assessmentColors = {
  background: "#F7F4EC",
  card: "#FFFFFF",
  border: "#D8E5DD",
  teal: "#0D655F",
  tealDark: "#083F3B",
  sage: "#DCEFE8",
  sageDark: "#426D5E",
  amber: "#F7E7C2",
  amberText: "#7A4E00",
  red: "#F7D6D2",
  redText: "#9E2F25",
  charcoal: "#263238",
  muted: "#60706D",
};

export function AssessmentScreenShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <ImageBackground
      source={require("../assets/safesteps-course-background.png")}
      resizeMode="cover"
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.shell}>
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.brand}>SAFE STEPS</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.profileBadge}>Katrina Watts</Text>
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </View>
    </ImageBackground>
  );
}

export function AssessmentCard({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "warning" | "success" | "risk";
}) {
  return <View style={[styles.card, toneStyles[tone]]}>{children}</View>;
}

export function AssessmentButton({
  label,
  href,
  tone = "primary",
}: {
  label: string;
  href?: string;
  tone?: "primary" | "secondary" | "warning" | "success";
}) {
  const flattenedButtonStyle = StyleSheet.flatten([styles.button, buttonStyles[tone]]);
  const button = (
    <Pressable style={flattenedButtonStyle}>
      <Text style={[styles.buttonText, tone === "secondary" && styles.secondaryButtonText]}>
        {label}
      </Text>
    </Pressable>
  );

  if (!href) return button;

  return (
    <Link href={href as Href} asChild>
      {button}
    </Link>
  );
}

export function Field({
  label,
  placeholder,
  multiline = false,
}: {
  label: string;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        multiline={multiline}
        style={[styles.input, multiline && styles.textArea]}
      />
    </View>
  );
}

export function ChipList({ items }: { items: readonly string[] }) {
  return (
    <View style={styles.chipRow}>
      {items.map((item) => (
        <Text key={item} style={styles.chip}>
          {item}
        </Text>
      ))}
    </View>
  );
}

export function StatusPill({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "success" | "warning" | "risk";
}) {
  return <Text style={[styles.pill, pillStyles[tone]]}>{label}</Text>;
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, value))}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexGrow: 1,
    gap: 14,
    padding: 20,
    backgroundColor: "rgba(247, 244, 236, 0.8)",
  },
  background: {
    flex: 1,
    backgroundColor: assessmentColors.background,
  },
  backgroundImage: {
    opacity: 0.32,
  },
  headerBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingBottom: 4,
  },
  brand: {
    color: assessmentColors.teal,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
  },
  title: {
    color: assessmentColors.charcoal,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: assessmentColors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  sectionTitle: {
    color: assessmentColors.charcoal,
    fontSize: 21,
    fontWeight: "800",
    marginTop: 4,
  },
  card: {
    gap: 10,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    boxShadow: "0 8px 14px rgba(16, 63, 59, 0.08)",
  },
  profileBadge: {
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    color: assessmentColors.charcoal,
    fontSize: 13,
    fontWeight: "800",
  },
  cardTitle: {
    color: assessmentColors.charcoal,
    fontSize: 19,
    fontWeight: "800",
  },
  cardText: {
    color: assessmentColors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  splitItem: {
    flexGrow: 1,
    flexBasis: 180,
    gap: 3,
  },
  metaLabel: {
    color: assessmentColors.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  metaValue: {
    color: assessmentColors.charcoal,
    fontSize: 15,
    fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  button: {
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButtonText: {
    color: assessmentColors.charcoal,
  },
  field: {
    gap: 6,
  },
  label: {
    color: assessmentColors.charcoal,
    fontSize: 14,
    fontWeight: "800",
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: assessmentColors.charcoal,
    fontSize: 15,
  },
  textArea: {
    minHeight: 92,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: assessmentColors.sage,
    color: assessmentColors.tealDark,
    fontSize: 13,
    fontWeight: "700",
  },
  pill: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    height: 10,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#E7E3D9",
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: assessmentColors.teal,
  },
});

export const assessmentStyles = styles;

const toneStyles = StyleSheet.create({
  default: {},
  warning: {
    borderColor: "#E5C879",
    backgroundColor: assessmentColors.amber,
  },
  success: {
    borderColor: "#B8D8C7",
    backgroundColor: "#EEF8F1",
  },
  risk: {
    borderColor: "#E4AAA3",
    backgroundColor: assessmentColors.red,
  },
});

const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: assessmentColors.teal,
  },
  secondary: {
    backgroundColor: assessmentColors.sage,
  },
  warning: {
    backgroundColor: "#B7791F",
  },
  success: {
    backgroundColor: assessmentColors.sageDark,
  },
});

const pillStyles = StyleSheet.create({
  default: {
    color: assessmentColors.tealDark,
    backgroundColor: assessmentColors.sage,
  },
  success: {
    color: "#1F5C3D",
    backgroundColor: "#DCEFE3",
  },
  warning: {
    color: assessmentColors.amberText,
    backgroundColor: assessmentColors.amber,
  },
  risk: {
    color: assessmentColors.redText,
    backgroundColor: assessmentColors.red,
  },
});
