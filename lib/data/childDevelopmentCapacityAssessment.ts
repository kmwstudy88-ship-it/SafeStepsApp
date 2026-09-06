export type CapacityAgeBand = "infant" | "toddler_preschool" | "school_age" | "teen" | "all_ages";

export type CapacityConcernDomain =
  | "physical_emotional_safety"
  | "neglect_supervision_medical"
  | "substance_environment_controls"
  | "domestic_safety_safe_relationships"
  | "development_learning_support"
  | "digital_safety";

export type CapacityResponseLevel = 1 | 2 | 3;

export type CapacityScenario = {
  id: string;
  domain: CapacityConcernDomain;
  ageBand: CapacityAgeBand;
  title: string;
  scenario: string;
  criticalSafetyMarkers: string[];
  developmentalLearningFocus: string[];
  unsafeResponseExample: string;
  protectiveResponseExample: string;
};

export type ContactObservationWeek = {
  week: number;
  focus: string;
  goal: string;
  observableBehaviors: string[];
  unacceptableExample: string;
  conditionalExample: string;
  protectiveExample: string;
};

export const capacityAssessmentDomains: {
  id: CapacityConcernDomain;
  title: string;
  assessorFocus: string;
}[] = [
  {
    id: "physical_emotional_safety",
    title: "Physical Abuse Risk & Emotional Regulation",
    assessorFocus: "Can the parent regulate their body, words, and actions when the child is distressed or provocative?",
  },
  {
    id: "neglect_supervision_medical",
    title: "Neglect, Supervision, Hygiene & Medical Response",
    assessorFocus: "Can the parent track hazards, supervise actively, and seek help when basic care or medical risk escalates?",
  },
  {
    id: "substance_environment_controls",
    title: "Substance Misuse & Environmental Controls",
    assessorFocus: "Can the parent keep medication, alcohol, vaping, and drug-related risks away from children?",
  },
  {
    id: "domestic_safety_safe_relationships",
    title: "Domestic Safety & Safe Relationships",
    assessorFocus: "Can the parent protect children from unsafe adults, intimidation, and adult conflict?",
  },
  {
    id: "development_learning_support",
    title: "Child Development, Learning & Daily Capability",
    assessorFocus: "Can the parent understand age-appropriate learning, play, routines, language, and help-seeking needs?",
  },
  {
    id: "digital_safety",
    title: "Digital Safety & Online Supervision",
    assessorFocus: "Can the parent recognise grooming, unsafe contacts, privacy risks, and age-appropriate technology boundaries?",
  },
];

