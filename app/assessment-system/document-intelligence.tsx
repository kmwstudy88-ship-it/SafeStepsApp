import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";

import {
  AssessmentCard,
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import {
  analyzeDocumentFile,
  analyzeDocumentText,
  type DocumentIntelligenceFile,
  type DocumentIntelligenceResponse,
} from "../../lib/documentIntelligenceApi";

const prioritySections = [
  "safetyRisk",
  "childSafetyIndicator",
  "parentCapacity",
  "strengths",
  "discrepancies",
  "actionPlan",
  "caseworkerAccountability",
  "evidenceWeighting",
] as const;

const sectionLabels: Record<string, string> = {
  actionPlan: "Action Plan",
  attachmentQuality: "Attachment Quality",
  behaviourPattern: "Behaviour Pattern",
  caseComplexity: "Case Complexity",
  caseworkerAccountability: "Caseworker Accountability",
  caseworkerBias: "Caseworker Bias",
  caseworkerFollowThrough: "Caseworker Follow Through",
  caseworkerOmissions: "Caseworker Omissions",
  childSafetyIndicator: "Child Safety Indicator",
  childVoice: "Child Voice",
  childWellbeing: "Child Wellbeing",
  communicationSkill: "Communication Skill",
  contactVisit: "Contact Visit",
  crisisHistory: "Crisis History",
  culturalContext: "Cultural Context",
  developmentalAppropriateness: "Developmental Appropriateness",
  discrepancies: "Discrepancies",
  documentQuality: "Document Quality",
  domesticViolence: "Domestic Violence Pattern",
  educationStability: "Education Stability",
  emotionalRegulationSupport: "Emotional Regulation Support",
  emotionalState: "Emotional State",
  environmentalRisk: "Environmental Risk",
  evidenceWeighting: "Evidence Weighting",
  financialStress: "Financial Stress",
  healthNeeds: "Health Needs",
  homeManagement: "Home Management",
  housingStability: "Housing Stability",
  learningEngagement: "Learning Engagement",
  mentalHealthIndicators: "Mental Health Indicators",
  parentAdvocacy: "Parent Advocacy",
  parentCapacity: "Parent Capacity",
  parentInsight: "Parent Insight",
  parentingSkill: "Parenting Skill",
  parentProgress: "Parent Progress",
  routineManagement: "Routine Management",
  safetyPlanQuality: "Safety Plan Quality",
  safetyRisk: "Safety Risk",
  serviceEngagement: "Service Engagement",
  socialConnection: "Social Connection",
  strengths: "Strengths",
  substanceUse: "Substance Use Pattern",
  supportNetwork: "Support Network",
};

export default function DocumentIntelligenceScreen() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<DocumentIntelligenceFile | null>(null);
  const [result, setResult] = useState<DocumentIntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const secondarySections = useMemo(() => {
    if (!result) return [];
    const priority = new Set(prioritySections);
    return Object.keys(result.result.sections).filter((key) => !priority.has(key as (typeof prioritySections)[number]));
  }, [result]);

  async function handlePickDocument() {
    setError("");
    setMessage("");

    const picked = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: [
        "application/pdf",
        "text/plain",
        "text/csv",
        "text/markdown",
        "application/json",
      ],
    });

    if (!picked.canceled) {
      const asset = picked.assets[0];
      setFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
      });
    }
  }

  async function handleAnalyze() {
    if (loading || (!text.trim() && !file)) return;

    setLoading(true);
    setError("");
    setMessage("");
    setResult(null);

    try {
      const analysis = file ? await analyzeDocumentFile(file, text) : await analyzeDocumentText(text.trim());
      setResult(analysis);
      setMessage("Document intelligence completed. Review the outputs before linking them to case notes or reports.");
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Document intelligence failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AssessmentScreenShell
      title="Document Intelligence"
      subtitle="Review document text across parent capacity, child wellbeing, safety risk, evidence quality, and caseworker-context signals."
    >
      <AssessmentCard>
        <Text style={styles.cardTitle}>Document input</Text>
        <Text style={styles.cardText}>
          Paste case text or upload a supported document. AI outputs are review prompts for workers and supervisors, not verified findings.
        </Text>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Paste assessment notes, case notes, orders, reports, or extracted document text."
          multiline
          style={styles.textArea}
        />

        <View style={styles.buttonRow}>
          <Pressable onPress={handlePickDocument} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Choose Document</Text>
          </Pressable>
          {file ? (
            <Pressable onPress={() => setFile(null)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Remove File</Text>
            </Pressable>
          ) : null}
          <Pressable
            disabled={loading || (!text.trim() && !file)}
            onPress={handleAnalyze}
            style={[styles.primaryButton, (loading || (!text.trim() && !file)) && styles.disabledButton]}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Analyze</Text>}
          </Pressable>
        </View>

        {file ? <Text style={styles.fileText}>Selected: {file.name}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </AssessmentCard>

      {result ? (
        <AssessmentCard>
          <Text style={styles.cardTitle}>Review Summary</Text>
          <View style={styles.sourceGrid}>
            <SummaryPill label="Input" value={result.source.mode === "file" ? "File" : "Text"} />
            <SummaryPill label="Characters" value={result.source.textLength.toLocaleString()} />
            <SummaryPill label="Sections" value={Object.keys(result.result.sections).length.toString()} />
            <SummaryPill label="Model" value={result.result.model} />
          </View>

          <AnalysisOverview result={result.result} />

          <Text style={styles.sectionTitle}>Priority review sections</Text>
          {prioritySections.map((key) =>
            result.result.sections[key] ? (
              <AnalysisSection key={key} title={sectionLabels[key]} section={result.result.sections[key]} />
            ) : null,
          )}

          <Text style={styles.sectionTitle}>Full analysis set</Text>
          {secondarySections.map((key) => (
            <AnalysisSection key={key} title={sectionLabels[key] ?? key} section={result.result.sections[key]} />
          ))}
        </AssessmentCard>
      ) : null}
    </AssessmentScreenShell>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryPill}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function AnalysisOverview({ result }: { result: DocumentIntelligenceResponse["result"] }) {
  return (
    <View style={styles.overview}>
      <Text style={styles.analysisTitle}>Overall summary</Text>
      <Text style={styles.analysisText}>{result.overallSummary}</Text>
      <BulletGroup title="Priority review" items={result.priorityReview} />
      <BulletGroup title="Safety flags" items={result.safetyFlags} />
      <BulletGroup title="Evidence gaps" items={result.evidenceGaps} />
      <BulletGroup title="Worker review actions" items={result.workerReviewActions} />
      <Text style={styles.disclaimer}>{result.disclaimer}</Text>
    </View>
  );
}

function AnalysisSection({
  title,
  section,
}: {
  title: string;
  section: DocumentIntelligenceResponse["result"]["sections"][string];
}) {
  return (
    <View style={styles.analysisSection}>
      <View style={styles.analysisHeader}>
        <Text style={styles.analysisTitle}>{title}</Text>
        <Text style={[styles.confidence, styles[`confidence_${section.confidence}`]]}>
          {section.confidence.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.analysisText}>{section.summary}</Text>
      <BulletGroup title="Signals" items={section.signals} />
      <BulletGroup title="Evidence refs" items={section.evidenceRefs} />
      <BulletGroup title="Gaps" items={section.gaps} />
      <BulletGroup title="Review prompts" items={section.reviewPrompts} />
    </View>
  );
}

function BulletGroup({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <View style={styles.bulletGroup}>
      <Text style={styles.bulletTitle}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={styles.bulletItem}>
          {`\u2022 ${item}`}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    color: assessmentColors.charcoal,
    fontSize: 19,
    fontWeight: "800",
  },
  cardText: {
    color: assessmentColors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  textArea: {
    minHeight: 180,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
    color: assessmentColors.charcoal,
    padding: 12,
    fontSize: 15,
    lineHeight: 21,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  primaryButton: {
    minHeight: 44,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: assessmentColors.teal,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: assessmentColors.tealDark,
    fontSize: 14,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.5,
  },
  fileText: {
    color: assessmentColors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  message: {
    color: assessmentColors.tealDark,
    fontSize: 14,
    fontWeight: "800",
  },
  error: {
    color: assessmentColors.redText,
    fontSize: 14,
    fontWeight: "800",
  },
  sourceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryPill: {
    flexGrow: 1,
    flexBasis: 130,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: assessmentColors.sage,
    padding: 12,
  },
  summaryLabel: {
    color: assessmentColors.sageDark,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  summaryValue: {
    color: assessmentColors.charcoal,
    fontSize: 18,
    fontWeight: "900",
  },
  sectionTitle: {
    color: assessmentColors.charcoal,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 8,
  },
  overview: {
    gap: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: assessmentColors.sage,
    padding: 12,
  },
  analysisSection: {
    gap: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
    padding: 12,
  },
  analysisTitle: {
    color: assessmentColors.charcoal,
    fontSize: 15,
    fontWeight: "900",
  },
  analysisHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  confidence: {
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "900",
  },
  confidence_low: {
    backgroundColor: assessmentColors.red,
    color: assessmentColors.redText,
  },
  confidence_medium: {
    backgroundColor: assessmentColors.amber,
    color: assessmentColors.amberText,
  },
  confidence_high: {
    backgroundColor: assessmentColors.sage,
    color: assessmentColors.tealDark,
  },
  analysisText: {
    color: assessmentColors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  bulletGroup: {
    gap: 3,
  },
  bulletTitle: {
    color: assessmentColors.charcoal,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  bulletItem: {
    color: assessmentColors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  disclaimer: {
    color: assessmentColors.tealDark,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
});
