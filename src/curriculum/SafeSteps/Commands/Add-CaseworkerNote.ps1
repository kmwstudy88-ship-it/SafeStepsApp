. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Add-CaseworkerNote {
    param(
        [string]$Caseworker,
        [string]$Note
    )

    $path = Join-Path $PSScriptRoot "..\..\content\caseworker_notes.json"
    $ts = Get-Timestamp

    if (-not (Test-Path $path)) {
        $notes = @{ entries = @() }
    } else {
        $notes = Get-Content $path | ConvertFrom-Json
    }

    $notes.entries += @{
        caseworker = $Caseworker
        note       = $Note
        timestamp  = $ts
    }

    $notes | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Caseworker note added"
}

