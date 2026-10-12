param(
    [string]$ProgramName = "Default Program",
    [string]$StageName = "Stage 1",
    [int]$Weeks = 4,
    [int]$LessonsPerWeek = 3
)

$toolsPath = Join-Path $PSScriptRoot "safesteps-tools.psm1"
Import-Module $toolsPath -Force

$paths = Get-SafeStepsCurriculumPaths
Write-SafeStepsLog -Message "Starting generation: Program=$ProgramName Stage=$StageName Weeks=$Weeks LessonsPerWeek=$LessonsPerWeek" -Level "INFO"

$dirs = @($paths.Root, $paths.Programs, $paths.Stages, $paths.Weeks, $paths.Lessons)
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d | Out-Null
        Write-Host "[CREATE] $d" -ForegroundColor Cyan
    }
}

$programId = ($ProgramName -replace '\s','_').ToLower()
$programFile = Join-Path $paths.Programs "$programId.json"

$programObj = [PSCustomObject]@{
    id = $programId
    name = $ProgramName
    stages = @()
}

$stageId = ($StageName -replace '\s','_').ToLower()
$stageFile = Join-Path $paths.Stages "$stageId.json"

$stageObj = [PSCustomObject]@{
    id = $stageId
    name = $StageName
    programId = $programId
    weeks = @()
}

for ($w = 1; $w -le $Weeks; $w++) {
    $weekId = "{0}_week{1}" -f $stageId, $w
    $weekFile = Join-Path $paths.Weeks "$weekId.json"

    $weekObj = [PSCustomObject]@{
        id = $weekId
        name = "Week $w"
        stageId = $stageId
        lessons = @()
    }

    for ($l = 1; $l -le $LessonsPerWeek; $l++) {
        $lessonId = "{0}_week{1}_lesson{2}" -f $stageId, $w, $l
        $lessonFile = Join-Path $paths.Lessons "$lessonId.json"

        $lessonObj = [PSCustomObject]@{
            id = $lessonId
            title = "Lesson $l"
            weekId = $weekId
            content = "Placeholder content for $ProgramName / $StageName / Week $w / Lesson $l"
        }

        $lessonObj | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 -Path $lessonFile
        $weekObj.lessons += $lessonId
        Write-Host "[CREATE] Lesson: $lessonId" -ForegroundColor Green
    }

    $weekObj | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 -Path $weekFile
    $stageObj.weeks += $weekId
    Write-Host "[CREATE] Week: $weekId" -ForegroundColor Green
}

$stageObj | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 -Path $stageFile
$programObj.stages += $stageId
$programObj | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 -Path $programFile

Write-SafeStepsLog -Message "Generation completed for program $ProgramName" -Level "INFO"
Write-Host "Generation completed." -ForegroundColor Green
