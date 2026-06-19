import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { loadAllLessons } from '../src/safesteps/loader';
import { useRouter } from 'expo-router';

export default function LessonMasterIndex() {
  const [lessons, setLessons] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchLessons() {
      const allLessons = await loadAllLessons();
      setLessons(allLessons);
    }
    fetchLessons();
  }, []);

  const renderLesson = ({ item, index }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/lesson/${index}`)}
    >
      <Text style={styles.title}>{item.title || item.lessonTitle || 'Untitled Lesson'}</Text>
      <Text style={styles.meta}>
        {item.program ? `Program: ${item.program}` : 'Program: Unassigned'}
      </Text>
      <Text style={styles.meta}>
        {item.week ? `Week: ${item.week}` : 'Week: Unspecified'}
      </Text>
      <Text style={styles.meta}>
        {item.category ? `Category: ${item.category}` : 'Category: General'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SafeSteps Lesson Master Index</Text>
      <Text style={styles.subheader}>All lessons in the curriculum</Text>
      <FlatList
        data={lessons}
        renderItem={renderLesson}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subheader: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
  meta: { fontSize: 14, color: '#666' },
});
