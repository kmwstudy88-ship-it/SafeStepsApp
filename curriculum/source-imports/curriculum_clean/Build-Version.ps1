# SafeSteps Version Builder

$root = Get-Location
$versionFile = Join-Path $root "version.json"
$version = Get-Content $versionFile | ConvertFrom-Json

$versionTag = "v$($version.major).$($version.minor).$($version.patch)"
$versionFolder = Join-Path $root "versions\$versionTag"

if (-not (Test-Path $versionFolder)) {
    New-Item -ItemType Directory -Path $versionFolder | Out-Null
}

# Copy curriculum index
Copy-Item -Path "$root\curriculum.json" -Destination $versionFolder -Force

# Copy all lessons
Copy-Item -Path "$root\*" -Include *.ps1 -Recurse -Destination $versionFolder -Force

Write-Host "Version build created at:"
Write-Host $versionFolder
