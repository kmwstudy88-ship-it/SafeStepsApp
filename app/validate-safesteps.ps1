# ============================================
# SafeSteps Validation Script
# ============================================

Write-Host "Running SafeSteps validation..."

$errors = @()

# 1. Validate core folders
$requiredFolders = @(
    "safesteps",
    "safesteps\assets",
    "SafeStepsLibrary",
    "SafeStepsLibrary\Courses"
)

foreach ($folder in $requiredFolders) {
    if (-not (Test-Path $folder)) {
        $errors += "Missing folder: $folder"
    }
}

# 2. Validate course index JSON
$indexPath = "safesteps\assets\SafeSteps.course.index.json"

if (-not (Test-Path $indexPath)) {
    $errors += "Missing course index JSON: $indexPath"
} else {
    try {
        $json = Get-Content $indexPath -Raw | ConvertFrom-Json
    }
    catch {
        $errors += "Invalid JSON in: $indexPath"
    }
}

# 3. Validate curriculum definition (if exists)
$definition = "curriculum.json"
if (Test-Path $definition) {
    try {
        $def = Get-Content $definition -Raw | ConvertFrom-Json
    }
    catch {
        $errors += "Invalid curriculum.json"
    }
}

# 4. Validate folder names (no spaces, no special chars)
$badNames = Get-ChildItem -Recurse | Where-Object {
    $_.Name -match '[^a-zA-Z0-9_\-\.]'
}

foreach ($item in $badNames) {
    $errors += "Invalid name: $($item.FullName)"
}

# Summary
if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "VALIDATION FAILED:"
    $errors | ForEach-Object { Write-Host " - $_" }
    exit 1
}

Write-Host "Validation passed."
