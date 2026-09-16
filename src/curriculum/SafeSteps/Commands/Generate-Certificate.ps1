. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Generate-Certificate {
    param(
        [string]$ProgramId,
        [string]$ParticipantName
    )

    $programPath = Join-Path $PSScriptRoot "..\..\programs\$ProgramId.json"
    if (-not (Test-Path $programPath)) { Write-Warning "Program not found"; return }

    $program = Get-Content $programPath | ConvertFrom-Json
    if (-not $program.completed_at) {
        Write-Warning "Program not completed. Cannot generate certificate."
        return
    }

    $ts = Get-Timestamp
    $certId = "$ProgramId-$($ParticipantName.Replace(' ','_'))"

    $cert = @{
        id              = $certId
        participant     = $ParticipantName
        program_id      = $program.id
        program_title   = $program.title
        completed_at    = $program.completed_at
        issued_at       = $ts
        caseworker_name = $program.caseworker_review.caseworker_name
        caseworker_decision = $program.caseworker_review.decision
    }

    $certPath = Join-Path $PSScriptRoot "..\..\content\certificates\$certId.json"
    $cert | ConvertTo-Json -Depth 10 | Set-Content $certPath

    Write-Host "Certificate generated: $certPath"
}

