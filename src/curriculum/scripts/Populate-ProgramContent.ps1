# =====================================================================
# SAFE STEPS — FULL PROGRAM CONTENT POPULATOR (MODE C)
# 24m Reunification + 6–12m Home Again
# =====================================================================

$Root           = Get-Location
$ProgramsPath   = Join-Path $Root "programs"
$Reunification  = Join-Path $ProgramsPath "reunification-24m"
$HomeAgain      = Join-Path $ProgramsPath "home-again-12m"

Write-Host "`n=== POPULATING PROGRAM CONTENT (MODE C) ===`n"

# ---------------------------------------------------------------------
# STAGE LOGIC (HIGH-LEVEL THEMES)
# ---------------------------------------------------------------------

$StageProfiles = @{
    "stage-01" = @{
        Focus      = "Stabilisation & Accountability"
        Tasks      = @(
            "Complete accountability reflection for this week",
            "Identify one behaviour that harmed your child and write about it",
            "Practice one safety skill every day"
        )
        Milestones = @(
            "Parent acknowledges specific harm in writing",
            "No violent/abusive incidents for 7 days"
        )
        Evidence   = @(
            "Upload weekly reflection on harm and responsibility",
            "Worker note confirming no incidents reported this week"
        )
        Daily      = @(
            "Morning grounding (5 minutes)",
            "Evening reflection: 'How did I keep my child safer today?'"
        )
    }
    "stage-02" = @{
        Focus      = "Trauma & Triggers"
        Tasks      = @(
            "Map 3 personal triggers and 3 child triggers",
            "Practice one regulation skill when triggered",
            "Complete trauma education module for this week"
        )
        Milestones = @(
            "Parent identifies at least 10 triggers over this stage",
            "Parent demonstrates 3 regulation skills in session"
        )
        Evidence   = @(
            "Upload trigger map photo or document",
            "Worker note confirming regulation skill use"
        )
        Daily      = @(
            "Check-in: 'What triggered me today?'",
            "Regulation practice (breathing, grounding, or movement)"
        )
    }
    "stage-03" = @{
        Focus      = "Parenting Foundations"
        Tasks      = @(
            "Complete child needs profile for one child",
            "Practice one non-reactive response each day",
            "Use emotional coaching script once during contact"
        )
        Milestones = @(
            "Parent completes child needs profile",
            "Parent demonstrates non-reactive response in contact"
        )
        Evidence   = @(
            "Upload child needs profile",
            "Worker observation note from contact"
        )
        Daily      = @(
            "Read child needs list each morning",
            "Evening check: 'Did I respond, not react?'"
        )
    }
    "stage-04" = @{
        Focus      = "Safe Home Environment"
        Tasks      = @(
            "Complete home safety checklist",
            "Create 3 predictable daily routines",
            "Remove one unsafe item or pattern from the home"
        )
        Milestones = @(
            "Home safety checklist completed",
            "Routines established and followed for 2 weeks"
        )
        Evidence   = @(
            "Upload photo of safety changes",
            "Routine chart or schedule"
        )
        Daily      = @(
            "Morning routine start on time",
            "Evening home safety check"
        )
    }
    "stage-05" = @{
        Focus      = "Healthy Relationships"
        Tasks      = @(
            "Practice respectful communication in one difficult conversation",
            "Use de-escalation steps during conflict",
            "Attend one co-parenting or relationship support session"
        )
        Milestones = @(
            "No hostile communication for 30 days",
            "Parent uses de-escalation in front of worker"
        )
        Evidence   = @(
            "Worker note on communication change",
            "Self-report log of conflict handled safely"
        )
        Daily      = @(
            "Pause before responding in conflict",
            "End-of-day relationship reflection"
        )
    }
    "stage-06" = @{
        Focus      = "Child Contact Progression"
        Tasks      = @(
            "Prepare emotionally before each contact",
            "Follow child-led pace during visits",
            "Avoid any blaming or pressuring language"
        )
        Milestones = @(
            "Worker approves progression of contact level",
            "Child reports feeling safer during contact"
        )
        Evidence   = @(
            "Worker contact report",
            "Child feedback (where appropriate)"
        )
        Daily      = @(
            "Pre-contact grounding",
            "Post-contact reflection: 'What felt safe/unsafe?'"
        )
    }
    "stage-07" = @{
        Focus      = "Behaviour Change Deepening"
        Tasks      = @(
            "Identify one old pattern and one new pattern each week",
            "Use relapse prevention plan when stressed",
            "Attend all scheduled support sessions"
        )
        Milestones = @(
            "90 days incident-free",
            "Relapse prevention plan used at least twice"
        )
        Evidence   = @(
            "Upload behaviour change log",
            "Worker note on consistency"
        )
        Daily      = @(
            "Morning: review behaviour change plan",
            "Evening: log one choice that supported safety"
        )
    }
    "stage-08" = @{
        Focus      = "Family Healing"
        Tasks      = @(
            "Plan one repair conversation with support",
            "Engage in one family healing activity",
            "Listen to child voice without defensiveness"
        )
        Milestones = @(
            "Child reports feeling heard",
            "At least one repair conversation completed"
        )
        Evidence   = @(
            "Worker note on repair conversation",
            "Photo or description of healing activity"
        )
        Daily      = @(
            "Ask: 'How can I make my child feel safer today?'",
            "Evening gratitude or connection moment"
        )
    }
    "stage-09" = @{
        Focus      = "Reunification Preparation"
        Tasks      = @(
            "Complete home readiness checklist",
            "Update safety plan with worker",
            "Prepare emotional plan for child’s return"
        )
        Milestones = @(
            "Worker signs reunification readiness",
            "Safety plan approved"
        )
        Evidence   = @(
            "Home readiness checklist",
            "Signed safety plan"
        )
        Daily      = @(
            "Review reunification plan",
            "Visualise safe interactions with child"
        )
    }
    "stage-10" = @{
        Focus      = "Reunification Transition"
        Tasks      = @(
            "Follow transition schedule exactly",
            "Complete daily check-ins with worker/app",
            "Maintain routines during transition"
        )
        Milestones = @(
            "Child returns home",
            "No major safety incidents during transition"
        )
        Evidence   = @(
            "Daily check-in logs",
            "Worker transition report"
        )
        Daily      = @(
            "Morning transition check",
            "Evening stability reflection"
        )
    }
    "stage-11" = @{
        Focus      = "Post-Return Stabilisation"
        Tasks      = @(
            "Hold weekly family meeting",
            "Maintain school/health engagement",
            "Use relapse prevention when stressed"
        )
        Milestones = @(
            "60 days stable home life",
            "No child protection concerns raised"
        )
        Evidence   = @(
            "Family meeting notes",
            "School/health attendance records"
        )
        Daily      = @(
            "Morning routine with child",
            "Evening family check-in"
        )
    }
    "stage-12" = @{
        Focus      = "Long-Term Safety & Independence"
        Tasks      = @(
            "Create long-term safety plan",
            "Connect with at least one community support",
            "Plan for future stressors and responses"
        )
        Milestones = @(
            "Case closure readiness",
            "Community supports in place"
        )
        Evidence   = @(
            "Long-term safety plan document",
            "List of community supports"
        )
        Daily      = @(
            "Review long-term goals",
            "End-of-day safety reflection"
        )
    }
}

