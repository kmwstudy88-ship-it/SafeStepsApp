# SafeSteps Curriculum Taxonomy Integrator
Set-Location "C:\Users\SAFES\SafeStepsApp"
$curriculumPath = "safesteps\assets\SafeSteps.curriculum.json"
$indexPath = "safesteps\assets\SafeSteps.course.index.json"

Write-Host "Linking taxonomy to curriculum..."

# Load both JSON files
$curriculum = Get-Content $curriculumPath -Raw | ConvertFrom-Json
$index = Get-Content $indexPath -Raw | ConvertFrom-Json

# Build category list from course index
$categories = @()
foreach ($course in $index.courses.PSObject.Properties.Value) {
    $categories += $course.category
}
$categories = $categories | Sort-Object -Unique

# Assign categories cyclically across weeks
for ($i = 0; $i -lt $curriculum.weeks.Count; $i++) {
    $curriculum.weeks[$i].category = $categories[$i % $categories.Count]
}

# Save updated curriculum
$curriculum | ConvertTo-Json -Depth 10 | Set-Content $curriculumPath
Write-Host "Curriculum taxonomy applied successfully."
