# =====================================================================
# SAFE STEPS — PACKAGING & DEPLOYMENT ENGINE
# Creates a versioned ZIP package of the entire curriculum
# =====================================================================

param(
    [string]$Version = "v1.0.0",
    [string]$Name = "safesteps"
)

$Root       = Get-Location
$Dist       = Join-Path $Root "dist"
$Programs   = Join-Path $Root "programs"
$Courses    = Join-Path $Root "courses"
$Lessons    = Join-Path $Root "lessons"
$Sections   = Join-Path $Root "sections"
$Topics     = Join-Path $Root "topics"
$Tracks     = Join-Path $Root "tracks"

# Ensure dist folder exists
if (-not (Test-Path $Dist)) {
    New-Item -ItemType Directory -Path $Dist | Out-Null
}

# Timestamp
$Timestamp = (Get-Date).ToString("yyyy-MM-dd-HH-mm-ss")

# Output file
$PackageName = "$Name-$Version-$Timestamp.zip"
$PackagePath = Join-Path $Dist $PackageName

Write-Host "`n=== SAFE STEPS — PACKAGING ENGINE ==="
Write-Host "Creating package: $PackageName`n"

# Temporary staging folder
$Temp = Join-Path $Dist "temp-package"
if (Test-Path $Temp) { Remove-Item $Temp -Recurse -Force }
New-Item -ItemType Directory -Path $Temp | Out-Null

# Copy curriculum folders
$Folders = @($Programs, $Courses, $Lessons, $Sections, $Topics, $Tracks)

foreach ($Folder in $Folders) {
    if (Test-Path $Folder) {
        Copy-Item -Path $Folder -Destination $Temp -Recurse -Force
    }
}

# Create manifest
$Manifest = @{
    name      = $Name
    version   = $Version
    timestamp = $Timestamp
    source    = $Root
    contents  = $Folders | Where-Object { Test-Path $_ }
}

$Manifest | ConvertTo-Json -Depth 10 | Out-File (Join-Path $Temp "manifest.json") -Encoding utf8

# Create ZIP
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($Temp, $PackagePath)

# Cleanup
Remove-Item $Temp -Recurse -Force

Write-Host "Package created successfully."
Write-Host "Location: $PackagePath`n"
