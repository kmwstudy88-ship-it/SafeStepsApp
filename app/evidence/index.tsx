import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import { useAuth } from "../../lib/auth";
import {
  createEvidenceItemWithOfflineFallback,
  fetchEvidenceCaseReviewAvailability,
  EvidenceItem,
  type EvidenceCaseReviewAvailability,
  fetchEvidenceItems,
  getPendingOfflineEvidenceItems,
  syncPendingOfflineEvidence,
  updateEvidenceItemsStatus,
} from "../../lib/engines/evidenceEngine";
import type { OfflineEvidenceVaultItem } from "../../lib/engines/offlineEvidenceVault";
import {
  emptyStructuredEvidenceRecord,
  evidenceReviewReadiness,
  splitLines,
  structuredEvidenceNotes,
  structuredEvidenceTitle,
  structuredEvidenceTypes,
  type StructuredEvidenceRecord,
  type StructuredEvidenceType,
} from "../../lib/engines/structuredEvidenceWorkflow";

type EvidenceAttachment = {
  uri: string;
  name: string;
  mimeType?: string;
  source: "document" | "media" | "live";
};

export default function EvidenceScreen() {
  const { initializing, user } = useAuth();
  const { taskId, taskTitle, challengeId } = useLocalSearchParams<{
    taskId?: string;
    taskTitle?: string;
    challengeId?: string;
  }>();
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [pendingItems, setPendingItems] = useState<OfflineEvidenceVaultItem[]>([]);
  const [reviewAvailability, setReviewAvailability] = useState<EvidenceCaseReviewAvailability>({
    status: "unknown_case_linkage",
    caseIds: [],
    linkedWorkerCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [evidenceType, setEvidenceType] = useState<StructuredEvidenceType>("direct_observation");
  const [record, setRecord] = useState<StructuredEvidenceRecord>(() =>
    emptyStructuredEvidenceRecord("direct_observation"),
  );
  const [listFields, setListFields] = useState({
    people_present: "",
    strengths_observed: "",
    concerns_observed: "",
    external_barriers: "",
    contrary_evidence: "",
    limitations: "",
  });
  const [attachment, setAttachment] = useState<EvidenceAttachment | null>(null);
  const linkedTaskContext = {
    task_id: typeof taskId === "string" && taskId.trim().length > 0 ? taskId : null,
    task_title: typeof taskTitle === "string" && taskTitle.trim().length > 0 ? taskTitle : null,
    challenge_id: typeof challengeId === "string" && challengeId.trim().length > 0 ? challengeId : null,
  };

  useEffect(() => {
    if (!linkedTaskContext.task_title || record.purpose.trim().length > 0) return;
    updateRecord({ purpose: `Evidence for task: ${linkedTaskContext.task_title}` });
  }, [linkedTaskContext.task_title, record.purpose]);

  function updateRecord(patch: Partial<StructuredEvidenceRecord>) {
    setRecord((current) => ({ ...current, ...patch }));
  }

  function updateCollector(field: keyof StructuredEvidenceRecord["collector"], value: string) {
    setRecord((current) => ({
      ...current,
      collector: { ...current.collector, [field]: value },
    }));
  }

  function updateConsent(field: keyof StructuredEvidenceRecord["consent_or_authority"], value: string | null) {
    setRecord((current) => ({
      ...current,
      consent_or_authority: { ...current.consent_or_authority, [field]: value },
    }));
  }

  function updateDirectObservation(
    patch: Partial<NonNullable<StructuredEvidenceRecord["workflow"]["direct_observation"]>>,
  ) {
    setRecord((current) => {
      const fallback = emptyStructuredEvidenceRecord("direct_observation").workflow.direct_observation!;
      return {
        ...current,
        workflow: {
          ...current.workflow,
          direct_observation: {
            ...fallback,
            ...current.workflow.direct_observation,
            ...patch,
          },
        },
      };
    });
  }

  function updateObservationDomain(domain: string, value: string) {
    setRecord((current) => {
      const fallback = emptyStructuredEvidenceRecord("direct_observation").workflow.direct_observation!;
      return {
        ...current,
        workflow: {
          ...current.workflow,
          direct_observation: {
            ...fallback,
            ...current.workflow.direct_observation,
            domains: {
              ...fallback.domains,
              ...current.workflow.direct_observation?.domains,
              [domain]: value,
            },
          },
        },
      };
    });
  }

  function updateCollateralReport(
    patch: Partial<NonNullable<StructuredEvidenceRecord["workflow"]["collateral_report"]>>,
  ) {
    setRecord((current) => {
      const fallback = emptyStructuredEvidenceRecord("collateral_report").workflow.collateral_report!;
      return {
        ...current,
        workflow: {
          ...current.workflow,
          collateral_report: {
            ...fallback,
            ...current.workflow.collateral_report,
            ...patch,
          },
        },
      };
    });
  }

  function updateSelfReportInterview(
    patch: Partial<NonNullable<StructuredEvidenceRecord["workflow"]["self_report_interview"]>>,
  ) {
    setRecord((current) => {
      const fallback = emptyStructuredEvidenceRecord("self_report_interview").workflow.self_report_interview!;
      return {
        ...current,
        workflow: {
          ...current.workflow,
          self_report_interview: {
            ...fallback,
            ...current.workflow.self_report_interview,
            ...patch,
          },
        },
      };
    });
  }

  function updateInsightDimension(dimension: string, value: string) {
    setRecord((current) => {
      const fallback = emptyStructuredEvidenceRecord("self_report_interview").workflow.self_report_interview!;
      return {
        ...current,
        workflow: {
          ...current.workflow,
          self_report_interview: {
            ...fallback,
            ...current.workflow.self_report_interview,
            insight_dimensions: {
              ...fallback.insight_dimensions,
              ...current.workflow.self_report_interview?.insight_dimensions,
              [dimension]: value,
            },
          },
        },
      };
    });
  }

  function updateObjectiveMeasure(
    patch: Partial<NonNullable<StructuredEvidenceRecord["workflow"]["objective_measure"]>>,
  ) {
    setRecord((current) => {
      const fallback = emptyStructuredEvidenceRecord("objective_measure").workflow.objective_measure!;
      return {
        ...current,
        workflow: {
          ...current.workflow,
          objective_measure: {
            ...fallback,
            ...current.workflow.objective_measure,
            ...patch,
          },
        },
      };
    });
  }

  function changeEvidenceType(nextType: StructuredEvidenceType) {
    setEvidenceType(nextType);
    setRecord(emptyStructuredEvidenceRecord(nextType));
    setListFields({
      people_present: "",
      strengths_observed: "",
      concerns_observed: "",
      external_barriers: "",
      contrary_evidence: "",
      limitations: "",
    });
  }

  function buildStructuredRecord(): StructuredEvidenceRecord {
    return {
      ...record,
      evidence_type: evidenceType,
      people_present: splitLines(listFields.people_present),
      strengths_observed: splitLines(listFields.strengths_observed),
      concerns_observed: splitLines(listFields.concerns_observed),
      external_barriers: splitLines(listFields.external_barriers),
      contrary_evidence: splitLines(listFields.contrary_evidence),
      limitations: splitLines(listFields.limitations),
      attachments: attachment ? [attachment.name] : [],
    };
  }

  const loadEvidence = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const syncResult = await syncPendingOfflineEvidence();
      if (syncResult.syncedCount > 0) {
        setMessage(`${syncResult.syncedCount} offline evidence item${syncResult.syncedCount === 1 ? "" : "s"} uploaded.`);
      }

      const savedItems = await fetchEvidenceItems();
      const queuedItems = await getPendingOfflineEvidenceItems();
      const availability = await fetchEvidenceCaseReviewAvailability();
      setItems(savedItems);
      setPendingItems(queuedItems);
      setReviewAvailability(availability);
    } catch (loadError) {
      try {
        setPendingItems(await getPendingOfflineEvidenceItems());
      } catch {
        setPendingItems([]);
      }
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
    if (record.purpose.trim().length === 0 || saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const structuredRecord = buildStructuredRecord();
      const readiness = evidenceReviewReadiness({
        record: structuredRecord,
        reviewAvailability: reviewAvailability.status,
      });
      const result = await createEvidenceItemWithOfflineFallback({
        title: structuredEvidenceTitle(structuredRecord),
        notes: structuredEvidenceNotes(structuredRecord),
        evidence_type: structuredRecord.evidence_type,
        purpose: structuredRecord.purpose,
        structured_data: {
          ...(structuredRecord as unknown as Record<string, unknown>),
          task_id: linkedTaskContext.task_id,
          task_title: linkedTaskContext.task_title,
          challenge_id: linkedTaskContext.challenge_id,
          review_availability: reviewAvailability,
          review_readiness: readiness,
        },
        attachment,
      });

      changeEvidenceType(evidenceType);
      setAttachment(null);
      if (result.mode === "online") {
        await loadEvidence();
        setMessage("Evidence saved.");
      } else {
        setPendingItems(await getPendingOfflineEvidenceItems());
        setMessage(
          "No connection detected. Evidence has been sealed in the offline vault and will upload when sync succeeds.",
        );
      }
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

  async function handleSyncOfflineVault() {
    if (syncing) return;

    setSyncing(true);
    setError("");
    setMessage("");

    try {
      const result = await syncPendingOfflineEvidence();
      setMessage(
        result.syncedCount > 0
          ? `${result.syncedCount} offline evidence item${result.syncedCount === 1 ? "" : "s"} uploaded.`
          : "No offline evidence could be uploaded yet. It will stay sealed in the vault.",
      );
      await loadEvidence();
    } catch (syncError) {
      setError(
        syncError instanceof Error
          ? syncError.message
          : "Could not sync offline evidence.",
      );
    } finally {
      setSyncing(false);
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
      if (!record.purpose.trim()) updateRecord({ purpose: picked.name.replace(/\.[^/.]+$/, "") });
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
      if (!record.purpose.trim()) updateRecord({ purpose: "Live evidence capture" });
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
  const liveReadiness = evidenceReviewReadiness({
    record: buildStructuredRecord(),
    reviewAvailability: reviewAvailability.status,
  });

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Evidence
      </Text>

      <Text style={{ marginBottom: 16 }}>
        Evidence uses separate structured workflows so direct observations,
        collateral reports, self-reports, and objective measures keep facts,
        reported information, interpretation, context, and responses separate.
      </Text>

      <View
        style={{
          padding: 16,
          backgroundColor: pendingItems.length > 0 ? "#fff4d6" : "#eef7f3",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Offline evidence vault
        </Text>
        <Text style={{ marginTop: 6, lineHeight: 21 }}>
          If internet drops, evidence is sealed locally with tamper-evident vault
          hashes and uploaded when sync succeeds.
        </Text>
        <Text style={{ marginTop: 8, fontWeight: "bold" }}>
          Pending upload: {pendingItems.length}
        </Text>
        {pendingItems.length > 0 ? (
          <Pressable
            disabled={syncing}
            onPress={handleSyncOfflineVault}
            style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: syncing ? "#c7d1cb" : "#2f5f4a",
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
              {syncing ? "Syncing..." : "Sync Offline Evidence"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: reviewAvailability.status === "linked_worker_available" ? "#eef7f3" : "#fff4d6",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Case review availability</Text>
        <Text style={{ marginTop: 6, lineHeight: 21 }}>
          {reviewAvailability.status === "linked_worker_available"
            ? `Linked case/support worker review is available for ${reviewAvailability.caseIds.length} case file${reviewAvailability.caseIds.length === 1 ? "" : "s"}.`
            : reviewAvailability.status === "no_linked_worker"
              ? "No case/support worker is currently linked to this family case file. Evidence remains a parent/family record and should not be labelled worker-reviewed."
              : "SafeSteps could not confirm case/support worker linkage. Evidence can be saved, but review status should stay unconfirmed."}
        </Text>
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: "#f1f5f3",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Add Structured Evidence Record
        </Text>

        {liveReadiness.warnings.length > 0 ? (
          <View
            style={{
              padding: 12,
              backgroundColor: "#fff4d6",
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Report-readiness warnings</Text>
            {liveReadiness.warnings.map((warning) => (
              <Text key={warning} style={{ marginTop: 4 }}>
                - {warning}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {structuredEvidenceTypes.map((type) => (
            <Pressable
              key={type.id}
              onPress={() => changeEvidenceType(type.id)}
              style={{
                padding: 10,
                backgroundColor: evidenceType === type.id ? "#2f5f4a" : "#ffffff",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#cbd8d0",
              }}
            >
              <Text style={{ color: evidenceType === type.id ? "#ffffff" : "#163b2c", fontWeight: "bold" }}>
                {type.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {linkedTaskContext.task_title ? (
          <View
            style={{
              padding: 12,
              backgroundColor: "#fff4d6",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#e4c16f",
              marginTop: 10,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Linked challenge evidence</Text>
            <Text style={{ marginTop: 4 }}>
              Saving this record will attach evidence to: {linkedTaskContext.task_title}
            </Text>
          </View>
        ) : null}

        <TextInput
          value={record.purpose}
          onChangeText={(purpose) => updateRecord({ purpose })}
          placeholder={
            linkedTaskContext.task_title
              ? `Purpose. Example: evidence for ${linkedTaskContext.task_title}`
              : "Purpose. Example: Assess response to child distress"
          }
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
          value={record.location}
          onChangeText={(location) => updateRecord({ location })}
          placeholder="Location"
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

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            value={record.collector.role}
            onChangeText={(role) => updateCollector("role", role)}
            placeholder="Collector role"
            style={{
              flex: 1,
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
            value={record.collector.relationship_to_case}
            onChangeText={(relationship_to_case) => updateCollector("relationship_to_case", relationship_to_case)}
            placeholder="Relationship to case"
            style={{
              flex: 1,
              minHeight: 50,
              borderWidth: 1,
              borderColor: "#cbd8d0",
              borderRadius: 10,
              padding: 12,
              marginTop: 10,
              backgroundColor: "#ffffff",
            }}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            value={record.consent_or_authority.basis}
            onChangeText={(basis) => updateConsent("basis", basis)}
            placeholder="Consent or lawful authority basis"
            style={{
              flex: 1,
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
            value={record.consent_or_authority.scope}
            onChangeText={(scope) => updateConsent("scope", scope)}
            placeholder="Consent or authority scope"
            style={{
              flex: 1,
              minHeight: 50,
              borderWidth: 1,
              borderColor: "#cbd8d0",
              borderRadius: 10,
              padding: 12,
              marginTop: 10,
              backgroundColor: "#ffffff",
            }}
          />
        </View>

        <TextInput
          value={listFields.people_present}
          onChangeText={(people_present) => setListFields((current) => ({ ...current, people_present }))}
          placeholder="People present, separated by commas or new lines"
          style={{
            minHeight: 70,
            borderWidth: 1,
            borderColor: "#cbd8d0",
            borderRadius: 10,
            padding: 12,
            marginTop: 10,
            backgroundColor: "#ffffff",
            textAlignVertical: "top",
          }}
          multiline
        />

        <TextInput
          value={record.observable_facts}
          onChangeText={(observable_facts) => updateRecord({ observable_facts })}
          placeholder="Observable facts only. What exactly occurred?"
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

        <TextInput
          value={record.child_context}
          onChangeText={(child_context) => updateRecord({ child_context })}
          placeholder="Child context: age, disability, temperament, trauma history, cues, or privacy needs"
          multiline
          style={{
            minHeight: 80,
            borderWidth: 1,
            borderColor: "#cbd8d0",
            borderRadius: 10,
            padding: 12,
            marginTop: 10,
            backgroundColor: "#ffffff",
            textAlignVertical: "top",
          }}
        />

        <TextInput
          value={record.parent_context}
          onChangeText={(parent_context) => updateRecord({ parent_context })}
          placeholder="Parent context: stressors, health, communication needs, support barriers, or adjustments"
          multiline
          style={{
            minHeight: 80,
            borderWidth: 1,
            borderColor: "#cbd8d0",
            borderRadius: 10,
            padding: 12,
            marginTop: 10,
            backgroundColor: "#ffffff",
            textAlignVertical: "top",
          }}
        />

        <TextInput
          value={record.reported_information}
          onChangeText={(reported_information) => updateRecord({ reported_information })}
          placeholder="Reported information. Who said what, and was it exact words or a summary?"
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

        <TextInput
          value={record.professional_interpretation}
          onChangeText={(professional_interpretation) => updateRecord({ professional_interpretation })}
          placeholder="Professional interpretation, kept separate from facts"
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

        <TextInput
          value={record.parent_response}
          onChangeText={(parent_response) => updateRecord({ parent_response })}
          placeholder="Parent response or correction before finalisation"
          multiline
          style={{
            minHeight: 80,
            borderWidth: 1,
            borderColor: "#cbd8d0",
            borderRadius: 10,
            padding: 12,
            marginTop: 10,
            backgroundColor: "#ffffff",
            textAlignVertical: "top",
          }}
        />

        <TextInput
          value={record.child_response}
          onChangeText={(child_response) => updateRecord({ child_response })}
          placeholder="Child response, cues, engagement, fear, avoidance, or behaviour changes"
          multiline
          style={{
            minHeight: 80,
            borderWidth: 1,
            borderColor: "#cbd8d0",
            borderRadius: 10,
            padding: 12,
            marginTop: 10,
            backgroundColor: "#ffffff",
            textAlignVertical: "top",
          }}
        />

        <TextInput
          value={listFields.strengths_observed}
          onChangeText={(strengths_observed) => setListFields((current) => ({ ...current, strengths_observed }))}
          placeholder="Strengths observed"
          multiline
          style={{
            minHeight: 70,
            borderWidth: 1,
            borderColor: "#cbd8d0",
            borderRadius: 10,
            padding: 12,
            marginTop: 10,
            backgroundColor: "#ffffff",
            textAlignVertical: "top",
          }}
        />

        <TextInput
          value={listFields.concerns_observed}
          onChangeText={(concerns_observed) => setListFields((current) => ({ ...current, concerns_observed }))}
          placeholder="Concerns observed"
          multiline
          style={{
            minHeight: 70,
            borderWidth: 1,
            borderColor: "#cbd8d0",
            borderRadius: 10,
            padding: 12,
            marginTop: 10,
            backgroundColor: "#ffffff",
            textAlignVertical: "top",
          }}
        />

        <TextInput
          value={listFields.external_barriers}
          onChangeText={(external_barriers) => setListFields((current) => ({ ...current, external_barriers }))}
          placeholder="External barriers: attendance, cost, transport, availability, housing, service access"
          multiline
          style={{
            minHeight: 70,
            borderWidth: 1,
            borderColor: "#cbd8d0",
            borderRadius: 10,
            padding: 12,
            marginTop: 10,
            backgroundColor: "#ffffff",
            textAlignVertical: "top",
          }}
        />

        {evidenceType === "direct_observation" && record.workflow.direct_observation ? (
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
            <Text style={{ fontWeight: "bold" }}>Direct observation details</Text>
            <TextInput
              value={record.workflow.direct_observation.scheduled_or_unannounced}
              onChangeText={(scheduled_or_unannounced) => updateDirectObservation({ scheduled_or_unannounced })}
              placeholder="Scheduled or unannounced, and visit conditions"
              style={{
                minHeight: 50,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
              }}
            />
            <TextInput
              value={record.workflow.direct_observation.lawful_basis}
              onChangeText={(lawful_basis) => updateDirectObservation({ lawful_basis })}
              placeholder="Lawful basis for observation"
              style={{
                minHeight: 50,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
              }}
            />
            <TextInput
              value={record.workflow.direct_observation.cultural_disability_language_needs}
              onChangeText={(cultural_disability_language_needs) =>
                updateDirectObservation({ cultural_disability_language_needs })
              }
              placeholder="Cultural, disability, language, or communication needs"
              multiline
              style={{
                minHeight: 80,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
                textAlignVertical: "top",
              }}
            />
            <TextInput
              value={record.workflow.direct_observation.unusual_conditions}
              onChangeText={(unusual_conditions) => updateDirectObservation({ unusual_conditions })}
              placeholder="Unusual, artificial, stressful, or interrupting conditions"
              multiline
              style={{
                minHeight: 80,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
                textAlignVertical: "top",
              }}
            />
            <TextInput
              value={record.workflow.direct_observation.observation_guide}
              onChangeText={(observation_guide) => updateDirectObservation({ observation_guide })}
              placeholder="Observation guide used"
              style={{
                minHeight: 50,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
              }}
            />
            {Object.entries(record.workflow.direct_observation.domains).map(([domain, value]) => (
              <TextInput
                key={domain}
                value={value}
                onChangeText={(nextValue) => updateObservationDomain(domain, nextValue)}
                placeholder={`${domain}: exact behaviour, context, strengths, and concerns`}
                multiline
                style={{
                  minHeight: 70,
                  borderWidth: 1,
                  borderColor: "#cbd8d0",
                  borderRadius: 10,
                  padding: 12,
                  marginTop: 10,
                  textAlignVertical: "top",
                }}
              />
            ))}
          </View>
        ) : null}

        {evidenceType === "collateral_report" && record.workflow.collateral_report ? (
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
            <Text style={{ fontWeight: "bold" }}>Collateral report details</Text>
            <TextInput
              value={record.workflow.collateral_report.source_organisation}
              onChangeText={(source_organisation) => updateCollateralReport({ source_organisation })}
              placeholder="Organisation contacted"
              style={{
                minHeight: 50,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
              }}
            />
            <TextInput
              value={record.workflow.collateral_report.provider_role}
              onChangeText={(provider_role) => updateCollateralReport({ provider_role })}
              placeholder="Provider role"
              style={{
                minHeight: 50,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
              }}
            />
            <TextInput
              value={record.workflow.collateral_report.directly_observed}
              onChangeText={(directly_observed) => updateCollateralReport({ directly_observed })}
              placeholder="What did the provider personally observe?"
              multiline
              style={{
                minHeight: 80,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
                textAlignVertical: "top",
              }}
            />
            <TextInput
              value={record.workflow.collateral_report.records_supporting_information}
              onChangeText={(records_supporting_information) =>
                updateCollateralReport({ records_supporting_information })
              }
              placeholder="Records supporting the information"
              multiline
              style={{
                minHeight: 80,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
                textAlignVertical: "top",
              }}
            />
            <TextInput
              value={record.workflow.collateral_report.exact_words_or_summary}
              onChangeText={(exact_words_or_summary) => updateCollateralReport({ exact_words_or_summary })}
              placeholder="Exact words or summary?"
              multiline
              style={{
                minHeight: 80,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
                textAlignVertical: "top",
              }}
            />
            <TextInput
              value={record.workflow.collateral_report.information_current_until}
              onChangeText={(information_current_until) => updateCollateralReport({ information_current_until })}
              placeholder="Review or expiry date for this information"
              style={{
                minHeight: 50,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
              }}
            />
          </View>
        ) : null}

        {evidenceType === "self_report_interview" && record.workflow.self_report_interview ? (
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
            <Text style={{ fontWeight: "bold" }}>Self-report and interview details</Text>
            <TextInput
              value={record.workflow.self_report_interview.collection_method}
              onChangeText={(collection_method) => updateSelfReportInterview({ collection_method })}
              placeholder="Collection method: questionnaire, worker interview, voice-to-text, audio, translated"
              style={{
                minHeight: 50,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
              }}
            />
            <TextInput
              value={record.workflow.self_report_interview.support_person_or_adjustments}
              onChangeText={(support_person_or_adjustments) =>
                updateSelfReportInterview({ support_person_or_adjustments })
              }
              placeholder="Support person, interpreter, disability adjustment, or easy-read need"
              multiline
              style={{
                minHeight: 80,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
                textAlignVertical: "top",
              }}
            />
            <TextInput
              value={record.workflow.self_report_interview.parent_own_words}
              onChangeText={(parent_own_words) => updateSelfReportInterview({ parent_own_words })}
              placeholder="Parent's own words where important"
              multiline
              style={{
                minHeight: 90,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
                textAlignVertical: "top",
              }}
            />
            <TextInput
              value={record.workflow.self_report_interview.corrections_before_locking}
              onChangeText={(corrections_before_locking) =>
                updateSelfReportInterview({ corrections_before_locking })
              }
              placeholder="Corrections requested before record locking"
              multiline
              style={{
                minHeight: 80,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
                textAlignVertical: "top",
              }}
            />
            {Object.entries(record.workflow.self_report_interview.insight_dimensions).map(([dimension, value]) => (
              <TextInput
                key={dimension}
                value={value}
                onChangeText={(nextValue) => updateInsightDimension(dimension, nextValue)}
                placeholder={dimension}
                multiline
                style={{
                  minHeight: 70,
                  borderWidth: 1,
                  borderColor: "#cbd8d0",
                  borderRadius: 10,
                  padding: 12,
                  marginTop: 10,
                  textAlignVertical: "top",
                }}
              />
            ))}
          </View>
        ) : null}

        {evidenceType === "objective_measure" && record.workflow.objective_measure ? (
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
            <Text style={{ fontWeight: "bold" }}>Objective measure details</Text>
            <TextInput
              value={record.workflow.objective_measure.tool_name_version}
              onChangeText={(tool_name_version) => updateObjectiveMeasure({ tool_name_version })}
              placeholder="Tool name and version"
              style={{
                minHeight: 50,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
              }}
            />
            <TextInput
              value={record.workflow.objective_measure.administrator_qualifications}
              onChangeText={(administrator_qualifications) =>
                updateObjectiveMeasure({ administrator_qualifications })
              }
              placeholder="Administrator and qualifications"
              style={{
                minHeight: 50,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
              }}
            />
            <TextInput
              value={record.workflow.objective_measure.validated_population}
              onChangeText={(validated_population) => updateObjectiveMeasure({ validated_population })}
              placeholder="Population/language/accessibility group for which tool was validated"
              multiline
              style={{
                minHeight: 80,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
                textAlignVertical: "top",
              }}
            />
            <TextInput
              value={record.workflow.objective_measure.raw_result}
              onChangeText={(raw_result) => updateObjectiveMeasure({ raw_result })}
              placeholder="Raw result"
              multiline
              style={{
                minHeight: 70,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
                textAlignVertical: "top",
              }}
            />
            <TextInput
              value={record.workflow.objective_measure.scoring_rules}
              onChangeText={(scoring_rules) => updateObjectiveMeasure({ scoring_rules })}
              placeholder="Scoring rules"
              multiline
              style={{
                minHeight: 80,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
                textAlignVertical: "top",
              }}
            />
            <TextInput
              value={record.workflow.objective_measure.limitations}
              onChangeText={(limitations) => updateObjectiveMeasure({ limitations })}
              placeholder="Limitations, false positives/negatives, culture/disability considerations"
              multiline
              style={{
                minHeight: 90,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
                textAlignVertical: "top",
              }}
            />
            <TextInput
              value={record.workflow.objective_measure.confirmation_testing}
              onChangeText={(confirmation_testing) => updateObjectiveMeasure({ confirmation_testing })}
              placeholder="Confirmation testing or disputed-screen follow-up"
              multiline
              style={{
                minHeight: 70,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
                textAlignVertical: "top",
              }}
            />
            <TextInput
              value={record.workflow.objective_measure.review_or_expiry_date}
              onChangeText={(review_or_expiry_date) => updateObjectiveMeasure({ review_or_expiry_date })}
              placeholder="Review or expiry date"
              style={{
                minHeight: 50,
                borderWidth: 1,
                borderColor: "#cbd8d0",
                borderRadius: 10,
                padding: 12,
                marginTop: 10,
              }}
            />
          </View>
        ) : null}

        <TextInput
          value={listFields.contrary_evidence}
          onChangeText={(contrary_evidence) => setListFields((current) => ({ ...current, contrary_evidence }))}
          placeholder="Contrary evidence or information needing review"
          multiline
          style={{
            minHeight: 80,
            borderWidth: 1,
            borderColor: "#cbd8d0",
            borderRadius: 10,
            padding: 12,
            marginTop: 10,
            backgroundColor: "#ffffff",
            textAlignVertical: "top",
          }}
        />

        <TextInput
          value={listFields.limitations}
          onChangeText={(limitations) => setListFields((current) => ({ ...current, limitations }))}
          placeholder="Limitations, safeguards, context, or expiry/review issues"
          multiline
          style={{
            minHeight: 80,
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
          disabled={record.purpose.trim().length === 0 || saving}
          onPress={handleSaveEvidence}
          style={{
            marginTop: 12,
            padding: 12,
            backgroundColor: record.purpose.trim().length > 0 ? "#eef6f2" : "#e5e5e5",
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