export const childDevelopmentCapacityScenarios: CapacityScenario[] = [
  {
    id: "CAP-01-INFANT-COLIC",
    domain: "physical_emotional_safety",
    ageBand: "infant",
    title: "Crying Infant and Parent Overload",
    scenario:
      "Your 4-month-old baby has been crying for hours. You have slept very little and feel anger rising quickly.",
    criticalSafetyMarkers: [
      "Names their own breaking point before acting.",
      "Places the baby safely on their back in an empty cot.",
      "Steps away briefly to breathe or call for support.",
      "States that shaking, rough handling, or yelling at the baby is never safe.",
    ],
    developmentalLearningFocus: ["Infant crying communication", "Safe sleep", "Co-regulation", "Help-seeking"],
    unsafeResponseExample: "I would shout or shake them so they stop crying.",
    protectiveResponseExample:
      "I would put the baby safely in the cot, step away for a few minutes, breathe, and call someone safe for support.",
  },
  {
    id: "CAP-02-TODDLER-MELTDOWN",
    domain: "physical_emotional_safety",
    ageBand: "toddler_preschool",
    title: "Shopping Centre Meltdown",
    scenario:
      "Your 3-year-old is screaming and kicking at a busy checkout because you said no to sweets.",
    criticalSafetyMarkers: [
      "Keeps their voice low and body calm.",
      "Moves the child away from foot traffic if needed.",
      "Does not hit, threaten, shame, or bribe.",
      "Maintains the safe boundary without escalating.",
    ],
    developmentalLearningFocus: ["Impulse control", "Boundary testing", "Co-regulation", "Public stress tolerance"],
    unsafeResponseExample: "I would smack them or give them the sweets so people stop staring.",
    protectiveResponseExample:
      "I would get low, keep my voice calm, move them somewhere safer, and hold the boundary kindly.",
  },
  {
    id: "CAP-03-CHANGE-TABLE",
    domain: "neglect_supervision_medical",
    ageBand: "infant",
    title: "Change Table and Doorbell",
    scenario:
      "You are changing your 6-month-old on a high change table when the doorbell rings for an urgent delivery.",
    criticalSafetyMarkers: [
      "Never leaves the infant unattended on a raised surface.",
      "Places the baby in a cot or on the floor before moving away.",
      "Understands falls can happen in seconds.",
    ],
    developmentalLearningFocus: ["Infant mobility", "Fall prevention", "Hazard anticipation"],
    unsafeResponseExample: "I would quickly run to the door because it will only take a second.",
    protectiveResponseExample: "I would pick the baby up or place them safely down before answering.",
  },
  {
    id: "CAP-04-FEVER-BREATHING",
    domain: "neglect_supervision_medical",
    ageBand: "school_age",
    title: "Night Fever and Breathing Difficulty",
    scenario:
      "Your 7-year-old wakes at 2:00 AM with a high fever, barking cough, and visible trouble breathing.",
    criticalSafetyMarkers: [
      "Recognises breathing difficulty as urgent.",
      "Seeks emergency medical help instead of waiting until morning.",
      "Uses medication only as directed and measures doses accurately.",
      "Knows where to call for urgent medical advice or emergency services.",
    ],
    developmentalLearningFocus: ["Medical escalation", "Medication safety", "Night-time planning"],
    unsafeResponseExample: "I would wait until morning and give adult medicine if that is all I have.",
    protectiveResponseExample:
      "I would seek urgent medical help, follow dose instructions, and keep monitoring breathing.",
  },
  {
    id: "CAP-05-MEDICATION-STORAGE",
    domain: "substance_environment_controls",
    ageBand: "toddler_preschool",
    title: "Medication in Reach",
    scenario:
      "You have strong prescribed pain medicine and your 18-month-old puts small objects in their mouth.",
    criticalSafetyMarkers: [
      "Stores medicine in a locked or high secured place.",
      "Keeps bags and bedside tables free of accessible medication.",
      "Knows to contact poison advice or emergency help if ingestion is suspected.",
    ],
    developmentalLearningFocus: ["Mouthing stage", "Exploration", "Poison prevention"],
    unsafeResponseExample: "I would leave it on the bench because they should learn not to touch.",
    protectiveResponseExample: "I would lock it away immediately and keep the number for poison advice visible.",
  },
  {
    id: "CAP-06-UNSAFE-ADULT-DOOR",
    domain: "domestic_safety_safe_relationships",
    ageBand: "all_ages",
    title: "Unsafe Adult at the Door",
    scenario:
      "An ex-partner or family member with violent behaviour arrives uninvited while the children are home.",
    criticalSafetyMarkers: [
      "Keeps doors locked and children away from the conflict.",
      "Does not let the unsafe adult inside to avoid embarrassment.",
      "Contacts police or emergency support if the person refuses to leave or escalates.",
      "Avoids arguing in front of the children.",
    ],
    developmentalLearningFocus: ["Emotional safety", "Protective gatekeeping", "Adult conflict boundaries"],
    unsafeResponseExample: "I would let them in so they calm down, even if the children are scared.",
    protectiveResponseExample:
      "I would keep the door locked, move the children somewhere safer, ask the person to leave, and call for help if needed.",
  },
  {
    id: "CAP-07-PLAY-BASED-DEVELOPMENT",
    domain: "development_learning_support",
    ageBand: "toddler_preschool",
    title: "Play-Based Development Check",
    scenario:
      "During playdough, blocks, and storytime, your child struggles to follow directions, share, and use words to ask for help.",
    criticalSafetyMarkers: [
      "Observes without shaming or labelling the child.",
      "Uses simple language, modelling, and encouragement.",
      "Notices whether motor, language, or social skills may need support.",
      "Seeks professional advice if delays or concerns persist.",
    ],
    developmentalLearningFocus: ["Fine motor", "Language", "Turn-taking", "Early problem-solving"],
    unsafeResponseExample: "I would call them lazy or naughty and make them keep trying until they get it right.",
    protectiveResponseExample:
      "I would slow down, model the task, praise effort, and ask a child health or early learning professional if concerns continue.",
  },
  {
    id: "CAP-08-TEEN-PARTY",
    domain: "domestic_safety_safe_relationships",
    ageBand: "teen",
    title: "Teen Party Boundary",
    scenario:
      "Your 14-year-old wants to attend a party at an older teenager's house and becomes defensive when you ask questions.",
    criticalSafetyMarkers: [
      "Checks adult supervision and location details.",
      "Sets clear boundaries around alcohol, drugs, transport, and contact.",
      "Handles pushback without giving in to avoid conflict.",
      "Keeps communication firm and supportive.",
    ],
    developmentalLearningFocus: ["Adolescent autonomy", "Risk assessment", "Peer pressure", "Boundary negotiation"],
    unsafeResponseExample: "I would just say yes because teenagers will do what they want anyway.",
    protectiveResponseExample:
      "I would verify details with adults, set transport and safety rules, and say no if supervision is not safe.",
  },
  {
    id: "CAP-09-ONLINE-GROOMING",
    domain: "digital_safety",
    ageBand: "school_age",
    title: "Online Grooming Warning Signs",
    scenario:
      "Your child says an adult in an online game asked for photos, their school name, and to keep the chat secret.",
    criticalSafetyMarkers: [
      "Recognises adult secrecy and personal-photo requests as unsafe.",
      "Stops the contact calmly and preserves relevant information for reporting.",
      "Reassures the child they are not in trouble.",
      "Changes privacy and voice-chat settings and increases visible supervision.",
    ],
    developmentalLearningFocus: ["Digital boundaries", "Safe adults", "Privacy", "Help-seeking"],
    unsafeResponseExample: "I would tell my child to block them and stop bothering me about games.",
    protectiveResponseExample:
      "I would stop the contact, reassure my child, report the account, and move gaming into a supervised space.",
  },
  {
    id: "CAP-10-FOOD-UTILITIES",
    domain: "neglect_supervision_medical",
    ageBand: "all_ages",
    title: "No Food or Power",
    scenario:
      "The power is disconnected, there is no fresh food, and the children are hungry.",
    criticalSafetyMarkers: [
      "Prioritises feeding and hygiene needs immediately.",
      "Uses emergency relief, family support, housing, or caseworker help.",
      "Does not feed unsafe spoiled food.",
      "Does not hide the problem until children are harmed.",
    ],
    developmentalLearningFocus: ["Basic care", "Resourcefulness", "Pride versus child needs", "Crisis planning"],
    unsafeResponseExample: "I would wait and hope it sorts itself out because asking for help is embarrassing.",
    protectiveResponseExample:
      "I would contact emergency relief or my worker immediately and make a safe plan for food, power, and hygiene.",
  },
];

