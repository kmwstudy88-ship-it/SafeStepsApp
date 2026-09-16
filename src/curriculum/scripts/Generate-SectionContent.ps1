param(
    [string]$SectionsDir = ".\sections"
)

Write-Host "=== Generate-SectionContent.ps1 ==="

function Load-JsonSafe {
    param([string]$Path)
    try {
        return (Get-Content $Path -Raw | ConvertFrom-Json)
    }
    catch {
        Write-Warning "Malformed JSON → $Path"
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

function Generate-Content {
    param(
        [string]$SectionId,
        [string]$LessonName
    )

    return [ordered]@{
        title          = "Understanding $LessonName"
        summary        = "This section explores the key ideas behind $LessonName and how parents can apply them in daily routines."
        learning_goals = @(
            "Understand the core principles of $LessonName",
            "Learn how to apply these skills in real-life parenting moments",
            "Build confidence using practical, trauma-informed strategies"
        )
        key_points     = @(
            "Why $LessonName matters for child development",
            "How parents can model healthy behaviour",
            "Common challenges and how to respond calmly",
            "How to support emotional safety while teaching skills"
        )
        examples       = @(
            "A real-life scenario showing a parent using $LessonName effectively",
            "A step-by-step breakdown of what the parent did well",
            "A contrasting example showing a common mistake and how to correct it"
        )
        parent_script  = @(
            "Try saying: 'I can see you're feeling overwhelmed. Let's slow down together.'",
            "Use calm, simple language to guide your child through the moment."
        )
        reflection     = @(
            "When was the last time I used $LessonName?",
            "What went well, and what would I change next time?",
            "How can I prepare myself to use this skill more consistently?"
        )
    }
}

$sectionFiles = Get-ChildItem $SectionsDir -Filter *.json

foreach ($sf in $sectionFiles) {

    $section = Load-JsonSafe $sf.FullName
    if (-not $section) { continue }

    # ⭐ REBUILD SECTION OBJECT
    $newSection = [ordered]@{}
    foreach ($prop in $section.PSObject.Properties) {
        $newSection[$prop.Name] = $prop.Value
    }

    # Extract lesson name from ID
    $lessonName = ($newSection.id -replace "^section_", "" -replace "_\d+$", "" -replace "_", " ")

    # Only generate content if missing
    if (-not $newSection.Contains("content") -or
        $newSection["content"] -eq $null -or
        $newSection["content"] -eq "" -or
        $newSection["content"] -eq "Placeholder content. Add real content here.") {

        Write-Host "[CONTENT] Generating → $($newSection.id)"

        $newSection["content"] = Generate-Content -SectionId $newSection.id -LessonName $lessonName
    }
    else {
        Write-Host "[SKIP] Already has content → $($newSection.id)"
    }

    Save-Json -Path $sf.FullName -Object $newSection
}

Write-Host "`nSection content generation complete."
