import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test, { after } from 'node:test';
import { stripTypeScriptTypes } from 'node:module';

const secureStore = {
  getItemAsync: async () => null,
  setItemAsync: async () => {},
  deleteItemAsync: async () => {},
};
const previousSecureStore = Object.getOwnPropertyDescriptor(globalThis, '__safeStepsSecureStore');
Object.defineProperty(globalThis, '__safeStepsSecureStore', {
  configurable: true,
  value: secureStore,
});
after(() => {
  if (previousSecureStore) Object.defineProperty(globalThis, '__safeStepsSecureStore', previousSecureStore);
  else delete globalThis.__safeStepsSecureStore;
});

const source = await readFile(new URL('../../lib/privacy/discreetModeCredentials.ts', import.meta.url), 'utf8');
const transformed = stripTypeScriptTypes(source.replace(
  /^import \* as SecureStore from "expo-secure-store";\r?$/m,
  'const SecureStore = globalThis.__safeStepsSecureStore;',
), { mode: 'strip' });
const credentials = await import(`data:text/javascript;base64,${Buffer.from(transformed).toString('base64')}`);

test('PIN and recovery credentials use distinct SecureStore keys and preserve PIN input', async () => {
  const calls = [];
  secureStore.getItemAsync = async (key) => { calls.push(['get', key]); return `value:${key}`; };
  secureStore.setItemAsync = async (key, value) => { calls.push(['set', key, value]); };
  secureStore.deleteItemAsync = async (key) => { calls.push(['delete', key]); };

  assert.equal(await credentials.getDiscreetPin(), 'value:safesteps.discreet.pin');
  await credentials.saveDiscreetPin(' 0471 ');
  await credentials.clearDiscreetPin();
  assert.equal(await credentials.getRecoveryPhrase(), 'value:safesteps.discreet.recoveryPhrase');
  await credentials.saveRecoveryPhrase('  safe place  ');
  await credentials.clearRecoveryPhrase();
  assert.equal(await credentials.getRecoveryCode(), 'value:safesteps.discreet.recoveryCode');
  await credentials.saveRecoveryCode('  abc-123  ');
  await credentials.clearRecoveryCode();

  assert.deepEqual(calls, [
    ['get', 'safesteps.discreet.pin'],
    ['set', 'safesteps.discreet.pin', ' 0471 '],
    ['delete', 'safesteps.discreet.pin'],
    ['get', 'safesteps.discreet.recoveryPhrase'],
    ['set', 'safesteps.discreet.recoveryPhrase', 'SAFE PLACE'],
    ['delete', 'safesteps.discreet.recoveryPhrase'],
    ['get', 'safesteps.discreet.recoveryCode'],
    ['set', 'safesteps.discreet.recoveryCode', 'ABC-123'],
    ['delete', 'safesteps.discreet.recoveryCode'],
  ]);
});

test('missing SecureStore credentials remain null rather than being fabricated', async () => {
  secureStore.getItemAsync = async () => null;
  assert.equal(await credentials.getDiscreetPin(), null);
  assert.equal(await credentials.getRecoveryPhrase(), null);
  assert.equal(await credentials.getRecoveryCode(), null);
});

test('SecureStore read, write, and delete failures propagate to the caller', async () => {
  const failure = new Error('SecureStore unavailable');
  secureStore.getItemAsync = async () => { throw failure; };
  secureStore.setItemAsync = async () => { throw failure; };
  secureStore.deleteItemAsync = async () => { throw failure; };

  await assert.rejects(credentials.getDiscreetPin(), failure);
  await assert.rejects(credentials.saveDiscreetPin('1234'), failure);
  await assert.rejects(credentials.clearDiscreetPin(), failure);
  await assert.rejects(credentials.getRecoveryPhrase(), failure);
  await assert.rejects(credentials.saveRecoveryPhrase('safe place'), failure);
  await assert.rejects(credentials.clearRecoveryPhrase(), failure);
  await assert.rejects(credentials.getRecoveryCode(), failure);
  await assert.rejects(credentials.saveRecoveryCode('abc123'), failure);
  await assert.rejects(credentials.clearRecoveryCode(), failure);
});
