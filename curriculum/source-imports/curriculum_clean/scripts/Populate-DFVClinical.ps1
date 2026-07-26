# === SAFE STEPS — DFV CLINICAL POPULATION (12 WEEKS) ===

$root = "C:\Users\SAFES\safesteps\safesteps-curriculum\programs\dfv-recovery-12w"

$clinical = @{

    "week-1" = @{
        objectives = @("Understand coercive control", "Identify DFV patterns")
        required = @("DFV-CC-001_patterns")
        recommended = @("DFV-CC-004_gaslighting")
        evidence = @("Coercive control worksheet")
    }

    "week-2" = @{
        objectives = @("Recognise red flags", "Build early warning systems")
        required = @("DFV-CC-003_red_flags")
        recommended = @()
        evidence = @("Red flag identification log")
    }

    "week-3" = @{
        objectives = @("Understand cycle of abuse", "Identify personal risk points")
        required = @("DFV-CC-002_cycle")
        recommended = @()
        evidence = @("Cycle mapping worksheet")
    }

    "week-4" = @{
        objectives = @("Build safety planning skills")
        required = @("SAF-SP-001_what_is_a_safety_plan")
        recommended = @("SAF-SP-003_safe_people")
        evidence = @("Safety plan draft")
    }

    "week-5" = @{
        objectives = @("Strengthen boundaries")
        required = @("DFV-CC-006_boundaries")
        recommended = @()
        evidence = @("Boundary-setting reflection")
    }

    "week-6" = @{
        objectives = @("Improve emotional regulation")
        required = @("MH-ER-010_tipp_skills")
        recommended = @("MH-ER-007_emotion_wheel")
        evidence = @("Regulation practice log")
    }

    "week-7" = @{
        objectives = @("Understand trauma responses")
        required = @("MH-ER-012_trauma_responses")
        recommended = @()
        evidence = @("Trauma response worksheet")
    }

    "week-8" = @{
        objectives = @("Rebuild self-worth")
        required = @("DFV-CC-007_self_worth")
        recommended = @()
        evidence = @("Self-worth reflection")
    }

    "week-9" = @{
        objectives = @("Strengthen support networks")
        required = @("SAF-SP-003_safe_people")
        recommended = @()
        evidence = @("Support network map")
    }

    "week-10" = @{
        objectives = @("Develop long-term safety strategies")
        required = @("SAF-SP-004_safe_places")
        recommended = @()
        evidence = @("Long-term safety plan")
    }

    "week-11" = @{
        objectives = @("Prepare for independence")
        required = @("DFV-CC-008_independence_skills")
        recommended = @()
        evidence = @("Independence plan")
    }

    "week-12" = @{
        objectives = @("Demonstrate sustained change")
        required = @("DFV-CC-009_sustained_change")
        recommended = @()
        evidence = @("Final DFV recovery review")
    }
}

Write-Host "Populating DFV clinical content..."

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

Write-Host "DFV clinical population complete."
