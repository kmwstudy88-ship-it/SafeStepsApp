. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Export-CourtReport {
    param([string]$OutputFile)

    $root = Join-Path $PSScriptRoot "..\.."

    $report = @{
        generated_at = Get-Timestamp
        programs     = @()
        lessons      = @()
        assessments  = @()
        daily_tasks  = @()
        weekly_tasks = @()
    }

    # Programs
    Get-ChildItem "$root\programs" -Filter *.json | ForEach-Object {
        $report.programs += (Get-Content $_.FullName | ConvertFrom-Json)
    }

    # Lessons
    Get-ChildItem "$root\content\lessons" -Filter *.json | ForEach-Object {
        $report.lessons += (Get-Content $_.FullName | ConvertFrom-Json)
    }

    # Assessments
    Get-ChildItem "$root\sections" -Filter *.json | ForEach-Object {
        $report.assessments += (Get-Content $_.FullName | ConvertFrom-Json)
    }

    # Daily tasks
    Get-ChildItem "$root\content\tasks\daily" -Filter *.json | ForEach-Object {
        $report.daily_tasks += (Get-Content $_.FullName | ConvertFrom-Json)
    }

    # Weekly tasks
    Get-ChildItem "$root\content\tasks\weekly" -Filter *.json | ForEach-Object {
        $report.weekly_tasks += (Get-Content $_.FullName | ConvertFrom-Json)
    }

    $report | ConvertTo-Json -Depth 20 | Set-Content $OutputFile
    Write-Host "Court report exported to $OutputFile"
}

