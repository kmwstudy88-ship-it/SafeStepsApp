. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Caseworker-Review {
    param(
        [string]$ProgramId,
        [string]$Caseworker,
        [string]$Decision,
        [string]$Notes
    )

    $path = Join-Path $PSScriptRoot "..\..\programs\$ProgramId.json"
    if (-not (Test-Path $path)) { Write-Warning "Program not found"; return }

    $program = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $program.caseworker_review = @{
        caseworker_name = $Caseworker
        decision        = $Decision
        notes           = $Notes
        signed_at       = $ts
    }

    $program.updated_at = $ts

    $program | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Caseworker review added for program $ProgramId"
}

