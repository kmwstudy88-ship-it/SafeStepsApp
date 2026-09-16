. $PSScriptRoot\Get-Timestamp.ps1
function Remove-Week {
    param([string]$Id)

    $path = Join-Path $PSScriptRoot "..\..\content\weeks\$Id.json"

    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "Removed week: $Id"
    } else {
        Write-Warning "Week not found: $Id"
    }
}

