<#
    SafeSteps Curriculum Validator
    Checks:
      - Missing weeks
      - Missing lessons
      - Invalid folder names
      - Broken or unreadable JSON
      - Missing config files
      - Empty or malformed JSON
#>

$ProgramsRoot = "C:\SafeSteps\Programs"

Write-Host ""
Write-Host "=== SafeSteps Curriculum Validator ==="
Write-Host ""

if (-Not (Test-Path $ProgramsRoot)) {
    Write-Host "ERROR: Programs folder not found at $ProgramsRoot"
    exit 1
}

$programDirs = Get-ChildItem -Path $ProgramsRoot -Directory

foreach ($program in $programDirs) {
    $programName = $program.Name
    $programPath = $program.FullName

    Write-Host ""
    Write-Host "=== Validating Program: $programName ==="

    $errors = @()

    # Validate program.json
    $programConfigPath = Join-Path $programPath "config\program.json"
    if (-Not (Test-Path $programConfigPath)) {
        $errors += "Missing program.json"
    } else {
        try {
            $json = Get-Content $programConfigPath -Raw | ConvertFrom-Json
        } catch {
            $errors += "Invalid JSON in program.json"
        }
    }

    # Validate weeks
    $weeksPath = Join-Path $programPath "weeks"
    if (-Not (Test-Path $weeksPath)) {
        $errors += "Missing weeks folder"
    } else {
        $weekDirs = Get-ChildItem -Path $weeksPath -Directory

        foreach ($week in $weekDirs) {
            if ($week.Name -notmatch "^Week-[0-9]+$") {
                $errors += "Invalid week folder name: $($week.Name)"
            }

            $weekJsonPath = Join-Path $week.FullName "week.json"
            if (-Not (Test-Path $weekJsonPath)) {
                $errors += "Missing week.json in $($week.Name)"
            } else {
                try {
                    $json = Get-Content $weekJsonPath -Raw | ConvertFrom-Json
                } catch {
                    $errors += "Invalid JSON in $($week.Name)\week.json"
                }
            }
        }
    }

    # Validate lessons
    $lessonsPath = Join-Path $programPath "lessons"
    if (-Not (Test-Path $lessonsPath)) {
        $errors += "Missing lessons folder"
    } else {
        $lessonDirs = Get-ChildItem -Path $lessonsPath -Directory

        foreach ($lesson in $lessonDirs) {
            if ($lesson.Name -notmatch "^Lesson-[0-9]+$") {
                $errors += "Invalid lesson folder name: $($lesson.Name)"
            }

            $lessonJsonPath = Join-Path $lesson.FullName "lesson.json"
            if (-Not (Test-Path $lessonJsonPath)) {
                $errors += "Missing lesson.json in $($lesson.Name)"
            } else {
                try {
                    $json = Get-Content $lessonJsonPath -Raw | ConvertFrom-Json
                } catch {
                    $errors += "Invalid JSON in $($lesson.Name)\lesson.json"
                }
            }
        }
    }

    # Output results
    if ($errors.Count -eq 0) {
        Write-Host "Program '$programName' is VALID" -ForegroundColor Green
    } else {
        Write-Host "Program '$programName' has issues:" -ForegroundColor Red
        foreach ($err in $errors) {
            Write-Host " - $err"
        }
    }
}

Write-Host ""
Write-Host "=== Validation Complete ==="
Write-Host ""
