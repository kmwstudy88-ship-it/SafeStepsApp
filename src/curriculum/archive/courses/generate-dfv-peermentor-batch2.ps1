# DFV Peer Mentor – Batch 2
$basePath = "v1.1.0/dfv-peer-mentor"

$topics = @(
    "recognising-risk",
    "responding-to-disclosure",
    "safety-and-escalation",
    "cultural-awareness",
    "working-with-diverse-families"
)

foreach ($topic in $topics) {
    $path = "$basePath/$topic"
    if (!(Test-Path $path)) { New-Item -ItemType Directory -Path $path | Out-Null }

    $course = @{
        topic = $topic
        stream = "dfv-peer-mentor"
        version = "1.1.0"
        type = "course"
        title = ($topic -replace "-", " ") -replace "\b\w", { $args[0].Value.ToUpper() }
        description = "Peer Mentor training module on $topic."
    }

    $lesson = @{
        topic = $topic
        stream = "dfv-peer-mentor"
        version = "1.1.0"
        type = "lesson"
        title = "Lesson - $($course.title)"
        content = "Lesson content for $topic."
    }

    $course | ConvertTo-Json -Depth 10 | Out-File "$path/course.json" -Encoding UTF8
    $lesson | ConvertTo-Json -Depth 10 | Out-File "$path/lesson.json" -Encoding UTF8
}

Write-Host "DFV Peer Mentor Batch 2 JSON files created."
