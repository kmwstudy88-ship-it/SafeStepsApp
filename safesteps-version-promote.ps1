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

$configFile = Join-Path $PSScriptRoot "safesteps.version.json"

$meta = [PSCustomObject]@{
    currentVersion = $Version
    updatedAt      = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
}

$meta | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 -Path $configFile

Write-Host "Current curriculum version set to $Version" -ForegroundColor Green
