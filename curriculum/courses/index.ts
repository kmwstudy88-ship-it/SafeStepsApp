export type CourseLesson = {
  lessonNumber: number;
  title: string;
  durationMinutes: number;
  summary?: string;
  body?: string[];
  practiceSteps?: string[];
  reflectionPrompt?: string;
};

export type CourseDefinition = {
  id: string;
  title: string;
  description: string;
  goldStandard?: boolean;
  lessons: CourseLesson[];
};

export type CourseArea = {
  id: string;
  title: string;
  description: string;
  courseIds: string[];
  suggestedStartCourseId?: string;
};

export const courses: CourseDefinition[] = [
  {
    id: "nervous-system-reset",
    title: "Nervous System Regulation & Calm Recovery",
    description:
      "Recognise stress signals in the body, pause before escalating, and practise grounded co-regulation with your child.",
    goldStandard: true,
    lessons: [
      {
        lessonNumber: 1,
        title: "Noticing Body Signals Before Reacting",
        durationMinutes: 15,
        summary:
          "Identify early physical cues of stress and create a 90-second pause before speaking or acting.",
        body: [
          "When stress rises rapidly, the nervous system shifts into protection mode before conscious reasoning catches up.",
          "Pausing for 90 seconds with slow exhale breathing allows your voice, posture, and words to stay safe and predictable for your child.",
        ],
        practiceSteps: [
          "Name three physical signs that tell you stress is rising (jaw tension, fast breathing, heat).",
          "Practise a 4-second inhale and 6-second exhale before answering a hard question.",
        ],
        reflectionPrompt: "What helps your body notice stress early before a conversation escalates?",
      },
      {
        lessonNumber: 2,
        title: "Repairing Calmly After a Hard Moment",
        durationMinutes: 18,
        summary:
          "Take adult ownership after tension without blaming the child or demanding immediate forgiveness.",
        body: [
          "Children feel safer when adults can acknowledge a tense moment calmly and state what they will do differently next time.",
          "Repair works best when it is brief, warm, and free from pressure on the child.",
        ],
        practiceSteps: [
          "Use a simple three-part repair: name your tone, own your reset, and offer calm space.",
          "Allow your child to take a break if they are not ready to talk yet.",
        ],
        reflectionPrompt: "How will you model calm accountability the next time a routine feels stressful?",
      },
    ],
  },
  {
    id: "strengthening-family-bonds",
    title: "Strengthening the Family Bond & Child Voice",
    description:
      "Build warm, low-pressure daily and weekend connection moments that respect your child's pace and choices.",
    goldStandard: true,
    lessons: [
      {
        lessonNumber: 1,
        title: "Child-Led Connection Check-Ins",
        durationMinutes: 15,
        summary:
          "Follow your child's lead for 10 uninterrupted minutes without correcting, lecturing, or quizzing.",
        body: [
          "Predictable, warm attention builds relational trust far more effectively than long lectures.",
          "Letting your child choose the topic, game, or quiet activity signals safety and respect.",
        ],
        practiceSteps: [
          "Put phones away and let your child choose a 10-minute activity or conversation.",
          "Notice and validate one strength or effort your child showed.",
        ],
        reflectionPrompt: "What did you notice about your child's body language when they set the pace?",
      },
      {
        lessonNumber: 2,
        title: "Predictable Transitions & Contact Visits",
        durationMinutes: 20,
        summary:
          "Support calm hellos, unhurried play, and reassuring goodbyes before and after contact visits.",
        body: [
          "Transitions between homes or visits can feel overwhelming for children carrying mixed emotions.",
          "Simple, steady routines at hello and goodbye reduce anxiety and help your child feel secure.",
        ],
        practiceSteps: [
          "Prepare one calm greeting and one predictable goodbye ritual before the visit.",
          "Keep adult case discussions completely separate from child contact time.",
        ],
        reflectionPrompt: "How can you make the next hello and goodbye calmer and more predictable for your child?",
      },
    ],
  },
  {
    id: "safe-routines-and-boundaries",
    title: "Predictable Routines & Calm Boundaries",
    description:
      "Establish steady morning, mealtime, and bedtime structures using clear expectations and non-punitive guidance.",
    goldStandard: true,
    lessons: [
      {
        lessonNumber: 1,
        title: "Building a Calm Evening & Bedtime Rhythm",
        durationMinutes: 15,
        summary:
          "Replace last-minute rushing with a three-step visual or verbal wind-down routine.",
        body: [
          "Children regulate better when they know what comes next without sudden surprises.",
          "A consistent three-step wind-down lowers evening conflict and supports restful sleep.",
        ],
        practiceSteps: [
          "Write down three simple bedtime steps and review them calmly before dinner.",
          "Use a warm 5-minute transition cue before moving to the next step.",
        ],
        reflectionPrompt: "Which part of your daily routine benefits most from a calmer transition cue?",
      },
    ],
  },
];

export const courseAreas: CourseArea[] = [
  {
    id: "self-regulation",
    title: "Emotional Regulation & Calm Reset",
    description: "Nervous system awareness, de-escalation pauses, and adult emotional accountability.",
    courseIds: ["nervous-system-reset", "safe-routines-and-boundaries"],
    suggestedStartCourseId: "nervous-system-reset",
  },
  {
    id: "family-connection",
    title: "Connection, Visits & Child Voice",
    description: "Child-led bonding, trauma-informed listening, and predictable contact visit rituals.",
    courseIds: ["strengthening-family-bonds", "safe-routines-and-boundaries"],
    suggestedStartCourseId: "strengthening-family-bonds",
  },
];

export function getCourseById(courseId: string): CourseDefinition | null {
  return courses.find((course) => course.id === courseId) ?? null;
}

export function getCoursesForArea(areaId: string): CourseDefinition[] {
  const area = courseAreas.find((item) => item.id === areaId);
  if (!area) return [];
  return area.courseIds
    .map((id) => getCourseById(id))
    .filter((item): item is CourseDefinition => Boolean(item));
}

export function getGoldStandardCourses(): CourseDefinition[] {
  return courses.filter((course) => course.goldStandard);
}

export function areAllCourseLessonsViewed(
  course: CourseDefinition,
  viewedLessons: Record<number, boolean>,
): boolean {
  return (
    course.lessons.length > 0 &&
    course.lessons.every((lesson) => Boolean(viewedLessons[lesson.lessonNumber]))
  );
}
