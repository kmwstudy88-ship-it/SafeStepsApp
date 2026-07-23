export type ShareAudience = "private" | "parent" | "caseworker" | "both";

export type ChildLesson = {
  id: string;
  week: number;
  title: string;
  description: string;
  objectives: string[];
  tasks: string[];
  evidence: string[];
  sharing: string;
};

export const childDashboardItems = [
  {
    title: "Today’s Feelings Check-In",
    description: "Choose how you feel today. You decide if anyone sees it.",
    href: "/child/check-in",
    badge: "Private",
  },
  {
    title: "Today’s Lessons",
    description: "Small lessons about feelings, safety, choices, and confidence.",
    href: "/child/lessons",
    badge: "Learning",
  },
  {
    title: "Today’s Tasks",
    description: "Drawing, reflection, voice note, and safe activity tasks.",
    href: "/child/tasks",
    badge: "Tasks",
  },
  {
    title: "My Story",
    description: "Your private space for feelings, hopes, worries, drawings, and achievements.",
    href: "/child/my-story",
    badge: "Private",
  },
  {
    title: "Visit Reflection",
    description: "Think about how a visit felt and what you want adults to understand.",
    href: "/child/visits/reflection",
    badge: "Choice",
  },
  {
    title: "My Safe People",
    description: "People you feel safe talking to or asking for help.",
    href: "/child/safe-people",
    badge: "Safety",
  },
  {
    title: "My Achievements",
    description: "Celebrate your progress, strengths, courage, and completed lessons.",
    href: "/child/achievements",
    badge: "Progress",
  },
  {
    title: "Requests",
    description: "Ask for a game, a talk, help, or something you want your parent to work on.",
    href: "/child/requests",
    badge: "Send",
  },
  {
    title: "Messages",
    description: "Send and read monitored messages that you choose to share.",
    href: "/child/notifications",
    badge: "Monitored",
  },
  {
    title: "Parent-Child Games",
    description: "Ask for a safe family game or activity with your parent.",
    href: "/child/games",
    badge: "Play",
  },
  {
    title: "Family Challenges",
    description: "Choose a family challenge you would like to try together.",
    href: "/child/family-challenges",
    badge: "Together",
  },
  {
    title: "Weekend Activities",
    description: "Pick a safe weekend activity, routine, or family task.",
    href: "/child/weekend-activities",
    badge: "Weekend",
  },
  {
    title: "Family Calendar",
    description: "Share upcoming visits, activities, family tasks, and future requested games.",
    href: "/child/family-calendar",
    badge: "Plan",
  },
  {
    title: "Shared Items Log",
    description: "See what you chose to share, when you shared it, and who you shared it with.",
    href: "/child/shared-log",
    badge: "Control",
  },
];

export const childCurriculumTracks = [
  {
    title: "Emotional Regulation",
    focus: "Learning how feelings show up in the body and how to calm safely.",
    ageTrack: "All ages with age-specific wording",
  },
  {
    title: "Understanding Feelings",
    focus: "Naming emotions, mixed feelings, worry, sadness, anger, and happiness.",
    ageTrack: "Early childhood, middle childhood, teens",
  },
  {
    title: "Communication Skills",
    focus: "Using words, drawings, choices, and safe adults to express needs.",
    ageTrack: "Child and teen adapted",
  },
  {
    title: "Healthy Boundaries",
    focus: "Learning body boundaries, emotional boundaries, and safe choices.",
    ageTrack: "Age and development matched",
  },
  {
    title: "Safety Skills",
    focus: "Knowing safe people, unsafe feelings, help requests, and safety planning.",
    ageTrack: "All ages",
  },
  {
    title: "Visit Preparation",
    focus: "Preparing feelings, questions, worries, and comfort tools before visits.",
    ageTrack: "All ages",
  },
  {
    title: "Visit Reflection",
    focus: "Reflecting after visits without pressure or adult influence.",
    ageTrack: "All ages",
  },
  {
    title: "Self-Esteem Building",
    focus: "Strengths, achievements, confidence, identity, and hope.",
    ageTrack: "All ages",
  },
  {
    title: "Trauma-Informed Modules",
    focus: "Gentle activities that support safety, choice, control, and expression.",
    ageTrack: "Child-safe wording only",
  },
];

