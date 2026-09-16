<#
    SafeSteps Bundle Builder
    Generates:
      - SafeSteps.bundle.json
#>

$Root = "C:\Users\SAFES\SafeStepsProject\safesteps-curriculum"
$ProgramsRoot = "C:\SafeSteps\Programs"

$BundlePath = Join-Path $Root "SafeSteps.bundle.json"

$bundle = @{
    generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    programs    = @()
}

Write-Host ""
Write-Host "=== Building SafeSteps Bundle ==="
Write-Host ""

if (-Not (Test-Path $ProgramsRoot)) {
    Write-Host "ERROR: Programs folder not found at $ProgramsRoot"
    exit 1
}

$programDirs = Get-ChildItem -Path $ProgramsRoot -Directory

foreach ($program in $programDirs) {
    $programName = $program.Name
    $programPath = $program.FullName

    Write-Host "Program: $programName"

    $programEntry = @{
        name    = $programName
        path    = $programPath
        config  = $null
        weeks   = @()
        lessons = @()
    }

    # Load program.json
    $programConfigPath = Join-Path $programPath "config\program.json"
    if (Test-Path $programConfigPath) {
        try {
            $programEntry.config = Get-Content $programConfigPath -Raw | ConvertFrom-Json
        } catch {
            Write-Host "WARNING: Invalid JSON in $programConfigPath" -ForegroundColor Yellow
        }
    }

    # Load weeks
    $weeksPath = Join-Path $programPath "weeks"
    if (Test-Path $weeksPath) {
        $weekDirs = Get-ChildItem -Path $weeksPath -Directory
        foreach ($week in $weekDirs) {
            $weekJsonPath = Join-Path $week.FullName "week.json"
            if (Test-Path $weekJsonPath) {
                try {
                    $weekJson = Get-Content $weekJsonPath -Raw | ConvertFrom-Json
                    $programEntry.weeks += $weekJson
                } catch {
                    Write-Host "WARNING: Invalid JSON in $weekJsonPath" -ForegroundColor Yellow
                }
            }
        }
    }

    # Load lessons
    $lessonsPath = Join-Path $programPath "lessons"
    if (Test-Path $lessonsPath) {
        $lessonDirs = Get-ChildItem -Path $lessonsPath -Directory
        foreach ($lesson in $lessonDirs) {
            $lessonJsonPath = Join-Path $lesson.FullName "lesson.json"
            if (Test-Path $lessonJsonPath) {
                try {
                    $lessonJson = Get-Content $lessonJsonPath -Raw | ConvertFrom-Json
                    $programEntry.lessons += $lessonJson
                } catch {
                    Write-Host "WARNING: Invalid JSON in $lessonJsonPath" -ForegroundColor Yellow
                }
            }
        }
    }

    $bundle.programs += $programEntry
}

Write-Host ""
Write-Host "=== Writing Bundle File ==="
Write-Host ""

$bundle | ConvertTo-Json -Depth 20 | Out-File $BundlePath -Encoding UTF8

Write-Host "Bundle created: $BundlePath"

Write-Host ""
Write-Host "=== Bundle Build Complete ==="
Write-Host ""
