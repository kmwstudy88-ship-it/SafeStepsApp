. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-Assessments {

    $ts = Get-Timestamp
    $root = Join-Path $PSScriptRoot "..\..\content\assessments"

    if (-not (Test-Path $root)) {
        New-Item -ItemType Directory -Path $root -Force | Out-Null
    }

    $assessments = @(
        @{
            id = "child_safety_01"
            type = "child_safety"
            assessor = "Caseworker"
        },
        @{
            id = "parenting_capacity_01"
            type = "parenting_capacity"
            assessor = "Caseworker"
        },
        @{
            id = "substance_use_01"
            type = "substance_use"
            assessor = "Caseworker"
        },
        @{
            id = "mental_health_01"
            type = "mental_health"
            assessor = "Caseworker"
        },
        @{
            id = "family_strengths_01"
            type = "family_strengths"
            assessor = "Caseworker"
        }
    )

    foreach ($a in $assessments) {

        $domains = switch ($a.type) {

            "child_safety" {
                @(
                    @{ id="immediate_danger"; label="Immediate danger"; score=$null; notes=$null },
                    @{ id="supervision"; label="Supervision"; score=$null; notes=$null },
                    @{ id="basic_needs"; label="Basic needs"; score=$null; notes=$null },
                    @{ id="exposure_to_violence"; label="Exposure to violence"; score=$null; notes=$null },
                    @{ id="safe_housing"; label="Safe housing"; score=$null; notes=$null },
                    @{ id="safety_planning"; label="Safety planning"; score=$null; notes=$null }
                )
            }

            "parenting_capacity" {
                @(
                    @{ id="understanding_needs"; label="Understanding child needs"; score=$null; notes=$null },
                    @{ id="consistency"; label="Consistency and routines"; score=$null; notes=$null },
                    @{ id="boundaries"; label="Boundaries and supervision"; score=$null; notes=$null },
                    @{ id="emotional_availability"; label="Emotional availability"; score=$null; notes=$null },
                    @{ id="insight_into_harm"; label="Insight into harm"; score=$null; notes=$null }
                )
            }

            "substance_use" {
                @(
                    @{ id="pattern_of_use"; label="Pattern of use"; score=$null; notes=$null },
                    @{ id="impact_on_parenting"; label="Impact on parenting"; score=$null; notes=$null },
                    @{ id="triggers"; label="Triggers"; score=$null; notes=$null },
                    @{ id="treatment_history"; label="Treatment history"; score=$null; notes=$null },
                    @{ id="relapse_risk"; label="Relapse risk"; score=$null; notes=$null }
                )
            }

            "mental_health" {
                @(
                    @{ id="current_symptoms"; label="Current symptoms"; score=$null; notes=$null },
                    @{ id="stability"; label="Stability"; score=$null; notes=$null },
                    @{ id="treatment_engagement"; label="Treatment engagement"; score=$null; notes=$null },
                    @{ id="impact_on_parenting"; label="Impact on parenting"; score=$null; notes=$null },
                    @{ id="crisis_history"; label="Crisis history"; score=$null; notes=$null }
                )
            }

            "family_strengths" {
                @(
                    @{ id="safe_adults"; label="Safe adults"; score=$null; notes=$null },
                    @{ id="routines"; label="Routines"; score=$null; notes=$null },
                    @{ id="cultural_strengths"; label="Cultural strengths"; score=$null; notes=$null },
                    @{ id="problem_solving"; label="Problem solving"; score=$null; notes=$null },
                    @{ id="motivation_to_change"; label="Motivation to change"; score=$null; notes=$null }
                )
            }
        }

        $assessment = @{
            id              = $a.id
            type            = $a.type
            assessor        = $a.assessor
            created_at      = $ts
            updated_at      = $ts
            completed_at    = $null
            domains         = $domains
            overall_risk    = $null
            overall_strength= $null
            recommendations = @()
        }

        $path = Join-Path $root "$($a.id).json"
        $assessment | ConvertTo-Json -Depth 20 | Set-Content $path

        Write-Host "Created assessment: $($a.id) ($($a.type))"
    }
}

