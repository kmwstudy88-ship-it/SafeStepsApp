$basePath = "C:\Users\SAFES\safesteps-curriculum\courses\v1.1.0\dfv-parent"

$topics = @(
    @{
        Slug = "what-is-dfv"
        Course = @'
{
  "title": "What Is Domestic and Family Violence?",
  "description": "An introduction to domestic and family violence, explaining the different forms it can take and how it affects parents, children, and families.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Understand the definition and forms of domestic and family violence.",
    "Recognise the difference between conflict and abuse.",
    "Identify early warning signs of controlling or harmful behaviour."
  ],
  "modules": [
    "Understanding DFV",
    "Recognising Patterns of Harm"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "DFV Basics",
    "tags": ["dfv", "abuse", "safety", "parenting"]
  },
  "caseworkerSummary": "Provides parents with a foundational understanding of DFV, including types of abuse and early indicators of risk."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Domestic and family violence can be confusing and overwhelming. This lesson helps parents understand what DFV actually is and why recognising it matters."
    },
    {
      "title": "Core Concepts",
      "content": "DFV includes emotional, physical, financial, sexual, and psychological abuse. It is about power and control, not anger or conflict."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn how to identify patterns of behaviour that signal risk, including isolation, intimidation, and monitoring."
    },
    {
      "title": "Activity",
      "content": "Reflect on behaviours you’ve seen or experienced. Which ones align with DFV patterns?"
    },
    {
      "title": "Reflection",
      "content": "Understanding DFV is the first step toward safety, healing, and informed decision‑making."
    }
  ]
}
'@
    },
    @{
        Slug = "coercive-control"
        Course = @'
{
  "title": "Understanding Coercive Control",
  "description": "A deep look at coercive control—how it works, why it’s dangerous, and how it affects parents and children.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Define coercive control and its key components.",
    "Recognise non-physical forms of abuse.",
    "Understand how coercive control impacts children’s safety and wellbeing."
  ],
  "modules": [
    "What Coercive Control Looks Like",
    "Impact on Parents and Children"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "Coercive Control",
    "tags": ["coercive control", "psychological abuse", "safety"]
  },
  "caseworkerSummary": "Explains coercive control and helps parents identify subtle but harmful patterns of domination."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Coercive control is one of the most harmful forms of DFV. It often happens without physical violence."
    },
    {
      "title": "Core Concepts",
      "content": "Coercive control includes monitoring, isolation, threats, manipulation, and restricting freedom or choices."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn to map controlling behaviours and understand how they create fear and dependency."
    },
    {
      "title": "Activity",
      "content": "Identify behaviours that made you feel small, scared, or controlled. These may be signs of coercive control."
    },
    {
      "title": "Reflection",
      "content": "Recognising coercive control helps parents understand their experiences and seek appropriate support."
    }
  ]
}
'@
    },
    @{
        Slug = "recognising-abuse"
        Course = @'
{
  "title": "Recognising Abuse",
  "description": "Helps parents identify the full spectrum of abusive behaviours, including those that are subtle, hidden, or normalised.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Identify different types of abuse.",
    "Recognise early warning signs.",
    "Understand how abuse escalates over time."
  ],
  "modules": [
    "Types of Abuse",
    "Warning Signs and Red Flags"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "DFV Basics",
    "tags": ["abuse", "warning signs", "safety"]
  },
  "caseworkerSummary": "Supports parents to recognise abusive behaviours that may have been minimised or normalised."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Abuse is not always obvious. Many parents only recognise it after learning the signs."
    },
    {
      "title": "Core Concepts",
      "content": "Abuse can be emotional, financial, sexual, physical, or digital. It often escalates gradually."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn to identify patterns such as gaslighting, intimidation, and financial restriction."
    },
    {
      "title": "Activity",
      "content": "List behaviours that made you feel unsafe or controlled. Compare them to the categories of abuse."
    },
    {
      "title": "Reflection",
      "content": "Recognising abuse is a powerful step toward safety and healing."
    }
  ]
}
'@
    },
    @{
        Slug = "myths-and-misconceptions"
        Course = @'
{
  "title": "Myths and Misconceptions About DFV",
  "description": "Challenges common myths about domestic and family violence to help parents understand the truth behind harmful stereotypes.",
  "estimatedTimeMinutes": 40,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Identify common myths about DFV.",
    "Understand how myths harm survivors.",
    "Recognise the realities of DFV dynamics."
  ],
  "modules": [
    "Common Myths",
    "Understanding the Truth"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "DFV Basics",
    "tags": ["myths", "misconceptions", "education"]
  },
  "caseworkerSummary": "Helps parents challenge internalised myths that may prevent help‑seeking or self‑recognition."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Many parents carry myths about DFV that make it harder to recognise abuse or seek help."
    },
    {
      "title": "Core Concepts",
      "content": "Myths include 'DFV is caused by anger' or 'If it was really bad, they would leave'. These are false and harmful."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn to replace myths with accurate, evidence‑based understanding."
    },
    {
      "title": "Activity",
      "content": "Identify a myth you once believed. What changed your understanding?"
    },
    {
      "title": "Reflection",
      "content": "Letting go of myths helps parents see their situation clearly and make informed decisions."
    }
  ]
}
'@
    },
    @{
        Slug = "why-people-stay"
        Course = @'
{
  "title": "Why People Stay",
  "description": "Explores the complex reasons why people remain in abusive relationships, reducing shame and increasing understanding.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Understand the barriers to leaving abusive relationships.",
    "Recognise the role of fear, coercion, and survival strategies.",
    "Reduce self‑blame and shame."
  ],
  "modules": [
    "Barriers to Leaving",
    "Understanding Survival Responses"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "DFV Basics",
    "tags": ["leaving", "survival", "coercive control"]
  },
  "caseworkerSummary": "Supports parents to understand that staying is often a survival strategy, not a failure."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Leaving an abusive relationship is complex. Many parents stay because it feels safer than leaving."
    },
    {
      "title": "Core Concepts",
      "content": "Barriers include fear, financial dependence, threats, manipulation, and concern for children’s safety."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn to identify survival strategies and understand their own choices with compassion."
    },
    {
      "title": "Activity",
      "content": "Reflect on reasons that made leaving difficult. These are valid and understandable."
    },
    {
      "title": "Reflection",
      "content": "Understanding why people stay reduces shame and opens the door to safer planning."
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

Write-Host "DFV Parent Batch 1 JSON files created."
