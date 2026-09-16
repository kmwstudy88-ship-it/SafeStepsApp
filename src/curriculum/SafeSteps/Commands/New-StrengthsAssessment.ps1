. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function New-StrengthsAssessment {
    param([string]$Id)

    $path = Join-Path $PSScriptRoot "..\..\content\strengths_needs\$Id.json"
    $ts = Get-Timestamp

    $assessment = @{
        id         = $Id
        created_at = $ts
        updated_at = $ts
        strengths  = @()
        needs      = @()
    }

    $assessment | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Strengths & Needs assessment created: $Id"
}

