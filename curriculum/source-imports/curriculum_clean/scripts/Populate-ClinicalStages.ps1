# === SAFE STEPS — CLINICAL STAGE POPULATION ENGINE ===

$root = "C:\Users\SAFES\safesteps\safesteps-curriculum\programs\reunification-24m"

# Clinical content for each stage
$clinical = @{

    "phase-1-stage-1" = @{
        objectives = @(
            "Establish immediate physical and emotional safety",
            "Learn grounding and distress tolerance skills",
            "Begin personal safety planning"
        )
        required = @(
            "MH-ER-001_grounding_basics",
            "MH-ER-002_54321_technique",
            "SAF-SP-001_what_is_a_safety_plan"
        )
        recommended = @(
            "MH-ER-009_distress_tolerance",
            "SAF-SP-003_safe_people"
        )
        evidence = @(
            "Completed personal safety plan",
            "Demonstrated grounding technique"
        )
    }

    "phase-1-stage-2" = @{
        objectives = @(
            "Identify coercive control patterns",
            "Recognise red flags and risk indicators",
            "Develop early warning systems"
        )
        required = @(
            "DFV-CC-001_patterns",
            "DFV-CC-003_red_flags",
            "SAF-SP-002_warning_signs"
        )
        recommended = @(
            "DFV-CC-004_gaslighting",
            "SAF-SP-004_safe_places"
        )
        evidence = @(
            "Risk awareness worksheet",
            "Identified personal red flags"
        )
    }

    "phase-1-stage-3" = @{
        objectives = @(
            "Build emotional regulation capacity",
            "Learn TIPP skills",
            "Reduce crisis behaviours"
        )
        required = @(
            "MH-ER-010_tipp_skills",
            "MH-ER-011_opposite_action",
            "MH-ER-007_emotion_wheel"
        )
        recommended = @(
            "MH-ER-008_urge_surfing"
        )
        evidence = @(
            "Demonstrated 2 regulation strategies",
            "Weekly emotion tracking"
        )
    }

    # === PHASE 2 ===

    "phase-2-stage-1" = @{
        objectives = @(
            "Establish predictable parenting routines",
            "Build structure for children"
        )
        required = @(
            "PAR-ROU-001_morning_routines",
            "PAR-ROU-002_bedtime_routines"
        )
        recommended = @(
            "PAR-COM-001_positive_language"
        )
        evidence = @(
            "Routine plan submitted",
            "Demonstrated consistency for 2 weeks"
        )
    }

    "phase-2-stage-2" = @{
        objectives = @(
            "Strengthen secure attachment",
            "Build connection through play"
        )
        required = @(
            "PAR-ATT-001_secure_attachment",
            "PAR-ATT-002_play_connection"
        )
        recommended = @(
            "MH-ER-006_name_it_to_tame_it"
        )
        evidence = @(
            "Video or reflection of connection activity"
        )
    }

    "phase-2-stage-3" = @{
        objectives = @(
            "Improve parent-child communication",
            "Use positive language",
            "Support child emotional needs"
        )
        required = @(
            "PAR-COM-001_positive_language",
            "MH-ER-007_emotion_wheel"
        )
        recommended = @(
            "MH-ER-009_distress_tolerance"
        )
        evidence = @(
            "Demonstrated co-regulation in session"
        )
    }

    # === PHASE 3 ===

    "phase-3-stage-1" = @{
        objectives = @(
            "Apply safety planning in real scenarios",
            "Demonstrate risk recognition"
        )
        required = @(
            "SAF-SP-005_escape_routes",
            "SAF-SP-006_emergency_bag",
            "SAF-SP-007_code_words"
        )
        recommended = @()
        evidence = @(
            "Updated safety plan",
            "Safety rehearsal completed"
        )
    }

    "phase-3-stage-2" = @{
        objectives = @(
            "Demonstrate insight into past harm",
            "Show accountability",
            "Reduce minimisation and denial"
        )
        required = @(
            "DFV-CC-002_cycle",
            "DFV-CC-004_gaslighting",
            "DFV-CC-005_financial_control"
        )
        recommended = @()
        evidence = @(
            "Accountability reflection",
            "Caseworker observation"
        )
    }

    "phase-3-stage-3" = @{
        objectives = @(
            "Use regulation skills under stress",
            "Reduce reactive behaviours"
        )
        required = @(
            "MH-ER-008_urge_surfing",
            "MH-ER-010_tipp_skills"
        )
        recommended = @()
        evidence = @(
            "4-week behaviour log",
            "Demonstrated skill use in session"
        )
    }

    # === PHASE 4 ===

    "phase-4-stage-1" = @{
        objectives = @(
            "Maintain routines during contact",
            "Demonstrate safe supervision"
        )
        required = @(
            "PAR-ROU-001_morning_routines",
            "PAR-COM-001_positive_language"
        )
        recommended = @()
        evidence = @(
            "Contact session reports",
            "Routine consistency logs"
        )
    }

    "phase-4-stage-2" = @{
        objectives = @(
            "Prepare home environment",
            "Demonstrate sustained safety"
        )
        required = @(
            "SAF-SP-003_safe_people",
            "SAF-SP-004_safe_places"
        )
        recommended = @()
        evidence = @(
            "Home safety checklist",
            "Caseworker home visit report"
        )
    }

    # === PHASE 5 ===

    "phase-5-stage-1" = @{
        objectives = @(
            "Identify triggers",
            "Manage cravings",
            "Maintain sobriety plan"
        )
        required = @(
            "AOD-RP-001_triggers",
            "AOD-RP-002_craving_management"
        )
        recommended = @()
        evidence = @(
            "AOD relapse prevention plan"
        )
    }

    "phase-5-stage-2" = @{
        objectives = @(
            "Maintain safety strategies",
            "Sustain parenting capacity",
            "Demonstrate long-term change"
        )
        required = @(
            "SAF-SP-001_what_is_a_safety_plan",
            "DFV-CC-001_patterns"
        )
        recommended = @()
        evidence = @(
            "Final safety plan",
            "3-month stability review"
        )
    }
}

Write-Host "Populating clinical content into all stages..."
Write-Host ""

# Loop through all phases and stages
$phases = Get-ChildItem $root -Directory

foreach ($phase in $phases) {

    $stages = Get-ChildItem $phase.FullName -Directory

    foreach ($stage in $stages) {

        $key = "$($phase.Name)-$($stage.Name)"

        if ($clinical.ContainsKey($key)) {

            $path = Join-Path $stage.FullName "stage.json"

            $obj = Get-Content $path -Raw | ConvertFrom-Json

            $obj.objectives = $clinical[$key].objectives
            $obj.required_lessons = $clinical[$key].required
            $obj.recommended_lessons = $clinical[$key].recommended
            $obj.evidence = $clinical[$key].evidence

            $obj | ConvertTo-Json -Depth 10 | Set-Content $path -Encoding UTF8

            Write-Host "Updated $key"
        }
    }
}

Write-Host ""
Write-Host "Clinical stage population complete."