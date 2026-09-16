$basePath = "C:\Users\SAFES\safesteps-curriculum\courses\v1.1.0\dfv-parent"

$topics = @(
    @{
        Slug = "why-leaving-is-dangerous"
        Course = @'
{
  "title": "Why Leaving Can Be Dangerous",
  "description": "Explains why the period around separation is often the most dangerous time for victim-survivors and how to plan for safety.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Understand why risk increases during separation.",
    "Recognise common escalation patterns.",
    "Identify strategies for safer planning."
  ],
  "modules": [
    "Understanding Escalation Risk",
    "Planning for Safer Separation"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "Safety",
    "tags": ["separation", "risk", "safety"]
  },
  "caseworkerSummary": "Helps parents understand why separation increases risk and how to plan for safety."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Leaving an abusive relationship is often the most dangerous time. This lesson explains why risk increases."
    },
    {
      "title": "Core Concepts",
      "content": "Abusive partners may escalate threats, stalking, or violence when they feel they are losing control."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn strategies for safer planning, including timing, support networks, and documentation."
    },
    {
      "title": "Activity",
      "content": "Reflect on any behaviours that escalated during past attempts to leave."
    },
    {
      "title": "Reflection",
      "content": "Understanding risk helps parents make informed, safer decisions."
    }
  ]
}
'@
    },

    @{
        Slug = "impact-on-children"
        Course = @'
{
  "title": "Impact of DFV on Children",
  "description": "Helps parents understand how domestic and family violence affects children emotionally, physically, and developmentally.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Recognise how DFV affects children.",
    "Understand behavioural and emotional responses.",
    "Identify ways to support children’s healing."
  ],
  "modules": [
    "How Children Experience DFV",
    "Supporting Children After Harm"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "Children",
    "tags": ["children", "trauma", "healing"]
  },
  "caseworkerSummary": "Supports parents to understand the effects of DFV on children and how to respond supportively."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Children are deeply affected by DFV, even when they do not see the violence directly."
    },
    {
      "title": "Core Concepts",
      "content": "Children may show fear, anxiety, aggression, withdrawal, or developmental delays."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn how to respond with safety, predictability, and emotional support."
    },
    {
      "title": "Activity",
      "content": "Think about how your child reacts during stress. What might they be communicating?"
    },
    {
      "title": "Reflection",
      "content": "Understanding children’s responses helps parents support healing."
    }
  ]
}
'@
    },

    @{
        Slug = "infant-trauma"
        Course = @'
{
  "title": "Infant Trauma and DFV",
  "description": "Explores how domestic and family violence affects babies, including attachment, development, and stress responses.",
  "estimatedTimeMinutes": 40,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Understand how infants experience trauma.",
    "Recognise signs of stress in babies.",
    "Identify ways to support infant safety and bonding."
  ],
  "modules": [
    "How Infants Experience DFV",
    "Supporting Infant Recovery"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "Infants",
    "tags": ["infants", "trauma", "attachment"]
  },
  "caseworkerSummary": "Helps parents understand how DFV affects babies and how to support early recovery."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Babies are deeply affected by DFV, even though they cannot speak or understand events."
    },
    {
      "title": "Core Concepts",
      "content": "Infants absorb stress through disrupted routines, loud noises, fear, and caregiver distress."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn to rebuild safety through calm routines, closeness, and predictable care."
    },
    {
      "title": "Activity",
      "content": "Reflect on your baby’s cues—crying, clinginess, sleep changes."
    },
    {
      "title": "Reflection",
      "content": "Infants heal through safe, consistent, loving care."
    }
  ]
}
'@
    },

    @{
        Slug = "child-safety-planning"
        Course = @'
{
  "title": "Child Safety Planning",
  "description": "Provides practical strategies for creating safety plans with and for children during DFV situations.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Understand what child safety planning involves.",
    "Identify age‑appropriate strategies.",
    "Create a personalised safety plan."
  ],
  "modules": [
    "Understanding Child Safety",
    "Building a Safety Plan"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "Safety",
    "tags": ["child safety", "planning", "dfv"]
  },
  "caseworkerSummary": "Supports parents to create practical, age‑appropriate safety plans for children."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Safety planning helps children know what to do during unsafe moments."
    },
    {
      "title": "Core Concepts",
      "content": "Plans must be simple, age‑appropriate, and focused on getting to safety—not intervening."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn how to create safe rooms, exit routes, and code words."
    },
    {
      "title": "Activity",
      "content": "Draft a simple safety plan for your child based on their age."
    },
    {
      "title": "Reflection",
      "content": "Safety planning empowers children without placing responsibility on them."
    }
  ]
}
'@
    },

    @{
        Slug = "technology-facilitated-abuse"
        Course = @'
{
  "title": "Technology‑Facilitated Abuse",
  "description": "Explains how technology can be used to monitor, control, or harm parents and children, and how to increase digital safety.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Recognise forms of tech‑based abuse.",
    "Identify risks in devices and accounts.",
    "Apply practical digital safety strategies."
  ],
  "modules": [
    "Understanding Tech Abuse",
    "Digital Safety Strategies"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "Technology",
    "tags": ["technology", "safety", "monitoring"]
  },
  "caseworkerSummary": "Helps parents understand tech‑based abuse and improve digital safety."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Technology can be used to support safety—or to cause harm."
    },
    {
      "title": "Core Concepts",
      "content": "Tech abuse includes tracking, monitoring, hacking, impersonation, and harassment."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn to secure accounts, update passwords, and check devices for risks."
    },
    {
      "title": "Activity",
      "content": "Review your devices and accounts. Identify any that may need securing."
    },
    {
      "title": "Reflection",
      "content": "Digital safety is an important part of overall safety planning."
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

Write-Host "DFV Parent Batch 2 JSON files created."

