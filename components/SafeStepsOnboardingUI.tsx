import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, type Href } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

const backgroundAsset = require("../assets/safesteps-course-background.png");

export const onboardingColors = {
  cream: "#FFFDF7",
  teal: "#007178",
  tealDark: "#014B55",
  sage: "#DCE8D3",
  sageDark: "#6C8B72",
  gold: "#D7A33D",
  coral: "#D76E55",
  ink: "#11353B",
  muted: "#526A67",
  border: "#E2D8C2",
  card: "rgba(255,255,255,0.88)",
};

export function OnboardingShell({
  children,
  step,
  totalSteps = 6,
  compact = false,
}: {
  children: React.ReactNode;
  step?: number;
  totalSteps?: number;
  compact?: boolean;
}) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.screen}
      contentContainerStyle={[styles.content, compact && styles.compactContent]}
    >
      <Image source={backgroundAsset} style={styles.backgroundImage} contentFit="cover" />
      <View style={styles.topLeaves}>
        <Ionicons name="leaf" size={24} color="#6E9B86" />
        <Ionicons name="ellipse" size={10} color="#A2C1B0" />
        <Ionicons name="leaf-outline" size={30} color="#3C877C" />
      </View>
      {step ? <ProgressDots current={step} total={totalSteps} /> : null}
      {children}
    </ScrollView>
  );
}

export function BrandMark({ large = false }: { large?: boolean }) {
  return (
    <View style={styles.brandWrap}>
      <View style={[styles.brandIcon, large && styles.brandIconLarge]}>
        <Ionicons name="leaf" size={large ? 34 : 22} color="#EFFFF4" />
        <Ionicons name="checkmark" size={large ? 20 : 14} color="#EFFFF4" style={styles.brandCheck} />
      </View>
      <Text style={[styles.brandText, large && styles.brandTextLarge]}>SafeSteps</Text>
    </View>
  );
}

export function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.dots} accessibilityLabel={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, index) => {
        const filled = index + 1 <= current;
        return <View key={index} style={[styles.dot, filled && styles.dotFilled]} />;
      })}
    </View>
  );
}

export function NatureScene({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.scene, compact && styles.sceneCompact]}>
      <View style={styles.sun} />
      <View style={styles.hillBack} />
      <View style={styles.hillFront} />
      <View style={styles.path}>
        {[0, 1, 2, 3].map((item) => (
          <View key={item} style={[styles.pathStone, { top: 22 + item * 42, left: 96 - item * 12 }]} />
        ))}
      </View>
      <View style={styles.familyGroup}>
        <Person height={70} />
        <Person height={46} child />
        <Person height={62} />
      </View>
      <Ionicons name="leaf-outline" size={34} color="#6E9B86" style={styles.sceneLeaf} />
    </View>
  );
}

function Person({ height, child = false }: { height: number; child?: boolean }) {
  return (
    <View style={[styles.person, { height }]}>
      <View style={[styles.personHead, child && styles.childHead]} />
      <View style={[styles.personBody, child && styles.childBody]} />
    </View>
  );
}

export function PrimaryButton({
  label,
  href,
  onPress,
  disabled = false,
}: {
  label: string;
  href?: Href;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const button = (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.primaryButton, disabled && styles.disabledButton]}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );

  return href ? (
    <Link href={href} asChild>
      {button}
    </Link>
  ) : (
    button
  );
}

export function SecondaryButton({ label, href }: { label: string; href: Href }) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="button" style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>{label}</Text>
      </Pressable>
    </Link>
  );
}

export function TextButton({ label, href }: { label: string; href: Href }) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="button" style={styles.textButton}>
        <Text style={styles.textButtonLabel}>{label}</Text>
      </Pressable>
    </Link>
  );
}

export function FeatureTile({
  icon,
  title,
  body,
  tone = "sage",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  tone?: "sage" | "coral" | "teal" | "gold";
}) {
  return (
    <View style={styles.featureTile}>
      <View style={[styles.featureIcon, styles[`${tone}Tone`]]}>
        <Ionicons name={icon} size={34} color={tone === "teal" ? "#FFFFFF" : onboardingColors.tealDark} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureBody}>{body}</Text>
    </View>
  );
}

export function InfoRow({
  icon,
  title,
  body,
  tone = "teal",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  tone?: "teal" | "sage" | "coral";
}) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, styles[`${tone}Tone`]]}>
        <Ionicons name={icon} size={26} color={tone === "teal" ? "#FFFFFF" : onboardingColors.tealDark} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoBody}>{body}</Text>
      </View>
    </View>
  );
}

export function FormInput({
  icon,
  ...props
}: TextInputProps & {
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.inputWrap}>
      <Ionicons name={icon} size={20} color={onboardingColors.muted} />
      <TextInput placeholderTextColor="#7F908D" style={styles.input} {...props} />
    </View>
  );
}

