. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-CaseAISummary {
    $root = Join-Path $PSScriptRoot "..\..\content\analytics\ai_summaries"
    if (-not (Test-Path $root)) { New-Item -ItemType Directory -Path $root -Force | Out-Null }

    $obj = @{
        id = "case_ai_summary_engine"
        created_at = Get-Timestamp
        updated_at = Get-Timestamp
        summaries = @()
        last_run_at = $null
    }

    $path = Join-Path $root "case_ai_summary_engine.json"
    $obj | ConvertTo-Json -Depth 20 | Set-Content $path
    Write-Host "Case AI Summary Engine initialized"
}

