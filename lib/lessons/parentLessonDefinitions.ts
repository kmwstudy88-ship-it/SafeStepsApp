export type LessonThemePalette = {
  id: string;
  background: string;
  cardBackground: string;
  cardBorder: string;
  accentPrimary: string;
  accentSecondary: string;
  accentSoft: string;
  accentTint: string;
  headingColor: string;
  bodyColor: string;
  mutedColor: string;
  badgeBg: string;
  badgeText: string;
  buttonBg: string;
  buttonText: string;
  bannerBg: string;
  bannerBorder: string;
  heartIcon: string;
};

export type LessonPlanStep = {
  icon: string;
  duration: string;
  label: string;
};

export type KeyLearningPillar = {
  icon: string;
  title: string;
  description: string;
};

export type ParentLessonWorkbook = {
  id: string;
  title: string;
  durationLabel: string;
  theme: LessonThemePalette;
  page1: {
    introText: string;
    learningOutcomes: string[];
    lessonPlan: LessonPlanStep[];
  };
  page2: {
    heading: string;
    subheading: string;
    introText: string;
    mainQuestionLabel: string;
    mainQuestion: string;
    tipText: string;
  };
  page3: {
    heading: string;
    durationBadge: string;
    introText: string;
    questionsTitle: string;
    questions: string[];
    ratingTitle: string;
    ratingPrompt: string;
    ratingLowLabel: string;
    ratingHighLabel: string;
  };
  page4: {
    heading: string;
    durationBadge: string;
    sectionLabel: string;
    introText: string;
    pillars: KeyLearningPillar[];
    bottomBannerQuote: string;
  };
  page5: {
    heading: string;
    sectionLabel: string;
    introText: string;
    barriersTitle: string;
    barriersIcon: string;
    barriers: string[];
    repairTitle: string;
    repairIcon: string;
    repairs: string[];
    bottomBannerQuote: string;
  };
  page6: {
    heading: string;
    subtitle: string;
    activityBadge: string;
    introText: string;
    formTitle: string;
    prompts: string[];
    ideasTitle: string;
    ideas: string[];
  };
  page7: {
    heading: string;
    subtitle: string;
    activityBadge: string;
    introText: string;
    formTitle: string;
    prompts: string[];
    remindersTitle: string;
    reminders: string[];
    bottomBannerQuote: string;
  };
  page8: {
    heading: string;
    badgeLabel: string;
    introText: string;
    questionsTitle: string;
    questions: string[];
    selfCheckTitle: string;
    selfCheckItems: string[];
  };
  page9: {
    heading: string;
    subheading: string;
    introText: string;
    weeklyPlanTitle: string;
    minutesPrefix: string;
    minutesSuffix: string;
    prompt2Label: string;
    prompt3Label: string;
    rememberTitle: string;
    rememberItems: string[];
    completeHeading: string;
    completeSubtext: string;
  };
};

