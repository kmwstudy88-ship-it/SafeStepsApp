# -----------------------------------------
# SafeSteps AOD Course - Auto JSON Generator
# -----------------------------------------

# Target folder for weekly JSON files
$targetPath = "C:\Users\SAFES\safesteps-curriculum\packages\content-courses\subject-lessons\v1.0.0\lessons"

# Ensure folder exists
if (!(Test-Path $targetPath)) {
    New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
}

# Function to write a weekly JSON file
function Write-AODWeek {
    param(
        [int]$Week,
        [string]$Topic,
        [string]$Json
    )

    # Clean topic for filename
    $safeTopic = $Topic -replace ' ', '-' -replace '[^a-zA-Z0-9\-]', ''
    $fileName = "AOD-Week-$Week-$safeTopic.json"
    $filePath = Join-Path $targetPath $fileName

    # Write file
    $Json | Set-Content -Path $filePath -Encoding UTF8

    Write-Host "Created: $fileName"
}

# -------------------------------
# WEEK 1 JSON
# -------------------------------
$week1 = @'
PASTE WEEK 1 JSON ARRAY HERE
'@
Write-AODWeek -Week 1 -Topic "Understanding Substance Use" -Json $week1

# -------------------------------
# WEEK 2 JSON
# -------------------------------
$week2 = @'
PASTE WEEK 2 JSON ARRAY HERE
'@
Write-AODWeek -Week 2 -Topic "Cravings and Coping" -Json $week2

# -------------------------------
# WEEK 3 JSON
# -------------------------------
$week3 = @'
PASTE WEEK 3 JSON ARRAY HERE
'@
Write-AODWeek -Week 3 -Topic "Emotional Regulation" -Json $week3

# -------------------------------
# WEEK 4 JSON
# -------------------------------
$week4 = @'
PASTE WEEK 4 JSON ARRAY HERE
'@
Write-AODWeek -Week 4 -Topic "Withdrawal, Detox & StabilisationE" -Json $week4

# -------------------------------
# Repeat for Weeks 5–12
# -------------------------------
