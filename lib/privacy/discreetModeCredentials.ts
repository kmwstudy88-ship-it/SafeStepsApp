import * as SecureStore from "expo-secure-store";

const PIN_KEY = 'safesteps.discreet.pin';
const RECOVERY_PHRASE_KEY = 'safesteps.discreet.recoveryPhrase';
const RECOVERY_CODE_KEY = 'safesteps.discreet.recoveryCode';

export async function getDiscreetPin() {
  return SecureStore.getItemAsync(PIN_KEY);
}

export async function saveDiscreetPin(pin: string) {
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

export async function clearDiscreetPin() {
  await SecureStore.deleteItemAsync(PIN_KEY);
}

export async function getRecoveryPhrase() {
  return SecureStore.getItemAsync(RECOVERY_PHRASE_KEY);
}

export async function saveRecoveryPhrase(phrase: string) {
  await SecureStore.setItemAsync(RECOVERY_PHRASE_KEY, phrase.trim().toUpperCase());
}

export async function getRecoveryCode() {
  return SecureStore.getItemAsync(RECOVERY_CODE_KEY);
}

export async function saveRecoveryCode(code: string) {
  await SecureStore.setItemAsync(RECOVERY_CODE_KEY, code.trim().toUpperCase());
}
