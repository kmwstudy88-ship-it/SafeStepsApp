# ============================================
# SafeSteps Repair Script (Clean Final Version)
# Root folder: C:\Users\SAFES\SafeStepsApp
# ============================================

Write-Host "Starting SafeSteps Repair..." -ForegroundColor Cyan

# --- Step 1: Define root folder ---
$root = "C:\Users\SAFES\SafeStepsApp"

# --- Step 2: Ensure log folder exists ---
$logFolder = Join-Path $root "SafeStepsTools"
if (-not (Test-Path $logFolder)) {
    New-Item -ItemType Directory -Force -Path $logFolder | Out-Null
}

$logPath = Join-Path $logFolder "SafeSteps.log"

# --- Step 3: Program generator script ---
$programScript = Join-Path $root "Generate-Program.ps1"

Write-Host "Running SafeSteps program generator..."
if (Test-Path $programScript) {
    & $programScript
} else {
    Write-Host "ERROR: Generate-Program.ps1 not found at $programScript" -ForegroundColor Red
}

# --- Step 4: Write log entry ---
"[$(Get-Date)] SafeSteps repair completed successfully." | Out-File $logPath -Append

Write-Host "SafeSteps Repair Completed." -ForegroundColor Green
