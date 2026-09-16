# Path to your master topic registry
$registryPath = "C:\Users\SAFES\safesteps-curriculum\core\topics.master.json"

# Path where topic files will be created
$topicsFolder = "C:\Users\SAFES\safesteps-curriculum\topics"

# Ensure the topics folder exists
New-Item -ItemType Directory -Force -Path $topicsFolder | Out-Null

# Load the master registry
$topics = Get-Content $registryPath -Raw | ConvertFrom-Json

foreach ($topic in $topics) {

    $fileName = "$($topic.id).json"
    $filePath = Join-Path $topicsFolder $fileName

    # If file already exists, skip it safely
    if (Test-Path $filePath) {
        Write-Host "⚠️  Skipped (already exists): $fileName"
        continue
    }

    # Create a new empty file
    New-Item -ItemType File -Path $filePath -Force | Out-Null
    Write-Host "✔️  Created: $fileName"
}

Write-Host "`nDone. No existing files were overwritten."
