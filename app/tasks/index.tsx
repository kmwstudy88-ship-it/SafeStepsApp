import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, type Href } from "expo-router";
import {
  completeUserTasks,
  completeUserTask,
  createUserTask,
  createUserTaskFromParentChallenge,
  fetchUserTasks,
  UserTask,
} from "../../lib/engines/taskEngine";
import { safestepsParentChallenges } from "../../lib/data/safestepsParentChallenges";

export default function TasksScreen() {
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingChallengeId, setAddingChallengeId] = useState<string | null>(null);
  const [bulkCompleting, setBulkCompleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function loadTasks() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const savedTasks = await fetchUserTasks();
      setTasks(savedTasks);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load tasks."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask() {
    if (title.trim().length === 0 || saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await createUserTask({
        title: title.trim(),
        description: description.trim(),
        priority: "medium",
        category: "general",
        evidence_required: false,
      });

      setTitle("");
      setDescription("");
      await loadTasks();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not create task."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCompleteTask(task: UserTask) {
    setError("");
    setMessage("");

    try {
      await completeUserTask(task);
      await loadTasks();
      setMessage("Task marked complete.");
    } catch (completeError) {
      setError(
        completeError instanceof Error
          ? completeError.message
          : "Could not complete task."
      );
    }
  }

  async function handleAddChallenge(challengeId: string) {
    if (addingChallengeId) return;

    setAddingChallengeId(challengeId);
    setError("");
    setMessage("");

    try {
      await createUserTaskFromParentChallenge(challengeId);
      await loadTasks();
      setMessage("Parent challenge added to ready tasks.");
    } catch (challengeError) {
      setError(
        challengeError instanceof Error
          ? challengeError.message
          : "Could not add parent challenge."
      );
    } finally {
      setAddingChallengeId(null);
    }
  }

  async function handleCompleteReadyTasks() {
    if (readyTasks.length === 0 || bulkCompleting) return;

    setBulkCompleting(true);
    setError("");
    setMessage("");

    try {
      const result = await completeUserTasks(readyTasks);
      await loadTasks();
      setMessage(
        result.updatedCount === 0 && result.skippedCount === 0
          ? "No ready tasks needed updating."
          : [
              result.updatedCount > 0 ? `${result.updatedCount} ready tasks marked complete` : null,
              result.skippedCount > 0
                ? `${result.skippedCount} challenge tasks still need linked evidence before completion`
                : null,
            ]
              .filter(Boolean)
              .join(". ") + ".",
      );
    } catch (completeError) {
      setError(
        completeError instanceof Error
          ? completeError.message
          : "Could not complete ready tasks."
      );
    } finally {
      setBulkCompleting(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const readyTasks = tasks.filter((task) => task.status !== "completed");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Tasks
      </Text>

      <Text style={{ marginBottom: 16 }}>
        Tasks are parent actions connected to learning, practice, evidence and
        progress. Lesson practice activities are also recorded here.
      </Text>

      <View
        style={{
          padding: 16,
          backgroundColor: "#f1f5f3",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Add Task</Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Task title"
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
          value={description}
          onChangeText={setDescription}
          placeholder="Task description"
          multiline
          style={{
            minHeight: 90,
            borderWidth: 1,
            borderColor: "#cbd8d0",
            borderRadius: 10,
            padding: 12,
            marginTop: 10,
            backgroundColor: "#ffffff",
            textAlignVertical: "top",
          }}
        />

        <Pressable
          disabled={title.trim().length === 0 || saving}
          onPress={handleCreateTask}
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
            <Text style={{ fontWeight: "bold" }}>Save Task</Text>
          )}
        </Pressable>
      </View>

      <Pressable
        onPress={loadTasks}
        style={{
          padding: 12,
          backgroundColor: "#dcefe8",
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Refresh Tasks</Text>
      </Pressable>

      <View
        style={{
          padding: 16,
          backgroundColor: "#ffffff",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#d8e5dd",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Parent Challenge Library
        </Text>
        <Text style={{ marginTop: 6 }}>
          Add short SafeSteps parent practice challenges to ready tasks.
        </Text>

        {safestepsParentChallenges.map((challenge) => (
          <View
            key={challenge.id}
            style={{
              paddingVertical: 12,
              borderTopWidth: 1,
              borderTopColor: "#edf2ee",
              marginTop: 10,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>{challenge.displayTitle}</Text>
            <Text style={{ marginTop: 4 }}>{challenge.purpose}</Text>
            <Text style={{ marginTop: 4 }}>
              {challenge.category} - {challenge.challengeType} - {challenge.estimatedTime}
            </Text>
            <Pressable
              disabled={addingChallengeId === challenge.id}
              onPress={() => handleAddChallenge(challenge.id)}
              style={{
                marginTop: 8,
                padding: 10,
                backgroundColor: "#dcefe8",
                borderRadius: 10,
                alignItems: "center",
                opacity: addingChallengeId === challenge.id ? 0.65 : 1,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>
                {addingChallengeId === challenge.id ? "Adding..." : "Add Challenge"}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Pressable
        disabled={readyTasks.length === 0 || bulkCompleting}
        onPress={handleCompleteReadyTasks}
        style={{
          padding: 12,
          backgroundColor: readyTasks.length > 0 ? "#dcefe8" : "#e5e5e5",
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 16,
          opacity: bulkCompleting ? 0.65 : 1,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>
          {bulkCompleting ? "Completing..." : "Mark All Ready Tasks Complete"}
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
          <Text style={{ fontWeight: "bold" }}>Task Update</Text>
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
          <Text style={{ fontWeight: "bold" }}>Task Error</Text>
          <Text style={{ marginTop: 6 }}>{error}</Text>
        </View>
      )}

      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Ready Tasks
      </Text>

      {!loading && readyTasks.length === 0 && (
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
          <Text>No ready tasks.</Text>
        </View>
      )}

      {readyTasks.map((task) => (
        <View
          key={task.id}
          style={{
            padding: 16,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#d8e5dd",
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{task.title}</Text>
          <Text style={{ marginTop: 6 }}>{task.description}</Text>
          <Text style={{ marginTop: 6 }}>Priority: {task.priority}</Text>
          <Text style={{ marginTop: 6 }}>
            Evidence required: {task.evidence_required ? "Yes" : "No"}
          </Text>
          {task.evidence_required ? (
            <Text style={{ marginTop: 6, fontWeight: "bold", color: "#7a4a00" }}>
              Add linked evidence before marking this challenge complete.
            </Text>
          ) : null}

          {task.evidence_required ? (
            <Link
              href={{
                pathname: "/evidence",
                params: {
                  taskId: task.id,
                  taskTitle: task.title,
                  challengeId: task.related_lesson_id?.startsWith("challenge:")
                    ? task.related_lesson_id.replace("challenge:", "")
                    : "",
                },
              } as unknown as Href}
              asChild
            >
              <Pressable
                style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: "#fff4d6",
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "bold" }}>Add Evidence for This Task</Text>
              </Pressable>
            </Link>
          ) : null}

          <Pressable
            onPress={() => handleCompleteTask(task)}
            style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: "#dcefe8",
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Mark Complete</Text>
          </Pressable>
        </View>
      ))}

      <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: 10 }}>
        Completed Tasks
      </Text>

      {completedTasks.map((task) => (
        <View
          key={task.id}
          style={{
            padding: 16,
            backgroundColor: "#f1f5f3",
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{task.title}</Text>
          <Text style={{ marginTop: 6 }}>{task.description}</Text>
          {task.completed_at && (
            <Text style={{ marginTop: 6 }}>
              Completed: {new Date(task.completed_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
