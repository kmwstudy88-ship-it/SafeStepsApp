# ============================================
# SafeSteps Curriculum Engine - Master Runner
# ============================================

Write-Host "=== SafeSteps Curriculum Engine: RUN STARTED ===" -ForegroundColor Cyan

# -----------------------------
# 1. Ensure folder structure
# -----------------------------
$folders = @(
    "tracks",
    "topics",
    "courses",
    "lessons",
    "logs"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder | Out-Null
        Write-Host "Created folder: $folder"
    } else {
        Write-Host "Folder exists: $folder"
    }
}

# -----------------------------
# 2. Run all generator scripts
# -----------------------------
Write-Host "`n=== Running Generator Scripts ===" -ForegroundColor Yellow

$scriptFiles = Get-ChildItem -Path "." -Filter "*.ps1" | Where-Object {
    $_.Name -ne "run-all.ps1"
}

foreach ($script in $scriptFiles) {
    Write-Host "`nRunning: $($script.Name)" -ForegroundColor Green
    try {
        pwsh -ExecutionPolicy Bypass -File $script.FullName
        Write-Host "✔ Completed: $($script.Name)" -ForegroundColor Green
    }
    catch {
        Write-Host "✖ Error running $($script.Name): $_" -ForegroundColor Red
    }
}

# -----------------------------
# 3. Validate JSON files
# -----------------------------
Write-Host "`n=== Validating JSON Files ===" -ForegroundColor Yellow

$allJson = Get-ChildItem -Recurse -Filter "*.json"

foreach ($file in $allJson) {
    try {
        Get-Content $file.FullName | ConvertFrom-Json | Out-Null
        Write-Host "✔ Valid JSON: $($file.FullName)" -ForegroundColor Green
    }
    catch {
        Write-Host "✖ INVALID JSON: $($file.FullName)" -ForegroundColor Red
    }
}

# -----------------------------
# 4. Write log
# -----------------------------
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "logs/run-$timestamp.log"

"Run completed at $timestamp" | Out-File $logFile

Write-Host "`nLog saved to: $logFile" -ForegroundColor Cyan

# -----------------------------
# DONE
# -----------------------------
Write-Host "`n=== SafeSteps Curriculum Engine: RUN COMPLETE ===" -ForegroundColor Cyan
