. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Send-Message {
    param(
        [string]$ThreadId,
        [string]$Sender,
        [string]$Message
    )

    $path = Join-Path $PSScriptRoot "..\..\content\messages\$ThreadId.json"
    $ts = Get-Timestamp

    if (-not (Test-Path $path)) {
        $thread = @{
            id = $ThreadId
            created_at = $ts
            updated_at = $ts
            messages = @()
        }
    } else {
        $thread = Get-Content $path | ConvertFrom-Json
    }

    $thread.messages += @{
        sender    = $Sender
        message   = $Message
        sent_at   = $ts
        read_at   = $null
    }

    $thread.updated_at = $ts
    $thread | ConvertTo-Json -Depth 10 | Set-Content $path

    Write-Host "Message sent in thread $ThreadId"
}

