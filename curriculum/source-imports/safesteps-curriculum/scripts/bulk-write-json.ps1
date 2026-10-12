# === CONFIG ===
$root = "C:\Users\SAFES\safesteps-curriculum\courses"

$fatherTrack    = Join-Path $root "behaviour-change-accountability-fathers"
$universalTrack = Join-Path $root "accountability-behaviour-change-universal"

function Write-CourseJson {
    param(
        [string]$trackFolder,
        [string]$courseId,
        [string]$jsonContent
    )

    $coursePath = Join-Path $trackFolder $courseId
    $filePath   = Join-Path $coursePath "course.json"

    $jsonContent | Set-Content -Path $filePath -Encoding UTF8
    Write-Host "Wrote JSON for $courseId in $trackFolder"
}
# === UNIVERSAL: patterns-of-behaviour ===
$universal_patterns_of_behaviour = @'
{
  "id": "patterns-of-behaviour",
  "title": "Understanding Patterns of Harmful Behaviour",
  "description": "This course helps participants identify patterns of behaviour that create harm, conflict, or fear in relationships. It supports insight, accountability, and recognition of how behaviour affects others, including children.",
  "learningOutcomes": [
    "Identify patterns of behaviour that create harm or instability.",
    "Understand how behaviour impacts partners, family members, and children.",
    "Recognise early warning signs of escalation.",
    "Develop insight into personal responsibility and change."
  ],
  "modules": [
    { "title": "Recognising Behaviour Patterns", "content": "Explores cycles, triggers, and repeated behaviours." },
    { "title": "Impact on Others", "content": "Shows how behaviour affects emotional safety and wellbeing." },
    { "title": "Building Insight and Responsibility", "content": "Provides tools for reflection and accountability." }
  ]
}
'@

Write-CourseJson -trackFolder $universalTrack -courseId "patterns-of-behaviour" -jsonContent $universal_patterns_of_behaviour
# === FATHER: patterns-of-behaviour ===
$father_patterns_of_behaviour = @'
{
  "id": "patterns-of-behaviour",
  "title": "Understanding Patterns of Harmful Behaviour (Father-Focused)",
  "description": "This course supports fathers to recognise behaviour patterns that create fear, instability, or emotional harm within the family environment. It emphasises accountability and the impact on children.",
  "learningOutcomes": [
    "Identify harmful behaviour cycles that affect partners and children.",
    "Understand how children experience and internalise behaviour patterns.",
    "Recognise escalation points and early warning signs.",
    "Develop responsibility for creating a safe home environment."
  ],
  "modules": [
    { "title": "Fathering and Behaviour Patterns", "content": "Explores how behaviour affects children’s emotional development." },
    { "title": "Impact on Partner and Children", "content": "Shows how behaviour shapes family safety and wellbeing." },
    { "title": "Accountability and Change", "content": "Provides tools for reflection, responsibility, and safe behaviour change." }
  ]
}
'@

Write-CourseJson -trackFolder $fatherTrack -courseId "patterns-of-behaviour" -jsonContent $father_patterns_of_behaviour
# === UNIVERSAL: accountability-basics ===
$universal_accountability_basics = @'
{
  "id": "accountability-basics",
  "title": "Accountability Foundations",
  "description": "This course introduces the core principles of accountability, including ownership of behaviour, honesty, and responsibility for impact.",
  "learningOutcomes": [
    "Understand what accountability means in relationships.",
    "Recognise the difference between excuses and responsibility.",
    "Identify behaviours that avoid accountability.",
    "Develop skills for honest self-reflection."
  ],
  "modules": [
    { "title": "What Accountability Means", "content": "Defines responsibility, ownership, and behavioural integrity." },
    { "title": "Avoidance Patterns", "content": "Explores blame-shifting, minimising, and denial." },
    { "title": "Building Accountability", "content": "Provides tools for honest reflection and behavioural responsibility." }
  ]
}
'@

Write-CourseJson -trackFolder $universalTrack -courseId "accountability-basics" -jsonContent $universal_accountability_basics
# === FATHER: accountability-basics ===
$father_accountability_basics = @'
{
  "id": "accountability-basics",
  "title": "Accountability Foundations (Father-Focused)",
  "description": "This course supports fathers to take responsibility for their behaviour and understand how accountability strengthens child safety and family stability.",
  "learningOutcomes": [
    "Understand accountability in the context of fatherhood.",
    "Recognise how avoidance behaviours harm children and partners.",
    "Learn how accountability supports safe parenting.",
    "Develop responsibility for repairing harm."
  ],
  "modules": [
    { "title": "Fatherhood and Accountability", "content": "Explores responsibility in parenting and relationships." },
    { "title": "Avoidance and Harm", "content": "Shows how denial and minimising affect children’s safety." },
    { "title": "Practising Accountability", "content": "Provides tools for honest reflection and safe behaviour change." }
  ]
}
'@

