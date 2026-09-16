param(
    [string]$TopicsDir   = ".\topics",
    [string]$ModulesDir  = ".\modules",
    [string]$LessonsDir  = ".\lessons",
    [string]$SectionsDir = ".\sections",
    [string]$OutputFile  = ".\master-index.json"
)

Write-Host "=== Merge-Curriculum.ps1 ==="

function Load-JsonSafe {
    param([string]$Path)
    try {
        return (Get-Content $Path -Raw | ConvertFrom-Json)
    }
    catch {
        Write-Warning "Malformed JSON → $Path"
        return $null
    }
}

# Load all objects
$topics   = Get-ChildItem $TopicsDir   -Filter *.json | ForEach-Object { Load-JsonSafe $_.FullName }
$modules  = Get-ChildItem $ModulesDir  -Filter *.json | ForEach-Object { Load-JsonSafe $_.FullName }
$lessons  = Get-ChildItem $LessonsDir  -Filter *.json | ForEach-Object { Load-JsonSafe $_.FullName }
$sections = Get-ChildItem $SectionsDir -Filter *.json | ForEach-Object { Load-JsonSafe $_.FullName }

# Index for fast lookup
$modulesById  = @{}; foreach ($m in $modules) { if ($m.id) { $modulesById[$m.id] = $m } }
$lessonsById  = @{}; foreach ($l in $lessons) { if ($l.id) { $lessonsById[$l.id] = $l } }
$sectionsById = @{}; foreach ($s in $sections) { if ($s.id) { $sectionsById[$s.id] = $s } }

$merged = @()

foreach ($topic in $topics) {

    if (-not $topic.id) { continue }

    $topicObj = [ordered]@{
        id      = $topic.id
        title   = $topic.title
        modules = @()
    }

    foreach ($modRef in $topic.modules) {

        $module = $modulesById[$modRef.id]
        if (-not $module) { continue }

        $moduleObj = [ordered]@{
            id      = $module.id
            title   = $module.title
            lessons = @()
        }

        foreach ($lessonRef in $module.lessons) {

            $lesson = $lessonsById[$lessonRef.id]
            if (-not $lesson) { continue }

            $lessonObj = [ordered]@{
                id       = $lesson.id
                title    = $lesson.title
                sections = @()
            }

            foreach ($secRef in $lesson.sections) {

                $section = $sectionsById[$secRef.id]
                if (-not $section) { continue }

                $sectionObj = [ordered]@{
                    id      = $section.id
                    title   = $section.title
                    content = $section.content
                }

                $lessonObj.sections += $sectionObj
            }

            $moduleObj.lessons += $lessonObj
        }

        $topicObj.modules += $moduleObj
    }

    $merged += $topicObj
}

# Save master index
$merged | ConvertTo-Json -Depth 50 | Set-Content $OutputFile -Encoding UTF8

Write-Host "`nMaster index created → $OutputFile"
