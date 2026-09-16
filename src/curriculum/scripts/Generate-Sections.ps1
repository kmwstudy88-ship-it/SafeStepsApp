param(
    [string]$LessonsDir = ".\lessons",
    [string]$SectionsDir = ".\sections"
)

Write-Host "=== Generate-Sections.ps1 ==="

function Load-Json {
    param([string]$Path)
    try {
        return (Get-Content $Path -Raw | ConvertFrom-Json)
    }
    catch {
        Write-Warning "Malformed JSON: $Path"
        return $null
    }
}

# Ensure sections directory exists
New-Item -ItemType Directory -Path $SectionsDir -ErrorAction SilentlyContinue | Out-Null

$lessonFiles = Get-ChildItem $LessonsDir -Filter *.json

foreach ($lf in $lessonFiles) {

    $lesson = Load-Json $lf.FullName
    if (-not $lesson) { continue }

    # Ensure lesson has an ID
    if (-not $lesson.id) {
        Write-Warning "[LESSON] $($lf.Name) missing 'id'"
        continue
    }

    # Build a NEW object with all existing properties
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

    # Convert back to JSON and save
    $newLesson | ConvertTo-Json -Depth 20 | Set-Content $lf.FullName -Encoding UTF8
}

Write-Host "`nSection generation complete."