Write-CourseJson -trackFolder $fatherTrack -courseId "accountability-basics" -jsonContent $father_accountability_basics
# === UNIVERSAL: emotional-escalation ===
$universal_emotional_escalation = @'
{
  "id": "emotional-escalation",
  "title": "Emotional Escalation Awareness",
  "description": "This course helps participants recognise emotional escalation patterns and develop strategies to prevent harm.",
  "learningOutcomes": [
    "Identify personal escalation patterns.",
    "Recognise early signs of emotional overload.",
    "Understand how escalation affects others.",
    "Develop strategies for de-escalation."
  ],
  "modules": [
    { "title": "Understanding Escalation", "content": "Explores emotional triggers and escalation cycles." },
    { "title": "Impact on Others", "content": "Shows how escalation creates fear and instability." },
    { "title": "De-escalation Tools", "content": "Provides grounding, breathing, and self-regulation strategies." }
  ]
}
'@

Write-CourseJson -trackFolder $universalTrack -courseId "emotional-escalation" -jsonContent $universal_emotional_escalation
# === FATHER: emotional-escalation ===
$father_emotional_escalation = @'
{
  "id": "emotional-escalation",
  "title": "Emotional Escalation Awareness (Father-Focused)",
  "description": "This course supports fathers to recognise escalation patterns that create fear or instability for children and partners.",
  "learningOutcomes": [
    "Identify escalation patterns that impact children.",
    "Recognise how emotional intensity affects family safety.",
    "Understand escalation triggers in parenting contexts.",
    "Develop safe de-escalation strategies."
  ],
  "modules": [
    { "title": "Escalation and Fathering", "content": "Explores how escalation affects children’s emotional security." },
    { "title": "Impact on Family Safety", "content": "Shows how escalation creates fear and unpredictability." },
    { "title": "Safe De-escalation", "content": "Provides tools for grounding, pausing, and safe emotional regulation." }
  ]
}
'@

Write-CourseJson -trackFolder $fatherTrack -courseId "emotional-escalation" -jsonContent $father_emotional_escalation
# === UNIVERSAL: impacts-on-children ===
$universal_impacts_on_children = @'
{
  "id": "impacts-on-children",
  "title": "Impacts on Children",
  "description": "This course helps participants understand how harmful behaviour affects children’s emotional, psychological, and developmental wellbeing.",
  "learningOutcomes": [
    "Understand how children experience conflict and harm.",
    "Recognise behavioural and emotional impacts on children.",
    "Identify signs of distress in children.",
    "Develop behaviours that support child safety."
  ],
  "modules": [
    { "title": "Children’s Experiences", "content": "Explores how children interpret adult behaviour." },
    { "title": "Emotional and Developmental Impacts", "content": "Shows how harm affects children long-term." },
    { "title": "Supporting Child Safety", "content": "Provides tools for safe, stable parenting." }
  ]
}
'@

Write-CourseJson -trackFolder $universalTrack -courseId "impacts-on-children" -jsonContent $universal_impacts_on_children
# === FATHER: impacts-on-children ===
$father_impacts_on_children = @'
{
  "id": "impacts-on-children",
  "title": "Impacts on Children (Father-Focused)",
  "description": "This course supports fathers to understand how their behaviour directly affects their children’s emotional safety, development, and long-term wellbeing.",
  "learningOutcomes": [
    "Recognise how children experience harmful behaviour.",
    "Understand the emotional and developmental impacts on children.",
    "Identify signs of fear, withdrawal, or distress.",
    "Develop safe, consistent parenting behaviours."
  ],
  "modules": [
    { "title": "Fathering and Child Impact", "content": "Explores how children internalise their father’s behaviour." },
    { "title": "Emotional and Developmental Harm", "content": "Shows how harmful behaviour affects children long-term." },
    { "title": "Safe Fathering Practices", "content": "Provides tools for stability, safety, and emotional support." }
  ]
}
'@

Write-CourseJson -trackFolder $fatherTrack -courseId "impacts-on-children" -jsonContent $father_impacts_on_children
# === UNIVERSAL: minimising-and-denial ===
$universal_minimising_and_denial = @'
{
  "id": "minimising-and-denial",
  "title": "Minimising and Denial",
  "description": "This course helps participants recognise avoidance behaviours that block accountability and prevent change.",
  "learningOutcomes": [
    "Identify minimising, denial, and justification patterns.",
    "Understand how avoidance harms relationships.",
    "Recognise the impact of denial on children.",
    "Develop responsibility and honesty."
  ],
  "modules": [
    { "title": "Avoidance Patterns", "content": "Explores denial, excuses, and justification." },
    { "title": "Impact on Others", "content": "Shows how avoidance harms trust and safety." },
    { "title": "Building Honesty", "content": "Provides tools for truthful reflection and responsibility." }
  ]
}
'@

