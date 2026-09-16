param(
    [string]$TopicsDir   = ".\topics",
    [string]$ModulesDir  = ".\modules",
    [string]$LessonsDir  = ".\lessons",
    [string]$SectionsDir = ".\sections"
)

Write-Host "=== Curriculum Visualiser ===`n"

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
$topics  = Get-ChildItem $TopicsDir  -Filter *.json | ForEach-Object { Load-JsonSafe $_.FullName }
$modules = Get-ChildItem $ModulesDir -Filter *.json | ForEach-Object { Load-JsonSafe $_.FullName }
$lessons = Get-ChildItem $LessonsDir -Filter *.json | ForEach-Object { Load-JsonSafe $_.FullName }
$sections = Get-ChildItem $SectionsDir -Filter *.json | ForEach-Object { Load-JsonSafe $_.FullName }

# Index for fast lookup
$modulesById  = @{}; foreach ($m in $modules) { if ($m.id) { $modulesById[$m.id] = $m } }
$lessonsById  = @{}; foreach ($l in $lessons) { if ($l.id) { $lessonsById[$l.id] = $l } }
$sectionsById = @{}; foreach ($s in $sections) { if ($s.id) { $sectionsById[$s.id] = $s } }

foreach ($topic in $topics) {

    if (-not $topic.id) { continue }

    Write-Host "📘 TOPIC: $($topic.id)" -ForegroundColor Cyan

    foreach ($modRef in $topic.modules) {

        $module = $modulesById[$modRef.id]
        if (-not $module) { continue }

        Write-Host "   📗 MODULE: $($module.id)" -ForegroundColor Green

        foreach ($lessonRef in $module.lessons) {

            $lesson = $lessonsById[$lessonRef.id]
            if (-not $lesson) { continue }

            Write-Host "      📙 LESSON: $($lesson.id)" -ForegroundColor Yellow

            foreach ($secRef in $lesson.sections) {

                $section = $sectionsById[$secRef.id]
                if (-not $section) { continue }

                Write-Host "         📄 SECTION: $($section.id)" -ForegroundColor Gray
            }
        }
    }

    Write-Host ""
}

Write-Host "`nVisualisation complete."
