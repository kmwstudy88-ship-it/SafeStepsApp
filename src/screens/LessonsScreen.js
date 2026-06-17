import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import lessons from '../curriculum/lessons.json';

export default function LessonsScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.push('/lessons/detail', { lesson: item })}
    >
      <Text style={styles.title}>{item.title || item.name}</Text>
      <Text style={styles.meta}>{item.stage} • {item.week}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={lessons}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id + index}
        initialNumToRender={40}
        maxToRenderPerBatch={50}
        windowSize={12}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 12, color: '#666' },
});
