# === SAFE STEPS — HOME AGAIN CLINICAL POPULATION ===

$root = "C:\Users\SAFES\safesteps\safesteps-curriculum\programs\home-again-12m"

$clinical = @{

    "phase-1-stage-1" = @{
        objectives = @("Re-establish home stability", "Maintain routines", "Ensure safe environment")
        required = @("PAR-ROU-001_morning_routines", "SAF-SP-003_safe_people")
        recommended = @("MH-ER-009_distress_tolerance")
        evidence = @("Weekly home stability log")
    }

    "phase-1-stage-2" = @{
        objectives = @("Strengthen emotional regulation", "Maintain safety planning")
        required = @("MH-ER-010_tipp_skills", "SAF-SP-001_what_is_a_safety_plan")
        recommended = @("MH-ER-007_emotion_wheel")
        evidence = @("Updated safety plan")
    }

    "phase-2-stage-1" = @{
        objectives = @("Strengthen attachment", "Improve communication")
        required = @("PAR-ATT-001_secure_attachment", "PAR-COM-001_positive_language")
        recommended = @("PAR-ATT-002_play_connection")
        evidence = @("Attachment activity reflection")
    }

    "phase-2-stage-2" = @{
        objectives = @("Maintain routines independently", "Demonstrate consistent parenting")
        required = @("PAR-ROU-002_bedtime_routines")
        recommended = @()
        evidence = @("Routine consistency logs")
    }

    "phase-3-stage-1" = @{
        objectives = @("Maintain long-term safety", "Demonstrate stable home environment")
        required = @("SAF-SP-004_safe_places")
        recommended = @()
        evidence = @("Home safety review")
    }

    "phase-3-stage-2" = @{
        objectives = @("Sustain emotional stability", "Demonstrate long-term change")
        required = @("MH-ER-011_opposite_action")
        recommended = @()
        evidence = @("3-month stability review")
    }
}

Write-Host "Populating clinical content..."

foreach ($phase in Get-ChildItem $root -Directory) {
    foreach ($stage in Get-ChildItem $phase.FullName -Directory) {

        $key = "$($phase.Name)-$($stage.Name)"
        $path = Join-Path $stage.FullName "stage.json"

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
}

Write-Host "Clinical population complete."
