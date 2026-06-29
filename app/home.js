import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SafeSteps</Text>
      <Text style={styles.subtitle}>Your journey. Your progress. Your record.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#1A3C40', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#2E4A4E', textAlign: 'center' },
});
