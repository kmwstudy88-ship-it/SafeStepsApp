import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  CertificateRecord,
  findMatchingCertificate,
  issueCertificate,
  listMyCertificates,
} from "../../lib/platform/certificates";

const completionCertificateType = "standalone_course";
const completionLevelTitle = "SafeSteps completion record";

export default function CertificatesScreen() {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      setCertificates(await listMyCertificates());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function issueCompletionCertificate() {
    if (issuing) return;

    setIssuing(true);
    setMessage("");

    try {
      const existingCertificate = findMatchingCertificate(
        certificates,
        completionCertificateType,
        completionLevelTitle,
      );

      if (existingCertificate) {
        setMessage(`Completion certificate already issued: ${existingCertificate.certificate_number}.`);
        return;
      }

      await issueCertificate({
        certificateType: completionCertificateType,
        levelTitle: completionLevelTitle,
      });
      await load();
      setMessage("Completion certificate issued.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not issue certificate.");
    } finally {
      setIssuing(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Certificates</Text>
      <Text style={styles.body}>Issue a completion record when the current SafeSteps work has been reviewed and is ready to certify.</Text>
      <Pressable style={[styles.button, issuing && styles.disabled]} onPress={issueCompletionCertificate} disabled={issuing}>
        <Text style={styles.buttonText}>{issuing ? "Issuing..." : "Issue completion certificate"}</Text>
      </Pressable>
      {message ? <Text style={message.startsWith("Could") ? styles.error : styles.notice}>{message}</Text> : null}
      {loading && <ActivityIndicator />}
      {!loading && certificates.map((certificate) => (
        <View key={certificate.id} style={styles.card}>
          <Text style={styles.cardTitle}>{certificate.level_title}</Text>
          <Text>{certificate.certificate_type}</Text>
          <Text>{certificate.certificate_number}</Text>
          <Text>{new Date(certificate.issued_at).toLocaleString()}</Text>
        </View>
      ))}
      {!loading && certificates.length === 0 && <Text>No certificates yet.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, backgroundColor: "#eef5ef" },
  title: { fontSize: 28, fontWeight: "800" },
  body: { fontSize: 16, lineHeight: 23 },
  button: { backgroundColor: "#2f5f4a", padding: 15, borderRadius: 16, alignItems: "center" },
  disabled: { opacity: 0.65 },
  buttonText: { color: "white", fontWeight: "800" },
  notice: { color: "#067647", fontWeight: "700" },
  error: { color: "#B42318", fontWeight: "700" },
  card: { backgroundColor: "white", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#d6e2d8" },
  cardTitle: { fontSize: 18, fontWeight: "800" },
});
