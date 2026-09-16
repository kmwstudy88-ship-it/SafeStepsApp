. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Add-JournalEntry {
    param(
        [string]$Entry
    )

    $path = Join-Path $PSScriptRoot "..\..\content\journal\journal.json"
    $ts = Get-Timestamp

    if (-not (Test-Path $path)) {
        $journal = @{ entries = @() }
    } else {
        $journal = Get-Content $path | ConvertFrom-Json
    }

    $journal.entries += @{
        entry     = $Entry
        timestamp = $ts
    }

    $journal | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Journal entry added"
}

