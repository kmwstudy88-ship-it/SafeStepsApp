param(
    [string]$Root="C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Sandbox Engine ===" -ForegroundColor Cyan

$out="C:\SafeSteps\sandbox"
if(Test-Path $out){Remove-Item -Recurse -Force $out}

Copy-Item -Recurse -Force -Path $Root -Destination $out

Write-Host "Sandbox created: $out" -ForegroundColor Green
