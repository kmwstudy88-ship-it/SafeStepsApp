. $PSScriptRoot\Get-Timestamp.ps1
function Export-AODProgram {
    $program = Get-AODProgram
    New-Item -ItemType Directory -Path ".\export" -Force | Out-Null

    $path = ".\export\aod_program.json"
    $program | ConvertTo-Json -Depth 10 | Set-Content $path

    Write-Host "Exported AOD Program to $path"
}

