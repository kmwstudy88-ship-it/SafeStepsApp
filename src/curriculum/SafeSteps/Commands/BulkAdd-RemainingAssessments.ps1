. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-RemainingAssessments {

    $ts = Get-Timestamp
    $root = Join-Path $PSScriptRoot "..\..\content\assessments"

    if (-not (Test-Path $root)) {
        New-Item -ItemType Directory -Path $root -Force | Out-Null
    }

    $assessments = @(
        @{ id="dfv_01"; type="dfv"; assessor="Caseworker" },
        @{ id="housing_01"; type="housing"; assessor="Caseworker" },
        @{ id="life_skills_01"; type="life_skills"; assessor="Caseworker" },
        @{ id="support_network_01"; type="support_network"; assessor="Caseworker" },
        @{ id="behaviour_change_01"; type="behaviour_change"; assessor="Caseworker" },
        @{ id="cultural_identity_01"; type="cultural_identity"; assessor="Caseworker" },
        @{ id="education_employment_01"; type="education_employment"; assessor="Caseworker" },
        @{ id="child_development_01"; type="child_development"; assessor="Caseworker" },
        @{ id="contact_supervision_01"; type="contact_supervision"; assessor="Caseworker" },
        @{ id="reunification_readiness_01"; type="reunification_readiness"; assessor="Caseworker" }
    )

    foreach ($a in $assessments) {

        $domains = switch ($a.type) {

            "dfv" {
                @(
                    @{ id="history"; label="History of DFV"; score=$null; notes=$null },
                    @{ id="current_risk"; label="Current risk"; score=$null; notes=$null },
                    @{ id="perpetrator_behaviour"; label="Perpetrator behaviour"; score=$null; notes=$null },
                    @{ id="victim_support"; label="Victim support"; score=$null; notes=$null },
                    @{ id="impact_on_children"; label="Impact on children"; score=$null; notes=$null }
                )
            }

            "housing" {
                @(
                    @{ id="stability"; label="Housing stability"; score=$null; notes=$null },
                    @{ id="safety"; label="Housing safety"; score=$null; notes=$null },
                    @{ id="suitability"; label="Suitability for children"; score=$null; notes=$null },
                    @{ id="risk_factors"; label="Environmental risk factors"; score=$null; notes=$null }
                )
            }

            "life_skills" {
                @(
                    @{ id="budgeting"; label="Budgeting"; score=$null; notes=$null },
                    @{ id="time_management"; label="Time management"; score=$null; notes=$null },
                    @{ id="household_management"; label="Household management"; score=$null; notes=$null },
                    @{ id="problem_solving"; label="Problem solving"; score=$null; notes=$null }
                )
            }

            "support_network" {
                @(
                    @{ id="safe_supports"; label="Safe supports"; score=$null; notes=$null },
                    @{ id="extended_family"; label="Extended family"; score=$null; notes=$null },
                    @{ id="community_links"; label="Community links"; score=$null; notes=$null },
                    @{ id="professional_supports"; label="Professional supports"; score=$null; notes=$null }
                )
            }

            "behaviour_change" {
                @(
                    @{ id="insight"; label="Insight into behaviour"; score=$null; notes=$null },
                    @{ id="motivation"; label="Motivation to change"; score=$null; notes=$null },
                    @{ id="follow_through"; label="Follow-through"; score=$null; notes=$null },
                    @{ id="relapse_risk"; label="Relapse risk"; score=$null; notes=$null }
                )
            }

            "cultural_identity" {
                @(
                    @{ id="cultural_needs"; label="Cultural needs"; score=$null; notes=$null },
                    @{ id="community_connection"; label="Community connection"; score=$null; notes=$null },
                    @{ id="identity_support"; label="Identity support"; score=$null; notes=$null }
                )
            }

            "education_employment" {
                @(
                    @{ id="education_status"; label="Education status"; score=$null; notes=$null },
                    @{ id="employment_status"; label="Employment status"; score=$null; notes=$null },
                    @{ id="barriers"; label="Barriers"; score=$null; notes=$null },
                    @{ id="goals"; label="Goals"; score=$null; notes=$null }
                )
            }

            "child_development" {
                @(
                    @{ id="physical"; label="Physical development"; score=$null; notes=$null },
                    @{ id="emotional"; label="Emotional development"; score=$null; notes=$null },
                    @{ id="social"; label="Social development"; score=$null; notes=$null },
                    @{ id="cognitive"; label="Cognitive development"; score=$null; notes=$null }
                )
            }

            "contact_supervision" {
                @(
                    @{ id="quality_of_contact"; label="Quality of contact"; score=$null; notes=$null },
                    @{ id="responsiveness"; label="Responsiveness to child"; score=$null; notes=$null },
                    @{ id="safety_during_contact"; label="Safety during contact"; score=$null; notes=$null },
                    @{ id="supervision_requirements"; label="Supervision requirements"; score=$null; notes=$null }
                )
            }

            "reunification_readiness" {
                @(
                    @{ id="risk_reduction"; label="Risk reduction"; score=$null; notes=$null },
                    @{ id="capacity_growth"; label="Capacity growth"; score=$null; notes=$null },
                    @{ id="consistency"; label="Consistency over time"; score=$null; notes=$null },
                    @{ id="child_wishes"; label="Child wishes"; score=$null; notes=$null }
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

