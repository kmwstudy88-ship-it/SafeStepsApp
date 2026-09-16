param(
    [string]$SectionsDir = ".\sections"
)

Write-Host "=== Generate-SectionContentAdvanced.ps1 ==="

function Load-JsonSafe {
    param([string]$Path)
    try {
        return (Get-Content $Path -Raw | ConvertFrom-Json)
    }
    catch {
        Write-Warning "Malformed JSON -> $Path"
        return $null
    }
}

function Save-Json {
    param(
        [string]$Path,
        $Object
    )
    $Object | ConvertTo-Json -Depth 50 | Set-Content $Path -Encoding UTF8
}

function Build-LongContent {
    param(
        [string]$SectionId,
        [string]$LessonName
    )

    $niceName = ($LessonName -replace "_", " ").Trim()

    return [ordered]@{
        title = "Deep dive: $niceName"

        overview = @"
This section provides a practical, trauma-informed exploration of $niceName.
It is designed for parents and caregivers who are juggling real-life pressures,
limited time, and big emotions - both their own and their children's. The focus
is on simple, repeatable strategies that can be used in everyday moments at home
without needing special equipment or perfect conditions.
"@

        psychoeducation = @"
Why does $niceName matter? Children learn through repetition, safety, and
connection. When adults respond in calm, predictable ways, the child's nervous
system gradually learns that the world is safer and more manageable. Over time,
this builds self-regulation, confidence, and trust. When $niceName is missing,
children may rely more on survival behaviours such as shutting down, exploding,
or clinging because they do not yet have another way to cope.
"@

        learning_goals = @(
            "Understand how $niceName supports healthy brain and emotional development.",
            "Identify common triggers and patterns where $niceName is most needed.",
            "Practice simple, repeatable responses that feel realistic in daily family life.",
            "Strengthen the parent-child relationship through calm, consistent interactions."
        )

        step_by_step = @(
            "Pause: Notice your own body first - breathing, tension, tone of voice.",
            "Name: Briefly name what is happening for the child (for example: 'This is really hard for you right now').",
            "Connect: Move closer if safe, soften your tone, and show you are staying with them.",
            "Guide: Offer one simple, doable next step instead of a lecture or long explanation.",
            "Repeat: Use the same calm script and steps across similar situations to build predictability."
        )

        parent_scripts = @(
            "I can see this feels really big for you. I'm not angry - you're not in trouble. Let's slow down together.",
            "Your feelings are okay. It's what we do with them that we're practicing.",
            "I'm going to stay close while you calm down. When you're ready, we'll work it out together.",
            "We can try that again. Everyone gets another chance to practice."
        )

        practical_examples = @(
            "A morning routine where everything is rushed and the child refuses to get dressed. The parent uses $niceName by slowing their own pace, offering two simple choices, and staying calm when the child protests.",
            "A homework battle where the child shuts down. Instead of pushing harder, the parent validates the struggle, breaks the task into tiny steps, and celebrates effort rather than perfection.",
            "A public meltdown in a supermarket. The parent focuses on safety, keeps their voice low, moves to a quieter space if possible, and later reflects on triggers and what might help next time."
        )

        reflection_questions = @(
            "When my child is struggling, what usually happens inside me first - do I speed up, shut down, or get louder?",
            "What is one phrase I could practice saying to myself before I respond to my child?",
            "Where in our daily routine does $niceName feel hardest to use (mornings, bedtimes, transitions)?",
            "Who could I talk to or debrief with after a hard parenting moment so I do not carry it alone?"
        )

        practice_ideas = @(
            "Choose one daily routine such as bedtime and focus on using the same calm script for one week.",
            "Write down two or three phrases that help you stay grounded and keep them on your phone or fridge.",
            "After a tough moment, jot a quick note: what happened, what you tried, and one thing you might do differently next time.",
            "Share one small win with a trusted friend or worker each week to reinforce progress rather than perfection."
        )

        closing_message = @"
You do not have to get $niceName perfect for it to work. Children benefit from
'good enough' parenting where adults keep coming back, repairing after mistakes,
and trying again. Every time you pause, notice, and respond with a little more
calm and connection, you are already changing the story for your child.
"@
    }
}

$sectionFiles = Get-ChildItem $SectionsDir -Filter *.json

foreach ($sf in $sectionFiles) {

    $section = Load-JsonSafe $sf.FullName
    if (-not $section) { continue }

    # Rebuild object safely
    $newSection = [ordered]@{}
    foreach ($prop in $section.PSObject.Properties) {
        $newSection[$prop.Name] = $prop.Value
    }

    if (-not $newSection.id) {
        Write-Warning "[SECTION] $($sf.Name) missing id"
        continue
    }

    $lessonName = ($newSection.id -replace "^section_", "" -replace "_\d+$", "")

    if (-not $newSection.Contains("content") -or
        $newSection["content"] -eq $null -or
        $newSection["content"] -eq "" -or
        ($newSection["content"] -is [string] -and $newSection["content"] -like "Placeholder*")) {

        Write-Host "[CONTENT] Generating advanced content -> $($newSection.id)"
        $newSection["content"] = Build-LongContent -SectionId $newSection.id -LessonName $lessonName
    }
    else {
        Write-Host "[SKIP] Content already exists -> $($newSection.id)"
    }

    Save-Json -Path $sf.FullName -Object $newSection
}

Write-Host "`nAdvanced section content generation complete."
