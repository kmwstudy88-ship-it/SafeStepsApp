Write-Host "=== SAFE STEPS BULK BUILD START ===" -ForegroundColor Cyan

$root = $PSScriptRoot

function Run-Step {
    param(
        [int]$Number,
        [string]$Label,
        [string]$RelativePath
    )

    $scriptPath = Join-Path $root $RelativePath
    Write-Host "[$Number/10] $Label"

    if (Test-Path $scriptPath) {
        & $scriptPath
    } else {
        Write-Host "WARNING: Missing script: $scriptPath" -ForegroundColor Yellow
    }
}

Run-Step 1 "Loading environment..."              "safesteps-env.ps1"
Run-Step 2 "Running SafeSteps repair..."         "SafeSteps-Repair.ps1"
Run-Step 3 "Normalizing folders..."              "app\normalize-folders.ps1"
Run-Step 4 "Validating curriculum..."            "app\validate-safesteps.ps1"
Run-Step 5 "Building curriculum..."              "app\build-curriculum.ps1"
Run-Step 6 "Building taxonomy..."                "app\build-curriculum-taxonomy.ps1"
Run-Step 7 "Building combined curriculum..."     "app\build-curriculum-combined.ps1"
Run-Step 8 "Enriching lessons..."                "app\enrich-lessons.ps1"
Run-Step 9 "Generating integrated program..."    "engine\Generate-IntegratedProgram.ps1"
Run-Step 10 "Creating snapshot..."               "src\curriculum\Snapshot-Program.ps1"

Write-Host "=== SAFE STEPS BULK BUILD COMPLETE ===" -ForegroundColor Green
