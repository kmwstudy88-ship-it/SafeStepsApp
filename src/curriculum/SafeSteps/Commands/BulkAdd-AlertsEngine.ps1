. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-AlertsEngine {

    $root = Join-Path $PSScriptRoot "..\..\content\alerts"
    if (-not (Test-Path $root)) {
        New-Item -ItemType Directory -Path $root -Force | Out-Null
    }

    $engine = @{
        id = "alerts_engine"
        created_at = Get-Timestamp
        updated_at = Get-Timestamp
        alerts = @()
        rules = @(
            @{ id="risk_increase"; label="Risk score increased"; enabled=$true },
            @{ id="missed_task"; label="Task overdue"; enabled=$true },
            @{ id="missed_appointment"; label="Appointment missed"; enabled=$true },
            @{ id="new_evidence"; label="New evidence added"; enabled=$true },
            @{ id="assessment_drop"; label="Assessment score dropped"; enabled=$true },
            @{ id="contact_concern"; label="Contact session concern"; enabled=$true },
            @{ id="safety_breach"; label="Safety plan breach"; enabled=$true },
            @{ id="relapse_indicator"; label="Substance use relapse indicator"; enabled=$true },
            @{ id="mental_health_decline"; label="Mental health decline"; enabled=$true },
            @{ id="housing_instability"; label="Housing instability detected"; enabled=$true }
        )
    }

    $path = Join-Path $root "alerts_engine.json"
    $engine | ConvertTo-Json -Depth 20 | Set-Content $path

    Write-Host "Alerts Engine initialized"
}

