import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Redirect } from "expo-router";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import {
  bulkAddEvidenceNotes,
  bulkAddTasks,
  safeStepsBulkSetupBundles,
  type SafeStepsBulkSetupBundle,
} from "../../lib/platformData";
import { globalStyles } from "../../lib/styles";

export default function BulkSetupScreen() {
  const { initializing, user } = useAuth();
  const [selectedBundleIds, setSelectedBundleIds] = useState<Set<string>>(
    () => new Set(safeStepsBulkSetupBundles.map((bundle) => bundle.id)),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBundles = useMemo(
    () => safeStepsBulkSetupBundles.filter((bundle) => selectedBundleIds.has(bundle.id)),
    [selectedBundleIds],
  );

  const totals = useMemo(
    () => selectedBundles.reduce(
      (acc, bundle) => ({
        tasks: acc.tasks + bundle.taskTemplates.length,
        evidence: acc.evidence + bundle.evidenceTemplates.length,
      }),
      { tasks: 0, evidence: 0 },
    ),
    [selectedBundles],
  );

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const toggleBundle = (bundle: SafeStepsBulkSetupBundle) => {
    setSelectedBundleIds((current) => {
      const next = new Set(current);
      if (next.has(bundle.id)) {
        next.delete(bundle.id);
      } else {
        next.add(bundle.id);
      }
      return next;
    });
  };

  const handleBulkSetup = async () => {
    if (selectedBundles.length === 0) {
      setMessage("Choose at least one bulk setup bundle first.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const taskTemplates = selectedBundles.flatMap((bundle) => bundle.taskTemplates);
      const evidenceTemplates = selectedBundles.flatMap((bundle) => bundle.evidenceTemplates);
      const taskResult = await bulkAddTasks(user.id, taskTemplates);
      const evidenceResult = await bulkAddEvidenceNotes(user.id, evidenceTemplates);

      setMessage(
        `${taskResult.addedCount} tasks and ${evidenceResult.addedCount} evidence drafts added. ${taskResult.skippedCount + evidenceResult.skippedCount} existing items skipped.`,
      );
    } catch {
      setMessage("Could not add the selected bulk setup yet. Check Supabase access and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={globalStyles.screen}>
      <Text style={globalStyles.title}>Bulk setup</Text>
      <Text style={globalStyles.subtitle}>
        Add whole SafeSteps systems at once. Existing tasks and evidence drafts are skipped automatically.
      </Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.cardTitle}>Selected setup</Text>
        <View style={globalStyles.inlineRow}>
          <Text style={globalStyles.pill}>{selectedBundles.length} bundles</Text>
          <Text style={globalStyles.pill}>{totals.tasks} tasks</Text>
          <Text style={globalStyles.pill}>{totals.evidence} evidence drafts</Text>
        </View>
        {message ? <Text style={message.startsWith("Could") || message.startsWith("Choose") ? globalStyles.error : globalStyles.notice}>{message}</Text> : null}
        <TouchableOpacity
          disabled={saving}
          onPress={handleBulkSetup}
          style={[globalStyles.button, saving && globalStyles.buttonDisabled]}
        >
          <Text style={globalStyles.buttonText}>{saving ? "Adding..." : "Add selected setup"}</Text>
        </TouchableOpacity>
      </View>

      {safeStepsBulkSetupBundles.map((bundle) => {
        const selected = selectedBundleIds.has(bundle.id);

        return (
          <TouchableOpacity
            key={bundle.id}
            onPress={() => toggleBundle(bundle)}
            style={selected ? globalStyles.selectableItemSelected : globalStyles.selectableItem}
          >
            <View style={globalStyles.inlineRow}>
              <Text style={selected ? globalStyles.selectableItemTitleSelected : globalStyles.selectableItemTitle}>
                {selected ? "Selected: " : ""}{bundle.title}
              </Text>
              <Text style={globalStyles.pill}>{bundle.taskTemplates.length} tasks</Text>
              <Text style={globalStyles.pill}>{bundle.evidenceTemplates.length} evidence</Text>
            </View>
            <Text style={selected ? globalStyles.selectableItemTextSelected : globalStyles.selectableItemText}>
              {bundle.description}
            </Text>
            <Text style={globalStyles.mutedText}>Tasks</Text>
            {bundle.taskTemplates.map((task) => (
              <Text key={task.title} style={globalStyles.mutedText}>{task.title}</Text>
            ))}
            <Text style={globalStyles.mutedText}>Evidence drafts</Text>
            {bundle.evidenceTemplates.map((item) => (
              <Text key={item.title} style={globalStyles.mutedText}>{item.title}</Text>
            ))}
          </TouchableOpacity>
        );
      })}

      <AppBottomNav />
    </ScrollView>
  );
}
