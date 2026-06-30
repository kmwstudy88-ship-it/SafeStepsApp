import { View, Text, StyleSheet } from 'react-native';

export default function HeaderBar({ title = "SafeSteps" }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    paddingHorizontal: 16,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12)'
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  }
});
