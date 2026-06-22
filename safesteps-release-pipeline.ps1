param(
    [string]$Version
)

Write-Host "=== SafeSteps Release Pipeline ===" -ForegroundColor Cyan

& .\safesteps-version.ps1 -Version $Version
& .\safesteps-diff.ps1
& .\safesteps-validate-v2.ps1
& .\safesteps-package.ps1 -Version $Version

Write-Host "Release pipeline complete for version $Version" -ForegroundColor Green
