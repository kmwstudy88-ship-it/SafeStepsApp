. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-CasePlanBuilder {
    $root = Join-Path $PSScriptRoot "..\..\content\case_plans"
    if (-not (Test-Path $root)) { New-Item -ItemType Directory -Path $root -Force | Out-Null }

    $obj = @{
        id = "case_plan_01"
        created_at = Get-Timestamp
        updated_at = Get-Timestamp
        goals = @()
        tasks = @()
        evidence_required = @()
    }

    $path = Join-Path $root "case_plan_01.json"
    $obj | ConvertTo-Json -Depth 20 | Set-Content $path

    Write-Host "Case Plan Builder initialized"
}

