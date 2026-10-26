export type SequencePracticeDomainContent = {
  summary: string;
  reflection: string;
};

export const sequencePracticeDomainContent: Record<string, SequencePracticeDomainContent> = {
  daily_routine_sequencing: {
    summary: "Everyday routines can help children know what to expect while leaving room for individual needs.",
    reflection: "Which part of this routine could be adapted to your child's age, preferences, or energy today?",
  },
  safety_procedure_sequencing: {
    summary: "Safety steps depend on the actual setting, the child's needs, and instructions from local services.",
    reflection: "Would any step change because of mobility, communication, supervision, or the specific place?",
  },
  emotional_regulation_sequencing: {
    summary: "A calm adult response can make room for safety, connection, and support without demanding that a child feel calm immediately.",
    reflection: "What might help you notice stress early and make the next moment safer?",
  },
  problem_solving_sequencing: {
    summary: "Problem solving often includes understanding what happened, considering needs, and choosing a workable next step.",
    reflection: "What information or perspective might you want to hear before deciding what to try?",
  },
  task_completion_sequencing: {
    summary: "Breaking a task into smaller steps can make it easier to begin, continue, or ask for help.",
    reflection: "Which step could be made smaller or supported if the task feels difficult?",
  },
  health_hygiene_sequencing: {
    summary: "Health and hygiene routines should fit the person's age, access needs, culture, and relevant professional advice.",
    reflection: "What would make this routine comfortable and accessible for the person doing it?",
  },
  parent_child_interaction_sequencing: {
    summary: "Shared activities work best when children can communicate comfort, interest, and boundaries.",
    reflection: "How could you check whether your child wants to continue, change the activity, or take a break?",
  },
  boundary_supervision_sequencing: {
    summary: "Clear limits and active supervision should be respectful and matched to the child's situation.",
    reflection: "What would help you set the limit calmly while keeping the child safe and heard?",
  },
  school_readiness_sequencing: {
    summary: "School routines vary by child, family, school requirements, and available support.",
    reflection: "Which part can be prepared together, and where might the child need flexibility or help?",
  },
  communication_sequencing: {
    summary: "Good communication allows time to listen, check understanding, and choose a response without pressure.",
    reflection: "What could you ask to understand the other person's meaning before responding?",
  },
  executive_function_sequencing: {
    summary: "Planning and organization are skills people may do differently or need support to practise.",
    reflection: "Which reminder, visual cue, or practical support could make the first step easier?",
  },
  risk_recognition_sequencing: {
    summary: "Noticing a possible risk is a prompt to consider context and get appropriate help, not to diagnose or blame.",
    reflection: "What would you need to check, and who could help you decide on a safe response?",
  },
};

export const sequencePracticeLimitations = [
  "These examples are for learning and reflection, not a validated knowledge or parenting-capacity assessment.",
  "A supplied answer key is a suggested sequence for the example, not proof that it is the only safe order in real life.",
  "The question set has not had its item-by-item safety rationale or licensing provenance verified.",
  "Your selections and practice activity stay in screen memory only and are not saved or shared.",
  "Do not use practice performance by itself to make safety, service, legal, contact, or placement decisions.",
];
