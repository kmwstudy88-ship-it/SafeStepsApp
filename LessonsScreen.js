import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import lessonsData from '../assets/curriculum/lessons.json';

const LessonsScreen = ({ navigation }) => {
  const lessons = useMemo(
    () =>
      lessonsData.map((lesson, index) => ({
        key: lesson.id || `${index}`,
        ...lesson,
      })),
    []
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('LessonDetail', {
          lesson: item,
        })
      }
    >
      <Text style={styles.title}>{item.title || item.name}</Text>
      <Text style={styles.meta}>
        {item.program} • {item.stage} • {item.week}
      </Text>
      <Text style={styles.objective} numberOfLines={2}>
        {item.objective}
      </Text>
    </TouchableOpacity>
  );

  const getItemLayout = (_, index) => ({
    length: 90,
    offset: 90 * index,
    index,
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={lessons}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        initialNumToRender={30}
        maxToRenderPerBatch={40}
        windowSize={10}
        getItemLayout={getItemLayout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  meta: { fontSize: 12, color: '#666', marginBottom: 4 },
  objective: { fontSize: 13, color: '#333' },
});

export default LessonsScreen;