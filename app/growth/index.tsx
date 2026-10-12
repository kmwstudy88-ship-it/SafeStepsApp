import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  fetchGrowthProfile,
  fetchGrowthReflections,
  GrowthReflection,
  saveGrowthProfile,
  saveGrowthReflection,
} from "../../lib/engines/growthFeatureEngine";

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ fontWeight: "bold" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline
        style={{
          minHeight: 110,
          borderWidth: 1,
          borderColor: "#cbd8d0",
          borderRadius: 10,
          padding: 12,
          marginTop: 8,
          backgroundColor: "#ffffff",
          textAlignVertical: "top",
        }}
      />
    </View>
  );
}

function ReflectionCard({ item }: { item: GrowthReflection }) {
  const title =
    item.reflection_type === "weekly_family_win"
      ? "Family Win"
      : item.reflection_type === "toolbox_skill"
        ? "Toolbox Skill"
        : item.reflection_type === "child_future_letter"
          ? "Child Future Letter"
          : "Growth Reflection";

  return (
    <View
      style={{
        padding: 16,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#d8e5dd",
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>{title}</Text>
      <Text style={{ marginTop: 6, fontWeight: "bold" }}>{item.prompt}</Text>
      <Text style={{ marginTop: 6 }}>{item.response}</Text>
      <Text style={{ marginTop: 8, fontSize: 12 }}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );
}

export default function GrowthFeaturesScreen() {
  const [storyGoal, setStoryGoal] = useState("");
  const [strengths, setStrengths] = useState("");
  const [supportNotes, setSupportNotes] = useState("");

  const [familyWin, setFamilyWin] = useState("");
  const [toolboxSkill, setToolboxSkill] = useState("");
  const [futureLetter, setFutureLetter] = useState("");

  const [reflections, setReflections] = useState<GrowthReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingReflection, setSavingReflection] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadGrowthData() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const profile = await fetchGrowthProfile();

      if (profile) {
        setStoryGoal(profile.story_goal ?? "");
        setStrengths(profile.strengths ?? "");
        setSupportNotes(profile.support_notes ?? "");
      }

      const savedReflections = await fetchGrowthReflections();
      setReflections(savedReflections);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load growth features."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (savingProfile) return;

    setSavingProfile(true);
    setError("");
    setSuccess("");

    try {
      await saveGrowthProfile({
        story_goal: storyGoal.trim(),
        strengths: strengths.trim(),
        support_notes: supportNotes.trim(),
      });

      setSuccess("Growth profile saved.");
      await loadGrowthData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save growth profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveFamilyWin() {
    if (familyWin.trim().length === 0 || savingReflection.length > 0) return;

    setSavingReflection("family_win");
    setError("");
    setSuccess("");

    try {
      await saveGrowthReflection({
        reflection_type: "weekly_family_win",
        prompt: "What went well for your family this week?",
        response: familyWin.trim(),
      });

      setFamilyWin("");
      setSuccess("Family win saved.");
      await loadGrowthData();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save family win."
      );
    } finally {
      setSavingReflection("");
    }
  }

  async function handleSaveToolboxSkill() {
    if (toolboxSkill.trim().length === 0 || savingReflection.length > 0) return;

    setSavingReflection("toolbox_skill");
    setError("");
    setSuccess("");

    try {
      await saveGrowthReflection({
        reflection_type: "toolbox_skill",
        prompt: "What skill would you like to add to your SafeSteps toolbox?",
        response: toolboxSkill.trim(),
      });

      setToolboxSkill("");
      setSuccess("Toolbox skill saved.");
      await loadGrowthData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save toolbox skill."
      );
    } finally {
      setSavingReflection("");
    }
  }

  async function handleSaveFutureLetter() {
    if (futureLetter.trim().length === 0 || savingReflection.length > 0) return;

    setSavingReflection("future_letter");
    setError("");
    setSuccess("");

    try {
      await saveGrowthReflection({
        reflection_type: "child_future_letter",
        prompt:
          "Imagine your child reads this in ten years. What would you like them to know about the effort you are making today?",
        response: futureLetter.trim(),
      });

      setFutureLetter("");
      setSuccess("Child future letter saved.");
      await loadGrowthData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save child future letter."
      );
    } finally {
      setSavingReflection("");
    }
  }

  useEffect(() => {
    loadGrowthData();
  }, []);

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        SafeSteps Growth
      </Text>

      <Text style={{ marginBottom: 16 }}>
        This section captures the parent&apos;s story, strengths, motivation,
        weekly wins, personal toolbox, and future-focused reflections.
      </Text>

      <Pressable
        onPress={loadGrowthData}
        style={{
          padding: 12,
          backgroundColor: "#dcefe8",
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Refresh Growth</Text>
      </Pressable>

      {loading && <ActivityIndicator />}

      {error.length > 0 && (
        <View
          style={{
            padding: 14,
            backgroundColor: "#ffecec",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Growth Error</Text>
          <Text style={{ marginTop: 6 }}>{error}</Text>
        </View>
      )}

      {success.length > 0 && (
        <View
          style={{
            padding: 14,
            backgroundColor: "#dcefe8",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>{success}</Text>
        </View>
      )}

      <View
        style={{
          padding: 16,
          backgroundColor: "#f1f5f3",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>
          My Story and My Why
        </Text>

        <Text style={{ marginTop: 8 }}>
          This is not a test. It helps SafeSteps understand the parent&apos;s
          motivation, strengths, and support needs.
        </Text>

        <Field
          label="My Why / Story Goal"
          value={storyGoal}
          onChangeText={setStoryGoal}
          placeholder="Why are you doing this program? What are you working towards?"
        />

        <Field
          label="My Strengths"
          value={strengths}
          onChangeText={setStrengths}
          placeholder="What strengths do you already have as a parent or family?"
        />

        <Field
          label="Support Notes"
          value={supportNotes}
          onChangeText={setSupportNotes}
          placeholder="What support would help you stay on track?"
        />

        <Pressable
          onPress={handleSaveProfile}
          disabled={savingProfile}
          style={{
            marginTop: 12,
            padding: 12,
            backgroundColor: "#dcefe8",
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          {savingProfile ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ fontWeight: "bold" }}>Save My Story</Text>
          )}
        </Pressable>
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: "#f1f5f3",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>Family Wins</Text>

        <Field
          label="What went well for your family this week?"
          value={familyWin}
          onChangeText={setFamilyWin}
          placeholder="Example: We ate dinner together, bedtime was calmer, my child opened up to me."
        />

        <Pressable
          onPress={handleSaveFamilyWin}
          disabled={familyWin.trim().length === 0 || savingReflection.length > 0}
          style={{
            marginTop: 12,
            padding: 12,
            backgroundColor:
              familyWin.trim().length > 0 ? "#dcefe8" : "#e5e5e5",
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          {savingReflection === "family_win" ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ fontWeight: "bold" }}>Save Family Win</Text>
          )}
        </Pressable>
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: "#f1f5f3",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>My Toolbox</Text>

        <Field
          label="What skill are you adding to your toolbox?"
          value={toolboxSkill}
          onChangeText={setToolboxSkill}
          placeholder="Example: Active listening, calm breathing, family meetings, emotional coaching."
        />

        <Pressable
          onPress={handleSaveToolboxSkill}
          disabled={toolboxSkill.trim().length === 0 || savingReflection.length > 0}
          style={{
            marginTop: 12,
            padding: 12,
            backgroundColor:
              toolboxSkill.trim().length > 0 ? "#dcefe8" : "#e5e5e5",
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          {savingReflection === "toolbox_skill" ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ fontWeight: "bold" }}>Add Toolbox Skill</Text>
          )}
        </Pressable>
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: "#f1f5f3",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>
          Child Future Letter
        </Text>

        <Field
          label="Imagine your child reads this in ten years. What would you like them to know?"
          value={futureLetter}
          onChangeText={setFutureLetter}
          placeholder="Write a future-focused letter about the effort you are making today."
        />

        <Pressable
          onPress={handleSaveFutureLetter}
          disabled={futureLetter.trim().length === 0 || savingReflection.length > 0}
          style={{
            marginTop: 12,
            padding: 12,
            backgroundColor:
              futureLetter.trim().length > 0 ? "#dcefe8" : "#e5e5e5",
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          {savingReflection === "future_letter" ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ fontWeight: "bold" }}>Save Future Letter</Text>
          )}
        </Pressable>
      </View>

      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>
        Growth Feature Timeline
      </Text>

      {!loading && reflections.length === 0 && (
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
          <Text>No growth feature reflections saved yet.</Text>
        </View>
      )}

      {reflections.map((item) => (
        <ReflectionCard key={item.id} item={item} />
      ))}
    </ScrollView>
  );
}
