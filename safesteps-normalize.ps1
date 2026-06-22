param()

$toolsPath = Join-Path $PSScriptRoot "safesteps-tools.psm1"
Import-Module $toolsPath -Force

$paths = Get-SafeStepsCurriculumPaths
Write-SafeStepsLog -Message "Starting Curriculum Normalizer Engine" -Level "INFO"

function Load-JsonFiles($folder) {
    Get-ChildItem -Path $folder -Filter *.json -ErrorAction SilentlyContinue |
        ForEach-Object {
            try { 
                $json = Get-Content $_.FullName -Raw | ConvertFrom-Json
                return @{ file = $_.FullName; data = $json }
            } catch { }
        }
}

# Load everything
$programFiles = Load-JsonFiles $paths.Programs
$stageFiles   = Load-JsonFiles $paths.Stages
$weekFiles    = Load-JsonFiles $paths.Weeks
$lessonFiles  = Load-JsonFiles $paths.Lessons

$changes = @()

# -------------------------------
# Helper: Normalize ID
# -------------------------------
function Normalize-Id {
    param($text)

    if ($null -eq $text) { return "" }

    $clean = $text.ToLower()
    $clean = $clean.Replace(" ", "-")
    $clean = $clean.Replace("_", "-")
    $clean = $clean.Replace("---", "-")
    $clean = $clean.Trim("-")

    return $clean
}

# -------------------------------
# Normalize Programs
# -------------------------------
foreach ($p in $programFiles) {
    $oldId = $p.data.id
    $newId = Normalize-Id $oldId

    if ($oldId -ne $newId) {
        $changes += "Program ID changed: $oldId → $newId"
        $p.data.id = $newId
    }

    $p.data | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path $p.file
}

# -------------------------------
# Normalize Stages
# -------------------------------
foreach ($s in $stageFiles) {
    $oldId = $s.data.id
    $newId = Normalize-Id $oldId

    if ($oldId -ne $newId) {
        $changes += "Stage ID changed: $oldId → $newId"
        $s.data.id = $newId
    }

    # Normalize programId
    if ($s.data.programId) {
        $s.data.programId = Normalize-Id $s.data.programId
    }

    $s.data | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path $s.file
}

# -------------------------------
# Normalize Weeks
# -------------------------------
foreach ($w in $weekFiles) {
    $oldId = $w.data.id
    $newId = Normalize-Id $oldId

    if ($oldId -ne $newId) {
        $changes += "Week ID changed: $oldId → $newId"
        $w.data.id = $newId
    }

    if ($w.data.stageId) {
        $w.data.stageId = Normalize-Id $w.data.stageId
    }

    $w.data | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path $w.file
}

# -------------------------------
# Normalize Lessons
# -------------------------------
foreach ($l in $lessonFiles) {
    $oldId = $l.data.id
    $newId = Normalize-Id $oldId

    if ($oldId -ne $newId) {
        $changes += "Lesson ID changed: $oldId → $newId"
        $l.data.id = $newId
    }

    if ($l.data.weekId) {
        $l.data.weekId = Normalize-Id $l.data.weekId
    }

    $l.data | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path $l.file
}

# -------------------------------
# Rebuild master-index.json
# -------------------------------
$master = [PSCustomObject]@{
    programs = $programFiles.data.id
    stages   = $stageFiles.data.id
    weeks    = $weekFiles.data.id
    lessons  = $lessonFiles.data.id
}

$master | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path (Join-Path $paths.Root "master-index.json")

Write-Host "=== Curriculum Normalizer Completed ===" -ForegroundColor Cyan
Write-Host "Applied $($changes.Count) normalizations." -ForegroundColor Green

foreach ($c in $changes) {
    Write-Host " - $c" -ForegroundColor Yellow
}

Write-SafeStepsLog -Message "Curriculum Normalizer applied $($changes.Count) changes" -Level "INFO"
