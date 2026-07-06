import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Redirect } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import { useAuth } from "../../lib/auth";
import {
  createEvidenceItem,
  EvidenceItem,
  fetchEvidenceItems,
  updateEvidenceItemsStatus,
  uploadEvidenceFile,
} from "../../lib/engines/evidenceEngine";

type EvidenceAttachment = {
  uri: string;
  name: string;
  mimeType?: string;
  source: "document" | "media" | "live";
};

export default function EvidenceScreen() {
  const { initializing, user } = useAuth();
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [attachment, setAttachment] = useState<EvidenceAttachment | null>(null);

  const loadEvidence = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const savedItems = await fetchEvidenceItems();
      setItems(savedItems);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load evidence."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  async function handleSaveEvidence() {
    if (title.trim().length === 0 || saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const filePath = attachment
        ? await uploadEvidenceFile(attachment.uri, attachment.name, attachment.mimeType)
        : null;

      await createEvidenceItem({
        title: title.trim(),
        notes: [
          notes.trim(),
          attachment ? `Attachment source: ${attachment.source}` : "",
          attachment ? `Attachment name: ${attachment.name}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        file_path: filePath,
        status: "stored",
      });

      setTitle("");
      setNotes("");
      setAttachment(null);
      await loadEvidence();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save evidence."
      );
    } finally {
      setSaving(false);
    }
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
      setError("Photo and video library access is needed to attach evidence.");
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
        name: picked.fileName ?? `evidence-${Date.now()}`,
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
      setError("Camera access is needed to capture live evidence.");
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
        name: captured.fileName ?? `live-evidence-${Date.now()}`,
        mimeType: captured.mimeType,
        source: "live",
      });
      if (!title.trim()) setTitle("Live evidence capture");
    }
  }

  async function handleStoreDrafts() {
    const draftItems = items.filter((item) => item.status === "draft");
    if (draftItems.length === 0 || bulkUpdating) return;

    setBulkUpdating(true);
    setError("");
    setMessage("");

    try {
      const result = await updateEvidenceItemsStatus(draftItems, "stored");
      await loadEvidence();
      setMessage(
        result.updatedCount === 0
          ? "No draft evidence needed updating."
          : `${result.updatedCount} draft evidence records marked stored.`,
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update draft evidence."
      );
    } finally {
      setBulkUpdating(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadEvidence();
    }
  }, [loadEvidence, user]);

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const draftItems = items.filter((item) => item.status === "draft");

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Evidence
      </Text>

      <Text style={{ marginBottom: 16 }}>
        Evidence stores parent notes, practice records, documents, photos, draft
        evidence, and stored proof for reports and facilitator review.
      </Text>

      <View
        style={{
          padding: 16,
          backgroundColor: "#f1f5f3",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Add Evidence Record
        </Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Evidence title"
          style={{
            minHeight: 50,
            borderWidth: 1,
            borderColor: "#cbd8d0",
            borderRadius: 10,
            padding: 12,
            marginTop: 10,
            backgroundColor: "#ffffff",
          }}
        />

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Evidence notes. Example: Practised family meeting, completed routine, uploaded worksheet later."
          multiline
          style={{
            minHeight: 120,
            borderWidth: 1,
            borderColor: "#cbd8d0",
            borderRadius: 10,
            padding: 12,
            marginTop: 10,
            backgroundColor: "#ffffff",
            textAlignVertical: "top",
          }}
        />

        <View
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: "#d8e5dd",
            borderRadius: 10,
            marginTop: 10,
            backgroundColor: "#ffffff",
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Attachment</Text>
          <Text style={{ marginTop: 6 }}>
            {attachment
              ? `${attachment.name} (${attachment.source})`
              : "No document, photo, video, or live capture attached."}
          </Text>

          <Pressable
            onPress={handlePickDocument}
            style={{
              marginTop: 10,
              padding: 12,
              backgroundColor: "#eef6f2",
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Upload Document</Text>
          </Pressable>

          <Pressable
            onPress={handlePickMedia}
            style={{
              marginTop: 10,
              padding: 12,
              backgroundColor: "#eef6f2",
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Attach Photo or Video</Text>
          </Pressable>

          <Pressable
            onPress={handleCaptureLiveEvidence}
            style={{
              marginTop: 10,
              padding: 12,
              backgroundColor: "#eef6f2",
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Capture Live Evidence</Text>
          </Pressable>

          {attachment ? (
            <Pressable
              onPress={() => setAttachment(null)}
              style={{
                marginTop: 10,
                padding: 12,
                backgroundColor: "#f7eeee",
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Remove Attachment</Text>
            </Pressable>
          ) : null}
        </View>

        <Pressable
          disabled={title.trim().length === 0 || saving}
          onPress={handleSaveEvidence}
          style={{
            marginTop: 12,
            padding: 12,
            backgroundColor: title.trim().length > 0 ? "#dcefe8" : "#e5e5e5",
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          {saving ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ fontWeight: "bold" }}>Save Evidence</Text>
          )}
        </Pressable>
      </View>

      <Pressable
        onPress={loadEvidence}
        style={{
          padding: 12,
          backgroundColor: "#dcefe8",
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Refresh Evidence</Text>
      </Pressable>

      <Pressable
        disabled={draftItems.length === 0 || bulkUpdating}
        onPress={handleStoreDrafts}
        style={{
          padding: 12,
          backgroundColor: draftItems.length > 0 ? "#dcefe8" : "#e5e5e5",
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 16,
          opacity: bulkUpdating ? 0.65 : 1,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>
          {bulkUpdating ? "Updating..." : "Mark All Draft Evidence Stored"}
        </Text>
      </Pressable>

      {loading && <ActivityIndicator />}

      {message.length > 0 && (
        <View
          style={{
            padding: 14,
            backgroundColor: "#edf8f2",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Evidence Update</Text>
          <Text style={{ marginTop: 6 }}>{message}</Text>
        </View>
      )}

      {error.length > 0 && (
        <View
          style={{
            padding: 14,
            backgroundColor: "#ffecec",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Evidence Error</Text>
          <Text style={{ marginTop: 6 }}>{error}</Text>
        </View>
      )}

      {!loading && items.length === 0 && (
        <View
          style={{
            padding: 16,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#d8e5dd",
            marginBottom: 14,
          }}
        >
          <Text>No evidence records saved yet.</Text>
        </View>
      )}

      {items.map((item) => (
        <View
          key={item.id}
          style={{
            padding: 16,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#d8e5dd",
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.title}</Text>
          <Text style={{ marginTop: 6 }}>{item.notes}</Text>
          <Text style={{ marginTop: 6 }}>
            Attachment: {item.file_path ? "Stored securely" : "No file attached"}
          </Text>
          <Text style={{ marginTop: 6 }}>Status: {item.status}</Text>
          <Text style={{ marginTop: 6 }}>
            Created: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
