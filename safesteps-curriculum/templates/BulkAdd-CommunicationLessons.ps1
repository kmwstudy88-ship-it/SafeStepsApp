# Bulk Add Communication Lessons (Named by Lesson Title)

$LessonPath = "C:\Users\SAFES\safesteps\safesteps-curriculum\templates\Communication"

if (-not (Test-Path $LessonPath)) {
    New-Item -ItemType Directory -Path $LessonPath | Out-Null
}

$Lessons = @(
@{
    File="What-is-Communication.txt"
    Content=@"
TOPIC: Communication

LESSON-001
Title: What is Communication?
Level: Foundation
Duration: 2-4 Hours
Category: Communication
Learning Outcomes:
- Define communication
- Identify verbal and non-verbal communication
- Understand communication barriers
Core Concepts:
- Sender and receiver
- Communication channels
- Verbal communication
- Non-verbal communication
- Feedback loops
Activities:
- Self-reflection exercise
- Communication style assessment
Evidence:
- Completed reflection worksheet
- Communication action plan
"@
},
@{
    File="Active-Listening.txt"
    Content=@"
LESSON-002
Title: Active Listening
Level: Foundation
Duration: 2-4 Hours
Category: Communication
Learning Outcomes:
- Demonstrate active listening skills
- Improve understanding during conversations
Core Concepts:
- Listening vs hearing
- Reflective listening
- Clarification
- Summarising
Activities:
- Listening exercises
- Role play scenarios
Evidence:
- Listening skills checklist
- Practice log
"@
},
@{
    File="Understanding-Body-Language.txt"
    Content=@"
LESSON-003
Title: Understanding Body Language
Level: Foundation
Duration: 2-4 Hours
Category: Communication
Learning Outcomes:
- Recognise body language cues
- Improve non-verbal communication
Core Concepts:
- Facial expressions
- Eye contact
- Posture
- Personal space
Activities:
- Video analysis
- Observation exercises
Evidence:
- Observation journal
"@
},
@{
    File="Speaking-Respectfully.txt"
    Content=@"
LESSON-004
Title: Speaking Respectfully
Level: Foundation
Duration: 2-4 Hours
Category: Communication
Learning Outcomes:
- Use respectful language
- Reduce hostile communication
Core Concepts:
- Respect
- Tone of voice
- Word choice
- Empathy
Activities:
- Communication rewrites
- Role plays
Evidence:
- Respectful communication worksheet
"@
},
@{
    File="Managing-Difficult-Conversations.txt"
    Content=@"
LESSON-005
Title: Managing Difficult Conversations
Level: Intermediate
Duration: 4-6 Hours
Category: Communication
Learning Outcomes:
- Prepare for difficult discussions
- Remain calm during conflict
Core Concepts:
- Preparation
- Emotional regulation
- Assertiveness
- Problem solving
Activities:
- Scenario practice
- Reflection tasks
Evidence:
- Conversation planning template
"@
},
@{
    File="Conflict-Resolution.txt"
    Content=@"
LESSON-006
Title: Conflict Resolution
Level: Intermediate
Duration: 4-6 Hours
Category: Communication
Learning Outcomes:
- Resolve disagreements constructively
- Apply conflict resolution models
Core Concepts:
- Conflict styles
- Negotiation
- Compromise
- Resolution planning
Activities:
- Case studies
- Mediation exercises
Evidence:
- Conflict resolution plan
"@
},
@{
    File="Family-Meetings.txt"
    Content=@"
LESSON-007
Title: Family Meetings
Level: Intermediate
Duration: 2-4 Hours
Category: Communication
Learning Outcomes:
- Conduct effective family meetings
- Encourage family participation
Core Concepts:
- Meeting structure
- Agenda setting
- Shared decision making
Activities:
- Family meeting simulation
Evidence:
- Family meeting plan
"@
},
@{
    File="Communicating-with-Children.txt"
    Content=@"
LESSON-008
Title: Communicating with Children
Level: Intermediate
Duration: 4-6 Hours
Category: Parenting Communication
Learning Outcomes:
- Communicate effectively with children
- Use age-appropriate language
Core Concepts:
- Child development
- Positive communication
- Emotional coaching
Activities:
- Parent-child scenarios
Evidence:
- Parent communication journal
"@
},
@{
    File="Communicating-with-Teenagers.txt"
    Content=@"
LESSON-009
Title: Communicating with Teenagers
Level: Intermediate
Duration: 4-6 Hours
Category: Parenting Communication
Learning Outcomes:
- Build trust with teenagers
- Improve adolescent communication
Core Concepts:
- Independence
- Boundaries
- Active listening with teens
Activities:
- Scenario-based learning
Evidence:
- Teen communication action plan
"@
},
@{
    File="Repairing-Communication-After-Conflict.txt"
    Content=@"
LESSON-010
Title: Repairing Communication After Conflict
Level: Advanced
Duration: 4-6 Hours
Category: Communication
Learning Outcomes:
- Restore relationships after disagreements
- Develop accountability skills
Core Concepts:
- Apologies
- Accountability
- Trust rebuilding
- Relationship repair
Activities:
- Repair conversation planning
- Reflection exercises
Evidence:
- Communication repair plan
"@
}
)

foreach ($lesson in $Lessons) {
    $FilePath = Join-Path $LessonPath $lesson.File
    Set-Content -Path $FilePath -Value $lesson.Content -Encoding UTF8
    Write-Host "Created: $($lesson.File)"
}

Write-Host "All Communication lessons created successfully."
