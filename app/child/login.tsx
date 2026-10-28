import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useChildContext } from "../../lib/child/ChildContext";
import { PinPad } from "../../lib/child/PinPad";
import { PictureGrid } from "../../lib/child/PictureGrid";
import { LetterPad } from "../../lib/child/LetterPad";
import { safestepsLessonTheme } from "../../lib/safestepsLessonTheme";

export default function ChildLoginScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"picture" | "pin" | "letter">("picture");
  const [childIdInput, setChildIdInput] = useState<string>("demo-child-1");
  const [error, setError] = useState<string | null>(null);

  const { loginWithPin, loginWithPicture, loginWithLetter, isLoading } = useChildContext();

  const handlePinComplete = async (pin: string) => {
    setError(null);
    const result = await loginWithPin(childIdInput, pin);
    if (result.success) {
      router.replace("/child");
    } else {
      setError(result.error || "Incorrect PIN code.");
    }
  };

  const handlePictureComplete = async (sequence: string[]) => {
    setError(null);
    const result = await loginWithPicture(childIdInput, sequence);
    if (result.success) {
      router.replace("/child");
    } else {
      setError(result.error || "Incorrect picture sequence.");
    }
  };

  const handleLetterComplete = async (word: string) => {
    setError(null);
    const result = await loginWithLetter(childIdInput, word);
    if (result.success) {
      router.replace("/child");
    } else {
      setError(result.error || "Incorrect secret word.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logoBadge}>🌟 SAFESTEPS FOR KIDS</Text>
          <Text style={styles.title}>Welcome to Your Space</Text>
          <Text style={styles.subtitle}>
            Choose how you want to unlock your safe, private space today:
          </Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "picture" && styles.activeTab]}
            onPress={() => {
              setActiveTab("picture");
              setError(null);
            }}
          >
            <Text style={styles.tabEmoji}>🎨</Text>
            <Text style={[styles.tabText, activeTab === "picture" && styles.activeTabText]}>
              Pictures
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "pin" && styles.activeTab]}
            onPress={() => {
              setActiveTab("pin");
              setError(null);
            }}
          >
            <Text style={styles.tabEmoji}>🔢</Text>
            <Text style={[styles.tabText, activeTab === "pin" && styles.activeTabText]}>
              Number PIN
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "letter" && styles.activeTab]}
            onPress={() => {
              setActiveTab("letter");
              setError(null);
            }}
          >
            <Text style={styles.tabEmoji}>📝</Text>
            <Text style={[styles.tabText, activeTab === "letter" && styles.activeTabText]}>
              Secret Word
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.padCard}>
          {activeTab === "picture" && (
            <PictureGrid
              onComplete={handlePictureComplete}
              disabled={isLoading}
              errorMessage={error}
            />
          )}

          {activeTab === "pin" && (
            <PinPad
              onComplete={handlePinComplete}
              disabled={isLoading}
              errorMessage={error}
            />
          )}

          {activeTab === "letter" && (
            <LetterPad
              onComplete={handleLetterComplete}
              disabled={isLoading}
              errorMessage={error}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push("/")}
        >
          <Text style={styles.backBtnText}>Exit to Main App</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: safestepsLessonTheme.colors.background,
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  logoBadge: {
    fontSize: 12,
    fontWeight: "800",
    color: safestepsLessonTheme.colors.purpleDark,
    backgroundColor: safestepsLessonTheme.colors.lavender,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: safestepsLessonTheme.colors.navy,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: safestepsLessonTheme.colors.navy,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 300,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#EDF2F7",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeTab: {
    backgroundColor: safestepsLessonTheme.colors.lavender,
    borderColor: safestepsLessonTheme.colors.purpleDark,
  },
  tabEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4A5568",
  },
  activeTabText: {
    color: safestepsLessonTheme.colors.purpleDark,
  },
  padCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: safestepsLessonTheme.radius.large,
    padding: 20,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    ...safestepsLessonTheme.shadow,
  },
  backBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: safestepsLessonTheme.colors.navy,
  },
});
