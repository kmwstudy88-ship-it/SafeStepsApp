import { View, Text, StyleSheet } from 'react-native';

export default function LearningHub() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Learning Hub</Text>
      <Text style={styles.subtitle}>All lessons, skills, and growth tools in one place.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#1A3C40', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#2E4A4E', textAlign: 'center' },
});
