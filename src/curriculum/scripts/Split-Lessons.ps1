param(
    [string]$LessonsDir = ".\lessons",
    [string]$SectionsDir = ".\sections"
)

Write-Host "=== Split-Lessons.ps1 ==="

if (-not (Test-Path $LessonsDir)) {
    Write-Error "Lessons directory not found: $LessonsDir"
    exit 1
}

$null = New-Item -ItemType Directory -Path $SectionsDir -ErrorAction SilentlyContinue

$lessonFiles = Get-ChildItem $LessonsDir -Filter "*.json" -File
if (-not $lessonFiles) {
    Write-Warning "No lesson JSON files found in $LessonsDir."
    exit 0
}

foreach ($file in $lessonFiles) {
    Write-Host "Processing lesson file: $($file.Name)"

    try {
        $lesson = Get-Content $file.FullName -Raw | ConvertFrom-Json
    } catch {
        Write-Error "Failed to parse JSON from $($file.FullName): $_"
        continue
    }

    if (-not $lesson.sections) {
        Write-Host "  No 'sections' array in $($file.Name). Skipping."
        continue
    }

    foreach ($section in $lesson.sections) {
        if (-not $section.id) {
            Write-Warning "  Skipping section with no 'id' in $($file.Name)."
            continue
        }

        $sectionPath = Join-Path $SectionsDir "$($section.id).json"
        $section | ConvertTo-Json -Depth 20 | Set-Content $sectionPath -Encoding UTF8
        Write-Host "  Section → $sectionPath"
    }
}

Write-Host "Lesson → section split complete."
