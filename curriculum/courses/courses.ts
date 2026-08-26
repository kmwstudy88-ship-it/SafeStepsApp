import { completeCourseLibrary, completeCourseLibraryCourseIds } from "./completeCourseLibrary";
import { familyMentalHealthExpandedLessons } from "./familyMentalHealthExpansion";
import { productionReadinessLessonPack } from "./productionReadinessLessonPack";
import { safestepsProductionCourses } from "./safestepsProductionCourses";
import { strongFathersStandaloneCourse } from "./strongFathersCourse";

export type CourseLesson = {
  lessonNumber: number;
  title: string;
  durationMinutes: number;
  summary?: string;
  foundationLessonId?: string;
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

export type CourseLevel = "foundational" | "intermediate" | "advanced";
export type CourseCategory =
  | "Communication"
  | "Child Safety"
  | "Parenting Skills"
  | "Emotional Regulation"
  | "Attachment"
  | "Behaviour"
  | "Family Wellbeing"
  | "Co-Parenting"
  | "Trauma"
  | "Life Skills"
  | "Other";

export type StandaloneCourse = {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
  category?: CourseCategory;
  level?: CourseLevel;
  composedFromLessonIds?: string[];
};

export type CourseArea = {
  id: string;
  title: string;
  description: string;
  courseIds: string[];
  suggestedStartCourseId: string;
};

export const courses: StandaloneCourse[] = [
  ...completeCourseLibrary,
  ...safestepsProductionCourses,
  productionReadinessLessonPack,
  strongFathersStandaloneCourse,
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
  },
  {
    id: "positive-parenting-foundations",
    title: "Positive Parenting Foundations",
    description: "Standalone course teaching encouragement, boundaries, reinforcement, and positive family culture.",
    lessons: [
      {
        lessonNumber: 1,
        title: "What is Positive Parenting?",
        durationMinutes: 30,
        summary:
          "Positive parenting means leading children with warmth, clear limits, teaching, encouragement, and repair instead of fear or shame.",
        content: {
          whyItMatters:
            "Positive parenting helps children feel safe enough to learn while still understanding boundaries. It gives parents a steady way to guide behaviour without losing connection.",
          parentMeaningPrompt:
            "What does positive parenting mean for the kind of parent you want to be and the kind of safety you want your child to feel?",
          comparisonTitle: "Positive parenting and permissive parenting",
          positiveTitle: "Positive parenting is",
          positiveItems: [
            "Warmth with clear limits",
            "Teaching skills instead of only punishing mistakes",
            "Repairing after difficult moments",
          ],
          negativeTitle: "Positive parenting is not",
          negativeItems: [
            "Letting children do anything they want",
            "Ignoring unsafe behaviour",
            "Trying to be perfect all the time",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "You are always naughty.",
            trySaying: "That choice was not okay. I will help you practise a safer one.",
          },
          stepsTitle: "How to practise positive parenting in 3 steps",
          steps: [
            {
              title: "Connect",
              body: "Start with calm presence so your child can hear you.",
              prompt: "Can I lower the stress before I correct?",
            },
            {
              title: "Guide",
              body: "Name the limit and the safer behaviour clearly.",
              prompt: "What do I want my child to do instead?",
            },
            {
              title: "Follow through",
              body: "Use steady, respectful consequences and repair when needed.",
              prompt: "How can I be firm without being frightening?",
            },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Positive Reinforcement",
        durationMinutes: 30,
        summary:
          "Positive reinforcement means noticing and encouraging helpful behaviour so children understand what to repeat.",
        content: {
          whyItMatters:
            "Children often receive the most attention when something goes wrong. Reinforcement helps parents notice effort, progress, and safe choices before behaviour escalates.",
          parentMeaningPrompt:
            "What would it mean for your child if you noticed their effort and safe choices more often?",
          comparisonTitle: "Helpful praise and unhelpful praise",
          positiveTitle: "Helpful reinforcement is",
          positiveItems: [
            "Specific about the behaviour",
            "Connected to effort and progress",
            "Used alongside clear boundaries",
          ],
          negativeTitle: "Helpful reinforcement is not",
          negativeItems: [
            "Only praising perfect behaviour",
            "Using rewards to avoid limits",
            "Ignoring big feelings or safety needs",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "Finally, you did what I asked.",
            trySaying: "I noticed you came back when I called. That helped keep you safe.",
          },
          stepsTitle: "How to reinforce positive behaviour in 3 steps",
          steps: [
            {
              title: "Notice",
              body: "Look for small moments of effort, cooperation, honesty, or calming.",
              prompt: "What did my child do that moved in the right direction?",
            },
            {
              title: "Name it",
              body: "Say exactly what you noticed so the behaviour is clear.",
              prompt: "I noticed you...",
            },
            {
              title: "Repeat",
              body: "Make encouragement part of daily routines, not only special moments.",
              prompt: "Where can I add one more positive notice today?",
            },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Creating a Positive Family Culture",
        durationMinutes: 30,
        summary:
          "Family culture is the pattern of how people speak, solve problems, show care, handle stress, and recover after conflict.",
        content: {
          whyItMatters:
            "A positive family culture gives children predictable safety. It helps parents build routines, values, and relationship habits that can continue after programs finish.",
          parentMeaningPrompt:
            "What kind of family culture are you trying to build, and what would your child notice if that culture became stronger?",
          comparisonTitle: "A positive family culture",
          positiveTitle: "A positive family culture includes",
          positiveItems: [
            "Predictable routines and expectations",
            "Respectful words during stress",
            "Regular repair and reconnection",
          ],
          negativeTitle: "A positive family culture does not rely on",
          negativeItems: [
            "Fear to get cooperation",
            "Silence after conflict",
            "One person carrying all responsibility",
          ],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "This family just does not work.",
            trySaying: "We can build one safer routine and one repair habit at a time.",
          },
          stepsTitle: "How to build family culture in 3 steps",
          steps: [
            {
              title: "Choose values",
              body: "Name the values you want your home to practise, such as safety, respect, honesty, or repair.",
              prompt: "What do I want this home to stand for?",
            },
            {
              title: "Build routines",
              body: "Turn values into small repeated actions that children can predict.",
              prompt: "What routine can show this value every day?",
            },
            {
              title: "Repair quickly",
              body: "When the culture slips, return to the value and practise again.",
              prompt: "How do we come back to safety after a hard moment?",
            },
          ],
        },
      },
    ],
  },
  {
    id: "attachment-and-bonding-foundations",
    title: "Attachment and Bonding Foundations",
    description: "Standalone course teaching secure attachment, daily trust-building, and repair after disconnection.",
    lessons: [
      {
        lessonNumber: 1,
        title: "What is Attachment?",
        durationMinutes: 30,
        summary:
          "Attachment is the emotional bond children build with caregivers who are safe, responsive, predictable, and available.",
        content: {
          whyItMatters:
            "Secure attachment helps children trust that adults will protect, comfort, guide, and return after hard moments. It gives children a safer base for learning, behaviour, and relationships.",
          parentMeaningPrompt:
            "What does attachment mean for the relationship you want with your child, especially if trust has been strained or interrupted?",
          comparisonTitle: "Secure attachment and insecure patterns",
          positiveTitle: "Secure attachment is built through",
          positiveItems: [
            "Comfort when children are distressed",
            "Predictable care and follow-through",
            "Repair after disconnection",
          ],
          negativeTitle: "Secure attachment is not built through",
          negativeItems: [
            "Ignoring a child's need for comfort",
            "Using fear to get closeness or control",
            "Expecting trust without repeated safety",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "You do not need me. Stop acting like a baby.",
            trySaying: "You need some closeness right now. I can help you feel safe.",
          },
          stepsTitle: "How to support attachment in 3 steps",
          steps: [
            {
              title: "Notice bids",
              body: "Look for the ways your child asks for comfort, help, attention, or reassurance.",
              prompt: "How does my child show me they need connection?",
            },
            {
              title: "Respond warmly",
              body: "Offer calm attention before moving into teaching or limits.",
              prompt: "Can I show safety before I correct?",
            },
            {
              title: "Repeat safety",
              body: "Build trust through many small reliable moments over time.",
              prompt: "What is one safe response I can repeat this week?",
            },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Building Trust Through Daily Care",
        durationMinutes: 30,
        summary:
          "Trust grows when children experience repeated daily care that is reliable, respectful, and emotionally safe.",
        content: {
          whyItMatters:
            "Children learn trust through patterns. Small routines like listening, keeping promises, showing up, and staying calm can matter as much as big conversations.",
          parentMeaningPrompt:
            "What daily care habits could help your child experience you as more predictable, safe, and trustworthy?",
          comparisonTitle: "Trust-building daily care",
          positiveTitle: "Trust-building care includes",
          positiveItems: [
            "Doing what you said you would do",
            "Showing interest in the child's world",
            "Keeping routines steady where possible",
          ],
          negativeTitle: "Trust-building care does not include",
          negativeItems: [
            "Making promises you cannot keep",
            "Only showing interest during problems",
            "Using care as a reward or withdrawal as punishment",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I forgot again. It is not a big deal.",
            trySaying: "I said I would do that and I missed it. I am sorry. Here is how I will repair it.",
          },
          stepsTitle: "How to build trust through care in 3 steps",
          steps: [
            {
              title: "Choose one routine",
              body: "Pick one daily moment where your child can count on you.",
              prompt: "Which routine can I make more predictable?",
            },
            {
              title: "Follow through",
              body: "Keep the commitment small enough that you can do it consistently.",
              prompt: "What promise can I realistically keep?",
            },
            {
              title: "Name reliability",
              body: "Help your child notice the pattern without demanding trust immediately.",
              prompt: "How can I show consistency instead of asking for it?",
            },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Repairing Attachment Ruptures",
        durationMinutes: 30,
        summary:
          "An attachment rupture is a break in connection caused by fear, conflict, absence, broken trust, or unmet needs.",
        content: {
          whyItMatters:
            "Repair teaches children that relationships can return to safety after hurt. For reunification and family recovery, repeated repair is often more important than trying to erase the past.",
          parentMeaningPrompt:
            "What does repairing connection mean for you and your child after hurt, separation, conflict, or broken trust?",
          comparisonTitle: "Real repair and false repair",
          positiveTitle: "Real repair includes",
          positiveItems: [
            "Taking responsibility for your part",
            "Listening to the child's experience",
            "Showing change through repeated actions",
          ],
          negativeTitle: "Real repair is not",
          negativeItems: [
            "Demanding the child move on quickly",
            "Explaining away the hurt",
            "Expecting one apology to rebuild trust",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I said sorry, so you should be over it.",
            trySaying: "I understand trust may take time. I will keep showing you safety in my actions.",
          },
          stepsTitle: "How to repair attachment in 3 steps",
          steps: [
            {
              title: "Own the rupture",
              body: "Name what happened without blaming the child for the disconnection.",
              prompt: "What part can I take responsibility for?",
            },
            {
              title: "Listen first",
              body: "Make room for the child's feelings before asking for closeness.",
              prompt: "What might my child need me to understand?",
            },
            {
              title: "Show change",
              body: "Repair becomes believable when the child sees safer patterns repeated.",
              prompt: "What action can I repeat to rebuild trust?",
            },
          ],
        },
      },
    ],
  },
  {
    id: "behaviour-management-foundations",
    title: "Behaviour Management Foundations",
    description: "Standalone course teaching behaviour as communication, predictable boundaries, and calm responses.",
    lessons: [
      {
        lessonNumber: 1,
        title: "Behaviour as Communication",
        durationMinutes: 30,
        summary:
          "Behaviour is often a child's way of communicating feelings, needs, stress, skills they do not yet have, or problems they cannot explain.",
        content: {
          whyItMatters:
            "When parents look beneath behaviour, they can respond to the need while still setting safe limits. This reduces blame and helps children learn better ways to communicate.",
          parentMeaningPrompt:
            "What does it mean for you as a parent to see behaviour as communication instead of only disobedience?",
          comparisonTitle: "Behaviour-aware parenting",
          positiveTitle: "Behaviour-aware parenting is",
          positiveItems: [
            "Looking for the need underneath the behaviour",
            "Teaching replacement skills",
            "Keeping limits clear and calm",
          ],
          negativeTitle: "Behaviour-aware parenting is not",
          negativeItems: [
            "Excusing unsafe behaviour",
            "Labelling the child as bad",
            "Ignoring patterns or triggers",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "You are just doing this to annoy me.",
            trySaying: "Something is hard right now. The limit still stands, and I will help you use safer words.",
          },
          stepsTitle: "How to read behaviour in 3 steps",
          steps: [
            {
              title: "Pause",
              body: "Slow your reaction so you can observe before responding.",
              prompt: "What happened right before this behaviour?",
            },
            {
              title: "Look underneath",
              body: "Consider feelings, tiredness, hunger, fear, skill gaps, or unmet needs.",
              prompt: "What might my child be trying to communicate?",
            },
            {
              title: "Teach the next skill",
              body: "Show the child a safer way to ask, cope, wait, repair, or express feelings.",
              prompt: "What can I teach instead of only punish?",
            },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Boundaries and Routines",
        durationMinutes: 30,
        summary:
          "Boundaries and routines help children know what is expected, what happens next, and how adults will respond.",
        content: {
          whyItMatters:
            "Predictable boundaries reduce confusion and power struggles. Routines help children feel safer because they do not have to guess what will happen next.",
          parentMeaningPrompt:
            "What boundaries or routines would help your child feel safer and help you stay calmer as a parent?",
          comparisonTitle: "Healthy boundaries and routines",
          positiveTitle: "Healthy boundaries are",
          positiveItems: [
            "Clear before problems happen",
            "Connected to safety and learning",
            "Followed through consistently",
          ],
          negativeTitle: "Healthy boundaries are not",
          negativeItems: [
            "Threats made in anger",
            "Rules that change without explanation",
            "Punishment without teaching",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "If you do not stop, you will be in trouble.",
            trySaying: "The rule is walking inside. If running continues, we will move to a quieter space.",
          },
          stepsTitle: "How to set boundaries in 3 steps",
          steps: [
            {
              title: "Name the rule",
              body: "Use short, clear language before the situation escalates.",
              prompt: "What is the simple safety rule?",
            },
            {
              title: "Name the next step",
              body: "Explain what will happen if the boundary is not followed.",
              prompt: "What is the calm follow-through?",
            },
            {
              title: "Repeat calmly",
              body: "Keep your tone steady and return to the routine after the limit.",
              prompt: "How can I stay predictable right now?",
            },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Responding Without Escalation",
        durationMinutes: 30,
        summary:
          "Responding without escalation means staying regulated enough to reduce harm, hold limits, and teach the next safe step.",
        content: {
          whyItMatters:
            "Escalation can make children feel unsafe and can turn small problems into bigger conflict. Calm responses help parents protect the relationship while still guiding behaviour.",
          parentMeaningPrompt:
            "What does responding without escalation mean for your safety, your child's safety, and the home you want to build?",
          comparisonTitle: "De-escalating responses",
          positiveTitle: "De-escalation includes",
          positiveItems: [
            "Lowering your voice and pace",
            "Using fewer words",
            "Choosing safety before winning",
          ],
          negativeTitle: "De-escalation does not include",
          negativeItems: [
            "Arguing until the child agrees",
            "Matching the child's intensity",
            "Using shame to force control",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "Do not talk back to me.",
            trySaying: "I will listen when voices are calmer. The limit is still the same.",
          },
          stepsTitle: "How to respond without escalation in 3 steps",
          steps: [
            {
              title: "Regulate yourself",
              body: "Notice your body, breathing, voice, and urge to react.",
              prompt: "What do I need to do to stay safe and steady?",
            },
            {
              title: "Reduce words",
              body: "Use one clear message instead of a long argument.",
              prompt: "What is the one limit or next step?",
            },
            {
              title: "Return later",
              body: "Teach, repair, or problem-solve after everyone is calmer.",
              prompt: "What conversation can wait until regulation returns?",
            },
          ],
        },
      },
    ],
  },
  {
    id: "demonstrating-change-self-managed-safety",
    title: "Demonstrating Change and Self-Managed Safety",
    description:
      "Standalone course helping parents show behaviour-based change, manage risk early, and build evidence of safety over time.",
    lessons: [
      {
        lessonNumber: 1,
        title: "Change is Shown Through Behaviour",
        durationMinutes: 30,
        summary:
          "Demonstrating change means showing safe decisions, stable routines, protective actions, and repair over time.",
        content: {
          whyItMatters:
            "Parents may not agree with every system concern, but safety is still assessed through observable behaviour. Clear actions help show what has changed beyond words, intentions, or attendance.",
          parentMeaningPrompt:
            "What does demonstrating change through behaviour mean for you, your child, and the future you are working toward?",
          comparisonTitle: "Promises and demonstrated change",
          positiveTitle: "Demonstrated change includes",
          positiveItems: [
            "Safe decisions under stress",
            "Protective routines repeated over time",
            "Evidence that shows what changed",
          ],
          negativeTitle: "Demonstrated change is not",
          negativeItems: [
            "Only saying things will be different",
            "Attending sessions without practising skills",
            "Blaming others instead of showing safer actions",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try showing",
            insteadOf: "I have changed, so everyone should trust me now.",
            trySaying: "Here are the safe choices, routines, and support steps I have repeated this month.",
          },
          stepsTitle: "How to demonstrate change in 3 steps",
          steps: [
            {
              title: "Choose one behaviour",
              body: "Pick one action connected to safety, stability, or repair.",
              prompt: "What behaviour would show safer parenting this week?",
            },
            {
              title: "Repeat it",
              body: "Practise the action consistently so it becomes a pattern.",
              prompt: "How can I repeat this without waiting for a crisis?",
            },
            {
              title: "Record it",
              body: "Save a note, reflection, task, or evidence item that explains what happened.",
              prompt: "What evidence fairly shows this change?",
            },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Self-Managed Safety",
        durationMinutes: 30,
        summary:
          "Self-managed safety means recognising risk early, responding before problems escalate, and using supports without waiting for formal intervention.",
        content: {
          whyItMatters:
            "After formal oversight reduces or ends, families still need a safety net. Self-managed safety shows that parents can notice concerns, seek help, and protect children through ordinary life stress.",
          parentMeaningPrompt:
            "What does self-managed safety mean for how you notice stress, ask for support, and protect your child before problems grow?",
          comparisonTitle: "Self-managed safety and unmanaged risk",
          positiveTitle: "Self-managed safety is",
          positiveItems: [
            "Recognising warning signs early",
            "Using support before crisis",
            "Maintaining safety routines during stress",
          ],
          negativeTitle: "Self-managed safety is not",
          negativeItems: [
            "Pretending risk can never return",
            "Waiting until someone else intervenes",
            "Handling every problem alone",
          ],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "The case is over, so I do not need to watch for risk anymore.",
            trySaying: "Life still brings stress. I can notice early signs and use support before things escalate.",
          },
          stepsTitle: "How to manage safety in 3 steps",
          steps: [
            {
              title: "Notice early signs",
              body: "Pay attention to stress, conflict, substance use risk, isolation, or routine breakdown.",
              prompt: "What warning sign tells me I need support?",
            },
            {
              title: "Act early",
              body: "Use a safe response before risk becomes serious.",
              prompt: "Who can I call, what routine can I reset, or what boundary needs to happen?",
            },
            {
              title: "Review",
              body: "After the moment passes, reflect on what worked and what needs strengthening.",
              prompt: "What did I do that kept my child safer?",
            },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Building an Evidence Portfolio",
        durationMinutes: 30,
        summary:
          "An evidence portfolio is a clear collection of records that shows safe behaviour, stability, help-seeking, and protective parenting over time.",
        content: {
          whyItMatters:
            "Progress is easier to understand when it is documented. Evidence helps turn scattered actions into a visible story of consistency, accountability, and child-focused change.",
          parentMeaningPrompt:
            "What evidence could fairly show the safe changes you are making without pretending everything is perfect?",
          comparisonTitle: "Useful and weak evidence",
          positiveTitle: "Useful evidence can include",
          positiveItems: [
            "Contact, attendance, or service records",
            "Routine logs and parenting reflections",
            "Examples of safe decisions during stress",
          ],
          negativeTitle: "Weak evidence relies on",
          negativeItems: [
            "Vague statements with no examples",
            "Only one good day",
            "Records that ignore safety concerns",
          ],
          example: {
            insteadOfLabel: "Instead of saving",
            trySayingLabel: "Try saving",
            insteadOf: "Everything is fine now.",
            trySaying: "This week I used my bedtime routine four nights and called support before conflict escalated.",
          },
          stepsTitle: "How to build evidence in 3 steps",
          steps: [
            {
              title: "Name the change",
              body: "Write the specific behaviour or routine you are trying to show.",
              prompt: "What change am I documenting?",
            },
            {
              title: "Attach the proof",
              body: "Add a note, photo, record, certificate, message, or task completion.",
              prompt: "What record supports this?",
            },
            {
              title: "Explain the meaning",
              body: "Connect the evidence to child safety, stability, repair, or support.",
              prompt: "Why does this matter for my child?",
            },
          ],
        },
      },
      {
        lessonNumber: 4,
        title: "Repair After Setbacks",
        durationMinutes: 30,
        summary:
          "A setback does not have to become a pattern if the parent notices it, takes responsibility, repairs harm, and changes the next response.",
        content: {
          whyItMatters:
            "Families may struggle, improve, struggle again, and recover. What matters is whether risk is recognised early and whether the parent responds in a protective, accountable way.",
          parentMeaningPrompt:
            "What does repair after setbacks mean for the parent you want to become and the safety your child needs to trust?",
          comparisonTitle: "Repair and repeat risk",
          positiveTitle: "Repair after setbacks includes",
          positiveItems: [
            "Acknowledging what happened",
            "Taking responsibility without blaming the child",
            "Changing the support plan or routine",
          ],
          negativeTitle: "Repeat risk can look like",
          negativeItems: [
            "Minimising the concern",
            "Hiding problems until they escalate",
            "Returning to old unsafe patterns",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "It was not a big deal, so I do not need to change anything.",
            trySaying: "That was a warning sign. I need to repair, adjust my plan, and use support earlier next time.",
          },
          stepsTitle: "How to repair a setback in 3 steps",
          steps: [
            {
              title: "Name it clearly",
              body: "Describe what happened and how it may have affected safety or trust.",
              prompt: "What happened without excuses?",
            },
            {
              title: "Repair the impact",
              body: "Use apology, support, boundaries, or practical action to reduce harm.",
              prompt: "What does my child or family need now?",
            },
            {
              title: "Update the plan",
              body: "Change the routine, support, or response so the pattern is less likely to repeat.",
              prompt: "What will I do earlier next time?",
            },
          ],
        },
      },
    ],
  },
  {
    id: "child-safety-foundations",
    title: "Child Safety Foundations",
    description: "Standalone course teaching everyday child safety, safer home routines, and evidence of protective care.",
    lessons: [
      {
        lessonNumber: 1,
        title: "Everyday Child Safety",
        durationMinutes: 30,
        summary:
          "Everyday child safety means noticing risks, supervising appropriately, and making small protective decisions throughout normal family life.",
        content: {
          whyItMatters:
            "Safety is not only about emergencies. Children feel safer when adults notice hazards, respond calmly, and make protective choices before problems grow.",
          parentMeaningPrompt:
            "What does everyday child safety mean in your home, and what do you want your child to experience as safe care?",
          comparisonTitle: "Everyday safety and unmanaged risk",
          positiveTitle: "Everyday safety includes",
          positiveItems: [
            "Supervision that matches the child's age and needs",
            "Noticing hazards before they become incidents",
            "Calm responses when something feels unsafe",
          ],
          negativeTitle: "Everyday safety is not",
          negativeItems: [
            "Waiting until something serious happens",
            "Expecting children to manage adult-level risk",
            "Ignoring stress, conflict, or unsafe people around the child",
          ],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "Nothing bad has happened, so this is fine.",
            trySaying: "What could become unsafe here, and what small step can I take now?",
          },
          stepsTitle: "How to practise everyday safety in 3 steps",
          steps: [
            {
              title: "Scan",
              body: "Look around for physical, emotional, relational, or supervision risks.",
              prompt: "What needs my attention before it becomes a problem?",
            },
            {
              title: "Reduce risk",
              body: "Make one practical change that lowers the chance of harm.",
              prompt: "What can I move, pause, check, or change right now?",
            },
            {
              title: "Explain calmly",
              body: "Use simple words so your child understands the safety reason.",
              prompt: "How can I teach safety without frightening or shaming?",
            },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Home Safety Routines",
        durationMinutes: 30,
        summary:
          "Home safety routines are repeated habits that make the home more predictable, supervised, and child-aware.",
        content: {
          whyItMatters:
            "Routines reduce chaos and help parents keep safety visible even when life is stressful. A simple routine can protect children more reliably than waiting for perfect conditions.",
          parentMeaningPrompt:
            "What home safety routine would make your home feel more stable, predictable, and protective for your child?",
          comparisonTitle: "Protective routines and unsafe routines",
          positiveTitle: "Protective routines are",
          positiveItems: [
            "Simple enough to repeat",
            "Connected to real safety needs",
            "Adjusted as children grow",
          ],
          negativeTitle: "Protective routines are not",
          negativeItems: [
            "Rules that only happen when someone is watching",
            "Complicated plans no one can maintain",
            "Routines that ignore the child's age, trauma, or needs",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "Just be careful.",
            trySaying: "Shoes stay by the door, medicines stay locked away, and we check the gate before outside play.",
          },
          stepsTitle: "How to build a home safety routine in 3 steps",
          steps: [
            {
              title: "Pick one area",
              body: "Start with one place or time, such as bedtime, morning, kitchen, bathroom, or outside play.",
              prompt: "Where does safety break down most often?",
            },
            {
              title: "Make it visible",
              body: "Use a checklist, reminder, shared rule, or repeated phrase.",
              prompt: "How will I remember this when I am tired or stressed?",
            },
            {
              title: "Practise daily",
              body: "Repeat the routine until it becomes normal family behaviour.",
              prompt: "What can I practise for one week?",
            },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Showing Safety Over Time",
        durationMinutes: 30,
        summary:
          "Showing safety over time means recording repeated protective actions, stable routines, and safe decisions so progress is visible.",
        content: {
          whyItMatters:
            "One safe moment matters, but repeated safe patterns show reliability. Evidence of safety helps parents, workers, and families see what has actually changed.",
          parentMeaningPrompt:
            "What would fairly show that your child is safer with you over time, not just in one good moment?",
          comparisonTitle: "Evidence of safety",
          positiveTitle: "Safety evidence can show",
          positiveItems: [
            "Repeated routines completed",
            "Hazards reduced or managed",
            "Support used before risk escalated",
          ],
          negativeTitle: "Safety evidence should not rely on",
          negativeItems: [
            "A single good day",
            "Statements with no examples",
            "Ignoring incidents or warning signs",
          ],
          example: {
            insteadOfLabel: "Instead of saving",
            trySayingLabel: "Try saving",
            insteadOf: "The house is safe now.",
            trySaying: "This week I completed the bedtime safety routine five nights and fixed the broken lock before outside play.",
          },
          stepsTitle: "How to show safety in 3 steps",
          steps: [
            {
              title: "Record the action",
              body: "Write what you did, when you did it, and what risk it reduced.",
              prompt: "What protective action happened today?",
            },
            {
              title: "Connect it to the child",
              body: "Explain how the action helped your child feel safer, supervised, or supported.",
              prompt: "Why did this matter for my child?",
            },
            {
              title: "Build a pattern",
              body: "Save repeated examples so safety can be seen across time.",
              prompt: "What will I repeat next week?",
            },
          ],
        },
      },
    ],
  },
  {
    id: "family-routines-and-structure",
    title: "Family Routines and Structure",
    description: "Standalone course teaching predictable routines, calmer transitions, and structure during hard weeks.",
    lessons: [
      {
        lessonNumber: 1,
        title: "Why Routines Matter",
        durationMinutes: 30,
        summary:
          "Routines are repeated patterns that help children know what happens next and help parents respond with more consistency.",
        content: {
          whyItMatters:
            "Predictable routines reduce stress because children do not have to guess what adults expect. They also help parents show stability through repeated daily actions.",
          parentMeaningPrompt:
            "What does having predictable routines mean for your child, your stress level, and the kind of home you are trying to build?",
          comparisonTitle: "Helpful routines and rigid routines",
          positiveTitle: "Helpful routines are",
          positiveItems: [
            "Predictable but flexible",
            "Simple enough to repeat",
            "Connected to safety, care, and connection",
          ],
          negativeTitle: "Helpful routines are not",
          negativeItems: [
            "Punishment when life gets messy",
            "So strict that children feel trapped",
            "A way to ignore feelings or needs",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "Why can't this family ever get organised?",
            trySaying: "We can start with one small routine that makes tomorrow easier.",
          },
          stepsTitle: "How to begin a routine in 3 steps",
          steps: [
            {
              title: "Pick one moment",
              body: "Choose one daily time that creates stress, such as morning, meals, homework, or bedtime.",
              prompt: "Where would predictability help most?",
            },
            {
              title: "Keep it simple",
              body: "Use two or three clear steps instead of a complicated plan.",
              prompt: "What are the smallest repeatable steps?",
            },
            {
              title: "Practise gently",
              body: "Repeat the routine and repair when it goes off track.",
              prompt: "How can I return to the routine without shame?",
            },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Morning, Meal, and Bedtime Routines",
        durationMinutes: 30,
        summary:
          "Daily routines around waking, eating, and sleeping create anchors that support regulation, connection, and safety.",
        content: {
          whyItMatters:
            "Children often struggle most during transitions. Clear routines help them prepare, cooperate, and recover because the adult response becomes calmer and more predictable.",
          parentMeaningPrompt:
            "Which daily routine would make the biggest difference for your child if it became calmer and more predictable?",
          comparisonTitle: "Daily routine anchors",
          positiveTitle: "Routine anchors include",
          positiveItems: [
            "A clear start and finish",
            "Simple choices where possible",
            "Calm reminders before transitions",
          ],
          negativeTitle: "Routine anchors do not include",
          negativeItems: [
            "Rushing until everyone escalates",
            "Changing expectations every day",
            "Using threats as the main reminder",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "Hurry up or everything is ruined.",
            trySaying: "First shoes, then bag, then we leave. I will help with the first step.",
          },
          stepsTitle: "How to strengthen a daily routine in 3 steps",
          steps: [
            {
              title: "Prepare",
              body: "Set up what you can before the hard moment begins.",
              prompt: "What can be ready before morning, meals, or bedtime?",
            },
            {
              title: "Cue",
              body: "Use the same calm phrase or visual reminder each time.",
              prompt: "What phrase can my child learn to expect?",
            },
            {
              title: "Close",
              body: "End with connection, praise for effort, or a repair if things were hard.",
              prompt: "How can I help the routine end safely?",
            },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Keeping Routines During Hard Weeks",
        durationMinutes: 30,
        summary:
          "Hard weeks happen. Keeping routines during stress means protecting the most important anchors and asking for support early.",
        content: {
          whyItMatters:
            "Routines are most protective when life becomes stressful. Even a simplified routine can help children feel that adults are still present, organised, and safe.",
          parentMeaningPrompt:
            "What routine matters most when your family is under pressure, and what support would help you keep it going?",
          comparisonTitle: "Hard-week routines",
          positiveTitle: "Hard-week routines are",
          positiveItems: [
            "Reduced to the essentials",
            "Supported by people or reminders",
            "Restarted after setbacks",
          ],
          negativeTitle: "Hard-week routines are not",
          negativeItems: [
            "Giving up because one day went badly",
            "Pretending stress is not affecting the family",
            "Expecting children to manage adult chaos",
          ],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "I failed because the routine broke.",
            trySaying: "The routine broke today. I can restart with one safe anchor tonight.",
          },
          stepsTitle: "How to protect routines in 3 steps",
          steps: [
            {
              title: "Choose essentials",
              body: "Keep the routines that most affect safety, sleep, food, school, or connection.",
              prompt: "What cannot disappear when things are hard?",
            },
            {
              title: "Ask early",
              body: "Use support before stress turns into a bigger safety issue.",
              prompt: "Who can help me hold this routine?",
            },
            {
              title: "Restart",
              body: "Return to the routine after disruption without blame.",
              prompt: "What is the next safe step back into structure?",
            },
          ],
        },
      },
    ],
  },
  {
    id: "reunification-parenting-foundations",
    title: "Reunification Parenting Foundations",
    description:
      "Standalone course teaching reunification expectations, repair after separation, and evidence of readiness.",
    lessons: [
      {
        lessonNumber: 1,
        title: "What Reunification Asks of Parents",
        durationMinutes: 30,
        summary:
          "Reunification asks parents to show safe, consistent, child-focused change over time, not just hope or intention.",
        content: {
          whyItMatters:
            "Children need safety, predictability, and trust to rebuild after separation. Reunification planning focuses on what the parent can show through repeated behaviour and protective decisions.",
          parentMeaningPrompt:
            "What does reunification ask of you as a parent, and what safe changes do you want your child to be able to trust?",
          comparisonTitle: "Reunification readiness",
          positiveTitle: "Reunification readiness includes",
          positiveItems: [
            "Consistent safe behaviour",
            "Child-focused decisions",
            "Willingness to use support and accountability",
          ],
          negativeTitle: "Reunification readiness is not",
          negativeItems: [
            "Only wanting the child home",
            "Rushing past the child's feelings",
            "Expecting trust without evidence of change",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I should get my child back because I love them.",
            trySaying: "I love my child, and I am showing safety through routines, repair, and support.",
          },
          stepsTitle: "How to work toward readiness in 3 steps",
          steps: [
            {
              title: "Understand concerns",
              body: "Name the safety concerns without reducing them to blame or shame.",
              prompt: "What needs to be safer for my child?",
            },
            {
              title: "Practise change",
              body: "Use daily actions that show stability, accountability, and protection.",
              prompt: "What behaviour can I repeat this week?",
            },
            {
              title: "Show evidence",
              body: "Record the routines, supports, and safer decisions that show change over time.",
              prompt: "What evidence would fairly show progress?",
            },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Repairing Relationships After Separation",
        durationMinutes: 30,
        summary:
          "Repair after separation means rebuilding trust through patience, listening, safe contact, and repeated child-focused actions.",
        content: {
          whyItMatters:
            "Separation can leave children with mixed feelings, worry, anger, loyalty pressure, or confusion. Repair helps parents respond to the child's experience instead of demanding immediate closeness.",
          parentMeaningPrompt:
            "What does repairing your relationship after separation mean for how you listen, respond, and rebuild trust with your child?",
          comparisonTitle: "Repair after separation",
          positiveTitle: "Repair includes",
          positiveItems: [
            "Listening to the child's feelings",
            "Taking responsibility for your part",
            "Letting trust rebuild at the child's pace",
          ],
          negativeTitle: "Repair is not",
          negativeItems: [
            "Pressuring the child to move on",
            "Speaking negatively about other adults",
            "Using contact time to process adult conflict",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "You should be happy to see me.",
            trySaying: "It is okay to have mixed feelings. I am here to listen and keep this time safe.",
          },
          stepsTitle: "How to repair after separation in 3 steps",
          steps: [
            {
              title: "Make contact safe",
              body: "Use calm tone, predictable structure, and child-friendly expectations.",
              prompt: "What would help my child feel safer during contact?",
            },
            {
              title: "Listen without pressure",
              body: "Let the child have their feelings without correcting them too quickly.",
              prompt: "What feeling might my child need me to hear?",
            },
            {
              title: "Repeat reliability",
              body: "Show up, follow through, and repair small ruptures consistently.",
              prompt: "What can I do repeatedly to rebuild trust?",
            },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Evidence of Reunification Readiness",
        durationMinutes: 30,
        summary:
          "Evidence of reunification readiness shows that safe parenting, stability, support use, and repair are becoming reliable patterns.",
        content: {
          whyItMatters:
            "Reunification decisions are strengthened by clear evidence of safe change. A strong record shows not only what the parent learned, but what the parent can now do consistently.",
          parentMeaningPrompt:
            "What evidence could show that your child would be safer, more supported, and more stable with you over time?",
          comparisonTitle: "Readiness evidence",
          positiveTitle: "Readiness evidence can show",
          positiveItems: [
            "Stable routines over time",
            "Safe contact or parenting practice",
            "Support used before risk escalates",
          ],
          negativeTitle: "Readiness evidence should not rely on",
          negativeItems: [
            "One good visit",
            "Promises without examples",
            "Ignoring setbacks or concerns",
          ],
          example: {
            insteadOfLabel: "Instead of saving",
            trySayingLabel: "Try saving",
            insteadOf: "I am ready now.",
            trySaying: "Here are four weeks of routines, support calls, safe contact notes, and repaired setbacks.",
          },
          stepsTitle: "How to build readiness evidence in 3 steps",
          steps: [
            {
              title: "Choose domains",
              body: "Track safety, routines, contact, support use, and child-focused repair.",
              prompt: "Which readiness area needs more evidence?",
            },
            {
              title: "Save examples",
              body: "Record specific actions rather than broad claims.",
              prompt: "What happened, when, and why did it matter?",
            },
            {
              title: "Review patterns",
              body: "Look for consistency, gaps, and next steps.",
              prompt: "What does my evidence show over time?",
            },
          ],
        },
      },
    ],
  },
  {
    id: "trauma-informed-parenting-foundations",
    title: "Trauma-Informed Parenting Foundations",
    description:
      "Standalone course teaching trauma responses, emotional safety, and consistent repair through a parenting lens.",
    lessons: [
      {
        lessonNumber: 1,
        title: "Trauma and Child Behaviour",
        durationMinutes: 30,
        summary:
          "Trauma can shape behaviour by affecting a child's sense of safety, trust, regulation, attention, and reactions to stress.",
        content: {
          whyItMatters:
            "When parents understand trauma responses, they can respond with safety and teaching instead of only punishment. This helps children learn that adults can be steady during big feelings.",
          parentMeaningPrompt:
            "What does trauma-informed parenting mean for how you understand your child's behaviour and your own response?",
          comparisonTitle: "Trauma-aware responses",
          positiveTitle: "Trauma-aware parenting includes",
          positiveItems: [
            "Looking for fear or stress beneath behaviour",
            "Using calm, predictable responses",
            "Teaching regulation skills slowly",
          ],
          negativeTitle: "Trauma-aware parenting is not",
          negativeItems: [
            "Excusing unsafe behaviour without limits",
            "Forcing children to talk before they are ready",
            "Using fear to control behaviour",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "You are acting like this for attention.",
            trySaying: "Something feels unsafe or too big right now. I will help you calm and keep the limit clear.",
          },
          stepsTitle: "How to respond to trauma behaviour in 3 steps",
          steps: [
            {
              title: "Notice stress",
              body: "Look for signs of fear, overwhelm, shutdown, or escalation.",
              prompt: "What might my child's body be telling me?",
            },
            {
              title: "Create safety",
              body: "Use a calmer voice, fewer words, space, routine, or reassurance.",
              prompt: "What would lower the stress right now?",
            },
            {
              title: "Teach later",
              body: "Return to problem-solving after the child is calmer.",
              prompt: "What skill can wait until safety returns?",
            },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Creating Emotional Safety",
        durationMinutes: 30,
        summary:
          "Emotional safety means children can have feelings, ask for help, make mistakes, and return to connection without fear or shame.",
        content: {
          whyItMatters:
            "Children who have experienced stress or trauma need repeated experiences of safe adults. Emotional safety supports regulation, trust, communication, and learning.",
          parentMeaningPrompt:
            "What does emotional safety mean in your home, and what would your child notice if it became stronger?",
          comparisonTitle: "Emotional safety",
          positiveTitle: "Emotional safety includes",
          positiveItems: [
            "Warm tone during hard moments",
            "Feelings named without shame",
            "Limits held without intimidation",
          ],
          negativeTitle: "Emotional safety does not include",
          negativeItems: [
            "Yelling to force compliance",
            "Mocking or dismissing feelings",
            "Punishing children for needing comfort",
          ],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "Stop crying or I will give you something to cry about.",
            trySaying: "You are upset. I will stay calm, and the safety rule still stays the same.",
          },
          stepsTitle: "How to build emotional safety in 3 steps",
          steps: [
            {
              title: "Soften the entry",
              body: "Start with tone, body language, and words that lower threat.",
              prompt: "How can I make my first response safer?",
            },
            {
              title: "Name and limit",
              body: "Name the feeling and hold the boundary at the same time.",
              prompt: "What feeling and limit both need to be clear?",
            },
            {
              title: "Reconnect",
              body: "Return after the hard moment so the relationship stays safe.",
              prompt: "What repair or reassurance is needed?",
            },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Repair, Rhythm, and Recovery",
        durationMinutes: 30,
        summary:
          "Recovery is supported through repeated repair, predictable rhythms, and safe relationships that help children settle over time.",
        content: {
          whyItMatters:
            "Trauma recovery is not a single conversation. Children heal through repeated experiences of safety, routine, repair, and adults who keep coming back calmly.",
          parentMeaningPrompt:
            "What does repair, rhythm, and recovery mean for the daily parenting patterns you want to build?",
          comparisonTitle: "Recovery-supporting parenting",
          positiveTitle: "Recovery-supporting parenting includes",
          positiveItems: [
            "Predictable routines",
            "Repair after hard moments",
            "Patience with repeated practice",
          ],
          negativeTitle: "Recovery-supporting parenting is not",
          negativeItems: [
            "Expecting instant trust",
            "Changing rules based on adult mood",
            "Giving up after setbacks",
          ],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "We already talked about this, so it should be fixed.",
            trySaying: "Recovery takes repeated safety. I can practise this again with calm and consistency.",
          },
          stepsTitle: "How to support recovery in 3 steps",
          steps: [
            {
              title: "Build rhythm",
              body: "Use repeated routines that help the child know what to expect.",
              prompt: "What rhythm helps my child settle?",
            },
            {
              title: "Repair quickly",
              body: "Come back after conflict, confusion, or disconnection.",
              prompt: "What do I need to own or clarify?",
            },
            {
              title: "Track recovery",
              body: "Notice small signs of safety, trust, communication, or regulation improving.",
              prompt: "What small change shows healing may be growing?",
            },
          ],
        },
      },
    ],
  },
  {
    id: "emotional-regulation-for-parents",
    title: "Emotional Regulation for Parents",
    description: "Standalone course teaching parents to recognise escalation, calm before responding, and repair after stress.",
    lessons: [
      {
        lessonNumber: 1,
        title: "Recognising Escalation",
        durationMinutes: 30,
        summary:
          "Escalation is the build-up of stress, body signals, thoughts, tone, and actions that can lead to unsafe reactions.",
        content: {
          whyItMatters:
            "Parents can respond more safely when they notice escalation early. Recognising body signals and triggers gives the parent a chance to pause before the child experiences fear or confusion.",
          parentMeaningPrompt:
            "What does recognising escalation mean for how you protect your child from adult stress and big reactions?",
          comparisonTitle: "Recognising escalation",
          positiveTitle: "Early awareness includes",
          positiveItems: ["Noticing body tension", "Recognising trigger thoughts", "Naming when intensity is rising"],
          negativeTitle: "Escalation is harder to manage when",
          negativeItems: ["Warning signs are ignored", "Stress is blamed on the child", "The parent waits until control is lost"],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "They are making me lose it.",
            trySaying: "My body is escalating. I need to pause before I respond.",
          },
          stepsTitle: "How to notice escalation in 3 steps",
          steps: [
            { title: "Scan your body", body: "Notice jaw, hands, chest, breathing, heat, or urge to shout.", prompt: "What is my body telling me?" },
            { title: "Name the trigger", body: "Identify what story or fear is driving the reaction.", prompt: "What am I reacting to right now?" },
            { title: "Pause early", body: "Use a short break, breath, water, or support before responding.", prompt: "What pause keeps this safer?" },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Calming Before Responding",
        durationMinutes: 30,
        summary:
          "Calming before responding means lowering intensity first so correction, limits, and teaching can happen safely.",
        content: {
          whyItMatters:
            "Children learn regulation by watching adults. A calm parent can still be firm, but the child is less likely to feel threatened and more likely to learn the next safe step.",
          parentMeaningPrompt:
            "What does calming before responding mean for your parenting and the emotional safety in your home?",
          comparisonTitle: "Calm response and reactive response",
          positiveTitle: "Calming before responding includes",
          positiveItems: ["Lowering your voice", "Using fewer words", "Taking space safely"],
          negativeTitle: "Calming is not",
          negativeItems: ["Ignoring unsafe behaviour", "Walking away without returning", "Letting resentment build silently"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I am done with you.",
            trySaying: "I am too escalated to talk safely. I will come back in five minutes.",
          },
          stepsTitle: "How to calm before responding in 3 steps",
          steps: [
            { title: "Lower intensity", body: "Reduce volume, speed, and movement.", prompt: "What can I lower right now?" },
            { title: "Hold the limit", body: "Keep the safety boundary clear without arguing.", prompt: "What is the one limit?" },
            { title: "Return to teach", body: "Come back when calmer to explain, repair, or problem-solve.", prompt: "What needs to be taught later?" },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Repair After Stress",
        durationMinutes: 30,
        summary:
          "Repair after stress means acknowledging the impact of a hard moment and showing the child how safety returns.",
        content: {
          whyItMatters:
            "No parent stays calm all the time. Repair teaches children that adults can take responsibility and relationships can recover after stress without blame or fear.",
          parentMeaningPrompt:
            "What does repair after stress mean for how your child learns about mistakes, responsibility, and safety?",
          comparisonTitle: "Repair and avoidance",
          positiveTitle: "Repair includes",
          positiveItems: ["Owning your reaction", "Naming the impact", "Trying again in a safer way"],
          negativeTitle: "Repair is not",
          negativeItems: ["Blaming the child", "Demanding instant forgiveness", "Pretending nothing happened"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I yelled because you pushed me too far.",
            trySaying: "I yelled, and that was not okay. I am going to try again more calmly.",
          },
          stepsTitle: "How to repair after stress in 3 steps",
          steps: [
            { title: "Own it", body: "Say what you did without blaming the child.", prompt: "What can I take responsibility for?" },
            { title: "Reconnect", body: "Offer reassurance or space depending on what the child needs.", prompt: "What helps my child feel safe again?" },
            { title: "Plan earlier", body: "Choose one earlier signal and one safer response for next time.", prompt: "What will I do sooner?" },
          ],
        },
      },
    ],
  },
  {
    id: "parent-safety-and-stability",
    title: "Parent Safety and Stability",
    description: "Standalone course supporting parents to recognise risk, build safe routines, and use support early.",
    lessons: [
      {
        lessonNumber: 1,
        title: "Recognising Parent Safety Risks",
        durationMinutes: 30,
        summary:
          "Parent safety risks are situations, people, stressors, or patterns that can reduce a parent's ability to keep themselves and children safe.",
        content: {
          whyItMatters:
            "Parents need safety too. Recognising risks early helps parents protect children from unsafe environments, adult conflict, intimidation, instability, or crisis.",
          parentMeaningPrompt:
            "What safety risks affect your parenting capacity, and what would it mean to notice them earlier?",
          comparisonTitle: "Risk awareness",
          positiveTitle: "Risk awareness includes",
          positiveItems: ["Naming unsafe patterns", "Taking threats seriously", "Planning before crisis"],
          negativeTitle: "Risk awareness is not",
          negativeItems: ["Minimising danger", "Handling intimidation alone", "Waiting until children are exposed"],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "It will probably be fine this time.",
            trySaying: "This pattern has become unsafe before. I need a plan before it escalates.",
          },
          stepsTitle: "How to recognise risk in 3 steps",
          steps: [
            { title: "Name the pattern", body: "Identify people, places, times, or stressors linked to risk.", prompt: "What pattern has caused concern before?" },
            { title: "Check child impact", body: "Consider what the child may see, hear, feel, or lose access to.", prompt: "How could this affect my child?" },
            { title: "Act early", body: "Use support, boundaries, or safety planning before escalation.", prompt: "What can I do before crisis?" },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Safe Routines for Parent Stability",
        durationMinutes: 30,
        summary:
          "Parent stability routines help keep basic needs, support, planning, and calm responses more consistent.",
        content: {
          whyItMatters:
            "Stability is easier to show when parents have routines that support sleep, appointments, medication, meals, transport, safety planning, and help-seeking.",
          parentMeaningPrompt:
            "What routine would support your stability and make safer parenting more realistic this week?",
          comparisonTitle: "Stability routines",
          positiveTitle: "Stability routines include",
          positiveItems: ["Appointments and supports kept", "Basic needs planned", "Safety steps written down"],
          negativeTitle: "Stability routines do not include",
          negativeItems: ["Ignoring your own warning signs", "Only planning for perfect days", "Trying to prove you need no help"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I should be able to manage everything alone.",
            trySaying: "Using support early is part of keeping my child and myself stable.",
          },
          stepsTitle: "How to build stability in 3 steps",
          steps: [
            { title: "Pick one anchor", body: "Choose one routine that supports safety or wellbeing.", prompt: "What routine holds my week together?" },
            { title: "Add support", body: "Connect the routine to a person, reminder, service, or checklist.", prompt: "What helps me follow through?" },
            { title: "Track it", body: "Record completion so stability becomes visible.", prompt: "How can I show this pattern?" },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Responding to Unsafe Situations",
        durationMinutes: 30,
        summary:
          "Responding to unsafe situations means choosing protective action quickly and using support when risk is more than you can safely manage alone.",
        content: {
          whyItMatters:
            "Protective parenting includes knowing when to leave, call support, set a boundary, seek emergency help, or stop contact with unsafe people or environments.",
          parentMeaningPrompt:
            "What does protective action mean for you when a situation becomes unsafe or starts moving toward unsafe?",
          comparisonTitle: "Protective action",
          positiveTitle: "Protective action includes",
          positiveItems: ["Leaving or creating distance when needed", "Calling safe supports", "Prioritising child safety over adult conflict"],
          negativeTitle: "Protective action is not",
          negativeItems: ["Arguing until someone changes", "Exposing children to adult danger", "Keeping risk secret because of shame"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I will just try to calm everyone down myself.",
            trySaying: "This is unsafe. I am moving away and calling support now.",
          },
          stepsTitle: "How to respond protectively in 3 steps",
          steps: [
            { title: "Choose safety", body: "Focus on reducing risk, not winning the argument.", prompt: "What action makes this safer fastest?" },
            { title: "Use support", body: "Contact the right person, service, or emergency support.", prompt: "Who needs to know or help?" },
            { title: "Document the step", body: "Record what happened and what protective decision you made.", prompt: "What evidence shows I acted early?" },
          ],
        },
      },
    ],
  },
  {
    id: "co-parenting-foundations",
    title: "Co-Parenting Foundations",
    description: "Standalone course teaching child-focused co-parenting, boundaries, and communication across households.",
    lessons: [
      {
        lessonNumber: 1,
        title: "Child-Focused Co-Parenting",
        durationMinutes: 30,
        summary:
          "Child-focused co-parenting keeps the child's safety, routines, emotions, and development at the centre of adult decisions.",
        content: {
          whyItMatters:
            "Children can feel caught in adult conflict. Child-focused co-parenting helps reduce loyalty pressure and keeps adult issues separate from the child's need for safety and connection.",
          parentMeaningPrompt:
            "What does child-focused co-parenting mean for how you speak, plan, and make decisions around your child?",
          comparisonTitle: "Child-focused and adult-focused co-parenting",
          positiveTitle: "Child-focused co-parenting includes",
          positiveItems: ["Keeping adult conflict away from children", "Planning around the child's needs", "Supporting safe relationships"],
          negativeTitle: "Child-focused co-parenting is not",
          negativeItems: ["Using children as messengers", "Speaking badly about the other parent to the child", "Making the child manage adult feelings"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "Tell your other parent they need to stop being difficult.",
            trySaying: "Adult plans are for adults to manage. You do not need to carry that message.",
          },
          stepsTitle: "How to stay child-focused in 3 steps",
          steps: [
            { title: "Separate adult issues", body: "Keep adult conflict out of the child's role.", prompt: "Is this my issue or my child's issue?" },
            { title: "Name the child need", body: "Focus plans around safety, routine, school, health, or feelings.", prompt: "What does my child need most here?" },
            { title: "Use adult channels", body: "Communicate through safe adult pathways when needed.", prompt: "What is the safest way to handle this?" },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Communication Boundaries",
        durationMinutes: 30,
        summary:
          "Communication boundaries help adults share necessary information without escalating conflict or involving the child in adult stress.",
        content: {
          whyItMatters:
            "Clear boundaries protect children from adult conflict and help parents communicate about practical matters like routines, contact, school, health, and safety.",
          parentMeaningPrompt:
            "What communication boundary would protect your child from adult stress while still keeping important information clear?",
          comparisonTitle: "Boundaried communication",
          positiveTitle: "Boundaried communication is",
          positiveItems: ["Brief and practical", "Focused on the child", "Documented when needed"],
          negativeTitle: "Boundaried communication is not",
          negativeItems: ["Dragging in old arguments", "Sending messages through the child", "Using contact to intimidate or shame"],
          example: {
            insteadOfLabel: "Instead of writing",
            trySayingLabel: "Try writing",
            insteadOf: "You always ruin everything and never care.",
            trySaying: "Pickup is 4 pm. The school bag and medication will be ready at the front desk.",
          },
          stepsTitle: "How to communicate with boundaries in 3 steps",
          steps: [
            { title: "Keep it practical", body: "Share only what is needed for the child or plan.", prompt: "What information is necessary?" },
            { title: "Use neutral tone", body: "Avoid blame, threats, sarcasm, or emotional dumping.", prompt: "Would this be safe for a child to overhear?" },
            { title: "Record clearly", body: "Keep records of important arrangements and changes.", prompt: "What needs to be documented?" },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Managing Conflict Across Households",
        durationMinutes: 30,
        summary:
          "Managing conflict across households means reducing adult tension, protecting routines, and helping children move between homes with less stress.",
        content: {
          whyItMatters:
            "Transitions can be stressful for children when adult conflict is high. Calm, predictable handovers and consistent routines help children feel safer.",
          parentMeaningPrompt:
            "What does safer conflict management across households mean for your child during transitions and contact?",
          comparisonTitle: "Safer transitions",
          positiveTitle: "Safer transitions include",
          positiveItems: ["Predictable handover plans", "Calm adult behaviour", "Child reassurance before and after"],
          negativeTitle: "Safer transitions do not include",
          negativeItems: ["Arguments at handover", "Questioning the child for information", "Changing plans to punish the other adult"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "What did they say about me?",
            trySaying: "You are back. I am glad to see you. We can settle in with our usual routine.",
          },
          stepsTitle: "How to manage transitions in 3 steps",
          steps: [
            { title: "Prepare the child", body: "Use calm reminders about what will happen next.", prompt: "What does my child need to know before transition?" },
            { title: "Lower adult conflict", body: "Use brief, practical communication and safe handover locations if needed.", prompt: "How can adults keep this calmer?" },
            { title: "Reconnect after", body: "Offer a settling routine without interrogation.", prompt: "What helps my child land safely?" },
          ],
        },
      },
    ],
  },
  {
    id: "accountability-and-responsibility",
    title: "Accountability and Responsibility",
    description: "Standalone course teaching insight, ownership, safer choices, and responsibility without shame.",
    lessons: [
      {
        lessonNumber: 1,
        title: "Understanding Accountability",
        durationMinutes: 30,
        summary:
          "Accountability means being able to name what happened, understand the impact, and choose safer action without blaming the child or others.",
        content: {
          whyItMatters:
            "Accountability helps children feel safer because adults stop defending the old pattern and start showing what will be different. It is about ownership, not humiliation.",
          parentMeaningPrompt:
            "What does accountability mean for you as a parent, and what impact do you want your child to see in your actions?",
          comparisonTitle: "Accountability and blame",
          positiveTitle: "Accountability includes",
          positiveItems: ["Naming your part", "Understanding the impact", "Changing the next response"],
          negativeTitle: "Accountability is not",
          negativeItems: ["Shaming yourself forever", "Blaming the child", "Only explaining why it happened"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I only reacted because everyone was against me.",
            trySaying: "I was overwhelmed, and my reaction was not safe. I need to respond differently.",
          },
          stepsTitle: "How to practise accountability in 3 steps",
          steps: [
            { title: "Name it", body: "Describe the behaviour clearly without excuses.", prompt: "What did I do or not do?" },
            { title: "Name the impact", body: "Consider how it affected safety, trust, or stability.", prompt: "How might this have felt for my child?" },
            { title: "Name the change", body: "Choose the next safer behaviour.", prompt: "What will I do differently next time?" },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Taking Responsibility Without Shame",
        durationMinutes: 30,
        summary:
          "Taking responsibility means owning behaviour while still believing change is possible.",
        content: {
          whyItMatters:
            "Shame can make parents shut down, defend, or avoid support. Responsibility keeps the focus on practical change and child safety.",
          parentMeaningPrompt:
            "What helps you take responsibility without getting stuck in shame, defensiveness, or giving up?",
          comparisonTitle: "Responsibility and shame",
          positiveTitle: "Responsibility sounds like",
          positiveItems: ["I can own this", "I can repair this", "I can practise safer action"],
          negativeTitle: "Shame sounds like",
          negativeItems: ["I am hopeless", "There is no point trying", "Everyone just wants me to fail"],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "I am a bad parent, so nothing can change.",
            trySaying: "I made unsafe choices, and I can build safer patterns one step at a time.",
          },
          stepsTitle: "How to take responsibility in 3 steps",
          steps: [
            { title: "Separate self from behaviour", body: "Focus on what needs to change, not on attacking yourself.", prompt: "What behaviour needs attention?" },
            { title: "Use support", body: "Let another safe adult, worker, or service help you stay steady.", prompt: "Who can help me stay accountable?" },
            { title: "Practise repair", body: "Use one action that shows responsibility in real life.", prompt: "What repair action can I take?" },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Shared Accountability and Safe Change",
        durationMinutes: 30,
        summary:
          "Shared accountability means using support, records, feedback, and routines so change does not depend on memory or mood alone.",
        content: {
          whyItMatters:
            "Change is easier to trust when it is visible and supported. Shared accountability helps parents keep going when stress, conflict, or old patterns return.",
          parentMeaningPrompt:
            "What kind of support or evidence would help you stay accountable to the safe changes you want to make?",
          comparisonTitle: "Supported change",
          positiveTitle: "Supported change includes",
          positiveItems: ["Check-ins", "Evidence records", "Feedback and repair"],
          negativeTitle: "Unsupported change relies on",
          negativeItems: ["Memory alone", "Mood alone", "Promises no one can see"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "Trust me, I will remember.",
            trySaying: "I will use a reminder, save a record, and review it weekly.",
          },
          stepsTitle: "How to support accountability in 3 steps",
          steps: [
            { title: "Choose a support", body: "Pick one person, tool, or routine that helps you stay on track.", prompt: "What support will keep this visible?" },
            { title: "Save a record", body: "Document the action or reflection so progress can be reviewed.", prompt: "What can I save today?" },
            { title: "Review honestly", body: "Look at what worked, what did not, and what needs adjusting.", prompt: "What is the next honest step?" },
          ],
        },
      },
    ],
  },
  {
    id: "substance-use-and-parenting-stability",
    title: "Substance Use and Parenting Stability",
    description: "Standalone course focused on triggers, relapse planning, safety decisions, and parenting reliability.",
    lessons: [
      {
        lessonNumber: 1,
        title: "Substance Use and Parenting Capacity",
        durationMinutes: 30,
        summary:
          "Parenting capacity can be affected when substance use changes supervision, judgement, mood, routines, or safety.",
        content: {
          whyItMatters:
            "Children need adults who can respond reliably. Understanding how substance use affects parenting helps parents plan for safety before children are exposed to risk.",
          parentMeaningPrompt:
            "What does parenting stability mean for you when substance use, cravings, recovery, or stress are part of the picture?",
          comparisonTitle: "Parenting capacity",
          positiveTitle: "Protective parenting includes",
          positiveItems: ["Safe supervision", "Clear recovery supports", "Plans for high-risk moments"],
          negativeTitle: "Risk increases when",
          negativeItems: ["Use happens during care", "Cravings are hidden", "There is no backup plan"],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "I can handle it and no one needs to know.",
            trySaying: "If risk is rising, my child needs a safe backup plan before it becomes a crisis.",
          },
          stepsTitle: "How to protect parenting capacity in 3 steps",
          steps: [
            { title: "Name risk times", body: "Identify when cravings, use, conflict, or exhaustion increase risk.", prompt: "When am I least steady?" },
            { title: "Create backup", body: "Choose a safe adult, service, or plan before the risk moment.", prompt: "Who can step in safely?" },
            { title: "Record stability", body: "Track safe care, support use, appointments, or recovery steps.", prompt: "What shows safe parenting today?" },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Triggers and Support Plans",
        durationMinutes: 30,
        summary:
          "Triggers are situations, feelings, people, places, or thoughts that raise the risk of using or losing stability.",
        content: {
          whyItMatters:
            "Triggers are easier to manage when they are expected. A support plan helps parents act early instead of waiting until risk affects the child.",
          parentMeaningPrompt:
            "What triggers affect your parenting stability, and what support plan would help you respond earlier?",
          comparisonTitle: "Trigger planning",
          positiveTitle: "A trigger plan includes",
          positiveItems: ["Early warning signs", "Safe people to call", "Child-safe backup steps"],
          negativeTitle: "A trigger plan does not include",
          negativeItems: ["Keeping all risk secret", "Only relying on willpower", "Waiting until after use or escalation"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I will just try harder next time.",
            trySaying: "When this trigger shows up, I will call support and move to my safety routine.",
          },
          stepsTitle: "How to build a trigger plan in 3 steps",
          steps: [
            { title: "Map triggers", body: "Write the top three triggers that affect stability.", prompt: "What patterns repeat?" },
            { title: "Match supports", body: "Connect each trigger to a practical support step.", prompt: "What helps with this specific trigger?" },
            { title: "Practise before crisis", body: "Use the support step when risk is low enough to manage.", prompt: "How can I act earlier?" },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Evidence of Recovery Stability",
        durationMinutes: 30,
        summary:
          "Recovery stability evidence shows repeated safe choices, support use, and child-safe planning over time.",
        content: {
          whyItMatters:
            "Recovery is strengthened by visible patterns. Evidence can show that parenting safety is being protected through support, planning, honesty, and stable routines.",
          parentMeaningPrompt:
            "What evidence could fairly show recovery stability and safer parenting over time?",
          comparisonTitle: "Recovery evidence",
          positiveTitle: "Useful evidence can include",
          positiveItems: ["Appointment attendance", "Support contacts", "Safe care routines"],
          negativeTitle: "Weak evidence relies on",
          negativeItems: ["Promises only", "Hidden risk", "One isolated good week"],
          example: {
            insteadOfLabel: "Instead of saving",
            trySayingLabel: "Try saving",
            insteadOf: "I am doing better now.",
            trySaying: "This month I attended support, used my trigger plan twice, and arranged backup care early.",
          },
          stepsTitle: "How to show recovery stability in 3 steps",
          steps: [
            { title: "Track supports", body: "Record appointments, check-ins, meetings, or recovery actions.", prompt: "What support did I use?" },
            { title: "Track safe decisions", body: "Record moments where you reduced risk before it escalated.", prompt: "What safe choice did I make?" },
            { title: "Review gaps", body: "Notice missing support or repeated risk and update the plan.", prompt: "What needs strengthening next?" },
          ],
        },
      },
    ],
  },
  {
    id: "mental-health-stress-and-parenting",
    title: "Mental Health, Stress, and Parenting",
    description: "Standalone course helping parents manage stress, support plans, and routines during hard mental health periods.",
    lessons: [
      {
        lessonNumber: 1,
        title: "Stress and Parenting Responses",
        durationMinutes: 30,
        summary:
          "Stress can affect patience, tone, decision-making, consistency, and a parent's ability to respond calmly.",
        content: {
          whyItMatters:
            "Stress does not make someone a bad parent, but unmanaged stress can affect children. Recognising stress early helps parents protect routines and relationships.",
          parentMeaningPrompt:
            "What does managing stress mean for your parenting and the emotional safety your child needs?",
          comparisonTitle: "Stress-aware parenting",
          positiveTitle: "Stress-aware parenting includes",
          positiveItems: ["Noticing stress signals", "Using support early", "Simplifying routines during hard days"],
          negativeTitle: "Stress-aware parenting is not",
          negativeItems: ["Pretending stress is not there", "Taking stress out on children", "Giving up on repair"],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "I cannot cope, so everything is ruined.",
            trySaying: "This is a hard day. I can use one support and keep one routine steady.",
          },
          stepsTitle: "How to respond to stress in 3 steps",
          steps: [
            { title: "Notice", body: "Name stress signals before they turn into reactions.", prompt: "How do I know stress is rising?" },
            { title: "Reduce demand", body: "Keep essential routines and pause non-urgent conflict.", prompt: "What can wait?" },
            { title: "Use support", body: "Reach out before stress becomes unsafe.", prompt: "Who can help me steady this moment?" },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Support Planning",
        durationMinutes: 30,
        summary:
          "A support plan names who helps, what helps, and what to do when stress or mental health symptoms increase.",
        content: {
          whyItMatters:
            "Support planning turns help-seeking into a parenting safety skill. It means children are not left carrying adult stress alone.",
          parentMeaningPrompt:
            "What support plan would make your parenting safer and more stable during hard mental health or stress periods?",
          comparisonTitle: "Support planning",
          positiveTitle: "A support plan includes",
          positiveItems: ["Trusted people", "Professional supports", "Clear early action steps"],
          negativeTitle: "A support plan is not",
          negativeItems: ["Only crisis numbers", "A plan no one knows about", "Proof that you are failing"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I should not need help.",
            trySaying: "Asking early helps me stay safe and consistent for my child.",
          },
          stepsTitle: "How to make a support plan in 3 steps",
          steps: [
            { title: "List signs", body: "Name signs that show support is needed.", prompt: "What are my early warning signs?" },
            { title: "List people", body: "Name safe people, services, or professionals.", prompt: "Who can I contact for what?" },
            { title: "List actions", body: "Write the first three steps to take on a hard day.", prompt: "What do I do first?" },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Keeping Routines Through Hard Weeks",
        durationMinutes: 30,
        summary:
          "Keeping routines through hard weeks means protecting the basic anchors that help children feel safe while the parent gets support.",
        content: {
          whyItMatters:
            "Children do not need perfect weeks. They need enough predictability, warmth, food, sleep, school, care, and repair to feel adults are still holding the structure.",
          parentMeaningPrompt:
            "Which routine helps your child most when your stress or mental health is under pressure?",
          comparisonTitle: "Hard-week stability",
          positiveTitle: "Hard-week stability includes",
          positiveItems: ["Basic routines protected", "Support used early", "Repair after difficult moments"],
          negativeTitle: "Hard-week stability is not",
          negativeItems: ["Pretending nothing changed", "Letting every routine disappear", "Expecting children to manage adult distress"],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "I cannot do everything, so I will do nothing.",
            trySaying: "I can protect bedtime, meals, and one connection moment while I get support.",
          },
          stepsTitle: "How to keep routines in 3 steps",
          steps: [
            { title: "Choose anchors", body: "Pick the routines that matter most for safety and wellbeing.", prompt: "What must stay steady?" },
            { title: "Simplify", body: "Make the routine smaller but still reliable.", prompt: "What is the simplest version?" },
            { title: "Repair and reset", body: "If a routine breaks, restart without shame.", prompt: "What is the next steady step?" },
          ],
        },
      },
    ],
  },
  {
    id: "family-mental-health-curriculum",
    title: "Family Mental Health: Children, Parents, and the Parent-Child Relationship",
    description:
      "A comprehensive 54-week course covering children's mental health, parents' own mental health, the parent-child relationship, child development, family dynamics, substance use, family safety, grief, learning, neurodiversity, diverse family structures, digital wellbeing, financial stress, emotional intelligence, and positive parenting.",
    lessons: [
      {
        lessonNumber: 1,
        title: "Foundations of Child Mental Health & Development",
        durationMinutes: 120,
        summary:
          "An introduction to what mental health means for children, how it differs across developmental stages, and the factors that shape it.",
        content: {
          whyItMatters:
            "Child mental health is shaped by development, relationships, biology, coping skills, and context. Seeing mental health as a continuum helps parents respond with curiosity and support instead of panic, blame, or denial.",
          parentMeaningPrompt:
            "What does child mental health mean for your child right now, and what developmental strengths or support needs do you notice?",
          comparisonTitle: "Helpful mental health framing",
          positiveTitle: "Helpful framing includes",
          positiveItems: ["Seeing mental health as a continuum", "Matching expectations to developmental stage", "Looking at biological, psychological, and social factors"],
          negativeTitle: "Helpful framing is not",
          negativeItems: ["Expecting children to be happy all the time", "Treating one hard week as a fixed identity", "Blaming one cause for every concern"],
          example: {
            insteadOfLabel: "Instead of asking",
            trySayingLabel: "Try asking",
            insteadOf: "What is wrong with my child?",
            trySaying: "How is my child doing right now, and what support might help?",
          },
          stepsTitle: "How to take a developmental snapshot in 3 steps",
          steps: [
            { title: "Name the stage", body: "Notice your child's age, abilities, relationships, and current developmental tasks.", prompt: "What is typical for this stage?" },
            { title: "Notice the pattern", body: "Look for changes across mood, behavior, sleep, school, and relationships.", prompt: "What has shifted over time?" },
            { title: "Identify support", body: "Choose one strength to build on and one area where extra support may help.", prompt: "What would make this easier for my child?" },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Common Mental Health Conditions in Children",
        durationMinutes: 120,
        summary:
          "An overview of common mental health conditions diagnosed in childhood and adolescence, including how they typically present.",
        content: {
          whyItMatters:
            "Children often show distress through behavior, body complaints, irritability, school refusal, sleep changes, or withdrawal. Understanding common patterns helps parents seek assessment without turning the course into self-diagnosis.",
          parentMeaningPrompt:
            "What patterns have you noticed in your child's mood, behavior, body complaints, school life, or relationships?",
          comparisonTitle: "Observation and diagnosis",
          positiveTitle: "Helpful observation includes",
          positiveItems: ["Watching frequency and duration", "Noticing impairment across settings", "Seeking professional assessment when patterns persist"],
          negativeTitle: "Helpful observation is not",
          negativeItems: ["Using labels as punishment", "Diagnosing from one checklist", "Ignoring co-occurring or overlapping concerns"],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "They are just being difficult.",
            trySaying: "This pattern may be communicating distress, and I can ask for guidance.",
          },
          stepsTitle: "How to observe concerns in 3 steps",
          steps: [
            { title: "Describe behavior", body: "Use concrete examples instead of labels.", prompt: "What did I see or hear?" },
            { title: "Check context", body: "Notice where, when, how often, and how long the concern occurs.", prompt: "Is this happening across settings?" },
            { title: "Consult early", body: "Bring patterns to a pediatrician, school counselor, or mental health professional.", prompt: "Who is the right first contact?" },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Recognizing Warning Signs & When to Seek Help",
        durationMinutes: 120,
        summary:
          "Practical guidance on identifying when a child's emotional or behavioral changes warrant professional attention, and how to take the next step.",
        content: {
          whyItMatters:
            "Some warning signs call for immediate action, while others need planned support. Parents protect children best when they can distinguish urgent safety concerns from patterns that should be tracked and discussed with professionals.",
          parentMeaningPrompt:
            "What signs would tell you your child needs planned support, and what signs would require immediate help?",
          comparisonTitle: "Urgent and planned support",
          positiveTitle: "Seek urgent help for",
          positiveItems: ["Talk of self-harm or suicide", "Intent to harm self or others", "Disclosure of abuse or immediate danger"],
          negativeTitle: "Plan a consultation for",
          negativeItems: ["Persistent worry or low mood", "Ongoing sleep or appetite changes", "School, friendship, or behavior changes that continue"],
          example: {
            insteadOfLabel: "Instead of waiting",
            trySayingLabel: "Try acting",
            insteadOf: "Maybe this will pass even though safety is at risk.",
            trySaying: "This is a safety concern. I will contact emergency or crisis support now.",
          },
          stepsTitle: "How to respond to warning signs in 3 steps",
          steps: [
            { title: "Assess safety", body: "Check whether there is immediate danger, self-harm, harm to others, or abuse disclosure.", prompt: "Is anyone unsafe right now?" },
            { title: "Track patterns", body: "Record frequency, duration, settings, and impact on daily life.", prompt: "What pattern can I describe clearly?" },
            { title: "Choose the pathway", body: "Use emergency support for danger and planned professional support for persistent concerns.", prompt: "Who do I contact first?" },
          ],
        },
      },
      {
        lessonNumber: 4,
        title: "Supporting a Child Day-to-Day",
        durationMinutes: 120,
        summary:
          "Practical strategies for communication, routines, and collaboration with schools to support a child's mental health in daily life.",
        content: {
          whyItMatters:
            "Daily support is built through repeated small actions: emotional validation, predictable routines, collaboration with school, and adult repair after mistakes. These actions help children feel safer while longer-term support is arranged.",
          parentMeaningPrompt:
            "Which daily routine, conversation, or school connection would most support your child's wellbeing this week?",
          comparisonTitle: "Day-to-day support",
          positiveTitle: "Supportive care includes",
          positiveItems: ["Validating feelings with limits", "Predictable routines", "Home-school collaboration"],
          negativeTitle: "Supportive care is not",
          negativeItems: ["Letting emotions remove every boundary", "Changing routines without explanation", "Managing concerns in isolation"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "Stop feeling that way.",
            trySaying: "I can see this is hard. The feeling is allowed, and I will help you choose a safe next step.",
          },
          stepsTitle: "How to support day-to-day in 3 steps",
          steps: [
            { title: "Validate", body: "Name the feeling without removing necessary limits.", prompt: "What feeling can I acknowledge?" },
            { title: "Anchor routines", body: "Protect sleep, meals, school, connection, and predictable transitions.", prompt: "What anchor matters most today?" },
            { title: "Coordinate support", body: "Share helpful context with teachers, caregivers, or professionals when appropriate.", prompt: "Who needs to know what?" },
          ],
        },
      },
      {
        lessonNumber: 5,
        title: "Trauma, Adversity, and Resilience in Children",
        durationMinutes: 120,
        summary:
          "Understanding how adverse experiences affect children's mental health, and the factors that build resilience.",
        content: {
          whyItMatters:
            "Trauma can affect behavior, learning, relationships, and the body's stress response. A trauma-informed lens shifts adults from blame toward safety, predictability, repair, and protective relationships.",
          parentMeaningPrompt:
            "What protective relationship, routine, or safe place helps your child recover from stress or adversity?",
          comparisonTitle: "Trauma-informed support",
          positiveTitle: "Trauma-informed support asks",
          positiveItems: ["What happened and what helps safety?", "What protective factors can we strengthen?", "How can we be predictable and calm?"],
          negativeTitle: "Trauma-informed support avoids",
          negativeItems: ["What is wrong with this child?", "Using fear to force compliance", "Treating risk as destiny"],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "This child is choosing to be difficult.",
            trySaying: "This behavior may be a stress response, and safety is the first step.",
          },
          stepsTitle: "How to build resilience in 3 steps",
          steps: [
            { title: "Increase safety", body: "Make routines, adults, and expectations more predictable.", prompt: "What helps this child feel safe enough to learn?" },
            { title: "Strengthen connection", body: "Use stable, supportive relationships as a protective factor.", prompt: "Who is a safe adult for this child?" },
            { title: "Practise repair", body: "Return after hard moments and rebuild trust through action.", prompt: "What repair is needed now?" },
          ],
        },
      },
      {
        lessonNumber: 6,
        title: "Understanding Parental Mental Health",
        durationMinutes: 120,
        summary:
          "An introduction to the unique mental health pressures parents face, including stress, burnout, and perinatal mood disorders.",
        content: {
          whyItMatters:
            "Parental mental health affects the whole family system. Naming stress, burnout, and perinatal mood or anxiety concerns as real and treatable helps parents seek support before pressure becomes unsafe or isolating.",
          parentMeaningPrompt:
            "What signs tell you that parenting stress is becoming more than ordinary tiredness, and what support would help?",
          comparisonTitle: "Parent stress and support",
          positiveTitle: "Supportive framing includes",
          positiveItems: ["Taking parental mental health seriously", "Recognizing burnout signals", "Seeking care without shame"],
          negativeTitle: "Supportive framing is not",
          negativeItems: ["Treating exhaustion as failure", "Ignoring perinatal mood concerns", "Waiting until crisis before asking for help"],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "A good parent should cope without help.",
            trySaying: "Getting support helps me stay safer and more available for my child.",
          },
          stepsTitle: "How to check parental wellbeing in 3 steps",
          steps: [
            { title: "Notice signs", body: "Name stress, burnout, mood, anxiety, sleep, and irritability patterns.", prompt: "What has changed in me?" },
            { title: "Lower load", body: "Choose one practical pressure to reduce or share.", prompt: "What support would make today safer?" },
            { title: "Ask early", body: "Contact a GP, therapist, support group, or trusted person before the pressure grows.", prompt: "Who can I tell?" },
          ],
        },
      },
      {
        lessonNumber: 7,
        title: "Common Mental Health Conditions Among Parents",
        durationMinutes: 120,
        summary:
          "A closer look at anxiety, depression, and trauma-related conditions as they present specifically in parents.",
        content: {
          whyItMatters:
            "Anxiety, depression, postpartum conditions, and trauma can present through irritability, over-control, withdrawal, numbness, fear, or continued functioning that hides distress. Recognizing patterns supports earlier care.",
          parentMeaningPrompt:
            "Which parenting situations tend to activate anxiety, low mood, trauma responses, or overwhelm for you?",
          comparisonTitle: "Recognizing parent symptoms",
          positiveTitle: "Helpful recognition includes",
          positiveItems: ["Noticing hidden or high-functioning distress", "Understanding postpartum symptoms can persist", "Seeing trauma activation as support-worthy"],
          negativeTitle: "Helpful recognition is not",
          negativeItems: ["Masking every symptom", "Assuming functioning means wellbeing", "Calling distress a character flaw"],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "I am still doing everything, so I must be fine.",
            trySaying: "Functioning does not mean I am okay; I can still ask for support.",
          },
          stepsTitle: "How to separate stress from symptoms in 3 steps",
          steps: [
            { title: "Name the pattern", body: "Notice what repeats across mood, thoughts, body, behavior, and relationships.", prompt: "What keeps happening?" },
            { title: "Check impact", body: "Ask how the pattern affects care, connection, sleep, work, or safety.", prompt: "Where is this interfering?" },
            { title: "Seek assessment", body: "Use professional support when symptoms persist or intensify.", prompt: "Who can assess this with me?" },
          ],
        },
      },
      {
        lessonNumber: 8,
        title: "Self-Care, Coping Strategies, and Seeking Professional Support",
        durationMinutes: 120,
        summary:
          "Practical, realistic approaches to coping and self-care for parents, and guidance on accessing professional mental health support.",
        content: {
          whyItMatters:
            "Self-care needs to be realistic enough for actual parenting life. Small coping actions, social support, and professional care can reduce strain and help parents respond more safely and consistently.",
          parentMeaningPrompt:
            "What small coping action or professional support step is realistic for you this week?",
          comparisonTitle: "Realistic self-care",
          positiveTitle: "Realistic care includes",
          positiveItems: ["Small repeatable actions", "Movement, mindfulness, reframing, or connection", "Professional support when needed"],
          negativeTitle: "Realistic care is not",
          negativeItems: ["A luxury that replaces treatment", "A one-off escape from every pressure", "Something parents must earn by coping alone first"],
          example: {
            insteadOfLabel: "Instead of planning",
            trySayingLabel: "Try planning",
            insteadOf: "I need a whole day off before anything can change.",
            trySaying: "I can take ten minutes, message one support person, and book one appointment.",
          },
          stepsTitle: "How to build a coping toolkit in 3 steps",
          steps: [
            { title: "Choose one body tool", body: "Use breath, movement, food, sleep, or grounding in a small practical way.", prompt: "What helps my body settle?" },
            { title: "Choose one thought tool", body: "Practise reframing or naming a more balanced thought.", prompt: "What is a kinder true statement?" },
            { title: "Choose one support", body: "Identify a person, service, group, or clinician to contact.", prompt: "Who is part of my support plan?" },
          ],
        },
      },
      {
        lessonNumber: 9,
        title: "Stigma, Identity, and Asking for Help as a Parent",
        durationMinutes: 120,
        summary:
          "Exploring the cultural and identity-based pressures that make it hard for parents to acknowledge struggle, and how to build a culture of openness.",
        content: {
          whyItMatters:
            "Shame and idealized ideas of good parenting can keep parents isolated. Challenging stigma makes it easier to ask for help, use community support, and model honest coping for children.",
          parentMeaningPrompt:
            "What message about being a good parent makes it harder for you to ask for help, and what healthier message could replace it?",
          comparisonTitle: "Stigma and openness",
          positiveTitle: "Openness includes",
          positiveItems: ["Naming struggle honestly", "Letting identity and culture be part of the conversation", "Using peer and community support"],
          negativeTitle: "Stigma can sound like",
          negativeItems: ["Good parents do not struggle", "Asking for help means failing", "Mental health should stay hidden"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I should be able to handle this alone.",
            trySaying: "Support is part of responsible parenting, not proof that I am failing.",
          },
          stepsTitle: "How to reframe stigma in 3 steps",
          steps: [
            { title: "Name the rule", body: "Identify the belief that creates shame or silence.", prompt: "What rule am I trying to obey?" },
            { title: "Test the rule", body: "Ask whether the belief protects your child or isolates your family.", prompt: "Is this rule helping?" },
            { title: "Replace the rule", body: "Choose a more accurate and supportive belief.", prompt: "What would I tell another parent?" },
          ],
        },
      },
      {
        lessonNumber: 10,
        title: "How a Parent's Mental Health Affects the Parent-Child Relationship",
        durationMinutes: 120,
        summary:
          "Understanding the bidirectional relationship between a parent's mental health condition and the parent-child bond, without blame or fatalism.",
        content: {
          whyItMatters:
            "A parent's mental health can affect availability, patience, routines, and repair, but it does not prevent good parenting. Support, treatment, consistency, and repair can protect the parent-child relationship.",
          parentMeaningPrompt:
            "How does your wellbeing affect your connection with your child, and what protective factor could strengthen that relationship?",
          comparisonTitle: "Good enough parenting",
          positiveTitle: "Good enough parenting includes",
          positiveItems: ["Consistency over time", "Repair after hard moments", "Using support and treatment"],
          negativeTitle: "Good enough parenting is not",
          negativeItems: ["Perfect mood every day", "Never needing help", "Assuming a diagnosis defines the relationship"],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "My mental health means I cannot be a good parent.",
            trySaying: "With support and repair, I can keep building safety and connection.",
          },
          stepsTitle: "How to protect the relationship in 3 steps",
          steps: [
            { title: "Notice impact", body: "Name how symptoms affect care, tone, routines, or connection.", prompt: "What does my child experience?" },
            { title: "Add protection", body: "Use treatment, routines, secondary caregivers, or practical support.", prompt: "What buffer can I add?" },
            { title: "Repair", body: "Come back after hard moments with ownership and safer action.", prompt: "What do I need to own or redo?" },
          ],
        },
      },
      {
        lessonNumber: 11,
        title: "Building a Support System: Professional and Informal",
        durationMinutes: 120,
        summary:
          "Practical guidance for parents managing a mental health condition on assembling a robust network of professional and informal support.",
        content: {
          whyItMatters:
            "Parents should not have to hold every need alone. A mapped support system reduces decision load during hard periods and helps professional, practical, and emotional support work together.",
          parentMeaningPrompt:
            "Who belongs on your support map, and what role could each person or service play?",
          comparisonTitle: "Support networks",
          positiveTitle: "A support system includes",
          positiveItems: ["Professional care", "Trusted informal helpers", "Clear roles and contact steps"],
          negativeTitle: "A support system is not",
          negativeItems: ["One person doing everything", "Vague offers with no plan", "Waiting until crisis to decide who helps"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I do not know who to call, so I will just manage.",
            trySaying: "My plan names who helps with care, treatment, transport, meals, and crisis steps.",
          },
          stepsTitle: "How to build a support map in 3 steps",
          steps: [
            { title: "List needs", body: "Name practical, emotional, parenting, medical, and crisis support needs.", prompt: "What support categories matter?" },
            { title: "List people", body: "Match safe people, services, and professionals to specific roles.", prompt: "Who can help with what?" },
            { title: "Share the plan", body: "Make contact details and first steps clear before pressure rises.", prompt: "Who needs a copy or conversation?" },
          ],
        },
      },
      {
        lessonNumber: 12,
        title: "Communicating With Children About a Parent's Mental Health Condition",
        durationMinutes: 120,
        summary:
          "Age-appropriate, honest, and reassuring ways to talk with children about a parent's mental health, reducing confusion and self-blame.",
        content: {
          whyItMatters:
            "When adults stay silent, children may create their own explanations and blame themselves. Age-appropriate honesty can reduce fear, confusion, and shame while keeping adult burdens with adults.",
          parentMeaningPrompt:
            "What simple, age-appropriate message would help your child understand that your mental health is not their fault?",
          comparisonTitle: "Safe explanations",
          positiveTitle: "Safe explanations include",
          positiveItems: ["Simple honest language", "It is not your fault", "Who is helping and what stays steady"],
          negativeTitle: "Safe explanations avoid",
          negativeItems: ["Adult emotional dumping", "Vague silence", "Making children responsible for fixing the parent"],
          example: {
            insteadOfLabel: "Instead of saying nothing",
            trySayingLabel: "Try saying",
            insteadOf: "Everything is fine, do not ask questions.",
            trySaying: "My feelings are hard right now, it is not because of you, and adults are helping me.",
          },
          stepsTitle: "How to talk with children in 3 steps",
          steps: [
            { title: "Use their age", body: "Choose words that match the child's developmental stage.", prompt: "What can my child understand?" },
            { title: "Remove blame", body: "Say clearly that the child did not cause the condition.", prompt: "Have I said it is not their fault?" },
            { title: "Name support", body: "Explain who is helping and what routines or care will stay in place.", prompt: "What practical reassurance can I give?" },
          ],
        },
      },
      {
        lessonNumber: 13,
        title: "Crisis Planning & Safeguarding Child Wellbeing",
        durationMinutes: 120,
        summary:
          "Proactive planning principles to ensure a child's safety, stability, and emotional wellbeing during a parent's mental health crisis.",
        content: {
          whyItMatters:
            "Crisis plans work best when built during stable periods. Clear caregivers, contacts, routines, warning signs, and emergency steps protect children and reduce high-stakes decision-making during acute stress.",
          parentMeaningPrompt:
            "What would need to be in your family crisis plan so your child is cared for if pressure escalates?",
          comparisonTitle: "Crisis planning",
          positiveTitle: "A plan names",
          positiveItems: ["Primary and backup caregivers", "Treatment and emergency contacts", "Early warning signs and practical child information"],
          negativeTitle: "A plan does not rely on",
          negativeItems: ["Improvising during crisis", "Children managing adult safety", "Delaying action during immediate danger"],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "We will work it out if things get bad.",
            trySaying: "We will write the care, contact, and safety steps while things are stable.",
          },
          stepsTitle: "How to draft a crisis plan in 3 steps",
          steps: [
            { title: "Name caregivers", body: "Identify primary and backup adults who can care for the child.", prompt: "Who can safely step in?" },
            { title: "Name contacts", body: "Record treatment team, emergency, crisis, school, and key family contacts.", prompt: "Who gets called first?" },
            { title: "Name triggers", body: "List warning signs and what action happens when they appear.", prompt: "When do we activate support?" },
          ],
        },
      },
      {
        lessonNumber: 14,
        title: "Integration & Capstone: Building a Family Action Plan",
        durationMinutes: 120,
        summary:
          "Bringing together all three tracks through a family-systems lens, culminating in a personalized action plan.",
        content: {
          whyItMatters:
            "Children's mental health, parents' mental health, and parent-child relationships are connected. A family action plan turns learning into specific, realistic next steps that can be reviewed and adjusted over time.",
          parentMeaningPrompt:
            "What are your family's current strengths, main areas of focus, and three concrete next steps?",
          comparisonTitle: "Action planning",
          positiveTitle: "Effective plans are",
          positiveItems: ["Specific and modest", "Connected to strengths and risks", "Reviewed as family needs change"],
          negativeTitle: "Effective plans are not",
          negativeItems: ["Broad and vague", "Focused on one person as the whole problem", "Fixed forever after one draft"],
          example: {
            insteadOfLabel: "Instead of writing",
            trySayingLabel: "Try writing",
            insteadOf: "Improve mental health.",
            trySaying: "Book a GP appointment by Friday, restart bedtime routine tonight, and ask Nan about school pickup backup.",
          },
          stepsTitle: "How to build a family action plan in 3 steps",
          steps: [
            { title: "List strengths", body: "Name what is already working in the child, parent, and family system.", prompt: "What can we build on?" },
            { title: "Choose focus areas", body: "Pick two or three concerns or risks that need attention first.", prompt: "What matters most now?" },
            { title: "Set next steps", body: "Write concrete actions with people and rough timelines.", prompt: "Who will do what by when?" },
          ],
        },
      },
      ...familyMentalHealthExpandedLessons,
    ],
  },
  {
    id: "relationship-skills",
    title: "Relationship Skills",
    description: "Standalone course teaching respect, trust, repair, and healthier family relationship patterns.",
    lessons: [
      {
        lessonNumber: 1,
        title: "Respectful Interactions",
        durationMinutes: 30,
        summary: "Respectful interactions are the everyday words, tone, boundaries, and actions that help people feel safe with each other.",
        content: {
          whyItMatters:
            "Children learn relationship patterns by watching adults. Respectful interactions show children that stress, disagreement, and limits can happen without fear or humiliation.",
          parentMeaningPrompt:
            "What does respectful interaction mean for the relationships you want your child to grow up around?",
          comparisonTitle: "Respect and disrespect",
          positiveTitle: "Respectful interactions include",
          positiveItems: ["Calm tone", "Clear boundaries", "Repair after hurt"],
          negativeTitle: "Respectful interactions do not include",
          negativeItems: ["Threats or intimidation", "Name-calling", "Using silence to punish"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "You never do anything right.",
            trySaying: "This did not work. Let's slow down and choose the next step.",
          },
          stepsTitle: "How to practise respect in 3 steps",
          steps: [
            { title: "Pause tone", body: "Check your voice, pace, and body language before speaking.", prompt: "Would this feel safe to hear?" },
            { title: "Name the issue", body: "Talk about the behaviour or problem without attacking the person.", prompt: "What is the issue, not the insult?" },
            { title: "Repair", body: "Come back when words or tone caused harm.", prompt: "What do I need to own or redo?" },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Building Trust Through Actions",
        durationMinutes: 30,
        summary: "Trust grows when words and actions match consistently over time.",
        content: {
          whyItMatters:
            "Families recover through repeated evidence of reliability. Children and adults are more likely to feel safe when promises are realistic and follow-through is visible.",
          parentMeaningPrompt:
            "What trust-building action could you repeat so your child can experience reliability, not just hear promises?",
          comparisonTitle: "Trust-building actions",
          positiveTitle: "Trust grows through",
          positiveItems: ["Keeping realistic promises", "Showing up consistently", "Repairing when you miss something"],
          negativeTitle: "Trust is weakened by",
          negativeItems: ["Overpromising", "Excuses without repair", "Changing plans without explanation"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I promise everything will be perfect now.",
            trySaying: "I can promise one thing today, and I will follow through on it.",
          },
          stepsTitle: "How to build trust in 3 steps",
          steps: [
            { title: "Promise small", body: "Choose commitments you can realistically keep.", prompt: "What can I follow through on today?" },
            { title: "Follow through", body: "Do the action when you said you would.", prompt: "How will I make this visible?" },
            { title: "Repair quickly", body: "If you miss it, own it and make a new realistic plan.", prompt: "What repair is needed?" },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Changing Relationship Patterns",
        durationMinutes: 30,
        summary: "Changing relationship patterns means noticing repeated cycles and practising safer ways to connect, disagree, and repair.",
        content: {
          whyItMatters:
            "Old patterns can return under stress. Naming the cycle helps parents choose a different response before the pattern harms trust or safety again.",
          parentMeaningPrompt:
            "What relationship pattern do you want to change, and what safer pattern do you want your child to see?",
          comparisonTitle: "Old patterns and new patterns",
          positiveTitle: "New patterns include",
          positiveItems: ["Pausing before escalation", "Using respectful words", "Returning to repair"],
          negativeTitle: "Old patterns can include",
          negativeItems: ["Blame cycles", "Avoidance after conflict", "Escalation until someone gives in"],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "This is just how we are.",
            trySaying: "This is a pattern, and I can practise a safer step in it.",
          },
          stepsTitle: "How to change a pattern in 3 steps",
          steps: [
            { title: "Name the cycle", body: "Write what usually happens first, next, and after.", prompt: "What repeats?" },
            { title: "Choose the break point", body: "Pick one place where you can respond differently.", prompt: "Where can I interrupt the pattern?" },
            { title: "Practise repair", body: "Use repair to make the new pattern stronger.", prompt: "How do I come back safely?" },
          ],
        },
      },
    ],
  },
  {
    id: "safe-conversations",
    title: "Safe Conversations",
    description: "Standalone course teaching parents to hold difficult conversations with clarity, calm, and child safety.",
    lessons: [
      {
        lessonNumber: 1,
        title: "Preparing for Difficult Conversations",
        durationMinutes: 30,
        summary: "Preparation helps hard conversations stay calmer, clearer, and more focused on safety.",
        content: {
          whyItMatters:
            "Difficult conversations can escalate quickly when people are unprepared. Planning the purpose, timing, and safety boundary helps parents avoid harm and stay child-focused.",
          parentMeaningPrompt:
            "What does preparing for a safe conversation mean for how you manage stress, tone, and timing?",
          comparisonTitle: "Prepared and unprepared conversations",
          positiveTitle: "Preparation includes",
          positiveItems: ["Choosing timing", "Knowing the purpose", "Planning a pause if escalation starts"],
          negativeTitle: "Unprepared conversations often include",
          negativeItems: ["Starting while escalated", "Trying to solve everything at once", "Talking where children can hear adult conflict"],
          example: {
            insteadOfLabel: "Instead of starting with",
            trySayingLabel: "Try starting with",
            insteadOf: "We need to talk right now.",
            trySaying: "This matters. I want to talk when we can both stay calm and focused.",
          },
          stepsTitle: "How to prepare in 3 steps",
          steps: [
            { title: "Choose purpose", body: "Know the one issue you are discussing.", prompt: "What is this conversation for?" },
            { title: "Choose timing", body: "Pick a safer time and setting where children are protected.", prompt: "Is this a safe time?" },
            { title: "Choose pause plan", body: "Decide what happens if the conversation escalates.", prompt: "How will I pause safely?" },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Speaking Clearly Without Harm",
        durationMinutes: 30,
        summary: "Clear speech names needs, limits, and concerns without threats, insults, or emotional dumping.",
        content: {
          whyItMatters:
            "Parents can be firm without being frightening. Clear, respectful language helps children and adults understand the issue without making the relationship feel unsafe.",
          parentMeaningPrompt:
            "What does speaking clearly without harm mean for your home and the way your child learns to communicate?",
          comparisonTitle: "Clear and harmful speech",
          positiveTitle: "Clear speech includes",
          positiveItems: ["Specific words", "Respectful limits", "One issue at a time"],
          negativeTitle: "Harmful speech includes",
          negativeItems: ["Threats", "Global blame", "Insults or humiliation"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "You always ruin everything.",
            trySaying: "The plan changed, and I need us to agree on pickup clearly.",
          },
          stepsTitle: "How to speak clearly in 3 steps",
          steps: [
            { title: "Use one issue", body: "Stay with the current concern.", prompt: "What is the one issue?" },
            { title: "Use one request", body: "Say what needs to happen next.", prompt: "What am I asking for?" },
            { title: "Use one boundary", body: "Name what keeps the conversation safe.", prompt: "What boundary protects safety?" },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Ending Conversations Safely",
        durationMinutes: 30,
        summary: "Ending safely means knowing when to pause, summarise, repair, or return later.",
        content: {
          whyItMatters:
            "Not every conversation can be finished in one sitting. Ending safely prevents escalation and shows children that adults can stop before harm happens.",
          parentMeaningPrompt:
            "What does safely ending a hard conversation mean for how you protect your child and yourself from escalation?",
          comparisonTitle: "Safe endings",
          positiveTitle: "Safe endings include",
          positiveItems: ["Summarising the next step", "Pausing before escalation", "Returning to repair"],
          negativeTitle: "Unsafe endings include",
          negativeItems: ["Storming off with threats", "Continuing until someone breaks", "Leaving children anxious and confused"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I'm done. Do whatever you want.",
            trySaying: "We are getting escalated. I am pausing now and will return to the pickup plan at 6 pm.",
          },
          stepsTitle: "How to end safely in 3 steps",
          steps: [
            { title: "Notice escalation", body: "Watch tone, pace, repetition, or threats.", prompt: "Is this still safe?" },
            { title: "Name the pause", body: "Say why you are pausing and when you will return.", prompt: "What clear pause can I name?" },
            { title: "Return or document", body: "Come back later or write the practical next step.", prompt: "What needs follow-up?" },
          ],
        },
      },
    ],
  },
  {
    id: "protective-parenting-foundations",
    title: "Protective Parenting Foundations",
    description: "Standalone course teaching protective decisions, safe boundaries, and support-seeking before risk escalates.",
    lessons: [
      {
        lessonNumber: 1,
        title: "What Protective Parenting Means",
        durationMinutes: 30,
        summary: "Protective parenting means making decisions that put the child's safety and wellbeing ahead of adult pressure, conflict, or convenience.",
        content: {
          whyItMatters:
            "Children rely on adults to recognise risk and act early. Protective parenting shows that safety is active, practical, and repeated over time.",
          parentMeaningPrompt:
            "What does protective parenting mean for the choices you make when adult needs and child safety compete?",
          comparisonTitle: "Protective and passive parenting",
          positiveTitle: "Protective parenting includes",
          positiveItems: ["Acting early", "Setting safe boundaries", "Using support when risk rises"],
          negativeTitle: "Protective parenting is not",
          negativeItems: ["Hoping risk passes", "Keeping unsafe secrets", "Choosing adult comfort over child safety"],
          example: {
            insteadOfLabel: "Instead of thinking",
            trySayingLabel: "Try thinking",
            insteadOf: "I do not want to upset anyone.",
            trySaying: "My child's safety comes first, even if the boundary is uncomfortable.",
          },
          stepsTitle: "How to act protectively in 3 steps",
          steps: [
            { title: "Name the risk", body: "Be honest about what could affect safety.", prompt: "What is the risk?" },
            { title: "Choose the boundary", body: "Set the limit that lowers the risk.", prompt: "What boundary protects my child?" },
            { title: "Use backup", body: "Bring in support if the boundary is hard to hold alone.", prompt: "Who can help?" },
          ],
        },
      },
      {
        lessonNumber: 2,
        title: "Safe People and Safe Places",
        durationMinutes: 30,
        summary: "Safe people and safe places are part of a child's protection network when routines, stress, or conflict become difficult.",
        content: {
          whyItMatters:
            "No parent protects a child alone all the time. A clear network helps families respond earlier and gives children safer options when they need help.",
          parentMeaningPrompt:
            "Who are the safe people and safe places that can support your child and family when pressure rises?",
          comparisonTitle: "Safety network",
          positiveTitle: "A safety network includes",
          positiveItems: ["Trusted adults", "Clear contact steps", "Places children can get help"],
          negativeTitle: "A safety network should not rely on",
          negativeItems: ["Unsafe adults", "Secrets children must keep", "Plans no one understands"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "If something happens, just figure it out.",
            trySaying: "If you feel unsafe, these are the people and places that can help.",
          },
          stepsTitle: "How to build a network in 3 steps",
          steps: [
            { title: "List safe people", body: "Name adults who are calm, reliable, and child-safe.", prompt: "Who can my child safely go to?" },
            { title: "List safe places", body: "Identify places connected to help, care, or supervision.", prompt: "Where is safe?" },
            { title: "Practise the plan", body: "Use simple words so children know what to do.", prompt: "How can we practise without fear?" },
          ],
        },
      },
      {
        lessonNumber: 3,
        title: "Protective Decisions Under Pressure",
        durationMinutes: 30,
        summary: "Protective decisions under pressure are the choices parents make when stress, conflict, or risk makes safety harder.",
        content: {
          whyItMatters:
            "Protective capacity is tested during pressure, not just calm moments. Planning ahead helps parents choose safety when emotions are high.",
          parentMeaningPrompt:
            "What protective decision do you want to be able to make even when you are under pressure?",
          comparisonTitle: "Pressure decisions",
          positiveTitle: "Protective decisions include",
          positiveItems: ["Leaving unsafe situations", "Calling support early", "Choosing child safety over adult conflict"],
          negativeTitle: "Risk decisions include",
          negativeItems: ["Staying to prove a point", "Letting children witness escalation", "Waiting until harm happens"],
          example: {
            insteadOfLabel: "Instead of saying",
            trySayingLabel: "Try saying",
            insteadOf: "I need to win this argument.",
            trySaying: "I need to keep my child safe. I can step away and use support.",
          },
          stepsTitle: "How to decide under pressure in 3 steps",
          steps: [
            { title: "Slow the moment", body: "Use breath, distance, or a short phrase to interrupt reaction.", prompt: "How can I slow this down?" },
            { title: "Choose safety first", body: "Pick the option that lowers risk fastest.", prompt: "What protects the child?" },
            { title: "Record the choice", body: "Document the protective decision and what it prevented.", prompt: "What did I do to reduce risk?" },
          ],
        },
      },
    ],
  }
];

export const courseAreas: CourseArea[] = [
  {
    id: "start-here",
    title: "Start here",
    description:
      "For parents who need a clear first path before choosing specialist topics.",
    suggestedStartCourseId: "understanding-your-nervous-system",
    courseIds: [
      "understanding-your-nervous-system",
      "emotional-literacy",
      "communication-skills",
      "positive-parenting-foundations",
    ],
  },
  {
    id: "child-development",
    title: "Child development and wellbeing",
    description:
      "For understanding what children need, how behaviour connects to development, and how to respond realistically.",
    suggestedStartCourseId: "your-child-s-brain-what-they-need-from-you",
    courseIds: [
      "your-child-s-brain-what-they-need-from-you",
      "child-development-foundations",
      "safesteps-child-development-and-wellbeing",
      "attachment-and-bonding-foundations",
    ],
  },
  {
    id: "connection-regulation",
    title: "Connection and regulation",
    description:
      "For parents working on calm, co-regulation, repair, shame resilience, and safer emotional responses.",
    suggestedStartCourseId: "emotional-regulation-for-parents",
    courseIds: [
      "emotional-regulation-for-parents",
      "safesteps-connection-and-regulation",
      "self-compassion-and-shame-resilience",
      "breaking-the-cycle-intergenerational-trauma",
    ],
  },
  {
    id: "behaviour-routines",
    title: "Behaviour, boundaries, and routines",
    description:
      "For building predictable home structure, safer discipline, and practical behaviour guidance.",
    suggestedStartCourseId: "behaviour-management-foundations",
    courseIds: [
      "behaviour-management-foundations",
      "safesteps-behaviour-guidance-foundations",
      "family-routines-and-structure",
      "executive-functioning-in-family-life",
    ],
  },
  {
    id: "safety-stability",
    title: "Safety, stability, and evidence",
    description:
      "For parents who need to show safer choices, practical stability, and documented change over time.",
    suggestedStartCourseId: "parent-safety-and-stability",
    courseIds: [
      "parent-safety-and-stability",
      "safesteps-production-readiness-practice-pack",
      "child-safety-foundations",
      "protective-parenting-foundations",
      "demonstrating-change-self-managed-safety",
      "financial-literacy-and-life-skills",
    ],
  },
  {
    id: "separation-coparenting",
    title: "Separation and co-parenting",
    description:
      "For separated parents working on child-focused communication, boundaries, and reduced conflict.",
    suggestedStartCourseId: "co-parenting-after-separation",
    courseIds: [
      "co-parenting-after-separation",
      "co-parenting-foundations",
      "safesteps-safety-separation-and-coparenting",
      "seeing-through-your-child-s-eyes",
      "safe-conversations",
    ],
  },
  {
    id: "healthy-relationships",
    title: "Healthy relationships and accountability",
    description:
      "For parents working on relationship patterns, responsibility, repair, and family-safe communication.",
    suggestedStartCourseId: "healthy-relationships",
    courseIds: [
      "healthy-relationships",
      "relationship-skills",
      "accountability-and-responsibility",
      "safesteps-communication-and-family-conversations",
    ],
  },
  {
    id: "specialist-support",
    title: "Specialist support needs",
    description:
      "For areas that may need extra support alongside parenting work, including mental health, substances, digital safety, and support networks.",
    suggestedStartCourseId: "building-your-village",
    courseIds: [
      "building-your-village",
      "mental-health-stress-and-parenting",
      "substance-use-and-parenting-stability",
      "digital-safety-for-families",
      "family-mental-health-curriculum",
    ],
  },
  {
    id: "fathers",
    title: "Father-focused pathway",
    description:
      "For fathers building safety, connection, responsibility, and child-focused parenting practice.",
    suggestedStartCourseId: "strong-fathers-safe-children",
    courseIds: ["strong-fathers-safe-children"],
  },
];

export function getCourseById(courseId: string) {
  return courses.find((course) => course.id === courseId) ?? null;
}

export function getCourseAreaById(areaId: string) {
  return courseAreas.find((area) => area.id === areaId) ?? null;
}

export function getCoursesForArea(areaId: string) {
  const area = getCourseAreaById(areaId);

  if (!area) return [];

  return area.courseIds
    .map((courseId) => getCourseById(courseId))
    .filter((course): course is StandaloneCourse => course !== null);
}

export function getGoldStandardCourses() {
  return completeCourseLibraryCourseIds
    .map((courseId) => getCourseById(courseId))
    .filter((course): course is StandaloneCourse => course !== null);
}

export function areAllCourseLessonsViewed(course: StandaloneCourse, viewedLessons: Record<number, boolean>) {
  return course.lessons.every((lesson) => viewedLessons[lesson.lessonNumber]);
}
