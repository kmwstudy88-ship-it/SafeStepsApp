. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Generate-Milestones {
    param([string]$ProgramId)

    $path = Join-Path $PSScriptRoot "..\..\programs\$ProgramId.json"
    if (-not (Test-Path $path)) { Write-Warning "Program not found"; return }

    $program = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $milestones = @()

    foreach ($week in $program.weeks) {
        $milestones += @{
            type = "week"
            id = $week.week_number
            created_at = $ts
            completed_at = $week.completed_at
        }
    }

    $program.milestones = $milestones
    $program.updated_at = $ts

    $program | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Milestones generated for program $ProgramId"
}

