. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Register-AssessmentCompleter {
    param(
        [string]$Id,
        [string]$Participant
    )

    $path = Join-Path $PSScriptRoot "..\..\sections\$Id.json"

    if (-not (Test-Path $path)) {
        Write-Warning "Assessment not found: $Id"
        return
    }

    $assessment = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $assessment.completed_by = $Participant
    $assessment.completed_at = $ts
    $assessment.updated_at   = $ts

    $assessment | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Assessment $Id completed at $ts"
}