export const contactObservationGuide: ContactObservationWeek[] = [
  {
    week: 1,
    focus: "Environment Setup, Welcome & Hazard Tracking",
    goal: "Observe whether the parent creates a safe space and meets the child's emotional pace.",
    observableBehaviors: [
      "Scans room, park, gates, bags, sharp objects, hot drinks, and choking hazards.",
      "Stores personal items out of reach.",
      "Greets the child calmly without guilt, pressure, or emotional demands.",
    ],
    unacceptableExample: "Leaves hazards accessible or becomes angry when the child will not hug them.",
    conditionalExample: "Stores items safely but needs reminders to supervise open gates or hazards.",
    protectiveExample: "Audits the space, follows the child's pace, and stays emotionally regulated.",
  },
  {
    week: 2,
    focus: "Routine Management, Feeding & Basic Care",
    goal: "Observe hygiene, food safety, care routines, and calm boundaries.",
    observableBehaviors: [
      "Prepares age-appropriate food and checks choking risks.",
      "Responds promptly to nappy, toilet, hunger, and tiredness cues.",
      "Handles food refusal without threats, shaming, or unsafe substitutions.",
    ],
    unacceptableExample: "Leaves infant unattended or gives unsafe food while escalating verbally.",
    conditionalExample: "Food is safe but parent gives in to avoid distress.",
    protectiveExample: "Uses safe hygiene, age-appropriate care, and calm routine boundaries.",
  },
  {
    week: 3,
    focus: "High Stress Triggers & Behaviour Management",
    goal: "Observe real-time co-regulation when the child is distressed or defiant.",
    observableBehaviors: [
      "Uses a quiet tone and safe body position.",
      "Offers comfort before correction.",
      "Uses a safe self-regulation plan when frustration rises.",
    ],
    unacceptableExample: "Threatens, roughly grabs, shames, or walks away in anger.",
    conditionalExample: "Does not escalate but cannot actively comfort or guide the child.",
    protectiveExample: "Stays regulated and helps the child recover through connection and structure.",
  },
  {
    week: 4,
    focus: "Hard Transitions, Pack-Up & Goodbyes",
    goal: "Observe whether the parent protects the child emotionally during endings.",
    observableBehaviors: [
      "Gives warnings before pack-up.",
      "Uses playful or predictable transition routines.",
      "Keeps goodbye safe, reassuring, and free from adult blame or legal promises.",
    ],
    unacceptableExample: "Blames the department or breaks down in a way the child must manage.",
    conditionalExample: "Goodbye is loving but chaotic and emotionally heavy.",
    protectiveExample: "Prepares the child, packs up calmly, and gives a secure goodbye.",
  },
];

