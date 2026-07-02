import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Link, Redirect } from "expo-router";

import { AppBottomNav } from "../../components/AppBottomNav";
import { useAuth } from "../../lib/auth";
import { draftEvidenceMatchingTemplates, tasksMatchingTemplates } from "../../lib/bulkSelection";
import {
  bulkAddEvidenceNotes,
  bulkAddTasks,
  bulkSetEvidenceStatus,
  bulkSetTaskStatus,
  getEvidence,
  getTasks,
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
  const [finishing, setFinishing] = useState(false);
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
  const hasSelection = selectedBundles.length > 0;
  const isBusy = saving || finishing;
  const actionDisabled = !hasSelection || isBusy;

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

  const selectAllBundles = () => {
    setSelectedBundleIds(new Set(safeStepsBulkSetupBundles.map((bundle) => bundle.id)));
    setMessage("");
  };

  const clearBundles = () => {
    setSelectedBundleIds(new Set());
    setMessage("");
  };

  const getOperationErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message.trim().length > 0) {
      return `${fallback} ${error.message}`;
    }

    return fallback;
  };

  const handleBulkSetup = async () => {
    if (!hasSelection) {
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
    } catch (error) {
      setMessage(
        getOperationErrorMessage(
          error,
          "Could not add the selected bulk setup yet.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleFinishRemainingSetup = async () => {
    if (!hasSelection) {
      setMessage("Choose at least one bulk setup bundle first.");
      return;
    }

    setFinishing(true);
    setMessage("");

    try {
      const taskTemplates = selectedBundles.flatMap((bundle) => bundle.taskTemplates);
      const evidenceTemplates = selectedBundles.flatMap((bundle) => bundle.evidenceTemplates);
      const taskAddResult = await bulkAddTasks(user.id, taskTemplates);
      const evidenceAddResult = await bulkAddEvidenceNotes(user.id, evidenceTemplates);
      const [tasks, evidence] = await Promise.all([getTasks(user.id), getEvidence(user.id)]);
      const selectedTasks = tasksMatchingTemplates(tasks, taskTemplates);
      const selectedDraftEvidence = draftEvidenceMatchingTemplates(evidence, evidenceTemplates);
      const taskCompleteResult = await bulkSetTaskStatus(user.id, selectedTasks, "completed");
      const evidenceStoreResult = await bulkSetEvidenceStatus(
        user.id,
        selectedDraftEvidence,
        "stored",
      );

      setMessage(
        [
          `${taskAddResult.addedCount} tasks added`,
          `${evidenceAddResult.addedCount} evidence drafts added`,
          `${taskCompleteResult.updatedCount} tasks completed`,
          `${evidenceStoreResult.updatedCount} draft evidence records stored`,
          `${taskAddResult.skippedCount + evidenceAddResult.skippedCount} existing items skipped`,
        ].join(". ") + ".",
      );
    } catch (error) {
      setMessage(
        getOperationErrorMessage(
          error,
          "Could not finish the selected setup yet.",
        ),
      );
    } finally {
      setFinishing(false);
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
        {!hasSelection ? (
          <Text style={globalStyles.error}>
            Select one or more bundles to enable bulk setup actions.
          </Text>
        ) : (
          <Text style={globalStyles.cardText}>
            Selected bundles will add missing tasks and evidence drafts only. Existing matching items are skipped.
          </Text>
        )}
        <View style={globalStyles.inlineRow}>
          <TouchableOpacity
            disabled={isBusy}
            onPress={selectAllBundles}
            style={[globalStyles.secondaryButtonCompact, isBusy && globalStyles.buttonDisabled]}
          >
            <Text style={globalStyles.secondaryButtonText}>Select all</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isBusy}
            onPress={clearBundles}
            style={[globalStyles.secondaryButtonCompact, isBusy && globalStyles.buttonDisabled]}
          >
            <Text style={globalStyles.secondaryButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
        {message ? <Text style={message.startsWith("Could") || message.startsWith("Choose") ? globalStyles.error : globalStyles.notice}>{message}</Text> : null}
        <TouchableOpacity
          disabled={actionDisabled}
          onPress={handleBulkSetup}
          style={[globalStyles.button, actionDisabled && globalStyles.buttonDisabled]}
        >
          <Text style={globalStyles.buttonText}>{saving ? "Adding..." : "Add selected setup"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={actionDisabled}
          onPress={handleFinishRemainingSetup}
          style={[globalStyles.button, actionDisabled && globalStyles.buttonDisabled]}
        >
          <Text style={globalStyles.buttonText}>{finishing ? "Finishing..." : "Finish remaining selected setup"}</Text>
        </TouchableOpacity>
        {message && !message.startsWith("Could") && !message.startsWith("Choose") ? (
          <View style={globalStyles.inlineRow}>
            <Link href="/tasks" asChild>
              <TouchableOpacity style={globalStyles.secondaryButtonCompact}>
                <Text style={globalStyles.secondaryButtonText}>Review tasks</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/evidence" asChild>
              <TouchableOpacity style={globalStyles.secondaryButtonCompact}>
                <Text style={globalStyles.secondaryButtonText}>Review evidence</Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : null}
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
