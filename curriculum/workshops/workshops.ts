export type WorkshopActivity = {
  title: string;
  instructions: string;
  durationMinutes: number;
  groupSize?: string;
};

export type Workshop = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  format: "self-guided" | "facilitated" | "group";
  level: "foundational" | "intermediate" | "advanced";
  tags: string[];
  composedFromLessonIds: string[];
  facilitatorNotes?: string;
  groupActivities?: WorkshopActivity[];
  reflectionPrompts: string[];
  evidenceTask: string;
};

export const workshops: Workshop[] = [
  {
    id: "communication-foundations-workshop",
    title: "Communication Foundations",
    description:
      "A group or facilitated workshop exploring how we communicate safety, boundaries, and care within families. Draws on active listening, non-verbal cues, and repair-after-conflict lessons.",
    durationMinutes: 90,
    format: "facilitated",
    level: "foundational",
    tags: ["communication", "listening", "repair", "boundaries"],
    composedFromLessonIds: ["active-listening", "setting-boundaries", "repair-after-conflict"],
    facilitatorNotes:
      "Begin with a brief check-in (5 min). Run the pair-share activity before the group debrief. Allow extra time for participants who are processing recent conflict. End with a shared commitment statement.",
    groupActivities: [
      {
        title: "Mirror Listening Pair Share",
        instructions:
          "In pairs, one person speaks for 2 minutes about a recent challenge without interruption. The listener reflects back what they heard using only 3 sentences. Swap roles. Debrief: what did it feel like to be fully heard?",
        durationMinutes: 15,
        groupSize: "Pairs",
      },
      {
        title: "Repair Scenario Cards",
        instructions:
          "Each group receives a scenario card describing a family conflict. The group identifies what went wrong in the communication and writes a 'repair script' — what could be said the next day to rebuild safety.",
        durationMinutes: 20,
        groupSize: "Groups of 3–4",
      },
    ],
    reflectionPrompts: [
      "What does safe communication look like in my family right now?",
      "When was the last time I repaired after a hard moment, and how did it go?",
      "What is one communication habit I want to change this week?",
    ],
    evidenceTask:
      "Record a short written or audio reflection describing one communication moment from this week — what happened, what you noticed in yourself, and what you would do differently.",
  },
  {
    id: "emotional-regulation-workshop",
    title: "Emotional Regulation for Parents",
    description:
      "A workshop helping parents and carers understand their own nervous system responses and build practical tools for staying regulated when parenting pressure rises.",
    durationMinutes: 120,
    format: "facilitated",
    level: "foundational",
    tags: ["emotional regulation", "nervous system", "stress", "self-regulation"],
    composedFromLessonIds: ["nervous-system-basics", "co-regulation", "stress-triggers"],
    facilitatorNotes:
      "This workshop works best in a small group (6–10). Have grounding resources available. Do not push anyone to share trauma history. Focus on present tools, not past causes.",
    groupActivities: [
      {
        title: "Window of Tolerance Map",
        instructions:
          "Each participant draws a simple dial with three zones: calm, activated, and shutdown. They place their current state on the dial, then identify two triggers and two anchors. Share in pairs.",
        durationMinutes: 20,
        groupSize: "Individual then pairs",
      },
      {
        title: "Grounding Station Rotation",
        instructions:
          "Set up four grounding stations around the room (breathing, movement, sensory grounding, and self-talk). Participants rotate every 5 minutes, trying each technique and rating how it felt.",
        durationMinutes: 25,
        groupSize: "Full group",
      },
    ],
    reflectionPrompts: [
      "What are my earliest warning signs that I am becoming dysregulated?",
      "What does my child need from me when I am in an activated state?",
      "Which grounding technique felt most accessible for everyday use?",
    ],
    evidenceTask:
      "Over the next week, use one grounding technique at least twice and upload a brief note about when you used it and what you noticed.",
  },
  {
    id: "child-safety-workshop",
    title: "Child Safety and Protective Parenting",
    description:
      "A workshop for parents and carers on how to talk with children about safety, recognise warning signs, and build protective relationships that children can rely on.",
    durationMinutes: 90,
    format: "facilitated",
    level: "foundational",
    tags: ["child safety", "protective parenting", "disclosure", "risk"],
    composedFromLessonIds: ["child-safety-basics", "protective-behaviours", "safe-disclosure"],
    facilitatorNotes:
      "This workshop may raise disclosures. Follow your organisation's mandatory reporting requirements. Have a debrief plan ready for participants who are distressed.",
    groupActivities: [
      {
        title: "Safe and Unsafe Scenarios",
        instructions:
          "In small groups, read through a set of scenario cards. For each scenario, decide: Is this safe, unsafe, or uncertain? What would a protective parent do next? Discuss disagreements.",
        durationMinutes: 20,
        groupSize: "Groups of 3",
      },
      {
        title: "Safe Adults List",
        instructions:
          "Each participant writes a list of safe adults their child could go to. For each person, they identify what makes that adult trustworthy and how they have communicated this to their child.",
        durationMinutes: 15,
        groupSize: "Individual",
      },
    ],
    reflectionPrompts: [
      "Does my child know the difference between safe and unsafe touch? How do I know?",
      "Have I told my child they will not get in trouble for telling me something unsafe happened?",
      "Who are the safe adults in my child's life outside our home?",
    ],
    evidenceTask:
      "Have a brief 'safety conversation' with your child this week. Upload a short written reflection on how it went — what you said, how your child responded, and what you might do differently next time.",
  },
  {
    id: "co-parenting-workshop",
    title: "Co-Parenting After Separation",
    description:
      "A workshop helping separated parents build a child-focused parenting relationship, manage conflict, and maintain consistency across two households.",
    durationMinutes: 120,
    format: "facilitated",
    level: "intermediate",
    tags: ["co-parenting", "separation", "conflict", "consistency", "child wellbeing"],
    composedFromLessonIds: ["co-parenting-basics", "managing-conflict", "child-caught-in-middle"],
    facilitatorNotes:
      "Do not run this workshop with separated couples in the same group unless it is specifically a co-parenting mediation setting. Focus on child outcomes, not relationship resolution.",
    groupActivities: [
      {
        title: "Child's Voice Cards",
        instructions:
          "Read out statements written from a child's perspective (e.g. 'I feel scared when my parents argue about me'). After each card, the group discusses: What does this child need? What can a parent do?",
        durationMinutes: 20,
        groupSize: "Full group",
      },
      {
        title: "Two-Household Consistency Plan",
        instructions:
          "Each participant drafts a short consistency plan: three things they want to stay the same across both homes (e.g. bedtime, homework time, screen limits). They identify one thing they are willing to align on even if they disagree.",
        durationMinutes: 20,
        groupSize: "Individual",
      },
    ],
    reflectionPrompts: [
      "What is one thing I can do to make transitions between homes easier for my child?",
      "Am I asking my child to carry messages between households? How can I change this?",
      "What does my child need to hear from me about the other parent?",
    ],
    evidenceTask:
      "After your child's next transition between homes, upload a brief note: how did it go, what you noticed in your child, and one thing you will do differently next time.",
  },
  {
    id: "attachment-bonding-workshop",
    title: "Attachment and Bonding in Practice",
    description:
      "A workshop exploring how attachment shapes parenting behaviours, how to rebuild secure connection after ruptures, and how to meet children's attachment needs at different ages.",
    durationMinutes: 90,
    format: "facilitated",
    level: "foundational",
    tags: ["attachment", "bonding", "secure base", "connection", "rupture-repair"],
    composedFromLessonIds: ["attachment-basics", "secure-base", "rupture-and-repair"],
    facilitatorNotes:
      "Many parents in this setting have disrupted attachment histories themselves. Normalise this without over-focusing on the past. Keep the emphasis on what is possible now.",
    groupActivities: [
      {
        title: "Connection Audit",
        instructions:
          "Each participant completes a short audit: How many times did I make a positive connection with my child today? Yesterday? This week? What got in the way? What helped?",
        durationMinutes: 15,
        groupSize: "Individual then pairs",
      },
      {
        title: "Repair Roleplay",
        instructions:
          "In pairs, roleplay a parent who lost their temper and a child who is withdrawn. The 'parent' practises a repair conversation. Observers note: what made the repair feel genuine? What fell flat?",
        durationMinutes: 20,
        groupSize: "Pairs with observers",
      },
    ],
    reflectionPrompts: [
      "What is one thing I do that I know my child experiences as connection?",
      "What gets in the way of me being emotionally available to my child?",
      "After a rupture, how long does it usually take me to repair? What would help me do it faster?",
    ],
    evidenceTask:
      "This week, plan and carry out one deliberate connection activity with your child. Upload a short reflection on what you did, how your child responded, and what you noticed in yourself.",
  },
  {
    id: "behaviour-management-workshop",
    title: "Understanding and Responding to Behaviour",
    description:
      "A workshop helping parents and carers understand the purpose of challenging behaviour, respond rather than react, and build consistent, safe boundaries.",
    durationMinutes: 90,
    format: "facilitated",
    level: "foundational",
    tags: ["behaviour", "boundaries", "discipline", "positive parenting", "triggers"],
    composedFromLessonIds: ["behaviour-as-communication", "consistent-boundaries", "positive-discipline"],
    facilitatorNotes:
      "Avoid language that blames or labels children. Focus on 'what is this behaviour communicating?' rather than 'what is wrong with this child?'",
    groupActivities: [
      {
        title: "Behaviour Decoding Exercise",
        instructions:
          "Each group receives a card describing a behaviour (e.g. 'child refuses to go to school'). The group lists three possible unmet needs behind the behaviour and one response that addresses the need rather than just the behaviour.",
        durationMinutes: 20,
        groupSize: "Groups of 3–4",
      },
      {
        title: "My Boundary Script",
        instructions:
          "Each participant writes a short, calm boundary statement for one recurring behaviour challenge at home. They practise saying it aloud in pairs — keeping it short, clear, and without shame.",
        durationMinutes: 15,
        groupSize: "Individual then pairs",
      },
    ],
    reflectionPrompts: [
      "What behaviour in my child triggers the strongest reaction in me, and why?",
      "What unmet need might be driving my child's most challenging behaviour?",
      "What is one consistent boundary I want to hold more calmly this week?",
    ],
    evidenceTask:
      "When a challenging behaviour occurs this week, write a brief note: what happened, what you think the need was, how you responded, and what you would do the same or differently.",
  },
  {
    id: "family-routines-workshop",
    title: "Building Routines that Create Safety",
    description:
      "A workshop on how predictable family routines build felt safety for children, reduce conflict, and support healthy development — including how to start small when life is chaotic.",
    durationMinutes: 60,
    format: "self-guided",
    level: "foundational",
    tags: ["routines", "predictability", "structure", "felt safety", "daily life"],
    composedFromLessonIds: ["family-routines-basics", "morning-routine", "bedtime-routine"],
    groupActivities: [
      {
        title: "Our Day Map",
        instructions:
          "Draw a simple timeline of your child's day. Mark the three moments that most often create conflict or stress. For each moment, identify one small routine change that could reduce stress.",
        durationMinutes: 20,
        groupSize: "Individual",
      },
    ],
    reflectionPrompts: [
      "What routines do we have that are already working well?",
      "Which part of the day is most chaotic, and what might help?",
      "What is one routine I could start this week — even an imperfect version?",
    ],
    evidenceTask:
      "Start one new routine this week (even a small one). Upload a brief reflection after 5 days: did it happen most days, what helped it stick, what got in the way?",
  },
  {
    id: "trauma-informed-parenting-workshop",
    title: "Trauma-Informed Parenting",
    description:
      "A workshop helping parents and carers understand how trauma affects behaviour, development, and relationships — and how to parent in ways that support healing rather than re-trigger past harm.",
    durationMinutes: 120,
    format: "facilitated",
    level: "intermediate",
    tags: ["trauma", "healing", "nervous system", "triggers", "intergenerational"],
    composedFromLessonIds: ["trauma-basics", "intergenerational-trauma", "trauma-triggers"],
    facilitatorNotes:
      "This workshop requires a trauma-informed facilitator. Check in with participants before and after. Have grounding resources available. Do not press anyone to disclose their own trauma history.",
    groupActivities: [
      {
        title: "Trigger Mapping",
        instructions:
          "Each participant privately identifies two parenting triggers — moments where they react strongly. For each, they map: What happened? What did I feel? What old experience might this be connected to? What does my child need from me in that moment?",
        durationMinutes: 20,
        groupSize: "Individual (private)",
      },
      {
        title: "Healing Language Practice",
        instructions:
          "In pairs, practise replacing reactive statements with healing ones. For example, instead of 'Stop acting like a baby', try 'It sounds like you need some help. I'm here.' Debrief: what made it hard?",
        durationMinutes: 20,
        groupSize: "Pairs",
      },
    ],
    reflectionPrompts: [
      "What is one parenting trigger I want to understand better?",
      "How does my own history of stress or trauma show up in my parenting?",
      "What does my child need from me when they are in a trauma response?",
    ],
    evidenceTask:
      "This week, notice one moment where you felt triggered. Upload a brief reflection: what happened, what you felt, and what you did or could have done to stay regulated.",
  },
];

export function getWorkshopById(id: string): Workshop | undefined {
  return workshops.find((w) => w.id === id);
}

export function getWorkshopsByTag(tag: string): Workshop[] {
  return workshops.filter((w) => w.tags.includes(tag));
}

export function getWorkshopsByFormat(format: Workshop["format"]): Workshop[] {
  return workshops.filter((w) => w.format === format);
}

export function getWorkshopsByLevel(level: Workshop["level"]): Workshop[] {
  return workshops.filter((w) => w.level === level);
}
