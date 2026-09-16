. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-FamilyMeetings {
    $root = Join-Path $PSScriptRoot "..\..\content\family_meetings"
    if (-not (Test-Path $root)) { New-Item -ItemType Directory -Path $root -Force | Out-Null }

    $meeting = @{
        id = "family_meeting_01"
        created_at = Get-Timestamp
        updated_at = Get-Timestamp
        attendees = @()
        agenda = @()
        decisions = @()
        actions = @()
    }

    $path = Join-Path $root "family_meeting_01.json"
    $meeting | ConvertTo-Json -Depth 20 | Set-Content $path

    Write-Host "Family Meeting Pack initialized"
}

