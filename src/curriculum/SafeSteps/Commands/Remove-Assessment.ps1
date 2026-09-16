. $PSScriptRoot\Get-Timestamp.ps1
function Remove-Assessment {
    param([string]$Id)

    $path = Join-Path $PSScriptRoot "..\..\content\assessments\$Id.json"

    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "Removed assessment: $Id"
    } else {
        Write-Warning "Assessment not found: $Id"
    }
}

