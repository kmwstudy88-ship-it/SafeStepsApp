param(
    [string]$LessonsDir = ".\lessons",
    [string]$SectionsDir = ".\sections"
)

Write-Host "=== Split-Lessons.ps1 ==="

if (-not (Test-Path $LessonsDir)) {
    Write-Error "Lessons directory not found: $LessonsDir"
    exit 1
}

New-Item -ItemType Directory -Path $SectionsDir -ErrorAction SilentlyContinue | Out-Null

$lessonFiles = Get-ChildItem $LessonsDir -Filter "*.json" -File

foreach ($file in $lessonFiles) {
    Write-Host "Processing lesson: $($file.Name)"

    try {
        $lesson = Get-Content $file.FullName -Raw | ConvertFrom-Json
    } catch {
        Write-Error "Failed to parse JSON from ${file.FullName}: $_"
        continue
    }

    if (-not $lesson.sections) {
        Write-Host "  No 'sections' array in $($file.Name). Skipping."
        continue
    }

    foreach ($section in $lesson.sections) {
        if (-not $section.id) { continue }

        $sectionPath = Join-Path $SectionsDir "$($section.id).json"
        $section | ConvertTo-Json -Depth 20 | Set-Content $sectionPath -Encoding UTF8
        Write-Host "  Section → $sectionPath"
    }
}

Write-Host "Lesson → section split complete."
