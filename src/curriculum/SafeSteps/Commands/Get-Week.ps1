. $PSScriptRoot\Get-Timestamp.ps1
function Get-Week {
    param([string]$Id)

    $path = Join-Path $PSScriptRoot "..\..\content\weeks\$Id.json"

    if (-not (Test-Path $path)) {
        Write-Warning "Week not found: $Id"
        return
    }

    Get-Content $path | ConvertFrom-Json
}

