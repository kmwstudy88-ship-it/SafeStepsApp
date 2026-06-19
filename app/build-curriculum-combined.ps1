# SafeSteps Curriculum Builder + Taxonomy Integrator
Set-Location "C:\Users\SAFES\SafeStepsApp"

$curriculumPath = "safesteps\assets\SafeSteps.curriculum.json"
$indexPath = "safesteps\assets\SafeSteps.course.index.json"

Write-Host "Building full curriculum and linking taxonomy..."

# Load taxonomy categories from course index
$index = Get-Content $indexPath -Raw | ConvertFrom-Json
$categories = @()
foreach ($course in $index.courses.PSObject.Properties.Value) {
    $categories += $course.category
}
$categories = $categories | Sort-Object -Unique

# Define curriculum structure
$curriculum = @{
    program = "Reunification Program"
    duration_weeks = 104
    total_lessons = 730
    weeks = @()
}

# Generate weeks and lessons with taxonomy categories
for ($week = 1; $week -le 104; $week++) {
    $category = $categories[$week % $categories.Count]
    $weekData = @{
        week_number = $week
        theme = "Week ${week}: Growth and Stability"
        category = $category
        lessons = @()
    }

    for ($lesson = 1; $lesson -le 7; $lesson++) {
        $lessonData = @{
            lesson_number = $lesson
            title = "Lesson $lesson"
            focus = "Core skill development"
            category = $category
        }
        $weekData.lessons += $lessonData
    }

    $curriculum.weeks += $weekData
}

# Save JSON
$curriculum | ConvertTo-Json -Depth 10 | Set-Content $curriculumPath
Write-Host "SafeSteps curriculum built and taxonomy applied successfully."