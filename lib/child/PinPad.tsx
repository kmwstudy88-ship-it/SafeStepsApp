import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { safestepsLessonTheme } from "../safestepsLessonTheme";

interface PinPadProps {
  pinLength?: number;
  onComplete: (pin: string) => void;
  disabled?: boolean;
  errorMessage?: string | null;
}

export const PinPad: React.FC<PinPadProps> = ({
  pinLength = 4,
  onComplete,
  disabled = false,
  errorMessage = null,
}) => {
  const [pin, setPin] = useState<string>("");

  const handlePress = (digit: string) => {
    if (disabled || pin.length >= pinLength) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === pinLength) {
      onComplete(newPin);
    }
  };

  const handleDelete = () => {
    if (disabled || pin.length === 0) return;
    setPin(pin.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled) return;
    setPin("");
  };

  const digits = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["C", "0", "⌫"],
  ];

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {Array.from({ length: pinLength }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < pin.length ? styles.dotFilled : styles.dotEmpty,
              errorMessage ? styles.dotError : null,
            ]}
          />
        ))}
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.grid}>
        {digits.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((btn) => {
              const isDelete = btn === "⌫";
              const isClear = btn === "C";
              const isSpecial = isDelete || isClear;

              return (
                <TouchableOpacity
                  key={btn}
                  style={[styles.key, isSpecial && styles.specialKey]}
                  onPress={() => {
                    if (isDelete) handleDelete();
                    else if (isClear) handleClear();
                    else handlePress(btn);
                  }}
                  disabled={disabled}
                  activeOpacity={0.7}
                  accessibilityLabel={isDelete ? "Backspace" : isClear ? "Clear PIN" : `Digit ${btn}`}
                  accessibilityRole="button"
                >
                  <Text style={[styles.keyText, isSpecial && styles.specialKeyText]}>
                    {btn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: safestepsLessonTheme.colors.purpleDark,
  },
  dotEmpty: {
    backgroundColor: "transparent",
  },
  dotFilled: {
    backgroundColor: safestepsLessonTheme.colors.purpleDark,
  },
  dotError: {
    borderColor: "#E53E3E",
    backgroundColor: "#FED7D7",
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 18,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: safestepsLessonTheme.colors.lavender,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: safestepsLessonTheme.colors.border,
    ...safestepsLessonTheme.shadow,
  },
  specialKey: {
    backgroundColor: "#EDF2F7",
  },
  keyText: {
    fontSize: 26,
    fontWeight: "700",
    color: safestepsLessonTheme.colors.navy,
  },
  specialKeyText: {
    fontSize: 20,
    fontWeight: "600",
    color: safestepsLessonTheme.colors.purpleDark,
  },
});
