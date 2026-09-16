. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function New-AODProgram {
    $path = Join-Path $PSScriptRoot "..\..\programs\aod_program.json"
    $ts = Get-Timestamp

    $template = @{
        id            = "aod_program"
        title         = "AOD Parenting Capacity Program"
        created_at    = $ts
        updated_at    = $ts
        started_at    = $null
        completed_at  = $null
        synced_at     = $null
        weeks         = @()
    } | ConvertTo-Json -Depth 10

    Set-Content $path $template
    Write-Host "Created AOD program"
}

