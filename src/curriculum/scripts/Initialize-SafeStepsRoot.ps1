<#
    SafeSteps Root Folder Initialization Script
    Clean ASCII version (no Unicode corruption)
#>

# -----------------------------
# CONFIGURATION
# -----------------------------
$Root = "C:\SafeSteps"

$ProgramsRoot = Join-Path $Root "Programs"
$ReunificationRoot = Join-Path $ProgramsRoot "Reunification"

$ReunificationSubfolders = @(
    "config",
    "evidence",
    "lessons",
    "weeks"
)

# -----------------------------
# FUNCTION: Create folder safely
# -----------------------------
function New-Folder {
    param([string]$Path)

    if (-Not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
        Write-Host "[Created] $Path"
    } else {
        Write-Host "[Exists]  $Path"
    }
}

# -----------------------------
# FUNCTION: Create JSON file
# -----------------------------
function New-JsonFile {
    param(
        [string]$Path,
        [hashtable]$Content
    )

    if (-Not (Test-Path $Path)) {
        $Content | ConvertTo-Json -Depth 10 | Out-File $Path -Encoding UTF8
        Write-Host "[Created] $Path"
    } else {
        Write-Host "[Exists]  $Path"
    }
}

# -----------------------------
# CREATE ROOT STRUCTURE
# -----------------------------
Write-Host ""
Write-Host "=== Creating SafeSteps Root Structure ==="
Write-Host ""

New-Folder $Root
New-Folder $ProgramsRoot
New-Folder $ReunificationRoot

foreach ($folder in $ReunificationSubfolders) {
    New-Folder (Join-Path $ReunificationRoot $folder)
}

# -----------------------------
# CREATE CONFIG FILES
# -----------------------------
Write-Host ""
Write-Host "=== Creating Config Files ==="
Write-Host ""

$ProgramConfig = @{
    programName = "Reunification"
    durationMonths = 24
    dailyLessons = $true
    version = "1.0.0"
}

New-JsonFile -Path (Join-Path $ReunificationRoot "config\program.json") -Content $ProgramConfig

# -----------------------------
# CREATE WEEK FOLDERS (1-104)
# -----------------------------
Write-Host ""
Write-Host "=== Creating Week Folders (1-104) ==="
Write-Host ""

for ($i = 1; $i -le 104; $i++) {
    $WeekPath = Join-Path $ReunificationRoot ("weeks\Week-$i")
    New-Folder $WeekPath

    $WeekConfig = @{
        weekNumber = $i
        lessons = 7
        completed = $false
    }

    New-JsonFile -Path (Join-Path $WeekPath "week.json") -Content $WeekConfig
}

# -----------------------------
# CREATE LESSON FOLDERS (1-730)
# -----------------------------
Write-Host ""
Write-Host "=== Creating Lesson Folders (1-730) ==="
Write-Host ""

for ($i = 1; $i -le 730; $i++) {
    $LessonPath = Join-Path $ReunificationRoot ("lessons\Lesson-$i")
    New-Folder $LessonPath

    $LessonConfig = @{
        lessonNumber = $i
        title = "Lesson $i"
        completed = $false
        content = ""
    }

    New-JsonFile -Path (Join-Path $LessonPath "lesson.json") -Content $LessonConfig
}

Write-Host ""
Write-Host "=== SafeSteps Root Initialization Complete ==="
Write-Host ""
