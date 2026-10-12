# === SAFE STEPS — HOME AGAIN COMPLIANCE INJECTOR ===

$root = "C:\Users\SAFES\safesteps\safesteps-curriculum\programs\home-again-12m"

$levels = @{
    "A" = @{
        daily  = @("house_photo", "self_photo")
        weekly = @("weekly_bills", "weekly_rent", "weekly_shopping")
    }
    "B" = @{
        daily  = @("house_photo", "self_photo", "fridge_pantry_photo", "daily_reflection")
        weekly = @("weekly_bills", "weekly_rent", "weekly_shopping", "weekly_routine_log")
    }
}

$phaseCompliance = @{
    "phase-1" = "B"
    "phase-2" = "A"
    "phase-3" = "A"
}

Write-Host "Injecting compliance..."

foreach ($phase in Get-ChildItem $root -Directory) {

    $levelKey = $phaseCompliance[$phase.Name]
    $level    = $levels[$levelKey]

    foreach ($stage in Get-ChildItem $phase.FullName -Directory) {

        $path = Join-Path $stage.FullName "stage.json"
        $obj  = Get-Content $path -Raw | ConvertFrom-Json

        $obj.compliance = @{
            level        = $levelKey
            daily_tasks  = $level.daily
            weekly_tasks = $level.weekly
        }

        $obj | ConvertTo-Json -Depth 10 | Set-Content $path -Encoding UTF8

        Write-Host "Updated $($phase.Name)-$($stage.Name) -> Level $levelKey"
    }
}

Write-Host "Compliance injection complete."
