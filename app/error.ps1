# ============================================
# SafeSteps Error Reporter
# ============================================

param(
    [string]$Message,
    [string]$ScriptName = "unknown"
)

$logDir = "C:\Users\SAFES\SafeStepsApp\logs"
$errorFile = Join-Path $logDir "safesteps-errors.log"
$lastErrorFile = Join-Path $logDir "last-error.txt"

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$entry = "[$timestamp] [$ScriptName] ERROR: $Message"

# Write to error log
Add-Content -Path $errorFile -Value $entry

# Overwrite last-error file
Set-Content -Path $lastErrorFile -Value $entry

Write-Host "❌ SafeSteps Error: $Message