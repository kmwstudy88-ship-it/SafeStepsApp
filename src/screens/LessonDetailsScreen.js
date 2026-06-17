// LessonDetailsScreen.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getLessonById } from '../curriculum/curriculumLoader';

export default function LessonDetailsScreen({ route }) {
  const { lessonId } = route.params;
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Lesson not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{lesson.name}</Text>
      <Text style={styles.description}>{lesson.description}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  description: {
    fontSize: 16,
    marginTop: 10
  },
  error: {
    fontSize: 18,
    color: 'red'
  }
});