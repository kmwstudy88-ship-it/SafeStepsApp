. $PSScriptRoot\Get-Timestamp.ps1
function Edit-Lesson {
    param([string]$Id)

    $path = Join-Path $PSScriptRoot "..\..\content\lessons\$Id.json"

    if (Test-Path $path) {
        code $path
    } else {
        Write-Warning "Lesson not found: $Id"
    }
}

