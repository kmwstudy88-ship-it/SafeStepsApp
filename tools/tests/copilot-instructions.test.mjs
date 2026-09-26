import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const instructionsPath = path.join(repoRoot, '.github', 'copilot-instructions.md');

test('copilot instructions avoid explicit model identifiers while preserving auto fallback guidance', () => {
  const instructions = fs.readFileSync(instructionsPath, 'utf8');

  assert.doesNotMatch(
    instructions,
    /`(?!auto`)[a-z0-9]+(?:-[a-z0-9.]+){1,}`/i,
    'Copilot repository instructions should not embed explicit model identifiers that can poison resumed sessions',
  );
  assert.match(instructions, /default `auto` choice/i);
  assert.match(instructions, /currently supported runtime model/i);
});
