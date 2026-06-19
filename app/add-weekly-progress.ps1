# SafeSteps Weekly Summary & Progress Tracker
Set-Location "C:\Users\SAFES\SafeStepsApp"

$curriculumPath = "safesteps\assets\SafeSteps.curriculum.json"

Write-Host "Adding weekly summaries and progress tracking fields..."

# Load curriculum
$curriculum = Get-Content $curriculumPath -Raw | ConvertFrom-Json

# Add summary and progress fields to each week
foreach ($week in $curriculum.weeks) {
    # Create properties if missing
    Add-Member -InputObject $week -NotePropertyName "summary" -NotePropertyValue "" -Force
    Add-Member -InputObject $week -NotePropertyName "progress" -NotePropertyValue @{} -Force

    # Generate summary text
    $week.summary = "This week focuses on ${week.category}, reinforcing skills through seven lessons and practical activities."

    # Initialize progress tracking
    $week.progress = @{
        completed_lessons = 0
        total_lessons = $week.lessons.Count
        completion_rate = 0
        reflections = @()
    }
}

# Save updated curriculum
$curriculum | ConvertTo-Json -Depth 10 | Set-Content $curriculumPath
Write-Host "Weekly summaries and progress tracking added successfully."