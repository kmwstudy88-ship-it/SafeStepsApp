import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  AssessmentCard,
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import {
  analyzeDocumentFairness,
  type FairnessAnalysisResponse,
  type FairnessFinding,
} from "../../lib/fairnessDetectionApi";
import { saveEvidenceFairnessReviewOutcome } from "../../lib/services/evidenceVaultService";

export default function AssessmentFairnessReviewScreen() {
  const [text, setText] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [falsePositive, setFalsePositive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<FairnessAnalysisResponse | null>(null);

  const highSeverity = useMemo(
    () =>
      result
        ? [
            ...result.bias_indicators,
            ...result.coercion_flags,
            ...result.discrimination_risks,
            ...result.framing_concerns,
            ...result.unrealistic_expectations,
          ].filter((item) => item.severity === "high")
        : [],
    [result],
  );

  async function runFairnessAnalysis() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    setMessage("");
    setResult(null);
    try {
      const analysis = await analyzeDocumentFairness({
        text: text.trim(),
        documentId: documentId.trim() || null,
        caseContext: additionalContext.trim()
          ? { cultural_background: additionalContext.trim() }
          : null,
      });
      setResult(analysis);
      setMessage("Fairness analysis completed. Review results before using them in court-facing materials.");
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Fairness analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  async function saveReview() {
    if (!result?.analysis_id || !documentId.trim() || savingReview) return;
    setSavingReview(true);
    setError("");
    try {
      await saveEvidenceFairnessReviewOutcome(result.analysis_id, {
        status: falsePositive ? "rejected" : "confirmed",
        falsePositive,
        note: reviewNote,
        caseContextNote: additionalContext,
      });
      setMessage("Review outcome saved to evidence AI analysis.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save review outcome.");
    } finally {
      setSavingReview(false);
    }
  }

  return (
    <AssessmentScreenShell
      title="Fairness & Reviewability"
      subtitle="Detect bias, coercion, discriminatory framing, and developmental mismatch while keeping final decisions with human reviewers."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard>
          <Text style={styles.cardTitle}>Fairness Detection</Text>
          <Text style={styles.cardText}>
            Paste a case document extract, add optional evidence record context, and run fairness analysis.
          </Text>
          <TextInput
            value={documentId}
            onChangeText={setDocumentId}
            placeholder="Evidence record ID (optional)"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            value={additionalContext}
            onChangeText={setAdditionalContext}
            placeholder="Case-specific context or cultural background (optional)"
            multiline
            style={[styles.input, styles.contextInput]}
          />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Paste document text for fairness analysis."
            multiline
            style={styles.textArea}
          />
          <Pressable
            disabled={loading || !text.trim()}
            onPress={runFairnessAnalysis}
            style={[styles.primaryButton, (loading || !text.trim()) && styles.disabledButton]}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Analyze fairness</Text>}
          </Pressable>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </AssessmentCard>

        {result ? (
          <AssessmentCard>
            <Text style={styles.cardTitle}>Analysis result</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Fairness score</Text>
              <Text style={styles.scoreValue}>{result.fairness_score}/100</Text>
            </View>
            <Text style={styles.disclaimer}>{result.limitations}</Text>
            {documentId.trim() ? <Text style={styles.metaText}>Linked evidence record: {documentId.trim()}</Text> : null}

            {highSeverity.length ? (
              <View style={styles.block}>
                <Text style={styles.sectionTitle}>High severity flags</Text>
                {highSeverity.map((item, index) => (
                  <FindingRow key={`${item.category}-${index}`} item={item} />
                ))}
              </View>
            ) : null}

            <View style={styles.sideBySide}>
              <View style={styles.sidePane}>
                <Text style={styles.sectionTitle}>Original text</Text>
                <Text style={styles.body}>{text.trim()}</Text>
              </View>
              <View style={styles.sidePane}>
                <Text style={styles.sectionTitle}>Remediation suggestions</Text>
                {result.remediation_recommendations.map((recommendation, index) => (
                  <Text key={`${recommendation.concern}-${index}`} style={styles.bullet}>
                    {`\u2022 ${recommendation.concern}: ${recommendation.reframe}`}
                  </Text>
                ))}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Review outcome</Text>
            <Pressable
              onPress={() => setFalsePositive((value) => !value)}
              style={[styles.toggle, falsePositive && styles.toggleOn]}
            >
              <Text style={styles.toggleText}>
                {falsePositive ? "Marked as likely false positive" : "Mark as likely false positive"}
              </Text>
            </Pressable>
            <TextInput
              value={reviewNote}
              onChangeText={setReviewNote}
              placeholder="Reviewer note"
              multiline
              style={[styles.input, styles.contextInput]}
            />
            <Pressable
              onPress={saveReview}
              disabled={savingReview || !result.analysis_id || !documentId.trim()}
              style={[
                styles.secondaryButton,
                (savingReview || !result.analysis_id || !documentId.trim()) && styles.disabledButton,
              ]}
            >
              {savingReview ? (
                <ActivityIndicator color={assessmentColors.tealDark} />
              ) : (
                <Text style={styles.secondaryButtonText}>Save review outcome</Text>
              )}
            </Pressable>
          </AssessmentCard>
        ) : null}
      </ScrollView>
    </AssessmentScreenShell>
  );
}

function FindingRow({ item }: { item: FairnessFinding }) {
  return (
    <View style={styles.finding}>
      <Text style={styles.findingCategory}>{item.category.replaceAll("_", " ")}</Text>
      <Text style={styles.body}>{item.evidence}</Text>
      <Text style={styles.metaText}>{item.explanation}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14 },
  cardTitle: { color: assessmentColors.charcoal, fontSize: 19, fontWeight: "900" },
  cardText: { color: assessmentColors.muted, lineHeight: 21 },
  input: {
    borderWidth: 1,
    borderColor: assessmentColors.border,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FFFFFF",
    color: assessmentColors.charcoal,
  },
  contextInput: { minHeight: 72, textAlignVertical: "top" },
  textArea: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
    textAlignVertical: "top",
    color: assessmentColors.charcoal,
  },
  primaryButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: assessmentColors.teal,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "900" },
  secondaryButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: { color: assessmentColors.tealDark, fontWeight: "900" },
  disabledButton: { opacity: 0.55 },
  message: { color: assessmentColors.tealDark, fontWeight: "800" },
  error: { color: assessmentColors.redText, fontWeight: "800" },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: assessmentColors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: assessmentColors.sage,
  },
  scoreLabel: { color: assessmentColors.sageDark, fontWeight: "800" },
  scoreValue: { color: assessmentColors.charcoal, fontSize: 22, fontWeight: "900" },
  disclaimer: { color: assessmentColors.tealDark, fontSize: 12, fontWeight: "800" },
  metaText: { color: assessmentColors.muted, fontSize: 12 },
  block: { gap: 8 },
  sectionTitle: { color: assessmentColors.charcoal, fontWeight: "900", fontSize: 15 },
  finding: {
    borderWidth: 1,
    borderColor: assessmentColors.border,
    borderRadius: 8,
    padding: 10,
    gap: 5,
    backgroundColor: "#FFFFFF",
  },
  findingCategory: {
    color: assessmentColors.redText,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  sideBySide: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sidePane: {
    flexBasis: 260,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    borderRadius: 8,
    padding: 10,
    gap: 6,
    backgroundColor: "#FFFFFF",
  },
  body: { color: assessmentColors.charcoal, lineHeight: 20 },
  bullet: { color: assessmentColors.muted, lineHeight: 20 },
  toggle: {
    borderWidth: 1,
    borderColor: assessmentColors.border,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
  toggleOn: {
    borderColor: assessmentColors.redText,
    backgroundColor: assessmentColors.red,
  },
  toggleText: { color: assessmentColors.charcoal, fontWeight: "800" },
});
