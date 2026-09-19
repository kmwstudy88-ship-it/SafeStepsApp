import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

async function loadTsModule(relativePath) {
  const filename = path.join(repoRoot, relativePath);
  const tempFile = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'safesteps-assessment-')),
    path.basename(filename, '.ts') + '.mts',
  );
  fs.copyFileSync(filename, tempFile);
  return import(pathToFileURL(tempFile).href);
}

test('scoreAssessment uses 0-3 thresholds for moderate and elevated concern bands', () => {
  return (async () => {
    const { CAPES_ASSESSMENT, scoreAssessment } = await loadTsModule('lib/assessments/assessmentDefinitions.ts');
  const moderate = scoreAssessment(CAPES_ASSESSMENT, {
    capes_01: 3,
    capes_02: 3,
    capes_03: 3,
    capes_04: 2,
  });
  assert.equal(moderate.totalScore, 11);
  assert.equal(moderate.maxPossibleScore, 30);
  assert.equal(moderate.percentage, 37);
  assert.equal(moderate.clinicalBand, 'Moderate / Support Indicated');

  const elevated = scoreAssessment(CAPES_ASSESSMENT, {
    capes_01: 3,
    capes_02: 3,
    capes_03: 3,
    capes_04: 3,
    capes_05: 3,
    capes_06: 3,
    capes_07: 2,
  });
  assert.equal(elevated.totalScore, 20);
  assert.equal(elevated.percentage, 67);
  assert.equal(elevated.clinicalBand, 'Elevated Concern');
  })();
});

test('scoreAssessment reverse-scores 1-5 items before calculating the FPS result', () => {
  return (async () => {
    const { FPS_ASSESSMENT, scoreAssessment } = await loadTsModule('lib/assessments/assessmentDefinitions.ts');
  const result = scoreAssessment(FPS_ASSESSMENT, {
    fps_01: 1,
    fps_02: 1,
    fps_03: 1,
    fps_04: 1,
    fps_05: 1,
    fps_06: 1,
    fps_07: 1,
    fps_08: 1,
    fps_09: 1,
    fps_10: 1,
  });

  assert.equal(result.totalScore, 26);
  assert.equal(result.maxPossibleScore, 50);
  assert.equal(result.meanScore, 2.6);
  assert.equal(result.percentage, 52);
  assert.equal(result.clinicalBand, 'Elevated Concern');
  })();
});

test('scoreAssessment honors 1-5 cutoffs around the moderate and low concern boundary', () => {
  return (async () => {
    const { FPS_ASSESSMENT, scoreAssessment } = await loadTsModule('lib/assessments/assessmentDefinitions.ts');
  const moderate = scoreAssessment(FPS_ASSESSMENT, {
    fps_01: 4,
    fps_02: 4,
    fps_03: 2,
    fps_04: 2,
    fps_05: 3,
    fps_06: 3,
    fps_07: 3,
    fps_08: 3,
    fps_09: 3,
    fps_10: 4,
  });
  assert.equal(moderate.totalScore, 33);
  assert.equal(moderate.meanScore, 3.3);
  assert.equal(moderate.clinicalBand, 'Moderate / Support Indicated');

  const lowConcern = scoreAssessment(FPS_ASSESSMENT, {
    fps_01: 4,
    fps_02: 4,
    fps_03: 2,
    fps_04: 2,
    fps_05: 4,
    fps_06: 3,
    fps_07: 3,
    fps_08: 3,
    fps_09: 4,
    fps_10: 4,
  });
  assert.equal(lowConcern.totalScore, 35);
  assert.equal(lowConcern.meanScore, 3.5);
  assert.equal(lowConcern.clinicalBand, 'Low Concern / High Efficacy');
  })();
});
