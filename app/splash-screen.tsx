import { View, Text, StyleSheet } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SafeSteps</Text>
      <Text style={styles.subtitle}>Your journey starts here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 40, fontWeight: '800' },
  subtitle: { fontSize: 18, marginTop: 10 },
});
