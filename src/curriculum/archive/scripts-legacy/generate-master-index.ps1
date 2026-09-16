# ============================================================
#  SafeSteps Master Curriculum Index Generator
# ============================================================

$basePath = "C:\Users\SAFES\safesteps-curriculum\courses\v1.0.0"
$outputFile = "C:\Users\SAFES\safesteps-curriculum\master-index.json"

$index = @()

$topicFolders = Get-ChildItem -Path $basePath -Directory

foreach ($topic in $topicFolders) {

    $courseFile = Join-Path $topic.FullName "course.json"
    if (-not (Test-Path $courseFile)) {
        Write-Host "Skipping topic (no course.json): $($topic.Name)"
        continue
    }

    # Load topic JSON
    try {
        $topicJson = Get-Content $courseFile -Raw | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        Write-Host "❌ ERROR: Invalid JSON in $courseFile"
        continue
    }

    # Build topic entry
    $topicEntry = [ordered]@{
        topicId            = $topic.Name
        topicName          = ($topic.Name -replace '-', ' ')
        caseworkerSummary  = $topicJson.caseworkerSummary
        modules            = @()
    }

    # Process modules
    $modulesPath = Join-Path $topic.FullName "modules"
    if (Test-Path $modulesPath) {

        $moduleFolders = Get-ChildItem -Path $modulesPath -Directory

        foreach ($module in $moduleFolders) {

            $moduleFile = Join-Path $module.FullName "module.json"
            if (-not (Test-Path $moduleFile)) {
                Write-Host "Skipping module (no module.json): $($module.Name)"
                continue
            }

            try {
                $moduleJson = Get-Content $moduleFile -Raw | ConvertFrom-Json -ErrorAction Stop
            }
            catch {
                Write-Host "❌ ERROR: Invalid JSON in $moduleFile"
                continue
            }

            $moduleEntry = [ordered]@{
                moduleId   = $module.Name
                moduleName = $moduleJson.title
                lessons    = @()
            }

            # Process lessons
            $lessonsPath = Join-Path $module.FullName "lessons"
            if (Test-Path $lessonsPath) {

                $lessonFolders = Get-ChildItem -Path $lessonsPath -Directory

                foreach ($lesson in $lessonFolders) {

                    $lessonFile = Join-Path $lesson.FullName "lesson.json"
                    if (-not (Test-Path $lessonFile)) {
                        Write-Host "Skipping lesson (no lesson.json): $($lesson.Name)"
                        continue
                    }

                    try {
                        $lessonJson = Get-Content $lessonFile -Raw | ConvertFrom-Json -ErrorAction Stop
                    }
                    catch {
                        Write-Host "❌ ERROR: Invalid JSON in $lessonFile"
                        continue
                    }

                    $lessonEntry = [ordered]@{
                        lessonId         = $lesson.Name
                        lessonName       = $lessonJson.title
                        learningOutcomes = $lessonJson.learningOutcomes
                    }

                    $moduleEntry.lessons += $lessonEntry
                }
            }

            $topicEntry.modules += $moduleEntry
        }
    }

    $index += $topicEntry
}

# Save master index
$indexJson = $index | ConvertTo-Json -Depth 20
Set-Content -Path $outputFile -Value $indexJson -Encoding UTF8

Write-Host "✅ Master index generated:"
Write-Host $outputFile

