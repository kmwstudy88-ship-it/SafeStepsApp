. $PSScriptRoot\Get-Timestamp.ps1
function Edit-Assessment {
    param([string]$Id)

    $path = Join-Path $PSScriptRoot "..\..\content\assessments\$Id.json"

    if (Test-Path $path) {
        code $path
    } else {
        Write-Warning "Assessment not found: $Id"
    }
}

