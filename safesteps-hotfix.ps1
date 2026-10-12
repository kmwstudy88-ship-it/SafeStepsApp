param(
    [string]$PatchFolder,
    [string]$Target="C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Hotfix Engine ===" -ForegroundColor Cyan

Copy-Item -Recurse -Force -Path $PatchFolder -Destination $Target

Write-Host "Hotfix applied from $PatchFolder" -ForegroundColor Green
