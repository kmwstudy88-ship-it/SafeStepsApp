. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Add-SafetyStep {
    param(
        [string]$PlanId,
        [string]$Step
    )

    $path = Join-Path $PSScriptRoot "..\..\content\safety_plans\$PlanId.json"
    if (-not (Test-Path $path)) { Write-Warning "Plan not found"; return }

    $plan = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $plan.steps += @{
        step       = $Step
        added_at   = $ts
    }

    $plan.updated_at = $ts
    $plan | ConvertTo-Json -Depth 10 | Set-Content $path

    Write-Host "Step added to safety plan $PlanId"
}

