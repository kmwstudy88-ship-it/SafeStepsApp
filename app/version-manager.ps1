# ============================================
# SafeSteps Version Manager
# ============================================

param(
    [string]$Action = "increment",
    [string]$Type = "patch"   # patch | minor | major
)

$versionFile = "C:\Users\SAFES\SafeStepsApp\safesteps.version.json"

if (-not (Test-Path $versionFile)) {
    Write-Host "Version file missing."
    exit 1
}

# Load version file
$json = Get-Content $versionFile -Raw | ConvertFrom-Json

$current = $json.version
$parts = $current.Split('.')

$major = [int]$parts[0]
$minor = [int]$parts[1]
$patch = [int]$parts[2]

switch ($Type) {
    "major" { $major++; $minor = 0; $patch = 0 }
    "minor" { $minor++; $patch = 0 }
    "patch" { $patch++ }
}

$newVersion = "$major.$minor.$patch"

# Update JSON
$json.version = $newVersion

# Add history entry
$entry = [ordered]@{
    timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    from      = $current
    to        = $newVersion
}

$json.history += $entry

# Save
$json | ConvertTo-Json -Depth 10 | Set-Content $versionFile

Write-Host "SafeSteps version updated: $current → $newVersion"
