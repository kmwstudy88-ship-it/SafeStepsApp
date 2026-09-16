param(
    [string]$LessonsDir  = ".\lessons",
    [string]$SectionsDir = ".\sections"
)

Write-Host "=== Generate-SectionFiles.ps1 ==="

function Load-JsonSafe {
    param([string]$Path)
    try {
        return (Get-Content $Path -Raw | ConvertFrom-Json)
    }
    catch {
        Write-Warning "Malformed JSON → $Path"
        return $null
    }
}

# Ensure sections directory exists
New-Item -ItemType Directory -Path $SectionsDir -ErrorAction SilentlyContinue | Out-Null

$lessonFiles = Get-ChildItem $LessonsDir -Filter *.json

foreach ($lf in $lessonFiles) {

    $lesson = Load-JsonSafe $lf.FullName
    if (-not $lesson) { continue }

    if (-not $lesson.id) {
        Write-Warning "[LESSON] $($lf.Name) missing 'id'"
        continue
    }

    # ⭐ REBUILD LESSON OBJECT (fixes immutability)
    $newLesson = [ordered]@{}
    foreach ($prop in $lesson.PSObject.Properties) {
        $newLesson[$prop.Name] = $prop.Value
    }

    # Ensure sections exists and is valid
    if (-not $newLesson.Contains("sections") -or
        $newLesson["sections"] -eq $null -or
        $newLesson["sections"] -isnot [System.Collections.IEnumerable]) {

        Write-Host "[FIX] Rebuilding 'sections' → $($lesson.id)"
        $newLesson["sections"] = @()
    }

    # If lesson already has sections, skip
    if ($newLesson["sections"].Count -gt 0) {
        continue
    }

    # Create default section
    $sectionId = "section_{0}_01" -f $lesson.id
    $sectionPath = Join-Path $SectionsDir "$sectionId.json"

    Write-Host "[LINK] Lesson $($lesson.id) → section $sectionId"

    $sectionObj = [ordered]@{
        id      = $sectionId
        title   = "Section for $($lesson.id)"
        content = "Placeholder content. Add real content here."
    }

    # Save section file
    $sectionObj | ConvertTo-Json -Depth 20 | Set-Content $sectionPath -Encoding UTF8

    # Add reference
    $newLesson["sections"] = @(@{ id = $sectionId })

    # Save rebuilt lesson
    $newLesson | ConvertTo-Json -Depth 20 | Set-Content $lf.FullName -Encoding UTF8
}

Write-Host "`nSection file generation complete."
