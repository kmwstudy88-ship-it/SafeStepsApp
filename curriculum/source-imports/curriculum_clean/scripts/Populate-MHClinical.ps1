# === SAFE STEPS — MH CLINICAL POPULATION (8 WEEKS) ===

$root = "C:\Users\SAFES\safesteps\safesteps-curriculum\programs\mh-stabilisation-8w"

$clinical = @{

    "week-1" = @{
        objectives = @("Learn grounding basics", "Reduce immediate distress")
        required = @("MH-ER-001_grounding_basics", "MH-ER-002_54321_technique")
        recommended = @()
        evidence = @("Grounding practice log")
    }

    "week-2" = @{
        objectives = @("Understand emotional triggers", "Identify patterns")
        required = @("MH-ER-003_identifying_triggers")
        recommended = @()
        evidence = @("Trigger worksheet")
    }

    "week-3" = @{
        objectives = @("Learn distress tolerance", "Build coping strategies")
        required = @("MH-ER-009_distress_tolerance")
        recommended = @("MH-ER-008_urge_surfing")
        evidence = @("Coping strategy log")
    }

    "week-4" = @{
        objectives = @("Understand trauma responses", "Build awareness")
        required = @("MH-ER-012_trauma_responses")
        recommended = @()
        evidence = @("Trauma response worksheet")
    }

    "week-5" = @{
        objectives = @("Strengthen emotional regulation", "Use TIPP skills")
        required = @("MH-ER-010_tipp_skills")
        recommended = @("MH-ER-011_opposite_action")
        evidence = @("Regulation practice log")
    }

    "week-6" = @{
        objectives = @("Build routine stability", "Improve daily structure")
        required = @("PAR-ROU-001_morning_routines")
        recommended = @()
        evidence = @("Routine consistency log")
    }

    "week-7" = @{
        objectives = @("Strengthen self-awareness", "Improve emotional insight")
        required = @("MH-ER-007_emotion_wheel")
        recommended = @()
        evidence = @("Emotion tracking log")
    }

    "week-8" = @{
        objectives = @("Demonstrate stability", "Prepare long-term plan")
        required = @("MH-ER-013_stability_plan")
        recommended = @()
        evidence = @("Final stability review")
    }
}

Write-Host "Populating MH clinical content..."

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

Write-Host "MH clinical population complete."
