. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Add-ChainOfCustody {
    param(
        [string]$FileName,
        [string]$Action,
        [string]$By
    )

    $path = Join-Path $PSScriptRoot "..\..\content\chain_of_custody.json"
    $ts = Get-Timestamp

    if (-not (Test-Path $path)) {
        $log = @{ entries = @() }
    } else {
        $log = Get-Content $path | ConvertFrom-Json
    }

    $log.entries += @{
        file      = $FileName
        action    = $Action
        by        = $By
        timestamp = $ts
    }

    $log | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Chain of custody updated for $FileName"
}

