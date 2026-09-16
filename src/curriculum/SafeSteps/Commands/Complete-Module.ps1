. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Complete-Module {
    param(
        [string]$ProgramId,
        [string]$ModuleId
    )

    $path = Join-Path $PSScriptRoot "..\..\programs\$ProgramId.json"
    if (-not (Test-Path $path)) { Write-Warning "Program not found"; return }

    $program = Get-Content $path | ConvertFrom-Json
    $module = $program.modules | Where-Object { $_.id -eq $ModuleId }
    if (-not $module) { Write-Warning "Module not found"; return }

    $ts = Get-Timestamp

    $module.completed_at = $ts
    $module.updated_at   = $ts

    $program | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Module $ModuleId completed at $ts"
}

