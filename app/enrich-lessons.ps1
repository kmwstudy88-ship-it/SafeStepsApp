# SafeSteps Lesson Enrichment Script (Fixed)
Set-Location "C:\Users\SAFES\SafeStepsApp"

$curriculumPath = "safesteps\assets\SafeSteps.curriculum.json"
$indexPath = "safesteps\assets\SafeSteps.course.index.json"

Write-Host "Enriching lessons with objectives, outcomes, and activities..."

# Load both JSON files
$curriculum = Get-Content $curriculumPath -Raw | ConvertFrom-Json
$index = Get-Content $indexPath -Raw | ConvertFrom-Json

# Build enrichment data from course index
$enrichments = @()
foreach ($course in $index.courses.PSObject.Properties.Value) {
    $enrichments += @{
        title = $course.title
        objectives = @("Understand key concepts", "Apply skills in daily life")
        outcomes = @("Improved communication", "Enhanced resilience")
        activities = @("Group discussion", "Reflection exercise", "Practical scenario")
    }
}

# Apply enrichment to lessons
foreach ($week in $curriculum.weeks) {
    foreach ($lesson in $week.lessons) {
        $match = $enrichments | Where-Object { $_.title -eq $lesson.title }

        # Create properties before assigning
        Add-Member -InputObject $lesson -NotePropertyName "objectives" -NotePropertyValue @() -Force
        Add-Member -InputObject $lesson -NotePropertyName "outcomes" -NotePropertyValue @() -Force
        Add-Member -InputObject $lesson -NotePropertyName "activities" -NotePropertyValue @() -Force

        if ($match) {
            $lesson.objectives = $match.objectives
            $lesson.outcomes = $match.outcomes
            $lesson.activities = $match.activities
        } else {
            $lesson.objectives = @("Review previous skills", "Practice new techniques")
            $lesson.outcomes = @("Greater confidence", "Better self-awareness")
            $lesson.activities = @("Role-play", "Journaling", "Peer feedback")
        }
    }
}

# Save updated curriculum
$curriculum | ConvertTo-Json -Depth 10 | Set-Content $curriculumPath
Write-Host "Lesson enrichment applied successfully."
