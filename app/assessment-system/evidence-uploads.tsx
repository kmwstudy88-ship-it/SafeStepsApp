import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";

export default function EvidenceUploadsScreen() {
  const [note, setNote] = useState("");

  return (
    <AssessmentScreenShell
      title="Evidence Uploads"
      subtitle="Collect supporting material that shows effort, safety, stability, progress, and family connection."
    >
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Evidence note</Text>
        <Text style={styles.panelText}>
          Add a short note for the evidence item. File upload and Supabase storage can be connected next.
        </Text>

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Example: Weekly home check in completed with photos of routines and child safe spaces."
          multiline
          style={styles.textArea}
        />

        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save Evidence Note</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Evidence categories</Text>
        <Text style={styles.item}>Home safety and routines</Text>
        <Text style={styles.item}>Parenting activity completion</Text>
        <Text style={styles.item}>Service attendance confirmation</Text>
        <Text style={styles.item}>Child voice and wellbeing observations</Text>
        <Text style={styles.item}>Financial and housing stability</Text>
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
  panelText: {
    color: assessmentColors.muted,
    lineHeight: 21,
  },
  textArea: {
    minHeight: 130,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: "#FFFFFF",
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
  item: {
    color: assessmentColors.charcoal,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F0",
    fontWeight: "800",
  },
});

