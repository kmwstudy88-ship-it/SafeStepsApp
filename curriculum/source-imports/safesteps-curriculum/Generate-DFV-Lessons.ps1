# Generate full Domestic & Family Violence lessons

$dfvFolder = "C:\Users\SAFES\safesteps\safesteps-curriculum\Domestic and Family Violence"

# Core titles (you can extend this list anytime)
$dfvTitles = @(
    "Understanding Domestic and Family Violence",
    "Types of Abuse: Physical, Emotional, Sexual, Financial",
    "Power and Control in Relationships",
    "The Cycle of Violence",
    "Impact of DFV on Adult Survivors",
    "Impact of DFV on Children",
    "Coercive Control and Isolation",
    "Gaslighting and Psychological Manipulation",
    "Technology-Facilitated Abuse",
    "Financial Abuse and Economic Dependence",
    "Risk Factors and Red Flags",
    "Barriers to Leaving an Abusive Relationship",
    "Safety Planning Basics",
    "Safety Planning with Children",
    "DFV and the Legal System",
    "Protection Orders and Legal Options",
    "DFV, Child Protection and the System",
    "Working with Police and Services",
    "Trauma and the Brain",
    "Trauma-Informed Coping Strategies",
    "Rebuilding Self-Worth and Identity",
    "Healthy vs Unhealthy Relationships",
    "Boundaries and Consent",
    "Communication Skills in Recovery",
    "Parenting After DFV",
    "Supporting Children’s Healing",
    "Managing Contact with the Perpetrator",
    "DFV and Substance Use",
    "DFV and Mental Health",
    "DFV in Diverse Communities",
    "Cultural Considerations and DFV",
    "LGBTQ+ Experiences of DFV",
    "DFV and Disability",
    "Elder Abuse and Family Violence",
    "Digital Safety and Online Boundaries",
    "Stalking and Harassment",
    "Risk Assessment and High-Risk Situations",
    "Working with Support Services",
    "Building a Support Network",
    "Long-Term Recovery and Future Planning"
)

for ($i = 1; $i -le 100; $i++) {

    $index = $i - 1
    if ($index -lt $dfvTitles.Count) {
        $title = $dfvTitles[$index]
    } else {
        $title = "Domestic and Family Violence – Lesson $i"
    }

    $lessonNumber = $i

    $objectives = @(
        "Understand key concepts related to: $title.",
        "Identify practical strategies to apply learning in real-life situations.",
        "Increase safety, insight, and confidence in responding to DFV."
    )

    $sections = @(
        @{
            Name = "Introduction"
            Content = "This lesson introduces the topic: $title, explains why it matters, and connects it to everyday experiences of DFV and safety."
        },
        @{
            Name = "Key Concepts"
            Content = "Defines core terms, patterns, and dynamics related to $title, using clear examples and plain language."
        },
        @{
            Name = "Impact"
            Content = "Explores how $title affects adults, children, families, and communities, including emotional, physical, and social impacts."
        },
        @{
            Name = "Skills and Strategies"
            Content = "Provides practical tools, scripts, and strategies that participants can use to respond more safely and effectively in situations related to $title."
        },
        @{
            Name = "Reflection and Practice"
            Content = "Guided questions, journaling prompts, or activities to help participants apply the lesson to their own context in a safe, supported way."
        },
        @{
            Name = "Support and Resources"
            Content = "Lists relevant services, hotlines, websites, and local supports that can assist with issues related to $title."
        }
    )

    $lesson = [PSCustomObject]@{
        Domain       = "Domestic and Family Violence"
        LessonNumber = $lessonNumber
        Code         = "DFV-{0:D3}" -f $lessonNumber
        Title        = $title
        Description  = "A structured lesson on $title within the Domestic and Family Violence program."
        Objectives   = $objectives
        Sections     = $sections
        Status       = "Complete"
    }

    $json = $lesson | ConvertTo-Json -Depth 5

    $fileName = "Lesson-{0}.ps1" -f $lessonNumber
    $path = Join-Path $dfvFolder $fileName

    @"
# Auto-generated Domestic & Family Violence lesson
# Domain: Domestic and Family Violence
# Lesson: $lessonNumber - $title

`$Lesson = $json
"@ | Set-Content -Path $path -Encoding UTF8
}

Write-Host "Domestic & Family Violence lessons generated in:"
Write-Host $dfvFolder
