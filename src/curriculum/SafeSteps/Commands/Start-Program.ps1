. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Start-Program {
    param([string]$ProgramId)

    $path = Join-Path $PSScriptRoot "..\..\programs\$ProgramId.json"
    if (-not (Test-Path $path)) { Write-Warning "Program not found"; return }

    $program = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $program.started_at = $ts
    $program.updated_at = $ts

    $program | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Program $ProgramId started at $ts"
}

