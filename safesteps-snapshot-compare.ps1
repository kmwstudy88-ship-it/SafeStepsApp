param(
    [Parameter(Mandatory=$true)]
    [string]$VersionA,

    [Parameter(Mandatory=$true)]
    [string]$VersionB
)

$versionRoot = "C:\SafeSteps\versions"

$pathA = Join-Path $versionRoot $VersionA
$pathB = Join-Path $versionRoot $VersionB

if (-not (Test-Path $pathA)) { Write-Host "Version $VersionA not found." -ForegroundColor Red; exit }
if (-not (Test-Path $pathB)) { Write-Host "Version $VersionB not found." -ForegroundColor Red; exit }

$diffScript = Join-Path $PSScriptRoot "safesteps-diff.ps1"

& $diffScript -OldPath "$pathA\curriculum" -NewPath "$pathB\curriculum"

$compareOut = Join-Path $versionRoot "snapshot-compare-$VersionA-to-$VersionB.json"
Copy-Item -Path "$PSScriptRoot\diff\curriculum-diff.json" -Destination $compareOut -Force

Write-Host "Snapshot comparison complete: $compareOut" -ForegroundColor Green
