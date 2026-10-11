import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

const repoRoot = new URL('../../', import.meta.url);
const schemaPath = 'schema/resilience-learning-observations-schema.json';
const schema = JSON.parse(fs.readFileSync(new URL(schemaPath, repoRoot), 'utf8'));
const ajv = new Ajv2020({ strict: true, allErrors: true });
const validate = ajv.compile(schema);

const observation = {
  record_type: 'coaching_observation',
  schema_version: '1.0.0',
  day_index: 1,
  context: 'A routine transition.',
  observable_signs: 'Asked for a break.',
  support_offered: 'Offered listening or space.',
  what_seemed_helpful: null,
};
const metric = {
  record_type: 'caregiver_practice_metric',
  schema_version: '1.0.0',
  metric: 'support_offered_count',
  observation_window_days: 14,
  value: 0,
  unit: 'count',
  source: 'caregiver_self_report',
  limitations: 'Incomplete recall; no effectiveness or child outcome is established.',
};

function accepts(record) {
  const before = structuredClone(record);
  assert.equal(validate(record), true, JSON.stringify(validate.errors));
  assert.deepEqual(record, before, 'Validation must not coerce, default, or remove fields');
}

function rejects(record, instancePath, keyword) {
  assert.equal(validate(record), false, `Unexpectedly accepted ${JSON.stringify(record)}`);
  assert.ok(
    validate.errors.some((error) => error.instancePath === instancePath && error.keyword === keyword),
    `Expected ${keyword} at ${instancePath}: ${JSON.stringify(validate.errors)}`,
  );
}

test('schema uses Draft 2020-12 and compiles in strict mode', () => {
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(ajv.validateSchema(schema), true);
});

for (const name of ['coachingObservation', 'progressMetric']) {
  test(`${name}: every published example validates`, () => {
    const examples = schema.$defs[name].examples;
    assert.ok(examples.length > 0);
    for (const example of examples) accepts(structuredClone(example));
  });
}

for (const [name, fixture] of [['coachingObservation', observation], ['progressMetric', metric]]) {
  test(`${name}: every required field is enforced`, () => {
    for (const field of schema.$defs[name].required) {
      const record = structuredClone(fixture);
      delete record[field];
      rejects(record, '', 'required');
      assert.ok(validate.errors.some((error) => error.keyword === 'required' && error.params.missingProperty === field));
    }
  });

  test(`${name}: rejects identifiers and unknown properties`, () => {
    for (const field of ['user_id', 'child_id', 'case_id', 'audit_hash', 'unexpected']) {
      rejects({ ...fixture, [field]: 'not-allowed' }, '', 'additionalProperties');
    }
  });

  test(`${name}: rejects unsupported record types and versions`, () => {
    rejects({ ...fixture, record_type: 'combined_profile' }, '/record_type', 'const');
    rejects({ ...fixture, schema_version: '2.0.0' }, '/schema_version', 'const');
  });
}

for (const [fixture, field] of [[observation, 'day_index'], [metric, 'observation_window_days']]) {
  test(`${field}: accepts inclusive boundaries and rejects invalid days`, () => {
    for (const value of [1, 14]) accepts({ ...fixture, [field]: value });
    for (const [value, keyword] of [[0, 'minimum'], [15, 'maximum'], [1.5, 'type'], ['1', 'type'], [null, 'type']]) {
      rejects({ ...fixture, [field]: value }, `/${field}`, keyword);
    }
  });
}

for (const field of ['context', 'observable_signs', 'support_offered', 'what_seemed_helpful']) {
  test(`${field}: allows unknown values and enforces text types and lengths`, () => {
    for (const value of [null, 'x', 'x'.repeat(500)]) accepts({ ...observation, [field]: value });
    for (const [value, keyword] of [['', 'minLength'], ['x'.repeat(501), 'maxLength'], [0, 'type'], [[], 'type'], [{}, 'type']]) {
      rejects({ ...observation, [field]: value }, `/${field}`, keyword);
    }
  });
}

test('counts preserve zero versus unknown and reject invalid numeric values', () => {
  for (const value of [0, 1, 100, null]) accepts({ ...metric, value });
  for (const [value, keyword] of [[-1, 'minimum'], [0.5, 'type'], ['0', 'type'], [false, 'type']]) {
    rejects({ ...metric, value }, '/value', keyword);
  }
});

test('practice metrics allow only the three defined caregiver actions', () => {
  for (const name of ['support_offered_count', 'reflective_check_in_count', 'adult_follow_through_count']) {
    accepts({ ...metric, metric: name });
  }
  for (const name of ['child_compliance_count', 'speed_of_calming', 'proof_of_change', 'other']) {
    rejects({ ...metric, metric: name }, '/metric', 'enum');
  }
});

test('metrics cannot claim verification or a different unit', () => {
  rejects({ ...metric, source: 'practitioner_verified' }, '/source', 'const');
  rejects({ ...metric, unit: 'percentage' }, '/unit', 'const');
});

test('metrics require nonempty bounded limitations', () => {
  for (const value of ['x', 'x'.repeat(500)]) accepts({ ...metric, limitations: value });
  for (const [value, keyword] of [['', 'minLength'], ['x'.repeat(501), 'maxLength'], [null, 'type']]) {
    rejects({ ...metric, limitations: value }, '/limitations', keyword);
  }
});

test('the root rejects non-record values and combined profiles', () => {
  for (const value of [null, [], 'text', 1, {}, { ...observation, ...metric }]) {
    assert.equal(validate(value), false);
  }
});

test('the resilience lesson references this definitions-only schema', () => {
  const lesson = JSON.parse(fs.readFileSync(new URL('lessons/lesson_building_resilience_master.json', repoRoot), 'utf8'));
  assert.equal(lesson.editorial_notes.observation_definitions, schemaPath);
  assert.ok(fs.existsSync(fileURLToPath(new URL(lesson.editorial_notes.observation_definitions, repoRoot))));
});

test('the resilience lesson, module, and generated index stay linked', () => {
  const lessonPath = 'lessons/lesson_building_resilience_master.json';
  const modulePath = 'modules/module_building_resilience_master.json';
  const lesson = JSON.parse(fs.readFileSync(new URL(lessonPath, repoRoot), 'utf8'));
  const module = JSON.parse(fs.readFileSync(new URL(modulePath, repoRoot), 'utf8'));
  const index = JSON.parse(fs.readFileSync(new URL('src/safesteps/lessons/master-index.json', repoRoot), 'utf8'));
  const moduleContent = module.content.find((item) => item.lesson_id === lesson.id);

  assert.ok(module.lessons.includes(lesson.id));
  assert.ok(moduleContent);
  assert.deepEqual(moduleContent.sections, lesson.sections.map((section) => section.id));
  assert.ok(index.lessons.some((item) => item.id === lesson.id && item.sourcePath === lessonPath));
  assert.ok(index.modules.some((item) => item.id === module.id && item.sourcePath === modulePath));
});
