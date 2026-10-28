import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

interface DiscreetQuickExitBarProps {
  onExit?: () => void;
  label?: string;
}

export const DiscreetQuickExitBar: React.FC<DiscreetQuickExitBarProps> = ({
  onExit,
  label = "Quick Exit (Discreet)",
}) => {
  const router = useRouter();

  const handleQuickExit = () => {
    if (onExit) {
      try {
        onExit();
      } catch (err) {
        console.error("Quick exit callback error:", err);
      }
    }
    // Navigate immediately to discreet disguise mode
    router.replace("/discreet");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.exitBtn}
        onPress={handleQuickExit}
        accessibilityRole="button"
        accessibilityLabel="Emergency quick exit to disguise screen"
        accessibilityHint="Instantly hides sensitive information and shows a neutral screen"
      >
        <Text style={styles.exitIcon}>⚡</Text>
        <Text style={styles.exitText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF5F5",
    borderBottomWidth: 1,
    borderBottomColor: "#FED7D7",
  },
  exitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E53E3E",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  exitIcon: {
    fontSize: 16,
  },
  exitText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
