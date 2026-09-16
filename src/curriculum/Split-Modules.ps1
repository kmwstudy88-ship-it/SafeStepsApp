param(
    [string]$ModulesDir = ".\modules",
    [string]$LessonsDir = ".\lessons"
)

Write-Host "=== Split-Modules.ps1 ==="

if (-not (Test-Path $ModulesDir)) {
    Write-Error "Modules directory not found: $ModulesDir"
    exit 1
}

New-Item -ItemType Directory -Path $LessonsDir -ErrorAction SilentlyContinue | Out-Null

$moduleFiles = Get-ChildItem $ModulesDir -Filter "*.json" -File

foreach ($file in $moduleFiles) {
    Write-Host "Processing module: $($file.Name)"

    try {
        $module = Get-Content $file.FullName -Raw | ConvertFrom-Json
    } catch {
        Write-Error "Failed to parse JSON from ${file.FullName}: $_"
        continue
    }

    if (-not $module.lessons) {
        Write-Host "  No 'lessons' array in $($file.Name). Skipping."
        continue
    }

    foreach ($lesson in $module.lessons) {
        if (-not $lesson.id) { continue }

        $lessonPath = Join-Path $LessonsDir "$($lesson.id).json"
        $lesson | ConvertTo-Json -Depth 20 | Set-Content $lessonPath -Encoding UTF8
        Write-Host "  Lesson → $lessonPath"
    }
}

Write-Host "Module → lesson split complete."
