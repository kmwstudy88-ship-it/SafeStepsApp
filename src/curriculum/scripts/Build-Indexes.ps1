<#
    SafeSteps Bulk Index Builder
    Scans Programs, Weeks, Lessons and generates:
      - SafeSteps.master.index.json
      - SafeSteps.program.map.json
      - SafeSteps.lesson.index.json
#>

$Root = "C:\Users\SAFES\SafeStepsProject\safesteps-curriculum"
$ProgramsRoot = "C:\SafeSteps\Programs"

$MasterIndexPath  = Join-Path $Root "SafeSteps.master.index.json"
$ProgramMapPath   = Join-Path $Root "SafeSteps.program.map.json"
$LessonIndexPath  = Join-Path $Root "SafeSteps.lesson.index.json"

$masterIndex  = @()
$programMap   = @()
$lessonIndex  = @()

Write-Host ""
Write-Host "=== Scanning Programs ==="
Write-Host ""

if (-Not (Test-Path $ProgramsRoot)) {
    Write-Host "Programs folder not found at $ProgramsRoot"
    exit 1
}

$programDirs = Get-ChildItem -Path $ProgramsRoot -Directory

foreach ($program in $programDirs) {
    $programName = $program.Name
    $programPath = $program.FullName

    Write-Host "Program: $programName"

    $programEntry = @{
        name   = $programName
        path   = $programPath
        weeks  = @()
        lessons = @()
    }

    # Weeks
    $weeksPath = Join-Path $programPath "weeks"
    if (Test-Path $weeksPath) {
        $weekDirs = Get-ChildItem -Path $weeksPath -Directory
        foreach ($week in $weekDirs) {
            $weekName = $week.Name
            $weekPath = $week.FullName

            $weekEntry = @{
                program = $programName
                week    = $weekName
                path    = $weekPath
            }

            $programEntry.weeks += $weekEntry
            $masterIndex += @{
                type    = "week"
                program = $programName
                name    = $weekName
                path    = $weekPath
            }
        }
    }

    # Lessons
    $lessonsPath = Join-Path $programPath "lessons"
    if (Test-Path $lessonsPath) {
        $lessonDirs = Get-ChildItem -Path $lessonsPath -Directory
        foreach ($lesson in $lessonDirs) {
            $lessonName = $lesson.Name
            $lessonPath = $lesson.FullName

            $lessonEntry = @{
                program = $programName
                lesson  = $lessonName
                path    = $lessonPath
            }

            $programEntry.lessons += $lessonEntry
            $lessonIndex += $lessonEntry
            $masterIndex += @{
                type    = "lesson"
                program = $programName
                name    = $lessonName
                path    = $lessonPath
            }
        }
    }

    $programMap += $programEntry

    $masterIndex += @{
        type    = "program"
        program = $programName
        name    = $programName
        path    = $programPath
    }
}

Write-Host ""
Write-Host "=== Writing Index Files ==="
Write-Host ""

$masterIndex  | ConvertTo-Json -Depth 10 | Out-File $MasterIndexPath  -Encoding UTF8
$programMap   | ConvertTo-Json -Depth 10 | Out-File $ProgramMapPath   -Encoding UTF8
$lessonIndex  | ConvertTo-Json -Depth 10 | Out-File $LessonIndexPath  -Encoding UTF8

Write-Host "Master index:  $MasterIndexPath"
Write-Host "Program map:   $ProgramMapPath"
Write-Host "Lesson index:  $LessonIndexPath"

Write-Host ""
Write-Host "=== Bulk Index Build Complete ==="
Write-Host ""