export const childLessons: ChildLesson[] = [
  {
    id: "understanding-my-feelings",
    week: 1,
    title: "Understanding My Feelings",
    description: "A gentle lesson that helps children notice and name feelings without being judged.",
    objectives: [
      "Name at least one feeling.",
      "Understand that all feelings are allowed.",
      "Choose whether to keep the feeling private or share it.",
    ],
    tasks: [
      "Pick a feeling card.",
      "Draw where the feeling lives in your body.",
      "Choose one safe thing that helps.",
    ],
    evidence: [
      "Feeling check-in",
      "Optional drawing",
      "Optional written or voice reflection",
    ],
    sharing: "Child chooses: private, parent, caseworker, or both.",
  },
  {
    id: "safe-people",
    week: 1,
    title: "My Safe People",
    description: "A lesson about identifying people who feel safe, kind, calm, and helpful.",
    objectives: [
      "Identify safe adults.",
      "Know when to ask for help.",
      "Create a safe people list.",
    ],
    tasks: [
      "Choose safe people.",
      "Write or draw what makes them safe.",
      "Pick who can help during big feelings.",
    ],
    evidence: [
      "Safe people list",
      "Optional drawing",
    ],
    sharing: "Private by default. Child may share with a caseworker.",
  },
  {
    id: "before-a-visit",
    week: 2,
    title: "Before a Visit",
    description: "A preparation lesson to help children think about feelings before family contact.",
    objectives: [
      "Name hopes and worries before a visit.",
      "Choose comfort tools.",
      "Decide if anything should be shared before the visit.",
    ],
    tasks: [
      "What am I looking forward to?",
      "What am I worried about?",
      "What would help me feel safe?",
    ],
    evidence: [
      "Visit preparation reflection",
      "Optional help request",
    ],
    sharing: "Child chooses what, if anything, is shared.",
  },
  {
    id: "after-a-visit",
    week: 2,
    title: "After a Visit",
    description: "A reflection lesson that helps children record what went well and what felt hard.",
    objectives: [
      "Reflect on a visit safely.",
      "Name happy, worried, or uncomfortable feelings.",
      "Choose whether adults should know something.",
    ],
    tasks: [
      "What went well?",
      "What felt uncomfortable?",
      "What do I want my parent to work on?",
    ],
    evidence: [
      "Visit reflection",
      "Optional parent improvement request",
    ],
    sharing: "Private unless the child chooses to share.",
  },
  {
    id: "healthy-boundaries",
    week: 3,
    title: "Healthy Boundaries",
    description: "A child-safe lesson about personal space, emotional safety, and saying no.",
    objectives: [
      "Understand that boundaries are allowed.",
      "Know safe ways to say no.",
      "Know who to tell when a boundary feels unsafe.",
    ],
    tasks: [
      "Choose a boundary statement.",
      "Draw a safe space.",
      "Pick a safe adult.",
    ],
    evidence: [
      "Boundary drawing",
      "Optional safe adult request",
    ],
    sharing: "Private by default.",
  },
  {
    id: "what-i-need-adults-to-know",
    week: 4,
    title: "What I Need Adults To Know",
    description: "A lesson that lets children express wishes, worries, hopes, and needs.",
    objectives: [
      "Express one thing adults should understand.",
      "Choose the safest way to express it.",
      "Choose whether to share it.",
    ],
    tasks: [
      "Write, draw, or record a message.",
      "Choose who can see it.",
    ],
    evidence: [
      "Message, drawing, or voice note",
      "Share choice record",
    ],
    sharing: "Child control is absolute.",
  },
];

export const childTasks = [
  {
    title: "Feelings Check-In",
    description: "Choose how you feel today using words, colours, or pictures.",
    privacy: "Private unless shared",
  },
  {
    title: "Drawing Task",
    description: "Draw something about your day, your feelings, or what helps you feel safe.",
    privacy: "Private unless shared",
  },
  {
    title: "Voice Note Task",
    description: "Record a short voice note for yourself or someone safe.",
    privacy: "Child chooses who hears it",
  },
  {
    title: "Safe Photo Task",
    description: "Upload a non-identifying photo, like a drawing, toy, room corner, or comfort item.",
    privacy: "No faces, addresses, school logos, or private details",
  },
  {
    title: "What Made Me Happy Today",
    description: "Record one good thing from today, even if it was small.",
    privacy: "Private unless shared",
  },
  {
    title: "What Made Me Worried Today",
    description: "Record something that felt worrying, confusing, or uncomfortable.",
    privacy: "Private unless shared",
  },
  {
    title: "What I Want My Parent To Work On",
    description: "A child-controlled request about what the parent could do better.",
    privacy: "Share only if child chooses",
  },
];

export const shareOptions = [
  {
    label: "Keep private",
    value: "private",
    description: "Only you and authorised caseworkers can see this.",
  },
  {
    label: "Share with parent",
    value: "parent",
    description: "Your parent can see this item only.",
  },
  {
    label: "Share with caseworker",
    value: "caseworker",
    description: "Your caseworker can see this item.",
  },
  {
    label: "Share with both",
    value: "both",
    description: "Your parent and caseworker can see this item.",
  },
];

export const childRequests = [
  {
    title: "Game Request",
    description: "Ask your parent to play a safe game or activity with you.",
  },
  {
    title: "Talk Request",
    description: "Ask for a calm talk with your parent or safe adult.",
  },
  {
    title: "Help Request",
    description: "Ask a safe adult or caseworker for help.",
  },
  {
    title: "I Shared Something With You",
    description: "Let someone know you chose to share something.",
  },
  {
    title: "I Want You To Work On Something",
    description: "Tell your parent something you would like them to improve.",
  },
];

export const visitPreparationPrompts = [
  "How do I feel about the visit?",
  "What am I looking forward to?",
  "What am I worried about?",
  "What would help me feel calm?",
  "Who can I talk to if I feel upset?",
  "Do I want to share anything before the visit?",
];

export const visitReflectionPrompts = [
  "What went well?",
  "What made me happy?",
  "What felt uncomfortable?",
  "What made me worried?",
  "Did I feel listened to?",
  "What do I want my parent to work on?",
  "Do I want to share this reflection?",
];

export const myStorySections = [
  "My feelings",
  "My drawings",
  "My achievements",
  "My safe people",
  "My hopes",
  "My worries",
  "My visit reflections",
  "My shared items",
];

export const childSafetyRules = [
  "Parents cannot see child curriculum unless the child shares something from it.",
  "Parents cannot see child tasks unless the child shares a completed item.",
  "Parents cannot see child feelings unless the child shares a feeling.",
  "Parents cannot see child evidence unless the child shares that evidence.",
  "Parents cannot see child assessments.",
  "Parents cannot see child visit reflections unless shared.",
  "Parents cannot see child progress.",
  "Caseworkers have full authorised visibility.",
  "Every shared item must record who it was shared with and when.",
  "The child can keep an item private.",
];
