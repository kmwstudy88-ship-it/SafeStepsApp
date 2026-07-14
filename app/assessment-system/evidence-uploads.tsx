import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Redirect } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import { useAuth } from "../../lib/auth";
import { createEvidenceItemWithOfflineFallback } from "../../lib/engines/evidenceEngine";

type AssessmentEvidenceAttachment = {
  uri: string;
  name: string;
  mimeType?: string;
  source: "document" | "media" | "live";
};

export default function EvidenceUploadsScreen() {
  const { initializing, user } = useAuth();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [attachment, setAttachment] = useState<AssessmentEvidenceAttachment | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  async function handlePickDocument() {
    setError("");
    setMessage("");

    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "text/csv",
        "image/*",
        "video/*",
      ],
    });

    if (!result.canceled) {
      const picked = result.assets[0];
      setAttachment({
        uri: picked.uri,
        name: picked.name,
        mimeType: picked.mimeType,
        source: "document",
      });
      if (!title.trim()) setTitle(picked.name.replace(/\.[^/.]+$/, ""));
    }
  }

  async function handlePickMedia() {
    setError("");
    setMessage("");

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError("Photo and video library access is needed to attach assessment evidence.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ["images", "videos"],
      quality: 0.8,
      videoMaxDuration: 90,
    });

    if (!result.canceled) {
      const picked = result.assets[0];
      setAttachment({
        uri: picked.uri,
        name: picked.fileName ?? `assessment-evidence-${Date.now()}`,
        mimeType: picked.mimeType,
        source: "media",
      });
    }
  }

  async function handleCaptureLiveEvidence() {
    setError("");
    setMessage("");

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setError("Camera access is needed to capture assessment evidence.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      mediaTypes: ["images", "videos"],
      quality: 0.8,
      videoMaxDuration: 90,
    });

    if (!result.canceled) {
      const captured = result.assets[0];
      setAttachment({
        uri: captured.uri,
        name: captured.fileName ?? `assessment-live-evidence-${Date.now()}`,
        mimeType: captured.mimeType,
        source: "live",
      });
      if (!title.trim()) setTitle("Assessment evidence capture");
    }
  }

  async function handleSaveEvidence() {
    if (!title.trim() || saving) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const result = await createEvidenceItemWithOfflineFallback({
        title: title.trim(),
        notes: [
          "Assessment evidence upload",
          note.trim(),
        ].filter(Boolean).join("\n"),
        attachment,
      });

      setTitle("");
      setNote("");
      setAttachment(null);
      setMessage(
        result.mode === "online"
          ? "Assessment evidence saved."
          : "No connection detected. Assessment evidence is sealed in the offline vault and will upload when sync succeeds.",
      );
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save assessment evidence.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AssessmentScreenShell
      title="Evidence Uploads"
      subtitle="Collect supporting material that shows effort, safety, stability, progress, and family connection."
    >
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Evidence note</Text>
        <Text style={styles.panelText}>
          Add supporting material that can be reviewed alongside assessment records and reports.
        </Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Evidence title"
          style={styles.input}
        />

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Example: Weekly home check in completed with photos of routines and child safe spaces."
          multiline
          style={styles.textArea}
        />

        <View style={styles.attachmentPanel}>
          <Text style={styles.attachmentTitle}>Attachment</Text>
          <Text style={styles.panelText}>
            {attachment ? `${attachment.name} (${attachment.source})` : "No document, photo, video, or live capture attached."}
          </Text>
          <View style={styles.buttonRow}>
            <Pressable onPress={handlePickDocument} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Upload Document</Text>
            </Pressable>
            <Pressable onPress={handlePickMedia} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Attach Media</Text>
            </Pressable>
            <Pressable onPress={handleCaptureLiveEvidence} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Capture Live</Text>
            </Pressable>
          </View>
          {attachment ? (
            <Pressable onPress={() => setAttachment(null)} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>Remove Attachment</Text>
            </Pressable>
          ) : null}
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          disabled={!title.trim() || saving}
          onPress={handleSaveEvidence}
          style={[styles.primaryButton, (!title.trim() || saving) && styles.disabledButton]}
        >
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Save Assessment Evidence</Text>}
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
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  attachmentPanel: {
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#F8FBFA",
  },
  attachmentTitle: {
    color: assessmentColors.charcoal,
    fontWeight: "900",
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  primaryButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: assessmentColors.teal,
  },
  secondaryButton: {
    minHeight: 42,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: assessmentColors.teal,
    backgroundColor: "#FFFFFF",
  },
  removeButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: "#FCEEEE",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  secondaryButtonText: {
    color: assessmentColors.teal,
    fontWeight: "900",
  },
  removeButtonText: {
    color: "#9E2B25",
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.55,
  },
  message: {
    color: assessmentColors.teal,
    fontWeight: "900",
  },
  error: {
    color: "#9E2B25",
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

