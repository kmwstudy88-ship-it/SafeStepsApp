param(
    [string]$Version
)

Write-Host "=== SafeSteps Snapshot Engine v2 ===" -ForegroundColor Cyan

$src="C:\SafeSteps\versions\$Version"
$dest="C:\SafeSteps\snapshots\$Version-$(Get-Date -Format yyyyMMdd-HHmmss)"

Copy-Item -Recurse -Force -Path $src -Destination $dest

Write-Host "Snapshot created: $dest" -ForegroundColor Green
