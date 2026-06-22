param(
    [string]$Package,
    [string]$DeployPath="C:\SafeSteps\deployed"
)

Write-Host "=== SafeSteps Deployment Engine ===" -ForegroundColor Cyan

if(-not(Test-Path $DeployPath)){New-Item -ItemType Directory -Path $DeployPath|Out-Null}

Copy-Item -Force -Path $Package -Destination $DeployPath

Write-Host "Package deployed to $DeployPath" -ForegroundColor Green
