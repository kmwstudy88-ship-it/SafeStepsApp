# === SAFE STEPS — AUTO LESSON GENERATOR v3 (30 LESSONS CLEAN) ===

$root = "C:\Users\SAFES\safesteps\safesteps-curriculum\lessons"

$lessons = @(
    # Grounding
    @{ path = "mental-health\grounding\MH-ER-001_grounding_basics.json"; title = "Grounding Basics"; },
    @{ path = "mental-health\grounding\MH-ER-002_54321_technique.json"; title = "5-4-3-2-1 Grounding Technique"; },
    @{ path = "mental-health\grounding\MH-ER-003_object_focus.json"; title = "Object Focus Grounding"; },
    @{ path = "mental-health\grounding\MH-ER-004_temperature_grounding.json"; title = "Temperature Change Grounding"; },
    @{ path = "mental-health\grounding\MH-ER-005_breathing_grounding.json"; title = "Breathing-Based Grounding"; },

    # Emotional Regulation
    @{ path = "mental-health\emotional-regulation\MH-ER-006_name_it_to_tame_it.json"; title = "Name It to Tame It"; },
    @{ path = "mental-health\emotional-regulation\MH-ER-007_emotion_wheel.json"; title = "Using the Emotion Wheel"; },
    @{ path = "mental-health\emotional-regulation\MH-ER-008_urge_surfing.json"; title = "Urge Surfing"; },
    @{ path = "mental-health\emotional-regulation\MH-ER-009_distress_tolerance.json"; title = "Distress Tolerance Basics"; },
    @{ path = "mental-health\emotional-regulation\MH-ER-010_tipp_skills.json"; title = "TIPP Skills"; },
    @{ path = "mental-health\emotional-regulation\MH-ER-011_opposite_action.json"; title = "Opposite Action"; },

    # Safety Planning
    @{ path = "safety\safety-planning\SAF-SP-001_what_is_a_safety_plan.json"; title = "What Is a Safety Plan?"; },
    @{ path = "safety\safety-planning\SAF-SP-002_warning_signs.json"; title = "Identifying Warning Signs"; },
    @{ path = "safety\safety-planning\SAF-SP-003_safe_people.json"; title = "Identifying Safe People"; },
    @{ path = "safety\safety-planning\SAF-SP-004_safe_places.json"; title = "Identifying Safe Places"; },
    @{ path = "safety\safety-planning\SAF-SP-005_escape_routes.json"; title = "Planning Escape Routes"; },
    @{ path = "safety\safety-planning\SAF-SP-006_emergency_bag.json"; title = "Building an Emergency Bag"; },
    @{ path = "safety\safety-planning\SAF-SP-007_code_words.json"; title = "Using Code Words"; },

    # DFV / Coercive Control
    @{ path = "dfv\coercive-control\DFV-CC-001_patterns.json"; title = "Patterns of Coercive Control"; },
    @{ path = "dfv\coercive-control\DFV-CC-002_cycle.json"; title = "Understanding the Cycle of Abuse"; },
    @{ path = "dfv\coercive-control\DFV-CC-003_red_flags.json"; title = "Recognising Red Flags"; },
    @{ path = "dfv\coercive-control\DFV-CC-004_gaslighting.json"; title = "Gaslighting and Reality Distortion"; },
    @{ path = "dfv\coercive-control\DFV-CC-005_financial_control.json"; title = "Financial Control Tactics"; },

    # Parenting
    @{ path = "parenting\routines\PAR-ROU-001_morning_routines.json"; title = "Building Morning Routines"; },
    @{ path = "parenting\routines\PAR-ROU-002_bedtime_routines.json"; title = "Creating Bedtime Routines"; },
    @{ path = "parenting\attachment\PAR-ATT-001_secure_attachment.json"; title = "Understanding Secure Attachment"; },
    @{ path = "parenting\attachment\PAR-ATT-002_play_connection.json"; title = "Connection Through Play"; },
    @{ path = "parenting\communication\PAR-COM-001_positive_language.json"; title = "Using Positive Language"; },

    # AOD
    @{ path = "aod\relapse-prevention\AOD-RP-001_triggers.json"; title = "Identifying Triggers"; },
    @{ path = "aod\relapse-prevention\AOD-RP-002_craving_management.json"; title = "Managing Cravings"; }
)

foreach ($lesson in $lessons) {

    $fullPath = Join-Path $root $lesson.path
    $folder = Split-Path $fullPath -Parent

    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
    }

    $json = @"
{
  "id": "$(Split-Path $lesson.path -LeafBase)",
  "title": "$($lesson.title)",
  "objectives": [],
  "activities": [],
  "evidence": [],
  "created_at": "",
  "updated_at": ""
}
"@

    $json | Set-Content -Path $fullPath -Encoding UTF8
}

Write-Host "30 lessons generated successfully."
