import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { loadLessons } from '../curriculum/curriculumLoader';

export default function LearningHubScreen({ navigation }) {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const data = loadLessons();
    setLessons(data);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Learning Hub</Text>

      {lessons.map(lesson => (
        <Button
          key={lesson.id}
          title={lesson.name}
          onPress={() =>
            navigation.navigate('LessonDetails', { lessonId: lesson.id })
          }
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  }
});