. $PSScriptRoot\Get-Timestamp.ps1
function Edit-AODProgram {
    $path = Join-Path $PSScriptRoot "..\..\content\programs\aod_program.json"

    if (Test-Path $path) {
        code $path
    } else {
        Write-Warning "AOD Program not found."
    }
}

