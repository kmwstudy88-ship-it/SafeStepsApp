param(
    [string]$Root="C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Cloud Backup Engine ===" -ForegroundColor Cyan

$out="C:\SafeSteps\cloud-backup"
if(-not(Test-Path $out)){New-Item -ItemType Directory -Path $out|Out-Null}

$timestamp=(Get-Date).ToString("yyyyMMdd-HHmmss")
$dest=Join-Path $out "backup-$timestamp"

Copy-Item -Recurse -Force -Path $Root -Destination $dest

Write-Host "Cloud backup created: $dest" -ForegroundColor Green
