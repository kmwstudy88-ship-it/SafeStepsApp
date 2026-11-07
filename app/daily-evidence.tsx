import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Redirect } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { AppBottomNav } from "../components/AppBottomNav";
import { useAuth } from "../lib/auth";
import {
  createDailyHomeEvidenceTasks,
  getDailyHomeEvidenceHistory,
  getDailyHomeEvidenceStatus,
  type DailyHomeEvidenceHistory,
  type DailyHomeEvidenceCategory,
  type DailyHomeEvidenceStatus,
} from "../lib/platformData";
import { pickDurableEvidence, attachmentFromCaptureDraft } from "../lib/engines/evidenceCapture";
import type { OfflineEvidenceAttachment } from "../lib/engines/offlineEvidenceVault";
import { createEvidenceItemWithOfflineFallback } from "../lib/engines/evidenceEngine";
import { globalStyles } from "../lib/styles";

const CATEGORY_OPTIONS: { value: DailyHomeEvidenceCategory; label: string; prompt: string }[] = [
  {
    value: "inside_home",
    label: "Inside house",
    prompt: "Daily photo or video showing the inside home environment, routines, and visible safety conditions.",
  },
  {
    value: "outside_home",
    label: "Outside house",
    prompt: "Daily photo or video showing the outside home environment, access areas, hazards, and general upkeep.",
  },
];

function emptyStatus(): DailyHomeEvidenceStatus {
  const dateKey = new Date().toISOString().slice(0, 10);

  return {
    dateKey,
    insideComplete: false,
    outsideComplete: false,
    complete: false,
    items: [],
  };
}

function getMediaType(asset: ImagePicker.ImagePickerAsset): "photo" | "video" {
  return asset.mimeType?.startsWith("video/") || asset.type === "video" ? "video" : "photo";
}