Write-CourseJson -trackFolder $universalTrack -courseId "minimising-and-denial" -jsonContent $universal_minimising_and_denial
# === FATHER: minimising-and-denial ===
$father_minimising_and_denial = @'
{
  "id": "minimising-and-denial",
  "title": "Minimising and Denial (Father-Focused)",
  "description": "This course supports fathers to recognise denial and minimising behaviours that prevent accountability and harm children’s emotional safety.",
  "learningOutcomes": [
    "Identify father-specific avoidance patterns.",
    "Understand how denial affects children’s sense of safety.",
    "Recognise the impact of minimising on partners and family stability.",
    "Develop responsibility and honest self-reflection."
  ],
  "modules": [
    { "title": "Avoidance in Fathering", "content": "Explores denial and justification in parenting contexts." },
    { "title": "Impact on Children and Partner", "content": "Shows how avoidance harms emotional safety." },
    { "title": "Practising Honesty", "content": "Provides tools for truthful reflection and accountability." }
  ]
}
'@

Write-CourseJson -trackFolder $fatherTrack -courseId "minimising-and-denial" -jsonContent $father_minimising_and_denial
# === UNIVERSAL: communication-harm ===
$universal_communication_harm = @'
{
  "id": "communication-harm",
  "title": "Understanding Harmful Communication",
  "description": "This course helps participants recognise communication patterns that create fear, confusion, or emotional harm. It supports the development of respectful, safe, and clear communication.",
  "learningOutcomes": [
    "Identify harmful communication behaviours.",
    "Understand how tone, language, and intent affect others.",
    "Recognise how communication impacts children’s emotional safety.",
    "Develop respectful communication habits."
  ],
  "modules": [
    { "title": "Harmful Communication Patterns", "content": "Explores criticism, threats, sarcasm, and intimidation." },
    { "title": "Impact on Emotional Safety", "content": "Shows how communication affects trust and wellbeing." },
    { "title": "Building Respectful Communication", "content": "Provides tools for clarity, calmness, and respect." }
  ]
}
'@

Write-CourseJson -trackFolder $universalTrack -courseId "communication-harm" -jsonContent $universal_communication_harm
# === FATHER: communication-harm ===
$father_communication_harm = @'
{
  "id": "communication-harm",
  "title": "Understanding Harmful Communication (Father-Focused)",
  "description": "This course supports fathers to recognise communication behaviours that create fear or emotional instability for partners and children.",
  "learningOutcomes": [
    "Identify harmful communication patterns used in parenting and relationships.",
    "Understand how tone and language affect children’s emotional security.",
    "Recognise intimidation, sarcasm, and verbal pressure.",
    "Develop safe, respectful communication habits."
  ],
  "modules": [
    { "title": "Fathering and Communication", "content": "Explores how communication shapes children’s emotional world." },
    { "title": "Impact on Partner and Children", "content": "Shows how harmful communication creates fear and instability." },
    { "title": "Safe and Respectful Communication", "content": "Provides tools for calm, clear, and respectful interactions." }
  ]
}
'@

Write-CourseJson -trackFolder $fatherTrack -courseId "communication-harm" -jsonContent $father_communication_harm
# === UNIVERSAL: emotional-responsibility ===
$universal_emotional_responsibility = @'
{
  "id": "emotional-responsibility",
  "title": "Emotional Responsibility",
  "description": "This course supports participants in understanding their emotional responses and taking responsibility for how those emotions influence behaviour.",
  "learningOutcomes": [
    "Understand the difference between emotions and behaviour.",
    "Recognise emotional triggers and patterns.",
    "Learn strategies for emotional regulation.",
    "Develop responsibility for emotional impact on others."
  ],
  "modules": [
    { "title": "Emotions vs Behaviour", "content": "Explains how feelings do not justify harmful actions." },
    { "title": "Recognising Triggers", "content": "Identifies emotional patterns and escalation points." },
    { "title": "Regulation Strategies", "content": "Provides grounding, breathing, and self-awareness tools." }
  ]
}
'@

Write-CourseJson -trackFolder $universalTrack -courseId "emotional-responsibility" -jsonContent $universal_emotional_responsibility
# === FATHER: emotional-responsibility ===
$father_emotional_responsibility = @'
{
  "id": "emotional-responsibility",
  "title": "Emotional Responsibility (Father-Focused)",
  "description": "This course helps fathers understand how their emotional responses influence family safety, stability, and children’s wellbeing.",
  "learningOutcomes": [
    "Understand emotional responsibility in the context of fatherhood.",
    "Recognise emotional triggers that affect parenting behaviour.",
    "Learn safe emotional regulation strategies.",
    "Develop responsibility for emotional impact on children."
  ],
  "modules": [
    { "title": "Fathering and Emotions", "content": "Explores how emotional responses affect children’s sense of safety." },
    { "title": "Triggers and Escalation", "content": "Identifies patterns that lead to harmful behaviour." },
    { "title": "Safe Emotional Regulation", "content": "Provides tools for grounding, pausing, and safe emotional expression." }
  ]
}
'@

Write-CourseJson -trackFolder $fatherTrack -courseId "emotional-responsibility" -jsonContent $father_emotional_responsibility
