# Generate DFV Peer Mentor Index
$basePath = "v1.1.0/dfv-peer-mentor"

$topics = @(
    "role-of-a-peer-mentor",
    "boundaries-and-scope",
    "trauma-informed-support",
    "active-listening-skills",
    "communication-for-support",
    "recognising-risk",
    "responding-to-disclosure",
    "safety-and-escalation",
    "cultural-awareness",
    "working-with-diverse-families",
    "supporting-parenting-challenges",
    "supporting-parents-through-dfv",
    "self-care-and-burnout-prevention",
    "reflective-practice",
    "documentation-and-reporting",
    "group-facilitation-basics",
    "mentoring-ethics",
    "building-trust-with-parents",
    "supporting-behaviour-change",
    "maintaining-professionalism"
)

$index = @()

foreach ($topic in $topics) {
    $index += @{
        topic      = $topic
        stream     = "dfv-peer-mentor"
        version    = "1.1.0"
        coursePath = "$basePath/$topic/course.json"
        lessonPath = "$basePath/$topic/lesson.json"
    }
}

$index | ConvertTo-Json -Depth 10 | Out-File "dfv-peer-mentor-index.json" -Encoding UTF8

Write-Host "DFV Peer Mentor Index created."
