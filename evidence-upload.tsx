import React, { useState } from "react";
import { View, Text, Button, FlatList, Image, StyleSheet } from "react-native";

type EvidenceItem = {
  id: string;
  uri: string;
  capturedAt: string;
};

export default function EvidenceUpload() {
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);

  function addEvidence(uri: string, capturedAt: string) {
    setEvidence((prev) => [
      {
        id: String(Date.now()),
        uri,
        capturedAt,
      },
      ...prev,
    ]);
  }

  function simulateCapture() {
    const uri: string = "https://placekitten.com/300/300";
    const capturedAt: string = new Date().toISOString();

    addEvidence(uri, capturedAt);
  }

  function renderItem({ item }: { item: EvidenceItem }) {
    return (
      <View style={styles.item}>
        <Image source={{ uri: item.uri }} style={styles.image} />
        <Text>Captured: {item.capturedAt}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evidence Upload</Text>

      <Button title="Add Evidence" onPress={simulateCapture} />

      <FlatList
        data={evidence}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  item: {
    marginBottom: 15,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
});