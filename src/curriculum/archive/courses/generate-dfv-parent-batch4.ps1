$basePath = "C:\Users\SAFES\safesteps-curriculum\courses\v1.1.0\dfv-parent"

$topics = @(
    @{
        Slug = "trauma-informed-parenting"
        Course = @'
{
  "title": "Trauma‑Informed Parenting",
  "description": "Helps parents understand trauma responses in themselves and their children, and how to create safety, connection, and predictability.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Understand trauma responses in adults and children.",
    "Recognise triggers and stress reactions.",
    "Apply trauma‑informed strategies at home."
  ],
  "modules": [
    "Understanding Trauma Responses",
    "Building Trauma‑Informed Routines"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "Trauma",
    "tags": ["trauma", "parenting", "healing"]
  },
  "caseworkerSummary": "Supports parents to understand trauma and apply trauma‑informed strategies at home."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Trauma affects how parents and children think, feel, and behave. This lesson builds understanding and compassion."
    },
    {
      "title": "Core Concepts",
      "content": "Trauma responses include fight, flight, freeze, and fawn. These are survival instincts, not choices."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn grounding, predictable routines, and co‑regulation strategies."
    },
    {
      "title": "Activity",
      "content": "Identify a moment when you or your child felt overwhelmed. What helped?"
    },
    {
      "title": "Reflection",
      "content": "Trauma‑informed parenting strengthens safety and connection."
    }
  ]
}
'@
    },

    @{
        Slug = "rebuilding-confidence"
        Course = @'
{
  "title": "Rebuilding Confidence",
  "description": "Supports parents to rebuild self‑worth, identity, and confidence after experiencing DFV.",
  "estimatedTimeMinutes": 40,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Recognise how DFV impacts confidence.",
    "Identify strengths and personal values.",
    "Apply strategies to rebuild self‑belief."
  ],
  "modules": [
    "Understanding Confidence Loss",
    "Rebuilding Self‑Worth"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "Recovery",
    "tags": ["confidence", "healing", "identity"]
  },
  "caseworkerSummary": "Helps parents rebuild confidence and identity after DFV."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "DFV often damages confidence and self‑belief. Healing includes rebuilding your sense of self."
    },
    {
      "title": "Core Concepts",
      "content": "Abusive behaviour can erode identity through criticism, control, and isolation."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn strengths‑based reflection and small steps toward self‑trust."
    },
    {
      "title": "Activity",
      "content": "List three strengths you have shown during difficult times."
    },
    {
      "title": "Reflection",
      "content": "Confidence grows through small, consistent acts of self‑respect."
    }
  ]
}
'@
    },

    @{
        Slug = "protective-parenting"
        Course = @'
{
  "title": "Protective Parenting",
  "description": "Explains how parents can take protective actions to support children’s safety, stability, and emotional wellbeing after DFV.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Understand what protective parenting means.",
    "Recognise protective behaviours.",
    "Apply strategies to support children’s safety."
  ],
  "modules": [
    "Understanding Protective Parenting",
    "Practical Protective Strategies"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "Children",
    "tags": ["protective parenting", "safety", "children"]
  },
  "caseworkerSummary": "Supports parents to understand and demonstrate protective behaviours."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Protective parenting helps children feel safe, supported, and understood."
    },
    {
      "title": "Core Concepts",
      "content": "Protective actions include emotional availability, predictable routines, and safe boundaries."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn how to respond calmly, validate feelings, and create safe environments."
    },
    {
      "title": "Activity",
      "content": "Identify one protective action you already use with your child."
    },
    {
      "title": "Reflection",
      "content": "Protective parenting strengthens healing and resilience."
    }
  ]
}
'@
    },

    @{
        Slug = "recovery-and-healing"
        Course = @'
{
  "title": "Recovery and Healing",
  "description": "Helps parents understand the healing process after DFV and how to support themselves and their children.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Understand the stages of healing.",
    "Recognise emotional and physical recovery needs.",
    "Apply strategies for long‑term wellbeing."
  ],
  "modules": [
    "Understanding the Healing Journey",
    "Supporting Long‑Term Recovery"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "Recovery",
    "tags": ["healing", "recovery", "wellbeing"]
  },
  "caseworkerSummary": "Supports parents to understand healing and build long‑term wellbeing."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Healing from DFV takes time, support, and compassion."
    },
    {
      "title": "Core Concepts",
      "content": "Healing is not linear. It includes emotional, physical, and relational recovery."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn grounding, self‑care, and support‑seeking strategies."
    },
    {
      "title": "Activity",
      "content": "Identify one healing activity that helps you feel calmer or stronger."
    },
    {
      "title": "Reflection",
      "content": "Recovery is a journey, not a destination."
    }
  ]
}
'@
    },

    @{
        Slug = "healthy-future-relationships"
        Course = @'
{
  "title": "Healthy Future Relationships",
  "description": "Explores what healthy relationships look like and how parents can build safe, respectful connections in the future.",
  "estimatedTimeMinutes": 40,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Recognise the qualities of healthy relationships.",
    "Identify red flags and green flags.",
    "Build confidence in future relationship choices."
  ],
  "modules": [
    "Understanding Healthy Relationships",
    "Building Safe Connections"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "Relationships",
    "tags": ["relationships", "healing", "future"]
  },
  "caseworkerSummary": "Helps parents understand healthy relationships and rebuild trust in future connections."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "After DFV, it can be hard to trust again. This lesson explores what healthy relationships look like."
    },
    {
      "title": "Core Concepts",
      "content": "Healthy relationships include respect, communication, boundaries, and equality."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn to identify red flags and green flags in future relationships."
    },
    {
      "title": "Activity",
      "content": "List qualities you want in future relationships."
    },
    {
      "title": "Reflection",
      "content": "You deserve relationships that are safe, respectful, and supportive."
    }
  ]
}
'@
    }
)

foreach ($topic in $topics) {
    $topicPath = Join-Path $basePath $topic.Slug
    if (-not (Test-Path $topicPath)) {
        New-Item -ItemType Directory -Path $topicPath | Out-Null
    }

    $coursePath = Join-Path $topicPath "course.json"
    $lessonPath = Join-Path $topicPath "lesson.json"

    $topic.Course | Out-File -FilePath $coursePath -Encoding UTF8 -Force
    $topic.Lesson | Out-File -FilePath $lessonPath -Encoding UTF8 -Force
}

Write-Host "DFV Parent Batch 4 JSON files created."
