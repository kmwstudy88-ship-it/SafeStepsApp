import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  AccessibilitySpeechController,
  SpeechPlaybackState,
  SpeechRate,
} from "./accessibilityEngine";
import { safestepsLessonTheme } from "../safestepsLessonTheme";

interface ReadAloudBarProps {
  controller: AccessibilitySpeechController;
  onPlainLanguageToggle?: (enabled: boolean) => void;
  isPlainLanguage?: boolean;
}

export const ReadAloudBar: React.FC<ReadAloudBarProps> = ({
  controller,
  onPlainLanguageToggle,
  isPlainLanguage = false,
}) => {
  const [playbackState, setPlaybackState] = useState<SpeechPlaybackState>(controller.getState());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setPlaybackState);
    return () => unsubscribe();
  }, [controller]);

  const handleRateCycle = () => {
    const rates: SpeechRate[] = [0.75, 1.0, 1.25];
    const nextIndex = (rates.indexOf(playbackState.rate) + 1) % rates.length;
    controller.setRate(rates[nextIndex]);
  };

  return (
    <View style={styles.container} accessibilityRole="toolbar" accessibilityLabel="Read Aloud Controls">
      <View style={styles.topRow}>
        <View style={styles.modeGroup}>
          <Text style={styles.modeIcon}>🗣️</Text>
          <Text style={styles.modeLabel}>
            {playbackState.isPlaying
              ? "Reading aloud..."
              : playbackState.isPaused
              ? "Paused"
              : "Read Aloud Ready"}
          </Text>
        </View>

        {onPlainLanguageToggle && (
          <TouchableOpacity
            style={[styles.plainChip, isPlainLanguage && styles.plainChipActive]}
            onPress={() => onPlainLanguageToggle(!isPlainLanguage)}
            accessibilityRole="switch"
            accessibilityState={{ checked: isPlainLanguage }}
            accessibilityLabel="Toggle plain language mode"
          >
            <Text style={[styles.plainChipText, isPlainLanguage && styles.plainChipTextActive]}>
              {isPlainLanguage ? "✓ Plain English" : "Standard"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.controlRow}>
        {playbackState.isPlaying ? (
          <TouchableOpacity
            style={[styles.btn, styles.pauseBtn]}
            onPress={() => controller.pause()}
            accessibilityLabel="Pause read aloud"
          >
            <Text style={styles.btnText}>⏸ Pause</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, styles.playBtn]}
            onPress={() => controller.play()}
            accessibilityLabel="Play read aloud"
          >
            <Text style={styles.btnText}>▶ Read to Me</Text>
          </TouchableOpacity>
        )}

        {(playbackState.isPlaying || playbackState.isPaused) && (
          <TouchableOpacity
            style={[styles.btn, styles.stopBtn]}
            onPress={() => controller.stop()}
            accessibilityLabel="Stop read aloud"
          >
            <Text style={styles.btnTextSecondary}>⏹ Stop</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.rateBtn}
          onPress={handleRateCycle}
          accessibilityLabel={`Speech speed: ${playbackState.rate}x`}
        >
          <Text style={styles.rateText}>{playbackState.rate}x Speed</Text>
        </TouchableOpacity>
      </View>

      {playbackState.totalSegments > 0 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${playbackState.progressPercent}%` }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: safestepsLessonTheme.radius.medium,
    padding: 14,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    marginBottom: 16,
    ...safestepsLessonTheme.shadow,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modeIcon: {
    fontSize: 18,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: safestepsLessonTheme.colors.navy,
  },
  plainChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#EDF2F7",
  },
  plainChipActive: {
    backgroundColor: safestepsLessonTheme.colors.lavender,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.purpleDark,
  },
  plainChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A5568",
  },
  plainChipTextActive: {
    color: safestepsLessonTheme.colors.purpleDark,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: safestepsLessonTheme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtn: {
    backgroundColor: safestepsLessonTheme.colors.purpleDark,
  },
  pauseBtn: {
    backgroundColor: "#D69E2E",
  },
  stopBtn: {
    backgroundColor: "#EDF2F7",
  },
  btnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  btnTextSecondary: {
    color: safestepsLessonTheme.colors.navy,
    fontWeight: "600",
    fontSize: 14,
  },
  rateBtn: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  rateText: {
    fontSize: 12,
    fontWeight: "700",
    color: safestepsLessonTheme.colors.purpleDark,
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#EDF2F7",
    borderRadius: 2,
    marginTop: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: safestepsLessonTheme.colors.purpleDark,
  },
});
