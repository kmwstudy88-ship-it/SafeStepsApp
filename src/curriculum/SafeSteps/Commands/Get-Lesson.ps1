. $PSScriptRoot\Get-Timestamp.ps1
function Get-Lesson {
    param([string]$Id)

    $path = Join-Path $PSScriptRoot "..\..\content\lessons\$Id.json"

    if (-not (Test-Path $path)) {
        Write-Warning "Lesson not found: $Id"
        return
    }

    Get-Content $path | ConvertFrom-Json
}

