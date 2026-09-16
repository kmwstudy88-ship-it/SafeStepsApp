import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

export default function LessonDetail({ route }) {
  const { lesson } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{lesson.title}</Text>
      <Text style={styles.meta}>{lesson.stage} • {lesson.week}</Text>

      <Text style={styles.heading}>Objective</Text>
      <Text style={styles.body}>{lesson.objective}</Text>

      <Text style={styles.heading}>Content</Text>
      <Text style={styles.body}>{lesson.content}</Text>

      <Text style={styles.heading}>Activities</Text>
      {lesson.activities?.map((a, i) => (
        <Text key={i} style={styles.body}>• {a}</Text>
      ))}

      <Text style={styles.heading}>Reflection</Text>
      <Text style={styles.body}>{lesson.reflection}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  meta: { fontSize: 12, color: '#666', marginBottom: 12 },
  heading: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  body: { fontSize: 14, marginBottom: 6 },
});
