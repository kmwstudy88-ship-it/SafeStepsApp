import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { getDiscreetPin, getRecoveryCode, getRecoveryPhrase, saveDiscreetPin, saveRecoveryCode, saveRecoveryPhrase } from '../privacy/discreetModeCredentials';

type TrustedContact = {
  id: string;
  name: string;
  role: string;
  phone: string;
};

export function SettingsAccountScreen() {
  const [name, setName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [recoveryPhraseInput, setRecoveryPhraseInput] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [pinConfigured, setPinConfigured] = useState(false);
  const [recoveryConfigured, setRecoveryConfigured] = useState(false);
  const [securityStatusLoaded, setSecurityStatusLoaded] = useState(false);

  useEffect(() => {
    async function loadSecurityStatus() {
      try {
        const [pin, phrase, code] = await Promise.all([getDiscreetPin(), getRecoveryPhrase(), getRecoveryCode()]);
        setPinConfigured(Boolean(pin));
        setRecoveryConfigured(Boolean(phrase && code));
      } finally {
        setSecurityStatusLoaded(true);
      }
    }

    loadSecurityStatus();
  }, []);

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert('Contact details needed', 'Add at least a name and phone number for the trusted contact.');
      return;
    }

    setContacts((prev) => [
      ...prev,
      {
        id: `tc-${Date.now()}`,
        name: newContactName.trim(),
        role: newContactRole.trim() || 'Trusted support',
        phone: newContactPhone.trim(),
      },
    ]);
    setNewContactName('');
    setNewContactRole('');
    setNewContactPhone('');
  };

  const handleSaveDiscreetSettings = async () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      Alert.alert('PIN required', 'Enter a 4-digit disguise PIN.');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('PIN mismatch', 'The disguise PIN and confirmation must match.');
      return;
    }

    if (!recoveryPhraseInput.trim() || !recoveryCodeInput.trim()) {
      Alert.alert('Recovery details required', 'Add both a recovery phrase and a trusted-contact code.');
      return;
    }

    try {
      await Promise.all([
        saveDiscreetPin(newPin),
        saveRecoveryPhrase(recoveryPhraseInput),
        saveRecoveryCode(recoveryCodeInput),
      ]);

      setPinConfigured(true);
      setRecoveryConfigured(true);
      setNewPin('');
      setConfirmPin('');
      setRecoveryPhraseInput('');
      setRecoveryCodeInput('');
      Alert.alert('Discreet settings saved', 'The PIN and recovery strings were saved on this device with platform SecureStore.');
    } catch {
      Alert.alert('Unable to save discreet settings', 'Your disguise PIN or recovery details could not be stored securely. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>ACCOUNT & SOS SETTINGS</Text>
          <Text style={styles.title}>Settings & Trusted Contacts</Text>
          <Text style={styles.subtitle}>Preview profile fields, local device recovery settings, and trusted-contact details.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile</Text>
          <Text style={styles.helperText}>These fields are held in this screen session only. They are not saved to an account.</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Display name" placeholderTextColor="#A0AEC0" />
          <TextInput style={styles.input} value={pronouns} onChangeText={setPronouns} placeholder="Pronouns" placeholderTextColor="#A0AEC0" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Discreet recovery</Text>
          <Text style={styles.warningText}>Discreet mode is a calculator-style visual prototype, not a working calculator. It does not guarantee concealment or safety. Someone may still identify the app through the app switcher, notifications, device access, or other traces. Do not rely on it to protect you from monitoring or discovery.</Text>
          <Text style={styles.helperText}>The PIN and recovery strings are stored on this device using platform SecureStore. This does not verify a trusted contact, unlock the device, or protect other app data.</Text>
          <Text style={styles.helperText}>
            PIN configured: {securityStatusLoaded ? (pinConfigured ? 'Yes' : 'No') : 'Checking secure storage...'}
          </Text>
          <Text style={styles.helperText}>
            Recovery path configured: {securityStatusLoaded ? (recoveryConfigured ? 'Yes' : 'No') : 'Checking secure storage...'}
          </Text>
          <TextInput style={styles.input} value={newPin} onChangeText={setNewPin} placeholder="New 4-digit disguise PIN" placeholderTextColor="#A0AEC0" keyboardType="number-pad" secureTextEntry />
          <TextInput style={styles.input} value={confirmPin} onChangeText={setConfirmPin} placeholder="Confirm disguise PIN" placeholderTextColor="#A0AEC0" keyboardType="number-pad" secureTextEntry />
          <TextInput style={styles.input} value={recoveryPhraseInput} onChangeText={setRecoveryPhraseInput} placeholder="Recovery phrase" placeholderTextColor="#A0AEC0" autoCapitalize="characters" secureTextEntry />
          <TextInput style={styles.input} value={recoveryCodeInput} onChangeText={setRecoveryCodeInput} placeholder="Trusted contact code" placeholderTextColor="#A0AEC0" autoCapitalize="characters" secureTextEntry />
          <TouchableOpacity style={styles.button} onPress={handleSaveDiscreetSettings}>
            <Text style={styles.buttonText}>Save Discreet Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trusted contacts for SOS</Text>
          <Text style={styles.helperText}>This list is session-only and does not place calls or send alerts. No sample contacts are preloaded.</Text>
          {!contacts.length ? <Text style={styles.helperText}>No contacts added in this session.</Text> : null}
          {contacts.map((contact) => (
            <View key={contact.id} style={styles.contactRow}>
              <View style={styles.contactText}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactMeta}>{contact.role}</Text>
              </View>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add trusted contact</Text>
          <Text style={styles.helperText}>Contact details are temporary in this prototype and will be cleared when the screen is left.</Text>
          <TextInput style={styles.input} value={newContactName} onChangeText={setNewContactName} placeholder="Name" placeholderTextColor="#A0AEC0" />
          <TextInput style={styles.input} value={newContactRole} onChangeText={setNewContactRole} placeholder="Role" placeholderTextColor="#A0AEC0" />
          <TextInput style={styles.input} value={newContactPhone} onChangeText={setNewContactPhone} placeholder="Phone" placeholderTextColor="#A0AEC0" keyboardType="phone-pad" />
          <TouchableOpacity style={styles.button} onPress={handleAddContact}>
            <Text style={styles.buttonText}>Add Trusted Contact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#E6F4FE', color: '#208AEF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', color: '#102033' },
  subtitle: { fontSize: 14, lineHeight: 20, color: '#4A5568' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  helperText: { fontSize: 13, color: '#4A5568', lineHeight: 19 },
  warningText: { fontSize: 13, color: '#7C2D12', lineHeight: 19, backgroundColor: '#FFF7ED', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FED7AA' },
  input: { backgroundColor: '#F8FCFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#2D3748' },
  contactRow: { backgroundColor: '#F8FCFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  contactText: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: '700', color: '#1A202C' },
  contactMeta: { fontSize: 12, color: '#718096' },
  contactPhone: { fontSize: 13, fontWeight: '600', color: '#2D3748' },
  button: { backgroundColor: '#208AEF', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
