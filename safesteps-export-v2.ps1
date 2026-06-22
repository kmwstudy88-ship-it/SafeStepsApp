param(
    [string]$CurriculumPath = "C:\Users\SAFES\SafeStepsApp\curriculum",
    [ValidateSet("full","programs","lessons","weeks","stages")]
    [string]$Mode = "full"
)

Write-Host "=== SafeSteps Curriculum Export Engine v2 ===" -ForegroundColor Cyan

$exportRoot = "C:\SafeSteps\export"
if (-not (Test-Path $exportRoot)) {
    New-Item -ItemType Directory -Path $exportRoot | Out-Null
}

$timestamp  = (Get-Date).ToString("yyyyMMdd-HHmmss")
$exportPath = Join-Path $exportRoot $timestamp
New-Item -ItemType Directory -Path $exportPath | Out-Null

switch ($Mode) {
    "full" {
        Copy-Item -Recurse -Path $CurriculumPath -Destination "$exportPath\curriculum" -Force
    }
    "programs" {
        Copy-Item -Recurse -Path "$CurriculumPath\programs" -Destination "$exportPath\programs" -Force
    }
    "lessons" {
        Copy-Item -Recurse -Path "$CurriculumPath\lessons" -Destination "$exportPath\lessons" -Force
    }
    "weeks" {
        Copy-Item -Recurse -Path "$CurriculumPath\weeks" -Destination "$exportPath\weeks" -Force
    }
    "stages" {
        Copy-Item -Recurse -Path "$CurriculumPath\stages" -Destination "$exportPath\stages" -Force
    }
}

$meta = [PSCustomObject]@{
    mode        = $Mode
    sourcePath  = $CurriculumPath
    exportPath  = $exportPath
    createdAt   = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
}

$meta | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path (Join-Path $exportPath "export-meta.json")

Write-Host "Export complete: $exportPath" -ForegroundColor Green
