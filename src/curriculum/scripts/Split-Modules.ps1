param(
    [string]$ModulesDir = ".\modules",
    [string]$LessonsDir = ".\lessons"
)

Write-Host "=== Split-Modules.ps1 ==="

if (-not (Test-Path $ModulesDir)) {
    Write-Error "Modules directory not found: $ModulesDir"
    exit 1
}

$null = New-Item -ItemType Directory -Path $LessonsDir -ErrorAction SilentlyContinue

$moduleFiles = Get-ChildItem $ModulesDir -Filter "*.json" -File
if (-not $moduleFiles) {
    Write-Warning "No module JSON files found in $ModulesDir."
    exit 0
}

foreach ($file in $moduleFiles) {
    Write-Host "Processing module file: $($file.Name)"

    try {
        $module = Get-Content $file.FullName -Raw | ConvertFrom-Json
    } catch {
        Write-Error "Failed to parse JSON from $($file.FullName): $_"
        continue
    }

    if (-not $module.lessons) {
        Write-Host "  No 'lessons' array in $($file.Name). Skipping."
        continue
    }

    foreach ($lesson in $module.lessons) {
        if (-not $lesson.id) {
            Write-Warning "  Skipping lesson with no 'id' in $($file.Name)."
            continue
        }

        $lessonPath = Join-Path $LessonsDir "$($lesson.id).json"
        $lesson | ConvertTo-Json -Depth 20 | Set-Content $lessonPath -Encoding UTF8
        Write-Host "  Lesson → $lessonPath"
    }
}

Write-Host "Module → lesson split complete."