# ---------------------------------------------------------------------
# HELPER: BUILD WEEK CONTENT OBJECT
# ---------------------------------------------------------------------

function New-WeekContent {
    param(
        [string]$StageSlug,
        [string]$WeekSlug,
        [hashtable]$Profile
    )

    return [ordered]@{
        id        = $WeekSlug
        slug      = $WeekSlug
        focus     = $Profile.Focus
        tasks     = $Profile.Tasks
        milestones= $Profile.Milestones
        evidence  = $Profile.Evidence
        daily     = $Profile.Daily
        stage     = $StageSlug
    }
}

# ---------------------------------------------------------------------
# 24-MONTH PROGRAM — POPULATE ALL WEEKS
# ---------------------------------------------------------------------

$Stages = Get-ChildItem $Reunification -Directory

foreach ($Stage in $Stages) {

    $StageSlug = $Stage.Name

    if (-not $StageProfiles.ContainsKey($StageSlug)) {
        Write-Host "[WARN] No profile for $StageSlug — skipping content" -ForegroundColor Yellow
        continue
    }

    $Profile = $StageProfiles[$StageSlug]

    $Weeks = Get-ChildItem $Stage.FullName -Directory

    foreach ($Week in $Weeks) {

        $WeekSlug = $Week.Name

        $Content   = New-WeekContent -StageSlug $StageSlug -WeekSlug $WeekSlug -Profile $Profile
        $TasksPath = Join-Path $Week.FullName "tasks.json"
        $MilPath   = Join-Path $Week.FullName "milestones.json"
        $EviPath   = Join-Path $Week.FullName "evidence.json"
        $DailyPath = Join-Path $Week.FullName "daily-tasks.json"

        # Write structured JSON
        $Content.tasks      | ConvertTo-Json -Depth 5 | Out-File $TasksPath   -Encoding utf8
        $Content.milestones | ConvertTo-Json -Depth 5 | Out-File $MilPath     -Encoding utf8
        $Content.evidence   | ConvertTo-Json -Depth 5 | Out-File $EviPath     -Encoding utf8
        $Content.daily      | ConvertTo-Json -Depth 5 | Out-File $DailyPath   -Encoding utf8

        Write-Host "[WEEK] $StageSlug / $WeekSlug populated"
    }
}

