. $PSScriptRoot\Get-Timestamp.ps1
function Validate-Week {
    param([string]$Id)

    $week = Get-Week -Id $Id

    if (-not $week.id) { Write-Warning "Missing: id" }
    if (-not $week.title) { Write-Warning "Missing: title" }
    if (-not $week.lessons) { Write-Warning "Missing: lessons" }

    Write-Host "Week validation complete."
}

