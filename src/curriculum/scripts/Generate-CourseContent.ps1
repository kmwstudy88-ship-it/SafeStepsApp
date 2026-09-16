param(
    [string]$CoursesDir = ".\courses"
)

Write-Host "=== Generate-CourseContent.ps1 ==="

function Load-JsonSafe {
    param([string]$Path)
    try { return (Get-Content $Path -Raw | ConvertFrom-Json) }
    catch { Write-Warning "Malformed JSON -> $Path"; return $null }
}

function Save-Json {
    param([string]$Path, $Object)
    $Object | ConvertTo-Json -Depth 50 | Set-Content $Path -Encoding UTF8
}

function Build-CourseContent {
    param([string]$CourseName)

    return [ordered]@{
        introduction = @"
This course provides a structured, trauma-informed learning pathway for parents and practitioners. It blends neuroscience, relational safety, and practical strategies to support families in real-world contexts.
"@

        competency_framework = @(
            "Demonstrates understanding of $CourseName concepts.",
            "Applies skills in predictable, calm, and consistent ways.",
            "Identifies triggers and uses co-regulation strategies.",
            "Communicates in a shame-free, connection-focused manner.",
            "Reflects on personal patterns and growth areas."
        )

        assessment_rubric = @(
            "Beginning: Understands basic concepts but struggles to apply them.",
            "Developing: Applies skills inconsistently with support.",
            "Proficient: Uses skills independently in most situations.",
            "Advanced: Models skills and supports others to learn them."
        )

        case_studies = @(
            "A parent navigating morning routine stress using $CourseName strategies.",
            "A father rebuilding trust after conflict through relational repair.",
            "A teen-parent conflict resolved using co-regulation and boundaries."
        )

        scenarios = @(
            "What would you do if your child shuts down during a transition?",
            "How would you respond if a parent becomes overwhelmed?",
            "How can you support a family experiencing intergenerational trauma?"
        )

        end_of_course_quiz = @(
            "List two key principles of $CourseName.",
            "Describe a real-life moment where you used these skills.",
            "Explain how trauma impacts behaviour and emotional regulation."
        )

        printable_workbook = @"
$CourseName — Summary:
- Core principles
- Key strategies
- Reflection prompts
- Practice activities
- Safety considerations
"@
    }
}

$courseFolders = Get-ChildItem $CoursesDir -Directory

foreach ($folder in $courseFolders) {

    $coursePath = Join-Path $folder.FullName "course.json"
    if (-not (Test-Path $coursePath)) { continue }

    $course = Load-JsonSafe $coursePath
    if (-not $course) { continue }

    $newCourse = [ordered]@{}
    foreach ($prop in $course.PSObject.Properties) {
        $newCourse[$prop.Name] = $prop.Value
    }

    $courseName = ($newCourse.id -replace "-", " ")

    if (-not $newCourse.Contains("content") -or $newCourse["content"] -eq $null) {
        Write-Host "[COURSE] Generating content -> $($newCourse.id)"
        $newCourse["content"] = Build-CourseContent -CourseName $courseName
    }
    else {
        Write-Host "[SKIP] Course already has content -> $($newCourse.id)"
    }

    Save-Json -Path $coursePath -Object $newCourse
}

Write-Host "`nCourse-level content generation complete."
