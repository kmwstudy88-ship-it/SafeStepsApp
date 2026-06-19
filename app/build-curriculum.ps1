# SafeSteps Curriculum Builder
Set-Location "C:\Users\SAFES\SafeStepsApp"
$path = "safesteps\assets\SafeSteps.curriculum.json"

Write-Host "Building full curriculum..."

# Define structure
$curriculum = @{
    program = "Reunification Program"
    duration_weeks = 104
    total_lessons = 730
    weeks = @()
}

# Generate weeks and lessons
for ($week = 1; $week -le 104; $week++) {
    $weekData = @{
        week_number = $week
        theme = "Week ${week}: Growth and Stability"
        category = "General"
        lessons = @()
    }

    for ($lesson = 1; $lesson -le 7; $lesson++) {
        $lessonData = @{
            lesson_number = $lesson
            title = "Lesson $lesson"
            focus = "Core skill development"
            category = "General"
        }
        $weekData.lessons += $lessonData
    }

    $curriculum.weeks += $weekData
}

# Save JSON
$curriculum | ConvertTo-Json -Depth 10 | Set-Content $path
Write-Host "SafeSteps.curriculum.json built successfully."