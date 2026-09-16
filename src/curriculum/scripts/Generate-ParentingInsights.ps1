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
