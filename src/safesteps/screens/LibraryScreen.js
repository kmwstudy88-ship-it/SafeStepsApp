import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LibraryScreen() {
  const navigation = useNavigation();

  const options = [
    { label: 'Courses', route: 'CoursesScreen' },
    { label: 'Lessons', route: 'LessonsScreen' },
    { label: 'Topics', route: 'TopicsScreen' },
    { label: 'Categories', route: 'CategoriesScreen' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SafeSteps Library</Text>
      <Text style={styles.subtitle}>Choose what you want to explore:</Text>

      {options.map((opt) => (
        <TouchableOpacity
          key={opt.label}
          style={styles.button}
          onPress={() => navigation.navigate(opt.route)}
        >
          <Text style={styles.buttonText}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 25,
    color: '#555',
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});