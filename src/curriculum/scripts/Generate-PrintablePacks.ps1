function Build-PrintablePack {
    param(
        $lesson,
        $sections
    )

    $lessonName = ($lesson.id -replace "^lesson_", "" -replace "_\d+$", "" -replace "_", " ")

    # Top-level block uses double-quoted here-string so variables expand
    $pack = @"
===============================
SAFE STEPS PRINTABLE PACK
$lessonName
===============================

LESSON OVERVIEW
---------------
$($lesson.content.overview)

KEY CONCEPTS
------------
$([string]::Join("`n", $lesson.content.key_concepts))

PRACTICE ACTIVITIES
-------------------
$([string]::Join("`n", $lesson.content.practice_activities))

REFLECTION PROMPTS
------------------
$([string]::Join("`n", $lesson.content.reflection_prompts))

"@

    foreach ($sec in $sections) {

        # Inner blocks use SINGLE-QUOTED here-strings to avoid nesting issues
        $sectionBlock = @'
--------------------------------
SECTION: {SECTION_ID}
--------------------------------

MAIN CONTENT
------------
{MAIN_CONTENT}

TRAUMA-INFORMED OVERLAYS
------------------------
Clinical:
{CLINICAL}

Relational:
{RELATIONAL}

Justice-Oriented:
{JUSTICE}

Fatherhood:
{FATHERHOOD}

SAFETY GUIDANCE
---------------
Red Flags:
{REDFLAGS}

When to Escalate:
{ESCALATE}

AGE-SPECIFIC GUIDANCE
---------------------
Toddlers:
{TODDLERS}

School Age:
{SCHOOLAGE}

Teens:
{TEENS}

FATHERHOOD-SPECIFIC GUIDANCE
----------------------------
{FATHERHOODVARIANT}

'@

        # Replace placeholders manually
        $sectionBlock = $sectionBlock.Replace("{SECTION_ID}", $sec.id)
        $sectionBlock = $sectionBlock.Replace("{MAIN_CONTENT}", $sec.content.overview)
        $sectionBlock = $sectionBlock.Replace("{CLINICAL}", $sec.trauma_informed.clinical)
        $sectionBlock = $sectionBlock.Replace("{RELATIONAL}", $sec.trauma_informed.relational)
        $sectionBlock = $sectionBlock.Replace("{JUSTICE}", $sec.trauma_informed.justice)
        $sectionBlock = $sectionBlock.Replace("{FATHERHOOD}", $sec.trauma_informed.fatherhood)
        $sectionBlock = $sectionBlock.Replace("{REDFLAGS}", ($sec.safety_guidance.red_flags -join "`n"))
        $sectionBlock = $sectionBlock.Replace("{ESCALATE}", ($sec.safety_guidance.when_to_escalate -join "`n"))
        $sectionBlock = $sectionBlock.Replace("{TODDLERS}", $sec.content_variants.toddlers)
        $sectionBlock = $sectionBlock.Replace("{SCHOOLAGE}", $sec.content_variants.school_age)
        $sectionBlock = $sectionBlock.Replace("{TEENS}", $sec.content_variants.teens)
        $sectionBlock = $sectionBlock.Replace("{FATHERHOODVARIANT}", $sec.content_variants.fatherhood)

        $pack += $sectionBlock
    }

    return $pack
}
