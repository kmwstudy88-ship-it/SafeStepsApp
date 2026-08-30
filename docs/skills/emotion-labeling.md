# Skill: Emotion Labeling

**Version:** 1.0.0  
**Status:** Production

---

## Purpose

Identify and label emotional content expressed in case notes, client narratives, and professional observations. Emotion labels support practitioners in understanding the emotional context of statements and identifying clients who may require additional emotional support or stabilisation.

---

## Inputs

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | string | Yes | Text to analyse |
| `context.speaker_role` | string | No | Role of the speaker (e.g. `child`, `parent`, `professional`) |

---

## Outputs

| Field | Type | Description |
|---|---|---|
| `emotion_labels` | array | Detected emotional expressions |
| `emotion_labels[].label_id` | string | Unique identifier |
| `emotion_labels[].emotion` | string | Canonical emotion label |
| `emotion_labels[].intensity` | string | `mild`, `moderate`, `intense` |
| `emotion_labels[].valence` | string | `positive`, `negative`, `ambivalent` |
| `emotion_labels[].text_span` | object | `{start, end}` |
| `emotion_labels[].confidence` | number | 0.0–1.0 |
| `dominant_emotion` | string | Highest-intensity detected emotion |
| `distress_flag` | boolean | True if intense negative emotions detected |
| `run_meta` | object | `{skill_version, model, timestamp_utc}` |

---

## Valid Emotion Labels

`fear`, `sadness`, `anger`, `shame`, `guilt`, `grief`, `anxiety`, `hope`, `confusion`, `relief`, `helplessness`, `distress`, `joy`, `love`, `ambivalence`

---

## Processing Notes

1. Label at the phrase level, not sentence level, for precision.
2. Distinguish reported emotions ("she said she felt scared") from observed emotions ("appeared distressed") — both are valid but should be flagged by source type.
3. `distress_flag: true` when any `intensity: intense` + `valence: negative` combination is detected.

---

## Safety Constraints

- Emotion labels MUST NOT be presented to clients as evaluations or judgements.
- `distress_flag: true` MUST trigger a professional welfare check recommendation.
- MUST NOT be used to discount the validity of a person's account based on emotional content.

---

## Escalation Conditions

- `distress_flag: true` in child-authored text
- `emotion: fear` or `emotion: helplessness` at `intensity: intense` in child-authored text

---

## Audit Fields

- `run_meta.skill_version`, `run_meta.model`, `run_meta.timestamp_utc`
- `emotion_labels[].text_span` for all labels

---

## Failure Modes

| Mode | Description | Mitigation |
|---|---|---|
| Cultural expression variation | Emotion expressions differ across cultures | Flag for cultural safety review when cultural context is present |
| Masked emotions | Client suppresses emotional expression | Note absence of expected emotional markers as a clinical signal |
| Compound emotions | Multiple simultaneous emotions in a single phrase | Allow multi-label assignment |
