param(
    [Parameter(Mandatory)]
    [string]$ProgramId,

    [Parameter(Mandatory)]
    [int]$WeekNumber,

    [Parameter(Mandatory)]
    [string]$LessonId,

    [Parameter(Mandatory)]
    [string]$Title,

    [int]$DurationMinutes = 45
)

$programPath = ".\programs\$ProgramId.json"

if (-not (Test-Path $programPath)) {
    Write-Host "Program file not found: $programPath" -ForegroundColor Red
    exit
}

# Load JSON
$program = Get-Content $programPath -Raw | ConvertFrom-Json

# Find week
$week = $program.weeks | Where-Object { $_.weekNumber -eq $WeekNumber }

if (-not $week) {
    Write-Host "Week $WeekNumber not found in program $ProgramId" -ForegroundColor Red
    exit
}

# Build lesson skeleton
$lesson = [PSCustomObject]@{
    lessonId = $LessonId
    title = $Title
    durationMinutes = $DurationMinutes
    prerequisites = @()
    learningObjectives = @()
    content = [PSCustomObject]@{
        overview = ""
        script = ""
        activities = @()
    }
    assessment = [PSCustomObject]@{
        type = ""
        method = ""
        criteria = @()
    }
    metadata = [PSCustomObject]@{
        tags = @()
        sensitivityLevel = "low"
        estimatedEmotionalLoad = 1
    }
}

# Insert lesson
$week.lessons += $lesson

# Save back
$program | ConvertTo-Json -Depth 20 | Set-Content -Path $programPath -Encoding UTF8

Write-Host "Lesson '$LessonId' added to Week $WeekNumber in $ProgramId" -ForegroundColor Green
