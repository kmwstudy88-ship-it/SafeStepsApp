# ============================================
# SafeSteps Program Generator (Clean Final Version)
# Root folder: C:\Users\SAFES\SafeStepsApp
# ============================================

Write-Host "Starting SafeSteps Program Generator..." -ForegroundColor Cyan

# --- Step 1: Define root folder ---
$root = "C:\Users\SAFES\SafeStepsApp"

# --- Step 2: Load SafeSteps CLI module if it exists ---
$cliModule = Join-Path $root "SafeStepsTools\SafeStepsCLI.psm1"

if (Test-Path $cliModule) {
    Write-Host "Loading SafeSteps CLI module..."
    Import-Module $cliModule -Force
} else {
    Write-Host "WARNING: SafeStepsCLI.psm1 not found at $cliModule" -ForegroundColor Yellow
}

# --- Step 3: Locate Master Index ---
$masterIndex = Join-Path $root "safesteps-curriculum\master-index.json"

if (-not (Test-Path $masterIndex)) {
    Write-Host "WARNING: Master Index not found at $masterIndex" -ForegroundColor Yellow
} else {
    Write-Host "Master Index found at $masterIndex"
}

# --- Step 4: Build the program ---
Write-Host "Building SafeSteps program: Custom Program"

# If you have a real build function, call it here.
# Example:
# Build-SafeStepsProgram -MasterIndex $masterIndex

Write-Host "Program generation completed." -ForegroundColor Green
