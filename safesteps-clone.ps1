param(
    [string]$SourceVersion,
    [string]$NewVersion
)

Write-Host "=== SafeSteps Clone Engine ===" -ForegroundColor Cyan

$src="C:\SafeSteps\versions\$SourceVersion"
$dest="C:\SafeSteps\versions\$NewVersion"

Copy-Item -Recurse -Force -Path $src -Destination $dest

Write-Host "Version cloned: $SourceVersion → $NewVersion" -ForegroundColor Green
