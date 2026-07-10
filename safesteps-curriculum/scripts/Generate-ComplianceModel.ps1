# === SAFE STEPS — REUNIFICATION 24M COMPLIANCE MODEL INJECTOR ===

$programRoot = "C:\Users\SAFES\safesteps\safesteps-curriculum\programs\reunification-24m"

# Define compliance levels
$levels = @{
    "A" = @{
        daily  = @(
            "house_photo",
            "self_photo"
        )
        weekly = @(
            "weekly_bills",
            "weekly_rent",
            "weekly_shopping"
        )
    }
    "B" = @{
        daily  = @(
            "house_photo",
            "self_photo",
            "fridge_pantry_photo",
            "medication_photo",
            "daily_reflection"
        )
        weekly = @(
            "weekly_bills",
            "weekly_rent",
            "weekly_shopping",
            "weekly_contact_logs",
            "weekly_routine_log"
        )
    }
    "C" = @{
        daily  = @(
            "house_photo",
            "self_photo",
            "fridge_pantry_photo",
            "bedroom_photo",
            "bathroom_photo",
            "medication_photo",
            "daily_reflection",
            "routine_checklist"
        )
        weekly = @(
            "weekly_bills",
            "weekly_rent",
            "weekly_shopping",
            "weekly_contact_logs",
            "weekly_caseworker_checkin",
            "weekly_safety_plan_update",
            "weekly_aod_evidence"
        )
    }
}

# Map phases to compliance levels
$phaseCompliance = @{
    "phase-1" = "C"  # Extreme
    "phase-2" = "B"  # High-intensity
    "phase-3" = "B"  # High-intensity
    "phase-4" = "A"  # Standard
    "phase-5" = "A"  # Standard
}

Write-Host "Injecting compliance model into Reunification 24M stages..."
Write-Host ""

foreach ($phaseId in $phaseCompliance.Keys) {

    $levelKey = $phaseCompliance[$phaseId]
    $level    = $levels[$levelKey]

    $phasePath = Join-Path $programRoot $phaseId

    if (-not (Test-Path $phasePath)) {
        Write-Warning "Phase folder not found: $phasePath"
        continue
    }

    # Each subfolder under the phase is a stage (stage-1, stage-2, etc.)
    $stageFolders = Get-ChildItem $phasePath -Directory -ErrorAction SilentlyContinue

    foreach ($stage in $stageFolders) {

        $stageJsonPath = Join-Path $stage.FullName "stage.json"

        if (-not (Test-Path $stageJsonPath)) {
            Write-Warning "stage.json not found in $($stage.FullName)"
            continue
        }

        # Read existing JSON
        $stageObj = Get-Content $stageJsonPath -Raw | ConvertFrom-Json

        # Inject / overwrite compliance block
        $stageObj | Add-Member -MemberType NoteProperty -Name "compliance" -Value @{
            level        = $levelKey
            daily_tasks  = $level.daily
            weekly_tasks = $level.weekly
        } -Force

        # Write back to JSON (pretty compact but valid)
        $stageObj | ConvertTo-Json -Depth 10 | Set-Content $stageJsonPath -Encoding UTF8

        Write-Host "Updated compliance for $phaseId\$($stage.Name) -> Level $levelKey"
    }
}

Write-Host ""
Write-Host "Compliance model injection complete."