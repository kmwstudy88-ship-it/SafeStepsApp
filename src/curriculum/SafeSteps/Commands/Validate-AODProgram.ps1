. $PSScriptRoot\Get-Timestamp.ps1
function Validate-AODProgram {
    $program = Get-AODProgram

    if (-not $program.id) { Write-Warning "Missing: id" }
    if (-not $program.title) { Write-Warning "Missing: title" }
    if (-not $program.weeks) { Write-Warning "Missing: weeks" }

    foreach ($week in $program.weeks) {
        if (-not $week.number) { Write-Warning "Week missing number" }
        if (-not $week.title) { Write-Warning "Week $($week.number) missing title" }
        if (-not $week.lessons) { Write-Warning "Week $($week.number) missing lessons" }
    }

    Write-Host "AOD Program validation complete."
}

