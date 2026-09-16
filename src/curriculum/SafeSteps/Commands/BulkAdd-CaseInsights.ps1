. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-CaseInsights {
    $root = Join-Path $PSScriptRoot "..\..\content\analytics\case_insights"
    if (-not (Test-Path $root)) { New-Item -ItemType Directory -Path $root -Force | Out-Null }

    $obj = @{
        id = "case_insights_engine"
        created_at = Get-Timestamp
        updated_at = Get-Timestamp
        insights = @()
        flags = @()
        summaries = @()
    }

    $path = Join-Path $root "case_insights_engine.json"
    $obj | ConvertTo-Json -Depth 20 | Set-Content $path
    Write-Host "Case Insights Engine initialized"
}

