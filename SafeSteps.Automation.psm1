function Initialize-SafeStepsEvidenceSystem {
    $root = Join-Path $PSScriptRoot "..\engine\evidence"
    New-Item -ItemType Directory -Force -Path $root | Out-Null

    $folders = @(
        "daily-checkins",
        "weekly-accountability",
        "monthly-questionnaires",
        "skill-demonstrations",
        "uploads",
        "verification",
        "reports"
    )

    foreach ($f in $folders) {
        New-Item -ItemType Directory -Force -Path (Join-Path $root $f) | Out-Null
    }

    $index = @{
        evidence_root = $root
        created       = (Get-Date)
        folders       = $folders
    }

    $index | ConvertTo-Json -Depth 10 | Set-Content -Path (Join-Path $root "evidence-index.json") -Encoding UTF8
}

function New-SafeStepsDailyCheckIn {
    param(
        [string]$Date = (Get-Date -Format "yyyy-MM-dd"),
        [int]$Patience,
        [int]$Sobriety,
        [int]$Stress,
        [string]$Notes
    )

    $root = Join-Path $PSScriptRoot "..\engine\evidence\daily-checkins"
    $file = "$Date-daily.json"

    $entry = @{
        date      = $Date
        patience  = $Patience
        sobriety  = $Sobriety
        stress    = $Stress
        notes     = $Notes
        timestamp = (Get-Date)
    }

    $entry | ConvertTo-Json -Depth 10 | Set-Content -Path (Join-Path $root $file) -Encoding UTF8
}

function New-SafeStepsWeeklyAccountability {
    param(
        [string]$WeekId,
        [int]$LessonsCompleted,
        [int]$EvidenceUploads,
        [int]$BehaviourScore,
        [string]$Summary
    )

    $root = Join-Path $PSScriptRoot "..\engine\evidence\weekly-accountability"
    $file = "$WeekId-weekly-report.json"

    $report = @{
        week              = $WeekId
        lessons_completed = $LessonsCompleted
        evidence_uploads  = $EvidenceUploads
        behaviour_score   = $BehaviourScore
        summary           = $Summary
        timestamp         = (Get-Date)
    }

    $report | ConvertTo-Json -Depth 10 | Set-Content -Path (Join-Path $root $file) -Encoding UTF8
}

function New-SafeStepsMonthlyQuestionnaire {
    param(
        [string]$MonthId,
        [int]$Insight,
        [int]$EmotionalRegulation,
        [int]$ParentingConfidence,
        [int]$StressManagement,
        [string]$Reflection
    )

    $root = Join-Path $PSScriptRoot "..\engine\evidence\monthly-questionnaires"
    $file = "$MonthId-monthly.json"

    $entry = @{
        month                = $MonthId
        insight              = $Insight
        emotional_regulation = $EmotionalRegulation
        parenting_confidence = $ParentingConfidence
        stress_management    = $StressManagement
        reflection           = $Reflection
        timestamp            = (Get-Date)
    }

    $entry | ConvertTo-Json -Depth 10 | Set-Content -Path (Join-Path $root $file) -Encoding UTF8
}

function New-SafeStepsSkillDemonstration {
    param(
        [string]$SkillName,
        [string]$Description,
        [string]$FilePath
    )

    $root = Join-Path $PSScriptRoot "..\engine\evidence\skill-demonstrations"
    $id   = [guid]::NewGuid().ToString()
    $file = "$id-skill.json"

    $entry = @{
        id          = $id
        skill       = $SkillName
        description = $Description
        file        = $FilePath
        timestamp   = (Get-Date)
    }

    $entry | ConvertTo-Json -Depth 10 | Set-Content -Path (Join-Path $root $file) -Encoding UTF8
}

function New-SafeStepsVerification {
    param(
        [string]$VerifierName,
        [string]$Role,
        [string]$Notes,
        [string]$Attachment
    )

    $root = Join-Path $PSScriptRoot "..\engine\evidence\verification"
    $id   = [guid]::NewGuid().ToString()
    $file = "$id-verification.json"

    $entry = @{
        id         = $id
        verifier   = $VerifierName
        role       = $Role
        notes      = $Notes
        attachment = $Attachment
        timestamp  = (Get-Date)
    }

    $entry | ConvertTo-Json -Depth 10 | Set-Content -Path (Join-Path $root $file) -Encoding UTF8
}

function New-SafeStepsChangeScore {
    param(
        [int]$RiskReduction,
        [int]$Consistency,
        [int]$EmotionalStability,
        [int]$Sobriety,
        [int]$ParentingInsight
    )

    $root = Join-Path $PSScriptRoot "..\engine\evidence\reports"
    $file = "change-score.json"

    $score = [math]::Round(($RiskReduction + $Consistency + $EmotionalStability + $Sobriety + $ParentingInsight) / 5, 2)

    $entry = @{
        risk_reduction      = $RiskReduction
        consistency         = $Consistency
        emotional_stability = $EmotionalStability
        sobriety            = $Sobriety
        parenting_insight   = $ParentingInsight
        final_change_score  = $score
        timestamp           = (Get-Date)
    }

    $entry | ConvertTo-Json -Depth 10 | Set-Content -Path (Join-Path $root $file) -Encoding UTF8
}

function New-SafeStepsCourtReport {
    param(
        [string]$ParentName,
        [string]$ProgramName
    )

    $root = Join-Path $PSScriptRoot "..\engine\evidence"
    $out  = Join-Path $root "reports"
    $file = "court-report-$((Get-Date).ToString('yyyy-MM-dd')).json"

    $report = @{
        parent               = $ParentName
        program              = $ProgramName
        generated            = (Get-Date)
        daily_checkins       = Get-ChildItem -Path (Join-Path $root "daily-checkins") | ForEach-Object { Get-Content $_.FullName | ConvertFrom-Json }
        weekly_reports       = Get-ChildItem -Path (Join-Path $root "weekly-accountability") | ForEach-Object { Get-Content $_.FullName | ConvertFrom-Json }
        monthly_questionnaires = Get-ChildItem -Path (Join-Path $root "monthly-questionnaires") | ForEach-Object { Get-Content $_.FullName | ConvertFrom-Json }
        skill_demonstrations = Get-ChildItem -Path (Join-Path $root "skill-demonstrations") | ForEach-Object { Get-Content $_.FullName | ConvertFrom-Json }
        verifications        = Get-ChildItem -Path (Join-Path $root "verification") | ForEach-Object { Get-Content $_.FullName | ConvertFrom-Json }
        change_score         = Get-Content (Join-Path $root "reports\change-score.json") | ConvertFrom-Json
    }

    $report | ConvertTo-Json -Depth 20 | Set-Content -Path (Join-Path $out $file) -Encoding UTF8
}
