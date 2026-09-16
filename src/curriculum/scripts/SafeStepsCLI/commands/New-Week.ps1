function New-Week {
    param(
        [Parameter(Mandatory)]
        [string]$Program,

        [Parameter(Mandatory)]
        [int]$WeekNumber
    )

    $path = "C:\SafeSteps\Programs\$Program\weeks\Week-$WeekNumber"

    if (-Not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path | Out-Null
    }

    $config = @{
        weekNumber = $WeekNumber
        lessons = 7
        completed = $false
    }

    $config | ConvertTo-Json -Depth 10 | Out-File "$path\week.json"

    Write-Host "Week $WeekNumber created for program '$Program'"
}
