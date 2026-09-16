. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Complete-Lesson {
    param([string]$Id)

    $path = Join-Path $PSScriptRoot "..\..\content\lessons\$Id.json"
    if (-not (Test-Path $path)) { Write-Warning "Lesson not found"; return }

    $lesson = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $lesson.completed_at = $ts
    $lesson.updated_at   = $ts

    $lesson | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Lesson $Id completed at $ts"
}

