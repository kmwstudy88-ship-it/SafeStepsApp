param(
    [Parameter(Position = 0, Mandatory = $true)]
    [string]$Command,

    [Parameter(Position = 1)]
    [string]$Arg1,

    [Parameter(Position = 2)]
    [string]$Arg2
)

$ErrorActionPreference = "Stop"

Write-Host "=== SafeSteps CLI ===" -ForegroundColor Cyan

try {
    $root = Split-Path -Parent $MyInvocation.MyCommand.Path

    $envFile    = Join-Path $root "safesteps-env.ps1"
    $engineFile = Join-Path $root "safesteps-engine.ps1"
    $toolsFile  = Join-Path $root "safesteps-tools.psm1"

    if (-not (Test-Path $envFile))    { throw "Missing safesteps-env.ps1" }
    if (-not (Test-Path $engineFile)) { throw "Missing safesteps-engine.ps1" }
    if (-not (Test-Path $toolsFile))  { throw "Missing safesteps-tools.psm1" }

    . $envFile
    Import-Module $toolsFile -Force

    Write-SafeStepsLog -Message "CLI invoked: $Command $Arg1 $Arg2"

    . $engineFile -Command $Command -Arg1 $Arg1 -Arg2 $Arg2

    Write-Host "✔ SafeSteps command completed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ SafeSteps Error" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-SafeStepsLog -Message "ERROR: $($_.Exception.Message)" -Level "ERROR"
    exit 1
}
