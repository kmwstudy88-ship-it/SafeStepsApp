import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Redirect } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { AppBottomNav } from "../components/AppBottomNav";
import { useAuth } from "../lib/auth";
import {
  addDailyHomeEvidence,
  createDailyHomeEvidenceTasks,
  getDailyHomeEvidenceHistory,
  getDailyHomeEvidenceStatus,
  uploadEvidenceMedia,
  type DailyHomeEvidenceHistory,
  type DailyHomeEvidenceCategory,
  type DailyHomeEvidenceStatus,
} from "../lib/platformData";
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

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ["images", "videos"],
      quality: 0.8,
      videoMaxDuration: 90,
    });

    if (!result.canceled) {
      setSelectedMedia(result.assets[0]);
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

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      mediaTypes: ["images", "videos"],
      quality: 0.8,
      videoMaxDuration: 90,
    });

    if (!result.canceled) {
      setSelectedMedia(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!selectedMedia) {
      setError("Attach a photo or video first.");
      return;
    }

    setError("");
    setNotice("");
    setSaving(true);

    try {
      const mediaType = getMediaType(selectedMedia);
      const filePath = await uploadEvidenceMedia(
        user.id,
        selectedMedia.uri,
        selectedMedia.fileName ?? undefined,
        selectedMedia.mimeType ?? undefined,
      );

      await addDailyHomeEvidence(user.id, category, mediaType, notes, filePath);
      setStatus(await getDailyHomeEvidenceStatus(user.id));
      setHistory(await getDailyHomeEvidenceHistory(user.id));
      setSelectedMedia(null);
      setNotes("");
      setNotice(`${CATEGORY_OPTIONS.find((item) => item.value === category)?.label} ${mediaType} saved.`);
    } catch {
      setError("Could not save daily home evidence yet. Check Supabase storage and try again.");
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
