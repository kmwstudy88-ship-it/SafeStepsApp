param(
    [Parameter(Mandatory=$true)]
    [string]$Version,

    [Parameter(Mandatory=$true)]
    [string]$BranchName
)

$versionRoot = "C:\SafeSteps\versions"
$branchRoot  = "C:\SafeSteps\branches"

$versionPath = Join-Path $versionRoot $Version
$branchPath  = Join-Path $branchRoot $BranchName

if (-not (Test-Path $versionPath)) {
    Write-Host "Version $Version not found." -ForegroundColor Red
    exit
}

if (-not (Test-Path $branchRoot)) {
    New-Item -ItemType Directory -Path $branchRoot | Out-Null
}

Copy-Item -Recurse -Path "$versionPath\curriculum" -Destination "$branchPath\curriculum" -Force

Write-Host "Branch '$BranchName' created from version $Version" -ForegroundColor Green