export const PARENT_LESSON_WORKBOOKS: ParentLessonWorkbook[] = [
  {
    id: 'taking_responsibility',
    title: 'Taking Responsibility',
    durationLabel: '30-Minute Lesson',
    theme: {
      id: 'responsibility_plum',
      background: '#F8F5FC',
      cardBackground: '#FFFFFF',
      cardBorder: '#E5DCF2',
      accentPrimary: '#5D488A',
      accentSecondary: '#1B6B7B',
      accentSoft: '#EDE6F7',
      accentTint: '#F4EFFB',
      headingColor: '#16214A',
      bodyColor: '#2D3554',
      mutedColor: '#695E85',
      badgeBg: '#6B5694',
      badgeText: '#FFFFFF',
      buttonBg: '#4E397A',
      buttonText: '#FFFFFF',
      bannerBg: '#F1EAF9',
      bannerBorder: '#DFD2F0',
      heartIcon: '#735B9D',
    },
    page1: {
      introText:
        'Taking responsibility means recognising our actions, making honest choices, and learning how to repair mistakes. This lesson helps parents explore how responsibility can be taught through guidance, accountability, and support.',
      learningOutcomes: [
        'understand responsibility',
        'recognise why accountability matters',
        'identify common barriers',
        'practise supportive responses',
        'reflect on next steps',
      ],
      lessonPlan: [
        { icon: '✏️', duration: '5 min', label: 'your definition' },
        { icon: '💬', duration: '5 min', label: 'check-in' },
        { icon: '💡', duration: '10 min', label: 'key learning' },
        { icon: '👨‍👩‍👧', duration: '10 min', label: 'activities' },
        { icon: '💜', duration: '5 min', label: 'reflection & wrap-up' },
      ],
    },
    page2: {
      heading: 'Before You Start',
      subheading: 'Your Definition',
      introText:
        'Before the lesson begins, take a moment to think about what taking responsibility means to you in your own words.',
      mainQuestionLabel: 'Main Start Question',
      mainQuestion: 'What does taking responsibility mean to you?',
      tipText: 'Think about honesty, choices, owning actions, and making things right.',
    },
    page3: {
      heading: 'Check-In & Warm-Up',
      durationBadge: '5-Minute Check-In',
      introText:
        "Let's pause for a moment to notice how responsibility is currently encouraged in your family.",
      questionsTitle: 'Quick Check-In Questions',
      questions: [
        'When does your child find it easiest to take responsibility?',
        'What helps your child admit mistakes or try again?',
        'What makes responsibility harder in the moment?',
      ],
      ratingTitle: 'Quick Rating',
      ratingPrompt: 'How strong is responsibility in your family right now?',
      ratingLowLabel: 'Needs attention',
      ratingHighLabel: 'Very strong',
    },
    page4: {
      heading: 'What Builds Responsibility?',
      durationBadge: '30-Minute Lesson',
      sectionLabel: 'Key Learning',
      introText:
        'Responsibility grows when children are guided with calm expectations, chances to repair mistakes, and support to make better choices. Clear boundaries and follow-through help responsibility develop over time.',
      pillars: [
        {
          icon: '🧭',
          title: 'Clear Expectations',
          description:
            'Children respond better when they know what is expected and what responsibility looks like.',
        },
        {
          icon: '🤝',
          title: 'Repair & Accountability',
          description:
            'Responsibility is strengthened when children are guided to own actions and make things right after mistakes.',
        },
        {
          icon: '🌱',
          title: 'Consistency & Support',
          description:
            'Calm follow-through, encouragement, and repeated practice help children learn responsible behaviour.',
        },
      ],
      bottomBannerQuote: 'Responsibility is learned through guidance, not shame.',
    },
    page5: {
      heading: 'Barriers to Responsibility',
      sectionLabel: 'Key Learning',
      introText:
        'Taking responsibility can be harder when children feel overwhelmed, fear blame, or have not yet learned how to repair mistakes. Recognising these barriers helps parents respond with more intention.',
      barriersTitle: 'Common Barriers',
      barriersIcon: '🧱',
      barriers: [
        'fear of getting into trouble',
        'avoiding blame or shame',
        'impulsivity or frustration',
        'unclear expectations',
        'lack of follow-through',
        'not knowing how to repair mistakes',
      ],
      repairTitle: 'What Helps Repair Responsibility',
      repairIcon: '🌿',
      repairs: [
        'stay calm when mistakes happen',
        'focus on learning, not shaming',
        'guide the child to name what happened',
        'help plan a repair step',
        'praise honesty and effort',
      ],
      bottomBannerQuote:
        'Children learn responsibility best when they feel safe enough to be honest.',
    },
    page6: {
      heading: 'Activity 1:',
      subtitle: 'Responsibility Moments',
      activityBadge: 'Practice Activity',
      introText:
        'Think about a time when your child made a mistake or caused a problem and was able to take responsibility in some way.',
      formTitle: 'Write About a Responsibility Moment',
      prompts: [
        'What happened?',
        'How did your child respond?',
        'What helped them take responsibility or repair the situation?',
      ],
      ideasTitle: 'Ideas for Building Responsibility',
      ideas: [
        'stay calm',
        'name the behaviour',
        'invite honesty',
        'offer support',
        'guide repair',
        'use clear expectations',
        'follow through gently',
        'model accountability',
        'notice effort',
        'try again',
      ],
    },
    page7: {
      heading: 'Activity 2:',
      subtitle: 'Responsibility Plan',
      activityBadge: 'Practice Activity',
      introText:
        'Small, repeated actions help responsibility grow. Use this page to plan your next steps.',
      formTitle: 'Build Your Responsibility Plan',
      prompts: [
        'One responsibility skill I want to strengthen this week:',
        'One calm response I can use when mistakes happen:',
        'One repair step I want to teach or practise:',
      ],
      remindersTitle: 'Simple Strategy Reminders',
      reminders: [
        'stay calm',
        'listen first',
        'focus on repair',
        'be consistent',
        'keep it realistic',
        'repeat often',
      ],
      bottomBannerQuote:
        'Responsibility grows through simple, repeated acts of accountability.',
    },
    page8: {
      heading: 'Reflection',
      badgeLabel: 'Pause & Reflect',
      introText:
        'Take a moment to notice your progress. Reflection helps you recognise strengths, understand challenges, and choose your next step with intention.',
      questionsTitle: 'Reflection Questions',
      questions: [
        'What did you learn about responsibility today?',
        'What is one strength your family already brings to accountability?',
        'What is one step you want to try at home?',
      ],
      selfCheckTitle: 'Quick Self-Check',
      selfCheckItems: [
        'I can name what responsibility looks like.',
        'I understand some barriers that can get in the way.',
        'I have one clear idea to try at home.',
      ],
    },
    page9: {
      heading: 'Taking Responsibility',
      subheading: 'Lesson Wrap-Up',
      introText:
        "You've completed this lesson—great job! Every step toward honesty, repair, and accountability helps children grow in confidence and responsibility.",
      weeklyPlanTitle: 'This Week I Will...',
      minutesPrefix: 'spend',
      minutesSuffix: 'minutes practising calm accountability with my child',
      prompt2Label: 'practise this supportive response:',
      prompt3Label: 'strengthen this responsibility routine:',
      rememberTitle: 'Remember',
      rememberItems: [
        'responsibility grows through consistency',
        'mistakes can become learning moments',
        'repair is powerful',
        'warm guidance builds trust',
      ],
      completeHeading: 'Lesson Complete',
      completeSubtext: "You're making a difference every day.",
    },
  },
  {
    id: 'strengthening_family_bond',
    title: 'Strengthening Family Bond',
    durationLabel: '30-Minute Lesson',
    theme: {
      id: 'bonding_teal',
      background: '#F5FAF8',
      cardBackground: '#FCFDFB',
      cardBorder: '#D5E5DF',
      accentPrimary: '#135D66',
      accentSecondary: '#D9A74A',
      accentSoft: '#E3F1EE',
      accentTint: '#EFF7F5',
      headingColor: '#0E474E',
      bodyColor: '#253D40',
      mutedColor: '#567376',
      badgeBg: '#D9ECE8',
      badgeText: '#0E474E',
      buttonBg: '#13636D',
      buttonText: '#FFFFFF',
      bannerBg: '#ECF5EC',
      bannerBorder: '#CFE3D4',
      heartIcon: '#E0B252',
    },
    page1: {
      introText:
        'Strong family bonds help children feel safe, valued, and connected. This lesson explores simple ways to build closeness through time, communication, and shared routines.',
      learningOutcomes: [
        'understand what strengthens connection',
        'identify barriers to bonding',
        'practise simple connection strategies',
        'reflect on your family bond',
        'create a family action step',
      ],
      lessonPlan: [
        { icon: '✏️', duration: '5 min', label: 'your definition' },
        { icon: '💬', duration: '5 min', label: 'check-in' },
        { icon: '📖', duration: '10 min', label: 'key learning' },
        { icon: '👨‍👩‍👧', duration: '10 min', label: 'activities' },
        { icon: '🌿', duration: '5 min', label: 'reflection & wrap-up' },
      ],
    },
    page2: {
      heading: 'Before You Start',
      subheading: 'Your Definition',
      introText:
        'Before the lesson begins, take a moment to think about what this lesson title means to you in your own words.',
      mainQuestionLabel: 'Main Start Question',
      mainQuestion: 'What does "Strengthening Family Bond" mean to you?',
      tipText: 'Think about connection, trust, love, time together, and feeling safe as a family.',
    },
    page3: {
      heading: 'Check-In & Warm-Up',
      durationBadge: '5-Minute Check-In',
      introText:
        "Let's pause for a moment to notice how connected things feel in your family right now. A quick check-in helps you build awareness and choose small steps that make a big difference.",
      questionsTitle: 'Start Questions',
      questions: [
        'When do you feel most connected to your child?',
        'What helps your family feel close?',
        'What gets in the way of connection at home?',
        'What is one bond you want to strengthen?',
      ],
      ratingTitle: 'Quick Rating',
      ratingPrompt: 'Circle or think about where your family bond feels today.',
      ratingLowLabel: 'Needs attention',
      ratingHighLabel: 'Very strong',
    },
    page4: {
      heading: 'What Builds Strong Family Bonds?',
      durationBadge: '30-Minute Lesson',
      sectionLabel: 'Key Learning',
      introText:
        'Strong bonds grow through everyday moments, emotional safety, and reliable care. These simple ingredients help children feel secure, connected, and ready to thrive.',
      pillars: [
        {
          icon: '👨‍👩‍👧',
          title: 'Time Together',
          description:
            'Regular shared time, even in small amounts, helps children feel noticed and valued.',
        },
        {
          icon: '💬',
          title: 'Warm Communication',
          description:
            'Listening, affection, encouragement, and calm words help children feel safe and understood.',
        },
        {
          icon: '🛡️',
          title: 'Trust & Reliability',
          description:
            'Following through, keeping routines, and being emotionally available build security over time.',
        },
      ],
      bottomBannerQuote: 'Connection is built in little moments, not only big events.',
    },
    page5: {
      heading: 'Barriers to Bonding',
      sectionLabel: 'Key Learning',
      introText:
        'Connection can weaken when stress, conflict, or disconnection patterns build up. Recognising these barriers is the first step toward stronger, safer bonds.',
      barriersTitle: 'Common Barriers',
      barriersIcon: '🚧',
      barriers: [
        'stress and exhaustion',
        'inconsistent routines',
        'conflict or harsh communication',
        'too little quality time',
        'distractions like phones or busy schedules',
        'unresolved hurt or trust issues',
      ],
      repairTitle: 'What Helps Repair Connection',
      repairIcon: '🌱',
      repairs: [
        "slowing down and noticing your child's cues",
        'apologising and reconnecting after hard moments',
        'creating regular one-on-one time',
        'showing warmth through words, touch, and attention',
      ],
      bottomBannerQuote:
        'Bonding does not require perfection — it grows through repair and consistency.',
    },
    page6: {
      heading: 'Activity 1:',
      subtitle: 'Bonding Moments',
      activityBadge: 'Practice Activity',
      introText:
        'Take a moment to think about a positive time when you felt connected with your child.',
      formTitle: 'Write About a Positive Moment',
      prompts: [
        'What was happening?',
        'How did your child respond?',
        'How could you create more moments like this?',
      ],
      ideasTitle: 'Ideas for Bonding',
      ideas: [
        'shared meal',
        'bedtime chat',
        'walk together',
        'reading',
        'game night',
        'cooking together',
        'drawing together',
        'check-in after school',
        'one-on-one time',
        'family routine',
      ],
    },
    page7: {
      heading: 'Activity 2:',
      subtitle: 'Connection Builder',
      activityBadge: 'Practice Activity',
      introText:
        'Small, repeated habits build big connections. Use this page to plan your next steps.',
      formTitle: 'Build Your Family Connection Plan',
      prompts: [
        'One activity we can do together this week:',
        'One thing I can say or do to show warmth:',
        'A routine we want to strengthen:',
      ],
      remindersTitle: 'Simple Strategy Reminders',
      reminders: [
        'be present',
        'listen first',
        'use encouragement',
        'keep it realistic',
        'repeat often',
      ],
      bottomBannerQuote: 'Strong bonds grow through simple, repeated acts of care.',
    },
    page8: {
      heading: 'Reflection',
      badgeLabel: 'Pause & Reflect',
      introText:
        'Take a moment to notice your progress. Reflection helps you celebrate small wins, understand challenges, and choose your next step with intention.',
      questionsTitle: 'Reflection Questions',
      questions: [
        'What did you learn about family connection today?',
        'What strengths does your family already have?',
        'What is one step you want to try at home?',
      ],
      selfCheckTitle: 'Quick Self-Check',
      selfCheckItems: [
        'I can name what strengthens connection.',
        'I understand some barriers to bonding.',
        'I have one clear idea to try at home.',
      ],
    },
    page9: {
      heading: 'Strengthening Family Bond',
      subheading: 'Lesson Wrap-Up',
      introText:
        "You've completed this lesson—great job! Every moment of connection you create helps your child feel safe, loved, and supported.",
      weeklyPlanTitle: 'This Week I Will...',
      minutesPrefix: 'spend',
      minutesSuffix: 'minutes of focused time with my child',
      prompt2Label: 'practise this connection habit:',
      prompt3Label: 'strengthen this routine:',
      rememberTitle: 'Remember',
      rememberItems: [
        'connection grows through consistency',
        'small moments matter',
        'repair is powerful',
        'warmth builds trust',
      ],
      completeHeading: 'Lesson Complete',
      completeSubtext: "You're making a difference every day.",
    },
  },
  {
    id: 'supporting_children_emotionally',
    title: 'Supporting Children Emotionally',
    durationLabel: '30-Minute Lesson',
    theme: {
      id: 'emotional_lavender',
      background: '#FAF6F9',
      cardBackground: '#FFFFFF',
      cardBorder: '#E4D8EC',
      accentPrimary: '#5E4B8B',
      accentSecondary: '#D98A82',
      accentSoft: '#EFEAF6',
      accentTint: '#F7F3FB',
      headingColor: '#2A2356',
      bodyColor: '#363056',
      mutedColor: '#756894',
      badgeBg: '#E6DFEE',
      badgeText: '#2A2356',
      buttonBg: '#5C4D82',
      buttonText: '#FFFFFF',
      bannerBg: '#F4EDF8',
      bannerBorder: '#E2D4EC',
      heartIcon: '#DF9B8F',
    },
    page1: {
      introText:
        'Supporting children emotionally means helping them feel safe with big feelings, listening with empathy, and guiding them toward calm regulation.',
      learningOutcomes: [
        'understand emotional co-regulation',
        'notice when your child needs support',
        'identify barriers to calm responses',
        'practise comforting words and habits',
        'build an emotional support plan',
      ],
      lessonPlan: [
        { icon: '✏️', duration: '5 min', label: 'your definition' },
        { icon: '💬', duration: '5 min', label: 'check-in' },
        { icon: '💡', duration: '10 min', label: 'key learning' },
        { icon: '🤝', duration: '10 min', label: 'activities' },
        { icon: '🌸', duration: '5 min', label: 'reflection & wrap-up' },
      ],
    },
    page2: {
      heading: 'Before You Start',
      subheading: 'Your Definition',
      introText:
        'Before the lesson begins, take a moment to think about what supporting children emotionally means to you in your own words.',
      mainQuestionLabel: 'Main Start Question',
      mainQuestion: 'What does supporting children emotionally mean to you?',
      tipText:
        'Think about comfort, listening, calm responses, helping feelings feel safe, and being there when your child needs you.',
    },
    page3: {
      heading: 'Check-In & Warm-Up',
      durationBadge: '5-Minute Check-In',
      introText:
        "Let's pause for a moment to notice how emotions are currently being supported in your family.",
      questionsTitle: 'Quick Check-In Questions',
      questions: [
        'When does your child most need emotional support?',
        'What helps your child feel calm, safe, or understood?',
        'What makes it harder to respond supportively in the moment?',
      ],
      ratingTitle: 'Quick Rating',
      ratingPrompt: 'How supported do emotions feel in your home right now?',
      ratingLowLabel: 'Needs attention',
      ratingHighLabel: 'Very strong',
    },
    page4: {
      heading: 'What Helps Children Feel Emotionally Safe?',
      durationBadge: '30-Minute Lesson',
      sectionLabel: 'Key Learning',
      introText:
        'Children learn to manage big feelings when adults stay steady, validate their emotions, and offer comfort before problem-solving.',
      pillars: [
        {
          icon: '🫂',
          title: 'Warm Presence',
          description:
            'Staying close and using a gentle tone signals safety when a child feels overwhelmed.',
        },
        {
          icon: '💬',
          title: 'Naming & Validating Feelings',
          description:
            'Helping children put words to feelings shows that all emotions are safe to talk about.',
        },
        {
          icon: '🌬️',
          title: 'Co-Regulation First',
          description:
            'Calming the body together comes before teaching a lesson or solving the problem.',
        },
      ],
      bottomBannerQuote: 'All feelings are valid, even when behaviours need gentle boundaries.',
    },
    page5: {
      heading: 'Barriers to Emotional Support',
      sectionLabel: 'Key Learning',
      introText:
        'It can be hard to stay calm and supportive when parents are stressed, tired, or triggered by big reactions.',
      barriersTitle: 'Common Barriers',
      barriersIcon: '🌧️',
      barriers: [
        'parent stress or exhaustion',
        'rushing to fix or dismiss the feeling',
        'feeling triggered by crying or anger',
        'expecting children to calm down alone',
        'confusing big feelings with misbehaviour',
      ],
      repairTitle: 'What Helps Support Emotions',
      repairIcon: '🌸',
      repairs: [
        'pause and take a slow breath first',
        'get down to your child’s eye level',
        'validate the feeling before problem-solving',
        'offer comfort or a quiet calm space',
        'reconnect warmly once the storm passes',
      ],
      bottomBannerQuote: 'Your calm presence is your child’s strongest anchor.',
    },
    page6: {
      heading: 'Activity 1:',
      subtitle: 'Emotional Support Moments',
      activityBadge: 'Practice Activity',
      introText:
        'Think about a recent moment when your child had a big feeling and felt comforted or understood.',
      formTitle: 'Write About an Emotional Support Moment',
      prompts: [
        'What feeling was your child experiencing?',
        'How did you respond or offer comfort?',
        'What helped your child feel safe and calm again?',
      ],
      ideasTitle: 'Ideas for Supporting Emotions',
      ideas: [
        'sit quietly nearby',
        'use a soft voice',
        'name the emotion',
        'offer a hug',
        'take three slow breaths',
        'listen without rushing',
        'validate their frustration',
        'drink water together',
        'use a calm corner',
        'praise calming down',
      ],
    },
    page7: {
      heading: 'Activity 2:',
      subtitle: 'Emotional Support Plan',
      activityBadge: 'Practice Activity',
      introText:
        'Planning ahead makes it easier to stay steady when big feelings show up.',
      formTitle: 'Build Your Emotional Support Plan',
      prompts: [
        'One sign my child needs emotional support:',
        'One comforting phrase I can say in the moment:',
        'One way I will steady myself before responding:',
      ],
      remindersTitle: 'Simple Strategy Reminders',
      reminders: [
        'breathe first',
        'connect before correcting',
        'name the feeling',
        'keep your voice low',
        'offer comfort',
        'repair if needed',
      ],
      bottomBannerQuote: 'Connection in hard moments builds lifelong emotional trust.',
    },
    page8: {
      heading: 'Reflection',
      badgeLabel: 'Pause & Reflect',
      introText:
        'Take a moment to notice your progress and choose one supportive step to bring into your week.',
      questionsTitle: 'Reflection Questions',
      questions: [
        'What did you learn about supporting your child emotionally today?',
        'What is one emotional strength you already bring as a parent?',
        'What is one step you want to try at home this week?',
      ],
      selfCheckTitle: 'Quick Self-Check',
      selfCheckItems: [
        'I can notice when my child needs co-regulation.',
        'I understand what makes emotional support harder.',
        'I have one comforting phrase ready to use.',
      ],
    },
    page9: {
      heading: 'Supporting Children Emotionally',
      subheading: 'Lesson Wrap-Up',
      introText:
        "You've completed this lesson—great job! Every time you meet big feelings with calm warmth, your child learns that they are safe and loved.",
      weeklyPlanTitle: 'This Week I Will...',
      minutesPrefix: 'spend',
      minutesSuffix: 'minutes checking in on my child’s feelings each day',
      prompt2Label: 'practise this comforting phrase:',
      prompt3Label: 'use this calming routine when feelings run high:',
      rememberTitle: 'Remember',
      rememberItems: [
        'connection comes before correction',
        'big feelings need calm anchors',
        'repair builds emotional safety',
        'warm listening builds trust',
      ],
      completeHeading: 'Lesson Complete',
      completeSubtext: "You're making a difference every day.",
    },
  },
  {
    id: 'lesson_understanding_triggers_and_relapse_prevention',
    title: 'Triggers & Relapse Prevention',
    durationLabel: '30-Minute Lesson',
    theme: {
      id: 'recovery_sage',
      background: '#F4F9F6',
      cardBackground: '#FFFFFF',
      cardBorder: '#D4E6DC',
      accentPrimary: '#1E6449',
      accentSecondary: '#B87D2D',
      accentSoft: '#E2F1E9',
      accentTint: '#EEF6F2',
      headingColor: '#123F2E',
      bodyColor: '#254236',
      mutedColor: '#567567',
      badgeBg: '#D9EDE2',
      badgeText: '#123F2E',
      buttonBg: '#1E6449',
      buttonText: '#FFFFFF',
      bannerBg: '#EAF4EE',
      bannerBorder: '#CBE2D5',
      heartIcon: '#2E8B67',
    },
    page1: {
      introText:
        'Recovery and safe parenting go hand in hand. This workbook helps you map early stress and craving signals, protect your child’s daily routines, and build a non-shaming support plan before overwhelm builds.',
      learningOutcomes: [
        'identify HALT and parenting stress triggers early',
        'separate recovery slips from parenting identity',
        'build a two-contact early call list',
        'protect child supervision and routines during hard days',
        'commit to a daily recovery-safe parenting habit',
      ],
      lessonPlan: [
        { icon: '✏️', duration: '5 min', label: 'your definition' },
        { icon: '💬', duration: '5 min', label: 'check-in' },
        { icon: '🧭', duration: '10 min', label: 'key learning' },
        { icon: '🛡️', duration: '10 min', label: 'activities' },
        { icon: '🌿', duration: '5 min', label: 'reflection & wrap-up' },
      ],
    },
    page2: {
      heading: 'Before You Start',
      subheading: 'Your Definition',
      introText:
        'Take a quiet moment to think about what staying steady and protective in your recovery means for you and your children.',
      mainQuestionLabel: 'Main Start Question',
      mainQuestion: 'What does safe, recovery-focused parenting look like in your home?',
      tipText: 'Think about honesty, early help-seeking, steady routines, and keeping children safe.',
    },
    page3: {
      heading: 'Check-In & Warm-Up',
      durationBadge: '5-Minute Check-In',
      introText:
        'Noticing your stress and energy levels early is one of the strongest protective skills you can practise.',
      questionsTitle: 'Quick Check-In Questions',
      questions: [
        'What early body or mood signals tell you that stress is building?',
        'Which time of day feels hardest to stay regulated and rested?',
        'Who is the safest person to call when you feel overwhelmed?',
      ],
      ratingTitle: 'Quick Rating',
      ratingPrompt: 'How steady and supported does your recovery plan feel today?',
      ratingLowLabel: 'Needs support',
      ratingHighLabel: 'Very steady',
    },
    page4: {
      heading: 'What Protects Recovery & Parenting?',
      durationBadge: '30-Minute Lesson',
      sectionLabel: 'Key Learning',
      introText:
        'Relapse prevention is not about willpower alone—it is built through early body awareness, predictable routines, and safe people you can reach before a crisis.',
      pillars: [
        {
          icon: '🚦',
          title: 'Early Signal Detection (HALT)',
          description:
            'Checking whether you are Hungry, Angry, Lonely, or Tired helps you step in before cravings or shutdown escalate.',
        },
        {
          icon: '🛡️',
          title: 'Child-Safe Backup Plans',
          description:
            'Knowing who can step in to supervise and support your child keeps children safe even when you need extra recovery care.',
        },
        {
          icon: '🤝',
          title: 'Honest Support Networks',
          description:
            'Reaching out early to a sponsor, clinician, or trusted support person turns isolation into safety.',
        },
      ],
      bottomBannerQuote: 'Asking for help early is an act of protective parenting.',
    },
    page5: {
      heading: 'Barriers to Early Help-Seeking',
      sectionLabel: 'Key Learning',
      introText:
        'Shame, exhaustion, or fear of judgement can make parents hide stress until it spills over. Naming these barriers helps you choose safety early.',
      barriersTitle: 'Common Barriers',
      barriersIcon: '🧱',
      barriers: [
        'shame or fear of being judged',
        'trying to push through exhaustion alone',
        'skipping meals, sleep, or recovery check-ins',
        'conflict with partners or extended family',
        'waiting until cravings feel overwhelming',
      ],
      repairTitle: 'What Protects Your Plan',
      repairIcon: '🌿',
      repairs: [
        'do a 60-second HALT check before transitions',
        'call a safe support person at the first yellow flag',
        'keep child meal and bedtime anchors simple',
        'remove high-risk triggers from the home environment',
        'celebrate every honest, protective choice',
      ],
      bottomBannerQuote: 'Recovery grows stronger when honesty replaces secrecy.',
    },
    page6: {
      heading: 'Activity 1:',
      subtitle: 'Mapping My Early Signals',
      activityBadge: 'Practice Activity',
      introText:
        'Think about a recent stressful day when you noticed overwhelm early and chose a safe way to steady yourself.',
      formTitle: 'Write About a Protective Choice',
      prompts: [
        'What early warning sign did you notice in your body or thoughts?',
        'What helped you pause or reach out for support?',
        'How did that choice protect your child’s day?',
      ],
      ideasTitle: 'Grounding & Recovery Tools',
      ideas: [
        'HALT check-in',
        'call sponsor or peer worker',
        'step outside for fresh air',
        'drink water & eat a meal',
        '5-4-3-2-1 grounding',
        'simplify dinner routine',
        'early bedtime',
        'honest check-in with worker',
      ],
    },
    page7: {
      heading: 'Activity 2:',
      subtitle: 'My Red-to-Green Safety Plan',
      activityBadge: 'Practice Activity',
      introText:
        'Write down the exact steps you will take this week when stress rises so you don’t have to figure it out in the heat of the moment.',
      formTitle: 'Build Your Relapse Prevention Plan',
      prompts: [
        'My top early warning sign that I need to pause:',
        'Two safe people or services I can contact immediately:',
        'How I will keep my child’s routine safe while I reset:',
      ],
      remindersTitle: 'Simple Strategy Reminders',
      reminders: [
        'check HALT daily',
        'protect sleep',
        'reach out early',
        'keep routines simple',
        'no secrecy',
      ],
      bottomBannerQuote: 'A clear plan turns a hard moment into a safe moment.',
    },
    page8: {
      heading: 'Reflection',
      badgeLabel: 'Pause & Reflect',
      introText:
        'Pause to recognise the courage it takes to build a safe, honest recovery and parenting plan.',
      questionsTitle: 'Reflection Questions',
      questions: [
        'What did you notice about your early stress signals today?',
        'What strength has helped you come this far in your recovery?',
        'What is one small protective habit you will practise this week?',
      ],
      selfCheckTitle: 'Quick Self-Check',
      selfCheckItems: [
        'I can name my early stress and trigger signals.',
        'I have at least one safe support contact ready.',
        'I know how to keep my child’s routine steady on hard days.',
      ],
    },
    page9: {
      heading: 'Triggers & Relapse Prevention',
      subheading: 'Lesson Wrap-Up',
      introText:
        'You have completed this workbook—well done! Every protective routine you build strengthens both your recovery and your child’s safety.',
      weeklyPlanTitle: 'This Week I Will...',
      minutesPrefix: 'spend',
      minutesSuffix: 'minutes each day checking in on my HALT and calm plan',
      prompt2Label: 'use this grounding or support step when stressed:',
      prompt3Label: 'protect this daily routine with my child:',
      rememberTitle: 'Remember',
      rememberItems: [
        'early signals are easier to steady than crises',
        'asking for help is protective parenting',
        'predictable routines help children feel safe',
        'every honest step counts',
      ],
      completeHeading: 'Lesson Complete',
      completeSubtext: "You're making a difference every day.",
    },
  },
  {
    id: 'lesson_preparing_for_contact_visits',
    title: 'Preparing for Contact Visits',
    durationLabel: '30-Minute Lesson',
    theme: {
      id: 'reunification_ocean',
      background: '#F4F8FB',
      cardBackground: '#FFFFFF',
      cardBorder: '#D4E2EE',
      accentPrimary: '#1D5B86',
      accentSecondary: '#D48C3B',
      accentSoft: '#E3EEF7',
      accentTint: '#EFF5FA',
      headingColor: '#113A56',
      bodyColor: '#254259',
      mutedColor: '#5B768C',
      badgeBg: '#DAE8F4',
      badgeText: '#113A56',
      buttonBg: '#1D5B86',
      buttonText: '#FFFFFF',
      bannerBg: '#EAF2F8',
      bannerBorder: '#CBE0F0',
      heartIcon: '#2B72A3',
    },
    page1: {
      introText:
        'Contact visits are powerful building blocks for reunification. This lesson helps you prepare emotionally and practically so your child experiences warmth, predictability, and child-led connection from hello to goodbye.',
      learningOutcomes: [
        'prepare your own nervous system before contact',
        'follow your child’s pace during warm-up and play',
        'respond calmly to mixed feelings or quietness',
        'create a predictable, reassuring goodbye ritual',
        'debrief constructively after the visit',
      ],
      lessonPlan: [
        { icon: '✏️', duration: '5 min', label: 'your definition' },
        { icon: '💬', duration: '5 min', label: 'check-in' },
        { icon: '🧸', duration: '10 min', label: 'key learning' },
        { icon: '👨‍👩‍👧', duration: '10 min', label: 'activities' },
        { icon: '💙', duration: '5 min', label: 'reflection & wrap-up' },
      ],
    },
    page2: {
      heading: 'Before You Start',
      subheading: 'Your Definition',
      introText:
        'Think about what a safe, comforting contact visit feels like through your child’s eyes.',
      mainQuestionLabel: 'Main Start Question',
      mainQuestion: 'What do you want your child to feel when they see you at a visit?',
      tipText: 'Think about safety, warmth, no pressure, gentle play, and predictable goodbyes.',
    },
    page3: {
      heading: 'Check-In & Warm-Up',
      durationBadge: '5-Minute Check-In',
      introText:
        'Contact visits can stir up big emotions for parents and children alike. Checking in helps you arrive grounded.',
      questionsTitle: 'Quick Check-In Questions',
      questions: [
        'What goes well during your contact visits right now?',
        'What part of the visit (arrival, play, or goodbye) feels hardest?',
        'What helps your child warm up at their own pace?',
      ],
      ratingTitle: 'Quick Rating',
      ratingPrompt: 'How prepared and steady do you feel before contact visits?',
      ratingLowLabel: 'Needs preparation',
      ratingHighLabel: 'Very steady',
    },
    page4: {
      heading: 'What Makes Contact Visits Safe & Connected?',
      durationBadge: '30-Minute Lesson',
      sectionLabel: 'Key Learning',
      introText:
        'Children often need a few minutes to adjust between worlds. When you arrive calm, bring simple familiar activities, and keep goodbyes warm, your child learns they can trust the rhythm of seeing you.',
      pillars: [
        {
          icon: '🌬️',
          title: 'Regulated Arrival',
          description:
            'Arriving 15 minutes early and grounding yourself lets your child meet a calm, steady parent.',
        },
        {
          icon: '🎨',
          title: 'Child-Led Play & Snack',
          description:
            'Bringing a familiar snack and two low-pressure activities lets your child lead the pace of connection.',
        },
        {
          icon: '👋',
          title: 'Warm, Brief Goodbyes',
          description:
            'Reassuring your child of when you will see them next without adult distress protects their transition back.',
        },
      ],
      bottomBannerQuote: 'A calm hello and a steady goodbye build lasting trust.',
    },
    page5: {
      heading: 'Barriers During Contact Visits',
      sectionLabel: 'Key Learning',
      introText:
        'It is natural to want to pack everything into a short visit or feel hurt if a child seems quiet at first.',
      barriersTitle: 'Common Barriers',
      barriersIcon: '🚧',
      barriers: [
        'feeling hurt if your child takes time to warm up',
        'bringing too many noisy or overwhelming gifts',
        'asking adult or court-related questions',
        'showing big distress during the goodbye',
      ],
      repairTitle: 'What Helps Connection Flow',
      repairIcon: '🌱',
      repairs: [
        'give your child 5–10 minutes of gentle warm-up space',
        'sit on the floor and follow their play interest',
        'keep conversations focused on the child’s world',
        'use the same warm goodbye ritual every visit',
      ],
      bottomBannerQuote: 'Following your child’s pace shows them their feelings matter.',
    },
    page6: {
      heading: 'Activity 1:',
      subtitle: 'Visit Highlights',
      activityBadge: 'Practice Activity',
      introText:
        'Think about a moment during a contact visit—or a past shared moment—when your child relaxed and smiled.',
      formTitle: 'Write About a Connection Moment',
      prompts: [
        'What simple activity or snack were you sharing?',
        'What cues showed that your child felt comfortable?',
        'How can you bring that same calm rhythm to your next visit?',
      ],
      ideasTitle: 'Low-Pressure Visit Ideas',
      ideas: [
        'colouring together',
        'favourite fruit snack',
        'reading a picture book',
        'building blocks',
        'card game',
        'blowing bubbles',
        'drawing family pictures',
        'calm goodbye handshake',
      ],
    },
    page7: {
      heading: 'Activity 2:',
      subtitle: 'My Next Visit Plan',
      activityBadge: 'Practice Activity',
      introText:
        'Plan your next contact visit from arrival to debrief so you feel ready and supported.',
      formTitle: 'Build Your Contact Visit Plan',
      prompts: [
        'How I will ground myself 15 minutes before the visit starts:',
        'Two simple child-led activities or snacks I will pack:',
        'The calm, reassuring goodbye phrase I will use at the end:',
      ],
      remindersTitle: 'Simple Strategy Reminders',
      reminders: [
        'arrive early',
        'follow their lead',
        'keep adult topics out',
        'warm brief goodbye',
        'debrief after',
      ],
      bottomBannerQuote: 'Consistency across visits builds the bridge toward reunification.',
    },
    page8: {
      heading: 'Reflection',
      badgeLabel: 'Pause & Reflect',
      introText:
        'Take a moment to appreciate the care you are putting into making every contact visit safe for your child.',
      questionsTitle: 'Reflection Questions',
      questions: [
        'What did you learn about supporting your child’s transitions today?',
        'How can you care for your own feelings after a visit ends?',
        'What is one thing you want to try at your very next visit?',
      ],
      selfCheckTitle: 'Quick Self-Check',
      selfCheckItems: [
        'I have a pre-visit grounding routine.',
        'I have simple child-led activities ready.',
        'I have a calm goodbye ritual planned.',
      ],
    },
    page9: {
      heading: 'Preparing for Contact Visits',
      subheading: 'Lesson Wrap-Up',
      introText:
        'Great job completing this workbook! Your steady preparation helps your child feel cherished and secure.',
      weeklyPlanTitle: 'Before My Next Visit I Will...',
      minutesPrefix: 'arrive',
      minutesSuffix: 'minutes early to breathe and settle my body',
      prompt2Label: 'pack this simple activity or snack:',
      prompt3Label: 'close the visit with this warm goodbye ritual:',
      rememberTitle: 'Remember',
      rememberItems: [
        'slow warm-ups are normal for children',
        'your calm voice sets the tone',
        'simple play beats complicated plans',
        'steady goodbyes protect your child’s heart',
      ],
      completeHeading: 'Lesson Complete',
      completeSubtext: "You're making a difference every day.",
    },
  },
];

