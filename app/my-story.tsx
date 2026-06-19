import { View, Text, StyleSheet } from 'react-native';

export default function MyStoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Story</Text>
      <Text style={styles.subtitle}>Record your progress, achievements, and reflections</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 30, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 10, textAlign: 'center' },
});