export default function DailyEvidenceScreen() {
  const { initializing, user } = useAuth();
  const userId = user?.id;
  const [status, setStatus] = useState<DailyHomeEvidenceStatus>(emptyStatus);
  const [history, setHistory] = useState<DailyHomeEvidenceHistory>({
    days: [],
    completeDays: 0,
    missingDays: 0,
  });
  const [category, setCategory] = useState<DailyHomeEvidenceCategory>("inside_home");
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [sealedAttachment, setSealedAttachment] = useState<OfflineEvidenceAttachment | null>(null);
  const [mediaSource, setMediaSource] = useState<"media" | "live">("media");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!userId) return;

    let active = true;

    Promise.all([getDailyHomeEvidenceStatus(userId), getDailyHomeEvidenceHistory(userId)]).then(([nextStatus, nextHistory]) => {
      if (!active) return;
      setStatus(nextStatus);
      setHistory(nextHistory);
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setLoading(false);
      setError("Saved history could not be loaded. Captures can still be kept securely on this device while signed in.");
    });

    return () => {
      active = false;
    };
  }, [userId]);

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const handlePickMedia = async () => {
    setError("");
    setNotice("");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError("Photo and video library access is needed to attach daily home evidence.");
      return;
    }

    try {
      const result = await pickDurableEvidence(user.id, "library");
      if (result?.asset) {
        setSelectedMedia(result.asset);
        setSealedAttachment(attachmentFromCaptureDraft(result.draft));
        setMediaSource("media");
      }
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : "Could not preserve this capture.");
    }
  };

  const handleCaptureMedia = async () => {
    setError("");
    setNotice("");
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setError("Camera access is needed to capture daily home evidence.");
      return;
    }

    try {
      const result = await pickDurableEvidence(user.id, "camera");
      if (result?.asset) {
        setSelectedMedia(result.asset);
        setSealedAttachment(attachmentFromCaptureDraft(result.draft));
        setMediaSource("live");
      }
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : "Could not preserve this capture.");
    }
  };

  const handleSave = async () => {
    if (!selectedMedia || !sealedAttachment) {
      setError("Attach a photo or video first.");
      return;
    }

    setError("");
    setNotice("");
    setSaving(true);

    try {
      const mediaType = getMediaType(selectedMedia);
      const dateKey = new Date().toISOString().slice(0, 10);
      const label = CATEGORY_OPTIONS.find((item) => item.value === category)?.label ?? category;
      const result = await createEvidenceItemWithOfflineFallback({
        title: `Daily home evidence - ${label} - ${dateKey} - ${mediaType}`,
        notes: [`Daily hard evidence`, `date=${dateKey}`, `category=${category}`, `media=${mediaType}`, `notes=${notes.trim()}`].join("\n"),
        evidence_type: "direct_observation", purpose: "daily_home_check_in",
        structured_data: { category, dateKey, mediaType, capture_source: mediaSource, source_reliability: "unverified" },
        attachment: sealedAttachment,
      });
      const refreshed = await Promise.allSettled([getDailyHomeEvidenceStatus(user.id), getDailyHomeEvidenceHistory(user.id)]);
      if (refreshed[0].status === "fulfilled") setStatus(refreshed[0].value);
      if (refreshed[1].status === "fulfilled") setHistory(refreshed[1].value);
      setSelectedMedia(null);
      setSealedAttachment(null);
      setNotes("");
      setNotice(result.mode === "offline"
        ? "Saved securely on this device. Upload is pending: open Evidence to retry. Do not clear app data or uninstall before sync completes."
        : `${label} ${mediaType} saved. Capture authenticity remains unverified.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save daily home evidence.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMissingTasks = async () => {
    setError("");
    setNotice("");
    setSaving(true);

    try {
      const result = await createDailyHomeEvidenceTasks(user.id, status.dateKey);
      setNotice(
        result.addedCount > 0
          ? `${result.addedCount} missing hard-evidence task${result.addedCount === 1 ? "" : "s"} added.`
          : "Today's hard-evidence tasks already exist.",
      );
    } catch {
      setError("Could not add missing evidence tasks yet. Check Supabase access and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Daily home evidence</Text>
      <Text style={globalStyles.subtitle}>
        Add required daily photos or videos for inside and outside of the house.
      </Text>

      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={globalStyles.error}>{error}</Text> : null}
      {notice ? <Text style={globalStyles.notice}>{notice}</Text> : null}

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Today: {status.dateKey}</Text>
        <View style={globalStyles.inlineRow}>
          <Text style={status.insideComplete ? globalStyles.pillSuccess : globalStyles.priorityHigh}>
            inside {status.insideComplete ? "complete" : "required"}
          </Text>
          <Text style={status.outsideComplete ? globalStyles.pillSuccess : globalStyles.priorityHigh}>
            outside {status.outsideComplete ? "complete" : "required"}
          </Text>
        </View>
        <Text style={globalStyles.cardText}>
          {status.complete
            ? "Daily inside and outside home evidence is complete."
            : "Both inside and outside home evidence are required for today."}
        </Text>
        <TouchableOpacity
          disabled={saving || status.complete}
          onPress={handleCreateMissingTasks}
          style={[globalStyles.secondaryButton, (saving || status.complete) && globalStyles.buttonDisabled]}
        >
          <Text style={globalStyles.secondaryButtonText}>Add missing evidence tasks</Text>
        </TouchableOpacity>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Evidence type</Text>
        {CATEGORY_OPTIONS.map((item) => {
          const selected = category === item.value;

          return (
            <TouchableOpacity
              key={item.value}
              onPress={() => setCategory(item.value)}
              style={selected ? globalStyles.selectableItemSelected : globalStyles.selectableItem}
            >
              <Text style={selected ? globalStyles.selectableItemTitleSelected : globalStyles.selectableItemTitle}>
                {item.label}
              </Text>
              <Text style={selected ? globalStyles.selectableItemTextSelected : globalStyles.selectableItemText}>
                {item.prompt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Attach photo or video</Text>
        <Text style={globalStyles.mutedText}>Camera captures and imported files remain unverified until reviewed. Unsynced evidence can be lost if app data is cleared or the app is uninstalled.</Text>
        {selectedMedia ? (
          <Text style={globalStyles.notice}>
            Selected {getMediaType(selectedMedia)}: {selectedMedia.fileName ?? "daily home evidence"}
          </Text>
        ) : (
          <Text style={globalStyles.cardText}>No media selected yet.</Text>
        )}
        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="Optional notes about what this shows"
          style={[globalStyles.input, globalStyles.textArea]}
          value={notes}
        />
        <TouchableOpacity onPress={handlePickMedia} style={globalStyles.secondaryButton}>
          <Text style={globalStyles.secondaryButtonText}>Choose photo or video</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCaptureMedia} style={globalStyles.secondaryButton}>
          <Text style={globalStyles.secondaryButtonText}>Capture photo or video</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={saving}
          onPress={handleSave}
          style={[globalStyles.button, saving && globalStyles.buttonDisabled]}
        >
          <Text style={globalStyles.buttonText}>{saving ? "Saving..." : "Save daily evidence"}</Text>
        </TouchableOpacity>
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Today’s saved hard evidence</Text>
        {status.items.length === 0 ? (
          <Text style={globalStyles.cardText}>No daily home evidence saved for today yet.</Text>
        ) : (
          status.items.map((item) => (
            <View key={item.id} style={globalStyles.compactBlock}>
              <Text style={globalStyles.cardText}>{item.title}</Text>
              <Text style={globalStyles.mutedText}>{item.file_path ? "Media attached" : "No media attached"}</Text>
            </View>
          ))
        )}
      </View>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>7-day hard evidence history</Text>
        <Text style={globalStyles.cardText}>
          {history.completeDays}/{history.days.length || 7} days complete
        </Text>
        {history.days.map((day) => (
          <View key={day.dateKey} style={globalStyles.compactBlock}>
            <Text style={globalStyles.cardText}>{day.dateKey}</Text>
            <View style={globalStyles.inlineRow}>
              <Text style={day.insideComplete ? globalStyles.pillSuccess : globalStyles.priorityHigh}>
                inside {day.insideComplete ? "done" : "missing"}
              </Text>
              <Text style={day.outsideComplete ? globalStyles.pillSuccess : globalStyles.priorityHigh}>
                outside {day.outsideComplete ? "done" : "missing"}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <AppBottomNav />
    </ScrollView>
  );
}
