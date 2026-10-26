import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire, stripTypeScriptTypes } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const repoRoot = process.cwd();
const requireFromRoot = createRequire(path.join(repoRoot, 'package.json'));
const worktreeRoot = path.join(
  repoRoot,
  'copilot-worktrees',
  'SafeStepsApp',
  'kmwstudy88-ship-it-ideal-garbanzo',
);

function createTsLoader(baseDir, mocks = {}) {
  const cache = new Map();

  function esmToCjs(code) {
    const exportedNames = [];
    const transformed = code
      .replace(/import\s+type\s+[^;]+;/g, '')
      .replace(
        /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]\s*;/g,
        (_, specifiers, pkg) => {
          const bindings = specifiers
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .filter((s) => !s.startsWith('type '))
            .map((s) => s.replace(/^type\s+/, '').replace(/\s+as\s+/g, ': '))
            .join(', ');
          return `const { ${bindings} } = require(${JSON.stringify(pkg)});`;
        },
      )
      .replace(
        /import\s+\*\s+as\s+([A-Za-z0-9_$]+)\s+from\s+['"]([^'"]+)['"]\s*;/g,
        (_, name, pkg) => `const ${name} = require(${JSON.stringify(pkg)});`,
      )
      .replace(
        /import\s+([A-Za-z0-9_$]+)\s+from\s+['"]([^'"]+)['"]\s*;/g,
        (_, name, pkg) =>
          `const _imp_${name} = require(${JSON.stringify(pkg)}); const ${name} = _imp_${name}?.default ?? _imp_${name};`,
      )
      .replace(/export\s+async\s+function\s+([A-Za-z0-9_$]+)/g, (_, name) => {
        exportedNames.push(name);
        return `async function ${name}`;
      })
      .replace(/export\s+function\s+([A-Za-z0-9_$]+)/g, (_, name) => {
        exportedNames.push(name);
        return `function ${name}`;
      })
      .replace(/export\s+const\s+([A-Za-z0-9_$]+)\s*=/g, (_, name) => {
        exportedNames.push(name);
        return `const ${name} =`;
      });

    const footer = exportedNames.map((name) => `exports.${name} = ${name};`).join('\n');
    return `${transformed}\n${footer}`;
  }

  function resolveFile(fromDir, request) {
    const candidateBase = path.resolve(fromDir, request);
    for (const ext of ['', '.ts', '.tsx', '.js', '.json']) {
      if (fs.existsSync(candidateBase + ext) && fs.statSync(candidateBase + ext).isFile()) {
        return candidateBase + ext;
      }
    }
    throw new Error(`Cannot resolve ${request} from ${fromDir}`);
  }

  function loadModule(filePath) {
    const absPath = path.resolve(filePath);
    if (cache.has(absPath)) return cache.get(absPath).exports;

    const mod = { exports: {} };
    cache.set(absPath, mod);

    const rawTs = fs.readFileSync(absPath, 'utf8');
    const stripped = stripTypeScriptTypes(rawTs, { mode: 'strip' });
    const cjsCode = esmToCjs(stripped);
    const dirname = path.dirname(absPath);

    const customRequire = (request) => {
      if (request in mocks) return mocks[request];
      if (request.startsWith('.')) {
        return loadModule(resolveFile(dirname, request));
      }
      return requireFromRoot(request);
    };

    const wrapper = vm.runInThisContext(
      `(function (exports, require, module, __filename, __dirname) {\n${cjsCode}\n})`,
      { filename: absPath },
    );
    wrapper(mod.exports, customRequire, mod, absPath, dirname);
    return mod.exports;
  }

  return {
    load: (relPath) => loadModule(path.resolve(baseDir, relPath)),
  };
}

