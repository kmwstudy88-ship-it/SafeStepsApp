. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function New-Child {
    param(
        [string]$Id,
        [string]$Name
    )

    $path = Join-Path $PSScriptRoot "..\..\content\children\$Id.json"
    $ts = Get-Timestamp

    $child = @{
        id         = $Id
        name       = $Name
        created_at = $ts
        updated_at = $ts
        notes      = @()
    }

    $child | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Child created: $Id"
}