# ---------------------------------------------------------------------
# HOME AGAIN PROGRAM — SIMPLE PHASE LOGIC
# ---------------------------------------------------------------------

$HomeProfiles = @{
    "phase-01" = @{
        Focus      = "Stabilisation after return home"
        Tasks      = @(
            "Establish 3 daily routines with child",
            "Complete weekly emotional safety check",
            "Maintain contact with support worker"
        )
        Milestones = @(
            "First 30 days at home stable",
            "Child reports feeling mostly safe"
        )
        Evidence   = @(
            "Routine chart",
            "Worker notes"
        )
        Daily      = @(
            "Morning routine",
            "Evening emotional check-in"
        )
    }
    "phase-02" = @{
        Focus      = "Consolidation of parenting and safety"
        Tasks      = @(
            "Hold weekly family meeting",
            "Maintain school/health engagement",
            "Use relapse prevention plan when stressed"
        )
        Milestones = @(
            "60 days stable home life",
            "No major safety concerns"
        )
        Evidence   = @(
            "Family meeting notes",
            "School/health records"
        )
        Daily      = @(
            "Daily check-in with child",
            "End-of-day safety reflection"
        )
    }
    "phase-03" = @{
        Focus      = "Independence and long-term safety"
        Tasks      = @(
            "Create long-term safety and support plan",
            "Connect with community supports",
            "Plan for future stressors"
        )
        Milestones = @(
            "Case closure readiness",
            "Supports in place"
        )
        Evidence   = @(
            "Long-term plan document",
            "Support contact list"
        )
        Daily      = @(
            "Review long-term goals",
            "Daily gratitude or connection moment"
        )
    }
}

$Phases = Get-ChildItem $HomeAgain -Directory

foreach ($Phase in $Phases) {

    $PhaseSlug = $Phase.Name

    if (-not $HomeProfiles.ContainsKey($PhaseSlug)) {
        Write-Host "[WARN] No profile for $PhaseSlug — skipping content" -ForegroundColor Yellow
        continue
    }

    $Profile   = $HomeProfiles[$PhaseSlug]
    $TasksPath = Join-Path $Phase.FullName "tasks.json"
    $MilPath   = Join-Path $Phase.FullName "milestones.json"
    $EviPath   = Join-Path $Phase.FullName "evidence.json"
    $DailyPath = Join-Path $Phase.FullName "daily-tasks.json"

    $Profile.Tasks      | ConvertTo-Json -Depth 5 | Out-File $TasksPath   -Encoding utf8
    $Profile.Milestones | ConvertTo-Json -Depth 5 | Out-File $MilPath     -Encoding utf8
    $Profile.Evidence   | ConvertTo-Json -Depth 5 | Out-File $EviPath     -Encoding utf8
    $Profile.Daily      | ConvertTo-Json -Depth 5 | Out-File $DailyPath   -Encoding utf8

    Write-Host "[PHASE] $PhaseSlug populated"
}

Write-Host "`n=== COMPLETE: All weeks and phases populated with full logic ===`n"
