export type SafeStepsFoundationLesson = {
  id: number;
  title: string;
  slug: string;
  learningPurpose: string;
  learningOutcomes: string[];
  transcript: string;
  practiceActivity: string;
  quiz: {
    question: string;
    answer: string;
    explanation: string;
  };
  evidenceTask: string;
  durationMinutes: {
    minimum: number;
    recommended: number;
    extended: number;
  };
  beforeQuestion: string;
  afterQuestion: string;
  changeInUnderstandingQuestion: string;
  completionRecordQuestions: string[];
  completionStatement: string;
};

export const safestepsLessonCurriculum1To47: SafeStepsFoundationLesson[] = [
  {
    "id": 1,
    "title": "Active Listening",
    "learningPurpose": "This lesson teaches parents and carers how to listen to a child with attention, patience, respect, and emotional safety.",
    "learningOutcomes": [
      "Explain what active listening means.",
      "Reflect a child’s feelings without interrupting.",
      "Avoid dismissing, judging, or rushing to correct.",
      "Use listening to build safety, trust, and connection."
    ],
    "transcript": "Active listening means giving your child your full attention and showing them that their thoughts, feelings, and experiences matter. It is more than hearing words. It means noticing tone, body language, silence, tears, anger, fear, and confusion.\n\nChildren often communicate through behaviour before they can explain what they feel. A child who yells, cries, shuts down, refuses, or acts silly may be trying to say, “I am overwhelmed,” “I feel unsafe,” “I need help,” or “I do not know how to explain this.”\n\nActive listening does not mean agreeing with everything your child says. It means helping your child feel heard before you guide, correct, or set a boundary.\n\nA helpful response is: “I can see this is important to you. I am listening. Tell me what happened.”",
    "practiceActivity": "Practise saying three active listening statements: “It sounds like you felt hurt,” “You seem really frustrated,” and “I want to understand before I respond.”",
    "quiz": {
      "question": "Active listening means the child gets whatever they want.",
      "answer": "False",
      "explanation": "Active listening helps the child feel heard, but safe boundaries still remain."
    },
    "evidenceTask": "Upload a short reflection about one moment where you listened before correcting.",
    "slug": "active-listening",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Active Listening” mean to you right now?",
    "afterQuestion": "What does “Active Listening” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Active Listening”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 2,
    "title": "Adolescent Behaviour Management",
    "learningPurpose": "This lesson helps parents understand teenage behaviour and manage it with structure, respect, safety, and connection.",
    "learningOutcomes": [
      "Understand common adolescent behaviour patterns.",
      "Set limits with teenagers respectfully.",
      "Use fair, related consequences.",
      "Support responsibility, repair, and independence."
    ],
    "transcript": "Adolescence is a stage of identity, independence, emotional intensity, peer influence, risk-taking, and growing responsibility. Teenagers may argue, withdraw, challenge rules, test limits, or make choices adults disagree with. This does not mean they no longer need adults. It means they need adults who can stay steady.\n\nManaging adolescent behaviour is not about controlling every choice. It is about creating safety, respect, accountability, and guidance.\n\nA teenager needs to know what the rules are, why the rules exist, what happens if the rule is broken, how they can repair harm, and that they are still loved even when corrected.\n\nA helpful parent script is: “I respect that you are growing up and want more independence. My job is still to keep you safe and help you make responsible choices.”",
    "practiceActivity": "Choose one adolescent behaviour concern and write the behaviour, safety concern, family rule, fair consequence, and repair step.",
    "quiz": {
      "question": "A good adolescent consequence should be fair, related, and respectful.",
      "answer": "True",
      "explanation": "Consequences should teach responsibility rather than shame or control."
    },
    "evidenceTask": "Upload a teenage behaviour plan.",
    "slug": "adolescent-behaviour-management",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Adolescent Behaviour Management” mean to you right now?",
    "afterQuestion": "What does “Adolescent Behaviour Management” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Adolescent Behaviour Management”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 3,
    "title": "Age-Appropriate Behaviour",
    "learningPurpose": "This lesson teaches parents to understand behaviour in the context of a child’s age, development, emotional capacity, and skill level.",
    "learningOutcomes": [
      "Identify age-appropriate expectations.",
      "Recognise behaviour as a possible skill gap.",
      "Adjust discipline to the child’s developmental stage.",
      "Respond in ways the child can understand."
    ],
    "transcript": "Children are not small adults. Their brains, emotions, impulse control, communication skills, and problem-solving abilities develop over time.\n\nA toddler may grab because they do not yet understand sharing. A preschool child may scream because they do not have words for frustration. A school-aged child may lie because they fear shame or punishment. A teenager may argue because they are practising independence.\n\nAge-appropriate behaviour does not mean unsafe behaviour is allowed. It means the adult responds in a way that teaches the child according to their developmental stage.\n\nBefore reacting, ask: “What skill does my child need to learn?” This changes the focus from punishment to teaching.",
    "practiceActivity": "Choose one behaviour and answer: How old is my child? What skill might be missing? What can I teach instead of only punish?",
    "quiz": {
      "question": "A child’s age should affect how adults respond to behaviour.",
      "answer": "True",
      "explanation": "Children need guidance that matches their developmental capacity."
    },
    "evidenceTask": "Upload an age-appropriate behaviour reflection.",
    "slug": "age-appropriate-behaviour",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Age-Appropriate Behaviour” mean to you right now?",
    "afterQuestion": "What does “Age-Appropriate Behaviour” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Age-Appropriate Behaviour”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 4,
    "title": "Aggression and Hitting",
    "learningPurpose": "This lesson teaches parents how to respond to aggression safely without using aggression back.",
    "learningOutcomes": [
      "Stop unsafe behaviour calmly.",
      "Use clear safety statements.",
      "Identify triggers and warning signs.",
      "Teach safer replacement behaviours."
    ],
    "transcript": "Aggression includes hitting, kicking, biting, pushing, throwing, threatening, or damaging property. Aggression must be taken seriously because children and adults need to be physically and emotionally safe.\n\nThe goal is not to shame the child. The goal is to stop harm and teach safer behaviour.\n\nA calm safety statement is: “I will not let you hit. You are angry, and I will help you stay safe.”\n\nDuring aggression, use fewer words. Move others away. Remove unsafe objects. Keep your voice low. Do not hit, threaten, mock, or corner the child.\n\nAfter the child calms, teach replacement behaviour such as saying stop, asking for help, moving away, using words, taking space, squeezing a pillow, or telling an adult, “I am angry.”",
    "practiceActivity": "Write an aggression safety plan with trigger, warning signs, safety phrase, calm-down tool, and repair step.",
    "quiz": {
      "question": "Hitting a child teaches them not to hit.",
      "answer": "False",
      "explanation": "Children learn safer behaviour through calm limits, modelling, and repair."
    },
    "evidenceTask": "Upload an aggression support plan.",
    "slug": "aggression-and-hitting",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Aggression and Hitting” mean to you right now?",
    "afterQuestion": "What does “Aggression and Hitting” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Aggression and Hitting”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 5,
    "title": "Anger in Children",
    "learningPurpose": "This lesson helps parents understand anger as a normal feeling that needs safe guidance.",
    "learningOutcomes": [
      "Separate feelings from behaviour.",
      "Validate anger while setting limits.",
      "Teach safe anger expression.",
      "Support calming and repair."
    ],
    "transcript": "Anger is not bad. Anger is a signal that something feels unfair, scary, frustrating, embarrassing, or overwhelming. Children need to know that anger is allowed, but unsafe behaviour is not.\n\nA child can feel angry and still be expected not to hurt people, animals, themselves, or property.\n\nA helpful parent script is: “You are allowed to be angry. I will not let you hurt anyone. Let’s get safe first.”\n\nUnder anger, children may be feeling hurt, rejected, afraid, jealous, ashamed, tired, hungry, or powerless.\n\nWhen adults punish the feeling, children learn to hide emotions. When adults guide the behaviour, children learn regulation.",
    "practiceActivity": "Create an anger thermometer from calm to unsafe and write what helps at each level.",
    "quiz": {
      "question": "Anger is a feeling, not a behaviour.",
      "answer": "True",
      "explanation": "The feeling is allowed; unsafe actions still need boundaries."
    },
    "evidenceTask": "Upload your child’s anger support plan.",
    "slug": "anger-in-children",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Anger in Children” mean to you right now?",
    "afterQuestion": "What does “Anger in Children” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Anger in Children”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 6,
    "title": "Anxiety in Children",
    "learningPurpose": "This lesson teaches parents how anxiety may show up in children and how to respond with validation and gentle confidence-building.",
    "learningOutcomes": [
      "Recognise anxiety signs in children.",
      "Respond without dismissing or over-rescuing.",
      "Use small brave steps.",
      "Know when extra support may be needed."
    ],
    "transcript": "Children may not say, “I am anxious.” Anxiety can look like stomach aches, headaches, crying, clinginess, anger, avoidance, sleep problems, perfectionism, school refusal, or repeated reassurance-seeking.\n\nAnxiety feels real to the child. Saying “don’t be silly” or “there’s nothing to worry about” can make the child feel alone. But removing every challenge can accidentally teach the child that they cannot cope.\n\nA helpful response is: “I believe this feels hard. I also believe you can take one small brave step.”\n\nSupport means validating the feeling while helping the child build confidence slowly.",
    "practiceActivity": "Create a worry ladder with five gradual brave steps from easiest to hardest.",
    "quiz": {
      "question": "Anxiety can look like anger or avoidance.",
      "answer": "True",
      "explanation": "Children often show anxiety through behaviour before they can explain it."
    },
    "evidenceTask": "Upload a worry ladder or anxiety support plan.",
    "slug": "anxiety-in-children",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Anxiety in Children” mean to you right now?",
    "afterQuestion": "What does “Anxiety in Children” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Anxiety in Children”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 7,
    "title": "Assertive Discipline",
    "learningPurpose": "This lesson teaches parents how to be firm without being frightening and kind without being permissive.",
    "learningOutcomes": [
      "Explain assertive discipline.",
      "Use calm, clear instructions.",
      "Offer limited choices where appropriate.",
      "Follow through respectfully."
    ],
    "transcript": "Assertive discipline means calm adult leadership. It is not yelling, threatening, shaming, begging, giving in, or frightening the child.\n\nAggressive discipline says, “Obey because I can scare you.” Passive discipline says, “I will give in because conflict is too hard.” Assertive discipline says, “I am calm, clear, and consistent.”\n\nChildren feel safer when adults are predictable.\n\nA helpful structure is to get close, use the child’s name, give a clear instruction, give a reason, offer a limited choice, and follow through calmly.\n\nExample: “It is time to turn the tablet off. Screens finish at 6 pm. You can turn it off, or I can help.”",
    "practiceActivity": "Write one assertive discipline script for a behaviour you deal with often.",
    "quiz": {
      "question": "Assertive discipline means calm, clear, respectful leadership.",
      "answer": "True",
      "explanation": "Assertive discipline is firm without being frightening."
    },
    "evidenceTask": "Upload a clear instruction and consequence plan.",
    "slug": "assertive-discipline",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Assertive Discipline” mean to you right now?",
    "afterQuestion": "What does “Assertive Discipline” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Assertive Discipline”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 8,
    "title": "Avoiding Communication Blocks",
    "learningPurpose": "This lesson helps parents recognise words and reactions that shut children down.",
    "learningOutcomes": [
      "Identify communication blocks.",
      "Replace blocks with connection statements.",
      "Use open listening responses.",
      "Repair after harsh communication."
    ],
    "transcript": "Communication blocks are responses that stop children from sharing honestly. They include interrupting, blaming, lecturing, sarcasm, name-calling, minimising, comparing, threatening, or dismissing feelings.\n\nA child who feels judged may hide the truth. A child who feels heard is more likely to keep talking.\n\nInstead of “You’re overreacting,” say, “This feels big to you.”\n\nInstead of “What did you do now?” say, “Start from the beginning. I’m listening.”\n\nInstead of “You always ruin things,” say, “That choice caused a problem. Let’s work out the repair.”\n\nParents do not need to be perfect. Repair matters. Repair sounds like: “I interrupted you before. I am sorry. I want to listen properly now.”",
    "practiceActivity": "Write three communication blocks you want to stop using and three replacement statements.",
    "quiz": {
      "question": "Repairing communication can rebuild trust.",
      "answer": "True",
      "explanation": "Repair shows accountability and restores emotional safety."
    },
    "evidenceTask": "Upload a communication repair reflection.",
    "slug": "avoiding-communication-blocks",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Avoiding Communication Blocks” mean to you right now?",
    "afterQuestion": "What does “Avoiding Communication Blocks” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Avoiding Communication Blocks”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 9,
    "title": "Avoiding Frightening Behaviours",
    "learningPurpose": "This lesson teaches parents how adult behaviour can feel frightening to children and how to correct safely.",
    "learningOutcomes": [
      "Identify frightening adult behaviours.",
      "Use safe body language and voice.",
      "Pause before escalation.",
      "Repair after frightening behaviour."
    ],
    "transcript": "Children need adults to be safe. A parent can be firm without being frightening.\n\nFrightening behaviours may include yelling, threats, standing over a child, blocking exits, slamming doors, throwing things, name-calling, unpredictable rage, physical punishment, or threatening abandonment.\n\nChildren may comply when afraid, but fear does not teach trust, emotional regulation, or healthy problem-solving.\n\nSafe adult behaviour includes lowering your voice, giving physical space, relaxing your hands, moving slowly, taking a pause, sitting or kneeling with younger children, and returning to repair.\n\nA repair script is: “I used a loud voice. That may have scared you. That was my responsibility. The rule still matters, but I need to speak safely.”",
    "practiceActivity": "Create a parent regulation plan.",
    "quiz": {
      "question": "A parent can be firm without being frightening.",
      "answer": "True",
      "explanation": "Safe authority teaches better than intimidation."
    },
    "evidenceTask": "Upload your parent regulation and repair plan.",
    "slug": "avoiding-frightening-behaviours",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Avoiding Frightening Behaviours” mean to you right now?",
    "afterQuestion": "What does “Avoiding Frightening Behaviours” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Avoiding Frightening Behaviours”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 10,
    "title": "Avoiding Loyalty Conflicts",
    "learningPurpose": "This lesson teaches parents how to protect children from being placed in the middle of adult conflict.",
    "learningOutcomes": [
      "Explain loyalty conflict.",
      "Avoid using children as messengers.",
      "Use child-safe language.",
      "Protect the child’s right to love more than one adult."
    ],
    "transcript": "A loyalty conflict happens when a child feels pressured to choose between people they love or depend on. This can happen between separated parents, carers, relatives, foster carers, step-parents, or professionals.\n\nChildren should not carry adult conflict. They should not be asked to spy, report, take sides, deliver messages, comfort adults, or reject one person to prove love for another.\n\nChild-safe language includes: “You do not have to choose sides,” “Adult problems are for adults to sort out,” “You are allowed to love more than one person,” “It is okay to enjoy your time there,” and “You can talk about your feelings safely.”\n\nAvoid saying: “If you loved me, you would not want to go,” “Tell me everything they said,” or “They are trying to take you away from me.”",
    "practiceActivity": "Write three child-safe phrases to use during adult conflict.",
    "quiz": {
      "question": "Children should not be used as messengers between adults.",
      "answer": "True",
      "explanation": "Adult communication should stay with adults."
    },
    "evidenceTask": "Upload a child-safe communication plan.",
    "slug": "avoiding-loyalty-conflicts",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Avoiding Loyalty Conflicts” mean to you right now?",
    "afterQuestion": "What does “Avoiding Loyalty Conflicts” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Avoiding Loyalty Conflicts”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 11,
    "title": "Avoiding Shame-Based Discipline",
    "learningPurpose": "This lesson teaches parents to correct behaviour without attacking the child’s identity or self-worth.",
    "learningOutcomes": [
      "Explain shame-based discipline.",
      "Use behaviour-focused correction.",
      "Support repair without humiliation.",
      "Reconnect after discipline."
    ],
    "transcript": "Shame-based discipline attacks who the child is. It says, “You are bad,” “You are disgusting,” “You ruin everything,” or “I am embarrassed to be your parent.”\n\nHealthy discipline focuses on behaviour, impact, responsibility, repair, and reconnection.\n\nGuilt says, “I made a mistake.” Shame says, “I am the mistake.”\n\nChildren can learn responsibility without being made to feel worthless.\n\nInstead of “You are bad,” say, “That behaviour was not okay.” Instead of “You ruin everything,” say, “That choice caused a problem. Let’s repair it.”\n\nA reconnection statement is: “I love you. The behaviour needs to change, and I will help you learn.”",
    "practiceActivity": "Rewrite one shame-based statement into a dignity-based correction.",
    "quiz": {
      "question": "Discipline should teach without humiliating.",
      "answer": "True",
      "explanation": "Children can learn accountability while keeping dignity."
    },
    "evidenceTask": "Upload a shame-free discipline rewrite.",
    "slug": "avoiding-shame-based-discipline",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Avoiding Shame-Based Discipline” mean to you right now?",
    "afterQuestion": "What does “Avoiding Shame-Based Discipline” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Avoiding Shame-Based Discipline”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 12,
    "title": "Bedtime Routines",
    "learningPurpose": "This lesson teaches parents how bedtime routines support sleep, safety, regulation, and connection.",
    "learningOutcomes": [
      "Create a predictable bedtime routine.",
      "Reduce bedtime conflict.",
      "Use bedtime as connection time.",
      "Support age-appropriate sleep habits."
    ],
    "transcript": "A bedtime routine is a repeated set of calming steps before sleep. Children feel safer when they know what is coming next. Bedtime routines help the body and brain prepare for rest.\n\nA strong routine is calm, predictable, realistic, and repeated most nights.\n\nA simple routine may include dinner, bath or wash, pyjamas, brushing teeth, quiet play, story, cuddle, goodnight phrase, and lights out.\n\nBedtime is not only about sleep. It is also a chance for connection. Children often become more emotional at night because they are tired and separation from the parent can feel harder.\n\nA helpful phrase is: “It is bedtime. You are safe. I will check on you soon.”",
    "practiceActivity": "Design a 20–40 minute bedtime routine for your child’s age.",
    "quiz": {
      "question": "Predictable bedtime routines can help children feel settled.",
      "answer": "True",
      "explanation": "Predictability supports regulation and sleep readiness."
    },
    "evidenceTask": "Upload a bedtime routine plan.",
    "slug": "bedtime-routines",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Bedtime Routines” mean to you right now?",
    "afterQuestion": "What does “Bedtime Routines” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Bedtime Routines”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 13,
    "title": "Behaviour as Communication",
    "learningPurpose": "This lesson teaches parents to look beneath behaviour and ask what the child may be communicating.",
    "learningOutcomes": [
      "Recognise behaviour as a message.",
      "Identify feelings, needs, and triggers.",
      "Respond to the need while keeping boundaries.",
      "Teach replacement skills."
    ],
    "transcript": "Behaviour is often a message. Children may not have the words, maturity, confidence, or safety to explain what they feel. Instead, they may cry, yell, refuse, hide, cling, hit, lie, run away, or shut down.\n\nThe behaviour still matters. Unsafe behaviour still needs limits. But adults respond more effectively when they ask what the behaviour is communicating.\n\nBehaviour may communicate: “I am tired,” “I am scared,” “I need attention,” “This is too hard,” “I feel rejected,” “I am overwhelmed,” “I do not know what to do,” or “I need help calming down.”\n\nA helpful parent question is: “What is my child trying to tell me through this behaviour?”",
    "practiceActivity": "Choose one behaviour and identify feeling, need, trigger, skill gap, and support response.",
    "quiz": {
      "question": "Understanding behaviour means ignoring boundaries.",
      "answer": "False",
      "explanation": "Understanding and boundaries work together."
    },
    "evidenceTask": "Upload a behaviour-as-communication reflection.",
    "slug": "behaviour-as-communication",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Behaviour as Communication” mean to you right now?",
    "afterQuestion": "What does “Behaviour as Communication” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Behaviour as Communication”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 14,
    "title": "Behaviour Description",
    "learningPurpose": "This lesson teaches parents how to describe behaviour clearly instead of labelling the child.",
    "learningOutcomes": [
      "Use clear behaviour descriptions.",
      "Avoid identity labels.",
      "Describe positive behaviour specifically.",
      "Help children understand what to repeat or change."
    ],
    "transcript": "Behaviour description means saying what the child is doing without judgement. It helps children understand which behaviours are helpful, safe, responsible, or kind.\n\nInstead of saying, “You are good,” say, “You packed away your toys when I asked.”\n\nInstead of saying, “You are naughty,” say, “You threw the block. Blocks are not for throwing.”\n\nClear behaviour description helps children know exactly what adults are responding to. It reduces shame and increases learning.\n\nPositive behaviour description can strengthen good behaviour: “You waited your turn,” “You used gentle hands,” “You told me with words,” “You kept trying even though it was hard,” and “You came back to repair.”",
    "practiceActivity": "Write five behaviour descriptions you can use this week.",
    "quiz": {
      "question": "“You are bad” is a useful behaviour description.",
      "answer": "False",
      "explanation": "It labels the child instead of describing the behaviour."
    },
    "evidenceTask": "Upload a list of five behaviour descriptions used at home.",
    "slug": "behaviour-description",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Behaviour Description” mean to you right now?",
    "afterQuestion": "What does “Behaviour Description” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Behaviour Description”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 15,
    "title": "Behaviour Guidance",
    "learningPurpose": "This lesson teaches parents to guide behaviour through teaching, modelling, practice, and repair.",
    "learningOutcomes": [
      "Understand guidance as teaching.",
      "Identify replacement skills.",
      "Use modelling and practice.",
      "Support repair after mistakes."
    ],
    "transcript": "Behaviour guidance means helping a child learn what to do, how to do it, and why it matters. Children are still developing self-control, empathy, communication, and problem-solving.\n\nGuidance includes clear expectations, calm reminders, modelling, practice, praise, redirection, limits, consequences, and repair.\n\nGuidance asks: “What does my child need to learn next?”\n\nFor example, if a child snatches toys, the teaching goal may be turn-taking. If a child screams, the teaching goal may be using words. If a teenager breaks curfew, the teaching goal may be responsibility and trust repair.\n\nA helpful parent script is: “That choice was not okay. Let’s practise what to do next time.”",
    "practiceActivity": "Choose one behaviour and write the skill you want to teach.",
    "quiz": {
      "question": "Behaviour guidance focuses on teaching replacement skills.",
      "answer": "True",
      "explanation": "The goal is learning, not punishment alone."
    },
    "evidenceTask": "Upload a behaviour guidance plan.",
    "slug": "behaviour-guidance",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Behaviour Guidance” mean to you right now?",
    "afterQuestion": "What does “Behaviour Guidance” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Behaviour Guidance”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 16,
    "title": "Behaviour Management",
    "learningPurpose": "This lesson teaches parents how to manage behaviour through structure, connection, routines, limits, and follow-through.",
    "learningOutcomes": [
      "Create clear family rules.",
      "Prevent behaviour problems through routine and connection.",
      "Use fair consequences.",
      "Support emotional coaching and repair."
    ],
    "transcript": "Behaviour management is not about controlling children through fear. It is about creating a home environment where expectations are clear, needs are noticed, and consequences are predictable.\n\nEffective behaviour management includes connection before correction, clear family rules, age-appropriate expectations, predictable routines, positive attention, calm instructions, fair consequences, emotional coaching, and repair after harm.\n\nMany behaviour problems increase when children are tired, hungry, overstimulated, bored, anxious, disconnected, or confused about expectations.\n\nBefore responding, ask: Is my child safe? What happened before this? What need or feeling is underneath? What limit is needed? What skill should be taught?",
    "practiceActivity": "Create a behaviour management map for one repeated issue.",
    "quiz": {
      "question": "Behaviour management should include connection and structure.",
      "answer": "True",
      "explanation": "Children need both warmth and clear expectations."
    },
    "evidenceTask": "Upload a behaviour management plan.",
    "slug": "behaviour-management",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Behaviour Management” mean to you right now?",
    "afterQuestion": "What does “Behaviour Management” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Behaviour Management”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 17,
    "title": "Behaviour Reward Systems",
    "learningPurpose": "This lesson teaches parents how to use rewards carefully to encourage skill-building without replacing connection.",
    "learningOutcomes": [
      "Create realistic reward systems.",
      "Focus rewards on specific behaviours.",
      "Use praise with rewards.",
      "Avoid using rewards to shame or control basic needs."
    ],
    "transcript": "Reward systems can help children practise new behaviours when they are clear, fair, short-term, and focused on effort or skill-building.\n\nRewards should not be used to buy love, control emotions, or shame failure. They work best when combined with praise, connection, routines, and teaching.\n\nA good reward system should focus on one or two behaviours, be specific, be achievable, use small rewards, include labelled praise, be reviewed regularly, and avoid removing basic needs or affection.\n\nExample: Goal: Brush teeth before bed. Praise: “You brushed your teeth when I asked.” Reward: sticker toward choosing Friday family movie.\n\nRewards should support learning, not replace relationship.",
    "practiceActivity": "Create a simple reward chart with one target behaviour.",
    "quiz": {
      "question": "Reward systems should focus on clear, specific behaviours.",
      "answer": "True",
      "explanation": "Specific behaviours are easier for children to understand and practise."
    },
    "evidenceTask": "Upload a behaviour reward plan.",
    "slug": "behaviour-reward-systems",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Behaviour Reward Systems” mean to you right now?",
    "afterQuestion": "What does “Behaviour Reward Systems” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Behaviour Reward Systems”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 18,
    "title": "Being With Your Child",
    "learningPurpose": "This lesson teaches parents the importance of emotional presence, not just physical presence.",
    "learningOutcomes": [
      "Explain emotional presence.",
      "Create short connection moments.",
      "Use focused attention.",
      "Build trust through availability."
    ],
    "transcript": "Being with your child means more than being in the same room. It means your child experiences you as available, interested, safe, and responsive.\n\nChildren need moments where adults slow down and enter their world. This can happen through play, conversation, cooking, walking, reading, sitting nearby, or listening without rushing.\n\nBeing with your child builds trust. It communicates: “You matter. I enjoy you. I am here.”\n\nEven short moments can be powerful when they are focused and consistent.\n\nExamples include ten minutes of child-led play, reading together, asking about their day, sitting beside them while they calm, watching what they are proud of, and listening without a phone in your hand.",
    "practiceActivity": "Plan one 10-minute “being with” moment each day this week.",
    "quiz": {
      "question": "Children need emotional presence, not only supervision.",
      "answer": "True",
      "explanation": "Connection helps children feel valued and secure."
    },
    "evidenceTask": "Upload a reflection about one connection moment.",
    "slug": "being-with-your-child",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Being With Your Child” mean to you right now?",
    "afterQuestion": "What does “Being With Your Child” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Being With Your Child”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 19,
    "title": "Body Image and Self-Esteem",
    "learningPurpose": "This lesson helps parents support children to value their bodies and identity beyond appearance.",
    "learningOutcomes": [
      "Explain body image and self-esteem.",
      "Use body-respectful language.",
      "Avoid appearance-based criticism.",
      "Support whole-child identity."
    ],
    "transcript": "Body image is how a child thinks and feels about their body. Self-esteem is how a child values themselves as a person.\n\nChildren learn from comments at home, school, online, in media, and from peers. They also learn from how adults speak about their own bodies.\n\nSupportive parenting focuses on the whole child: kindness, strengths, effort, skills, character, health, feelings, culture, identity, and belonging.\n\nAvoid teasing, comparing, criticising weight, or labelling bodies as good or bad.\n\nHelpful language includes: “Your body helps you move, play, rest, and grow,” “You are more than how you look,” “All bodies deserve respect,” and “Health is not about looking perfect.”",
    "practiceActivity": "Write five non-appearance compliments for your child.",
    "quiz": {
      "question": "Children’s self-esteem should be based only on appearance.",
      "answer": "False",
      "explanation": "Children need to value their whole self, not only appearance."
    },
    "evidenceTask": "Upload a body-positive language plan.",
    "slug": "body-image-and-self-esteem",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Body Image and Self-Esteem” mean to you right now?",
    "afterQuestion": "What does “Body Image and Self-Esteem” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Body Image and Self-Esteem”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 20,
    "title": "Body Image and Social Media",
    "learningPurpose": "This lesson teaches parents how online images, filters, advertising, and comparison can affect children’s body image.",
    "learningOutcomes": [
      "Talk about edited and filtered images.",
      "Identify harmful comparison patterns.",
      "Support healthy online habits.",
      "Encourage critical thinking about media."
    ],
    "transcript": "Social media can expose children and teenagers to edited, staged, filtered, and unrealistic images. These images can make young people feel they are not attractive enough, thin enough, muscly enough, fashionable enough, or popular enough.\n\nParents can help by starting calm conversations, not lectures.\n\nHelpful questions include: “Do you think this image is edited?” “How do you feel after looking at this account?” “Does this content make you feel better or worse about yourself?” “Who profits when young people feel insecure?” and “What accounts make you feel strong, calm, creative, or accepted?”\n\nParents should also model healthy media use and avoid constant appearance-based comments.",
    "practiceActivity": "Review one social media feed together and identify unrealistic or edited content.",
    "quiz": {
      "question": "Filtered images can affect how young people see themselves.",
      "answer": "True",
      "explanation": "Edited online content can create unrealistic comparison."
    },
    "evidenceTask": "Upload a family social media body image conversation plan.",
    "slug": "body-image-and-social-media",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Body Image and Social Media” mean to you right now?",
    "afterQuestion": "What does “Body Image and Social Media” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Body Image and Social Media”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 21,
    "title": "Brain Development and Nutrition",
    "learningPurpose": "This lesson teaches parents how food, feeding routines, and nutrition support child development.",
    "learningOutcomes": [
      "Understand how nutrition supports development.",
      "Recognise hunger and dehydration as behaviour factors.",
      "Create realistic feeding routines.",
      "Avoid shame around food or bodies."
    ],
    "transcript": "Children’s brains and bodies need nutrition to grow, learn, regulate emotions, sleep, concentrate, and play. Hunger, dehydration, irregular meals, or poor sleep can affect behaviour.\n\nNutrition is not about perfection. Many families face financial stress, food access issues, allergies, sensory needs, culture, trauma, or health concerns. The goal is safe, consistent, realistic feeding.\n\nSupportive practices include regular meals and snacks, water access, age-appropriate foods, calm mealtimes, avoiding shame about food or body size, seeking health advice when needed, and not using food as the main reward or punishment.\n\nA helpful question is: “Could hunger, tiredness, or thirst be affecting this behaviour?”",
    "practiceActivity": "Create a simple daily food and hydration routine.",
    "quiz": {
      "question": "Hunger and tiredness can affect behaviour.",
      "answer": "True",
      "explanation": "Physical needs can affect concentration and regulation."
    },
    "evidenceTask": "Upload a realistic meal and snack routine.",
    "slug": "brain-development-and-nutrition",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Brain Development and Nutrition” mean to you right now?",
    "afterQuestion": "What does “Brain Development and Nutrition” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Brain Development and Nutrition”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 22,
    "title": "Brain Development",
    "learningPurpose": "This lesson teaches parents how relationships, safety, play, language, routine, and stress affect the developing brain.",
    "learningOutcomes": [
      "Understand brain development through daily experience.",
      "Use responsive interactions.",
      "Support language, play, and safety.",
      "Recognise the impact of stress and repair."
    ],
    "transcript": "A child’s brain develops through everyday experiences. Talking, playing, comforting, feeding, reading, listening, routines, and safe touch all help build pathways for learning, trust, language, and emotional regulation.\n\nChildren need repeated experiences of safety. They learn through serve-and-return interactions: the child makes a sound, gesture, expression, or request, and the adult responds.\n\nExamples include a baby babbling and the adult answering, a child pointing and the adult naming the object, a child crying and the adult comforting, a child asking a question and the adult responding, or a child playing and the adult joining.\n\nStress does not automatically harm development when a child has safe, responsive adults. But ongoing fear, chaos, neglect, or frightening caregiving can place pressure on development.",
    "practiceActivity": "Plan three serve-and-return moments with your child.",
    "quiz": {
      "question": "Responsive relationships support brain development.",
      "answer": "True",
      "explanation": "Repeated safe interactions build learning and regulation pathways."
    },
    "evidenceTask": "Upload a reflection on one responsive interaction.",
    "slug": "brain-development",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Brain Development” mean to you right now?",
    "afterQuestion": "What does “Brain Development” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Brain Development”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 23,
    "title": "Breaking Generational Cycles",
    "learningPurpose": "This lesson helps parents reflect on patterns passed through families and choose safer, healthier responses.",
    "learningOutcomes": [
      "Identify family patterns.",
      "Choose what to keep and what to change.",
      "Practise new responses.",
      "Use repair and accountability."
    ],
    "transcript": "Generational cycles are patterns that repeat across families. These may include yelling, violence, emotional shutdown, addiction, shame, neglect, fear-based discipline, silence, or unhealthy relationship patterns.\n\nBreaking a cycle does not mean blaming previous generations. It means becoming aware of what was passed down and choosing what should continue and what should stop.\n\nA parent may say: “This happened to me, but I do not want to pass it on.”\n\nBreaking cycles requires awareness, honesty, support, new skills, repair, consistency, self-compassion, and accountability.\n\nChange is shown through repeated safer choices, not perfect behaviour.",
    "practiceActivity": "Complete: one pattern I want to keep, one pattern I want to stop, and one new response I will practise.",
    "quiz": {
      "question": "Breaking cycles requires awareness and repeated new choices.",
      "answer": "True",
      "explanation": "Long-term change is built through repeated safer actions."
    },
    "evidenceTask": "Upload a generational cycle reflection.",
    "slug": "breaking-generational-cycles",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Breaking Generational Cycles” mean to you right now?",
    "afterQuestion": "What does “Breaking Generational Cycles” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Breaking Generational Cycles”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 24,
    "title": "Breastfeeding Basics",
    "learningPurpose": "This lesson provides basic education about breastfeeding, responsive feeding, support, and safe decision-making.",
    "learningOutcomes": [
      "Understand basic breastfeeding concepts.",
      "Recognise feeding cues.",
      "Identify support options.",
      "Use non-shaming feeding principles."
    ],
    "transcript": "Breastfeeding can support infant nutrition, bonding, immunity, and comfort. Some parents breastfeed fully, some partly, some express milk, and some use formula. Safe feeding is the priority.\n\nParents should receive respectful support without shame. Feeding choices can be affected by health, medication, trauma, supply, pain, work, mental health, baby’s needs, and professional advice.\n\nBasic breastfeeding support includes learning early hunger cues, feeding responsively, checking latch comfort, seeking help for pain, watching wet nappies and growth, and asking a midwife, lactation consultant, GP, or child health nurse for support.\n\nThis lesson is not a replacement for medical advice.",
    "practiceActivity": "Write down where you would get feeding support if needed.",
    "quiz": {
      "question": "Feeding support should be respectful and non-shaming.",
      "answer": "True",
      "explanation": "Safe feeding and support matter more than shame."
    },
    "evidenceTask": "Upload an infant feeding support plan or reflection.",
    "slug": "breastfeeding-basics",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Breastfeeding Basics” mean to you right now?",
    "afterQuestion": "What does “Breastfeeding Basics” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Breastfeeding Basics”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 25,
    "title": "Bullying and Social Health",
    "learningPurpose": "This lesson teaches parents how bullying affects children and how to respond safely.",
    "learningOutcomes": [
      "Recognise bullying signs.",
      "Support a child being bullied.",
      "Respond if a child is bullying others.",
      "Work with schools or services."
    ],
    "transcript": "Bullying is repeated behaviour intended to hurt, frighten, embarrass, exclude, or control another person. It can happen face-to-face or online.\n\nChildren being bullied may seem anxious, angry, withdrawn, sad, avoid school, lose belongings, have sleep problems, complain of stomach aches, or lose confidence.\n\nParents should not tell children to simply sort bullying out alone. Children need adults to listen, document concerns, contact school or relevant adults, and create a safety plan.\n\nIf your child is bullying others, respond with accountability and support. Ask what need, peer pressure, insecurity, or skill gap may be underneath, while making it clear that harm must stop.",
    "practiceActivity": "Create a bullying response plan: listen, document, contact school/service, safety plan, emotional support, and follow-up.",
    "quiz": {
      "question": "Bullying is never okay.",
      "answer": "True",
      "explanation": "Bullying causes harm and needs adult response."
    },
    "evidenceTask": "Upload a bullying support or prevention plan.",
    "slug": "bullying-and-social-health",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Bullying and Social Health” mean to you right now?",
    "afterQuestion": "What does “Bullying and Social Health” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Bullying and Social Health”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 26,
    "title": "Calm Follow-Through",
    "learningPurpose": "This lesson teaches parents how to follow through on boundaries without yelling, threatening, or giving in repeatedly.",
    "learningOutcomes": [
      "Use calm repetition.",
      "Keep boundaries predictable.",
      "Use related consequences.",
      "Avoid escalation during follow-through."
    ],
    "transcript": "Calm follow-through means doing what you said you would do while staying regulated. Children learn from consistency. If adults set rules but do not follow through, children become confused and may test limits more.\n\nCalm follow-through sounds like: “I hear that you are upset. The rule is still the same.” “You can be angry. The tablet is still finished.” “I will not argue. I will help you follow the routine.”\n\nFollow-through should be fair, realistic, and related to the behaviour. It should not be extreme, frightening, or humiliating.\n\nThe adult’s calmness is part of the teaching.",
    "practiceActivity": "Write one rule, one warning, and one follow-through step.",
    "quiz": {
      "question": "Calm follow-through means staying consistent without becoming frightening.",
      "answer": "True",
      "explanation": "Follow-through works best when predictable and safe."
    },
    "evidenceTask": "Upload a calm follow-through plan.",
    "slug": "calm-follow-through",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Calm Follow-Through” mean to you right now?",
    "afterQuestion": "What does “Calm Follow-Through” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Calm Follow-Through”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 27,
    "title": "Calming the Nervous System",
    "learningPurpose": "This lesson teaches parents how stress affects the body and how adults can help children calm.",
    "learningOutcomes": [
      "Understand fight, flight, freeze, and shutdown.",
      "Use calming tools.",
      "Regulate before teaching.",
      "Create a calming environment."
    ],
    "transcript": "When children feel unsafe, overwhelmed, ashamed, scared, or out of control, their nervous system may react. They may fight, run away, freeze, cry, hide, laugh nervously, become silly, refuse, or shut down.\n\nA child cannot always think clearly when highly escalated. The adult’s first job is to create safety and calm.\n\nCalming tools include lowering your voice, slowing your movements, giving space, naming feelings, breathing together, offering water, reducing noise, using rhythm, sitting nearby, and waiting before teaching.\n\nA helpful phrase is: “You are having a hard moment. I am here. We will get calm first.”",
    "practiceActivity": "Create a calming toolkit for your home.",
    "quiz": {
      "question": "Teaching works best after the child is calm.",
      "answer": "True",
      "explanation": "Escalated children need safety and regulation first."
    },
    "evidenceTask": "Upload a nervous system calming plan.",
    "slug": "calming-the-nervous-system",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Calming the Nervous System” mean to you right now?",
    "afterQuestion": "What does “Calming the Nervous System” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Calming the Nervous System”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 28,
    "title": "Child Development Basics",
    "learningPurpose": "This lesson introduces the major areas of child development.",
    "learningOutcomes": [
      "Understand major development areas.",
      "Recognise that development varies.",
      "Connect behaviour to development.",
      "Identify strengths and growth areas."
    ],
    "transcript": "Child development is the way children grow, learn, communicate, move, think, feel, relate, and understand the world.\n\nDevelopment areas include physical development, brain development, emotional development, language development, social development, cognitive development, identity development, moral development, independence, and self-regulation.\n\nChildren develop at different rates. Development is affected by genetics, relationships, safety, health, disability, trauma, culture, sleep, nutrition, play, learning, and environment.\n\nUnderstanding development helps parents respond with realistic expectations.\n\nA helpful question is: “Is this behaviour a discipline issue, a development issue, a stress issue, or a skill issue?”",
    "practiceActivity": "Choose one child and write strengths and growth areas across development.",
    "quiz": {
      "question": "Children develop in many connected areas.",
      "answer": "True",
      "explanation": "Development includes body, brain, emotions, language, social skills, and more."
    },
    "evidenceTask": "Upload a child development strengths map.",
    "slug": "child-development-basics",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Child Development Basics” mean to you right now?",
    "afterQuestion": "What does “Child Development Basics” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Child Development Basics”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 29,
    "title": "Child Development Foundations",
    "learningPurpose": "This lesson teaches the foundations children need for healthy development.",
    "learningOutcomes": [
      "Identify core developmental foundations.",
      "Reflect on home strengths and gaps.",
      "Support safety, sleep, play, and routine.",
      "Understand responsive caregiving."
    ],
    "transcript": "Children develop best when their core needs are met consistently enough. These foundations include safe caregiving, predictable routines, responsive relationships, food and water, sleep, play, language, comfort, boundaries, health care, belonging, cultural connection, and emotional safety.\n\nDevelopment does not require perfect parenting. It requires safe-enough, consistent-enough, responsive-enough caregiving with repair when things go wrong.\n\nChildren need adults who notice them, respond to them, protect them, guide them, and enjoy them.",
    "practiceActivity": "Rate your home from 1–5 in routine, emotional safety, sleep, nutrition, connection, play, and boundaries. Choose one area to improve.",
    "quiz": {
      "question": "Responsive caregiving supports healthy development.",
      "answer": "True",
      "explanation": "Children develop through consistent, safe, responsive care."
    },
    "evidenceTask": "Upload a development foundation improvement plan.",
    "slug": "child-development-foundations",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Child Development Foundations” mean to you right now?",
    "afterQuestion": "What does “Child Development Foundations” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Child Development Foundations”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 30,
    "title": "Child Development Stages",
    "learningPurpose": "This lesson teaches parents how children’s needs change across stages.",
    "learningOutcomes": [
      "Understand broad developmental stages.",
      "Adjust expectations as children grow.",
      "Identify stage-based needs.",
      "Support connection and safety at every age."
    ],
    "transcript": "Children’s needs change as they grow.\n\nBabies need safety, feeding, comfort, attachment, sleep, and responsive care.\n\nToddlers need supervision, routine, simple words, emotional naming, and safe exploration.\n\nPreschoolers need play, language, turn-taking, simple choices, and help with feelings.\n\nSchool-aged children need routines, friendships, problem-solving, responsibility, encouragement, and clear rules.\n\nPre-teens need privacy, identity support, emotional coaching, peer guidance, and respectful boundaries.\n\nTeenagers need independence, accountability, safety limits, belonging, guidance, and respect.\n\nEvery stage still needs connection and safety.",
    "practiceActivity": "Write your child’s stage and three needs that match that stage.",
    "quiz": {
      "question": "Parenting should adjust as children grow.",
      "answer": "True",
      "explanation": "Children need different support at different developmental stages."
    },
    "evidenceTask": "Upload a stage-based parenting plan.",
    "slug": "child-development-stages",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Child Development Stages” mean to you right now?",
    "afterQuestion": "What does “Child Development Stages” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Child Development Stages”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 31,
    "title": "Child Protection Responsibilities",
    "learningPurpose": "This lesson teaches parents and carers about child safety responsibilities, protective action, and help-seeking.",
    "learningOutcomes": [
      "Understand basic child protection responsibilities.",
      "Recognise safety concerns.",
      "Seek help early.",
      "Follow safety plans and protective actions."
    ],
    "transcript": "Child protection means keeping children safe from abuse, neglect, exploitation, violence, unsafe supervision, and serious harm.\n\nParents and carers have a responsibility to provide safe care, supervise children appropriately, meet basic needs, protect children from unsafe people, respond to disclosures, seek help when overwhelmed, follow safety plans, report serious concerns where required, and work with services honestly.\n\nThis lesson is educational and does not replace legal advice. If a child is in immediate danger, emergency services should be contacted.\n\nProtective parenting does not mean being perfect. It means acting when safety concerns are present and using support before harm escalates.",
    "practiceActivity": "Write a safety support list with emergency contact, trusted adult, health service, school contact, family support, crisis line, and child safety contact if needed.",
    "quiz": {
      "question": "Children’s safety must be acted on, not ignored.",
      "answer": "True",
      "explanation": "Protective adults respond to safety concerns."
    },
    "evidenceTask": "Upload a child safety responsibility plan.",
    "slug": "child-protection-responsibilities",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Child Protection Responsibilities” mean to you right now?",
    "afterQuestion": "What does “Child Protection Responsibilities” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Child Protection Responsibilities”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 32,
    "title": "Child-Directed Play",
    "learningPurpose": "This lesson teaches parents how child-led play builds connection, confidence, language, and emotional safety.",
    "learningOutcomes": [
      "Follow the child’s safe lead.",
      "Use descriptive commenting.",
      "Avoid taking over play.",
      "Build connection through play."
    ],
    "transcript": "Child-directed play means the child leads the play and the adult follows safely. The parent does not control the story, correct every detail, or turn play into a lesson.\n\nThe adult watches, describes, praises, imitates, and enjoys.\n\nExamples include: “You are building a tall tower,” “You chose the blue car,” “You are making the doll sleep,” “You kept trying when it fell,” and “I like playing with you.”\n\nChild-directed play helps children feel seen, capable, and connected. It is especially helpful for children who receive lots of correction during the day.\n\nRules are: let the child lead, avoid criticism, avoid too many questions, describe what you see, praise effort, and join safely.",
    "practiceActivity": "Do 10 minutes of child-directed play.",
    "quiz": {
      "question": "In child-directed play, the parent follows the child’s safe lead.",
      "answer": "True",
      "explanation": "The child leads while the adult stays warm and safe."
    },
    "evidenceTask": "Upload a child-directed play reflection.",
    "slug": "child-directed-play",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Child-Directed Play” mean to you right now?",
    "afterQuestion": "What does “Child-Directed Play” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Child-Directed Play”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 33,
    "title": "Child-Focused Communication",
    "learningPurpose": "This lesson teaches parents to communicate in ways that place the child’s needs, age, and emotional safety first.",
    "learningOutcomes": [
      "Use age-appropriate communication.",
      "Avoid adult burdening.",
      "Reassure children during stress.",
      "Keep communication focused on safety and wellbeing."
    ],
    "transcript": "Child-focused communication asks: “What does my child need to hear, and how can I say it safely?”\n\nChildren should not be overloaded with adult problems, legal conflict, financial stress, relationship issues, or emotional pressure they cannot carry.\n\nChild-focused communication is clear, honest enough, age-appropriate, calm, reassuring, not blaming, not shaming, not adultifying, and focused on safety.\n\nExample: Instead of, “Everything is falling apart because of your father,” say, “The adults are working through some problems. You are safe, and you do not have to fix this.”",
    "practiceActivity": "Rewrite one adult-heavy statement into child-safe language.",
    "quiz": {
      "question": "Children should not be made responsible for adult emotions.",
      "answer": "True",
      "explanation": "Adults are responsible for adult problems and emotions."
    },
    "evidenceTask": "Upload a child-focused communication script.",
    "slug": "child-focused-communication",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Child-Focused Communication” mean to you right now?",
    "afterQuestion": "What does “Child-Focused Communication” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Child-Focused Communication”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 34,
    "title": "Child-Parent Negotiation",
    "learningPurpose": "This lesson teaches parents how to negotiate with children while still holding necessary safety boundaries.",
    "learningOutcomes": [
      "Identify negotiable and non-negotiable issues.",
      "Offer structured choices.",
      "Hold safety boundaries.",
      "Support problem-solving."
    ],
    "transcript": "Negotiation gives children voice and helps them learn problem-solving. But not every issue is negotiable.\n\nSafety is not negotiable. Violence, supervision, medical needs, seatbelts, school attendance, and protection from harm require adult leadership.\n\nSome things can be negotiated, such as which jumper to wear, which homework task to do first, which vegetable to try, which story to read, whether to shower before or after dinner, or how to repair harm.\n\nNegotiation works best when the adult is clear: “You can choose between these two safe options.”\n\nA helpful phrase is: “This part is not a choice. This part you can choose.”",
    "practiceActivity": "Write three negotiable issues and three non-negotiable safety issues.",
    "quiz": {
      "question": "Children can have choices within safe boundaries.",
      "answer": "True",
      "explanation": "Structured choice supports cooperation and autonomy."
    },
    "evidenceTask": "Upload a choices and boundaries plan.",
    "slug": "child-parent-negotiation",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Child-Parent Negotiation” mean to you right now?",
    "afterQuestion": "What does “Child-Parent Negotiation” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Child-Parent Negotiation”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 35,
    "title": "Children’s Experience of Separation",
    "learningPurpose": "This lesson helps parents understand how separation can affect children emotionally, behaviourally, and relationally.",
    "learningOutcomes": [
      "Recognise children’s emotional responses to separation.",
      "Use child-safe language.",
      "Reduce conflict exposure.",
      "Reassure children they are not responsible."
    ],
    "transcript": "Separation can affect children differently depending on age, temperament, safety, family conflict, routines, and support. Children may feel sadness, anger, confusion, guilt, relief, worry, loyalty pressure, or fear.\n\nChildren need reassurance that the separation is not their fault, they are loved, their routines will be explained, they can ask questions, they do not have to choose sides, adults will handle adult issues, and their feelings are allowed.\n\nAvoid making children emotional messengers, spies, comforters, or judges between adults.\n\nA helpful phrase is: “You did not cause this. Adults are responsible for adult decisions. You are loved and safe to talk about your feelings.”",
    "practiceActivity": "Write a child-safe separation explanation.",
    "quiz": {
      "question": "Children may blame themselves for adult separation.",
      "answer": "True",
      "explanation": "Children often need reassurance that adult separation is not their fault."
    },
    "evidenceTask": "Upload a child-safe separation support plan.",
    "slug": "childrens-experience-of-separation",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Children’s Experience of Separation” mean to you right now?",
    "afterQuestion": "What does “Children’s Experience of Separation” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Children’s Experience of Separation”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 36,
    "title": "Choices and Control",
    "learningPurpose": "This lesson teaches parents the difference between giving healthy choices and using control.",
    "learningOutcomes": [
      "Use structured choices.",
      "Avoid power struggles.",
      "Hold non-negotiable safety limits.",
      "Support autonomy and cooperation."
    ],
    "transcript": "Children need some control over their lives. Healthy choices help children feel respected and capable. Too much control from adults can create power struggles. Too much freedom can leave children unsafe.\n\nThe goal is structured choice.\n\nExamples include: “Red shirt or blue shirt?” “Bath now or in five minutes?” “Homework at the table or desk?” “Walk beside me or hold my hand?” and “Repair with words or a drawing?”\n\nDo not offer a choice if there is no choice. Avoid saying, “Do you want to go to school?” when school attendance is required.\n\nInstead say: “It is a school day. Do you want shoes or lunchbox first?”",
    "practiceActivity": "Write five structured choices for daily routines.",
    "quiz": {
      "question": "Choices can exist inside firm boundaries.",
      "answer": "True",
      "explanation": "Children can have voice while adults maintain safety."
    },
    "evidenceTask": "Upload a structured choice plan.",
    "slug": "choices-and-control",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Choices and Control” mean to you right now?",
    "afterQuestion": "What does “Choices and Control” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Choices and Control”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 37,
    "title": "Circle of Security",
    "learningPurpose": "This lesson introduces attachment-based parenting concepts connected to children needing adults as a secure base and safe haven.",
    "learningOutcomes": [
      "Understand secure base and safe haven needs.",
      "Support exploration and comfort.",
      "Use kind adult leadership.",
      "Reflect on attachment needs."
    ],
    "transcript": "Circle of Security is an attachment-based approach that helps parents understand children’s emotional needs. This lesson introduces general concepts only and does not replace official Circle of Security Parenting training.\n\nChildren need adults who can support exploration and welcome them back for comfort.\n\nA child may need help going out to explore, delight in their learning, watching over, protection, comfort, help organising feelings, and repair after disconnection.\n\nThe adult role is to be bigger, stronger, wiser, and kind. This means the adult is in charge of safety while still being emotionally available.\n\nA helpful phrase is: “I can be the safe hands my child returns to.”",
    "practiceActivity": "Reflect on when your child needs independence and when they need comfort.",
    "quiz": {
      "question": "Children need both exploration and comfort.",
      "answer": "True",
      "explanation": "Secure caregiving supports both independence and return for safety."
    },
    "evidenceTask": "Upload a secure base and safe haven reflection.",
    "slug": "circle-of-security",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Circle of Security” mean to you right now?",
    "afterQuestion": "What does “Circle of Security” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Circle of Security”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 38,
    "title": "Co-Parenting Effectively",
    "learningPurpose": "This lesson teaches parents how to co-parent in ways that reduce conflict and protect children’s wellbeing.",
    "learningOutcomes": [
      "Use child-focused co-parenting communication.",
      "Reduce conflict exposure.",
      "Create predictable routines.",
      "Protect children from adult disputes."
    ],
    "transcript": "Effective co-parenting means adults organise parenting responsibilities without placing children in the middle.\n\nChildren benefit when adults communicate respectfully, keep routines predictable, share necessary information, and avoid exposing children to adult conflict.\n\nEffective co-parenting includes child-focused communication, written agreements where helpful, predictable changeovers, respectful updates, no name-calling, no using children as messengers, no interrogating children, flexibility where safe, and clear boundaries where needed.\n\nA useful question is: “Will this decision reduce stress for my child?”",
    "practiceActivity": "Write a co-parenting communication boundary plan.",
    "quiz": {
      "question": "Children should not be used as messengers in co-parenting.",
      "answer": "True",
      "explanation": "Adult communication should remain adult-to-adult."
    },
    "evidenceTask": "Upload a child-focused co-parenting plan.",
    "slug": "co-parenting-effectively",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Co-Parenting Effectively” mean to you right now?",
    "afterQuestion": "What does “Co-Parenting Effectively” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Co-Parenting Effectively”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 39,
    "title": "Co-Parenting",
    "learningPurpose": "This lesson introduces the foundations of co-parenting after separation, conflict, kinship care, or shared caregiving.",
    "learningOutcomes": [
      "Understand shared caregiving roles.",
      "Keep the child’s wellbeing central.",
      "Set communication boundaries.",
      "Support stability and routine."
    ],
    "transcript": "Co-parenting means more than two adults sharing time. It means adults work around the child’s needs, routines, safety, emotions, and identity.\n\nCo-parenting may involve separated parents, kinship carers, foster carers, grandparents, step-parents, or support people.\n\nGood co-parenting asks: What does the child need? What information must be shared? What conflict must be kept away from the child? What routines should stay consistent? What boundaries protect safety? What language helps the child feel secure?\n\nCo-parenting does not require adults to agree on everything. It does require adults to avoid using the child as the battlefield.",
    "practiceActivity": "Write down three child needs that should guide co-parenting decisions.",
    "quiz": {
      "question": "Co-parenting should focus on the child’s wellbeing, not adult winning.",
      "answer": "True",
      "explanation": "The child’s needs should remain central."
    },
    "evidenceTask": "Upload a co-parenting values plan.",
    "slug": "co-parenting",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Co-Parenting” mean to you right now?",
    "afterQuestion": "What does “Co-Parenting” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Co-Parenting”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 40,
    "title": "Co-Regulation and Physical Health",
    "learningPurpose": "This lesson teaches parents how physical health affects emotional regulation.",
    "learningOutcomes": [
      "Recognise physical factors in behaviour.",
      "Check sleep, food, hydration, pain, and sensory needs.",
      "Support co-regulation through body care.",
      "Create a body-check routine."
    ],
    "transcript": "Co-regulation means an adult helps a child calm when the child cannot yet calm alone. Physical health strongly affects regulation.\n\nChildren may struggle more when they are hungry, tired, sick, in pain, constipated, overstimulated, understimulated, dehydrated, experiencing sensory overload, or recovering from stress.\n\nBefore assuming defiance, ask: “Could my child’s body be making this harder?”\n\nSupporting physical health includes sleep routines, regular meals, hydration, medical care, movement, sensory breaks, and calm environments.\n\nA helpful phrase is: “Let’s check what your body needs first.”",
    "practiceActivity": "Create a body-check routine for food, water, sleep, pain, sensory needs, movement, and calm space.",
    "quiz": {
      "question": "Physical needs can affect behaviour.",
      "answer": "True",
      "explanation": "The body and nervous system are connected."
    },
    "evidenceTask": "Upload a co-regulation and body needs plan.",
    "slug": "co-regulation-and-physical-health",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Co-Regulation and Physical Health” mean to you right now?",
    "afterQuestion": "What does “Co-Regulation and Physical Health” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Co-Regulation and Physical Health”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 41,
    "title": "Co-Regulation Basics",
    "learningPurpose": "This lesson teaches parents how children borrow adult calm before they can manage emotions independently.",
    "learningOutcomes": [
      "Explain co-regulation.",
      "Use calm voice and safe presence.",
      "Name feelings.",
      "Help children move toward self-regulation."
    ],
    "transcript": "Co-regulation is when a safe adult helps a child calm. Children are not born knowing how to manage big feelings. They learn regulation through repeated experiences with regulated adults.\n\nCo-regulation does not mean removing every boundary. It means helping the child become calm enough to learn.\n\nCo-regulation tools include soft voice, slow breathing, sitting nearby, naming feelings, gentle rhythm, reducing noise, offering choices, waiting, and repairing after conflict.\n\nA helpful phrase is: “I am here. You are safe. We will calm first, then solve the problem.”\n\nOver time, co-regulation becomes self-regulation.",
    "practiceActivity": "Practise one co-regulation script and one calming action.",
    "quiz": {
      "question": "Children learn self-regulation through repeated support.",
      "answer": "True",
      "explanation": "Adults help children practise regulation over time."
    },
    "evidenceTask": "Upload a co-regulation practice reflection.",
    "slug": "co-regulation-basics",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Co-Regulation Basics” mean to you right now?",
    "afterQuestion": "What does “Co-Regulation Basics” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Co-Regulation Basics”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 42,
    "title": "Coercive Control Awareness",
    "learningPurpose": "This lesson teaches parents to recognise patterns of control, intimidation, isolation, monitoring, threats, and fear in family relationships.",
    "learningOutcomes": [
      "Understand coercive control as a pattern.",
      "Recognise effects on children.",
      "Prioritise safety planning.",
      "Know when specialist support is needed."
    ],
    "transcript": "Coercive control is a pattern of behaviour that makes another person feel trapped, afraid, monitored, dependent, or controlled. It may include threats, isolation, financial control, technology monitoring, humiliation, intimidation, stalking, using children, or controlling daily choices.\n\nChildren can be harmed by living around coercive control, even if they are not physically hurt. They may feel fear, confusion, loyalty pressure, responsibility for adult safety, or emotional insecurity.\n\nThis lesson is educational and does not replace specialist domestic and family violence support or legal advice.\n\nA safety-focused question is: “Is anyone changing their behaviour because they are afraid of someone’s reaction?”\n\nIf immediate danger is present, emergency help should be contacted.",
    "practiceActivity": "Write a private safety support list if safe to do so.",
    "quiz": {
      "question": "Coercive control is about patterns of power and control.",
      "answer": "True",
      "explanation": "It is not only isolated arguments; it is repeated control and fear."
    },
    "evidenceTask": "Upload only if safe: a support and safety awareness reflection.",
    "slug": "coercive-control-awareness",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Coercive Control Awareness” mean to you right now?",
    "afterQuestion": "What does “Coercive Control Awareness” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Coercive Control Awareness”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 43,
    "title": "Cognitive Development",
    "learningPurpose": "This lesson teaches parents how children develop thinking, memory, problem-solving, attention, and decision-making.",
    "learningOutcomes": [
      "Understand cognitive development.",
      "Support learning through everyday experiences.",
      "Use curiosity and problem-solving prompts.",
      "Encourage effort and persistence."
    ],
    "transcript": "Cognitive development is how children learn to think, remember, solve problems, plan, understand cause and effect, and make decisions.\n\nChildren develop thinking skills through everyday experiences such as talking, reading, sorting, counting, pretend play, asking questions, solving problems, building, cooking, exploring, and making mistakes safely.\n\nAdults support cognitive development by being curious with the child rather than giving every answer immediately.\n\nHelpful prompts include: “What do you think will happen?” “How could we solve this?” “What did you notice?” “What could we try next?” and “That was tricky, and you kept thinking.”",
    "practiceActivity": "Do one problem-solving activity with your child and describe their thinking.",
    "quiz": {
      "question": "Play can support thinking and problem-solving.",
      "answer": "True",
      "explanation": "Play gives children chances to experiment, remember, plan, and solve problems."
    },
    "evidenceTask": "Upload a cognitive development activity reflection.",
    "slug": "cognitive-development",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Cognitive Development” mean to you right now?",
    "afterQuestion": "What does “Cognitive Development” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Cognitive Development”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 44,
    "title": "Communicating With Families",
    "learningPurpose": "This lesson teaches respectful, clear, and child-focused communication with extended family and support networks.",
    "learningOutcomes": [
      "Communicate child needs clearly.",
      "Set respectful family boundaries.",
      "Ask for practical support.",
      "Protect children from adult conflict."
    ],
    "transcript": "Families can be a source of support, culture, belonging, childcare, wisdom, and connection. Families can also experience conflict, misunderstanding, pressure, or unsafe patterns.\n\nCommunicating with families requires clarity and respect.\n\nHelpful communication includes naming the child’s needs, explaining routines, setting safety boundaries, asking for practical support, avoiding blame where possible, being clear about non-negotiables, and protecting children from adult conflict.\n\nExample: “We are using calm discipline now. Please do not smack, shame, or yell at the children. If behaviour is hard, call me and I will help.”",
    "practiceActivity": "Write one respectful family boundary script.",
    "quiz": {
      "question": "Family support should still follow child safety boundaries.",
      "answer": "True",
      "explanation": "Support is helpful only when it remains safe and respectful."
    },
    "evidenceTask": "Upload a family communication plan.",
    "slug": "communicating-with-families",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Communicating With Families” mean to you right now?",
    "afterQuestion": "What does “Communicating With Families” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Communicating With Families”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 45,
    "title": "Communication Boundaries",
    "learningPurpose": "This lesson teaches parents how to set limits around what, when, how, and with whom communication happens.",
    "learningOutcomes": [
      "Explain communication boundaries.",
      "Protect children from adult conflict.",
      "Set limits around unsafe messages.",
      "Use brief, respectful communication."
    ],
    "transcript": "Communication boundaries protect safety, respect, privacy, and emotional wellbeing.\n\nBoundaries may include not arguing in front of children, not answering abusive messages, using written communication for co-parenting, keeping adult topics away from children, not sharing children’s private information unnecessarily, ending conversations that become threatening, choosing appropriate times to talk, and keeping messages brief and factual.\n\nA boundary is not an attack. It is a clear limit.\n\nExample: “I will talk about the children’s routine. I will not continue this conversation if there is name-calling.”\n\nChildren also need boundaries around online communication, privacy, and unsafe adults.",
    "practiceActivity": "Write three communication boundaries for your home.",
    "quiz": {
      "question": "Boundaries can protect children from adult conflict.",
      "answer": "True",
      "explanation": "Boundaries help keep communication safe and child-focused."
    },
    "evidenceTask": "Upload a communication boundary plan.",
    "slug": "communication-boundaries",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Communication Boundaries” mean to you right now?",
    "afterQuestion": "What does “Communication Boundaries” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Communication Boundaries”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 46,
    "title": "Communication Roadblocks",
    "learningPurpose": "This lesson teaches parents to recognise patterns that make communication harder.",
    "learningOutcomes": [
      "Identify roadblocks to understanding.",
      "Replace roadblocks with bridge statements.",
      "Reduce blame and defensiveness.",
      "Use repair when communication breaks down."
    ],
    "transcript": "Communication roadblocks are habits that stop understanding. They can happen between adults and children or between adults.\n\nCommon roadblocks include interrupting, assuming, blaming, bringing up the past, sarcasm, threats, shouting, stonewalling, dismissing, over-explaining, not listening, and trying to win instead of understand.\n\nA roadblock can be replaced with a bridge.\n\nRoadblock: “You never listen.” Bridge: “I need to know you heard me. Can you repeat the plan back?”\n\nRoadblock: “Whatever.” Bridge: “I am overwhelmed. I need a break and will come back.”\n\nRepair is part of healthy communication.",
    "practiceActivity": "Choose one roadblock and rewrite it as a bridge statement.",
    "quiz": {
      "question": "Trying to win can block understanding.",
      "answer": "True",
      "explanation": "Healthy communication aims to understand and solve, not defeat the other person."
    },
    "evidenceTask": "Upload a communication roadblock rewrite.",
    "slug": "communication-roadblocks",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Communication Roadblocks” mean to you right now?",
    "afterQuestion": "What does “Communication Roadblocks” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Communication Roadblocks”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  },
  {
    "id": 47,
    "title": "Communication Without Conflict",
    "learningPurpose": "This lesson teaches parents how to communicate clearly without escalating into arguments, threats, or emotional harm.",
    "learningOutcomes": [
      "Use calm tone and clear wording.",
      "Listen before responding.",
      "Take breaks when escalated.",
      "Repair and return to problem-solving."
    ],
    "transcript": "Communication without conflict does not mean avoiding every disagreement. It means handling disagreement without disrespect, fear, intimidation, shame, or emotional harm.\n\nHealthy communication includes calm voice, one issue at a time, listening before responding, clear requests, respectful boundaries, taking breaks when escalated, avoiding insults, avoiding threats, repairing harm, and returning to the problem when calm.\n\nA helpful structure is: name the issue, name the feeling, state the need, and ask for the next step.\n\nExample: “I feel stressed when the morning routine runs late. I need us to leave by 8 am. Let’s pack bags tonight.”",
    "practiceActivity": "Write one conflict-free communication script for a common issue.",
    "quiz": {
      "question": "Communication without conflict means no one is allowed to disagree.",
      "answer": "False",
      "explanation": "Healthy disagreement can happen without harm, threats, or disrespect."
    },
    "evidenceTask": "Upload a calm communication script.",
    "slug": "communication-without-conflict",
    "durationMinutes": {
      "minimum": 30,
      "recommended": 60,
      "extended": 120
    },
    "beforeQuestion": "What does “Communication Without Conflict” mean to you right now?",
    "afterQuestion": "What does “Communication Without Conflict” mean to you now?",
    "changeInUnderstandingQuestion": "What changed in your understanding of “Communication Without Conflict”?",
    "completionRecordQuestions": [
      "What did I think this lesson meant before I started?",
      "What do I understand now?",
      "What changed in my thinking?",
      "What is one thing I can practise this week?",
      "What evidence can I upload to show learning, effort, or behaviour change?"
    ],
    "completionStatement": "I have completed this SAFE STEPS lesson. I understand that learning is shown through reflection, practice, repair, and repeated safe choices over time."
  }
];
