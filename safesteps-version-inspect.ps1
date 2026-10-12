param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

$versionRoot = "C:\SafeSteps\versions"
$versionPath = Join-Path $versionRoot $Version

if (-not (Test-Path $versionPath)) {
    Write-Host "Version $Version not found." -ForegroundColor Red
    exit
}

$versionFile = Join-Path $versionPath "version.json"
$notesFile   = Join-Path $versionPath "release-notes.md"

if (-not (Test-Path $versionFile)) {
    Write-Host "version.json missing for $Version" -ForegroundColor Red
    exit
}

$meta = Get-Content $versionFile -Raw | ConvertFrom-Json

Write-Host "=== SafeSteps Version Inspect ===" -ForegroundColor Cyan
Write-Host "Version:    $($meta.version)"
Write-Host "Created:    $($meta.createdAt)"
Write-Host "Notes:      $($meta.notes)"
Write-Host "Programs:   $($meta.curriculum.programs)"
Write-Host "Stages:     $($meta.curriculum.stages)"
Write-Host "Weeks:      $($meta.curriculum.weeks)"
Write-Host "Lessons:    $($meta.curriculum.lessons)"

if (Test-Path $notesFile) {
    Write-Host ""
    Write-Host "Release Notes:" -ForegroundColor Yellow
    Get-Content $notesFile | ForEach-Object { Write-Host $_ }
}
