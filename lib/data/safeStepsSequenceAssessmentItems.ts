import type { AssessmentDomain, AssessmentItem, AssessmentResponse } from "../engines/assessmentScoringEngine";

export type SafeStepsSequenceAssessmentItem = {
  id: string;
  domainId: string;
  prompt: string;
  correctSequence: string[];
  scoring: { type: "sequence"; max: number };
  tags: string[];
};

export type SafeStepsSequenceAssessmentResponse = {
  itemId: string;
  sequence: string[];
};

export const safeStepsSequenceAssessmentSlug = "safesteps-sequence-assessment-v1";

export const safeStepsSequenceAssessmentDomains: AssessmentDomain[] = [
  {
    "id": "daily_routine_sequencing",
    "name": "Daily Routine Sequencing",
    "weight": 1
  },
  {
    "id": "safety_procedure_sequencing",
    "name": "Safety Procedure Sequencing",
    "weight": 1
  },
  {
    "id": "emotional_regulation_sequencing",
    "name": "Emotional Regulation Sequencing",
    "weight": 1
  },
  {
    "id": "problem_solving_sequencing",
    "name": "Problem-Solving Sequencing",
    "weight": 1
  },
  {
    "id": "task_completion_sequencing",
    "name": "Task Completion Sequencing",
    "weight": 1
  },
  {
    "id": "health_hygiene_sequencing",
    "name": "Health & Hygiene Sequencing",
    "weight": 1
  },
  {
    "id": "parent_child_interaction_sequencing",
    "name": "Parent–Child Interaction Sequencing",
    "weight": 1
  },
  {
    "id": "boundary_supervision_sequencing",
    "name": "Boundary & Supervision Sequencing",
    "weight": 1
  },
  {
    "id": "school_readiness_sequencing",
    "name": "School Readiness Sequencing",
    "weight": 1
  },
  {
    "id": "communication_sequencing",
    "name": "Communication Sequencing",
    "weight": 1
  },
  {
    "id": "executive_function_sequencing",
    "name": "Executive Function Sequencing",
    "weight": 1
  },
  {
    "id": "risk_recognition_sequencing",
    "name": "Risk Recognition Sequencing",
    "weight": 1
  }
];

