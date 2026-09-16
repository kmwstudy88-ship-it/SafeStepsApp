. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Attend-Appointment {
    param([string]$Id)

    $path = Join-Path $PSScriptRoot "..\..\content\appointments\$Id.json"
    if (-not (Test-Path $path)) { Write-Warning "Appointment not found"; return }

    $appt = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $appt.attended_at = $ts
    $appt.updated_at  = $ts

    $appt | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Appointment $Id marked attended"
}

