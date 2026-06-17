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
    elevation: 4
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  }
});
