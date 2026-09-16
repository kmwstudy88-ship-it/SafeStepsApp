param(
    [string]$LessonsDir = ".\lessons"
)

Write-Host "=== Generate-LessonContent.ps1 ==="

function Load-JsonSafe {
    param([string]$Path)
    try { return (Get-Content $Path -Raw | ConvertFrom-Json) }
    catch { Write-Warning "Malformed JSON -> $Path"; return $null }
}

function Save-Json {
    param([string]$Path, $Object)
    $Object | ConvertTo-Json -Depth 50 | Set-Content $Path -Encoding UTF8
}

function Build-LessonContent {
    param([string]$LessonName)

    return [ordered]@{
        overview = @"
This lesson introduces the core ideas behind $LessonName and prepares parents to apply the skills in real-life moments. It blends trauma-informed practice, relational safety, and practical strategies that can be used immediately.
"@

        learning_outcomes = @(
            "Understand the purpose and value of $LessonName.",
            "Identify common challenges and how to respond calmly.",
            "Practice simple, repeatable strategies that build confidence.",
            "Strengthen connection and emotional safety during difficult moments."
        )

        key_concepts = @(
            "Why $LessonName matters for child development.",
            "How trauma and stress impact behaviour.",
            "How parents can model emotional regulation.",
            "Predictability and routine as stabilising tools."
        )

        practice_activities = @(
            "Try a 2-minute grounding exercise before responding to your child.",
            "Practice naming emotions using simple, non-judgemental language.",
            "Role-play a challenging moment and rehearse a calm script.",
            "Identify one routine where $LessonName can be used daily."
        )

        facilitator_notes = @(
            "Normalise struggle — parents often feel shame around these skills.",
            "Use examples that reflect diverse families and lived experiences.",
            "Pause often for reflection and emotional processing.",
            "Model co-regulation through tone, pacing, and presence."
        )

        reflection_prompts = @(
            "What part of $LessonName feels easiest for me?",
            "What part feels hardest, and why?",
            "How did my own childhood shape my reactions?",
            "What is one small change I can try this week?"
        )

        printable_summary = @"
$LessonName — Key Takeaways:
- Stay calm and predictable.
- Use simple language.
- Focus on connection before correction.
- Practice small steps consistently.
"@
    }
}

$lessonFiles = Get-ChildItem $LessonsDir -Filter *.json

foreach ($lf in $lessonFiles) {

    $lesson = Load-JsonSafe $lf.FullName
    if (-not $lesson) { continue }

    $newLesson = [ordered]@{}
    foreach ($prop in $lesson.PSObject.Properties) {
        $newLesson[$prop.Name] = $prop.Value
    }

    if (-not $newLesson.id) {
        Write-Warning "[LESSON] $($lf.Name) missing id"
        continue
    }

    $lessonName = ($newLesson.id -replace "^lesson_", "" -replace "_\d+$", "" -replace "_", " ")

    if (-not $newLesson.Contains("content") -or $newLesson["content"] -eq $null) {
        Write-Host "[LESSON] Generating content -> $($newLesson.id)"
        $newLesson["content"] = Build-LessonContent -LessonName $lessonName
    }
    else {
        Write-Host "[SKIP] Lesson already has content -> $($newLesson.id)"
    }

    Save-Json -Path $lf.FullName -Object $newLesson
}

Write-Host "`nLesson-level content generation complete."
