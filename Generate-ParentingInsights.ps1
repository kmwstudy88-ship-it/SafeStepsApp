# Section A – Parent Wellbeing
$sectionAPath = Join-Path $assessmentRoot "SectionA_ParentWellbeing"
New-Item -ItemType Directory -Path $sectionAPath -Force | Out-Null

$sectionA = @{
    sectionId = "A"
    name      = "Parent Wellbeing"
    groups    = @(
        @{
            id    = "A_MentalHealth"
            label = "Mental Health"
            items = @(
                @{ id="A_MH_Overwhelmed"; text="How often do you feel overwhelmed?"; type="likert_frequency"; scale="1=Never;5=Very often"; domain="mental_health"; direction="higher_risk_higher_score" }
            )
        }
    )
}

$sectionA | ConvertTo-Json -Depth 10 | Set-Content -Path (Join-Path $sectionAPath "sectionA.json") -Encoding UTF8
$scoringPath = Join-Path $assessmentRoot "scoring.json"

$scoring = @{
    parenting_strength = @{
        sources=@("basic_needs","emotional_care","supervision","parent_child_relationship")
        method="weighted_average"
    }
    child_wellbeing = @{
        sources=@("child_development","school_engagement","stability")
        method="weighted_average"
    }
    family_stability = @{
        sources=@("home_environment","routine","predictability","housing_instability")
        method="weighted_average"
    }
    protective_factors = @{
        sources=@("family_support","school_involvement","community_engagement","positive_relationships","access_to_services")
        method="weighted_sum"
    }
    growth_opportunities = @{
        method="inverse_strength"
    }
}

$scoring | ConvertTo-Json -Depth 10 | Set-Content -Path $scoringPath -Encoding UTF8
$programMatchingPath = Join-Path $assessmentRoot "program-matching.json"

$programMatching = @{
    programs=@(
        @{ id="PPF"; name="Positive Parenting Foundations"; triggers=@{ max_parenting_strength=70 } },
        @{ id="TIP"; name="Trauma-Informed Parenting"; triggers=@{ risk_flags=@("dv_exposure_risk","conflict_risk","mental_health_risk") } }
    )
}

$programMatching | ConvertTo-Json -Depth 10 | Set-Content -Path $programMatchingPath -Encoding UTF8
$matchingEnginePath = Join-Path $assessmentRoot "matching-engine.json"

$matchingEngine = @{
    engine=@{
        name="SafeSteps Parenting Insights Matching Engine"Write-Host "Created Section A" -ForegroundColor DarkGray

        version="1.0.0"
    }
    logic=@{
        risk_priority=@(
            @{ flag="dv_exposure_risk"; recommend=@("TIP","PPF") }
        )
    }
}

$matchingEngine | ConvertTo-Json -Depth 10 | Set-Content -Path $matchingEnginePath -Encoding UTF8
Write-Host "Created Section A" -ForegroundColor DarkGray
try {
    # generation code
} catch {
    Write-Host "Error generating assessment: $_" -ForegroundColor Red
}
