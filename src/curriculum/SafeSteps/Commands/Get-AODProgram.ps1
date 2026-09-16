. $PSScriptRoot\Get-Timestamp.ps1
function Get-AODProgram {
    $path = Join-Path $PSScriptRoot "..\..\content\programs\aod_program.json"

    if (-not (Test-Path $path)) {
        Write-Warning "AOD Program not found."
        return
    }

    Get-Content $path | ConvertFrom-Json
}

