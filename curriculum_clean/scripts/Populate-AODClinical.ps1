# === SAFE STEPS — AOD CLINICAL POPULATION (12 WEEKS) ===

$root = "C:\Users\SAFES\safesteps\safesteps-curriculum\programs\aod-recovery-12w"

$clinical = @{

    "week-1" = @{
        objectives = @("Understand addiction cycle", "Identify personal triggers")
        required = @("AOD-RP-001_triggers")
        recommended = @()
        evidence = @("Trigger identification worksheet")
    }

    "week-2" = @{
        objectives = @("Learn craving management strategies")
        required = @("AOD-RP-002_craving_management")
        recommended = @()
        evidence = @("Craving log")
    }

    "week-3" = @{
        objectives = @("Build relapse prevention plan")
        required = @("AOD-RP-003_relapse_prevention")
        recommended = @()
        evidence = @("Relapse prevention plan draft")
    }

    "week-4" = @{
        objectives = @("Strengthen emotional regulation")
        required = @("MH-ER-010_tipp_skills")
        recommended = @("MH-ER-007_emotion_wheel")
        evidence = @("Regulation practice log")
    }

    "week-5" = @{
        objectives = @("Understand withdrawal patterns")
        required = @("AOD-RP-004_withdrawal_patterns")
        recommended = @()
        evidence = @("Withdrawal tracking log")
    }

    "week-6" = @{
        objectives = @("Build healthy routines")
        required = @("PAR-ROU-001_morning_routines")
        recommended = @()
        evidence = @("Routine consistency log")
    }

    "week-7" = @{
        objectives = @("Strengthen support networks")
        required = @("SAF-SP-003_safe_people")
        recommended = @()
        evidence = @("Support network map")
    }

    "week-8" = @{
        objectives = @("Address shame and guilt")
        required = @("AOD-RP-005_shame_guilt")
        recommended = @()
        evidence = @("Reflection worksheet")
    }

    "week-9" = @{
        objectives = @("Build coping strategies")
        required = @("MH-ER-008_urge_surfing")
        recommended = @()
        evidence = @("Coping strategy log")
    }

    "week-10" = @{
        objectives = @("Strengthen long-term stability")
        required = @("AOD-RP-006_long_term_stability")
        recommended = @()
        evidence = @("Stability review")
    }

    "week-11" = @{
        objectives = @("Prepare for independence")
        required = @("AOD-RP-007_independence_skills")
        recommended = @()
        evidence = @("Independence plan")
    }

    "week-12" = @{
        objectives = @("Demonstrate sustained change")
        required = @("AOD-RP-008_sustained_change")
        recommended = @()
        evidence = @("Final AOD recovery review")
    }
}

Write-Host "Populating AOD clinical content..."

foreach ($week in Get-ChildItem $root -Directory) {

    $key = $week.Name
    $path = Join-Path $week.FullName "stage.json"

    if ($clinical.ContainsKey($key)) {

        $obj = Get-Content $path -Raw | ConvertFrom-Json

        $obj.objectives          = $clinical[$key].objectives
        $obj.required_lessons    = $clinical[$key].required
        $obj.recommended_lessons = $clinical[$key].recommended
        $obj.evidence            = $clinical[$key].evidence

        $obj | ConvertTo-Json -Depth 10 | Set-Content $path -Encoding UTF8

        Write-Host "Updated $key"
    }
}

Write-Host "AOD clinical population complete."
