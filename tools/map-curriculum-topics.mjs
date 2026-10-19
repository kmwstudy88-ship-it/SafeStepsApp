import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const topicsRoot = path.join(repoRoot, 'topics');
const modulesRoot = path.join(repoRoot, 'modules');
const lessonsRoot = path.join(repoRoot, 'lessons');

const rules = [
  {
    id: 'accountability',
    pattern: /accountab|responsib|minimis|blame|repair after|generational cycle|intergenerational pattern/,
    modules: ['module_accountability_foundations', 'module_sustainable_change'],
  },
  {
    id: 'adolescence',
    pattern: /adolesc|teen|peer pressure|substance|vaping|preparing for adulthood/,
    modules: [
      'module_engaging_young_people_in_prevention',
      'module_working_with_adolescents_experiencing_or_using_violence',
    ],
  },
  {
    id: 'nutrition-and-feeding',
    pattern:
      /food|feed|meal|nutrition|breastfeeding|formula|solid food|allerg|intoleran|eating|cooking|grocery|shopping/,
    modules: ['module_supporting_childrens_safety_and_wellbeing'],
  },
  {
    id: 'physical-health',
    pattern: /physical activity|sedentary|sun safety|health concern|healthy growth|infant health/,
    modules: [
      'module_supporting_childrens_safety_and_wellbeing',
      'module_dfv_in_health_settings',
    ],
  },
  {
    id: 'sleep',
    pattern: /sleep|bedtime/,
    modules: [
      'module_supporting_childrens_safety_and_wellbeing',
      'module_parenting_under_stress',
    ],
  },
  {
    id: 'child-development',
    pattern:
      /development|milestone|brain|cognitive|learning|play|school|homework|toilet|temperament|imitation|critical period|life skills|infant care|transition/,
    modules: [
      'module_trauma_attachment_and_child_development',
      'module_supporting_childrens_safety_and_wellbeing',
    ],
  },
  {
    id: 'behaviour-guidance',
    pattern:
      /behaviour|discipline|consequence|reinforcement|command|instruction|defiance|non compliance|disobedience|tantrum|meltdown|aggression|hitting|fighting|lying|stealing|power struggle|time out|punish|limit setting|descriptive praise|descriptive commenting/,
    modules: ['module_boundaries_and_safety', 'module_parenting_under_stress'],
  },
  {
    id: 'emotional-regulation',
    pattern:
      /emotion|anxiety|anger|feeling|dysregulat|regulat|calming|nervous system|stress|burnout|distress|self regulation|trigger|self awareness/,
    modules: ['module_emotional_regulation', 'module_parenting_under_stress'],
  },
  {
    id: 'communication',
    pattern:
      /communicat|listening|i messages|conversation|negotiat|conflict resolution|conflict between parents|family meeting|roadblock/,
    modules: ['module_safe_conversations', 'module_relationship_skills'],
  },
  {
    id: 'attachment-and-connection',
    pattern:
      /attachment|connection|empathy|validation|trust|rupture|relationship|special time|being with|following the child|responsive|esponsive|nurtur|emotional availability|security|circle of security|joy/,
    modules: ['module_relationship_skills', 'module_child_healing'],
  },
  {
    id: 'routines-and-stability',
    pattern: /routine|consisten|chaos|habit|stability|follow through|repetition/,
    modules: ['module_sustainable_change', 'module_rebuilding_family_life'],
  },
  {
    id: 'trauma-and-violence',
    pattern:
      /trauma|violence|coercive control|survival|re traumat|frightening|abuse|adverse childhood|toxic stress|dissociation/,
    modules: [
      'module_understanding_dfv_impacts_on_children',
      'module_child_healing',
      'module_parent_safety',
    ],
  },
  {
    id: 'separation-and-coparenting',
    pattern:
      /separation|co parenting|coparenting|supervised contact|parenting order|court order|loyalty conflict|family change|foster|kinship/,
    modules: [
      'module_child_centred_and_family_focused_practice',
      'module_court_support_and_legal_processes',
      'module_rebuilding_family_life',
    ],
  },
  {
    id: 'digital-safety',
    pattern: /digital|online|screen time|social media/,
    modules: ['module_digital_safety_and_online_communities'],
  },
  {
    id: 'safety-and-risk',
    pattern: /safety|safe |risk taking|risk behaviour|protection responsibilit|protecting children/,
    modules: ['module_parent_safety', 'module_supporting_childrens_safety_and_wellbeing'],
  },
  {
    id: 'parent-wellbeing',
    pattern:
      /parent mental health|parent self|self care|self compassion|parenting trigger|reflective parenting|values based|parenting style|parenting under pressure/,
    modules: [
      'module_parenting_under_stress',
      'module_emotional_regulation',
      'module_sustainable_change',
    ],
  },
  {
    id: 'culture-and-equity',
    pattern: /cultur|social justice|ethics|identity|inclusive|neurodivers|autism|adhd|disability/,
    modules: [
      'module_trauma_informed_and_culturally_safe_practice',
      'module_child_centred_and_family_focused_practice',
    ],
  },
  {
    id: 'social-development',
    pattern:
      /social development|social skills|sharing|turn taking|sibling|bullying|self esteem|body image|raising confident/,
    modules: [
      'module_relationship_skills',
      'module_supporting_childrens_safety_and_wellbeing',
    ],
  },
  {
    id: 'positive-parenting',
    pattern:
      /positive parenting|firm but kind|teaching instead|effective parenting|enjoyment skill|respectful interaction|positive interaction|parent directed|child directed/,
    modules: ['module_relationship_skills', 'module_boundaries_and_safety'],
  },
  {
    id: 'family-support',
    pattern:
      /family centred|working with families|vulnerable families|parent partnership|multiple children|supporting children through change/,
    modules: ['module_child_centred_and_family_focused_practice'],
  },
  {
    id: 'healthy-home',
    pattern: /healthy home environment/,
    modules: ['module_parent_safety', 'module_rebuilding_family_life'],
  },
  {
    id: 'economic-stability',
    pattern: /budget|food insecurity|financial|economic/,
    modules: ['module_economic_abuse_and_financial_security', 'module_parent_safety'],
  },
  {
    id: 'problem-solving',
    pattern: /problem solving|decision making|choices and control|motivation/,
    modules: ['module_sustainable_change', 'module_relationship_skills'],
  },
  {
    id: 'general-parenting',
    pattern: /parenting|caregiving|child focused|child parent/,
    modules: ['module_child_centred_and_family_focused_practice'],
  },
];