export const safeStepsSequenceAssessmentItems: SafeStepsSequenceAssessmentItem[] = [
  {
    "id": "DRS_001",
    "prompt": "Place these morning tasks in the correct order: Eat breakfast, Wake up, Brush teeth.",
    "correctSequence": [
      "Wake up",
      "Eat breakfast",
      "Brush teeth"
    ],
    "tags": [
      "routine",
      "sequencing",
      "daily_living"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_002",
    "prompt": "Order the steps for getting ready to leave the house: Put on shoes, Grab bag, Lock door.",
    "correctSequence": [
      "Grab bag",
      "Put on shoes",
      "Lock door"
    ],
    "tags": [
      "routine",
      "independence"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_003",
    "prompt": "Sequence the bedtime routine: Turn off lights, Brush teeth, Change into pajamas.",
    "correctSequence": [
      "Change into pajamas",
      "Brush teeth",
      "Turn off lights"
    ],
    "tags": [
      "routine",
      "sleep"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_001",
    "prompt": "Order the steps for crossing the street safely: Look both ways, Stop at curb, Walk across.",
    "correctSequence": [
      "Stop at curb",
      "Look both ways",
      "Walk across"
    ],
    "tags": [
      "safety",
      "risk_prevention"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_002",
    "prompt": "Sequence the steps for responding to a fire alarm: Leave building, Stop activity, Follow exit signs.",
    "correctSequence": [
      "Stop activity",
      "Follow exit signs",
      "Leave building"
    ],
    "tags": [
      "emergency",
      "safety"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_003",
    "prompt": "Order the steps for safe handwashing: Rinse hands, Apply soap, Scrub for 20 seconds.",
    "correctSequence": [
      "Apply soap",
      "Scrub for 20 seconds",
      "Rinse hands"
    ],
    "tags": [
      "hygiene",
      "health"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_001",
    "prompt": "Sequence the steps for calming down: Take deep breaths, Notice feelings, Ask for help.",
    "correctSequence": [
      "Notice feelings",
      "Take deep breaths",
      "Ask for help"
    ],
    "tags": [
      "emotional_regulation",
      "coping"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_002",
    "prompt": "Order the steps for resolving conflict: Listen, Explain feelings, Agree on solution.",
    "correctSequence": [
      "Listen",
      "Explain feelings",
      "Agree on solution"
    ],
    "tags": [
      "communication",
      "conflict_resolution"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_003",
    "prompt": "Sequence the steps for managing frustration: Pause, Identify problem, Try a strategy.",
    "correctSequence": [
      "Pause",
      "Identify problem",
      "Try a strategy"
    ],
    "tags": [
      "coping",
      "executive_function"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_001",
    "prompt": "Order the steps for solving a puzzle: Sort pieces, Build edges, Fill middle.",
    "correctSequence": [
      "Sort pieces",
      "Build edges",
      "Fill middle"
    ],
    "tags": [
      "problem_solving",
      "cognition"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_002",
    "prompt": "Sequence the steps for fixing a mistake: Notice error, Remove incorrect part, Try again.",
    "correctSequence": [
      "Notice error",
      "Remove incorrect part",
      "Try again"
    ],
    "tags": [
      "learning",
      "executive_function"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_003",
    "prompt": "Order the steps for planning a task: Decide goal, Gather materials, Start task.",
    "correctSequence": [
      "Decide goal",
      "Gather materials",
      "Start task"
    ],
    "tags": [
      "planning",
      "task_management"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_004",
    "prompt": "Order the steps for preparing breakfast: Take out ingredients, Cook food, Serve meal.",
    "correctSequence": [
      "Take out ingredients",
      "Cook food",
      "Serve meal"
    ],
    "tags": [
      "routine",
      "independence"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_005",
    "prompt": "Sequence the steps for packing a school bag: Gather materials, Place items in bag, Zip bag closed.",
    "correctSequence": [
      "Gather materials",
      "Place items in bag",
      "Zip bag closed"
    ],
    "tags": [
      "school_readiness",
      "organization"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_006",
    "prompt": "Order the steps for starting homework: Clear workspace, Open materials, Begin task.",
    "correctSequence": [
      "Clear workspace",
      "Open materials",
      "Begin task"
    ],
    "tags": [
      "learning",
      "executive_function"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_007",
    "prompt": "Sequence the steps for ending screen time: Pause activity, Turn off device, Put device away.",
    "correctSequence": [
      "Pause activity",
      "Turn off device",
      "Put device away"
    ],
    "tags": [
      "routine",
      "self_regulation"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_008",
    "prompt": "Order the steps for preparing for visitors: Tidy room, Wash hands, Greet guest.",
    "correctSequence": [
      "Tidy room",
      "Wash hands",
      "Greet guest"
    ],
    "tags": [
      "social_skills",
      "routine"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_004",
    "prompt": "Sequence the steps for responding to a stranger at the door: Stay inside, Call trusted adult, Do not open door.",
    "correctSequence": [
      "Stay inside",
      "Do not open door",
      "Call trusted adult"
    ],
    "tags": [
      "safety",
      "supervision"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_005",
    "prompt": "Order the steps for safe bike riding: Put on helmet, Check brakes, Start riding.",
    "correctSequence": [
      "Put on helmet",
      "Check brakes",
      "Start riding"
    ],
    "tags": [
      "safety",
      "transport"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_006",
    "prompt": "Sequence the steps for responding to a minor injury: Stop activity, Assess injury, Tell adult.",
    "correctSequence": [
      "Stop activity",
      "Assess injury",
      "Tell adult"
    ],
    "tags": [
      "health",
      "risk_prevention"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_007",
    "prompt": "Order the steps for safe kitchen use: Wash hands, Prepare tools, Begin cooking.",
    "correctSequence": [
      "Wash hands",
      "Prepare tools",
      "Begin cooking"
    ],
    "tags": [
      "safety",
      "independence"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_008",
    "prompt": "Sequence the steps for safe playground use: Check surroundings, Choose activity, Play safely.",
    "correctSequence": [
      "Check surroundings",
      "Choose activity",
      "Play safely"
    ],
    "tags": [
      "supervision",
      "risk_prevention"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_004",
    "prompt": "Order the steps for expressing feelings: Identify emotion, Choose words, Share with adult.",
    "correctSequence": [
      "Identify emotion",
      "Choose words",
      "Share with adult"
    ],
    "tags": [
      "emotional_regulation",
      "communication"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_005",
    "prompt": "Sequence the steps for calming after conflict: Step back, Breathe slowly, Rejoin calmly.",
    "correctSequence": [
      "Step back",
      "Breathe slowly",
      "Rejoin calmly"
    ],
    "tags": [
      "coping",
      "conflict_resolution"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_006",
    "prompt": "Order the steps for managing disappointment: Acknowledge feeling, Take break, Try again later.",
    "correctSequence": [
      "Acknowledge feeling",
      "Take break",
      "Try again later"
    ],
    "tags": [
      "coping",
      "resilience"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_007",
    "prompt": "Sequence the steps for asking for help: Recognize difficulty, Approach adult, Explain need.",
    "correctSequence": [
      "Recognize difficulty",
      "Approach adult",
      "Explain need"
    ],
    "tags": [
      "communication",
      "self_advocacy"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_008",
    "prompt": "Order the steps for calming before bedtime: Slow activity, Dim lights, Relax quietly.",
    "correctSequence": [
      "Slow activity",
      "Dim lights",
      "Relax quietly"
    ],
    "tags": [
      "sleep",
      "emotional_regulation"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_004",
    "prompt": "Sequence the steps for solving a math problem: Read question, Identify numbers, Solve.",
    "correctSequence": [
      "Read question",
      "Identify numbers",
      "Solve"
    ],
    "tags": [
      "learning",
      "cognition"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_005",
    "prompt": "Order the steps for fixing a broken toy: Inspect damage, Gather tools, Repair.",
    "correctSequence": [
      "Inspect damage",
      "Gather tools",
      "Repair"
    ],
    "tags": [
      "problem_solving",
      "independence"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_006",
    "prompt": "Sequence the steps for planning a project: Brainstorm ideas, Choose plan, Begin work.",
    "correctSequence": [
      "Brainstorm ideas",
      "Choose plan",
      "Begin work"
    ],
    "tags": [
      "planning",
      "task_management"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_007",
    "prompt": "Order the steps for resolving confusion: Pause, Ask question, Clarify.",
    "correctSequence": [
      "Pause",
      "Ask question",
      "Clarify"
    ],
    "tags": [
      "communication",
      "learning"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_008",
    "prompt": "Sequence the steps for organizing materials: Sort items, Group similar items, Store neatly.",
    "correctSequence": [
      "Sort items",
      "Group similar items",
      "Store neatly"
    ],
    "tags": [
      "organization",
      "executive_function"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "TCS_001",
    "prompt": "Order the steps for cleaning a room: Pick up items, Put items away, Check floor.",
    "correctSequence": [
      "Pick up items",
      "Put items away",
      "Check floor"
    ],
    "tags": [
      "routine",
      "independence"
    ],
    "domainId": "task_completion_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "TCS_002",
    "prompt": "Sequence the steps for completing a worksheet: Read instructions, Fill answers, Review work.",
    "correctSequence": [
      "Read instructions",
      "Fill answers",
      "Review work"
    ],
    "tags": [
      "school_readiness",
      "task_management"
    ],
    "domainId": "task_completion_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "TCS_003",
    "prompt": "Order the steps for preparing lunch: Gather ingredients, Assemble food, Pack meal.",
    "correctSequence": [
      "Gather ingredients",
      "Assemble food",
      "Pack meal"
    ],
    "tags": [
      "independence",
      "daily_living"
    ],
    "domainId": "task_completion_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "TCS_004",
    "prompt": "Sequence the steps for finishing chores: Complete task, Put tools away, Report finished.",
    "correctSequence": [
      "Complete task",
      "Put tools away",
      "Report finished"
    ],
    "tags": [
      "responsibility",
      "routine"
    ],
    "domainId": "task_completion_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "TCS_005",
    "prompt": "Order the steps for preparing for bedtime: Change clothes, Brush teeth, Get into bed.",
    "correctSequence": [
      "Change clothes",
      "Brush teeth",
      "Get into bed"
    ],
    "tags": [
      "sleep",
      "routine"
    ],
    "domainId": "task_completion_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "HHS_001",
    "prompt": "Sequence the steps for brushing hair: Pick up brush, Brush from top to bottom, Put brush away.",
    "correctSequence": [
      "Pick up brush",
      "Brush from top to bottom",
      "Put brush away"
    ],
    "tags": [
      "hygiene",
      "independence"
    ],
    "domainId": "health_hygiene_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "HHS_002",
    "prompt": "Order the steps for taking medicine safely: Ask adult, Measure dose, Take medicine.",
    "correctSequence": [
      "Ask adult",
      "Measure dose",
      "Take medicine"
    ],
    "tags": [
      "health",
      "safety"
    ],
    "domainId": "health_hygiene_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "HHS_003",
    "prompt": "Sequence the steps for washing face: Wet face, Apply soap, Rinse.",
    "correctSequence": [
      "Wet face",
      "Apply soap",
      "Rinse"
    ],
    "tags": [
      "hygiene",
      "daily_living"
    ],
    "domainId": "health_hygiene_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "HHS_004",
    "prompt": "Order the steps for trimming nails: Wash hands, Trim nails, Clean up trimmings.",
    "correctSequence": [
      "Wash hands",
      "Trim nails",
      "Clean up trimmings"
    ],
    "tags": [
      "hygiene",
      "safety"
    ],
    "domainId": "health_hygiene_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "HHS_005",
    "prompt": "Sequence the steps for preparing for a doctor visit: Gather documents, Dress appropriately, Arrive on time.",
    "correctSequence": [
      "Gather documents",
      "Dress appropriately",
      "Arrive on time"
    ],
    "tags": [
      "health",
      "planning"
    ],
    "domainId": "health_hygiene_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PCI_001",
    "prompt": "Order the steps for reading together: Choose book, Sit together, Read aloud.",
    "correctSequence": [
      "Choose book",
      "Sit together",
      "Read aloud"
    ],
    "tags": [
      "interaction",
      "bonding"
    ],
    "domainId": "parent_child_interaction_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PCI_002",
    "prompt": "Sequence the steps for helping with homework: Ask what task is, Provide guidance, Review work.",
    "correctSequence": [
      "Ask what task is",
      "Provide guidance",
      "Review work"
    ],
    "tags": [
      "support",
      "learning"
    ],
    "domainId": "parent_child_interaction_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PCI_003",
    "prompt": "Order the steps for teaching a new skill: Demonstrate, Let child try, Give feedback.",
    "correctSequence": [
      "Demonstrate",
      "Let child try",
      "Give feedback"
    ],
    "tags": [
      "teaching",
      "skill_building"
    ],
    "domainId": "parent_child_interaction_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PCI_004",
    "prompt": "Sequence the steps for resolving a disagreement: Listen to child, Explain expectations, Agree on plan.",
    "correctSequence": [
      "Listen to child",
      "Explain expectations",
      "Agree on plan"
    ],
    "tags": [
      "communication",
      "conflict_resolution"
    ],
    "domainId": "parent_child_interaction_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PCI_005",
    "prompt": "Order the steps for planning an activity together: Discuss ideas, Choose activity, Prepare materials.",
    "correctSequence": [
      "Discuss ideas",
      "Choose activity",
      "Prepare materials"
    ],
    "tags": [
      "planning",
      "interaction"
    ],
    "domainId": "parent_child_interaction_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "BSS_001",
    "prompt": "Sequence the steps for setting a limit: State rule, Explain reason, Follow through.",
    "correctSequence": [
      "State rule",
      "Explain reason",
      "Follow through"
    ],
    "tags": [
      "boundaries",
      "supervision"
    ],
    "domainId": "boundary_supervision_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "BSS_002",
    "prompt": "Order the steps for supervising outdoor play: Check area, Set expectations, Monitor activity.",
    "correctSequence": [
      "Check area",
      "Set expectations",
      "Monitor activity"
    ],
    "tags": [
      "safety",
      "supervision"
    ],
    "domainId": "boundary_supervision_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "BSS_003",
    "prompt": "Sequence the steps for enforcing screen-time rules: Give warning, End activity, Redirect child.",
    "correctSequence": [
      "Give warning",
      "End activity",
      "Redirect child"
    ],
    "tags": [
      "boundaries",
      "routine"
    ],
    "domainId": "boundary_supervision_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "BSS_004",
    "prompt": "Order the steps for safe tool use: Explain rules, Demonstrate use, Supervise closely.",
    "correctSequence": [
      "Explain rules",
      "Demonstrate use",
      "Supervise closely"
    ],
    "tags": [
      "safety",
      "supervision"
    ],
    "domainId": "boundary_supervision_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "BSS_005",
    "prompt": "Sequence the steps for managing risky behavior: Notice behavior, Intervene calmly, Redirect safely.",
    "correctSequence": [
      "Notice behavior",
      "Intervene calmly",
      "Redirect safely"
    ],
    "tags": [
      "risk_prevention",
      "supervision"
    ],
    "domainId": "boundary_supervision_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SRS_001",
    "prompt": "Order the steps for starting a school day: Hang bag, Sit at desk, Begin work.",
    "correctSequence": [
      "Hang bag",
      "Sit at desk",
      "Begin work"
    ],
    "tags": [
      "school_readiness",
      "routine"
    ],
    "domainId": "school_readiness_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SRS_002",
    "prompt": "Sequence the steps for preparing homework: Gather materials, Read instructions, Start task.",
    "correctSequence": [
      "Gather materials",
      "Read instructions",
      "Start task"
    ],
    "tags": [
      "learning",
      "organization"
    ],
    "domainId": "school_readiness_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SRS_003",
    "prompt": "Order the steps for participating in group work: Listen to peers, Share ideas, Complete task together.",
    "correctSequence": [
      "Listen to peers",
      "Share ideas",
      "Complete task together"
    ],
    "tags": [
      "social_skills",
      "collaboration"
    ],
    "domainId": "school_readiness_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SRS_004",
    "prompt": "Sequence the steps for preparing for recess: Put away materials, Line up, Walk outside.",
    "correctSequence": [
      "Put away materials",
      "Line up",
      "Walk outside"
    ],
    "tags": [
      "routine",
      "school_readiness"
    ],
    "domainId": "school_readiness_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SRS_005",
    "prompt": "Order the steps for completing a reading assignment: Choose book, Read pages, Answer questions.",
    "correctSequence": [
      "Choose book",
      "Read pages",
      "Answer questions"
    ],
    "tags": [
      "learning",
      "literacy"
    ],
    "domainId": "school_readiness_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "CMS_001",
    "prompt": "Sequence the steps for asking a question: Think of topic, Raise hand, Speak clearly.",
    "correctSequence": [
      "Think of topic",
      "Raise hand",
      "Speak clearly"
    ],
    "tags": [
      "communication",
      "school_readiness"
    ],
    "domainId": "communication_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "CMS_002",
    "prompt": "Order the steps for giving instructions: Get attention, Explain steps, Check understanding.",
    "correctSequence": [
      "Get attention",
      "Explain steps",
      "Check understanding"
    ],
    "tags": [
      "communication",
      "clarity"
    ],
    "domainId": "communication_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "CMS_003",
    "prompt": "Sequence the steps for telling a story: Introduce characters, Describe events, End clearly.",
    "correctSequence": [
      "Introduce characters",
      "Describe events",
      "End clearly"
    ],
    "tags": [
      "communication",
      "language"
    ],
    "domainId": "communication_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "CMS_004",
    "prompt": "Order the steps for resolving confusion: Ask for clarification, Listen to response, Repeat understanding.",
    "correctSequence": [
      "Ask for clarification",
      "Listen to response",
      "Repeat understanding"
    ],
    "tags": [
      "communication",
      "learning"
    ],
    "domainId": "communication_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "CMS_005",
    "prompt": "Sequence the steps for giving feedback: Notice behavior, Describe impact, Suggest improvement.",
    "correctSequence": [
      "Notice behavior",
      "Describe impact",
      "Suggest improvement"
    ],
    "tags": [
      "communication",
      "social_skills"
    ],
    "domainId": "communication_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "EFS_001",
    "prompt": "Order the steps for organizing a desk: Remove clutter, Sort items, Place items neatly.",
    "correctSequence": [
      "Remove clutter",
      "Sort items",
      "Place items neatly"
    ],
    "tags": [
      "organization",
      "executive_function"
    ],
    "domainId": "executive_function_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "EFS_002",
    "prompt": "Sequence the steps for planning a task: Identify goal, Break into steps, Begin first step.",
    "correctSequence": [
      "Identify goal",
      "Break into steps",
      "Begin first step"
    ],
    "tags": [
      "planning",
      "task_management"
    ],
    "domainId": "executive_function_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "EFS_003",
    "prompt": "Order the steps for managing time: Check schedule, Prioritize tasks, Start highest priority.",
    "correctSequence": [
      "Check schedule",
      "Prioritize tasks",
      "Start highest priority"
    ],
    "tags": [
      "time_management",
      "executive_function"
    ],
    "domainId": "executive_function_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "EFS_004",
    "prompt": "Sequence the steps for completing a multi-step project: Plan steps, Gather materials, Work through steps.",
    "correctSequence": [
      "Plan steps",
      "Gather materials",
      "Work through steps"
    ],
    "tags": [
      "planning",
      "execution"
    ],
    "domainId": "executive_function_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "EFS_005",
    "prompt": "Order the steps for checking work: Finish task, Review details, Correct mistakes.",
    "correctSequence": [
      "Finish task",
      "Review details",
      "Correct mistakes"
    ],
    "tags": [
      "quality_control",
      "executive_function"
    ],
    "domainId": "executive_function_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "RRS_001",
    "prompt": "Sequence the steps for identifying danger: Notice unusual situation, Assess risk, Move to safety.",
    "correctSequence": [
      "Notice unusual situation",
      "Assess risk",
      "Move to safety"
    ],
    "tags": [
      "risk",
      "safety"
    ],
    "domainId": "risk_recognition_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "RRS_002",
    "prompt": "Order the steps for responding to unsafe behavior: Stop behavior, Explain risk, Redirect safely.",
    "correctSequence": [
      "Stop behavior",
      "Explain risk",
      "Redirect safely"
    ],
    "tags": [
      "supervision",
      "risk_prevention"
    ],
    "domainId": "risk_recognition_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "RRS_003",
    "prompt": "Sequence the steps for avoiding hazards: Identify hazard, Move away, Inform adult.",
    "correctSequence": [
      "Identify hazard",
      "Move away",
      "Inform adult"
    ],
    "tags": [
      "safety",
      "risk"
    ],
    "domainId": "risk_recognition_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "RRS_004",
    "prompt": "Order the steps for responding to unsafe weather: Notice warning, Go indoors, Stay away from windows.",
    "correctSequence": [
      "Notice warning",
      "Go indoors",
      "Stay away from windows"
    ],
    "tags": [
      "weather",
      "safety"
    ],
    "domainId": "risk_recognition_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "RRS_005",
    "prompt": "Sequence the steps for staying safe around animals: Observe behavior, Keep distance, Ask adult before approaching.",
    "correctSequence": [
      "Observe behavior",
      "Keep distance",
      "Ask adult before approaching"
    ],
    "tags": [
      "animals",
      "risk_prevention"
    ],
    "domainId": "risk_recognition_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_009",
    "prompt": "Order the steps for preparing for a walk: Put on shoes, Grab water bottle, Leave house.",
    "correctSequence": [
      "Put on shoes",
      "Grab water bottle",
      "Leave house"
    ],
    "tags": [
      "routine",
      "independence"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_010",
    "prompt": "Sequence the steps for starting chores: Choose chore, Gather supplies, Begin task.",
    "correctSequence": [
      "Choose chore",
      "Gather supplies",
      "Begin task"
    ],
    "tags": [
      "responsibility",
      "routine"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_011",
    "prompt": "Order the steps for ending playtime: Clean toys, Put toys away, Wash hands.",
    "correctSequence": [
      "Clean toys",
      "Put toys away",
      "Wash hands"
    ],
    "tags": [
      "routine",
      "organization"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_012",
    "prompt": "Sequence the steps for preparing for dinner: Set table, Sit down, Wait for food.",
    "correctSequence": [
      "Set table",
      "Sit down",
      "Wait for food"
    ],
    "tags": [
      "routine",
      "family"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_013",
    "prompt": "Order the steps for getting ready for sports: Change clothes, Pack gear, Head to practice.",
    "correctSequence": [
      "Change clothes",
      "Pack gear",
      "Head to practice"
    ],
    "tags": [
      "routine",
      "sports"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_009",
    "prompt": "Sequence the steps for safe swimming: Enter slowly, Stay near adult, Follow pool rules.",
    "correctSequence": [
      "Enter slowly",
      "Stay near adult",
      "Follow pool rules"
    ],
    "tags": [
      "safety",
      "water"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_010",
    "prompt": "Order the steps for safe pet interaction: Approach calmly, Let pet sniff, Pet gently.",
    "correctSequence": [
      "Approach calmly",
      "Let pet sniff",
      "Pet gently"
    ],
    "tags": [
      "animals",
      "safety"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_011",
    "prompt": "Sequence the steps for safe cooking: Tie hair back, Wash hands, Begin cooking.",
    "correctSequence": [
      "Tie hair back",
      "Wash hands",
      "Begin cooking"
    ],
    "tags": [
      "kitchen",
      "safety"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_012",
    "prompt": "Order the steps for responding to loud noises: Pause activity, Look for adult, Follow instructions.",
    "correctSequence": [
      "Pause activity",
      "Look for adult",
      "Follow instructions"
    ],
    "tags": [
      "safety",
      "emergency"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_013",
    "prompt": "Sequence the steps for safe climbing: Check structure, Use both hands, Climb slowly.",
    "correctSequence": [
      "Check structure",
      "Use both hands",
      "Climb slowly"
    ],
    "tags": [
      "playground",
      "risk_prevention"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_009",
    "prompt": "Order the steps for calming after excitement: Sit down, Take deep breaths, Speak calmly.",
    "correctSequence": [
      "Sit down",
      "Take deep breaths",
      "Speak calmly"
    ],
    "tags": [
      "emotional_regulation",
      "calming"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_010",
    "prompt": "Sequence the steps for managing anger: Pause, Identify trigger, Choose coping strategy.",
    "correctSequence": [
      "Pause",
      "Identify trigger",
      "Choose coping strategy"
    ],
    "tags": [
      "anger_management",
      "coping"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_011",
    "prompt": "Order the steps for expressing gratitude: Notice kindness, Think of words, Say thank you.",
    "correctSequence": [
      "Notice kindness",
      "Think of words",
      "Say thank you"
    ],
    "tags": [
      "gratitude",
      "social_skills"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_012",
    "prompt": "Sequence the steps for calming before school: Eat breakfast, Take deep breaths, Walk calmly.",
    "correctSequence": [
      "Eat breakfast",
      "Take deep breaths",
      "Walk calmly"
    ],
    "tags": [
      "routine",
      "emotional_regulation"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_013",
    "prompt": "Order the steps for managing embarrassment: Pause, Take breath, Talk to trusted adult.",
    "correctSequence": [
      "Pause",
      "Take breath",
      "Talk to trusted adult"
    ],
    "tags": [
      "coping",
      "communication"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_009",
    "prompt": "Sequence the steps for fixing a messy backpack: Empty items, Sort items, Put items back neatly.",
    "correctSequence": [
      "Empty items",
      "Sort items",
      "Put items back neatly"
    ],
    "tags": [
      "organization",
      "problem_solving"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_010",
    "prompt": "Order the steps for solving a disagreement with a friend: Listen, Share feelings, Find solution.",
    "correctSequence": [
      "Listen",
      "Share feelings",
      "Find solution"
    ],
    "tags": [
      "conflict_resolution",
      "communication"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_011",
    "prompt": "Sequence the steps for fixing a drawing mistake: Erase gently, Redraw, Check result.",
    "correctSequence": [
      "Erase gently",
      "Redraw",
      "Check result"
    ],
    "tags": [
      "learning",
      "problem_solving"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_012",
    "prompt": "Order the steps for solving a maze: Start at entrance, Follow path, Reach exit.",
    "correctSequence": [
      "Start at entrance",
      "Follow path",
      "Reach exit"
    ],
    "tags": [
      "cognition",
      "problem_solving"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_013",
    "prompt": "Sequence the steps for planning a craft: Choose idea, Gather materials, Begin creating.",
    "correctSequence": [
      "Choose idea",
      "Gather materials",
      "Begin creating"
    ],
    "tags": [
      "planning",
      "creativity"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "TCS_006",
    "prompt": "Order the steps for finishing a puzzle: Place final pieces, Check picture, Put puzzle away.",
    "correctSequence": [
      "Place final pieces",
      "Check picture",
      "Put puzzle away"
    ],
    "tags": [
      "task_completion",
      "organization"
    ],
    "domainId": "task_completion_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "TCS_007",
    "prompt": "Sequence the steps for cleaning a table: Clear items, Wipe surface, Dry surface.",
    "correctSequence": [
      "Clear items",
      "Wipe surface",
      "Dry surface"
    ],
    "tags": [
      "cleaning",
      "routine"
    ],
    "domainId": "task_completion_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "TCS_008",
    "prompt": "Order the steps for finishing homework: Complete tasks, Review answers, Pack materials.",
    "correctSequence": [
      "Complete tasks",
      "Review answers",
      "Pack materials"
    ],
    "tags": [
      "school_readiness",
      "task_management"
    ],
    "domainId": "task_completion_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "TCS_009",
    "prompt": "Sequence the steps for organizing toys: Sort toys, Place in bins, Close lids.",
    "correctSequence": [
      "Sort toys",
      "Place in bins",
      "Close lids"
    ],
    "tags": [
      "organization",
      "routine"
    ],
    "domainId": "task_completion_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "TCS_010",
    "prompt": "Order the steps for finishing a meal: Eat food, Clear plate, Wash hands.",
    "correctSequence": [
      "Eat food",
      "Clear plate",
      "Wash hands"
    ],
    "tags": [
      "routine",
      "daily_living"
    ],
    "domainId": "task_completion_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "HHS_006",
    "prompt": "Sequence the steps for brushing teeth at night: Apply toothpaste, Brush thoroughly, Rinse mouth.",
    "correctSequence": [
      "Apply toothpaste",
      "Brush thoroughly",
      "Rinse mouth"
    ],
    "tags": [
      "hygiene",
      "routine"
    ],
    "domainId": "health_hygiene_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "HHS_007",
    "prompt": "Order the steps for washing hands after play: Turn on water, Apply soap, Scrub hands.",
    "correctSequence": [
      "Turn on water",
      "Apply soap",
      "Scrub hands"
    ],
    "tags": [
      "hygiene",
      "health"
    ],
    "domainId": "health_hygiene_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "HHS_008",
    "prompt": "Sequence the steps for getting ready for a bath: Gather towel, Turn on water, Get in tub.",
    "correctSequence": [
      "Gather towel",
      "Turn on water",
      "Get in tub"
    ],
    "tags": [
      "hygiene",
      "routine"
    ],
    "domainId": "health_hygiene_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "BSS_006",
    "prompt": "Order the steps for supervising indoor play: Set rules, Check space, Monitor activity.",
    "correctSequence": [
      "Set rules",
      "Check space",
      "Monitor activity"
    ],
    "tags": [
      "supervision",
      "boundaries"
    ],
    "domainId": "boundary_supervision_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "BSS_007",
    "prompt": "Sequence the steps for enforcing bedtime rules: Give reminder, Guide child to room, Turn off lights.",
    "correctSequence": [
      "Give reminder",
      "Guide child to room",
      "Turn off lights"
    ],
    "tags": [
      "routine",
      "boundaries"
    ],
    "domainId": "boundary_supervision_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "BSS_008",
    "prompt": "Order the steps for managing unsafe objects: Identify hazard, Remove object, Explain rule.",
    "correctSequence": [
      "Identify hazard",
      "Remove object",
      "Explain rule"
    ],
    "tags": [
      "safety",
      "supervision"
    ],
    "domainId": "boundary_supervision_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "BSS_009",
    "prompt": "Sequence the steps for supervising group play: Set expectations, Watch interactions, Intervene if needed.",
    "correctSequence": [
      "Set expectations",
      "Watch interactions",
      "Intervene if needed"
    ],
    "tags": [
      "supervision",
      "social_skills"
    ],
    "domainId": "boundary_supervision_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "BSS_010",
    "prompt": "Order the steps for enforcing outdoor boundaries: Point out limits, Explain why, Check compliance.",
    "correctSequence": [
      "Point out limits",
      "Explain why",
      "Check compliance"
    ],
    "tags": [
      "boundaries",
      "safety"
    ],
    "domainId": "boundary_supervision_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SRS_006",
    "prompt": "Sequence the steps for preparing for a test: Review notes, Practice problems, Rest well.",
    "correctSequence": [
      "Review notes",
      "Practice problems",
      "Rest well"
    ],
    "tags": [
      "learning",
      "school_readiness"
    ],
    "domainId": "school_readiness_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SRS_007",
    "prompt": "Order the steps for starting a writing assignment: Brainstorm ideas, Write draft, Review writing.",
    "correctSequence": [
      "Brainstorm ideas",
      "Write draft",
      "Review writing"
    ],
    "tags": [
      "literacy",
      "planning"
    ],
    "domainId": "school_readiness_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SRS_008",
    "prompt": "Sequence the steps for preparing for art class: Gather supplies, Put on apron, Begin project.",
    "correctSequence": [
      "Gather supplies",
      "Put on apron",
      "Begin project"
    ],
    "tags": [
      "school_readiness",
      "creativity"
    ],
    "domainId": "school_readiness_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SRS_009",
    "prompt": "Order the steps for joining group time: Sit quietly, Listen to teacher, Participate.",
    "correctSequence": [
      "Sit quietly",
      "Listen to teacher",
      "Participate"
    ],
    "tags": [
      "school_readiness",
      "social_skills"
    ],
    "domainId": "school_readiness_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SRS_010",
    "prompt": "Sequence the steps for preparing for dismissal: Pack materials, Line up, Exit calmly.",
    "correctSequence": [
      "Pack materials",
      "Line up",
      "Exit calmly"
    ],
    "tags": [
      "routine",
      "school_readiness"
    ],
    "domainId": "school_readiness_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "CMS_006",
    "prompt": "Order the steps for making a request: Approach adult, Use polite words, Wait for response.",
    "correctSequence": [
      "Approach adult",
      "Use polite words",
      "Wait for response"
    ],
    "tags": [
      "communication",
      "social_skills"
    ],
    "domainId": "communication_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "CMS_007",
    "prompt": "Sequence the steps for explaining a problem: Describe issue, Share feelings, Ask for help.",
    "correctSequence": [
      "Describe issue",
      "Share feelings",
      "Ask for help"
    ],
    "tags": [
      "communication",
      "self_advocacy"
    ],
    "domainId": "communication_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "CMS_008",
    "prompt": "Order the steps for giving a compliment: Notice something positive, Choose words, Say compliment.",
    "correctSequence": [
      "Notice something positive",
      "Choose words",
      "Say compliment"
    ],
    "tags": [
      "social_skills",
      "communication"
    ],
    "domainId": "communication_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "CMS_009",
    "prompt": "Sequence the steps for responding to instructions: Listen carefully, Ask questions, Follow steps.",
    "correctSequence": [
      "Listen carefully",
      "Ask questions",
      "Follow steps"
    ],
    "tags": [
      "communication",
      "learning"
    ],
    "domainId": "communication_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_019",
    "prompt": "Order the steps for preparing for a video call: Set device, Check sound, Join meeting.",
    "correctSequence": [
      "Set device",
      "Check sound",
      "Join meeting"
    ],
    "tags": [
      "routine",
      "technology"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_020",
    "prompt": "Sequence the steps for ending homework time: Finish tasks, Pack materials, Clean workspace.",
    "correctSequence": [
      "Finish tasks",
      "Pack materials",
      "Clean workspace"
    ],
    "tags": [
      "routine",
      "organization"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_021",
    "prompt": "Order the steps for preparing for a car ride: Put on shoes, Grab bag, Buckle seatbelt.",
    "correctSequence": [
      "Put on shoes",
      "Grab bag",
      "Buckle seatbelt"
    ],
    "tags": [
      "routine",
      "transport"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_022",
    "prompt": "Sequence the steps for starting chores: Choose chore, Gather tools, Begin task.",
    "correctSequence": [
      "Choose chore",
      "Gather tools",
      "Begin task"
    ],
    "tags": [
      "responsibility",
      "routine"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "DRS_023",
    "prompt": "Order the steps for ending the day: Put away toys, Change clothes, Go to bed.",
    "correctSequence": [
      "Put away toys",
      "Change clothes",
      "Go to bed"
    ],
    "tags": [
      "sleep",
      "routine"
    ],
    "domainId": "daily_routine_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_019",
    "prompt": "Sequence the steps for safe oven use: Turn on oven, Use mitts, Place food inside.",
    "correctSequence": [
      "Turn on oven",
      "Use mitts",
      "Place food inside"
    ],
    "tags": [
      "kitchen",
      "safety"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_020",
    "prompt": "Order the steps for responding to a loud alarm: Stop activity, Look for adult, Follow instructions.",
    "correctSequence": [
      "Stop activity",
      "Look for adult",
      "Follow instructions"
    ],
    "tags": [
      "emergency",
      "safety"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_021",
    "prompt": "Sequence the steps for safe bike riding: Put on helmet, Check brakes, Ride carefully.",
    "correctSequence": [
      "Put on helmet",
      "Check brakes",
      "Ride carefully"
    ],
    "tags": [
      "transport",
      "safety"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_022",
    "prompt": "Order the steps for safe swimming: Enter slowly, Stay near adult, Follow pool rules.",
    "correctSequence": [
      "Enter slowly",
      "Stay near adult",
      "Follow pool rules"
    ],
    "tags": [
      "water_safety",
      "risk_prevention"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SPS_023",
    "prompt": "Sequence the steps for responding to a spill: Stop movement, Tell adult, Clean safely.",
    "correctSequence": [
      "Stop movement",
      "Tell adult",
      "Clean safely"
    ],
    "tags": [
      "risk_prevention",
      "safety"
    ],
    "domainId": "safety_procedure_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_019",
    "prompt": "Order the steps for calming after excitement: Sit down, Take deep breaths, Speak calmly.",
    "correctSequence": [
      "Sit down",
      "Take deep breaths",
      "Speak calmly"
    ],
    "tags": [
      "emotional_regulation",
      "calming"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_020",
    "prompt": "Sequence the steps for managing anger: Pause, Identify trigger, Choose coping strategy.",
    "correctSequence": [
      "Pause",
      "Identify trigger",
      "Choose coping strategy"
    ],
    "tags": [
      "anger_management",
      "coping"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_021",
    "prompt": "Order the steps for expressing gratitude: Notice kindness, Think of words, Say thank you.",
    "correctSequence": [
      "Notice kindness",
      "Think of words",
      "Say thank you"
    ],
    "tags": [
      "gratitude",
      "social_skills"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_022",
    "prompt": "Sequence the steps for calming before school: Eat breakfast, Take deep breaths, Walk calmly.",
    "correctSequence": [
      "Eat breakfast",
      "Take deep breaths",
      "Walk calmly"
    ],
    "tags": [
      "routine",
      "emotional_regulation"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "ERS_023",
    "prompt": "Order the steps for managing embarrassment: Pause, Take breath, Talk to trusted adult.",
    "correctSequence": [
      "Pause",
      "Take breath",
      "Talk to trusted adult"
    ],
    "tags": [
      "coping",
      "communication"
    ],
    "domainId": "emotional_regulation_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_018",
    "prompt": "Sequence the steps for fixing a messy backpack: Empty items, Sort items, Put items back neatly.",
    "correctSequence": [
      "Empty items",
      "Sort items",
      "Put items back neatly"
    ],
    "tags": [
      "organization",
      "problem_solving"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_019",
    "prompt": "Order the steps for solving a disagreement with a friend: Listen, Share feelings, Find solution.",
    "correctSequence": [
      "Listen",
      "Share feelings",
      "Find solution"
    ],
    "tags": [
      "conflict_resolution",
      "communication"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_020",
    "prompt": "Sequence the steps for fixing a drawing mistake: Erase gently, Redraw, Check result.",
    "correctSequence": [
      "Erase gently",
      "Redraw",
      "Check result"
    ],
    "tags": [
      "learning",
      "problem_solving"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_021",
    "prompt": "Order the steps for solving a maze: Start at entrance, Follow path, Reach exit.",
    "correctSequence": [
      "Start at entrance",
      "Follow path",
      "Reach exit"
    ],
    "tags": [
      "cognition",
      "problem_solving"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PSS_022",
    "prompt": "Sequence the steps for planning a craft: Choose idea, Gather materials, Begin creating.",
    "correctSequence": [
      "Choose idea",
      "Gather materials",
      "Begin creating"
    ],
    "tags": [
      "planning",
      "creativity"
    ],
    "domainId": "problem_solving_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "TCS_011",
    "prompt": "Order the steps for finishing a puzzle: Place final pieces, Check picture, Put puzzle away.",
    "correctSequence": [
      "Place final pieces",
      "Check picture",
      "Put puzzle away"
    ],
    "tags": [
      "task_completion",
      "organization"
    ],
    "domainId": "task_completion_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "TCS_012",
    "prompt": "Sequence the steps for cleaning a table: Clear items, Wipe surface, Dry surface.",
    "correctSequence": [
      "Clear items",
      "Wipe surface",
      "Dry surface"
    ],
    "tags": [
      "cleaning",
      "routine"
    ],
    "domainId": "task_completion_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "TCS_013",
    "prompt": "Order the steps for finishing homework: Complete tasks, Review answers, Pack materials.",
    "correctSequence": [
      "Complete tasks",
      "Review answers",
      "Pack materials"
    ],
    "tags": [
      "school_readiness",
      "task_management"
    ],
    "domainId": "task_completion_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "TCS_014",
    "prompt": "Sequence the steps for organizing toys: Sort toys, Place in bins, Close lids.",
    "correctSequence": [
      "Sort toys",
      "Place in bins",
      "Close lids"
    ],
    "tags": [
      "organization",
      "routine"
    ],
    "domainId": "task_completion_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "TCS_015",
    "prompt": "Order the steps for finishing a meal: Eat food, Clear plate, Wash hands.",
    "correctSequence": [
      "Eat food",
      "Clear plate",
      "Wash hands"
    ],
    "tags": [
      "routine",
      "daily_living"
    ],
    "domainId": "task_completion_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "HHS_011",
    "prompt": "Sequence the steps for brushing teeth at night: Apply toothpaste, Brush thoroughly, Rinse mouth.",
    "correctSequence": [
      "Apply toothpaste",
      "Brush thoroughly",
      "Rinse mouth"
    ],
    "tags": [
      "hygiene",
      "routine"
    ],
    "domainId": "health_hygiene_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "HHS_012",
    "prompt": "Order the steps for washing hands after play: Turn on water, Apply soap, Scrub hands.",
    "correctSequence": [
      "Turn on water",
      "Apply soap",
      "Scrub hands"
    ],
    "tags": [
      "hygiene",
      "health"
    ],
    "domainId": "health_hygiene_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "HHS_013",
    "prompt": "Sequence the steps for getting ready for a bath: Gather towel, Turn on water, Get in tub.",
    "correctSequence": [
      "Gather towel",
      "Turn on water",
      "Get in tub"
    ],
    "tags": [
      "hygiene",
      "routine"
    ],
    "domainId": "health_hygiene_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "HHS_014",
    "prompt": "Order the steps for caring for a cut: Clean cut, Apply bandage, Tell adult.",
    "correctSequence": [
      "Clean cut",
      "Apply bandage",
      "Tell adult"
    ],
    "tags": [
      "health",
      "safety"
    ],
    "domainId": "health_hygiene_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "HHS_015",
    "prompt": "Sequence the steps for preparing for sleep: Change clothes, Brush teeth, Turn off lights.",
    "correctSequence": [
      "Change clothes",
      "Brush teeth",
      "Turn off lights"
    ],
    "tags": [
      "sleep",
      "routine"
    ],
    "domainId": "health_hygiene_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PCI_011",
    "prompt": "Order the steps for practicing a skill together: Choose skill, Practice slowly, Celebrate progress.",
    "correctSequence": [
      "Choose skill",
      "Practice slowly",
      "Celebrate progress"
    ],
    "tags": [
      "interaction",
      "learning"
    ],
    "domainId": "parent_child_interaction_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PCI_012",
    "prompt": "Sequence the steps for preparing for an outing: Discuss plan, Pack items, Leave together.",
    "correctSequence": [
      "Discuss plan",
      "Pack items",
      "Leave together"
    ],
    "tags": [
      "planning",
      "family"
    ],
    "domainId": "parent_child_interaction_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PCI_013",
    "prompt": "Order the steps for helping child calm down: Sit together, Speak softly, Guide breathing.",
    "correctSequence": [
      "Sit together",
      "Speak softly",
      "Guide breathing"
    ],
    "tags": [
      "emotional_support",
      "interaction"
    ],
    "domainId": "parent_child_interaction_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PCI_014",
    "prompt": "Sequence the steps for teaching responsibility: Explain task, Demonstrate steps, Supervise completion.",
    "correctSequence": [
      "Explain task",
      "Demonstrate steps",
      "Supervise completion"
    ],
    "tags": [
      "responsibility",
      "teaching"
    ],
    "domainId": "parent_child_interaction_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "PCI_015",
    "prompt": "Order the steps for preparing for bedtime together: Read story, Talk quietly, Turn off lights.",
    "correctSequence": [
      "Read story",
      "Talk quietly",
      "Turn off lights"
    ],
    "tags": [
      "bonding",
      "routine"
    ],
    "domainId": "parent_child_interaction_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "BSS_011",
    "prompt": "Order the steps for supervising outdoor play: Check area, Set expectations, Monitor activity.",
    "correctSequence": [
      "Check area",
      "Set expectations",
      "Monitor activity"
    ],
    "tags": [
      "supervision",
      "safety"
    ],
    "domainId": "boundary_supervision_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "BSS_012",
    "prompt": "Sequence the steps for enforcing screen-time rules: Give warning, End activity, Redirect child.",
    "correctSequence": [
      "Give warning",
      "End activity",
      "Redirect child"
    ],
    "tags": [
      "boundaries",
      "routine"
    ],
    "domainId": "boundary_supervision_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "BSS_013",
    "prompt": "Order the steps for managing risky behavior: Notice behavior, Intervene calmly, Redirect safely.",
    "correctSequence": [
      "Notice behavior",
      "Intervene calmly",
      "Redirect safely"
    ],
    "tags": [
      "risk_prevention",
      "supervision"
    ],
    "domainId": "boundary_supervision_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "BSS_014",
    "prompt": "Sequence the steps for setting a limit: State rule, Explain reason, Follow through.",
    "correctSequence": [
      "State rule",
      "Explain reason",
      "Follow through"
    ],
    "tags": [
      "boundaries",
      "supervision"
    ],
    "domainId": "boundary_supervision_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "BSS_015",
    "prompt": "Order the steps for supervising group play: Set expectations, Watch interactions, Intervene if needed.",
    "correctSequence": [
      "Set expectations",
      "Watch interactions",
      "Intervene if needed"
    ],
    "tags": [
      "supervision",
      "social_skills"
    ],
    "domainId": "boundary_supervision_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SRS_011",
    "prompt": "Sequence the steps for preparing for a test: Review notes, Practice problems, Rest well.",
    "correctSequence": [
      "Review notes",
      "Practice problems",
      "Rest well"
    ],
    "tags": [
      "learning",
      "school_readiness"
    ],
    "domainId": "school_readiness_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SRS_012",
    "prompt": "Order the steps for starting a writing assignment: Brainstorm ideas, Write draft, Review writing.",
    "correctSequence": [
      "Brainstorm ideas",
      "Write draft",
      "Review writing"
    ],
    "tags": [
      "literacy",
      "planning"
    ],
    "domainId": "school_readiness_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  },
  {
    "id": "SRS_013",
    "prompt": "Sequence the steps for preparing for art class: Gather supplies, Put on apron, Begin project.",
    "correctSequence": [
      "Gather supplies",
      "Put on apron",
      "Begin project"
    ],
    "tags": [
      "school_readiness",
      "creativity"
    ],
    "domainId": "school_readiness_sequencing",
    "scoring": {
      "type": "sequence",
      "max": 3
    }
  }
];

export function scoreSequenceItem(item: SafeStepsSequenceAssessmentItem, sequence: string[]) {
  return item.correctSequence.reduce((score, expectedStep, index) => score + (sequence[index] === expectedStep ? 1 : 0), 0);
}

export function toSequenceAssessmentScoringItems(): AssessmentItem[] {
  return safeStepsSequenceAssessmentItems.map((item) => ({
    id: item.id,
    domainId: item.domainId,
    itemType: "numeric",
    weight: 1,
    maxValue: item.scoring.max,
  }));
}

export function toSequenceAssessmentScoringResponses(
  responses: SafeStepsSequenceAssessmentResponse[],
): AssessmentResponse[] {
  const responseByItem = new Map(responses.map((response) => [response.itemId, response]));

  return safeStepsSequenceAssessmentItems.map((item) => ({
    itemId: item.id,
    numericValue: scoreSequenceItem(item, responseByItem.get(item.id)?.sequence ?? []),
  }));
}
