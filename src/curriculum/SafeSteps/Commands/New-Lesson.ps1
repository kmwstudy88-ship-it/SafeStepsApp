. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function New-Lesson {
    param(
        [string]$Id,
        [string]$Title
    )

    $path = Join-Path $PSScriptRoot "..\..\content\lessons\$Id.json"
    $ts = Get-Timestamp

    $template = @{
        id           = $Id
        title        = $Title
        created_at   = $ts
        updated_at   = $ts
        started_at   = $null
        completed_at = $null
        synced_at    = $null
        objectives   = @()
        activities   = @()
        evidence     = @()
    } | ConvertTo-Json -Depth 10

    Set-Content $path $template
    Write-Host "Created lesson: $Id"
}

