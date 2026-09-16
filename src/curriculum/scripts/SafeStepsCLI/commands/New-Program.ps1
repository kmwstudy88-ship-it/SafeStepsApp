function New-Program {
    param(
        [Parameter(Mandatory)]
        [string]$Name,

        [int]$DurationMonths = 24,
        [switch]$DailyLessons
    )

    $root = "C:\SafeSteps\Programs\$Name"

    if (-Not (Test-Path $root)) {
        New-Item -ItemType Directory -Path $root | Out-Null
    }

    $config = @{
        programName = $Name
        durationMonths = $DurationMonths
        dailyLessons = $DailyLessons.IsPresent
        version = "1.0.0"
    }

    $config | ConvertTo-Json -Depth 10 | Out-File "$root\program.json"

    Write-Host "Program '$Name' created at $root"
}
