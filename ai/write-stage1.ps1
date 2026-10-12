# ============================================================
# SafeSteps – Stage 1 AI Lesson Writer
# Uses Invoke-SafeStepsAI to generate full lesson content
# ============================================================

# Load the AI engine function
. "C:\Users\SAFES\SafeStepsApp\ai\engine.ps1"

$stagePath = "C:\Users\SAFES\SafeStepsApp\programs\Reunification\Stage1"

$weeks = Get-ChildItem -Path $stagePath -Directory

foreach ($week in $weeks) {

    $lessons = Get-ChildItem -Path $week.FullName -Directory

    foreach ($lesson in $lessons) {

        $lessonJsonPath = Join-Path $lesson.FullName "lesson.json"

        # Load existing JSON skeleton
        $json = Get-Content $lessonJsonPath -Raw | ConvertFrom-Json

        # Extract metadata
        $programName = "Reunification"
        $stageName = "Stage 1"
        $weekName = $week.Name
        $lessonTitle = $json.title

        # Call the AI engine
        $generated = Invoke-SafeStepsAI `
            -programName $programName `
            -stageName $stageName `
            -weekName $weekName `
            -lessonTitle $lessonTitle

        # Merge AI output into JSON
        $json.summary = $generated.summary
        $json.learningObjectives = $generated.learningObjectives
        $json.content = $generated.content
        $json.activities = $generated.activities
        $json.evidence = $generated.evidence
        $json.caseworkerNotes = $generated.caseworkerNotes
        $json.parentReflection = $generated.parentReflection

        # Save updated JSON
        $json | ConvertTo-Json -Depth 10 | Set-Content -Path $lessonJsonPath -Encoding UTF8

        Write-Host "Generated: $($lesson.FullName)"
    }
}

Write-Host "Stage 1 AI content generation complete."
