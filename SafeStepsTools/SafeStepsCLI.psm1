# ============================================
# SafeSteps CLI Module
# ============================================

$root = "C:\Users\SAFES\SafeStepsApp"

function Repair-SafeSteps {
    Write-Host "Running SafeSteps Repair..."
    & (Join-Path $root "SafeSteps-Repair.ps1")
}

function Build-SafeStepsProgram {
    Write-Host "Building SafeSteps Program..."
    $programScript = Join-Path $root "Generate-Program.ps1"
    if (Test-Path $programScript) {
        & $programScript
    } else {
        Write-Host "ERROR: Program generator not found at $programScript" -ForegroundColor Red
    }
}

function Validate-SafeSteps {
    Write-Host "Validating SafeSteps..."
    $validator = Join-Path $root "app\validate-safesteps.ps1"
    if (Test-Path $validator) {
        & $validator
    } else {
        Write-Host "Validator not found."
    }
}

function Search-SafeStepsLessons {
    param(
        [string]$Keyword
    )
    Write-Host "Searching lessons for: $Keyword"
    $searchScript = Join-Path $root "scripts\search.ps1"
    if (Test-Path $searchScript) {
        & $searchScript -Keyword $Keyword
    } else {
        Write-Host "Search script not found."
    }
}

function Export-SafeStepsProgram {
    Write-Host "Exporting SafeSteps Program..."
    # Placeholder for future export logic
}

Export-ModuleMember -Function *-SafeSteps*
