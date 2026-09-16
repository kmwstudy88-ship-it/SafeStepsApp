. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Read-Message {
    param(
        [string]$ThreadId,
        [int]$Index
    )

    $path = Join-Path $PSScriptRoot "..\..\content\messages\$ThreadId.json"
    if (-not (Test-Path $path)) { Write-Warning "Thread not found"; return }

    $thread = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    if ($Index -ge $thread.messages.Count) {
        Write-Warning "Message index out of range"
        return
    }

    $thread.messages[$Index].read_at = $ts
    $thread.updated_at = $ts

    $thread | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Message $Index marked read"
}

