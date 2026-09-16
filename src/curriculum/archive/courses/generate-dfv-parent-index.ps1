# Generate DFV Parent Index
$basePath = "v1.1.0/dfv-parent"

$topics = @(
    "understanding-dfv",
    "impact-of-dfv-on-children",
    "healthy-relationships",
    "parenting-after-dfv",
    "safety-planning",
    "communication-skills",
    "emotional-regulation",
    "support-networks",
    "child-development",
    "trauma-and-healing",
    "co-parenting-challenges",
    "self-care-for-parents",
    "rebuilding-confidence",
    "boundaries-and-consent",
    "stress-management",
    "conflict-resolution",
    "positive-parenting",
    "help-seeking",
    "community-resources",
    "reflection-and-growth"
)

$index = @()

foreach ($topic in $topics) {
    $index += @{
        topic      = $topic
        stream     = "dfv-parent"
        version    = "1.1.0"
        coursePath = "$basePath/$topic/course.json"
        lessonPath = "$basePath/$topic/lesson.json"
    }
}

$index | ConvertTo-Json -Depth 10 | Out-File "dfv-parent-index.json" -Encoding UTF8

Write-Host "DFV Parent Index created."
