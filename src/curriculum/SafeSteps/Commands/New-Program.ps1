. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function New-Program {
    param(
        [string]$Id,
        [string]$Title
    )

    $path = Join-Path $PSScriptRoot "..\..\programs\$Id.json"
    $ts = Get-Timestamp

    $program = @{
        id         = $Id
        title      = $Title
        created_at = $ts
        updated_at = $ts
        weeks      = @()
    }

    $program | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Program created: $Id"
}

