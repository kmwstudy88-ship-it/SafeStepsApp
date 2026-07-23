import type { CourseLesson } from "./courses";
import expandedWeeks15To38 from "./familyMentalHealthExpandedWeeks15To38.json";
import expandedWeeks39To54 from "./familyMentalHealthExpandedWeeks39To54.json";

export type FamilyMentalHealthExpandedWeek = {
  week: number;
  track: "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M";
  title: string;
  summary: string;
  audience_focus: string[];
  estimated_time_minutes: number;
  learning_objectives: string[];
  content_sections: {
    heading: string;
    body: string;
  }[];
  key_takeaways: string[];
  activity: {
    title: string;
    instructions: string;
    estimated_time_minutes: number;
  };
  knowledge_check: {
    question: string;
    options: string[];
    correct_answer_index: number;
    explanation: string;
  }[];
  resources: {
    title: string;
    type: string;
    note: string;
  }[];
};

export const familyMentalHealthExpandedTracks = [
  { code: "D", title: "Child Development Deep-Dives", weeks: [15, 16, 17, 18] },
  { code: "E", title: "Family Relationships & Dynamics", weeks: [19, 20, 21, 22] },
  { code: "F", title: "Substance Use & Family Impact", weeks: [23, 24, 25, 26] },
  { code: "G", title: "Domestic Violence & Family Safety", weeks: [27, 28, 29, 30] },
  { code: "H", title: "Grief, Loss & Family Transitions", weeks: [31, 32, 33, 34] },
  { code: "I", title: "School, Learning & Neurodiversity", weeks: [35, 36, 37, 38] },
  { code: "J", title: "Parenting Across Cultures & Diverse Family Structures", weeks: [39, 40, 41, 42] },
  { code: "K", title: "Child & Adolescent Wellbeing in the Digital Age", weeks: [43, 44, 45, 46] },
  { code: "L", title: "Financial Stress, Poverty & Family Wellbeing", weeks: [47, 48, 49, 50] },
  { code: "M", title: "Self-Regulation, Emotional Intelligence & Positive Parenting", weeks: [51, 52, 53, 54] },
] as const;

export const familyMentalHealthExpandedWeeks = [
  ...(expandedWeeks15To38 as FamilyMentalHealthExpandedWeek[]),
  ...(expandedWeeks39To54 as FamilyMentalHealthExpandedWeek[]),
];

export const familyMentalHealthExpandedLessons: CourseLesson[] = familyMentalHealthExpandedWeeks.map((week) => ({
  lessonNumber: week.week,
  title: week.title,
  durationMinutes: week.estimated_time_minutes,
  summary: week.summary,
  content: {
    whyItMatters: week.content_sections
      .map((section) => `${section.heading}\n\n${section.body}`)
      .join("\n\n"),
    parentMeaningPrompt: week.activity.instructions,
    comparisonTitle: `Track ${week.track} deep dive`,
    positiveTitle: "Learning objectives",
    positiveItems: week.learning_objectives,
    stepsTitle: week.activity.title,
    steps: [
      {
        title: "Learn",
        body: week.summary,
        prompt: week.learning_objectives[0] ?? week.title,
      },
      {
        title: "Practise",
        body: week.activity.instructions,
        prompt: week.activity.title,
      },
      {
        title: "Reflect",
        body: week.key_takeaways.join(" "),
        prompt: week.key_takeaways[0] ?? "What stands out from this week?",
      },
    ],
  },
}));
