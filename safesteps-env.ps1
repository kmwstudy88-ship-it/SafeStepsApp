Write-Host "Loading SafeSteps environment..." -ForegroundColor Cyan

# Root folder
$SafeStepsRoot = "C:\Users\SAFES\SafeStepsApp"
Set-Location $SafeStepsRoot

# Ensure SafeStepsTools exists
$tools = Join-Path $SafeStepsRoot "SafeStepsTools"
if (-not (Test-Path $tools)) {
    New-Item -ItemType Directory -Force -Path $tools | Out-Null
    Write-Host "Created SafeStepsTools folder."
}

# Add SafeStepsTools to module path
if ($env:PSModulePath -notlike "*$tools*") {
    $env:PSModulePath = "$tools;$env:PSModulePath"
    Write-Host "Added SafeStepsTools to module path."
}

# Load CLI module if present
$cli = Join-Path $tools "SafeStepsCLI.psm1"
if (Test-Path $cli) {
    Import-Module $cli -Force
    Write-Host "SafeSteps CLI loaded."
} else {
    Write-Host "SafeSteps CLI not found. Continuing without CLI." -ForegroundColor Yellow
}

Write-Host "SafeSteps environment loaded."
