param(
    [string]$MasterPath = ".\master-index.json",
    [string]$ModulesDir = ".\modules",
    [string]$LessonsDir = ".\lessons"
)

Write-Host "=== Split-Master.ps1 ==="

if (-not (Test-Path $MasterPath)) {
    Write-Error "Master file not found: $MasterPath"
    exit 1
}

New-Item -ItemType Directory -Path $ModulesDir -ErrorAction SilentlyContinue | Out-Null
New-Item -ItemType Directory -Path $LessonsDir -ErrorAction SilentlyContinue | Out-Null

try {
    $master = Get-Content $MasterPath -Raw | ConvertFrom-Json
} catch {
    Write-Error ("Failed to parse JSON from {0}: {1}" -f $MasterPath, ($_ | Out-String))
    exit 1
}


if (-not $master.modules) {
    Write-Warning "No 'modules' array found in master. Nothing to split."
    exit 0
}

foreach ($module in $master.modules) {
    if (-not $module.id) { continue }

    $modulePath = Join-Path $ModulesDir "$($module.id).json"
    $module | ConvertTo-Json -Depth 20 | Set-Content $modulePath -Encoding UTF8
    Write-Host "Module → $modulePath"

    if ($module.lessons) {
        foreach ($lesson in $module.lessons) {
            if (-not $lesson.id) { continue }

            $lessonPath = Join-Path $LessonsDir "$($lesson.id).json"
            $lesson | ConvertTo-Json -Depth 20 | Set-Content $lessonPath -Encoding UTF8
            Write-Host "  Lesson → $lessonPath"
        }
    }
}

Write-Host "Master split complete."
