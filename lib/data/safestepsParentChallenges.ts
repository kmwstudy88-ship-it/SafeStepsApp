export type SafeStepsParentChallenge = {
  id: string;
  title: string;
  displayTitle: string;
  category: string;
  challengeType: "daily" | "weekly" | "monthly";
  estimatedTime: string;
  quickQuestionBeforeChallenge: string;
  purpose: string;
  parentSkillFocus: string[];
  challengeSteps: string[];
  reflectionQuestions: string[];
  evidenceTask: string;
  completionChecklist: string[];
  safetyNote: string;
  tags: string[];
};

export const safestepsParentChallenges: SafeStepsParentChallenge[] = [
  {
    "id": "SS-PC-001",
    "title": "Connection Check-In",
    "displayTitle": "Connection Check-In",
    "category": "Connection & Attachment",
    "challengeType": "daily",
    "estimatedTime": "10–15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Connection Check-In mean to me as a parent or carer?",
    "purpose": "Use a calm moment to reconnect with your child before trying to correct behaviour.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "connection & attachment"
    ],
    "challengeSteps": [
      "Read the title out loud: Connection Check-In.",
      "Answer the quick question before starting: What does connection check-in mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising connection check-in?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Connection Check-In' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "connection-attachment",
      "connection-check-in",
      "daily"
    ]
  },
  {
    "id": "SS-PC-002",
    "title": "Five Minutes of Child-Led Time",
    "displayTitle": "Five Minutes of Child-Led Time",
    "category": "Connection & Attachment",
    "challengeType": "daily",
    "estimatedTime": "5–10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Five Minutes of Child-Led Time mean to me as a parent or carer?",
    "purpose": "Let your child lead play or conversation while you follow, notice, and encourage.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "connection & attachment"
    ],
    "challengeSteps": [
      "Read the title out loud: Five Minutes of Child-Led Time.",
      "Answer the quick question before starting: What does five minutes of child-led time mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising five minutes of child-led time?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Five Minutes of Child-Led Time' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "connection-attachment",
      "five-minutes-of-child-led-time",
      "daily"
    ]
  },
  {
    "id": "SS-PC-003",
    "title": "Repair After a Hard Moment",
    "displayTitle": "Repair After a Hard Moment",
    "category": "Connection & Attachment",
    "challengeType": "daily",
    "estimatedTime": "10–15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Repair After a Hard Moment mean to me as a parent or carer?",
    "purpose": "Practise returning to your child after conflict with ownership, care, and safety.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "connection & attachment"
    ],
    "challengeSteps": [
      "Read the title out loud: Repair After a Hard Moment.",
      "Answer the quick question before starting: What does repair after a hard moment mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising repair after a hard moment?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Repair After a Hard Moment' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "connection-attachment",
      "repair-after-a-hard-moment",
      "daily"
    ]
  },
  {
    "id": "SS-PC-004",
    "title": "Name One Strength",
    "displayTitle": "Name One Strength",
    "category": "Connection & Attachment",
    "challengeType": "daily",
    "estimatedTime": "5 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Name One Strength mean to me as a parent or carer?",
    "purpose": "Build your child’s felt sense of being seen by naming a real strength.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "connection & attachment"
    ],
    "challengeSteps": [
      "Read the title out loud: Name One Strength.",
      "Answer the quick question before starting: What does name one strength mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising name one strength?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Name One Strength' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "connection-attachment",
      "name-one-strength",
      "daily"
    ]
  },
  {
    "id": "SS-PC-005",
    "title": "Warm Greeting Challenge",
    "displayTitle": "Warm Greeting Challenge",
    "category": "Connection & Attachment",
    "challengeType": "daily",
    "estimatedTime": "5 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Warm Greeting Challenge mean to me as a parent or carer?",
    "purpose": "Create a predictable positive greeting after school, care, visits, or separation.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "connection & attachment"
    ],
    "challengeSteps": [
      "Read the title out loud: Warm Greeting Challenge.",
      "Answer the quick question before starting: What does warm greeting challenge mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising warm greeting challenge?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Warm Greeting Challenge' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "connection-attachment",
      "warm-greeting-challenge",
      "daily"
    ]
  },
  {
    "id": "SS-PC-006",
    "title": "Bedtime Connection Moment",
    "displayTitle": "Bedtime Connection Moment",
    "category": "Connection & Attachment",
    "challengeType": "daily",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Bedtime Connection Moment mean to me as a parent or carer?",
    "purpose": "End the day with reassurance, calm voice, and a short connection ritual.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "connection & attachment"
    ],
    "challengeSteps": [
      "Read the title out loud: Bedtime Connection Moment.",
      "Answer the quick question before starting: What does bedtime connection moment mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising bedtime connection moment?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Bedtime Connection Moment' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "connection-attachment",
      "bedtime-connection-moment",
      "daily"
    ]
  },
  {
    "id": "SS-PC-007",
    "title": "One-on-One Special Time",
    "displayTitle": "One-on-One Special Time",
    "category": "Connection & Attachment",
    "challengeType": "weekly",
    "estimatedTime": "20–30 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does One-on-One Special Time mean to me as a parent or carer?",
    "purpose": "Schedule protected time with one child without screens, lectures, or interrogation.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "connection & attachment"
    ],
    "challengeSteps": [
      "Read the title out loud: One-on-One Special Time.",
      "Answer the quick question before starting: What does one-on-one special time mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising one-on-one special time?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'One-on-One Special Time' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "connection-attachment",
      "one-on-one-special-time",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-008",
    "title": "Notice Before Correcting",
    "displayTitle": "Notice Before Correcting",
    "category": "Connection & Attachment",
    "challengeType": "daily",
    "estimatedTime": "5–10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Notice Before Correcting mean to me as a parent or carer?",
    "purpose": "Practise noticing what is working before addressing what needs to change.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "connection & attachment"
    ],
    "challengeSteps": [
      "Read the title out loud: Notice Before Correcting.",
      "Answer the quick question before starting: What does notice before correcting mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising notice before correcting?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Notice Before Correcting' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "connection-attachment",
      "notice-before-correcting",
      "daily"
    ]
  },
  {
    "id": "SS-PC-009",
    "title": "Pause Before Responding",
    "displayTitle": "Pause Before Responding",
    "category": "Parent Self-Regulation",
    "challengeType": "daily",
    "estimatedTime": "2–5 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Pause Before Responding mean to me as a parent or carer?",
    "purpose": "Build the habit of pausing before reacting when behaviour feels stressful.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "parent self-regulation"
    ],
    "challengeSteps": [
      "Read the title out loud: Pause Before Responding.",
      "Answer the quick question before starting: What does pause before responding mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising pause before responding?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Pause Before Responding' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "parent-self-regulation",
      "pause-before-responding",
      "daily"
    ]
  },
  {
    "id": "SS-PC-010",
    "title": "Calm Voice Practice",
    "displayTitle": "Calm Voice Practice",
    "category": "Parent Self-Regulation",
    "challengeType": "daily",
    "estimatedTime": "5 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Calm Voice Practice mean to me as a parent or carer?",
    "purpose": "Practise using a firm, low, steady voice during limits and instructions.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "parent self-regulation"
    ],
    "challengeSteps": [
      "Read the title out loud: Calm Voice Practice.",
      "Answer the quick question before starting: What does calm voice practice mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising calm voice practice?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Calm Voice Practice' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "parent-self-regulation",
      "calm-voice-practice",
      "daily"
    ]
  },
  {
    "id": "SS-PC-011",
    "title": "Trigger Tracker",
    "displayTitle": "Trigger Tracker",
    "category": "Parent Self-Regulation",
    "challengeType": "weekly",
    "estimatedTime": "15–20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Trigger Tracker mean to me as a parent or carer?",
    "purpose": "Identify the situations that make parenting harder and plan safer responses.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "parent self-regulation"
    ],
    "challengeSteps": [
      "Read the title out loud: Trigger Tracker.",
      "Answer the quick question before starting: What does trigger tracker mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising trigger tracker?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Trigger Tracker' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "parent-self-regulation",
      "trigger-tracker",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-012",
    "title": "Regulation Reset Plan",
    "displayTitle": "Regulation Reset Plan",
    "category": "Parent Self-Regulation",
    "challengeType": "weekly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Regulation Reset Plan mean to me as a parent or carer?",
    "purpose": "Create a short parent reset plan for moments of stress, anger, or overwhelm.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "parent self-regulation"
    ],
    "challengeSteps": [
      "Read the title out loud: Regulation Reset Plan.",
      "Answer the quick question before starting: What does regulation reset plan mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising regulation reset plan?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Regulation Reset Plan' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "parent-self-regulation",
      "regulation-reset-plan",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-013",
    "title": "Body Signal Check",
    "displayTitle": "Body Signal Check",
    "category": "Parent Self-Regulation",
    "challengeType": "daily",
    "estimatedTime": "5 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Body Signal Check mean to me as a parent or carer?",
    "purpose": "Notice body signs of escalation before they turn into shouting or harsh reactions.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "parent self-regulation"
    ],
    "challengeSteps": [
      "Read the title out loud: Body Signal Check.",
      "Answer the quick question before starting: What does body signal check mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising body signal check?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Body Signal Check' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "parent-self-regulation",
      "body-signal-check",
      "daily"
    ]
  },
  {
    "id": "SS-PC-014",
    "title": "Safe Exit Statement",
    "displayTitle": "Safe Exit Statement",
    "category": "Parent Self-Regulation",
    "challengeType": "daily",
    "estimatedTime": "5–10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Safe Exit Statement mean to me as a parent or carer?",
    "purpose": "Prepare a calm statement to step away briefly while keeping the child safe.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "parent self-regulation"
    ],
    "challengeSteps": [
      "Read the title out loud: Safe Exit Statement.",
      "Answer the quick question before starting: What does safe exit statement mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising safe exit statement?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Safe Exit Statement' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "parent-self-regulation",
      "safe-exit-statement",
      "daily"
    ]
  },
  {
    "id": "SS-PC-015",
    "title": "Stress-to-Skill Reflection",
    "displayTitle": "Stress-to-Skill Reflection",
    "category": "Parent Self-Regulation",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Stress-to-Skill Reflection mean to me as a parent or carer?",
    "purpose": "Turn one stressful parenting moment into a skill-building plan.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "parent self-regulation"
    ],
    "challengeSteps": [
      "Read the title out loud: Stress-to-Skill Reflection.",
      "Answer the quick question before starting: What does stress-to-skill reflection mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising stress-to-skill reflection?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Stress-to-Skill Reflection' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "parent-self-regulation",
      "stress-to-skill-reflection",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-016",
    "title": "Self-Compassion Reframe",
    "displayTitle": "Self-Compassion Reframe",
    "category": "Parent Self-Regulation",
    "challengeType": "weekly",
    "estimatedTime": "10–15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Self-Compassion Reframe mean to me as a parent or carer?",
    "purpose": "Reduce shame and increase responsibility by reflecting on growth instead of perfection.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "parent self-regulation"
    ],
    "challengeSteps": [
      "Read the title out loud: Self-Compassion Reframe.",
      "Answer the quick question before starting: What does self-compassion reframe mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising self-compassion reframe?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Self-Compassion Reframe' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "parent-self-regulation",
      "self-compassion-reframe",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-017",
    "title": "I-Message Practice",
    "displayTitle": "I-Message Practice",
    "category": "Communication",
    "challengeType": "daily",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does I-Message Practice mean to me as a parent or carer?",
    "purpose": "Use an I-message to express a need without blaming or attacking.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "communication"
    ],
    "challengeSteps": [
      "Read the title out loud: I-Message Practice.",
      "Answer the quick question before starting: What does i-message practice mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising i-message practice?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'I-Message Practice' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "communication",
      "i-message-practice",
      "daily"
    ]
  },
  {
    "id": "SS-PC-018",
    "title": "Listen First Challenge",
    "displayTitle": "Listen First Challenge",
    "category": "Communication",
    "challengeType": "daily",
    "estimatedTime": "10–15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Listen First Challenge mean to me as a parent or carer?",
    "purpose": "Practise listening to your child before correcting, explaining, or defending.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "communication"
    ],
    "challengeSteps": [
      "Read the title out loud: Listen First Challenge.",
      "Answer the quick question before starting: What does listen first challenge mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising listen first challenge?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Listen First Challenge' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "communication",
      "listen-first-challenge",
      "daily"
    ]
  },
  {
    "id": "SS-PC-019",
    "title": "Reflect Back Feelings",
    "displayTitle": "Reflect Back Feelings",
    "category": "Communication",
    "challengeType": "daily",
    "estimatedTime": "5–10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Reflect Back Feelings mean to me as a parent or carer?",
    "purpose": "Help your child feel understood by reflecting the feeling behind their words or behaviour.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "communication"
    ],
    "challengeSteps": [
      "Read the title out loud: Reflect Back Feelings.",
      "Answer the quick question before starting: What does reflect back feelings mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising reflect back feelings?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Reflect Back Feelings' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "communication",
      "reflect-back-feelings",
      "daily"
    ]
  },
  {
    "id": "SS-PC-020",
    "title": "One Clear Instruction",
    "displayTitle": "One Clear Instruction",
    "category": "Communication",
    "challengeType": "daily",
    "estimatedTime": "5 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does One Clear Instruction mean to me as a parent or carer?",
    "purpose": "Practise giving one short, clear instruction instead of repeated demands.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "communication"
    ],
    "challengeSteps": [
      "Read the title out loud: One Clear Instruction.",
      "Answer the quick question before starting: What does one clear instruction mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising one clear instruction?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'One Clear Instruction' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "communication",
      "one-clear-instruction",
      "daily"
    ]
  },
  {
    "id": "SS-PC-021",
    "title": "No Lecture Limit",
    "displayTitle": "No Lecture Limit",
    "category": "Communication",
    "challengeType": "daily",
    "estimatedTime": "5–10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does No Lecture Limit mean to me as a parent or carer?",
    "purpose": "Reduce long lectures and replace them with short, calm teaching statements.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "communication"
    ],
    "challengeSteps": [
      "Read the title out loud: No Lecture Limit.",
      "Answer the quick question before starting: What does no lecture limit mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising no lecture limit?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'No Lecture Limit' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "communication",
      "no-lecture-limit",
      "daily"
    ]
  },
  {
    "id": "SS-PC-022",
    "title": "Ask, Don’t Assume",
    "displayTitle": "Ask, Don’t Assume",
    "category": "Communication",
    "challengeType": "daily",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Ask, Don’t Assume mean to me as a parent or carer?",
    "purpose": "Check what your child means before responding to behaviour or tone.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "communication"
    ],
    "challengeSteps": [
      "Read the title out loud: Ask, Don’t Assume.",
      "Answer the quick question before starting: What does ask, don’t assume mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising ask, don’t assume?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Ask, Don’t Assume' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "communication",
      "ask-dont-assume",
      "daily"
    ]
  },
  {
    "id": "SS-PC-023",
    "title": "Communication Roadblock Audit",
    "displayTitle": "Communication Roadblock Audit",
    "category": "Communication",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Communication Roadblock Audit mean to me as a parent or carer?",
    "purpose": "Identify one habit that blocks communication and replace it with a safer option.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "communication"
    ],
    "challengeSteps": [
      "Read the title out loud: Communication Roadblock Audit.",
      "Answer the quick question before starting: What does communication roadblock audit mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising communication roadblock audit?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Communication Roadblock Audit' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "communication",
      "communication-roadblock-audit",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-024",
    "title": "Positive Message Challenge",
    "displayTitle": "Positive Message Challenge",
    "category": "Communication",
    "challengeType": "daily",
    "estimatedTime": "5 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Positive Message Challenge mean to me as a parent or carer?",
    "purpose": "Send or say one positive, child-focused message without adding criticism.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "communication"
    ],
    "challengeSteps": [
      "Read the title out loud: Positive Message Challenge.",
      "Answer the quick question before starting: What does positive message challenge mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising positive message challenge?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Positive Message Challenge' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "communication",
      "positive-message-challenge",
      "daily"
    ]
  },
  {
    "id": "SS-PC-025",
    "title": "Connection Before Correction",
    "displayTitle": "Connection Before Correction",
    "category": "Discipline & Boundaries",
    "challengeType": "daily",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Connection Before Correction mean to me as a parent or carer?",
    "purpose": "Use a short connection step before correcting behaviour.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "discipline & boundaries"
    ],
    "challengeSteps": [
      "Read the title out loud: Connection Before Correction.",
      "Answer the quick question before starting: What does connection before correction mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising connection before correction?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Connection Before Correction' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "discipline-boundaries",
      "connection-before-correction",
      "daily"
    ]
  },
  {
    "id": "SS-PC-026",
    "title": "Firm but Kind Limit",
    "displayTitle": "Firm but Kind Limit",
    "category": "Discipline & Boundaries",
    "challengeType": "daily",
    "estimatedTime": "5–10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Firm but Kind Limit mean to me as a parent or carer?",
    "purpose": "Hold one boundary using calm words and predictable follow-through.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "discipline & boundaries"
    ],
    "challengeSteps": [
      "Read the title out loud: Firm but Kind Limit.",
      "Answer the quick question before starting: What does firm but kind limit mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising firm but kind limit?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Firm but Kind Limit' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "discipline-boundaries",
      "firm-but-kind-limit",
      "daily"
    ]
  },
  {
    "id": "SS-PC-027",
    "title": "Natural Consequence Check",
    "displayTitle": "Natural Consequence Check",
    "category": "Discipline & Boundaries",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Natural Consequence Check mean to me as a parent or carer?",
    "purpose": "Review whether a consequence is related, respectful, reasonable, and helpful.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "discipline & boundaries"
    ],
    "challengeSteps": [
      "Read the title out loud: Natural Consequence Check.",
      "Answer the quick question before starting: What does natural consequence check mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising natural consequence check?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Natural Consequence Check' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "discipline-boundaries",
      "natural-consequence-check",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-028",
    "title": "Delayed Consequence Practice",
    "displayTitle": "Delayed Consequence Practice",
    "category": "Discipline & Boundaries",
    "challengeType": "daily",
    "estimatedTime": "5 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Delayed Consequence Practice mean to me as a parent or carer?",
    "purpose": "Avoid reacting in anger by delaying consequences until calm.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "discipline & boundaries"
    ],
    "challengeSteps": [
      "Read the title out loud: Delayed Consequence Practice.",
      "Answer the quick question before starting: What does delayed consequence practice mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising delayed consequence practice?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Delayed Consequence Practice' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "discipline-boundaries",
      "delayed-consequence-practice",
      "daily"
    ]
  },
  {
    "id": "SS-PC-029",
    "title": "Praise the Start Behaviour",
    "displayTitle": "Praise the Start Behaviour",
    "category": "Discipline & Boundaries",
    "challengeType": "daily",
    "estimatedTime": "5 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Praise the Start Behaviour mean to me as a parent or carer?",
    "purpose": "Notice and reinforce the behaviour you want to see more often.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "discipline & boundaries"
    ],
    "challengeSteps": [
      "Read the title out loud: Praise the Start Behaviour.",
      "Answer the quick question before starting: What does praise the start behaviour mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising praise the start behaviour?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Praise the Start Behaviour' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "discipline-boundaries",
      "praise-the-start-behaviour",
      "daily"
    ]
  },
  {
    "id": "SS-PC-030",
    "title": "Ignore Minor Misbehaviour Safely",
    "displayTitle": "Ignore Minor Misbehaviour Safely",
    "category": "Discipline & Boundaries",
    "challengeType": "daily",
    "estimatedTime": "5–10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Ignore Minor Misbehaviour Safely mean to me as a parent or carer?",
    "purpose": "Practise not feeding harmless attention-seeking behaviour while still supervising safely.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "discipline & boundaries"
    ],
    "challengeSteps": [
      "Read the title out loud: Ignore Minor Misbehaviour Safely.",
      "Answer the quick question before starting: What does ignore minor misbehaviour safely mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising ignore minor misbehaviour safely?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Ignore Minor Misbehaviour Safely' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "discipline-boundaries",
      "ignore-minor-misbehaviour-safely",
      "daily"
    ]
  },
  {
    "id": "SS-PC-031",
    "title": "Limit With Emotion",
    "displayTitle": "Limit With Emotion",
    "category": "Discipline & Boundaries",
    "challengeType": "daily",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Limit With Emotion mean to me as a parent or carer?",
    "purpose": "Set a boundary while also naming and accepting the child’s feeling.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "discipline & boundaries"
    ],
    "challengeSteps": [
      "Read the title out loud: Limit With Emotion.",
      "Answer the quick question before starting: What does limit with emotion mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising limit with emotion?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Limit With Emotion' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "discipline-boundaries",
      "limit-with-emotion",
      "daily"
    ]
  },
  {
    "id": "SS-PC-032",
    "title": "Repair the Rule",
    "displayTitle": "Repair the Rule",
    "category": "Discipline & Boundaries",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Repair the Rule mean to me as a parent or carer?",
    "purpose": "Review one family rule and make it clearer, fairer, and easier to follow.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "discipline & boundaries"
    ],
    "challengeSteps": [
      "Read the title out loud: Repair the Rule.",
      "Answer the quick question before starting: What does repair the rule mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising repair the rule?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Repair the Rule' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "discipline-boundaries",
      "repair-the-rule",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-033",
    "title": "Morning Routine Reset",
    "displayTitle": "Morning Routine Reset",
    "category": "Routines & Structure",
    "challengeType": "weekly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Morning Routine Reset mean to me as a parent or carer?",
    "purpose": "Make mornings calmer by simplifying the next day’s routine.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "routines & structure"
    ],
    "challengeSteps": [
      "Read the title out loud: Morning Routine Reset.",
      "Answer the quick question before starting: What does morning routine reset mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising morning routine reset?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Morning Routine Reset' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "routines-structure",
      "morning-routine-reset",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-034",
    "title": "Bedtime Routine Reset",
    "displayTitle": "Bedtime Routine Reset",
    "category": "Routines & Structure",
    "challengeType": "weekly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Bedtime Routine Reset mean to me as a parent or carer?",
    "purpose": "Create a predictable bedtime rhythm that supports safety and sleep.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "routines & structure"
    ],
    "challengeSteps": [
      "Read the title out loud: Bedtime Routine Reset.",
      "Answer the quick question before starting: What does bedtime routine reset mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising bedtime routine reset?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Bedtime Routine Reset' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "routines-structure",
      "bedtime-routine-reset",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-035",
    "title": "Meal Routine Challenge",
    "displayTitle": "Meal Routine Challenge",
    "category": "Routines & Structure",
    "challengeType": "weekly",
    "estimatedTime": "20–30 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Meal Routine Challenge mean to me as a parent or carer?",
    "purpose": "Plan one calmer shared meal with fewer distractions and clearer expectations.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "routines & structure"
    ],
    "challengeSteps": [
      "Read the title out loud: Meal Routine Challenge.",
      "Answer the quick question before starting: What does meal routine challenge mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising meal routine challenge?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Meal Routine Challenge' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "routines-structure",
      "meal-routine-challenge",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-036",
    "title": "Homework Support Plan",
    "displayTitle": "Homework Support Plan",
    "category": "Routines & Structure",
    "challengeType": "weekly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Homework Support Plan mean to me as a parent or carer?",
    "purpose": "Create a practical structure for homework without power struggles.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "routines & structure"
    ],
    "challengeSteps": [
      "Read the title out loud: Homework Support Plan.",
      "Answer the quick question before starting: What does homework support plan mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising homework support plan?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Homework Support Plan' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "routines-structure",
      "homework-support-plan",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-037",
    "title": "Screen-Time Boundary",
    "displayTitle": "Screen-Time Boundary",
    "category": "Routines & Structure",
    "challengeType": "weekly",
    "estimatedTime": "15–20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Screen-Time Boundary mean to me as a parent or carer?",
    "purpose": "Set one realistic screen-time boundary and explain it calmly.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "routines & structure"
    ],
    "challengeSteps": [
      "Read the title out loud: Screen-Time Boundary.",
      "Answer the quick question before starting: What does screen-time boundary mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising screen-time boundary?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Screen-Time Boundary' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "routines-structure",
      "screen-time-boundary",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-038",
    "title": "Family Calendar Check",
    "displayTitle": "Family Calendar Check",
    "category": "Routines & Structure",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Family Calendar Check mean to me as a parent or carer?",
    "purpose": "Review the week ahead so children know what to expect.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "routines & structure"
    ],
    "challengeSteps": [
      "Read the title out loud: Family Calendar Check.",
      "Answer the quick question before starting: What does family calendar check mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising family calendar check?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Family Calendar Check' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "routines-structure",
      "family-calendar-check",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-039",
    "title": "Chore Ladder",
    "displayTitle": "Chore Ladder",
    "category": "Routines & Structure",
    "challengeType": "weekly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Chore Ladder mean to me as a parent or carer?",
    "purpose": "Assign one age-appropriate responsibility and teach it step by step.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "routines & structure"
    ],
    "challengeSteps": [
      "Read the title out loud: Chore Ladder.",
      "Answer the quick question before starting: What does chore ladder mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising chore ladder?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Chore Ladder' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "routines-structure",
      "chore-ladder",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-040",
    "title": "Ten-Minute Tidy",
    "displayTitle": "Ten-Minute Tidy",
    "category": "Routines & Structure",
    "challengeType": "daily",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Ten-Minute Tidy mean to me as a parent or carer?",
    "purpose": "Use a short, shared tidy-up to reduce chaos without blame.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "routines & structure"
    ],
    "challengeSteps": [
      "Read the title out loud: Ten-Minute Tidy.",
      "Answer the quick question before starting: What does ten-minute tidy mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising ten-minute tidy?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Ten-Minute Tidy' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "routines-structure",
      "ten-minute-tidy",
      "daily"
    ]
  },
  {
    "id": "SS-PC-041",
    "title": "Feelings Word of the Day",
    "displayTitle": "Feelings Word of the Day",
    "category": "Emotional Literacy",
    "challengeType": "daily",
    "estimatedTime": "5 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Feelings Word of the Day mean to me as a parent or carer?",
    "purpose": "Teach one feeling word and connect it to real life.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "emotional literacy"
    ],
    "challengeSteps": [
      "Read the title out loud: Feelings Word of the Day.",
      "Answer the quick question before starting: What does feelings word of the day mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising feelings word of the day?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Feelings Word of the Day' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "emotional-literacy",
      "feelings-word-of-the-day",
      "daily"
    ]
  },
  {
    "id": "SS-PC-042",
    "title": "Validate Before Solving",
    "displayTitle": "Validate Before Solving",
    "category": "Emotional Literacy",
    "challengeType": "daily",
    "estimatedTime": "5–10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Validate Before Solving mean to me as a parent or carer?",
    "purpose": "Practise validating your child’s feeling before offering advice or consequences.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "emotional literacy"
    ],
    "challengeSteps": [
      "Read the title out loud: Validate Before Solving.",
      "Answer the quick question before starting: What does validate before solving mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising validate before solving?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Validate Before Solving' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "emotional-literacy",
      "validate-before-solving",
      "daily"
    ]
  },
  {
    "id": "SS-PC-043",
    "title": "Big Feeling Safety Plan",
    "displayTitle": "Big Feeling Safety Plan",
    "category": "Emotional Literacy",
    "challengeType": "weekly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Big Feeling Safety Plan mean to me as a parent or carer?",
    "purpose": "Create a safe plan for tantrums, meltdowns, anger, or overwhelm.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "emotional literacy"
    ],
    "challengeSteps": [
      "Read the title out loud: Big Feeling Safety Plan.",
      "Answer the quick question before starting: What does big feeling safety plan mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising big feeling safety plan?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Big Feeling Safety Plan' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "emotional-literacy",
      "big-feeling-safety-plan",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-044",
    "title": "Emotion Coaching Moment",
    "displayTitle": "Emotion Coaching Moment",
    "category": "Emotional Literacy",
    "challengeType": "daily",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Emotion Coaching Moment mean to me as a parent or carer?",
    "purpose": "Guide your child to name, understand, and manage an emotion.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "emotional literacy"
    ],
    "challengeSteps": [
      "Read the title out loud: Emotion Coaching Moment.",
      "Answer the quick question before starting: What does emotion coaching moment mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising emotion coaching moment?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Emotion Coaching Moment' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "emotional-literacy",
      "emotion-coaching-moment",
      "daily"
    ]
  },
  {
    "id": "SS-PC-045",
    "title": "Calm Space Setup",
    "displayTitle": "Calm Space Setup",
    "category": "Emotional Literacy",
    "challengeType": "weekly",
    "estimatedTime": "20–30 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Calm Space Setup mean to me as a parent or carer?",
    "purpose": "Create or improve a calming space that is not used as punishment.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "emotional literacy"
    ],
    "challengeSteps": [
      "Read the title out loud: Calm Space Setup.",
      "Answer the quick question before starting: What does calm space setup mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising calm space setup?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Calm Space Setup' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "emotional-literacy",
      "calm-space-setup",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-046",
    "title": "Feelings After Conflict",
    "displayTitle": "Feelings After Conflict",
    "category": "Emotional Literacy",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Feelings After Conflict mean to me as a parent or carer?",
    "purpose": "Talk through feelings after a conflict once everyone is calm.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "emotional literacy"
    ],
    "challengeSteps": [
      "Read the title out loud: Feelings After Conflict.",
      "Answer the quick question before starting: What does feelings after conflict mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising feelings after conflict?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Feelings After Conflict' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "emotional-literacy",
      "feelings-after-conflict",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-047",
    "title": "Shame-Free Correction",
    "displayTitle": "Shame-Free Correction",
    "category": "Emotional Literacy",
    "challengeType": "daily",
    "estimatedTime": "5–10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Shame-Free Correction mean to me as a parent or carer?",
    "purpose": "Correct behaviour without labels, insults, mocking, or shame.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "emotional literacy"
    ],
    "challengeSteps": [
      "Read the title out loud: Shame-Free Correction.",
      "Answer the quick question before starting: What does shame-free correction mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising shame-free correction?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Shame-Free Correction' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "emotional-literacy",
      "shame-free-correction",
      "daily"
    ]
  },
  {
    "id": "SS-PC-048",
    "title": "Core Emotion Check",
    "displayTitle": "Core Emotion Check",
    "category": "Emotional Literacy",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Core Emotion Check mean to me as a parent or carer?",
    "purpose": "Look beneath behaviour to identify fear, sadness, anger, shame, or overwhelm.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "emotional literacy"
    ],
    "challengeSteps": [
      "Read the title out loud: Core Emotion Check.",
      "Answer the quick question before starting: What does core emotion check mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising core emotion check?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Core Emotion Check' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "emotional-literacy",
      "core-emotion-check",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-049",
    "title": "Child Voice Question",
    "displayTitle": "Child Voice Question",
    "category": "Child Voice",
    "challengeType": "daily",
    "estimatedTime": "5–10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Child Voice Question mean to me as a parent or carer?",
    "purpose": "Ask one safe question that lets your child express their view without pressure.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "child voice"
    ],
    "challengeSteps": [
      "Read the title out loud: Child Voice Question.",
      "Answer the quick question before starting: What does child voice question mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising child voice question?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Child Voice Question' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "child-voice",
      "child-voice-question",
      "daily"
    ]
  },
  {
    "id": "SS-PC-050",
    "title": "Choice Within Limits",
    "displayTitle": "Choice Within Limits",
    "category": "Child Voice",
    "challengeType": "daily",
    "estimatedTime": "5 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Choice Within Limits mean to me as a parent or carer?",
    "purpose": "Offer two safe choices while keeping the adult boundary clear.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "child voice"
    ],
    "challengeSteps": [
      "Read the title out loud: Choice Within Limits.",
      "Answer the quick question before starting: What does choice within limits mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising choice within limits?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Choice Within Limits' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "child-voice",
      "choice-within-limits",
      "daily"
    ]
  },
  {
    "id": "SS-PC-051",
    "title": "What Helps You Feel Safe?",
    "displayTitle": "What Helps You Feel Safe?",
    "category": "Child Voice",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does What Helps You Feel Safe? mean to me as a parent or carer?",
    "purpose": "Invite your child to identify what helps them feel calm and safe.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "child voice"
    ],
    "challengeSteps": [
      "Read the title out loud: What Helps You Feel Safe?.",
      "Answer the quick question before starting: What does what helps you feel safe? mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising what helps you feel safe??",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'What Helps You Feel Safe?' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "child-voice",
      "what-helps-you-feel-safe",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-052",
    "title": "Family Meeting Starter",
    "displayTitle": "Family Meeting Starter",
    "category": "Child Voice",
    "challengeType": "weekly",
    "estimatedTime": "20–30 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Family Meeting Starter mean to me as a parent or carer?",
    "purpose": "Hold a short family meeting where everyone can share one need or idea.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "child voice"
    ],
    "challengeSteps": [
      "Read the title out loud: Family Meeting Starter.",
      "Answer the quick question before starting: What does family meeting starter mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising family meeting starter?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Family Meeting Starter' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "child-voice",
      "family-meeting-starter",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-053",
    "title": "Child Preference Check",
    "displayTitle": "Child Preference Check",
    "category": "Child Voice",
    "challengeType": "weekly",
    "estimatedTime": "10–15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Child Preference Check mean to me as a parent or carer?",
    "purpose": "Ask your child what helps with routines, transitions, meals, or bedtime.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "child voice"
    ],
    "challengeSteps": [
      "Read the title out loud: Child Preference Check.",
      "Answer the quick question before starting: What does child preference check mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising child preference check?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Child Preference Check' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "child-voice",
      "child-preference-check",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-054",
    "title": "Listen Without Fixing",
    "displayTitle": "Listen Without Fixing",
    "category": "Child Voice",
    "challengeType": "daily",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Listen Without Fixing mean to me as a parent or carer?",
    "purpose": "Give your child space to speak without immediately correcting or fixing.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "child voice"
    ],
    "challengeSteps": [
      "Read the title out loud: Listen Without Fixing.",
      "Answer the quick question before starting: What does listen without fixing mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising listen without fixing?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Listen Without Fixing' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "child-voice",
      "listen-without-fixing",
      "daily"
    ]
  },
  {
    "id": "SS-PC-055",
    "title": "Respectful Disagreement Practice",
    "displayTitle": "Respectful Disagreement Practice",
    "category": "Child Voice",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Respectful Disagreement Practice mean to me as a parent or carer?",
    "purpose": "Practise allowing disagreement while keeping tone and safety respectful.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "child voice"
    ],
    "challengeSteps": [
      "Read the title out loud: Respectful Disagreement Practice.",
      "Answer the quick question before starting: What does respectful disagreement practice mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising respectful disagreement practice?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Respectful Disagreement Practice' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "child-voice",
      "respectful-disagreement-practice",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-056",
    "title": "Child-Led Problem Solving",
    "displayTitle": "Child-Led Problem Solving",
    "category": "Child Voice",
    "challengeType": "weekly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Child-Led Problem Solving mean to me as a parent or carer?",
    "purpose": "Invite your child to help solve one small family problem.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "child voice"
    ],
    "challengeSteps": [
      "Read the title out loud: Child-Led Problem Solving.",
      "Answer the quick question before starting: What does child-led problem solving mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising child-led problem solving?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Child-Led Problem Solving' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "child-voice",
      "child-led-problem-solving",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-057",
    "title": "Home Safety Walkthrough",
    "displayTitle": "Home Safety Walkthrough",
    "category": "Safety & Stability",
    "challengeType": "weekly",
    "estimatedTime": "20–30 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Home Safety Walkthrough mean to me as a parent or carer?",
    "purpose": "Check one area of the home for physical safety and reduce hazards.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "safety & stability"
    ],
    "challengeSteps": [
      "Read the title out loud: Home Safety Walkthrough.",
      "Answer the quick question before starting: What does home safety walkthrough mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising home safety walkthrough?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Home Safety Walkthrough' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "safety-stability",
      "home-safety-walkthrough",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-058",
    "title": "Safe Adult List",
    "displayTitle": "Safe Adult List",
    "category": "Safety & Stability",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Safe Adult List mean to me as a parent or carer?",
    "purpose": "Help your child identify safe adults and how to ask for help.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "safety & stability"
    ],
    "challengeSteps": [
      "Read the title out loud: Safe Adult List.",
      "Answer the quick question before starting: What does safe adult list mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising safe adult list?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Safe Adult List' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "safety-stability",
      "safe-adult-list",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-059",
    "title": "No Adult Conflict Exposure",
    "displayTitle": "No Adult Conflict Exposure",
    "category": "Safety & Stability",
    "challengeType": "daily",
    "estimatedTime": "5–10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does No Adult Conflict Exposure mean to me as a parent or carer?",
    "purpose": "Plan one way to keep children away from adult disputes or hostile communication.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "safety & stability"
    ],
    "challengeSteps": [
      "Read the title out loud: No Adult Conflict Exposure.",
      "Answer the quick question before starting: What does no adult conflict exposure mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising no adult conflict exposure?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'No Adult Conflict Exposure' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "safety-stability",
      "no-adult-conflict-exposure",
      "daily"
    ]
  },
  {
    "id": "SS-PC-060",
    "title": "Digital Safety Check",
    "displayTitle": "Digital Safety Check",
    "category": "Safety & Stability",
    "challengeType": "weekly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Digital Safety Check mean to me as a parent or carer?",
    "purpose": "Review privacy, devices, apps, and online risks in an age-appropriate way.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "safety & stability"
    ],
    "challengeSteps": [
      "Read the title out loud: Digital Safety Check.",
      "Answer the quick question before starting: What does digital safety check mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising digital safety check?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Digital Safety Check' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "safety-stability",
      "digital-safety-check",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-061",
    "title": "Transition Safety Plan",
    "displayTitle": "Transition Safety Plan",
    "category": "Safety & Stability",
    "challengeType": "weekly",
    "estimatedTime": "15–20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Transition Safety Plan mean to me as a parent or carer?",
    "purpose": "Make changeovers, visits, school runs, or appointments more predictable and calmer.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "safety & stability"
    ],
    "challengeSteps": [
      "Read the title out loud: Transition Safety Plan.",
      "Answer the quick question before starting: What does transition safety plan mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising transition safety plan?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Transition Safety Plan' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "safety-stability",
      "transition-safety-plan",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-062",
    "title": "Emergency Basics Review",
    "displayTitle": "Emergency Basics Review",
    "category": "Safety & Stability",
    "challengeType": "monthly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Emergency Basics Review mean to me as a parent or carer?",
    "purpose": "Review basic safety information such as address, emergency numbers, and trusted help.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "safety & stability"
    ],
    "challengeSteps": [
      "Read the title out loud: Emergency Basics Review.",
      "Answer the quick question before starting: What does emergency basics review mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising emergency basics review?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Emergency Basics Review' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "safety-stability",
      "emergency-basics-review",
      "monthly"
    ]
  },
  {
    "id": "SS-PC-063",
    "title": "Safe Feeding Check",
    "displayTitle": "Safe Feeding Check",
    "category": "Safety & Stability",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Safe Feeding Check mean to me as a parent or carer?",
    "purpose": "Review one feeding, allergy, choking, or mealtime safety need.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "safety & stability"
    ],
    "challengeSteps": [
      "Read the title out loud: Safe Feeding Check.",
      "Answer the quick question before starting: What does safe feeding check mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising safe feeding check?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Safe Feeding Check' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "safety-stability",
      "safe-feeding-check",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-064",
    "title": "Sleep Safety Review",
    "displayTitle": "Sleep Safety Review",
    "category": "Safety & Stability",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Sleep Safety Review mean to me as a parent or carer?",
    "purpose": "Check whether sleep routines and sleep spaces are safe, calm, and age-appropriate.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "safety & stability"
    ],
    "challengeSteps": [
      "Read the title out loud: Sleep Safety Review.",
      "Answer the quick question before starting: What does sleep safety review mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising sleep safety review?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Sleep Safety Review' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "safety-stability",
      "sleep-safety-review",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-065",
    "title": "Child-Focused Co-Parent Message",
    "displayTitle": "Child-Focused Co-Parent Message",
    "category": "Co-Parenting",
    "challengeType": "weekly",
    "estimatedTime": "10–15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Child-Focused Co-Parent Message mean to me as a parent or carer?",
    "purpose": "Write one short, factual, child-focused message without blame.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "co-parenting"
    ],
    "challengeSteps": [
      "Read the title out loud: Child-Focused Co-Parent Message.",
      "Answer the quick question before starting: What does child-focused co-parent message mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising child-focused co-parent message?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Child-Focused Co-Parent Message' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "co-parenting",
      "child-focused-co-parent-message",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-066",
    "title": "Parallel Parenting Boundary",
    "displayTitle": "Parallel Parenting Boundary",
    "category": "Co-Parenting",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Parallel Parenting Boundary mean to me as a parent or carer?",
    "purpose": "Set one boundary that reduces conflict and protects the child from adult tension.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "co-parenting"
    ],
    "challengeSteps": [
      "Read the title out loud: Parallel Parenting Boundary.",
      "Answer the quick question before starting: What does parallel parenting boundary mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising parallel parenting boundary?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Parallel Parenting Boundary' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "co-parenting",
      "parallel-parenting-boundary",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-067",
    "title": "No Loyalty Conflict Check",
    "displayTitle": "No Loyalty Conflict Check",
    "category": "Co-Parenting",
    "challengeType": "weekly",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does No Loyalty Conflict Check mean to me as a parent or carer?",
    "purpose": "Review whether anything said or done could make the child feel forced to choose sides.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "co-parenting"
    ],
    "challengeSteps": [
      "Read the title out loud: No Loyalty Conflict Check.",
      "Answer the quick question before starting: What does no loyalty conflict check mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising no loyalty conflict check?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'No Loyalty Conflict Check' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "co-parenting",
      "no-loyalty-conflict-check",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-068",
    "title": "Changeover Calm Plan",
    "displayTitle": "Changeover Calm Plan",
    "category": "Co-Parenting",
    "challengeType": "weekly",
    "estimatedTime": "15–20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Changeover Calm Plan mean to me as a parent or carer?",
    "purpose": "Prepare a calmer changeover routine focused on the child’s safety and predictability.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "co-parenting"
    ],
    "challengeSteps": [
      "Read the title out loud: Changeover Calm Plan.",
      "Answer the quick question before starting: What does changeover calm plan mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising changeover calm plan?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Changeover Calm Plan' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "co-parenting",
      "changeover-calm-plan",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-069",
    "title": "Court Order Responsibility Check",
    "displayTitle": "Court Order Responsibility Check",
    "category": "Co-Parenting",
    "challengeType": "monthly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Court Order Responsibility Check mean to me as a parent or carer?",
    "purpose": "Review one parenting order or expectation and identify the practical behaviour needed.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "co-parenting"
    ],
    "challengeSteps": [
      "Read the title out loud: Court Order Responsibility Check.",
      "Answer the quick question before starting: What does court order responsibility check mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising court order responsibility check?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Court Order Responsibility Check' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "co-parenting",
      "court-order-responsibility-check",
      "monthly"
    ]
  },
  {
    "id": "SS-PC-070",
    "title": "Reduce Hostility Script",
    "displayTitle": "Reduce Hostility Script",
    "category": "Co-Parenting",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Reduce Hostility Script mean to me as a parent or carer?",
    "purpose": "Prepare a neutral response for conflict-triggering communication.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "co-parenting"
    ],
    "challengeSteps": [
      "Read the title out loud: Reduce Hostility Script.",
      "Answer the quick question before starting: What does reduce hostility script mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising reduce hostility script?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Reduce Hostility Script' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "co-parenting",
      "reduce-hostility-script",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-071",
    "title": "Adult Problem Ownership",
    "displayTitle": "Adult Problem Ownership",
    "category": "Co-Parenting",
    "challengeType": "weekly",
    "estimatedTime": "10–15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Adult Problem Ownership mean to me as a parent or carer?",
    "purpose": "Separate adult problems from child responsibilities.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "co-parenting"
    ],
    "challengeSteps": [
      "Read the title out loud: Adult Problem Ownership.",
      "Answer the quick question before starting: What does adult problem ownership mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising adult problem ownership?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Adult Problem Ownership' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "co-parenting",
      "adult-problem-ownership",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-072",
    "title": "Child Impact Reflection",
    "displayTitle": "Child Impact Reflection",
    "category": "Co-Parenting",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Child Impact Reflection mean to me as a parent or carer?",
    "purpose": "Reflect on how conflict may affect the child and choose one protective action.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "co-parenting"
    ],
    "challengeSteps": [
      "Read the title out loud: Child Impact Reflection.",
      "Answer the quick question before starting: What does child impact reflection mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising child impact reflection?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Child Impact Reflection' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "co-parenting",
      "child-impact-reflection",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-073",
    "title": "Healthy Lunchbox Plan",
    "displayTitle": "Healthy Lunchbox Plan",
    "category": "Practical Care",
    "challengeType": "weekly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Healthy Lunchbox Plan mean to me as a parent or carer?",
    "purpose": "Plan one realistic food option that supports the child’s health and family budget.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "practical care"
    ],
    "challengeSteps": [
      "Read the title out loud: Healthy Lunchbox Plan.",
      "Answer the quick question before starting: What does healthy lunchbox plan mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising healthy lunchbox plan?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Healthy Lunchbox Plan' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "practical-care",
      "healthy-lunchbox-plan",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-074",
    "title": "Grocery Budget Challenge",
    "displayTitle": "Grocery Budget Challenge",
    "category": "Practical Care",
    "challengeType": "weekly",
    "estimatedTime": "20–30 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Grocery Budget Challenge mean to me as a parent or carer?",
    "purpose": "Create a small grocery plan that balances cost, nutrition, and routine.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "practical care"
    ],
    "challengeSteps": [
      "Read the title out loud: Grocery Budget Challenge.",
      "Answer the quick question before starting: What does grocery budget challenge mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising grocery budget challenge?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Grocery Budget Challenge' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "practical-care",
      "grocery-budget-challenge",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-075",
    "title": "Dental Routine Check",
    "displayTitle": "Dental Routine Check",
    "category": "Practical Care",
    "challengeType": "weekly",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Dental Routine Check mean to me as a parent or carer?",
    "purpose": "Support a consistent brushing routine and check if dental care is needed.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "practical care"
    ],
    "challengeSteps": [
      "Read the title out loud: Dental Routine Check.",
      "Answer the quick question before starting: What does dental routine check mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising dental routine check?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Dental Routine Check' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "practical-care",
      "dental-routine-check",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-076",
    "title": "Hygiene Routine Builder",
    "displayTitle": "Hygiene Routine Builder",
    "category": "Practical Care",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Hygiene Routine Builder mean to me as a parent or carer?",
    "purpose": "Teach one hygiene step clearly and without shame.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "practical care"
    ],
    "challengeSteps": [
      "Read the title out loud: Hygiene Routine Builder.",
      "Answer the quick question before starting: What does hygiene routine builder mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising hygiene routine builder?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Hygiene Routine Builder' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "practical-care",
      "hygiene-routine-builder",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-077",
    "title": "Outdoor Movement Challenge",
    "displayTitle": "Outdoor Movement Challenge",
    "category": "Practical Care",
    "challengeType": "weekly",
    "estimatedTime": "20–30 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Outdoor Movement Challenge mean to me as a parent or carer?",
    "purpose": "Plan one safe movement activity that supports regulation and development.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "practical care"
    ],
    "challengeSteps": [
      "Read the title out loud: Outdoor Movement Challenge.",
      "Answer the quick question before starting: What does outdoor movement challenge mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising outdoor movement challenge?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Outdoor Movement Challenge' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "practical-care",
      "outdoor-movement-challenge",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-078",
    "title": "School Readiness Step",
    "displayTitle": "School Readiness Step",
    "category": "Practical Care",
    "challengeType": "weekly",
    "estimatedTime": "15–20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does School Readiness Step mean to me as a parent or carer?",
    "purpose": "Prepare one item, routine, or skill that supports school success.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "practical care"
    ],
    "challengeSteps": [
      "Read the title out loud: School Readiness Step.",
      "Answer the quick question before starting: What does school readiness step mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising school readiness step?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'School Readiness Step' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "practical-care",
      "school-readiness-step",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-079",
    "title": "Medical Concern Log",
    "displayTitle": "Medical Concern Log",
    "category": "Practical Care",
    "challengeType": "weekly",
    "estimatedTime": "10–15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Medical Concern Log mean to me as a parent or carer?",
    "purpose": "Track one health concern objectively so it can be discussed with a professional if needed.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "practical care"
    ],
    "challengeSteps": [
      "Read the title out loud: Medical Concern Log.",
      "Answer the quick question before starting: What does medical concern log mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising medical concern log?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Medical Concern Log' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "practical-care",
      "medical-concern-log",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-080",
    "title": "Junk Food Reset",
    "displayTitle": "Junk Food Reset",
    "category": "Practical Care",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Junk Food Reset mean to me as a parent or carer?",
    "purpose": "Choose one practical step to reduce takeaway, sugary drinks, or irregular eating.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "practical care"
    ],
    "challengeSteps": [
      "Read the title out loud: Junk Food Reset.",
      "Answer the quick question before starting: What does junk food reset mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising junk food reset?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Junk Food Reset' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "practical-care",
      "junk-food-reset",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-081",
    "title": "Teen Respectful Check-In",
    "displayTitle": "Teen Respectful Check-In",
    "category": "Teens & Adolescence",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Teen Respectful Check-In mean to me as a parent or carer?",
    "purpose": "Ask a teen one respectful question without lecturing or interrogating.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "teens & adolescence"
    ],
    "challengeSteps": [
      "Read the title out loud: Teen Respectful Check-In.",
      "Answer the quick question before starting: What does teen respectful check-in mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising teen respectful check-in?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Teen Respectful Check-In' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "teens-adolescence",
      "teen-respectful-check-in",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-082",
    "title": "Risk Conversation Starter",
    "displayTitle": "Risk Conversation Starter",
    "category": "Teens & Adolescence",
    "challengeType": "weekly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Risk Conversation Starter mean to me as a parent or carer?",
    "purpose": "Start a calm conversation about vaping, substances, online risk, or peer pressure.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "teens & adolescence"
    ],
    "challengeSteps": [
      "Read the title out loud: Risk Conversation Starter.",
      "Answer the quick question before starting: What does risk conversation starter mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising risk conversation starter?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Risk Conversation Starter' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "teens-adolescence",
      "risk-conversation-starter",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-083",
    "title": "Teen Independence Step",
    "displayTitle": "Teen Independence Step",
    "category": "Teens & Adolescence",
    "challengeType": "weekly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Teen Independence Step mean to me as a parent or carer?",
    "purpose": "Teach one life skill that supports safe independence.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "teens & adolescence"
    ],
    "challengeSteps": [
      "Read the title out loud: Teen Independence Step.",
      "Answer the quick question before starting: What does teen independence step mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising teen independence step?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Teen Independence Step' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "teens-adolescence",
      "teen-independence-step",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-084",
    "title": "Teen Brain Reframe",
    "displayTitle": "Teen Brain Reframe",
    "category": "Teens & Adolescence",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Teen Brain Reframe mean to me as a parent or carer?",
    "purpose": "Reframe one teen behaviour through development, stress, or unmet need.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "teens & adolescence"
    ],
    "challengeSteps": [
      "Read the title out loud: Teen Brain Reframe.",
      "Answer the quick question before starting: What does teen brain reframe mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising teen brain reframe?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Teen Brain Reframe' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "teens-adolescence",
      "teen-brain-reframe",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-085",
    "title": "Screen and Sleep Check",
    "displayTitle": "Screen and Sleep Check",
    "category": "Teens & Adolescence",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Screen and Sleep Check mean to me as a parent or carer?",
    "purpose": "Review how screens may affect sleep, mood, and routines.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "teens & adolescence"
    ],
    "challengeSteps": [
      "Read the title out loud: Screen and Sleep Check.",
      "Answer the quick question before starting: What does screen and sleep check mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising screen and sleep check?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Screen and Sleep Check' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "teens-adolescence",
      "screen-and-sleep-check",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-086",
    "title": "Body Image Safety Talk",
    "displayTitle": "Body Image Safety Talk",
    "category": "Teens & Adolescence",
    "challengeType": "weekly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Body Image Safety Talk mean to me as a parent or carer?",
    "purpose": "Open a respectful conversation about body image, social media, and self-worth.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "teens & adolescence"
    ],
    "challengeSteps": [
      "Read the title out loud: Body Image Safety Talk.",
      "Answer the quick question before starting: What does body image safety talk mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising body image safety talk?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Body Image Safety Talk' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "teens-adolescence",
      "body-image-safety-talk",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-087",
    "title": "Peer Pressure Plan",
    "displayTitle": "Peer Pressure Plan",
    "category": "Teens & Adolescence",
    "challengeType": "weekly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Peer Pressure Plan mean to me as a parent or carer?",
    "purpose": "Help a teen prepare words or actions for pressure situations.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "teens & adolescence"
    ],
    "challengeSteps": [
      "Read the title out loud: Peer Pressure Plan.",
      "Answer the quick question before starting: What does peer pressure plan mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising peer pressure plan?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Peer Pressure Plan' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "teens-adolescence",
      "peer-pressure-plan",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-088",
    "title": "Respectful Responsibility Agreement",
    "displayTitle": "Respectful Responsibility Agreement",
    "category": "Teens & Adolescence",
    "challengeType": "weekly",
    "estimatedTime": "20–30 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Respectful Responsibility Agreement mean to me as a parent or carer?",
    "purpose": "Create one fair responsibility agreement with input from the teen.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "teens & adolescence"
    ],
    "challengeSteps": [
      "Read the title out loud: Respectful Responsibility Agreement.",
      "Answer the quick question before starting: What does respectful responsibility agreement mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising respectful responsibility agreement?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Respectful Responsibility Agreement' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "teens-adolescence",
      "respectful-responsibility-agreement",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-089",
    "title": "Responsive Care Moment",
    "displayTitle": "Responsive Care Moment",
    "category": "Babies & Toddlers",
    "challengeType": "daily",
    "estimatedTime": "5–10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Responsive Care Moment mean to me as a parent or carer?",
    "purpose": "Notice and respond to a baby or toddler cue with warmth and consistency.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "babies & toddlers"
    ],
    "challengeSteps": [
      "Read the title out loud: Responsive Care Moment.",
      "Answer the quick question before starting: What does responsive care moment mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising responsive care moment?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Responsive Care Moment' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "babies-toddlers",
      "responsive-care-moment",
      "daily"
    ]
  },
  {
    "id": "SS-PC-090",
    "title": "Toddler Choice Practice",
    "displayTitle": "Toddler Choice Practice",
    "category": "Babies & Toddlers",
    "challengeType": "daily",
    "estimatedTime": "5 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Toddler Choice Practice mean to me as a parent or carer?",
    "purpose": "Offer simple choices to support cooperation and autonomy.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "babies & toddlers"
    ],
    "challengeSteps": [
      "Read the title out loud: Toddler Choice Practice.",
      "Answer the quick question before starting: What does toddler choice practice mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising toddler choice practice?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Toddler Choice Practice' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "babies-toddlers",
      "toddler-choice-practice",
      "daily"
    ]
  },
  {
    "id": "SS-PC-091",
    "title": "Safe Toddler Tantrum Response",
    "displayTitle": "Safe Toddler Tantrum Response",
    "category": "Babies & Toddlers",
    "challengeType": "daily",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Safe Toddler Tantrum Response mean to me as a parent or carer?",
    "purpose": "Respond to a tantrum with safety, calm presence, and fewer words.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "babies & toddlers"
    ],
    "challengeSteps": [
      "Read the title out loud: Safe Toddler Tantrum Response.",
      "Answer the quick question before starting: What does safe toddler tantrum response mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising safe toddler tantrum response?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Safe Toddler Tantrum Response' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "babies-toddlers",
      "safe-toddler-tantrum-response",
      "daily"
    ]
  },
  {
    "id": "SS-PC-092",
    "title": "Feeding Cue Check",
    "displayTitle": "Feeding Cue Check",
    "category": "Babies & Toddlers",
    "challengeType": "daily",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Feeding Cue Check mean to me as a parent or carer?",
    "purpose": "Notice hunger, fullness, comfort, and stress cues during feeding.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "babies & toddlers"
    ],
    "challengeSteps": [
      "Read the title out loud: Feeding Cue Check.",
      "Answer the quick question before starting: What does feeding cue check mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising feeding cue check?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Feeding Cue Check' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "babies-toddlers",
      "feeding-cue-check",
      "daily"
    ]
  },
  {
    "id": "SS-PC-093",
    "title": "Toilet Training Readiness Check",
    "displayTitle": "Toilet Training Readiness Check",
    "category": "Babies & Toddlers",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Toilet Training Readiness Check mean to me as a parent or carer?",
    "purpose": "Review readiness signs without pressure or shame.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "babies & toddlers"
    ],
    "challengeSteps": [
      "Read the title out loud: Toilet Training Readiness Check.",
      "Answer the quick question before starting: What does toilet training readiness check mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising toilet training readiness check?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Toilet Training Readiness Check' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "babies-toddlers",
      "toilet-training-readiness-check",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-094",
    "title": "Play and Language Moment",
    "displayTitle": "Play and Language Moment",
    "category": "Babies & Toddlers",
    "challengeType": "daily",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Play and Language Moment mean to me as a parent or carer?",
    "purpose": "Use play, naming, and turn-taking to support language development.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "babies & toddlers"
    ],
    "challengeSteps": [
      "Read the title out loud: Play and Language Moment.",
      "Answer the quick question before starting: What does play and language moment mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising play and language moment?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Play and Language Moment' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "babies-toddlers",
      "play-and-language-moment",
      "daily"
    ]
  },
  {
    "id": "SS-PC-095",
    "title": "Toddler Safety Sweep",
    "displayTitle": "Toddler Safety Sweep",
    "category": "Babies & Toddlers",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Toddler Safety Sweep mean to me as a parent or carer?",
    "purpose": "Check one area for toddler hazards and adjust the environment.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "babies & toddlers"
    ],
    "challengeSteps": [
      "Read the title out loud: Toddler Safety Sweep.",
      "Answer the quick question before starting: What does toddler safety sweep mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising toddler safety sweep?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Toddler Safety Sweep' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "babies-toddlers",
      "toddler-safety-sweep",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-096",
    "title": "Soothing Routine Practice",
    "displayTitle": "Soothing Routine Practice",
    "category": "Babies & Toddlers",
    "challengeType": "daily",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Soothing Routine Practice mean to me as a parent or carer?",
    "purpose": "Use predictable soothing to support attachment and regulation.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "babies & toddlers"
    ],
    "challengeSteps": [
      "Read the title out loud: Soothing Routine Practice.",
      "Answer the quick question before starting: What does soothing routine practice mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising soothing routine practice?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Soothing Routine Practice' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "babies-toddlers",
      "soothing-routine-practice",
      "daily"
    ]
  },
  {
    "id": "SS-PC-097",
    "title": "Evidence Snapshot",
    "displayTitle": "Evidence Snapshot",
    "category": "Progress Evidence",
    "challengeType": "weekly",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Evidence Snapshot mean to me as a parent or carer?",
    "purpose": "Record one practical example of safe parenting progress.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "progress evidence"
    ],
    "challengeSteps": [
      "Read the title out loud: Evidence Snapshot.",
      "Answer the quick question before starting: What does evidence snapshot mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising evidence snapshot?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Evidence Snapshot' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "progress-evidence",
      "evidence-snapshot",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-098",
    "title": "Parenting Progress Note",
    "displayTitle": "Parenting Progress Note",
    "category": "Progress Evidence",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Parenting Progress Note mean to me as a parent or carer?",
    "purpose": "Write a short factual note about what you practised, what changed, and what needs more work.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "progress evidence"
    ],
    "challengeSteps": [
      "Read the title out loud: Parenting Progress Note.",
      "Answer the quick question before starting: What does parenting progress note mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising parenting progress note?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Parenting Progress Note' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "progress-evidence",
      "parenting-progress-note",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-099",
    "title": "Before and After Reflection",
    "displayTitle": "Before and After Reflection",
    "category": "Progress Evidence",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Before and After Reflection mean to me as a parent or carer?",
    "purpose": "Compare a past reaction with a safer current response.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "progress evidence"
    ],
    "challengeSteps": [
      "Read the title out loud: Before and After Reflection.",
      "Answer the quick question before starting: What does before and after reflection mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising before and after reflection?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Before and After Reflection' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "progress-evidence",
      "before-and-after-reflection",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-100",
    "title": "Routine Proof Upload",
    "displayTitle": "Routine Proof Upload",
    "category": "Progress Evidence",
    "challengeType": "weekly",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Routine Proof Upload mean to me as a parent or carer?",
    "purpose": "Upload evidence of a routine, home system, appointment, or child-focused task.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "progress evidence"
    ],
    "challengeSteps": [
      "Read the title out loud: Routine Proof Upload.",
      "Answer the quick question before starting: What does routine proof upload mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising routine proof upload?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Routine Proof Upload' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "progress-evidence",
      "routine-proof-upload",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-101",
    "title": "Skill Practice Log",
    "displayTitle": "Skill Practice Log",
    "category": "Progress Evidence",
    "challengeType": "weekly",
    "estimatedTime": "10 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Skill Practice Log mean to me as a parent or carer?",
    "purpose": "Track one parenting skill across the week.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "progress evidence"
    ],
    "challengeSteps": [
      "Read the title out loud: Skill Practice Log.",
      "Answer the quick question before starting: What does skill practice log mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising skill practice log?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Skill Practice Log' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "progress-evidence",
      "skill-practice-log",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-102",
    "title": "Accountability Statement",
    "displayTitle": "Accountability Statement",
    "category": "Progress Evidence",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Accountability Statement mean to me as a parent or carer?",
    "purpose": "Write an ownership statement without blaming the child or other adults.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "progress evidence"
    ],
    "challengeSteps": [
      "Read the title out loud: Accountability Statement.",
      "Answer the quick question before starting: What does accountability statement mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising accountability statement?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Accountability Statement' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "progress-evidence",
      "accountability-statement",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-103",
    "title": "Safety Action Record",
    "displayTitle": "Safety Action Record",
    "category": "Progress Evidence",
    "challengeType": "weekly",
    "estimatedTime": "15 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Safety Action Record mean to me as a parent or carer?",
    "purpose": "Document one action taken to improve physical or emotional safety.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "progress evidence"
    ],
    "challengeSteps": [
      "Read the title out loud: Safety Action Record.",
      "Answer the quick question before starting: What does safety action record mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising safety action record?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Safety Action Record' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "progress-evidence",
      "safety-action-record",
      "weekly"
    ]
  },
  {
    "id": "SS-PC-104",
    "title": "Support System Check-In",
    "displayTitle": "Support System Check-In",
    "category": "Progress Evidence",
    "challengeType": "monthly",
    "estimatedTime": "20 minutes",
    "quickQuestionBeforeChallenge": "Before this challenge starts, what does Support System Check-In mean to me as a parent or carer?",
    "purpose": "Identify support people or services and record one constructive contact or plan.",
    "parentSkillFocus": [
      "safe parenting",
      "child-focused reflection",
      "consistent practice",
      "progress evidence"
    ],
    "challengeSteps": [
      "Read the title out loud: Support System Check-In.",
      "Answer the quick question before starting: What does support system check-in mean to me as a parent or carer?",
      "Choose one small real-life situation where this skill can be practised today.",
      "Practise the skill using a calm voice, safe body language, and child-focused wording.",
      "Afterwards, write down what happened, what worked, and what you will adjust next time."
    ],
    "reflectionQuestions": [
      "What did I notice about myself while practising support system check-in?",
      "How might this challenge have felt from my child’s point of view?",
      "What is one thing I can repeat consistently this week?"
    ],
    "evidenceTask": "Upload or write one short evidence note showing how you practised 'Support System Check-In' in daily life. Keep it factual, child-focused, and respectful.",
    "completionChecklist": [
      "I answered the quick question before starting.",
      "I practised the skill in a real or realistic parenting situation.",
      "I completed the reflection.",
      "I added an evidence note or upload."
    ],
    "safetyNote": "Do not use this challenge during immediate danger, violence, intoxication, or a high-conflict escalation. Prioritise safety, supervision, and professional support where needed.",
    "tags": [
      "progress-evidence",
      "support-system-check-in",
      "monthly"
    ]
  }
];

export function getParentChallengeById(challengeId: string) {
  return safestepsParentChallenges.find((challenge) => challenge.id === challengeId) ?? null;
}
