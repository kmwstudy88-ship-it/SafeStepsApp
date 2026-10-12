# ==========================================
# SAFE STEPS Full Production Generator
# Generates all 1,170 challenges
# ==========================================

# ==========================================
# SAFE STEPS Full Production Generator
# Generates all 1,170 challenges
# ==========================================

# 1. Define all categories with numbering ranges
$categories = @{
    "Parent Challenges"                   = 1..160
    "Family Challenges"                   = 161..250
    "Child Challenges"                    = 251..380
    "Teen Challenges"                     = 381..500
    "Father Challenges"                   = 501..590
    "Mother Challenges"                   = 591..690
    "Mental Health Challenges"            = 691..810
    "Domestic and Family Violence Challenges" = 811..930
    "Alcohol and Other Drugs Challenges"  = 931..1050
    "Healthy Relationships Challenges"    = 1051..1170
}

# 2. Master SAFE STEPS Template (25 sections)
$baseStructure = @{
    challenge_number      = ""
    category              = ""
    title                 = ""

    welcome_overview      = @{
        purpose        = ""
        importance     = ""
        estimated_time = ""
        difficulty     = ""
        skills         = @()
    }
    learning_outcomes     = @()
    pre_assessment        = @{
        baseline_confidence = ""
        baseline_knowledge  = ""
    }
    self_reflection       = @{
        strengths = ""
        challenges = ""
    }
    what_you_will_learn   = ""
    core_lesson_1         = ""
    core_lesson_2         = ""
    core_lesson_3         = ""
    research_highlights   = ""
    real_life_example     = ""
    interactive_activity_1 = ""
    interactive_activity_2 = ""
    scenario_practice     = @()
    knowledge_quiz        = @{
        questions = @()
        feedback  = ""
    }
    daily_challenge       = ""
    weekly_challenge      = ""
    family_challenge      = ""
    child_activity        = ""
    journal_entry         = ""
    evidence_upload       = @{
        allowed_types = @("photo","video","audio","document","journal")
    }
    goal_setting          = @{
        smart_goals = @()
    }
    progress_review       = @{
        milestones = @()
        dashboard  = ""
    }
    final_reflection      = ""
    post_assessment       = @{
        confidence_change = ""
        knowledge_change  = ""
    }
    certificate_next_steps = @{
        certificate          = ""
        recommended_pathway  = ""
    }
}

# 3. Generate all 1,170 challenges
foreach ($category in $categories.Keys) {

    $outputFolder = "C:\Users\SAFES\SafeStepsApp\Challenges\$category"

    if (!(Test-Path $outputFolder)) {
        New-Item -ItemType Directory -Path $outputFolder | Out-Null
    }

    foreach ($number in $categories[$category]) {

        $fileName = "{0:D4}.json" -f $number
        $filePath = Join-Path $outputFolder $fileName

        # Clone base structure correctly (NO JSON conversion)
        $challenge = [System.Collections.Hashtable]::new($baseStructure)

        # Inject metadata
        $challenge.challenge_number = $number
        $challenge.category         = $category
        $challenge.title            = "Challenge $number"

        # Write JSON to file
        $challenge | ConvertTo-Json -Depth 10 | Set-Content -Path $filePath -Encoding UTF8

        Write-Host "Created: $filePath"
    }
}

Write-Host "All 1,170 SAFE STEPS challenges generated successfully."

