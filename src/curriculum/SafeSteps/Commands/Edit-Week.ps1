. $PSScriptRoot\Get-Timestamp.ps1
function Edit-Week {
    param([string]$Id)

    $path = Join-Path $PSScriptRoot "..\..\content\weeks\$Id.json"

    if (Test-Path $path) {
        code $path
    } else {
        Write-Warning "Week not found: $Id"
    }
}

