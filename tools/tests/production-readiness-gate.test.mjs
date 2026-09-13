import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const gateScript = path.join(repoRoot, 'tools', 'production-readiness-gate.mjs');

const validCredentials = {
  parent: { email: 'parent@example.com', password: 'pw' },
  child: { email: 'child@example.com', password: 'pw' },
  caseworker: { email: 'caseworker@example.com', password: 'pw' },
  supervisor: { email: 'supervisor@example.com', password: 'pw' },
  court_viewer: { email: 'court@example.com', password: 'pw' },
  unrelated: { email: 'unrelated@example.com', password: 'pw' },
};

function createFixture({ packageJson = { name: 'fixture', version: '1.0.0' }, appSource = 'export {};' } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'safesteps-gate-'));
  fs.mkdirSync(path.join(root, 'app'), { recursive: true });
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2));
  if (appSource !== null) {
    fs.writeFileSync(path.join(root, 'app', 'index.ts'), appSource);
  }
  return root;
}

function baseEnv() {
  return {
    SAFESTEPS_STAGING_URL: 'https://staging.example.supabase.co',
    SAFESTEPS_STAGING_PUBLISHABLE_KEY: 'publishable',
    SAFESTEPS_STAGING_CASE_ID: 'case-1',
    SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON: JSON.stringify(validCredentials),
    SAFESTEPS_SECURITY_ADVISOR_REVIEWED_AT: '2026-09-01T00:00:00Z',
    SAFESTEPS_PERFORMANCE_ADVISOR_REVIEWED_AT: '2026-09-01T00:00:00Z',
    SAFESTEPS_STAGING_JOURNEY_VERIFIED_AT: '2026-09-01T00:00:00Z',
    SAFESTEPS_DEPENDENCY_AUDIT_REVIEWED_AT: '2026-09-01T00:00:00Z',
    SAFESTEPS_CREDENTIAL_ROTATION_CONFIRMED_AT: '2026-09-01T00:00:00Z',
    SAFESTEPS_CHILD_SAFE_POLICY_REVIEWED_AT: '2026-09-01T00:00:00Z',
    SAFESTEPS_CHILD_SAFE_HUMAN_REVIEW_SIGNOFF_AT: '2026-09-01T00:00:00Z',
  };
}

function runGate(root, envOverrides = {}) {
  return spawnSync(process.execPath, [gateScript], {
    encoding: 'utf8',
    env: {
      ...process.env,
      ...baseEnv(),
      ...envOverrides,
      SAFESTEPS_REPO_ROOT: root,
    },
  });
}

test('readiness gate passes with valid evidence, credentials, and no firebase usage', () => {
  const root = createFixture();
  try {
    const result = runGate(root);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /child-safe review/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('readiness gate fails closed on production supabase ref in staging URL', () => {
  const root = createFixture();
  try {
    const result = runGate(root, {
      SAFESTEPS_STAGING_URL: 'https://yzxotxbwgxnxemkzigse.supabase.co',
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /refuses production Supabase ref/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('readiness gate fails closed when firebase dependencies are declared', () => {
  const root = createFixture({
    packageJson: {
      name: 'fixture',
      version: '1.0.0',
      dependencies: { firebase: '^11.0.0' },
    },
  });
  try {
    const result = runGate(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Firebase dependency detected in dependencies: firebase/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('readiness gate fails closed when runtime code imports firebase modules', () => {
  const root = createFixture({ appSource: 'import firebase from "firebase/app";' });
  try {
    const result = runGate(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Firebase runtime imports detected/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('readiness gate fails closed when controlled role credentials are incomplete', () => {
  const root = createFixture();
  try {
    const incomplete = {
      parent: { email: 'parent@example.com', password: 'pw' },
      child: { email: 'child@example.com', password: 'pw' },
      caseworker: { email: 'caseworker@example.com', password: 'pw' },
      supervisor: { email: 'supervisor@example.com', password: 'pw' },
      court_viewer: { email: 'court@example.com', password: 'pw' },
    };
    const result = runGate(root, {
      SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON: JSON.stringify(incomplete),
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Missing controlled staging credential for unrelated/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('readiness gate fails closed when child-safe human review evidence is missing', () => {
  const root = createFixture();
  try {
    const result = runGate(root, {
      SAFESTEPS_CHILD_SAFE_HUMAN_REVIEW_SIGNOFF_AT: '',
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Missing release gate evidence: SAFESTEPS_CHILD_SAFE_HUMAN_REVIEW_SIGNOFF_AT/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
