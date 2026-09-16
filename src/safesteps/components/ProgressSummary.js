import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProgressSummary({ week }) {
  const { completed_lessons, total_lessons, completion_rate } = week.progress;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{week.theme}</Text>
      <Text style={styles.summary}>{week.summary}</Text>
      <Text style={styles.progress}>
        Progress: {completed_lessons}/{total_lessons} lessons ({completion_rate}%)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { margin: 20, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  summary: { fontSize: 14, marginBottom: 10 },
  progress: { fontSize: 14, fontWeight: '600', color: '#007AFF' },
});D