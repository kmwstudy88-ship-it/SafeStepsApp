import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function CreateAccountScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your SafeSteps Account</Text>
      <TextInput placeholder="Email" style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} />
      <Button title="Sign Up" onPress={() => alert('Account created!')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 10, borderRadius: 5 },
});
