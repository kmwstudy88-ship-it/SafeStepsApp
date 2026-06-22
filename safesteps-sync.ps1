param(
    [string]$Source="C:\Users\SAFES\SafeStepsApp\curriculum",
    [string]$Destination="C:\SafeSteps\sync"
)

Write-Host "=== SafeSteps Sync Engine ===" -ForegroundColor Cyan

if(-not(Test-Path $Destination)){New-Item -ItemType Directory -Path $Destination|Out-Null}

Copy-Item -Recurse -Force -Path $Source -Destination $Destination

Write-Host "Curriculum synced to $Destination" -ForegroundColor Green
