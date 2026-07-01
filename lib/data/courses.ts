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
  }
];

export function getCourseById(courseId: string) {
  return courses.find((course) => course.id === courseId) ?? null;
}

export function areAllCourseLessonsViewed(course: StandaloneCourse, viewedLessons: Record<number, boolean>) {
  return course.lessons.every((lesson) => viewedLessons[lesson.lessonNumber]);
}
