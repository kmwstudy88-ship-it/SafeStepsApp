import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";

export default function CaseSetupScreen() {
  const [caseName, setCaseName] = useState("");
  const [parentName, setParentName] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [programStream, setProgramStream] = useState("");

  return (
    <AssessmentScreenShell
      title="Case Setup"
      subtitle="Set up the family case before completing assessments, scoring, evidence review, and reports."
    >
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Family and case details</Text>

        <Text style={styles.label}>Case name</Text>
        <TextInput
          value={caseName}
          onChangeText={setCaseName}
          placeholder="Example: Watts family reunification case"
          style={styles.input}
        />

        <Text style={styles.label}>Parent or carer name</Text>
        <TextInput
          value={parentName}
          onChangeText={setParentName}
          placeholder="Enter parent or carer name"
          style={styles.input}
        />

        <Text style={styles.label}>Worker or support person</Text>
        <TextInput
          value={workerName}
          onChangeText={setWorkerName}
          placeholder="Enter worker name"
          style={styles.input}
        />

        <Text style={styles.label}>Program stream</Text>
        <TextInput
          value={programStream}
          onChangeText={setProgramStream}
          placeholder="Example: 24 month reunification program"
          style={styles.input}
        />

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Setup summary</Text>
          <Text style={styles.summaryText}>Case: {caseName || "Not entered yet"}</Text>
          <Text style={styles.summaryText}>Parent or carer: {parentName || "Not entered yet"}</Text>
          <Text style={styles.summaryText}>Worker: {workerName || "Not entered yet"}</Text>
          <Text style={styles.summaryText}>Program: {programStream || "Not entered yet"}</Text>
        </View>

        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save Case Setup</Text>
        </Pressable>
      </View>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    color: assessmentColors.charcoal,
    fontSize: 20,
    fontWeight: "900",
  },
  label: {
    color: assessmentColors.charcoal,
    fontWeight: "800",
  },
  input: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  summaryBox: {
    gap: 6,
    padding: 14,
    borderRadius: 12,
    backgroundColor: assessmentColors.sage,
  },
  summaryTitle: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
  summaryText: {
    color: assessmentColors.charcoal,
    lineHeight: 20,
  },
  primaryButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: assessmentColors.teal,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
});

