# SafeSteps Version Bump Script

$versionFile = "version.json"
$version = Get-Content $versionFile | ConvertFrom-Json

param(
    [ValidateSet("major","minor","patch")]
    [string]$Type = "patch"
)

switch ($Type) {
    "major" {
        $version.major++
        $version.minor = 0
        $version.patch = 0
    }
    "minor" {
        $version.minor++
        $version.patch = 0
    }
    "patch" {
        $version.patch++
    }
}

$version | ConvertTo-Json | Set-Content $versionFile -Encoding UTF8

Write-Host "Version updated to $($version.major).$($version.minor).$($version.patch)"