export function PreferenceRow({
  icon,
  label,
  detail,
  value,
  onValueChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
}) {
  return (
    <View style={styles.preferenceRow}>
      <Ionicons name={icon} size={20} color={onboardingColors.ink} />
      <Text style={styles.preferenceLabel}>{label}</Text>
      {detail ? <Text style={styles.preferenceDetail}>{detail}</Text> : null}
      {onValueChange ? (
        <Switch
          value={Boolean(value)}
          onValueChange={onValueChange}
          trackColor={{ false: "#D7DDD8", true: "#9CCCC1" }}
          thumbColor={value ? onboardingColors.teal : "#FFFFFF"}
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={onboardingColors.muted} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: onboardingColors.cream,
  },
  content: {
    alignSelf: "center",
    gap: 18,
    maxWidth: 460,
    minHeight: "100%",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 32,
    width: "100%",
  },
  compactContent: {
    justifyContent: "center",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
    opacity: 0.23,
  },
  topLeaves: {
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
    minHeight: 34,
  },
  brandWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  brandIcon: {
    alignItems: "center",
    backgroundColor: onboardingColors.teal,
    borderRadius: 999,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  brandIconLarge: {
    height: 66,
    width: 66,
  },
  brandCheck: {
    bottom: 7,
    position: "absolute",
    right: 7,
  },
  brandText: {
    color: onboardingColors.tealDark,
    fontSize: 27,
    fontWeight: "900",
  },
  brandTextLarge: {
    fontSize: 48,
  },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  dot: {
    backgroundColor: "#F5F0E5",
    borderColor: "#B8C1B8",
    borderRadius: 999,
    borderWidth: 1,
    height: 12,
    width: 12,
  },
  dotFilled: {
    backgroundColor: onboardingColors.teal,
    borderColor: onboardingColors.teal,
  },
  scene: {
    alignSelf: "center",
    height: 230,
    overflow: "hidden",
    width: "100%",
  },
  sceneCompact: {
    height: 168,
  },
  sun: {
    backgroundColor: "#F3CA72",
    borderRadius: 999,
    height: 38,
    position: "absolute",
    right: 60,
    top: 34,
    width: 38,
  },
  hillBack: {
    backgroundColor: "rgba(166, 197, 180, 0.38)",
    borderTopLeftRadius: 160,
    borderTopRightRadius: 160,
    bottom: 18,
    height: 110,
    left: -60,
    position: "absolute",
    right: -60,
  },
  hillFront: {
    backgroundColor: "rgba(206, 225, 211, 0.82)",
    borderTopLeftRadius: 150,
    borderTopRightRadius: 150,
    bottom: 0,
    height: 82,
    left: -40,
    position: "absolute",
    right: -30,
  },
  path: {
    bottom: 15,
    left: 84,
    position: "absolute",
    width: 180,
  },
  pathStone: {
    backgroundColor: "rgba(73, 133, 128, 0.42)",
    borderRadius: 999,
    height: 20,
    position: "absolute",
    width: 72,
  },
  familyGroup: {
    alignItems: "flex-end",
    bottom: 42,
    flexDirection: "row",
    gap: 6,
    left: 126,
    position: "absolute",
  },
  person: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: 24,
  },
  personHead: {
    backgroundColor: onboardingColors.tealDark,
    borderRadius: 999,
    height: 14,
    width: 14,
  },
  childHead: {
    height: 10,
    width: 10,
  },
  personBody: {
    backgroundColor: onboardingColors.tealDark,
    borderRadius: 999,
    flex: 1,
    marginTop: 3,
    width: 14,
  },
  childBody: {
    width: 10,
  },
  sceneLeaf: {
    bottom: 18,
    position: "absolute",
    right: 20,
    transform: [{ rotate: "-25deg" }],
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: onboardingColors.teal,
    borderRadius: 999,
    minHeight: 58,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  disabledButton: {
    backgroundColor: "#9EB7B4",
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderColor: onboardingColors.teal,
    borderRadius: 999,
    borderWidth: 1.5,
    minHeight: 54,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  secondaryText: {
    color: onboardingColors.tealDark,
    fontSize: 16,
    fontWeight: "900",
  },
  textButton: {
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  textButtonLabel: {
    color: onboardingColors.tealDark,
    fontSize: 16,
    fontWeight: "900",
  },
  featureTile: {
    alignItems: "center",
    backgroundColor: onboardingColors.card,
    borderColor: onboardingColors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: 8,
    minHeight: 150,
    padding: 14,
  },
  featureIcon: {
    alignItems: "center",
    borderRadius: 999,
    height: 66,
    justifyContent: "center",
    width: 66,
  },
  sageTone: {
    backgroundColor: "#CEE1C4",
  },
  coralTone: {
    backgroundColor: "#F0B4A4",
  },
  tealTone: {
    backgroundColor: onboardingColors.teal,
  },
  goldTone: {
    backgroundColor: "#F2DCA8",
  },
  featureTitle: {
    color: onboardingColors.tealDark,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  featureBody: {
    color: onboardingColors.ink,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  infoRow: {
    alignItems: "center",
    backgroundColor: onboardingColors.card,
    borderColor: onboardingColors.gold,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 14,
  },
  infoIcon: {
    alignItems: "center",
    borderRadius: 999,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  infoCopy: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    color: onboardingColors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  infoBody: {
    color: onboardingColors.ink,
    fontSize: 13,
    lineHeight: 18,
  },
  inputWrap: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.86)",
    borderColor: onboardingColors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 12,
  },
  input: {
    color: onboardingColors.ink,
    flex: 1,
    fontSize: 15,
    minHeight: 50,
  },
  preferenceRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.74)",
    borderBottomColor: "#E7E0D2",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  preferenceLabel: {
    color: onboardingColors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
  },
  preferenceDetail: {
    color: onboardingColors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
});

export const onboardingStyles = styles;
