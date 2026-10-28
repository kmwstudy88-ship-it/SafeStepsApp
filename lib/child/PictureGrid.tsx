import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { safestepsLessonTheme } from "../safestepsLessonTheme";
import { PictureOption, DEFAULT_PICTURE_OPTIONS } from "./childData";

export { PictureOption, DEFAULT_PICTURE_OPTIONS };

interface PictureGridProps {
  options?: PictureOption[];
  sequenceLength?: number;
  onComplete: (sequence: string[]) => void;
  disabled?: boolean;
  errorMessage?: string | null;
}

export const PictureGrid: React.FC<PictureGridProps> = ({
  options = DEFAULT_PICTURE_OPTIONS,
  sequenceLength = 3,
  onComplete,
  disabled = false,
  errorMessage = null,
}) => {
  const [selectedSequence, setSelectedSequence] = useState<PictureOption[]>([]);

  const handleSelect = (option: PictureOption) => {
    if (disabled || selectedSequence.length >= sequenceLength) return;
    const next = [...selectedSequence, option];
    setSelectedSequence(next);
    if (next.length === sequenceLength) {
      onComplete(next.map((o) => o.id));
    }
  };

  const handleReset = () => {
    if (disabled) return;
    setSelectedSequence([]);
  };

  const handleRemoveLast = () => {
    if (disabled || selectedSequence.length === 0) return;
    setSelectedSequence(selectedSequence.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Pick your {sequenceLength} secret pictures in order:
      </Text>

      <View style={styles.sequenceSlots}>
        {Array.from({ length: sequenceLength }).map((_, i) => {
          const item = selectedSequence[i];
          return (
            <View
              key={i}
              style={[
                styles.slot,
                item ? styles.slotFilled : styles.slotEmpty,
                errorMessage ? styles.slotError : null,
              ]}
            >
              {item ? (
                <Text style={styles.slotEmoji}>{item.emoji}</Text>
              ) : (
                <Text style={styles.slotPlaceholder}>{i + 1}</Text>
              )}
            </View>
          );
        })}
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.grid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.pictureCard}
            onPress={() => handleSelect(option)}
            disabled={disabled}
            activeOpacity={0.7}
            accessibilityLabel={option.label}
            accessibilityRole="button"
          >
            <Text style={styles.pictureEmoji}>{option.emoji}</Text>
            <Text style={styles.pictureLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleRemoveLast}
          disabled={disabled || selectedSequence.length === 0}
        >
          <Text style={styles.actionBtnText}>Undo Last</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionResetBtn]}
          onPress={handleReset}
          disabled={disabled || selectedSequence.length === 0}
        >
          <Text style={styles.actionResetText}>Start Over</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
  },
  instructions: {
    fontSize: 16,
    fontWeight: "700",
    color: safestepsLessonTheme.colors.navy,
    marginBottom: 16,
    textAlign: "center",
  },
  sequenceSlots: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
  },
  slot: {
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: safestepsLessonTheme.colors.purpleDark,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7FAFC",
  },
  slotEmpty: {
    borderStyle: "dashed",
  },
  slotFilled: {
    backgroundColor: safestepsLessonTheme.colors.lavender,
  },
  slotError: {
    borderColor: "#E53E3E",
    backgroundColor: "#FFF5F5",
  },
  slotEmoji: {
    fontSize: 32,
  },
  slotPlaceholder: {
    fontSize: 18,
    fontWeight: "700",
    color: "#A0AEC0",
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    maxWidth: 340,
  },
  pictureCard: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: safestepsLessonTheme.colors.card,
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    ...safestepsLessonTheme.shadow,
  },
  pictureEmoji: {
    fontSize: 30,
    marginBottom: 2,
  },
  pictureLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: safestepsLessonTheme.colors.navy,
  },
  actionRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 18,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#EDF2F7",
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: safestepsLessonTheme.colors.navy,
  },
  actionResetBtn: {
    backgroundColor: "#FED7D7",
  },
  actionResetText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C53030",
  },
});
