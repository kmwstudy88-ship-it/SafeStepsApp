. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Export-AgencyBundle {
    param(
        [string]$OutputFolder
    )

    $root = Join-Path $PSScriptRoot "..\.."
    if (-not (Test-Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder -Force | Out-Null
    }

    $bundle = @{
        generated_at = Get-Timestamp
        programs     = @()
        lessons      = @()
        assessments  = @()
        daily_tasks  = @()
        weekly_tasks = @()
        children     = @()
        goals        = @()
        habits       = @()
        certificates = @()
    }

    Get-ChildItem "$root\programs" -Filter *.json | ForEach-Object {
        $bundle.programs += (Get-Content $_.FullName | ConvertFrom-Json)
    }

    Get-ChildItem "$root\content\lessons" -Filter *.json | ForEach-Object {
        $bundle.lessons += (Get-Content $_.FullName | ConvertFrom-Json)
    }

    Get-ChildItem "$root\sections" -Filter *.json | ForEach-Object {
        $bundle.assessments += (Get-Content $_.FullName | ConvertFrom-Json)
    }

    Get-ChildItem "$root\content\tasks\daily" -Filter *.json | ForEach-Object {
        $bundle.daily_tasks += (Get-Content $_.FullName | ConvertFrom-Json)
    }

    Get-ChildItem "$root\content\tasks\weekly" -Filter *.json | ForEach-Object {
        $bundle.weekly_tasks += (Get-Content $_.FullName | ConvertFrom-Json)
    }

    Get-ChildItem "$root\content\children" -Filter *.json | ForEach-Object {
        $bundle.children += (Get-Content $_.FullName | ConvertFrom-Json)
    }

    Get-ChildItem "$root\content\goals" -Filter *.json | ForEach-Object {
        $bundle.goals += (Get-Content $_.FullName | ConvertFrom-Json)
    }

    Get-ChildItem "$root\content\habits" -Filter *.json | ForEach-Object {
        $bundle.habits += (Get-Content $_.FullName | ConvertFrom-Json)
    }

    Get-ChildItem "$root\content\certificates" -Filter *.json | ForEach-Object {
        $bundle.certificates += (Get-Content $_.FullName | ConvertFrom-Json)
    }

    $jsonPath = Join-Path $OutputFolder "safesteps_agency_bundle.json"
    $bundle | ConvertTo-Json -Depth 30 | Set-Content $jsonPath

    $zipPath = Join-Path $OutputFolder "safesteps_agency_bundle.zip"
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    Compress-Archive -Path $root\content\*, $root\programs\*, $root\sections\* -DestinationPath $zipPath

    Write-Host "Agency bundle JSON: $jsonPath"
    Write-Host "Agency bundle ZIP:  $zipPath"
}

