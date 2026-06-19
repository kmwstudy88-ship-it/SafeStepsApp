cd "C:\Users\SAFES\SafeStepsApp"

$courseIndexPath = "safesteps\assets\SafeSteps.course.index.json"

Write-Host "Checking JSON..."

# Load JSON
try {
    $jsonText = Get-Content $courseIndexPath -Raw
    $courseIndex = $jsonText | ConvertFrom-Json
}
catch {
    Write-Host "JSON invalid"
    return
}

# Category map
$categoryMap = @{
    "parental" = "Parenting & Family Dynamics"
    "family" = "Parenting & Family Dynamics"
    "communication" = "Communication & Conflict Resolution"
    "trauma" = "Trauma Recovery & Resilience"
    "stress" = "Boundaries & Self-Care"
    "safety" = "Safety & Crisis Response"
    "risk" = "Safety & Crisis Response"
    "recovery" = "Trauma Recovery & Resilience"
    "case review" = "Professional Practice & Reflection"
    "transition" = "Life Transitions & Stability"
    "cultural" = "Cultural Context & Inclusion"
    "policy" = "Systems & Policy Awareness"
    "goal" = "Empowerment & Goal Setting"
}

# Apply categories
foreach ($key in $courseIndex.courses.PSObject.Properties.Name) {
    $course = $courseIndex.courses.$key
    $title = $course.title.ToLower()
    $category = "General"

    foreach ($keyword in $categoryMap.Keys) {
        if ($title -match $keyword) {
            $category = $categoryMap[$keyword]
            break
        }
    }

    $course.category = $category
}

# Save
$courseIndex | ConvertTo-Json -Depth 10 | Set-Content $courseIndexPath

Write-Host "Done."
