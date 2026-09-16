$basePath = "C:\Users\SAFES\safesteps-curriculum\courses\v1.1.0\dfv-parent"

$topics = @(
    @{
        Slug = "financial-abuse"
        Course = @'
{
  "title": "Financial Abuse",
  "description": "Explains how financial control, restriction, and exploitation are used as forms of domestic and family violence.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Recognise forms of financial abuse.",
    "Understand how financial control limits safety.",
    "Identify strategies to increase financial independence."
  ],
  "modules": [
    "Understanding Financial Abuse",
    "Building Financial Safety"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "Financial Abuse",
    "tags": ["money", "control", "safety"]
  },
  "caseworkerSummary": "Helps parents identify financial abuse and begin planning for financial safety."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Financial abuse is one of the most common and powerful forms of DFV."
    },
    {
      "title": "Core Concepts",
      "content": "It includes restricting access to money, monitoring spending, debt manipulation, and sabotaging employment."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn steps like securing documents, opening safe accounts, and tracking income."
    },
    {
      "title": "Activity",
      "content": "Identify any financial behaviours that made you feel controlled or restricted."
    },
    {
      "title": "Reflection",
      "content": "Financial safety is a key part of long‑term independence."
    }
  ]
}
'@
    },

    @{
        Slug = "post-separation-abuse"
        Course = @'
{
  "title": "Post‑Separation Abuse",
  "description": "Explores how abuse can continue or escalate after separation, including legal, financial, and emotional tactics.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Recognise forms of post‑separation abuse.",
    "Understand how systems can be used to continue control.",
    "Identify strategies for safety and documentation."
  ],
  "modules": [
    "Forms of Post‑Separation Abuse",
    "Protecting Yourself After Leaving"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "Safety",
    "tags": ["separation", "systems abuse", "safety"]
  },
  "caseworkerSummary": "Helps parents understand ongoing risks after separation and how to plan for safety."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Abuse often continues after separation through new tactics."
    },
    {
      "title": "Core Concepts",
      "content": "Common tactics include harassment, stalking, legal abuse, and using children as tools of control."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn documentation, boundaries, and safe communication strategies."
    },
    {
      "title": "Activity",
      "content": "Reflect on any behaviours that continued or escalated after separation."
    },
    {
      "title": "Reflection",
      "content": "Awareness helps parents protect themselves and their children."
    }
  ]
}
'@
    },

    @{
        Slug = "family-law-basics"
        Course = @'
{
  "title": "Family Law Basics",
  "description": "Provides an overview of family law processes, parenting arrangements, and how DFV is considered in legal decisions.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Understand key family law concepts.",
    "Recognise how DFV affects legal decisions.",
    "Identify ways to prepare for legal processes."
  ],
  "modules": [
    "Understanding Family Law",
    "DFV and Legal Decisions"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "Legal",
    "tags": ["family law", "legal", "parenting arrangements"]
  },
  "caseworkerSummary": "Gives parents a basic understanding of family law and how DFV is considered."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Family law can feel overwhelming. This lesson explains the basics."
    },
    {
      "title": "Core Concepts",
      "content": "Topics include parenting orders, mediation, and how DFV influences decisions."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn how to prepare documents, timelines, and evidence."
    },
    {
      "title": "Activity",
      "content": "List any legal questions or concerns you have."
    },
    {
      "title": "Reflection",
      "content": "Understanding the system helps reduce fear and confusion."
    }
  ]
}
'@
    },

    @{
        Slug = "child-protection-basics"
        Course = @'
{
  "title": "Child Protection Basics",
  "description": "Explains how child protection systems work, why they become involved, and what parents can expect.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Understand the role of child protection.",
    "Recognise why DFV triggers involvement.",
    "Identify ways to work constructively with services."
  ],
  "modules": [
    "Understanding Child Protection",
    "Working With Services"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "Child Protection",
    "tags": ["child protection", "safety", "services"]
  },
  "caseworkerSummary": "Helps parents understand child protection processes and expectations."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "Child protection involvement can feel frightening. This lesson explains why it happens."
    },
    {
      "title": "Core Concepts",
      "content": "DFV is a major risk factor because it affects children’s safety and wellbeing."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn how to communicate with workers and demonstrate protective actions."
    },
    {
      "title": "Activity",
      "content": "Reflect on what you want child protection to understand about your situation."
    },
    {
      "title": "Reflection",
      "content": "Understanding the system helps reduce fear and build collaboration."
    }
  ]
}
'@
    },

    @{
        Slug = "aod-and-dfv"
        Course = @'
{
  "title": "Alcohol and Other Drugs (AOD) and DFV",
  "description": "Explores how substance use and DFV interact, including risk, safety, and support options.",
  "estimatedTimeMinutes": 45,
  "difficultyLevel": "intermediate",
  "learningOutcomes": [
    "Understand the relationship between AOD and DFV.",
    "Recognise increased risks for parents and children.",
    "Identify support options for safety and recovery."
  ],
  "modules": [
    "Understanding AOD and DFV",
    "Safety and Support Options"
  ],
  "metadata": {
    "stream": "dfv-parent",
    "category": "AOD",
    "tags": ["aod", "substance use", "safety"]
  },
  "caseworkerSummary": "Helps parents understand how AOD and DFV interact and how to seek support."
}
'@
        Lesson = @'
{
  "sections": [
    {
      "title": "Welcome",
      "content": "AOD and DFV often overlap, increasing risk for families."
    },
    {
      "title": "Core Concepts",
      "content": "Substance use does not cause DFV, but it can escalate harm and reduce safety."
    },
    {
      "title": "Practical Skills",
      "content": "Parents learn how to access AOD support and plan for safety."
    },
    {
      "title": "Activity",
      "content": "Reflect on how AOD has affected safety in your family."
    },
    {
      "title": "Reflection",
      "content": "Understanding the connection helps parents make informed choices."
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

Write-Host "DFV Parent Batch 3 JSON files created."
