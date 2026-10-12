param(
    [string]$Version
)

Write-Host "=== SafeSteps Archive Engine ===" -ForegroundColor Cyan

$src="C:\SafeSteps\versions\$Version"
$dest="C:\SafeSteps\archive\$Version"

if(-not(Test-Path $src)){
    Write-Host "Version not found." -ForegroundColor Red
    exit
}

Copy-Item -Recurse -Force -Path $src -Destination $dest

Write-Host "Version archived: $dest" -ForegroundColor Green
