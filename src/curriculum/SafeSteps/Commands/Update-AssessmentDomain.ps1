. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Update-AssessmentDomain {
    param(
        [string]$Id,
        [string]$DomainId,
        [int]$Score,
        [string]$Notes
    )

    $path = Join-Path $PSScriptRoot "..\..\content\assessments\$Id.json"
    if (-not (Test-Path $path)) { Write-Warning "Assessment not found"; return }

    $assessment = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $found = $false
    foreach ($d in $assessment.domains) {
        if ($d.id -eq $DomainId) {
            $d.score = $Score
            $d.notes = $Notes
            $found = $true
        }
    }

    if (-not $found) {
        Write-Warning "Domain $DomainId not found in assessment $Id"
        return
    }

    $assessment.updated_at = $ts
    $assessment | ConvertTo-Json -Depth 20 | Set-Content $path
    Write-Host "Updated domain $DomainId in assessment $Id"
}

