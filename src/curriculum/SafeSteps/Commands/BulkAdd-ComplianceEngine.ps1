. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-ComplianceEngine {

    $root = Join-Path $PSScriptRoot "..\..\content\compliance"
    if (-not (Test-Path $root)) { New-Item -ItemType Directory -Path $root -Force | Out-Null }

    $obj = @{
        id = "compliance_engine"
        created_at = Get-Timestamp
        updated_at = Get-Timestamp

        compliance_items = @(
            @{ id="court_orders"; status="unknown"; last_checked=$null },
            @{ id="safety_plan"; status="unknown"; last_checked=$null },
            @{ id="case_plan"; status="unknown"; last_checked=$null },
            @{ id="contact_requirements"; status="unknown"; last_checked=$null },
            @{ id="program_participation"; status="unknown"; last_checked=$null },
            @{ id="evidence_requirements"; status="unknown"; last_checked=$null }
        )

        missing_items = @()
        overdue_items = @()
        audit_log = @()
    }

    $path = Join-Path $root "compliance_engine.json"
    $obj | ConvertTo-Json -Depth 20 | Set-Content $path

    Write-Host "Compliance Engine initialized"
}

