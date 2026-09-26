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
  const explicitModelIdentifierPattern =
    /\b(?:claude|gpt|gemini|grok|kimi|mai-code)-[a-z0-9][a-z0-9.-]*\b/i;

  assert.ok(resumedSessionLine, 'Expected resumed-session guidance in Copilot instructions');
  assert.doesNotMatch(
    instructions,
    explicitModelIdentifierPattern,
    'Copilot instructions should not hard-code explicit model identifiers',
  );
  assert.deepEqual(
    [...resumedSessionLine.matchAll(/`([^`]+)`/g)].map(([, value]) => value),
    ['auto'],
    'The resumed-session guidance should only preserve the generic auto fallback, not explicit model identifiers',
  );
  assert.match(resumedSessionLine, /saved plan/i);
  assert.match(resumedSessionLine, /prior instruction/i);
  assert.match(resumedSessionLine, /carried-forward agent\/task model parameter/i);
  assert.match(resumedSessionLine, /discard that explicit override before any new turn or tool call/i);
  assert.match(resumedSessionLine, /continue with `auto`/i);
  assert.match(resumedSessionLine, /never reuse an inherited explicit model name/i);
  assert.match(resumedSessionLine, /models currently exposed by the active runtime/i);
  assert.match(instructions, /default `auto` choice/i);
  assert.match(instructions, /currently supported model/i);
});
