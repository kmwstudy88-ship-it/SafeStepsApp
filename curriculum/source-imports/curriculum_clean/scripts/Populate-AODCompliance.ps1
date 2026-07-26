# === SAFE STEPS — AOD COMPLIANCE INJECTOR ===

$root = "C:\Users\SAFES\safesteps\safesteps-curriculum\programs\aod-recovery-12w"

$level = @{
    daily  = @("house_photo", "self_photo", "medication_photo", "daily_reflection")
    weekly = @("weekly_bills", "weekly_rent", "weekly_shopping", "weekly_aod_evidence")
}

Write-Host "Injecting AOD compliance..."

foreach ($week in Get-ChildItem $root -Directory) {

    $path = Join-Path $week.FullName "stage.json"
    $obj  = Get-Content $path -Raw | ConvertFrom-Json

    $obj.compliance = @{
        level        = "B"
        daily_tasks  = $level.daily
        weekly_tasks = $level.weekly
    }

    $obj | ConvertTo-Json -Depth 10 | Set-Content $path -Encoding UTF8

    Write-Host "Updated $($week.Name)"
}

Write-Host "AOD compliance injection complete."
