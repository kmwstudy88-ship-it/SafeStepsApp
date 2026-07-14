type ExpandedLesson = {
  id: string;
  title: string;
  learningPurpose: string;
  teachingTranscript: string;
  practiceActivities: string;
  knowledgeCheck: string;
  evidenceTask: string;
  reflectionQuestions: string;
};

const teaching: Record<string, string> = {
  "SS-30-40-BATCH3-003": "Mealtime behaviour is shaped by hunger, sensory needs, development, tiredness and the emotional climate around food. The adult decides what, when and where food is offered; the child decides whether and how much to eat. Use predictable meal times, include a familiar food and keep conversation neutral. Avoid forced bites, weight comments and using dessert as a threat. For unsafe behaviour, state a calm related limit: food stays on the table; if throwing continues, the plate is moved until the next planned meal or snack.",
  "SS-30-40-BATCH3-014": "Morning and bedtime routines reduce decisions during demanding transitions. Use three to six visible steps in a consistent order, prepare materials early and give transition warnings. At bedtime, lower stimulation, complete hygiene, connect briefly and keep a predictable lights-out boundary. A missed step needs calm guidance, not restarting the routine or adding shame.",
  "SS-30-40-BATCH3-015": "Build mornings backwards from departure time and include a buffer. Decide which tasks belong to the adult, child or both. Use a visible sequence such as wake, dress, breakfast, teeth, bag and shoes. Give one instruction at a time and limited choices. Repeated lateness means timing, task demands or environmental supports need adjustment; it does not prove the child is lazy.",
  "SS-30-40-BATCH3-016": "Behaviour reflects need, skill, environment and expected outcome. Before calling a child unmotivated, ask whether they understand the task, can perform it and can manage the first step. Make that step achievable, offer a limited choice and acknowledge effort specifically. Rewards may support short-term practice but should not replace connection or become payment for every responsibility.",
  "SS-30-40-BATCH3-020": "Natural consequences occur without adult creation. Logical consequences are arranged by an adult and must be related, respectful and reasonable. Safety always overrides natural learning. If a child draws on a wall, helping clean it teaches repair; losing an unrelated family event does not. State the consequence calmly, keep it proportionate and reconnect afterwards.",
  "SS-30-40-BATCH3-021": "Natural consequences support learning only when the outcome is safe, tolerable and understandable. Consider age, disability, trauma and the seriousness of harm. Adults must prevent dangerous outcomes. After a safe consequence, avoid saying I told you so; help the child regulate, identify cause and effect and plan for next time.",
  "SS-30-40-BATCH3-038": "Evidence-based behaviour support begins with observable facts: what happened before, the behaviour and what followed. Define one behaviour, identify patterns, adjust a trigger, teach a replacement skill and reinforce its use. Track a small measure across several attempts. Labels do not explain what to change, and persistent or serious concerns may need professional assessment.",
  "SS-30-40-BATCH3-073": "Peer influence is normal, but risk rises when belonging depends on secrecy, harm, substances, unsafe driving, sexual pressure, crime or exploitation. Teach pause, assess, refuse, leave and contact a safe adult. Agree on a code word and a safety-first pickup plan. Calm responses make future disclosure more likely than lectures or humiliation.",
  "SS-30-40-BATCH3-083": "Positive behaviour guidance teaches what to do, not only what to stop. State expectations positively, prepare for difficult transitions, notice safe behaviour and respond to mistakes with regulation, a limit, a replacement skill and repair. Match expectations to development and provide extra support when disability, trauma or stress affects performance.",
  "SS-30-40-BATCH3-088": "Positive reinforcement makes a developing behaviour more likely to occur again. Use immediate, specific feedback such as: You put your shoes away without a reminder; that helped us get ready. Choose one observable behaviour and gradually fade external rewards as the skill develops. Never make affection conditional or remove rewards already earned.",
};

export function enrichExpandedLessons<T extends ExpandedLesson>(lessons: T[]): T[] {
  return lessons.map((lesson) => {
    const transcript = teaching[lesson.id];
    if (!transcript) return lesson;
    return {
      ...lesson,
      learningPurpose: `Teach parents and carers practical, child-safe skills for ${lesson.title.toLowerCase()} and support consistent use in family life.`,
      teachingTranscript: transcript,
      practiceActivities: `Review one recent example involving ${lesson.title.toLowerCase()}. Record the observable situation, the child's likely developmental or emotional need, the response used and its result. Plan and rehearse one topic-specific safer response to use next time.`,
      knowledgeCheck: `question: What is the safest purpose of ${lesson.title.toLowerCase()} support?\noptions: Teach a usable skill while maintaining safety and connection\n\nControl the child through fear or shame\nanswerIndex: 0\nexplanation: Safe guidance combines clear adult responsibility with teaching, dignity and connection.`,
      evidenceTask: `Practise the lesson strategy on at least three occasions. Record dates, the specific response used, the child's observable response and what you will retain or adjust.`,
      reflectionQuestions: `What did I previously assume about ${lesson.title.toLowerCase()}?\n\nWhat need or skill can I see more clearly now?\n\nHow did my response affect safety and connection?\n\nWhat will I practise consistently next week?`,
    };
  });
}

const excludedLessonIds = new Set([
  "SS-30-40-BATCH3-001",
  "SS-30-40-BATCH3-028",
  "SS-30-40-BATCH3-043",
  "SS-30-40-BATCH3-312",
]);

const renamedLessons: Record<string, { title: string; slug: string }> = {
  "SS-30-40-BATCH3-046": {
    title: "Recognising and Measuring Parenting Growth",
    slug: "recognising-and-measuring-parenting-growth",
  },
  "SS-30-40-BATCH3-090": {
    title: "Choosing Practical Parenting Strategies",
    slug: "choosing-practical-parenting-strategies",
  },
  "SS-30-40-BATCH3-101": {
    title: "Preventing Problems Before They Escalate",
    slug: "preventing-problems-before-they-escalate",
  },
  "SS-30-40-BATCH3-142": {
    title: "How Reinforcement Shapes Behaviour",
    slug: "how-reinforcement-shapes-behaviour",
  },
  "SS-30-40-BATCH3-149": {
    title: "Repairing Connection After Conflict",
    slug: "repairing-connection-after-conflict",
  },
  "SS-30-40-BATCH3-229": {
    title: "Creating Stability for Children",
    slug: "creating-stability-for-children",
  },
  "SS-30-40-BATCH3-242": {
    title: "Creating Safe Family Structure",
    slug: "creating-safe-family-structure",
  },
};

type CleanableExpandedLesson = ExpandedLesson & { slug: string };

export function cleanExpandedLessons<T extends CleanableExpandedLesson>(
  lessons: T[],
): T[] {
  return lessons
    .filter((lesson) => !excludedLessonIds.has(lesson.id))
    .map((lesson) => {
      const rename = renamedLessons[lesson.id];
      if (!rename) return lesson;

      const replaceTitle = (value: string) =>
        value.split(lesson.title).join(rename.title);

      return {
        ...lesson,
        title: rename.title,
        slug: rename.slug,
        learningPurpose: replaceTitle(lesson.learningPurpose),
        teachingTranscript: replaceTitle(lesson.teachingTranscript),
        practiceActivities: replaceTitle(lesson.practiceActivities),
        knowledgeCheck: replaceTitle(lesson.knowledgeCheck),
        evidenceTask: replaceTitle(lesson.evidenceTask),
        reflectionQuestions: replaceTitle(lesson.reflectionQuestions),
      };
    });
}
