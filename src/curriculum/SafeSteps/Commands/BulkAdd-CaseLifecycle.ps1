. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-CaseLifecycle {

    $root = Join-Path $PSScriptRoot "..\..\content\case_lifecycle"
    if (-not (Test-Path $root)) { New-Item -ItemType Directory -Path $root -Force | Out-Null }

    $obj = @{
        id = "case_lifecycle_engine"
        created_at = Get-Timestamp
        updated_at = Get-Timestamp

        stages = @(
            @{ id="intake"; status="pending"; started_at=$null; completed_at=$null },
            @{ id="assessment"; status="pending"; started_at=$null; completed_at=$null },
            @{ id="case_plan"; status="pending"; started_at=$null; completed_at=$null },
            @{ id="programs"; status="pending"; started_at=$null; completed_at=$null },
            @{ id="contact"; status="pending"; started_at=$null; completed_at=$null },
            @{ id="court"; status="pending"; started_at=$null; completed_at=$null },
            @{ id="reunification"; status="pending"; started_at=$null; completed_at=$null },
            @{ id="closure"; status="pending"; started_at=$null; completed_at=$null }
        )

        history = @()
        transitions = @()
    }

    $path = Join-Path $root "case_lifecycle_engine.json"
    $obj | ConvertTo-Json -Depth 20 | Set-Content $path

    Write-Host "Case Lifecycle Engine initialized"
}

