export type CourseLesson = {
  lessonNumber: number;
  title: string;
  durationMinutes: number;
  summary?: string;
  content?: {
    whyItMatters: string;
    parentMeaningPrompt?: string;
    comparisonTitle?: string;
    positiveTitle?: string;
    positiveItems?: string[];
    negativeTitle?: string;
    negativeItems?: string[];
    validationIs?: string[];
    validationIsNot?: string[];
    example?: {
      insteadOfLabel?: string;
      trySayingLabel?: string;
      insteadOf: string;
      trySaying: string;
    };
    stepsTitle?: string;
    steps?: {
      title: string;
      body: string;
      prompt: string;
    }[];
  };
};

export type StandaloneCourse = {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
};

export const courses: StandaloneCourse[] = [
  {
    id: "communication-skills",
    title: "Communication Skills",
    description: "Standalone course teaching core communication skills.",
    lessons: [
      {
        lessonNumber: 1,
        title: "What is Communication?",
        durationMinutes: 30,
        summary:
          "Communication is how we share messages, feelings, needs, boundaries, and care through words, tone, body language, and actions.",
        content: {
          whyItMatters:
            "Family communication shapes whether children feel safe, heard, confused, blamed, or supported. Clear communication helps parents slow down, repair misunderstandings, and show safe leadership.",
          parentMeaningPrompt:
            "What does safe communication mean for you as a parent, and what do you want your child to experience when they talk with you?",
          comparisonTitle: "Communication includes more than words",
          positiveTitle: "Communication is",
          positiveItems: ["Words and tone", "Listening and body language", "Repair after misunderstandings"],
          negativeTitle: "Communication is not",
          negativeItems: ["Only giving instructions", "Winning an argument", "Expecting children to guess what adults mean"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "Because I said so.",
            trySaying: "I need you to stop because this is about safety. I can explain it calmly.",
          },
          stepsTitle: "How to communicate safely in 3 steps",
          steps: [
            {
              title: "Pause",
              body: "Notice your tone, face, and volume before you respond.",
              prompt: "What message is my child receiving from me right now?",
            },
            {
              title: "Be clear",
              body: "Use simple words that name the issue and the next safe step.",
              prompt: "Say what you mean without shaming or threatening.",
            },
            {
              title: "Repair",
              body: "Come back after hard moments and make the message safe again.",
              prompt: "What do I need to clarify, own, or redo?",
            },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Active Listening",
        durationMinutes: 30,
        summary:
          "Active listening means giving your attention, checking you understand, and responding in a way that helps the other person feel heard.",
        content: {
          whyItMatters:
            "Children and adults are more likely to calm down and cooperate when they feel heard first. Listening does not mean agreeing with everything; it means making space before correction.",
          parentMeaningPrompt:
            "What would change in your family if your child felt listened to before being corrected?",
          comparisonTitle: "What active listening is and is not",
          positiveTitle: "Active listening is",
          positiveItems: ["Facing the person and slowing down", "Reflecting back what you heard", "Asking before assuming"],
          negativeTitle: "Active listening is not",
          negativeItems: ["Planning your reply while they speak", "Interrupting to fix the problem", "Turning every feeling into a lecture"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "Stop complaining and listen to me.",
            trySaying: "I hear that you are upset. Tell me the part that feels unfair.",
          },
          stepsTitle: "How to listen actively in 3 steps",
          steps: [
            {
              title: "Attend",
              body: "Put down distractions and show with your face and body that you are present.",
              prompt: "Can I give this child my attention for the next minute?",
            },
            {
              title: "Reflect",
              body: "Say back the feeling or message in your own words.",
              prompt: "It sounds like you felt...",
            },
            {
              title: "Check",
              body: "Ask whether you understood before moving to limits, solutions, or teaching.",
              prompt: "Did I get that right?",
            },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Validating Emotions",
        durationMinutes: 30,
        summary: "Validation means acknowledging someone's feelings as real, important, and understandable.",
        content: {
          whyItMatters:
            "When we validate emotions, we build trust, deepen connection, and help others feel seen and supported.",
          parentMeaningPrompt:
            "What does validating emotions mean for you, your child, and the way you want your family to feel during hard moments?",
          comparisonTitle: "What validation is and is not",
          positiveTitle: "Validation is",
          negativeTitle: "Validation is not",
          validationIs: [
            "Acknowledging the feeling",
            "Showing understanding",
            "Accepting the emotion without judgment",
          ],
          validationIsNot: [
            "Agreeing with the behavior",
            "Giving advice or solutions too soon",
            "Dismissing or minimizing their feelings",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "You're overreacting.",
            trySaying: "It makes sense that you're feeling that way.",
          },
          stepsTitle: "How to validate in 3 steps",
          steps: [
            {
              title: "Notice",
              body: "Pay attention to the emotion.",
              prompt: "What are they feeling?",
            },
            {
              title: "Acknowledge",
              body: "Name the feeling and show you understand.",
              prompt: "Use reflective, supportive language.",
            },
            {
              title: "Support",
              body: "Offer comfort and stay present.",
              prompt: "You don't need to fix it - just be there.",
            },
          ],
        },
      },
      {
        lessonNumber: 4,
        title: "Conflict Resolution",
        durationMinutes: 30,
        summary:
          "Conflict resolution means staying safe enough to understand the problem, reduce harm, and agree on the next respectful step.",
        content: {
          whyItMatters:
            "Children learn how to handle disagreement by watching adults. Safe conflict resolution teaches that problems can be addressed without fear, intimidation, blame, or withdrawal.",
          parentMeaningPrompt:
            "What does safe conflict look like in the family you are trying to build, and what patterns do you want to change?",
          comparisonTitle: "Safe conflict and unsafe conflict",
          positiveTitle: "Safe conflict is",
          positiveItems: ["Slowing the conversation down", "Naming the problem without attacking the person", "Agreeing on one next step"],
          negativeTitle: "Safe conflict is not",
          negativeItems: ["Yelling until someone gives in", "Threatening, blaming, or humiliating", "Pretending nothing happened afterward"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "You never listen. This is your fault.",
            trySaying: "We are both upset. I want to slow down and work out what needs to happen next.",
          },
          stepsTitle: "How to resolve conflict in 3 steps",
          steps: [
            {
              title: "Make it safe",
              body: "Lower intensity before trying to solve anything.",
              prompt: "Do we need space, a calmer voice, or a reset?",
            },
            {
              title: "Name the issue",
              body: "Describe the problem without attacking character or bringing in every past issue.",
              prompt: "What is the one thing we are solving now?",
            },
            {
              title: "Choose the next step",
              body: "Agree on one practical action, limit, apology, or follow-up.",
              prompt: "What can each person do next?",
            },
          ],
        },
      },
      {
        lessonNumber: 5,
        title: "Repairing Communication",
        durationMinutes: 30,
        summary:
          "Repair means coming back after a hard moment to take responsibility, rebuild safety, and reconnect.",
        content: {
          whyItMatters:
            "Every family has difficult conversations. Repair shows children that mistakes can be owned, relationships can be protected, and adults can return to safety after stress.",
          parentMeaningPrompt:
            "What does repair mean to you as a parent, and what would your child notice if repair became normal in your home?",
          comparisonTitle: "Repair and non-repair",
          positiveTitle: "Repair is",
          positiveItems: ["Taking responsibility for your part", "Naming the impact without excuses", "Showing what will be different next time"],
          negativeTitle: "Repair is not",
          negativeItems: ["Demanding instant forgiveness", "Blaming the child for your reaction", "Ignoring the moment and hoping it disappears"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I only yelled because you made me angry.",
            trySaying: "I yelled, and that was not okay. I am going to try again in a calmer voice.",
          },
          stepsTitle: "How to repair in 3 steps",
          steps: [
            {
              title: "Own your part",
              body: "Say clearly what you did that was not helpful or safe.",
              prompt: "What can I take responsibility for without blaming?",
            },
            {
              title: "Name the impact",
              body: "Acknowledge how it may have felt for the other person.",
              prompt: "That may have felt scary, unfair, or confusing.",
            },
            {
              title: "Try again",
              body: "Repeat the message in a safer way and show the next step.",
              prompt: "What will I do differently right now?",
            },
          ],
        },
      }
    ]
  },
  {
    id: "child-development-foundations",
    title: "Child Development Foundations",
    description: "Standalone course covering child milestones, development, and parenting expectations.",
    lessons: [
      {
        lessonNumber: 1,
        title: "What is Child Development?",
        durationMinutes: 30,
        summary:
          "Child development is the way children grow in their bodies, thinking, feelings, relationships, language, and independence over time.",
        content: {
          whyItMatters:
            "When parents understand development, they can set expectations that match the child's age and needs. This reduces frustration and helps children feel safer, supported, and less blamed for things they are still learning.",
          parentMeaningPrompt:
            "What does understanding child development mean for how you see your child, their behaviour, and your role as a parent?",
          comparisonTitle: "Development-aware parenting",
          positiveTitle: "Development-aware parenting is",
          positiveItems: [
            "Matching expectations to age and ability",
            "Seeing behaviour as communication",
            "Teaching skills step by step",
          ],
          negativeTitle: "Development-aware parenting is not",
          negativeItems: [
            "Expecting adult-level control from children",
            "Labelling learning needs as bad behaviour",
            "Using fear to force maturity",
          ],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "They should know better by now.",
            trySaying: "What skill is my child still learning, and how can I teach it safely?",
          },
          stepsTitle: "How to use development knowledge in 3 steps",
          steps: [
            {
              title: "Observe",
              body: "Notice what your child can do calmly, tired, stressed, and excited.",
              prompt: "When is this skill easiest or hardest for them?",
            },
            {
              title: "Adjust",
              body: "Change your expectation or support based on their age, stage, and needs.",
              prompt: "Do they need fewer steps, more practice, or help calming first?",
            },
            {
              title: "Teach",
              body: "Model and practise the skill instead of only correcting the mistake.",
              prompt: "What can I show them how to do next time?",
            },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Understanding Child Milestones",
        durationMinutes: 30,
        summary:
          "Milestones are common signs of growth, but every child develops at their own pace and may need different support.",
        content: {
          whyItMatters:
            "Milestones help parents notice progress, strengths, and areas where extra support may be needed. They are a guide, not a weapon for comparison or shame.",
          parentMeaningPrompt:
            "What milestones or abilities are you noticing in your child, and where might they need more support from you?",
          comparisonTitle: "Healthy use of milestones",
          positiveTitle: "Milestones help us",
          positiveItems: [
            "Notice growth and strengths",
            "Spot where support may help",
            "Celebrate progress over time",
          ],
          negativeTitle: "Milestones should not be used to",
          negativeItems: [
            "Compare children harshly",
            "Shame a child for delays",
            "Ignore culture, trauma, disability, or stress",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "Other kids can do this. Why can't you?",
            trySaying: "This skill is still growing. Let's practise one small part together.",
          },
          stepsTitle: "How to respond to milestones in 3 steps",
          steps: [
            {
              title: "Notice the skill",
              body: "Name what your child is learning, not only what is missing.",
              prompt: "What progress can I see?",
            },
            {
              title: "Support the gap",
              body: "Break the next skill into smaller, safer practice steps.",
              prompt: "What is the next small step?",
            },
            {
              title: "Ask for help",
              body: "Seek advice when delays, distress, or concerns persist.",
              prompt: "Who can help me understand this better?",
            },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Brain Development in Children",
        durationMinutes: 30,
        summary:
          "Children's brains are still developing, especially the parts that manage impulse control, planning, emotional regulation, and problem solving.",
        content: {
          whyItMatters:
            "When parents understand the developing brain, they can respond with teaching and co-regulation instead of expecting children to calm, plan, and reason like adults.",
          parentMeaningPrompt:
            "What does knowing your child's brain is still developing change about how you want to respond during big feelings or difficult behaviour?",
          comparisonTitle: "Brain-aware parenting",
          positiveTitle: "Brain-aware parenting is",
          positiveItems: [
            "Helping children calm before problem solving",
            "Using repetition and routine",
            "Teaching regulation through connection",
          ],
          negativeTitle: "Brain-aware parenting is not",
          negativeItems: [
            "Excusing unsafe behaviour without limits",
            "Expecting instant self-control",
            "Trying to reason during a meltdown",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "Calm down right now or else.",
            trySaying: "Your body is really upset. I am going to help you get safe first.",
          },
          stepsTitle: "How to support the developing brain in 3 steps",
          steps: [
            {
              title: "Regulate first",
              body: "Lower stress before teaching or correcting.",
              prompt: "What helps this child feel safe enough to listen?",
            },
            {
              title: "Keep it simple",
              body: "Use fewer words and clear limits when emotions are high.",
              prompt: "What is the one message they need right now?",
            },
            {
              title: "Repeat with warmth",
              body: "Practise skills many times with patience and consistency.",
              prompt: "How can I make this predictable?",
            },
          ],
        },
      },
      {
        lessonNumber: 4,
        title: "Attachment and Bonding",
        durationMinutes: 30,
        summary:
          "Attachment is the trust and emotional connection children build with caregivers who are safe, responsive, and consistent.",
        content: {
          whyItMatters:
            "Secure attachment helps children feel safe enough to explore, learn, return for comfort, and recover from stress. Bonding is built through repeated small moments, not perfection.",
          parentMeaningPrompt:
            "What does building or repairing attachment mean for you and your child, especially after stress, separation, conflict, or hurt?",
          comparisonTitle: "Attachment-building care",
          positiveTitle: "Attachment-building care is",
          positiveItems: [
            "Responding with warmth and consistency",
            "Repairing after hard moments",
            "Being a safe base children can return to",
          ],
          negativeTitle: "Attachment-building care is not",
          negativeItems: [
            "Being perfect all the time",
            "Letting children have no limits",
            "Expecting trust to rebuild instantly",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "You're fine. Stop being clingy.",
            trySaying: "You want to know I am here. I can stay close while you settle.",
          },
          stepsTitle: "How to strengthen attachment in 3 steps",
          steps: [
            {
              title: "Show up",
              body: "Use small repeated moments of attention, comfort, and reliability.",
              prompt: "What is one predictable connection moment I can offer?",
            },
            {
              title: "Respond",
              body: "Notice needs beneath behaviour and respond with safe limits.",
              prompt: "What might my child be needing underneath this?",
            },
            {
              title: "Repair",
              body: "Come back after disconnection and make the relationship safe again.",
              prompt: "What do I need to own, explain, or redo?",
            },
          ],
        },
      }
    ]
  }
];

export function getCourseById(courseId: string) {
  return courses.find((course) => course.id === courseId) ?? null;
}

export function areAllCourseLessonsViewed(course: StandaloneCourse, viewedLessons: Record<number, boolean>) {
  return course.lessons.every((lesson) => viewedLessons[lesson.lessonNumber]);
}
