# ============================================================
#  SafeSteps Flat Lookup Index Generator
# ============================================================

$basePath = "C:\Users\SAFES\safesteps-curriculum\courses\v1.0.0"
$outputFile = "C:\Users\SAFES\safesteps-curriculum\lookup.json"

$lookup = [ordered]@{
    topics  = [ordered]@{}
    modules = [ordered]@{}
    lessons = [ordered]@{}
}

$topicFolders = Get-ChildItem -Path $basePath -Directory

foreach ($topic in $topicFolders) {

    $courseFile = Join-Path $topic.FullName "course.json"
    if (-not (Test-Path $courseFile)) { continue }

    try {
        $topicJson = Get-Content $courseFile -Raw | ConvertFrom-Json -ErrorAction Stop
    }
    catch { continue }

    # Add topic to lookup
    $lookup.topics[$topic.Name] = [ordered]@{
        name = ($topic.Name -replace '-', ' ')
    }

    # Process modules
    $modulesPath = Join-Path $topic.FullName "modules"
    if (-not (Test-Path $modulesPath)) { continue }

    $moduleFolders = Get-ChildItem -Path $modulesPath -Directory

    foreach ($module in $moduleFolders) {

        $moduleFile = Join-Path $module.FullName "module.json"
        if (-not (Test-Path $moduleFile)) { continue }

        try {
            $moduleJson = Get-Content $moduleFile -Raw | ConvertFrom-Json -ErrorAction Stop
        }
        catch { continue }

        # Add module to lookup
        $lookup.modules[$module.Name] = [ordered]@{
            name    = $moduleJson.title
            topicId = $topic.Name
        }

        # Process lessons
        $lessonsPath = Join-Path $module.FullName "lessons"
        if (-not (Test-Path $lessonsPath)) { continue }

        $lessonFolders = Get-ChildItem -Path $lessonsPath -Directory

        foreach ($lesson in $lessonFolders) {

            $lessonFile = Join-Path $lesson.FullName "lesson.json"
            if (-not (Test-Path $lessonFile)) { continue }

            try {
                $lessonJson = Get-Content $lessonFile -Raw | ConvertFrom-Json -ErrorAction Stop
            }
            catch { continue }

            # Add lesson to lookup
            $lookup.lessons[$lesson.Name] = [ordered]@{
                name      = $lessonJson.title
                moduleId  = $module.Name
                topicId   = $topic.Name
            }
        }
    }
}

# Save lookup index
$lookupJson = $lookup | ConvertTo-Json -Depth 20
Set-Content -Path $outputFile -Value $lookupJson -Encoding UTF8

Write-Host "✅ Lookup index generated:"
Write-Host $outputFile
