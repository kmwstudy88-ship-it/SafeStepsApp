param(
    [Parameter(Mandatory=$true)]
    [string]$Version,

    [string]$Notes = ""
)

# -----------------------------------------
# SAFE STEPS ROOT (HARD-CODED FOR RELIABILITY)
# -----------------------------------------
$SafeStepsRoot = "C:\Users\SAFES\SafeStepsApp"

# Curriculum source folder
$curriculumSource = Join-Path $SafeStepsRoot "curriculum"

if (-not (Test-Path $curriculumSource)) {
    Write-Host "ERROR: Curriculum folder not found at $curriculumSource" -ForegroundColor Red
    exit
}

# -----------------------------------------
# VERSION ROOT
# -----------------------------------------
$versionRoot = "C:\SafeSteps\versions"
if (-not (Test-Path $versionRoot)) {
    New-Item -ItemType Directory -Path $versionRoot | Out-Null
}

# Version folder
$versionPath = Join-Path $versionRoot $Version
if (Test-Path $versionPath)) {
    Write-Host "Version $Version already exists." -ForegroundColor Red
    exit
}

New-Item -ItemType Directory -Path $versionPath | Out-Null

# -----------------------------------------
# COPY CURRICULUM
# -----------------------------------------
$curriculumDest = Join-Path $versionPath "curriculum"
Copy-Item -Recurse -Path $curriculumSource -Destination $curriculumDest -Force

# -----------------------------------------
# BUILD METADATA
# -----------------------------------------
$metadata = [PSCustomObject]@{
    version   = $Version
    createdAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    notes     = $Notes
    curriculum = @{
        programs = (Get-ChildItem "$curriculumDest\programs" -Filter *.json).Count
        stages   = (Get-ChildItem "$curriculumDest\stages" -Filter *.json).Count
        weeks    = (Get-ChildItem "$curriculumDest\weeks" -Filter *.json).Count
        lessons  = (Get-ChildItem "$curriculumDest\lessons" -Filter *.json).Count
    }
}

$metadata | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path (Join-Path $versionPath "version.json")

# -----------------------------------------
# FIND PREVIOUS VERSION
# -----------------------------------------
$existingVersions = Get-ChildItem $versionRoot | Sort-Object Name
$previous = $null

foreach ($v in $existingVersions) {
    if ($v.Name -ne $Version) {
        $previous = $v.Name
    }
}

# -----------------------------------------
# RUN DIFF
# -----------------------------------------
if ($previous) {
    Write-Host "Comparing with previous version: $previous" -ForegroundColor Yellow

    $diffScript = Join-Path $SafeStepsRoot "safesteps-diff.ps1"

    $oldPath = Join-Path $versionRoot $previous
    $newPath = $versionPath

    & $diffScript -OldPath "$oldPath\curriculum" -NewPath "$newPath\curriculum"

    Copy-Item -Path "$SafeStepsRoot\diff\curriculum-diff.json" -Destination (Join-Path $versionPath "diff.json") -Force
}

Write-Host "=== Version $Version Created Successfully ===" -ForegroundColor Green
Write-Host "Snapshot stored at: $versionPath" -ForegroundColor Cyan
