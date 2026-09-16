. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-SupervisorDashboard {
    $root = Join-Path $PSScriptRoot "..\..\content\dashboards\supervisor"
    if (-not (Test-Path $root)) { New-Item -ItemType Directory -Path $root -Force | Out-Null }

    $obj = @{
        id = "supervisor_dashboard"
        created_at = Get-Timestamp
        updated_at = Get-Timestamp
        metrics = @()
        risk_overview = @()
        workload = @()
        alerts = @()
    }

    $path = Join-Path $root "supervisor_dashboard.json"
    $obj | ConvertTo-Json -Depth 20 | Set-Content $path
    Write-Host "Supervisor Dashboard initialized"
}

