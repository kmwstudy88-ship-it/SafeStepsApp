# ============================================================
# Generate-API.ps1
# SafeSteps Unified API Generator
# Includes: Curriculum + Programs + Community Programs
# ============================================================

Write-Host "Generating SafeSteps API..."

# -----------------------------
# 1. Load Curriculum
# -----------------------------
$curriculumPath = Join-Path $PSScriptRoot "..\data\curriculum.json"
$curriculum = $null

if (Test-Path $curriculumPath) {
    $curriculumJson = Get-Content -Path $curriculumPath -Raw
    $curriculum = $curriculumJson | ConvertFrom-Json
} else {
    Write-Host "WARNING: Curriculum file not found at $curriculumPath"
}

# -----------------------------
# 2. Load Program Index
# -----------------------------
$programIndexPath = Join-Path $PSScriptRoot "..\data\program-index.json"
$programIndex = $null

if (Test-Path $programIndexPath) {
    $programIndexJson = Get-Content -Path $programIndexPath -Raw
    $programIndex = $programIndexJson | ConvertFrom-Json
} else {
    Write-Host "WARNING: Program index not found at $programIndexPath"
}

# -----------------------------
# 3. Load Community Programs
# -----------------------------
$communityProgramsPath = Join-Path $PSScriptRoot "..\data\community-programs.json"
$communityPrograms = $null

if (Test-Path $communityProgramsPath) {
    $communityProgramsJson = Get-Content -Path $communityProgramsPath -Raw
    $communityPrograms = $communityProgramsJson | ConvertFrom-Json
} else {
    Write-Host "WARNING: Community programs file not found at $communityProgramsPath"
}

# -----------------------------
# 4. Build API Object
# -----------------------------
$api = [PSCustomObject]@{
    generatedAt        = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    curriculum         = $curriculum
    programIndex       = $programIndex
    communityPrograms  = $communityPrograms
}

# -----------------------------
# 5. Ensure output folder exists
# -----------------------------
$outPath = Join-Path $PSScriptRoot "..\out"
if (-not (Test-Path $outPath)) {
    New-Item -ItemType Directory -Path $outPath | Out-Null
}

# -----------------------------
# 6. Save API JSON
# -----------------------------
$apiOutput = Join-Path $outPath "api.json"
$api | ConvertTo-Json -Depth 20 | Set-Content -Path $apiOutput -Encoding UTF8

Write-Host "API generated successfully at $apiOutput"
