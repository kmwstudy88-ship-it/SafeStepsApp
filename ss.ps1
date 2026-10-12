param(
    [string]$Command,
    [Parameter(ValueFromRemainingArguments = $true)]
    $Args
)

Import-Module "C:\Users\SAFES\SafeStepsApp\scripts\SafeSteps.Automation.psm1" -Force

switch ($Command) {

    # -------------------------
    # DAILY CHECK-IN
    # -------------------------
    "daily" {
        $parsed = @{
            Patience = [int]$Args[$Args.IndexOf("-Patience") + 1]
            Sobriety = [int]$Args[$Args.IndexOf("-Sobriety") + 1]
            Stress   = [int]$Args[$Args.IndexOf("-Stress") + 1]
            Notes    = $Args[$Args.IndexOf("-Notes") + 1]
        }
        New-SafeStepsDailyCheckIn @parsed
    }

    # -------------------------
    # WEEKLY ACCOUNTABILITY
    # -------------------------
    "weekly" {
        $parsed = @{
            WeekId           = $Args[$Args.IndexOf("-WeekId") + 1]
            LessonsCompleted = [int]$Args[$Args.IndexOf("-LessonsCompleted") + 1]
            EvidenceUploads  = [int]$Args[$Args.IndexOf("-EvidenceUploads") + 1]
            BehaviourScore   = [int]$Args[$Args.IndexOf("-BehaviourScore") + 1]
            Summary          = $Args[$Args.IndexOf("-Summary") + 1]
        }
        New-SafeStepsWeeklyAccountability @parsed
    }

    # -------------------------
    # MONTHLY QUESTIONNAIRE
    # -------------------------
    "monthly" {
        $parsed = @{
            MonthId            = $Args[$Args.IndexOf("-MonthId") + 1]
            Insight            = [int]$Args[$Args.IndexOf("-Insight") + 1]
            EmotionalRegulation = [int]$Args[$Args.IndexOf("-EmotionalRegulation") + 1]
            ParentingConfidence = [int]$Args[$Args.IndexOf("-ParentingConfidence") + 1]
            StressManagement    = [int]$Args[$Args.IndexOf("-StressManagement") + 1]
            Reflection          = $Args[$Args.IndexOf("-Reflection") + 1]
        }
        New-SafeStepsMonthlyQuestionnaire @parsed
    }

    # -------------------------
    # SKILL DEMONSTRATION
    # -------------------------
    "skill" {
        New-SafeStepsSkillDemonstration @Args
    }

    # -------------------------
    # VERIFICATION
    # -------------------------
    "verify" {
        New-SafeStepsVerification @Args
    }

    # -------------------------
    # SOM
    # -------------------------
    "som" {
        $parsed = @{
            Tool     = $Args[$Args.IndexOf("-Tool") + 1]
            Score    = [int]$Args[$Args.IndexOf("-Score") + 1]
            Severity = $Args[$Args.IndexOf("-Severity") + 1]
        }
        New-SafeStepsSOM @parsed
    }

    # -------------------------
    # PROM
    # -------------------------
    "prom" {
        $parsed = @{
            Question = $Args[$Args.IndexOf("-Question") + 1]
            Score    = [int]$Args[$Args.IndexOf("-Score") + 1]
        }
        New-SafeStepsPROM @parsed
    }

    # -------------------------
    # GOAL
    # -------------------------
    "goal" {
        $parsed = @{
            GoalId        = $Args[$Args.IndexOf("-GoalId") + 1]
            Description   = $Args[$Args.IndexOf("-Description") + 1]
            BaselineScore = [int]$Args[$Args.IndexOf("-BaselineScore") + 1]
            CurrentScore  = [int]$Args[$Args.IndexOf("-CurrentScore") + 1]
            TargetScore   = [int]$Args[$Args.IndexOf("-TargetScore") + 1]
        }
        New-SafeStepsGoalUpdate @parsed
    }

    # -------------------------
    # REPORT / TREND / INDEX / REPAIR
    # -------------------------
    "report" { New-SafeStepsCourtReport @Args }
    "trend"  { Export-SafeStepsTrendData }
    "index"  { Update-SafeStepsEvidenceIndex }
    "repair" { Repair-SafeStepsEngine }

    default {
        Write-Host "Commands: daily, weekly, monthly, skill, verify, som, prom, goal, report, trend, index, repair"
    }
}