test('root curriculum title and found-curriculum audits pass with zero placeholder or generic content', () => {
  const titleAuditOutput = execFileSync(process.execPath, ['tools/audit-curriculum-titles.js'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  assert.match(titleAuditOutput, /Curriculum title audit passed/i);

  const foundAuditOutput = execFileSync(process.execPath, ['tools/audit-found-curriculum.js'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  assert.match(foundAuditOutput, /Audit passed: all canonical curriculum libraries are present/i);

  const readinessEvidence = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'docs', 'content-readiness', 'evidence.json'), 'utf8'),
  );
  assert.equal(readinessEvidence.status, 'ready');
  assert.equal(readinessEvidence.summary.blockingIssues.length, 0);
});

test('worktree curriculum title and found-curriculum audits pass across all curriculum JSON and expanded TS lessons', (t) => {
  if (!fs.existsSync(worktreeRoot)) {
    t.skip('Worktree directory not present');
    return;
  }

  const titleAuditOutput = execFileSync(
    process.execPath,
    ['SafeStepsTools/audit-curriculum-titles.js'],
    {
      cwd: worktreeRoot,
      encoding: 'utf8',
    },
  );
  assert.match(titleAuditOutput, /Curriculum title audit passed/i);

  const foundAuditOutput = execFileSync(
    process.execPath,
    ['SafeStepsTools/audit-found-curriculum.js'],
    {
      cwd: worktreeRoot,
      encoding: 'utf8',
    },
  );
  assert.match(foundAuditOutput, /Audit passed: all canonical curriculum libraries are present/i);
});

test('daily challenges flow enforces evidence requirement, completes tasks, calculates streaks, claims rewards, and syncs status', async () => {
  const storageMap = new Map();
  const insertedSupabaseRecords = [];

  const loader = createTsLoader(repoRoot, {
    '@react-native-async-storage/async-storage': {
      getItem: async (k) => (storageMap.has(k) ? storageMap.get(k) : null),
      setItem: async (k, v) => {
        storageMap.set(k, v);
      },
      removeItem: async (k) => {
        storageMap.delete(k);
      },
    },
    '../supabaseClient': {
      supabase: {
        from: (table) => ({
          upsert: async (payload) => {
            insertedSupabaseRecords.push({ table, op: 'upsert', payload });
            return { error: null };
          },
          insert: async (payload) => {
            insertedSupabaseRecords.push({ table, op: 'insert', payload });
            return { error: null };
          },
          update: (payload) => ({
            eq: () => ({
              eq: async () => {
                insertedSupabaseRecords.push({ table, op: 'update', payload });
                return { error: null };
              },
            }),
          }),
        }),
      },
    },
  });

  const {
    clearOfflineSyncStateForTests,
    getPendingSyncCount,
    processSyncQueue,
  } = loader.load('lib/offline/offlineSyncService.ts');
  const {
    attachDailyChallengeEvidence,
    buildDailyChallengeSummary,
    calculateDailyChallengeStreak,
    claimChallengeReward,
    completeDailyChallengeTask,
    getActiveDailyChallenges,
    getClaimedChallengeRewards,
    getDailyChallengeSettings,
    saveDailyChallengePreferences,
    startDailyChallengeTask,
    subscribeToDailyChallengeTasks,
  } = loader.load('lib/dailyChallengesFlow.ts');

  await clearOfflineSyncStateForTests();
  const testUserId = `test_user_${Date.now()}`;

  // 1. Exposes 8 daily challenges (1,200 possible daily points so 1,000-pt Bonus Reward is reachable)
  const dailyList = getActiveDailyChallenges();
  assert.equal(dailyList.length, 8);

  // 2. Empty state has 0 streak and 0 points
  const initialSummary = buildDailyChallengeSummary([], [], new Date('2026-10-19T10:00:00.000Z'));
  assert.equal(initialSummary.streak, 0);
  assert.equal(initialSummary.points, 0);
  assert.equal(initialSummary.completedCount, 0);
  assert.deepEqual(initialSummary.weekActivity, [false, false, false, false, false, false, false]);

  // 3. Subscribe to live task status updates
  const observedUpdates = [];
  const unsubscribe = subscribeToDailyChallengeTasks((tasks) => {
    observedUpdates.push(tasks);
  });

  // 4. Start a challenge and verify completion is blocked until evidence is attached
  const firstChallenge = dailyList[0];
  const startedTask = await startDailyChallengeTask(firstChallenge.id, testUserId);
  assert.equal(startedTask.status, 'in_progress');
  assert.equal(observedUpdates.length, 1);

  await assert.rejects(
    () => completeDailyChallengeTask(firstChallenge.id, testUserId),
    /Add or upload evidence for this challenge before marking it complete/,
  );

  // 5. Attach evidence and complete challenge
  await attachDailyChallengeEvidence({
    challengeId: firstChallenge.id,
    taskId: startedTask.id,
    reflection: 'Practised calm connection check-in before school transition.',
    evidenceNote: 'Child responded calmly and packed schoolbag.',
    userId: testUserId,
  });

  const completedTask = await completeDailyChallengeTask(
    firstChallenge.id,
    testUserId,
    '2026-10-19T09:30:00.000Z',
  );
  assert.equal(completedTask.status, 'completed');
  assert.ok(observedUpdates.length >= 2);
  assert.ok((await getPendingSyncCount()) >= 2);

  // 6. Complete a second challenge on the previous day to verify multi-day streak and Bronze Reward unlock (300 pts >= 250 pts)
  const secondChallenge = dailyList[1];
  await startDailyChallengeTask(secondChallenge.id, testUserId);
  await attachDailyChallengeEvidence({
    challengeId: secondChallenge.id,
    reflection: 'Used calm voice and predictable routine at bedtime.',
    userId: testUserId,
  });
  const secondCompleted = await completeDailyChallengeTask(
    secondChallenge.id,
    testUserId,
    '2026-10-18T20:00:00.000Z',
  );

  const twoDayTasks = [completedTask, secondCompleted];
  const streakInfo = calculateDailyChallengeStreak(
    twoDayTasks,
    new Date('2026-10-19T12:00:00.000Z'),
  );
  assert.equal(streakInfo.streak, 2);
  assert.equal(streakInfo.completedToday, true);
  assert.equal(streakInfo.weekActivity[0], true);

  const summaryAfterTwo = buildDailyChallengeSummary(
    twoDayTasks,
    [],
    new Date('2026-10-19T12:00:00.000Z'),
  );
  assert.equal(summaryAfterTwo.points, 300);
  assert.equal(summaryAfterTwo.completedCount, 2);
  assert.equal(summaryAfterTwo.rewards.find((r) => r.id === 'bronze')?.canClaim, true);
  assert.equal(summaryAfterTwo.rewards.find((r) => r.id === 'silver')?.canClaim, false);

  // 7. Claim Bronze Reward and verify persistence + locked Silver Reward rejection
  await assert.rejects(
    () => claimChallengeReward('silver', summaryAfterTwo.points, testUserId),
    /Need 500 points to claim Silver Reward/,
  );

  const claimResult = await claimChallengeReward('bronze', summaryAfterTwo.points, testUserId);
  assert.deepEqual(claimResult.claimedRewardIds, ['bronze']);
  assert.deepEqual(await getClaimedChallengeRewards(testUserId), ['bronze']);

  const summaryAfterClaim = buildDailyChallengeSummary(
    twoDayTasks,
    claimResult.claimedRewardIds,
    new Date('2026-10-19T12:00:00.000Z'),
  );
  assert.equal(summaryAfterClaim.claimedPoints, 250);
  assert.equal(summaryAfterClaim.availablePoints, 50);
  assert.equal(summaryAfterClaim.rewards.find((r) => r.id === 'bronze')?.claimed, true);
  assert.equal(summaryAfterClaim.rewards.find((r) => r.id === 'bronze')?.canClaim, false);

  // 8. Process offline sync queue and verify evidence_upload + challenge_completion sync cleanly
  const syncResult = await processSyncQueue();
  assert.equal(syncResult.failed, 0);
  assert.ok(syncResult.synced >= 4);
  assert.equal(await getPendingSyncCount(), 0);
  assert.ok(insertedSupabaseRecords.some((r) => r.table === 'evidence_items'));
  assert.ok(insertedSupabaseRecords.some((r) => r.table === 'user_tasks'));

  // 9. Persist and reload challenge settings
  const savedSettings = await saveDailyChallengePreferences(
    {
      dailyReminder: false,
      eveningCheckIn: true,
      streakAlerts: true,
      paused: true,
    },
    testUserId,
  );
  assert.equal(savedSettings.paused, true);
  const loadedSettings = await getDailyChallengeSettings(testUserId);
  assert.equal(loadedSettings.dailyReminder, false);
  assert.equal(loadedSettings.paused, true);

  unsubscribe();
});

test('worktree taskEngine links offline evidence vault items and merges local/remote task completion state', (t) => {
  if (!fs.existsSync(worktreeRoot)) {
    t.skip('Worktree directory not present');
    return;
  }

  const storageMap = new Map();
  let offlineVaultItems = [];

  const loader = createTsLoader(worktreeRoot, {
    '@react-native-async-storage/async-storage': {
      getItem: async (k) => (storageMap.has(k) ? storageMap.get(k) : null),
      setItem: async (k, v) => {
        storageMap.set(k, v);
      },
    },
    '../supabase/client': {
      supabase: {
        from: () => ({
          select: () => ({
            eq: () => ({
              or: async () => ({ count: 0, error: null }),
            }),
          }),
        }),
      },
    },
    '../authSession': {
      getOptionalUserId: async () => 'user-wt-1',
      getSignedInUserId: async () => 'user-wt-1',
    },
    './offlineEvidenceVault': {
      getOfflineEvidenceVaultItems: async () => offlineVaultItems,
    },
  });

  const {
    buildParentChallengeTaskInput,
    doesOfflineEvidenceLinkToTask,
    evaluateTaskCompletionRequirement,
    getTaskCompletionRequirement,
    mergeTasksWithLocalState,
  } = loader.load('lib/engines/taskEngine.ts');

  const input = buildParentChallengeTaskInput('SS-PC-001');
  assert.equal(input.title, 'Connection Check-In');
  assert.equal(input.evidence_required, true);

  const task = {
    id: 'task-wt-1',
    owner_id: 'user-wt-1',
    title: input.title,
    description: input.description ?? '',
    status: 'ready',
    due_at: null,
    completed_at: null,
    created_at: '2026-10-19T08:00:00.000Z',
    priority: 'medium',
    related_lesson_id: 'challenge:SS-PC-001',
    evidence_required: true,
    category: 'parent_challenge:Connection & Attachment',
  };

  assert.equal(evaluateTaskCompletionRequirement(task, 0).canComplete, false);
  assert.equal(
    doesOfflineEvidenceLinkToTask({ structuredData: { challenge_id: 'SS-PC-001' } }, task),
    true,
  );

  offlineVaultItems = [
    {
      id: 'offline-1',
      ownerId: 'user-wt-1',
      structuredData: { task_id: 'task-wt-1', challenge_id: 'SS-PC-001' },
    },
  ];

  return getTaskCompletionRequirement(task).then((req) => {
    assert.equal(req.canComplete, true);
    assert.equal(req.linkedEvidenceCount, 1);

    const merged = mergeTasksWithLocalState(
      [task],
      [{ ...task, status: 'completed', completed_at: '2026-10-19T10:00:00.000Z' }],
    );
    assert.equal(merged.length, 1);
    assert.equal(merged[0].status, 'completed');
  });
});

test('worktree dailyChallenges shared helpers calculate streaks, unlock all 4 reward tiers up to 1,000 pts, and persist claims/settings', async (t) => {
  if (!fs.existsSync(worktreeRoot)) {
    t.skip('Worktree directory not present');
    return;
  }

  const storageMap = new Map();
  const loader = createTsLoader(worktreeRoot, {
    '@react-native-async-storage/async-storage': {
      getItem: async (k) => (storageMap.has(k) ? storageMap.get(k) : null),
      setItem: async (k, v) => {
        storageMap.set(k, v);
      },
    },
    '@expo/vector-icons': { MaterialCommunityIcons: () => null },
    'expo-router': { Link: () => null },
    react: { createElement: () => null },
    'react-native': {
      Pressable: () => null,
      StyleSheet: { create: (s) => s },
      Text: () => null,
      View: () => null,
    },
  });

  const {
    __resetDailyChallengeStateForTests,
    calculateChallengeStreak,
    claimDailyChallengeReward,
    dailyChallengeSummary,
    dailyChallenges,
    loadClaimedRewards,
    loadDailyChallengeSettings,
    saveDailyChallengeSettings,
  } = loader.load('components/dailyChallenges/shared.tsx');

  __resetDailyChallengeStateForTests();

  const challenges = dailyChallenges();
  assert.equal(challenges.length, 8);

  const emptySummary = dailyChallengeSummary([], [], new Date('2026-10-19T12:00:00.000Z'));
  assert.equal(emptySummary.streak, 0);
  assert.equal(emptySummary.points, 0);

  // Complete 7 challenges across 3 consecutive days (7 * 150 = 1050 points -> unlocks Bonus Reward at 1000 pts)
  const completedTasks = challenges.slice(0, 7).map((challenge, idx) => ({
    id: `wt-task-${idx}`,
    owner_id: 'user-wt',
    title: challenge.displayTitle,
    description: challenge.purpose,
    status: 'completed',
    due_at: null,
    completed_at: `2026-10-1${9 - (idx % 3)}T09:00:00.000Z`,
    created_at: `2026-10-1${9 - (idx % 3)}T08:00:00.000Z`,
    priority: 'medium',
    related_lesson_id: `challenge:${challenge.id}`,
    evidence_required: true,
    category: `parent_challenge:${challenge.category}`,
  }));

  const streakInfo = calculateChallengeStreak(
    completedTasks,
    new Date('2026-10-19T12:00:00.000Z'),
  );
  assert.equal(streakInfo.streak, 3);
  assert.equal(streakInfo.completedToday, true);

  const fullSummary = dailyChallengeSummary(
    completedTasks,
    [],
    new Date('2026-10-19T12:00:00.000Z'),
  );
  assert.equal(fullSummary.points, 1050);
  assert.equal(fullSummary.rewards.find((r) => r.id === 'bonus')?.canClaim, true);

  const claimedBonus = await claimDailyChallengeReward('bonus', fullSummary.points, 'user-wt');
  assert.deepEqual(claimedBonus.claimedRewardIds, ['bonus']);
  assert.deepEqual(await loadClaimedRewards('user-wt'), ['bonus']);

  await saveDailyChallengeSettings(
    {
      dailyReminder: false,
      eveningCheckIn: false,
      streakAlerts: true,
      paused: true,
    },
    'user-wt',
  );
  const loadedSettings = await loadDailyChallengeSettings('user-wt');
  assert.equal(loadedSettings.paused, true);
  assert.equal(loadedSettings.dailyReminder, false);
});

