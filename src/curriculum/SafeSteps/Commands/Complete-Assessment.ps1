. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Complete-Assessment {
    param(
        [string]$Id,
        [int]$OverallRisk,
        [int]$OverallStrength,
        [string]$Recommendation
    )

    $path = Join-Path $PSScriptRoot "..\..\content\assessments\$Id.json"
    if (-not (Test-Path $path)) { Write-Warning "Assessment not found"; return }

    $assessment = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $assessment.overall_risk     = $OverallRisk
    $assessment.overall_strength = $OverallStrength
    $assessment.completed_at     = $ts

    if (-not $assessment.recommendations) {
        $assessment.recommendations = @()
    }
    if ($Recommendation) {
        $assessment.recommendations += $Recommendation
    }

    $assessment.updated_at = $ts
    $assessment | ConvertTo-Json -Depth 20 | Set-Content $path
    Write-Host "Assessment $Id completed"
}