function readRecords(directory) {
  return fs
    .readdirSync(directory)
    .filter((fileName) => fileName.endsWith('.json'))
    .sort()
    .map((fileName) => ({
      fileName,
      filePath: path.join(directory, fileName),
      record: JSON.parse(fs.readFileSync(path.join(directory, fileName), 'utf8').replace(/^\uFEFF/, '')),
    }));
}

function normalize(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function aliasKey(value) {
  return normalize(value).replace(/\s+/g, '_');
}

function buildExactMappings(modules, lessons) {
  const lessonAliases = new Map();
  for (const lesson of lessons) {
    const aliases = [
      lesson.record.id,
      path.basename(lesson.fileName, '.json'),
      lesson.record.title,
      lesson.record.topicName,
    ];
    for (const alias of aliases.map(aliasKey).filter(Boolean)) {
      const ids = lessonAliases.get(alias) || new Set();
      ids.add(lesson.record.id);
      lessonAliases.set(alias, ids);
    }
  }

  const lessonModules = new Map();
  const moduleAliases = new Map();
  for (const moduleEntry of modules) {
    for (const lessonId of moduleEntry.record.lessons || []) {
      const moduleIds = lessonModules.get(lessonId) || new Set();
      moduleIds.add(moduleEntry.record.id);
      lessonModules.set(lessonId, moduleIds);
    }
    const aliases = [
      moduleEntry.record.id.replace(/^module_/, ''),
      moduleEntry.record.title,
    ];
    for (const alias of aliases.map(aliasKey).filter(Boolean)) {
      const moduleIds = moduleAliases.get(alias) || new Set();
      moduleIds.add(moduleEntry.record.id);
      moduleAliases.set(alias, moduleIds);
    }
  }

  return { lessonAliases, lessonModules, moduleAliases };
}

export function deriveTopicMappings() {
  const topics = readRecords(topicsRoot);
  const modules = readRecords(modulesRoot);
  const lessons = readRecords(lessonsRoot);
  const moduleIds = new Set(modules.map((entry) => entry.record.id));
  const exact = buildExactMappings(modules, lessons);
  const mappings = [];
  const unmatched = [];

  for (const topic of topics) {
    if (Array.isArray(topic.record.modules) && topic.record.modules.length > 0) {
      mappings.push({
        fileName: topic.fileName,
        topicId: topic.record.id,
        modules: topic.record.modules,
        reasons: ['existing'],
      });
      continue;
    }

    const aliases = [
      topic.record.id,
      topic.record.topicId,
      topic.record.topicName,
      path.basename(topic.fileName, '.json'),
    ]
      .map(aliasKey)
      .filter(Boolean);
    const assigned = new Set();
    const reasons = [];

    for (const alias of aliases) {
      for (const lessonId of exact.lessonAliases.get(alias) || []) {
        for (const moduleId of exact.lessonModules.get(lessonId) || []) {
          assigned.add(moduleId);
          reasons.push(`lesson:${lessonId}`);
        }
      }
    }

    if (assigned.size === 0) {
      for (const alias of aliases) {
        for (const moduleId of exact.moduleAliases.get(alias.replace(/^module_/, '')) || []) {
          assigned.add(moduleId);
          reasons.push(`module:${moduleId}`);
        }
      }
    }

    const searchable = normalize(`${topic.record.id} ${topic.record.topicName}`);
    for (const rule of rules) {
      if (!rule.pattern.test(searchable)) continue;
      for (const moduleId of rule.modules) assigned.add(moduleId);
      reasons.push(`rule:${rule.id}`);
    }

    const invalid = [...assigned].filter((moduleId) => !moduleIds.has(moduleId));
    if (invalid.length > 0) {
      throw new Error(
        `Topic mapping rules reference missing modules for ${topic.fileName}: ${invalid.join(', ')}`,
      );
    }

    if (assigned.size === 0) {
      unmatched.push({
        fileName: topic.fileName,
        topicId: topic.record.id,
        topicName: topic.record.topicName,
      });
      continue;
    }

    mappings.push({
      fileName: topic.fileName,
      topicId: topic.record.id,
      modules: [...assigned].sort(),
      reasons: [...new Set(reasons)].sort(),
    });
  }

  return { mappings, unmatched };
}

function main() {
  const apply = process.argv.includes('--apply');
  const reportPath = path.join(repoRoot, 'docs', 'content-readiness', 'topic-module-mappings.json');
  const result = deriveTopicMappings();

  if (apply && result.unmatched.length > 0) {
    throw new Error(
      `Refusing to apply incomplete topic mappings. ${result.unmatched.length} topics remain unmatched.`,
    );
  }

  if (apply) {
    for (const mapping of result.mappings) {
      const filePath = path.join(topicsRoot, mapping.fileName);
      const record = JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
      record.modules = mapping.modules;
      fs.writeFileSync(filePath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
    }
  }

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(
    reportPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        applied: apply,
        counts: {
          mappedTopics: result.mappings.length,
          unmatchedTopics: result.unmatched.length,
        },
        mappings: result.mappings,
        unmatched: result.unmatched,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(
    JSON.stringify(
      {
        applied: apply,
        mappedTopics: result.mappings.length,
        unmatchedTopics: result.unmatched.length,
        report: path.relative(repoRoot, reportPath),
      },
      null,
      2,
    ),
  );

  if (result.unmatched.length > 0) process.exitCode = 1;
}

main();
