. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Add-Evidence {
    param(
        [string]$TaskId,
        [string]$FileName
    )

    $path = Join-Path $PSScriptRoot "..\..\content\tasks\daily\$TaskId.json"
    if (-not (Test-Path $path)) { Write-Warning "Task not found"; return }

    $task = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $evidence = @{
        file        = $FileName
        captured_at = $ts
        received_at = $ts
        verified_at = $null
    }

    $task.evidence += $evidence
    $task.updated_at = $ts

    $task | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Evidence added to task $TaskId"
}

