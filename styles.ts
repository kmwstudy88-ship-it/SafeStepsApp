import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#1A3C4E',
  accent: '#007AFF',
  text: '#2E4A4E',
  light: '#F5F7F8',
};

export const global = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.light,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  link: {
    fontSize: 18,
    color: colors.accent,
    marginVertical: 10,
  },
});