export const parentPreparationGuideSections = [
  {
    title: "See the Risk",
    body: "Look for hazards before they become emergencies: hot drinks, open gates, medicine, unsafe adults, online contact, food, sleep, and supervision gaps.",
  },
  {
    title: "Calm Yourself First",
    body: "A strong parent can pause, breathe, ask for help, and choose safe words before reacting to a child.",
  },
  {
    title: "Protect the Child",
    body: "The child's safety and emotional security come before embarrassment, pride, anger, adult conflict, or fear of asking for help.",
  },
  {
    title: "Support Development",
    body: "Use play, routines, storytime, questions, and encouragement to notice how your child is learning, communicating, moving, and coping.",
  },
];

export const australianFamilySupportNetworks = [
  { name: "Emergency Services", contact: "000", useWhen: "Immediate physical danger, medical emergency, or domestic safety crisis." },
  { name: "Queensland Child Safety After Hours", contact: "1800 177 135", useWhen: "Urgent out-of-hours child protection support in Queensland." },
  { name: "Family and Child Connect QLD", contact: "13 32 64", useWhen: "Local family support for parenting, housing, and practical stressors." },
  { name: "Parentline", contact: "1300 30 1300", useWhen: "Parenting counselling, stress support, and practical advice." },
  { name: "1800RESPECT", contact: "1800 737 732", useWhen: "Domestic, family violence, and sexual assault counselling." },
  { name: "Lifeline", contact: "13 11 14", useWhen: "Immediate crisis and suicide prevention support." },
  { name: "Kids Helpline", contact: "1800 55 1800", useWhen: "Private counselling for children and young people aged 5 to 25." },
  { name: "13YARN", contact: "13 92 76", useWhen: "Crisis support for Aboriginal and Torres Strait Islander people." },
];

export const capacityReportingFields = [
  "case_id",
  "assessment_date",
  "domain_id",
  "scenario_id",
  "age_band",
  "raw_parent_quote",
  "response_level",
  "capacity_score",
  "observation_type",
  "worker_notes",
  "evidence_links",
];
