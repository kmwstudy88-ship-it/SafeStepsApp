param(
    [string]$CoursesDir = ".\courses",
    [string]$ModulesDir = ".\modules",
    [string]$LessonsDir = ".\lessons",
    [string]$SectionsDir = ".\sections"
)

Write-Host "=== SafeSteps Curriculum Dashboard ===`n"

function Load-JsonSafe {
    param([string]$Path)
    try { return (Get-Content $Path -Raw | ConvertFrom-Json) }
    catch { Write-Warning "Malformed JSON -> $Path"; return $null }
}

function To-OrderedHashtable {
    param($obj)

    $ht = [ordered]@{}

    foreach ($prop in $obj.PSObject.Properties) {
        $value = $prop.Value

        if ($value -is [System.Management.Automation.PSCustomObject]) {
            $ht[$prop.Name] = To-OrderedHashtable $value
        }
        elseif ($value -is [System.Collections.IEnumerable] -and -not ($value -is [string])) {
            $arr = @()
            foreach ($item in $value) {
                if ($item -is [System.Management.Automation.PSCustomObject]) {
                    $arr += To-OrderedHashtable $item
                }
                else {
                    $arr += $item
                }
            }
            $ht[$prop.Name] = $arr
        }
        else {
            $ht[$prop.Name] = $value
        }
    }

    return $ht
}

# ------------------------------
# Load all items
# ------------------------------

$modules  = @{}
$lessons  = @{}
$sections = @{}
$courses  = @{}

foreach ($mf in Get-ChildItem $ModulesDir -Filter *.json) {
    $raw = Load-JsonSafe $mf.FullName
    if ($raw -and $raw.id) { $modules[$raw.id] = To-OrderedHashtable $raw }
}

foreach ($lf in Get-ChildItem $LessonsDir -Filter *.json) {
    $raw = Load-JsonSafe $lf.FullName
    if ($raw -and $raw.id) { $lessons[$raw.id] = To-OrderedHashtable $raw }
}

foreach ($sf in Get-ChildItem $SectionsDir -Filter *.json) {
    $raw = Load-JsonSafe $sf.FullName
    if ($raw -and $raw.id) { $sections[$raw.id] = To-OrderedHashtable $raw }
}

foreach ($cf in Get-ChildItem $CoursesDir -Directory) {
    $coursePath = Join-Path $cf.FullName "course.json"
    if (Test-Path $coursePath) {
        $raw = Load-JsonSafe $coursePath
        if ($raw -and $raw.id) { $courses[$raw.id] = To-OrderedHashtable $raw }
    }
}

# ------------------------------
# Dashboard calculations
# ------------------------------

$totalCourses  = $courses.Count
$totalModules  = $modules.Count
$totalLessons  = $lessons.Count
$totalSections = $sections.Count

$missingLessonContent = $lessons.Values | Where-Object { -not $_.Contains("content") }
$missingSectionContent = $sections.Values | Where-Object { -not $_.Contains("content") }

$modulesMissingLessons = $modules.Values | Where-Object { -not $_.Contains("lessons") -or $_.lessons.Count -eq 0 }
$coursesMissingModules = $courses.Values | Where-Object { -not $_.Contains("modules") -or $_.modules.Count -eq 0 }

# ------------------------------
# Health score
# ------------------------------

$score = 100

if ($missingLessonContent.Count -gt 0) { $score -= 10 }
if ($missingSectionContent.Count -gt 0) { $score -= 10 }
if ($modulesMissingLessons.Count -gt 0) { $score -= 10 }
if ($coursesMissingModules.Count -gt 0) { $score -= 10 }

if ($score -lt 0) { $score = 0 }

# ------------------------------
# Print dashboard
# ------------------------------

Write-Host "📘 Courses:  $totalCourses"
Write-Host "📗 Modules:  $totalModules"
Write-Host "📙 Lessons:  $totalLessons"
Write-Host "📒 Sections: $totalSections`n"

Write-Host "⚠ Missing lesson content:   $($missingLessonContent.Count)"
Write-Host "⚠ Missing section content:  $($missingSectionContent.Count)"
Write-Host "⚠ Modules missing lessons:  $($modulesMissingLessons.Count)"
Write-Host "⚠ Courses missing modules:  $($coursesMissingModules.Count)`n"

Write-Host "💠 Curriculum Health Score: $score / 100`n"

Write-Host "Dashboard complete."
