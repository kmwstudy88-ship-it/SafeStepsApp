import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
  useWindowDimensions,
} from "react-native";

import {
  buildSequenceKnowledgeSubmission,
  getSequenceKnowledgeClientAssessment,
  type SequenceKnowledgeClientItem,
  type SequenceKnowledgeSubmission,
} from "../../lib/data/sequenceKnowledgeClientAssessments";

const assessment = getSequenceKnowledgeClientAssessment();

export default function SequenceKnowledgeScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [orderedItems, setOrderedItems] = React.useState(
    assessment.items.filter((item) => item.kind === "ordered_step"),
  );
  const [excludedItems, setExcludedItems] = React.useState(
    assessment.items.filter((item) => item.kind === "leave_out"),
  );
  const [submission, setSubmission] = React.useState<SequenceKnowledgeSubmission | null>(null);
  const [status, setStatus] = React.useState<"idle" | "incomplete" | "ready">("idle");

  const progressPercent = `${Math.round(assessment.progress * 100)}%` as ViewStyle["width"];
  const canSubmit = orderedItems.length >= 5 && excludedItems.length >= 1;

  function moveOrderedItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= orderedItems.length) {
      return;
    }

    setOrderedItems((current) => {
      const updated = [...current];
      const [movedItem] = updated.splice(index, 1);
      updated.splice(nextIndex, 0, movedItem);
      return updated;
    });
    setStatus("idle");
  }

  function sendToLeaveOut(item: SequenceKnowledgeClientItem) {
    setOrderedItems((current) => current.filter((candidate) => candidate.id !== item.id));
    setExcludedItems((current) => [...current, item]);
    setStatus("idle");
  }

  function restoreToSequence(item: SequenceKnowledgeClientItem) {
    setExcludedItems((current) => current.filter((candidate) => candidate.id !== item.id));
    setOrderedItems((current) => [...current, item]);
    setStatus("idle");
  }

  function submitSequence() {
    if (!canSubmit) {
      setStatus("incomplete");
      return;
    }

    setSubmission(buildSequenceKnowledgeSubmission(assessment.id, orderedItems, excludedItems));
    setStatus("ready");
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.screen}
      contentContainerStyle={[styles.content, isWide && styles.contentWide]}
    >
      <View style={styles.topWash} />
      <View style={styles.bottomWash} />
      <View style={styles.leafClusterTop}>
        <Ionicons name="leaf-outline" size={28} color="#6D8B63" />
        <Ionicons name="leaf-outline" size={20} color="#A7B98A" />
      </View>
      <View style={styles.leafClusterBottom}>
        <Ionicons name="leaf-outline" size={24} color="#6D8B63" />
        <Ionicons name="ellipse" size={9} color="#D4B25D" />
      </View>

      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="#04545A" />
        </Pressable>
        <View style={styles.brand}>
          <View style={styles.logoMark}>
            <Ionicons name="leaf" size={24} color="#EFFFF4" />
            <Ionicons name="checkmark" size={16} color="#EFFFF4" style={styles.logoCheck} />
          </View>
          <Text style={styles.brandText}>SafeSteps</Text>
        </View>
        <Pressable accessibilityLabel="Open menu" style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#04545A" />
        </Pressable>
      </View>

      <View style={styles.progressBlock}>
        <Text style={styles.questionText}>
          Question {assessment.questionNumber} of {assessment.totalQuestions}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progressPercent }]} />
        </View>
      </View>

      <View style={styles.labelPill}>
        <Text style={styles.labelText}>{assessment.label.toUpperCase()}</Text>
      </View>

      <Text style={styles.title}>{assessment.title}</Text>

      <View style={styles.scenarioCard}>
        <View style={styles.scenarioIcon}>
          <Ionicons name="home-outline" size={30} color="#356E5A" />
        </View>
        <View style={styles.scenarioCopy}>
          <Text selectable style={styles.contextText}>
            {assessment.contextLabel}
          </Text>
          <Text selectable style={styles.scenarioText}>
            {assessment.scenario}
          </Text>
        </View>
      </View>

      <Text style={styles.instruction}>{assessment.instruction}</Text>

      <View style={styles.sequenceList}>
        {orderedItems.map((item, index) => (
          <View key={item.id} style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text selectable style={styles.stepText}>
              {item.text}
            </Text>
            <View style={styles.stepTools}>
              <Ionicons name="reorder-three-outline" size={26} color="#477A9F" />
              <View style={styles.toolDivider} />
              <View style={styles.arrowStack}>
                <Pressable
                  accessibilityLabel={`Move step ${index + 1} up`}
                  disabled={index === 0}
                  onPress={() => moveOrderedItem(index, -1)}
                  style={[styles.arrowButton, index === 0 && styles.disabledArrow]}
                >
                  <Ionicons name="chevron-up" size={21} color="#2F6991" />
                </Pressable>
                <Pressable
                  accessibilityLabel={`Move step ${index + 1} down`}
                  disabled={index === orderedItems.length - 1}
                  onPress={() => moveOrderedItem(index, 1)}
                  style={[
                    styles.arrowButton,
                    index === orderedItems.length - 1 && styles.disabledArrow,
                  ]}
                >
                  <Ionicons name="chevron-down" size={21} color="#2F6991" />
                </Pressable>
              </View>
              <Pressable
                accessibilityLabel={`Move ${item.text} to leave out`}
                onPress={() => sendToLeaveOut(item)}
                style={styles.leaveOutIconButton}
              >
                <Ionicons name="remove-circle-outline" size={23} color="#B88310" />
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.leaveOutBox}>
        <View style={styles.leaveOutHeading}>
          <View style={styles.leaveOutLine} />
          <Text style={styles.leaveOutTitle}>LEAVE OUT</Text>
          <View style={styles.leaveOutLine} />
        </View>
        {excludedItems.map((item) => (
          <Pressable
            key={item.id}
            accessibilityLabel={`Return ${item.text} to the sequence`}
            onPress={() => restoreToSequence(item)}
            style={styles.excludedCard}
          >
            <View style={styles.excludedBadge}>
              <Ionicons name="remove" size={22} color="#B88310" />
            </View>
            <Text selectable style={styles.excludedText}>
              {item.text}
            </Text>
            <Ionicons name="reorder-three-outline" size={24} color="#477A9F" />
          </Pressable>
        ))}
      </View>

      {status !== "idle" ? (
        <View style={[styles.statusCard, status === "ready" ? styles.readyStatus : styles.incompleteStatus]}>
          <Ionicons
            name={status === "ready" ? "checkmark-circle" : "alert-circle-outline"}
            size={20}
            color={status === "ready" ? "#2D6D57" : "#A76217"}
          />
          <Text selectable style={styles.statusText}>
            {status === "ready"
              ? `Response ready for review: ${submission?.orderedStepIds.length ?? 0} ordered, ${submission?.excludedStepIds.length ?? 0} left out.`
              : "Place five response steps in order and leave out at least one action."}
          </Text>
        </View>
      ) : null}

      <Pressable accessibilityRole="button" onPress={submitSequence} style={styles.submitButton}>
        <Text style={styles.submitText}>Check my answer</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFDF6",
  },
  content: {
    gap: 18,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 32,
  },
  contentWide: {
    alignSelf: "center",
    maxWidth: 520,
    width: "100%",
  },
  topWash: {
    position: "absolute",
    left: -34,
    top: -18,
    width: 190,
    height: 150,
    borderBottomRightRadius: 120,
    backgroundColor: "rgba(193, 214, 182, 0.34)",
  },
  bottomWash: {
    position: "absolute",
    right: -46,
    bottom: -32,
    width: 210,
    height: 160,
    borderTopLeftRadius: 130,
    backgroundColor: "rgba(210, 226, 221, 0.42)",
  },
  leafClusterTop: {
    position: "absolute",
    right: 20,
    top: 12,
    flexDirection: "row",
    gap: 5,
    transform: [{ rotate: "18deg" }],
  },
  leafClusterBottom: {
    position: "absolute",
    left: 22,
    bottom: 14,
    flexDirection: "row",
    gap: 7,
    transform: [{ rotate: "-18deg" }],
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  brand: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  logoMark: {
    alignItems: "center",
    backgroundColor: "#2D6D57",
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  logoCheck: {
    position: "absolute",
    bottom: 8,
    right: 7,
  },
  brandText: {
    color: "#063F45",
    fontSize: 34,
    fontWeight: "800",
  },
  progressBlock: {
    gap: 10,
  },
  questionText: {
    color: "#073F46",
    fontSize: 16,
    fontWeight: "800",
  },
  progressTrack: {
    backgroundColor: "#C9DDDB",
    borderRadius: 999,
    height: 9,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: "#006D73",
    borderRadius: 999,
    height: "100%",
  },
  labelPill: {
    alignSelf: "flex-start",
    backgroundColor: "#DCE8CF",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  labelText: {
    color: "#0B4944",
    fontSize: 15,
    fontWeight: "900",
  },
  title: {
    color: "#063F45",
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 43,
  },
  scenarioCard: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    borderColor: "#D8E2C6",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 16,
    padding: 18,
  },
  scenarioIcon: {
    alignItems: "center",
    backgroundColor: "#DFEBD8",
    borderRadius: 999,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  scenarioCopy: {
    flex: 1,
    gap: 5,
  },
  contextText: {
    color: "#547150",
    fontSize: 13,
    fontWeight: "900",
  },
  scenarioText: {
    color: "#063F45",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
  },
  instruction: {
    color: "#073F46",
    fontSize: 21,
    fontWeight: "700",
    lineHeight: 28,
  },
  sequenceList: {
    gap: 10,
  },
  stepCard: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderColor: "#E3B64B",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 86,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stepNumber: {
    alignItems: "center",
    backgroundColor: "#DCE8CF",
    borderColor: "#CBDAB9",
    borderRadius: 999,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  stepNumberText: {
    color: "#0B4944",
    fontSize: 28,
    fontWeight: "900",
  },
  stepText: {
    color: "#073F46",
    flex: 1,
    fontSize: 21,
    fontWeight: "800",
    lineHeight: 27,
  },
  stepTools: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  toolDivider: {
    backgroundColor: "#D4DBD6",
    height: 42,
    width: 1,
  },
  arrowStack: {
    gap: 2,
  },
  arrowButton: {
    alignItems: "center",
    height: 27,
    justifyContent: "center",
    width: 30,
  },
  disabledArrow: {
    opacity: 0.22,
  },
  leaveOutIconButton: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  leaveOutBox: {
    borderColor: "#C78E22",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1.5,
    gap: 12,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 12,
  },
  leaveOutHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  leaveOutLine: {
    backgroundColor: "#C78E22",
    flex: 1,
    height: 1,
  },
  leaveOutTitle: {
    color: "#B17800",
    fontSize: 17,
    fontWeight: "900",
  },
  excludedCard: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderColor: "#EAD9A8",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 72,
    padding: 12,
  },
  excludedBadge: {
    alignItems: "center",
    backgroundColor: "#FFF0C7",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  excludedText: {
    color: "#073F46",
    flex: 1,
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 25,
  },
  statusCard: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  readyStatus: {
    backgroundColor: "#EEF7EE",
    borderColor: "#BFDABF",
  },
  incompleteStatus: {
    backgroundColor: "#FFF6E3",
    borderColor: "#E7C781",
  },
  statusText: {
    color: "#073F46",
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#006D73",
    borderRadius: 12,
    minHeight: 64,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
});
