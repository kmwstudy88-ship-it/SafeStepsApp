import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

async function loadTsModule(relativePath, secureStoreImplementation) {
  const filename = path.join(repoRoot, relativePath);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'safesteps-discreet-'));
  const modulePath = path.join(tempDir, 'discreetModeCredentials.mts');
  const stubPath = path.join(tempDir, 'expo-secure-store.mjs');
  const source = fs
    .readFileSync(filename, 'utf8')
    .replace('import * as SecureStore from "expo-secure-store";', 'import * as SecureStore from "./expo-secure-store.mjs";');

  fs.writeFileSync(modulePath, source);
  fs.writeFileSync(stubPath, `export const getItemAsync = globalThis.__secureStore.getItemAsync;\nexport const setItemAsync = globalThis.__secureStore.setItemAsync;\nexport const deleteItemAsync = globalThis.__secureStore.deleteItemAsync;\n`);
  globalThis.__secureStore = secureStoreImplementation;
  const mod = await import(pathToFileURL(modulePath).href);
  delete globalThis.__secureStore;
  return mod;
}

test('discreet mode credentials persist raw PINs and normalized recovery details in secure storage', async () => {
  const store = new Map();
  const secureStore = {
    async getItemAsync(key) {
      return store.has(key) ? store.get(key) : null;
    },
    async setItemAsync(key, value) {
      store.set(key, value);
    },
    async deleteItemAsync(key) {
      store.delete(key);
    },
  };

  const credentials = await loadTsModule('lib/privacy/discreetModeCredentials.ts', secureStore);

  await credentials.saveDiscreetPin('4826');
  await credentials.saveRecoveryPhrase('  calm waters  ');
  await credentials.saveRecoveryCode('  aB-12  ');

  assert.equal(await credentials.getDiscreetPin(), '4826');
  assert.equal(await credentials.getRecoveryPhrase(), 'CALM WATERS');
  assert.equal(await credentials.getRecoveryCode(), 'AB-12');
});

test('discreet mode credential clears remove stored PIN and recovery artifacts', async () => {
  const store = new Map([
    ['safesteps.discreet.pin', '4826'],
    ['safesteps.discreet.recoveryPhrase', 'CALM WATERS'],
    ['safesteps.discreet.recoveryCode', 'AB-12'],
  ]);
  const secureStore = {
    async getItemAsync(key) {
      return store.has(key) ? store.get(key) : null;
    },
    async setItemAsync(key, value) {
      store.set(key, value);
    },
    async deleteItemAsync(key) {
      store.delete(key);
    },
  };

  const credentials = await loadTsModule('lib/privacy/discreetModeCredentials.ts', secureStore);

  await credentials.clearDiscreetPin();
  await credentials.clearRecoveryPhrase();
  await credentials.clearRecoveryCode();

  assert.equal(await credentials.getDiscreetPin(), null);
  assert.equal(await credentials.getRecoveryPhrase(), null);
  assert.equal(await credentials.getRecoveryCode(), null);
});