const DEFAULT_THEME_PALETTES: LessonThemePalette[] = [
  PARENT_LESSON_WORKBOOKS[0].theme,
  PARENT_LESSON_WORKBOOKS[1].theme,
  PARENT_LESSON_WORKBOOKS[2].theme,
  PARENT_LESSON_WORKBOOKS[3].theme,
  PARENT_LESSON_WORKBOOKS[4].theme,
];

function humanizeLessonId(lessonId: string): string {
  return lessonId
    .replace(/^lesson_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function getLessonWorkbookById(lessonId: string, customTitle?: string): ParentLessonWorkbook {
  const normalized = lessonId.trim();
  const withoutPrefix = normalized.replace(/^lesson_/, '');
  const withPrefix = normalized.startsWith('lesson_') ? normalized : `lesson_${normalized}`;

  const existing = PARENT_LESSON_WORKBOOKS.find(
    (wb) => wb.id === normalized || wb.id === withoutPrefix || wb.id === withPrefix,
  );
  if (existing) {
    return existing;
  }

  const title = customTitle ?? humanizeLessonId(normalized);
  const hash = normalized.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const theme = DEFAULT_THEME_PALETTES[hash % DEFAULT_THEME_PALETTES.length];

  return {
    id: normalized,
    title,
    durationLabel: '30-Minute Lesson',
    theme,
    page1: {
      introText: `${title} helps parents and carers build practical, trauma-informed habits that strengthen safety, emotional connection, and everyday confidence at home.`,
      learningOutcomes: [
        `understand the core principles of ${title.toLowerCase()}`,
        'notice early cues and family triggers with compassion',
        'identify everyday barriers that get in the way',
        'practise calm, child-centred responses',
        'create a realistic weekly action plan',
      ],
      lessonPlan: [
        { icon: '✏️', duration: '5 min', label: 'your definition' },
        { icon: '💬', duration: '5 min', label: 'check-in' },
        { icon: '💡', duration: '10 min', label: 'key learning' },
        { icon: '👨‍👩‍👧', duration: '10 min', label: 'activities' },
        { icon: '💜', duration: '5 min', label: 'reflection & wrap-up' },
      ],
    },
    page2: {
      heading: 'Before You Start',
      subheading: 'Your Definition',
      introText: `Before diving in, take a moment to reflect on what "${title}" means to you and your family in your own words.`,
      mainQuestionLabel: 'Main Start Question',
      mainQuestion: `What does "${title}" mean to you right now?`,
      tipText: 'Think about safety, calm routines, listening, and how you want your home to feel.',
    },
    page3: {
      heading: 'Check-In & Warm-Up',
      durationBadge: '5-Minute Check-In',
      introText: `Let's pause to notice what is already working around ${title.toLowerCase()} and where extra support could help.`,
      questionsTitle: 'Quick Check-In Questions',
      questions: [
        `When does ${title.toLowerCase()} feel easiest in your daily routine?`,
        'What cues tell you your child needs extra co-regulation or guidance?',
        'What makes this skill harder when everyone is tired or stressed?',
      ],
      ratingTitle: 'Quick Rating',
      ratingPrompt: `How confident do you feel with ${title.toLowerCase()} today?`,
      ratingLowLabel: 'Needs attention',
      ratingHighLabel: 'Very confident',
    },
    page4: {
      heading: `What Strengthens ${title}?`,
      durationBadge: '30-Minute Lesson',
      sectionLabel: 'Key Learning',
      introText: `${title} grows when adults regulate first, keep expectations clear and developmentally realistic, and repair warmly after hard moments.`,
      pillars: [
        {
          icon: '🧭',
          title: 'Calm Adult Anchor',
          description:
            'Pausing to steady your breathing and tone of voice signals safety to your child’s nervous system.',
        },
        {
          icon: '💬',
          title: 'Attuned Communication',
          description:
            'Noticing beneath-the-surface needs and validating feelings before problem-solving builds trust.',
        },
        {
          icon: '🌱',
          title: 'Predictable Follow-Through',
          description:
            'Small, repeatable routines and gentle repair help new habits stick over time.',
        },
      ],
      bottomBannerQuote: 'Progress is built through calm consistency and repair, not perfection.',
    },
    page5: {
      heading: `Barriers & Repair in ${title}`,
      sectionLabel: 'Key Learning',
      introText:
        'Every family hits bumpy moments when stress, fatigue, or unclear expectations pile up. Naming barriers helps you respond with intention.',
      barriersTitle: 'Common Barriers',
      barriersIcon: '🧱',
      barriers: [
        'parent stress, fatigue, or sensory overload',
        'rushing transitions without warning',
        'expecting children to self-regulate when overwhelmed',
        'reacting in the heat of the moment',
      ],
      repairTitle: 'What Helps Repair & Reset',
      repairIcon: '🌿',
      repairs: [
        'pause and take three slow breaths before speaking',
        'connect at eye level and name the feeling',
        'keep boundaries short, calm, and predictable',
        'reconnect and repair warmly once everyone is calm',
      ],
      bottomBannerQuote: 'Every repair strengthens your child’s sense of safety.',
    },
    page6: {
      heading: 'Activity 1:',
      subtitle: 'Real-Life Moments',
      activityBadge: 'Practice Activity',
      introText: `Reflect on a recent moment at home connected to ${title.toLowerCase()} where things went well or taught you something important.`,
      formTitle: 'Write About a Family Moment',
      prompts: [
        'What was happening in that moment?',
        'How did you and your child respond?',
        'What helped steady the situation or reconnect afterward?',
      ],
      ideasTitle: 'Supportive Micro-Habits',
      ideas: [
        'pause & breathe',
        'soft tone of voice',
        '5-minute warning',
        'validate feelings',
        'offer two choices',
        'repair warmly',
        'keep routine simple',
        'notice effort',
      ],
    },
    page7: {
      heading: 'Activity 2:',
      subtitle: 'My Action Plan',
      activityBadge: 'Practice Activity',
      introText: 'Choose one realistic habit to practise this week so your learning turns into everyday confidence.',
      formTitle: `Build Your ${title} Plan`,
      prompts: [
        'One specific daily moment where I will practise this skill:',
        'One calm phrase I will use to support my child:',
        'One way I will reset myself if I feel overwhelmed:',
      ],
      remindersTitle: 'Simple Strategy Reminders',
      reminders: [
        'regulate first',
        'connect before correcting',
        'keep it simple',
        'repair without shame',
        'repeat daily',
      ],
      bottomBannerQuote: 'Small, steady actions create safer, stronger family rhythms.',
    },
    page8: {
      heading: 'Reflection',
      badgeLabel: 'Pause & Reflect',
      introText: 'Take a moment to recognise your effort and choose your takeaway from today’s lesson.',
      questionsTitle: 'Reflection Questions',
      questions: [
        `What stood out to you most in ${title} today?`,
        'What strength do you already bring to your child in these moments?',
        'What is one small step you will try over the next 48 hours?',
      ],
      selfCheckTitle: 'Quick Self-Check',
      selfCheckItems: [
        `I understand the core ideas of ${title.toLowerCase()}.`,
        'I can spot early stress cues in myself and my child.',
        'I have a practical step ready to use this week.',
      ],
    },
    page9: {
      heading: title,
      subheading: 'Lesson Wrap-Up',
      introText:
        "You've completed this lesson—great job! Every calm, intentional step you take builds lasting safety and trust for your family.",
      weeklyPlanTitle: 'This Week I Will...',
      minutesPrefix: 'spend',
      minutesSuffix: `minutes practising ${title.toLowerCase()} with my child`,
      prompt2Label: 'use this supportive phrase:',
      prompt3Label: 'protect this daily routine:',
      rememberTitle: 'Remember',
      rememberItems: [
        'calm connection comes first',
        'mistakes are opportunities for repair',
        'small routines build big security',
        'asking for support is a strength',
      ],
      completeHeading: 'Lesson Complete',
      completeSubtext: "You're making a difference every day.",
    },
  };
}

