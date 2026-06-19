# ============================================
# SafeSteps Centralized Logger
# ============================================

param(
    [string]$Message,
    [string]$Level = "INFO"
)

$logDir = "C:\Users\SAFES\SafeStepsApp\logs"
$logFile = Join-Path $logDir "safesteps.log"

# Ensure log directory exists
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$entry = "[$timestamp] [$Level] $Message"

Add-Content -Path $logFile -Value $entry
