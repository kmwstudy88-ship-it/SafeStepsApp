import type { StandaloneCourse } from "./courses";

const reviewPrompt =
  "What did I think this lesson meant before I started? What do I understand now? What changed in my thinking? What is one thing I can practise this week? What evidence can I upload to show learning, effort, or behaviour change?";

export const productionReadinessLessonPack: StandaloneCourse = {
  id: "safesteps-production-readiness-practice-pack",
  title: "SafeSteps Production Readiness Practice Pack",
  description:
    "First-class production lessons with practical tasks, structured activities, assessment checkpoints, knowledge tests, parent meaning reflection, and evidence-ready outputs.",
  lessons: [
    {
      lessonNumber: 1,
      title: "Turning Learning Into Observable Change",
      durationMinutes: 45,
      summary:
        "Parents turn one lesson insight into a small, observable action that can be practised, reflected on, and evidenced without overstating outcomes.",
      content: {
        whyItMatters:
          "SafeSteps learning should not stop at reading or watching content. A parent needs to show how learning changes a real behaviour, routine, response, or repair attempt. Observable change is specific, time-bound, and reviewable. It does not promise a court, child-protection, or reunification result. It shows what the parent noticed, what they chose, what happened, and what they will do next.",
        parentMeaningPrompt:
          "What does observable change mean for you as a parent, and what would your child actually be able to notice if this lesson changed your behaviour?",
        comparisonTitle: "Observable change and vague intention",
        positiveTitle: "Observable change includes",
        positiveItems: [
          "One behaviour the parent can practise this week",
          "A clear situation where the behaviour will be used",
          "A factual note about what happened afterward",
        ],
        negativeTitle: "Observable change is not",
        negativeItems: [
          "A promise that everything will be different",
          "A general statement such as I will do better",
          "A claim about the child's feelings without evidence",
        ],
        stepsTitle: "Production lesson flow",
        steps: [
          {
            title: "Learn",
            body:
              "Read the lesson summary and name the exact parenting behaviour it is asking you to practise. Keep it small enough to do safely in normal family life.",
            prompt: "What is the one behaviour this lesson is asking me to practise?",
          },
          {
            title: "Activity",
            body:
              "Complete a two-column map: current pattern on the left, safer replacement action on the right. Add when and where you will try it.",
            prompt: "Where is the safest real-life place to practise this action?",
          },
          {
            title: "Assessment checkpoint",
            body:
              "Rate your readiness from 1 to 5 for clarity, safety, support, and confidence. Any score under 3 means the action needs to be smaller or supported before use.",
            prompt: "Which readiness score needs support before I practise?",
          },
          {
            title: "Knowledge test",
            body:
              "True or false: Observable change is stronger when it names a specific action, setting, and follow-up record. Answer: True.",
            prompt: "Why is a specific action stronger than a broad promise?",
          },
          {
            title: "Evidence task",
            body:
              "Save a short practice record with the planned action, date, what happened, what helped, what was hard, and one next step.",
            prompt: reviewPrompt,
          },
        ],
      },
    },
    {
      lessonNumber: 2,
      title: "Building a Safe Practice Task",
      durationMinutes: 45,
      summary:
        "Parents design a practice task that is safe, child-focused, realistic, and linked to evidence before it is marked complete.",
      content: {
        whyItMatters:
          "A task is only useful if it can be completed safely and reviewed fairly. Good practice tasks avoid pressure on the child, avoid hidden tests, and avoid making the child responsible for adult progress. The parent owns the action. The evidence should show preparation, effort, repair, support-seeking, or follow-through.",
        parentMeaningPrompt:
          "What does a safe practice task mean for you, and how can you make sure the task does not put pressure on your child?",
        comparisonTitle: "Safe and unsafe practice tasks",
        positiveTitle: "Safe tasks are",
        positiveItems: [
          "Owned by the parent",
          "Appropriate for the child's age and safety needs",
          "Able to be evidenced without exposing private child information",
        ],
        negativeTitle: "Unsafe tasks are",
        negativeItems: [
          "Designed to make the child prove progress",
          "Used to pressure contact, forgiveness, or disclosure",
          "Completed without evidence when evidence is required",
        ],
        stepsTitle: "Task design flow",
        steps: [
          {
            title: "Task",
            body:
              "Write one task using this structure: I will do [action] during [routine or situation] so my child experiences [safe parenting behaviour].",
            prompt: "What action is fully within my control?",
          },
          {
            title: "Safety screen",
            body:
              "Check whether the task could pressure, frighten, confuse, expose, or burden the child. If yes, redesign the task around adult preparation or support-seeking.",
            prompt: "Could this task create pressure for my child?",
          },
          {
            title: "Activity",
            body:
              "Create a task card with four fields: action, safety boundary, support person, and evidence record.",
            prompt: "What support or boundary makes this task safer?",
          },
          {
            title: "Assessment checkpoint",
            body:
              "Score the task against four criteria: parent-owned, child-safe, realistic, and evidence-ready. A task must pass all four before completion.",
            prompt: "Which criterion needs improving before I use this task?",
          },
          {
            title: "Knowledge test",
            body:
              "True or false: A safe practice task should be parent-owned and should not make the child responsible for proving adult progress. Answer: True.",
            prompt: "Why must the parent own the task?",
          },
          {
            title: "Evidence task",
            body:
              "Upload the task card or save a written evidence note linked to this lesson before marking the task complete.",
            prompt: reviewPrompt,
          },
        ],
      },
    },
    {
      lessonNumber: 3,
      title: "Checking Understanding Before Moving On",
      durationMinutes: 40,
      summary:
        "Parents complete a short knowledge and reflection check so lesson completion reflects understanding, not only attendance.",
      content: {
        whyItMatters:
          "Completion should mean the parent engaged with the lesson, understood the core point, and can apply it safely. A short check protects against shallow completion and gives reviewers a clearer record of growth, confusion, support needs, and next learning steps.",
        parentMeaningPrompt:
          "What does genuine understanding mean for you, and how will you know when you are applying this lesson rather than only repeating the words?",
        comparisonTitle: "Understanding and repetition",
        positiveTitle: "Understanding includes",
        positiveItems: [
          "Explaining the idea in your own words",
          "Naming one safe example from your parenting",
          "Knowing when extra support is needed",
        ],
        negativeTitle: "Understanding is not",
        negativeItems: [
          "Clicking complete without reflection",
          "Memorising a phrase without practice",
          "Using course language to blame another person",
        ],
        stepsTitle: "Assessment and test flow",
        steps: [
          {
            title: "Knowledge test",
            body:
              "Answer in your own words: What is the main parenting skill in this lesson, and what unsafe version of that skill should be avoided?",
            prompt: "Can I explain both the skill and the boundary?",
          },
          {
            title: "Scenario assessment",
            body:
              "Read a short family scenario and choose the safest response. Explain why the response lowers risk or supports connection.",
            prompt: "What makes this response safer than the alternatives?",
          },
          {
            title: "Activity",
            body:
              "Write a before-and-after script: what I might have said before this lesson, and what I will try saying now.",
            prompt: "What changed in my words, tone, or timing?",
          },
          {
            title: "Task",
            body:
              "Use the new script once in a low-pressure situation, or rehearse it with a trusted adult if direct practice is not safe yet.",
            prompt: "Where can I practise this without escalating conflict?",
          },
          {
            title: "Evidence task",
            body:
              "Save the knowledge response, scenario answer, script, and practice note as one lesson completion record.",
            prompt: reviewPrompt,
          },
        ],
      },
    },
    {
      lessonNumber: 4,
      title: "Completing a Court-Relevant Learning Record",
      durationMinutes: 50,
      summary:
        "Parents create a clear learning record that separates facts, reflection, evidence, and support needs for human review.",
      content: {
        whyItMatters:
          "A useful SafeSteps record should be clear, factual, and fair. It should not claim court approval or guarantee reunification. It should separate what happened, what the parent learned, what evidence exists, what still needs support, and what the next step is. This helps the record stay reviewable and reduces the risk of confusing reflection with verified fact.",
        parentMeaningPrompt:
          "What does a fair learning record mean for you, and how can you be honest about progress without overstating it?",
        comparisonTitle: "Fair records and unsafe claims",
        positiveTitle: "Fair records include",
        positiveItems: [
          "Facts separated from personal reflection",
          "Evidence linked by task or lesson",
          "Support needs and barriers named honestly",
        ],
        negativeTitle: "Unsafe claims include",
        negativeItems: [
          "Court approved language without approval",
          "Claims about the child's private experience without consent or evidence",
          "Progress claims that hide setbacks or safety concerns",
        ],
        stepsTitle: "Learning record flow",
        steps: [
          {
            title: "Facts",
            body:
              "Write what happened using dates, actions, and neutral language. Do not add interpretation in the fact section.",
            prompt: "What can be stated factually?",
          },
          {
            title: "Reflection",
            body:
              "Write what the lesson means to you, what you noticed about your parenting, and what you want to keep practising.",
            prompt: "What did this lesson show me about my parenting?",
          },
          {
            title: "Activity",
            body:
              "Sort five statements into the correct record section: fact, reflection, evidence, assessment checkpoint, or next task.",
            prompt: "Which statements are facts, and which are reflections or next tasks?",
          },
          {
            title: "Assessment checkpoint",
            body:
              "Identify one strength, one concern, one support need, and one next action. Any safety concern should trigger human review rather than being averaged away.",
            prompt: "What needs review or support before this record is used?",
          },
          {
            title: "Knowledge test",
            body:
              "True or false: A court-relevant learning record should keep facts, reflection, evidence, and assessment notes separated. Answer: True.",
            prompt: "Why does source separation make the record fairer?",
          },
          {
            title: "Evidence task",
            body:
              "Attach the relevant task record, reflection, upload, certificate, attendance note, or practice log. Keep child-private material out unless sharing is appropriate and permitted.",
            prompt: "What evidence supports this record, and what should remain private?",
          },
          {
            title: "Review",
            body:
              "Check the final record for clear source separation: fact, reflection, evidence, assessment checkpoint, and next step.",
            prompt: reviewPrompt,
          },
        ],
      },
    },
  ],
};
