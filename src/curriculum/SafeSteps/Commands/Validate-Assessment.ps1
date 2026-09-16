. $PSScriptRoot\Get-Timestamp.ps1
function Validate-Assessment {
    param([string]$Id)

    $assessment = Get-Assessment -Id $Id

    if (-not $assessment.id) { Write-Warning "Missing: id" }
    if (-not $assessment.title) { Write-Warning "Missing: title" }
    if (-not $assessment.items) { Write-Warning "Missing: items" }

    Write-Host "Assessment validation complete."
}

