. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-MultiProgramIntelligence {
    $root = Join-Path $PSScriptRoot "..\..\content\analytics\multi_program"
    if (-not (Test-Path $root)) { New-Item -ItemType Directory -Path $root -Force | Out-Null }

    $obj = @{
        id = "multi_program_intelligence"
        created_at = Get-Timestamp
        updated_at = Get-Timestamp
        programs = @()
        cross_program_insights = @()
        conflicts = @()
    }

    $path = Join-Path $root "multi_program_intelligence.json"
    $obj | ConvertTo-Json -Depth 20 | Set-Content $path
    Write-Host "Multi-Program Intelligence initialized"
}

