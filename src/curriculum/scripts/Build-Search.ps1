<#
    SafeSteps Search Index Builder
    Generates:
      - SafeSteps.search.index.json
      - SafeSteps.search.index
#>

$Root = "C:\Users\SAFES\SafeStepsProject\safesteps-curriculum"
$ProgramsRoot = "C:\SafeSteps\Programs"

$SearchJsonPath = Join-Path $Root "SafeSteps.search.index.json"
$SearchFlatPath = Join-Path $Root "SafeSteps.search.index"

$searchIndex = @()

Write-Host ""
Write-Host "=== Building Search Index ==="
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

    # Add program entry
    $searchIndex += @{
        type    = "program"
        program = $programName
        name    = $programName
        path    = $programPath
        keywords = @($programName.ToLower())
    }

    # Weeks
    $weeksPath = Join-Path $programPath "weeks"
    if (Test-Path $weeksPath) {
        $weekDirs = Get-ChildItem -Path $weeksPath -Directory
        foreach ($week in $weekDirs) {
            $weekName = $week.Name
            $weekPath = $week.FullName

            $searchIndex += @{
                type    = "week"
                program = $programName
                name    = $weekName
                path    = $weekPath
                keywords = @(
                    $programName.ToLower(),
                    $weekName.ToLower(),
                    "week"
                )
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

            $searchIndex += @{
                type    = "lesson"
                program = $programName
                name    = $lessonName
                path    = $lessonPath
                keywords = @(
                    $programName.ToLower(),
                    $lessonName.ToLower(),
                    "lesson"
                )
            }
        }
    }
}

Write-Host ""
Write-Host "=== Writing Search Index Files ==="
Write-Host ""

# JSON search index
$searchIndex | ConvertTo-Json -Depth 10 | Out-File $SearchJsonPath -Encoding UTF8

# Flat search index (newline separated)
$flat = $searchIndex | ForEach-Object {
    "$($_.type)|$($_.program)|$($_.name)|$($_.path)"
}

$flat -join "`n" | Out-File $SearchFlatPath -Encoding UTF8

Write-Host "Search JSON:  $SearchJsonPath"
Write-Host "Search Flat:  $SearchFlatPath"

Write-Host ""
Write-Host "=== Search Index Build Complete ==="
Write-Host ""
