# SafeSteps Lesson Title Updater
Set-Location "C:\Users\SAFES\SafeStepsApp"

$curriculumPath = "safesteps\assets\SafeSteps.curriculum.json"
$indexPath = "safesteps\assets\SafeSteps.course.index.json"

Write-Host "Updating lesson titles from course index..."

# Load both JSON files
$curriculum = Get-Content $curriculumPath -Raw | ConvertFrom-Json
$index = Get-Content $indexPath -Raw | ConvertFrom-Json

# Collect all lesson titles from course index
$lessonTitles = @()
foreach ($course in $index.courses.PSObject.Properties.Value) {
    $lessonTitles += $course.title
}

# Replace lesson titles sequentially
$lessonCounter = 0
for ($week = 0; $week -lt $curriculum.weeks.Count; $week++) {
    for ($lesson = 0; $lesson -lt $curriculum.weeks[$week].lessons.Count; $lesson++) {
        if ($lessonCounter -lt $lessonTitles.Count) {
            $curriculum.weeks[$week].lessons[$lesson].title = $lessonTitles[$lessonCounter]
            $lessonCounter++
        }
    }
}

# Save updated curriculum
$curriculum | ConvertTo-Json -Depth 10 | Set-Content $curriculumPath
Write-Host "Lesson titles updated successfully."