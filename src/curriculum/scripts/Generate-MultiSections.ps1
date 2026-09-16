param(
    [string]$LessonsDir  = ".\lessons",
    [string]$SectionsDir = ".\sections"
)

Write-Host "=== Generate-MultiSections.ps1 ==="

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

    # ⭐ REBUILD LESSON OBJECT
    $newLesson = [ordered]@{}
    foreach ($prop in $lesson.PSObject.Properties) {
        $newLesson[$prop.Name] = $prop.Value
    }

    # Ensure sections exists
    if (-not $newLesson.Contains("sections") -or
        $newLesson["sections"] -eq $null -or
        $newLesson["sections"] -isnot [System.Collections.IEnumerable]) {

        Write-Host "[FIX] Rebuilding 'sections' → $($lesson.id)"
        $newLesson["sections"] = @()
    }

    # If lesson already has multiple sections, skip
    if ($newLesson["sections"].Count -ge 3) {
        continue
    }

    # Generate 3–5 sections
    $count = Get-Random -Minimum 3 -Maximum 6
    $sectionList = @()

    for ($i = 1; $i -le $count; $i++) {

        $sectionId = "section_{0}_{1:00}" -f $lesson.id, $i
        $sectionPath = Join-Path $SectionsDir "$sectionId.json"

        Write-Host "[GEN] $sectionId"

        $sectionObj = [ordered]@{
            id      = $sectionId
            title   = "Section $i for $($lesson.id)"
            content = "Placeholder content. Add real content here."
        }

        # Save section file
        $sectionObj | ConvertTo-Json -Depth 20 | Set-Content $sectionPath -Encoding UTF8

        # Add reference
        $sectionList += @{ id = $sectionId }
    }

    # Replace lesson sections
    $newLesson["sections"] = $sectionList

    # Save rebuilt lesson
    $newLesson | ConvertTo-Json -Depth 20 | Set-Content $lf.FullName -Encoding UTF8
}

Write-Host "`nMulti-section generation complete."
