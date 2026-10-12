param(
    [string]$Version = "1.0"
)

Write-Host "=== SafeSteps Curriculum Packaging Engine ===" -ForegroundColor Cyan

$versionRoot = "C:\SafeSteps\versions"
$versionPath = Join-Path $versionRoot $Version

if (-not (Test-Path $versionPath)) {
    Write-Host "Version $Version not found." -ForegroundColor Red
    exit
}

$curriculumPath = Join-Path $versionPath "curriculum"

$packageRoot = "C:\SafeSteps\packages"
if (-not (Test-Path $packageRoot)) {
    New-Item -ItemType Directory -Path $packageRoot | Out-Null
}

$zipName = "SafeSteps-Curriculum-v$Version.zip"
$zipPath = Join-Path $packageRoot $zipName

if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}

Add-Type -AssemblyName System.IO.Compression.FileSystem

[System.IO.Compression.ZipFile]::CreateFromDirectory($versionPath, $zipPath)

Write-Host "Package created: $zipPath" -ForegroundColor Green
