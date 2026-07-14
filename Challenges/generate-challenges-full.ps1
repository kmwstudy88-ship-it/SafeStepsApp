# ==========================================
# SAFE STEPS Full Production Generator
# Generates 1,170 challenges with UUIDs,
# timestamps, versioning, auto-titles,
# auto-quizzes, auto-scenarios, category
# defaults, index.json, master-curriculum.json,
# and sample Programs.
# ==========================================

$root = "C:\Users\SAFES\SafeStepsApp\Challenges"
$programsFolder = Join-Path $root "Programs"

# Category ranges
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

# Category defaults
$categoryDefaults = @{
    "Domestic and Family Violence Challenges" = @{
        welcome = "This module covers safety planning, recognising abuse, and support pathways."
        research = "Evidence indicates trauma-informed approaches improve outcomes."
    }
    "Mental Health Challenges" = @{
        welcome = "This module focuses on mental health literacy, coping strategies, and help-seeking."
        research = "CBT-informed strategies and early intervention are effective."
    }
    "Teen Challenges" = @{
        welcome = "This module is tailored for adolescents and family communication."
        research = "Adolescent-specific engagement increases retention."
    }
    "default" = @{
        welcome = "This module follows the SAFE STEPS master template."
        research = "Content is evidence-informed and practice-ready."
    }
}

# Base template
$baseStructure = @{
    uuid                  = ""
    challenge_number      = ""
    category              = ""
    title                 = ""
    version               = "1.0"
    created_at            = ""
    updated_at            = ""
    welcome_overview      = @{
        purpose        = ""
        importance     = ""
        estimated_time = ""
        difficulty     = ""
        skills         = @()
        default_welcome = ""
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

# Helpers
function New-UUID { [guid]::NewGuid().ToString() }

function AutoTitle($category, $number) {
    $short = ($category -split ' ')[0]
    $phrases = @(
        "Foundations","Understanding","Practical Skills","Safety Planning",
        "Communication","Coping Strategies","Family Routines","Healthy Boundaries",
        "Support Pathways","Everyday Skills"
    )
    $phrase = $phrases[($number % $phrases.Count)]
    return "$short $number - $phrase"
}

function GenerateQuiz($number) {
    $quiz = @()
    for ($i=1; $i -le 10; $i++) {
        $qid = "Q{0:D2}" -f $i
        $options = @("A","B","C","D")
        $correct = $options[($i + $number) % $options.Count]
        $quiz += @{
            id = $qid
            question = "Placeholder question $i for challenge $number"
            options = @(
                @{ key="A"; text="Option A" },
                @{ key="B"; text="Option B" },
                @{ key="C"; text="Option C" },
                @{ key="D"; text="Option D" }
            )
            correct = $correct
            points = 1
            feedback = "Feedback for question $i"
        }
    }
    return $quiz
}

function GenerateScenarios($number) {
    $scenarios = @()
    for ($s=1; $s -le 3; $s++) {
        $scenarios += @{
            id = "S{0:D1}" -f $s
            title = "Scenario $s for challenge $number"
            description = "Short scenario description for scenario $s."
            choices = @(
                @{ key="A"; text="Choice A"; feedback="Why A is good or not" },
                @{ key="B"; text="Choice B"; feedback="Why B is good or not" },
                @{ key="C"; text="Choice C"; feedback="Why C is good or not" }
            )
            recommended_action = "Recommended action for scenario $s"
        }
    }
    return $scenarios
}

# Ensure folders
if (!(Test-Path $root)) { New-Item -ItemType Directory -Path $root | Out-Null }
if (!(Test-Path $programsFolder)) { New-Item -ItemType Directory -Path $programsFolder | Out-Null }

# Generate challenges
$index = @()

foreach ($category in $categories.Keys) {

    $outputFolder = Join-Path $root $category
    if (!(Test-Path $outputFolder)) { New-Item -ItemType Directory -Path $outputFolder | Out-Null }

    foreach ($number in $categories[$category]) {

        $fileName = "{0:D4}.json" -f $number
        $filePath = Join-Path $outputFolder $fileName

        $challenge = [System.Collections.Hashtable]::new($baseStructure)

        $challenge.uuid = New-UUID
        $challenge.challenge_number = $number
        $challenge.category = $category
        $challenge.title = AutoTitle $category $number
        $challenge.version = "1.0"
        $challenge.created_at = (Get-Date).ToString("o")
        $challenge.updated_at = $challenge.created_at

        $defaults = $categoryDefaults[$category]
        if (-not $defaults) { $defaults = $categoryDefaults["default"] }
        $challenge.welcome_overview.default_welcome = $defaults.welcome
        $challenge.research_highlights = $defaults.research

        $challenge.learning_outcomes = @(
            "Explain the topic",
            "Identify barriers",
            "Apply practical strategies"
        )

        $challenge.core_lesson_1 = "Core lesson 1 content placeholder."
        $challenge.core_lesson_2 = "Core lesson 2 content placeholder."
        $challenge.core_lesson_3 = "Core lesson 3 content placeholder."

        $challenge.knowledge_quiz.questions = GenerateQuiz $number
        $challenge.scenario_practice = GenerateScenarios $number

        $challenge.daily_challenge = "Short daily task for challenge $number"
        $challenge.weekly_challenge = "Weekly practice task for challenge $number"
        $challenge.family_challenge = "Family activity for challenge $number"

        $challenge | ConvertTo-Json -Depth 12 | Set-Content -Path $filePath -Encoding UTF8

        $index += @{
            challenge_number = $number
            uuid = $challenge.uuid
            category = $category
            title = $challenge.title
            file_path = $filePath
            version = $challenge.version
            created_at = $challenge.created_at
        }

        Write-Host "Created: $filePath"
    }
}

# Write index.json
$indexPath = Join-Path $root "index.json"
$index | ConvertTo-Json -Depth 6 | Set-Content -Path $indexPath -Encoding UTF8
Write-Host "Wrote index: $indexPath"

# Build master curriculum
$master = @()
foreach ($entry in $index) {
    $json = Get-Content -Path $entry.file_path -Raw | ConvertFrom-Json
    $master += $json
}
$masterPath = Join-Path $root "master-curriculum.json"
$master | ConvertTo-Json -Depth 12 | Set-Content -Path $masterPath -Encoding UTF8
Write-Host "Wrote master curriculum: $masterPath"

# Sample programs
$programs = @(
    @{
        id = "program-parenting-foundations"
        title = "Parenting Foundations Program"
        description = "A starter program for parents."
        challenges = (1..10 | ForEach-Object { "{0:D4}" -f $_ })
    },
    @{
        id = "program-family-safety"
        title = "Family Safety Program"
        description = "Focused on safety and planning."
        challenges = (161..170 | ForEach-Object { "{0:D4}" -f $_ })
    }
)

foreach ($p in $programs) {
    $pPath = Join-Path $programsFolder ($p.id + ".json")
    $p | ConvertTo-Json -Depth 6 | Set-Content -Path $pPath -Encoding UTF8
    Write-Host "Wrote program: $pPath"
}

Write-Host "All upgrades completed."
