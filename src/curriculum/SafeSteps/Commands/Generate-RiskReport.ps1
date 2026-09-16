. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Calculate-RiskScore.ps1

function Generate-RiskReport {

    $root = Join-Path $PSScriptRoot "..\.."
    $risk = (Calculate-RiskScore | Out-String).Trim()

    $report = @{
        generated_at = (Get-Date).ToString("o")
        risk_score   = $risk
        flags        = @()
    }

    # Add flags
    if ($risk -gt 50) { $report.flags += "High risk: multiple missed tasks" }
    if ($risk -gt 80) { $report.flags += "Critical risk: rejected evidence or severe inconsistency" }

    $report | ConvertTo-Json -Depth 10
}

