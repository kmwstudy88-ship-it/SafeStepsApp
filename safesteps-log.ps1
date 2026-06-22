param(
    [Parameter(Mandatory=$true)][string]$Message,
    [string]$Level = "INFO"
)

$toolsPath = Join-Path $PSScriptRoot "safesteps-tools.psm1"
if (-not (Test-Path $toolsPath)) {
    throw "Tools module not found at $toolsPath"
}

Import-Module $toolsPath -Force

Write-SafeStepsLog -Message $Message -Level $Level
