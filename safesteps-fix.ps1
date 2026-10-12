param()

$toolsPath = Join-Path $PSScriptRoot "safesteps-tools.psm1"
Import-Module $toolsPath -Force

$paths = Get-SafeStepsCurriculumPaths
Write-SafeStepsLog -Message "Starting Auto-Fixer v4.5 (recursive)" -Level "INFO"

# Recursively load ALL lesson files
$lessonFiles = Get-ChildItem -Path $paths.Lessons -Recurse -Include *.json, *.lesson.json -ErrorAction SilentlyContinue

$fixes = @()

function Ensure-Field {
    param($obj, $field, $default, $label)
    if (-not $obj.PSObject.Properties.Name.Contains($field)) {
        $obj | Add-Member -NotePropertyName $field -NotePropertyValue $default
        $fixes += "$label '$($obj.id)' → added missing field '$field'"
    }
}

foreach ($file in $lessonFiles) {
    try {
        $json = Get-Content $file.FullName -Raw | ConvertFrom-Json
    }
    catch {
        Write-Host "❌ Invalid JSON: $($file.FullName)" -ForegroundColor Red
        continue
    }

    # Repair missing fields
    Ensure-Field $json "id"      ([IO.Path]::GetFileNameWithoutExtension($file.Name)) "Lesson"
    Ensure-Field $json "title"   "Untitled Lesson" "Lesson"
    Ensure-Field $json "content" "Content pending" "Lesson"
    Ensure-Field $json "weekId"  "unknown_week"    "Lesson"

    # Save repaired file
    $json | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path $file.FullName
}

# Rebuild master index
$master = [PSCustomObject]@{
    programs = (Get-ChildItem $paths.Programs -Filter *.json).Name
    stages   = (Get-ChildItem $paths.Stages   -Filter *.json).Name
    weeks    = (Get-ChildItem $paths.Weeks    -Filter *.json).Name
    lessons  = $lessonFiles.Name
}

$master | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path (Join-Path $paths.Root "master-index.json")

Write-Host "=== Auto-Fixer v4.5 Completed ===" -ForegroundColor Cyan
Write-Host "Applied $($fixes.Count) fixes." -ForegroundColor Green

foreach ($f in $fixes) {
    Write-Host " - $f" -ForegroundColor Yellow
}

Write-SafeStepsLog -Message "Auto-Fixer v4.5 applied $($fixes.Count) fixes" -Level "INFO"
