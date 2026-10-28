import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { safestepsLessonTheme } from "../safestepsLessonTheme";

interface LetterPadProps {
  onComplete: (word: string) => void;
  disabled?: boolean;
  errorMessage?: string | null;
  placeholder?: string;
}

export const LetterPad: React.FC<LetterPadProps> = ({
  onComplete,
  disabled = false,
  errorMessage = null,
  placeholder = "e.g., sunshine, ocean, tiger",
}) => {
  const [word, setWord] = useState("");

  const handleSubmit = () => {
    if (disabled || !word.trim()) return;
    onComplete(word.trim().toLowerCase());
  };

  const handleClear = () => {
    if (disabled) return;
    setWord("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Enter your secret safe word or phrase:
      </Text>

      <TextInput
        style={[styles.input, errorMessage ? styles.inputError : null]}
        value={word}
        onChangeText={setWord}
        placeholder={placeholder}
        placeholderTextColor="#A0AEC0"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!disabled}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        accessibilityLabel="Secret Word Input"
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.btn, styles.clearBtn]}
          onPress={handleClear}
          disabled={disabled || !word}
        >
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.submitBtn, (!word.trim() || disabled) && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={disabled || !word.trim()}
        >
          <Text style={styles.submitBtnText}>Unlock Space</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 14,
    width: "100%",
  },
  instructions: {
    fontSize: 16,
    fontWeight: "700",
    color: safestepsLessonTheme.colors.navy,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    width: "100%",
    maxWidth: 320,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: safestepsLessonTheme.radius.medium,
    borderWidth: 2,
    borderColor: safestepsLessonTheme.colors.purpleDark,
    paddingHorizontal: 18,
    fontSize: 18,
    color: safestepsLessonTheme.colors.navy,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 12,
  },
  inputError: {
    borderColor: "#E53E3E",
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 10,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: safestepsLessonTheme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtn: {
    backgroundColor: "#EDF2F7",
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: safestepsLessonTheme.colors.navy,
  },
  submitBtn: {
    backgroundColor: safestepsLessonTheme.colors.purpleDark,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: safestepsLessonTheme.colors.white,
  },
});
