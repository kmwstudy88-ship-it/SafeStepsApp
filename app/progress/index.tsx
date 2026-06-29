import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  fetchDailyLessonRecords,
  SavedDailyLessonRecord,
} from "../../lib/engines/growthTimelineEngine";

export default function ProgressScreen() {
  const [records, setRecords] = useState<SavedDailyLessonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRecords() {
    setLoading(true);
    setError("");

    try {
      const savedRecords = await fetchDailyLessonRecords();
      setRecords(savedRecords);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load growth timeline."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Growth Timeline
      </Text>

      <Text style={{ marginBottom: 16 }}>
        This timeline uses your existing Supabase progress_events table. It
        shows lesson completions, checkpoints, practical activities and growth
        data over time.
      </Text>

      <Pressable
        onPress={loadRecords}
        style={{
          padding: 12,
          backgroundColor: "#dcefe8",
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Refresh Timeline</Text>
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
          <Text style={{ fontWeight: "bold" }}>Could not load timeline</Text>
          <Text style={{ marginTop: 6 }}>{error}</Text>
        </View>
      )}

      {!loading && error.length === 0 && records.length === 0 && (
        <View
          style={{
            padding: 16,
            backgroundColor: "#f1f5f3",
            borderRadius: 12,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>No progress events yet</Text>
          <Text style={{ marginTop: 6 }}>
            Once a parent completes reflections or daily lessons, events will
            appear here.
          </Text>
        </View>
      )}

      {[...records].reverse().map((record) => (
        <View
          key={record.id}
          style={{
            padding: 16,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#d8e5dd",
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {record.label}
          </Text>

          <Text style={{ marginTop: 4 }}>
            {record.metadata.program_title ?? "Program"} • Month{" "}
            {record.metadata.month_number ?? "-"} • Week{" "}
            {record.metadata.week_number ?? "-"} • Day{" "}
            {record.metadata.day_number ?? "-"}
          </Text>

          {record.metadata.lesson_title && (
            <>
              <Text style={{ marginTop: 8, fontWeight: "bold" }}>Lesson</Text>
              <Text>{String(record.metadata.lesson_title)}</Text>
            </>
          )}

          {record.metadata.month_topic && (
            <>
              <Text style={{ marginTop: 8, fontWeight: "bold" }}>
                Monthly Topic
              </Text>
              <Text>{String(record.metadata.month_topic)}</Text>
            </>
          )}

          {record.metadata.week_sub_topic && (
            <>
              <Text style={{ marginTop: 8, fontWeight: "bold" }}>
                Weekly Sub-Topic
              </Text>
              <Text>{String(record.metadata.week_sub_topic)}</Text>
            </>
          )}

          {record.metadata.practical_activity && (
            <>
              <Text style={{ marginTop: 8, fontWeight: "bold" }}>
                Practical Activity
              </Text>
              <Text>{String(record.metadata.practical_activity)}</Text>
            </>
          )}

          {record.metadata.confidence_before && record.metadata.confidence_after && (
            <Text style={{ marginTop: 8 }}>
              Confidence: {String(record.metadata.confidence_before)}/10 →{" "}
              {String(record.metadata.confidence_after)}/10
            </Text>
          )}

          <Text style={{ marginTop: 8, fontSize: 12 }}>
            {new Date(record.created_at).toLocaleString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}