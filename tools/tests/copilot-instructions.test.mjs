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
  const resumedSessionLine = instructions
    .split('\n')
    .find((line) => line.includes('If a resumed session'));

  assert.ok(resumedSessionLine, 'Expected resumed-session guidance in Copilot instructions');
  assert.doesNotMatch(instructions, /claude-sonnet-4\.6/i);
  assert.deepEqual(
    [...resumedSessionLine.matchAll(/`([^`]+)`/g)].map(([, value]) => value),
    ['auto'],
    'The resumed-session guidance should only preserve the generic auto fallback, not explicit model identifiers',
  );
  assert.match(resumedSessionLine, /saved plan/i);
  assert.match(resumedSessionLine, /prior instruction/i);
  assert.match(resumedSessionLine, /carried-forward agent\/task model parameter/i);
  assert.match(instructions, /default `auto` choice/i);
  assert.match(instructions, /currently supported runtime model/i);
});
