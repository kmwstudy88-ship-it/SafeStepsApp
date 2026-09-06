import {
  buildInteractiveVideoCourseCompletionPayload,
  interactiveVideoCourseUsesPlaceholderVideos,
  type InteractiveVideoCourse,
  type InteractiveVideoStep,
} from "./interactiveVideoCourse";

export type StrengtheningFamilyBondStep = InteractiveVideoStep;

export const strengtheningFamilyBondLessonId = "strengthening-family-bond-v10";
export const strengtheningFamilyBondTitle = "Strengthening Family Bonds";

const demoVideoUrl = "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4";
export const strengtheningFamilyBondPlaceholderVideoUrl = demoVideoUrl;

export const strengtheningFamilyBondVideoSteps: StrengtheningFamilyBondStep[] = [
  {
    id: 1,
    title: "Welcome to SafeSteps",
    subtitle: "Series Introduction",
    url: demoVideoUrl,
    reflectionPrompt: "What are you hoping to get out of this series?",
  },
  {
    id: 2,
    title: "Defining Family",
    subtitle: "Your Core Values",
    url: demoVideoUrl,
    reflectionPrompt: "In one sentence, what does a strong family mean to you?",
  },
  {
    id: 3,
    title: "Connection Check-In",
    subtitle: "Assessing Current Ties",
    url: demoVideoUrl,
    reflectionPrompt: "What area needs the most focus right now?",
  },
  {
    id: 4,
    title: "The Core Pillars",
    subtitle: "Foundational Blocks",
    url: demoVideoUrl,
    reflectionPrompt: "Which pillar resonated with you the most?",
  },
  {
    id: 5,
    title: "Micro-Moments",
    subtitle: "Small Daily Actions",
    url: demoVideoUrl,
    reflectionPrompt: "List two micro-moments you can implement tomorrow.",
  },
  {
    id: 6,
    title: "Your Connection Plan",
    subtitle: "Designing Strategies",
    url: demoVideoUrl,
    reflectionPrompt: "What activity will you schedule for this weekend?",
  },
  {
    id: 7,
    title: "Overcoming Roadblocks",
    subtitle: "Handling Distractions",
    url: demoVideoUrl,
    reflectionPrompt: "What is your primary roadblock, such as time, stress, or technology?",
  },
  {
    id: 8,
    title: "Parental Reflection",
    subtitle: "Deepening Mindsets",
    url: demoVideoUrl,
    reflectionPrompt: "How did you feel close to your family today?",
  },
  {
    id: 9,
    title: "SafeSteps Quiz",
    subtitle: "Knowledge Check Challenge",
    url: demoVideoUrl,
    reflectionPrompt: "Select the strongest answer below.",
    quiz: {
      question: "Proactive communication relies mostly on which element?",
      options: [
        { id: 0, label: "Waiting for problems to clear on their own", correct: false },
        { id: 1, label: "Setting intentional routines and active listening", correct: true },
        { id: 2, label: "Strict rules without shared feedback", correct: false },
      ],
    },
  },
  {
    id: 10,
    title: "Wrap-Up and Next Steps",
    subtitle: "Commitment to Action",
    url: demoVideoUrl,
    reflectionPrompt: "What is your final one action step commitment?",
  },
];

export const strengtheningFamilyBondVideoCourse: InteractiveVideoCourse = {
  lessonId: strengtheningFamilyBondLessonId,
  title: strengtheningFamilyBondTitle,
  description: "A 10-video parent lesson with reflections, a quiz checkpoint, and saved completion data.",
  placeholderVideoUrl: strengtheningFamilyBondPlaceholderVideoUrl,
  steps: strengtheningFamilyBondVideoSteps,
};

export function strengtheningFamilyBondUsesPlaceholderVideos() {
  return interactiveVideoCourseUsesPlaceholderVideos(strengtheningFamilyBondVideoCourse);
}

export function buildStrengtheningFamilyBondCompletionPayload(input: {
  answers: Record<number, string>;
  selectedQuizAnswerId: number | null;
}) {
  return buildInteractiveVideoCourseCompletionPayload(strengtheningFamilyBondVideoCourse, input);
}
