import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { issueCertificate, listMyCertificates } from "../../lib/platform/certificates";

export default function CertificatesScreen() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function createTestCertificate() {
    await issueCertificate({ certificateType: "standalone_course", levelTitle: "Standalone course completion" });
    await load();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Certificates</Text>
      <Text style={styles.body}>Certificates are now proper database records for standalone courses, program levels, and full program completion.</Text>
      <Pressable style={styles.button} onPress={createTestCertificate}>
        <Text style={styles.buttonText}>Issue test certificate</Text>
      </Pressable>
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
  buttonText: { color: "white", fontWeight: "800" },
  card: { backgroundColor: "white", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#d6e2d8" },
  cardTitle: { fontSize: 18, fontWeight: "800" },
});