. $PSScriptRoot\Get-Timestamp.ps1
function Remove-Lesson {
    param([string]$Id)

    $path = Join-Path $PSScriptRoot "..\..\content\lessons\$Id.json"

    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "Removed lesson: $Id"
    } else {
        Write-Warning "Lesson not found: $Id"
    }
}

