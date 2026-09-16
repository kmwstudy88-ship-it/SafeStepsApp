# ============================================================
#  SafeSteps Learning Outcomes Generator (Ultra Clean Version)
# ============================================================

$basePath = "C:\Users\SAFES\safesteps-curriculum\courses\v1.0.0"

$topicFolders = Get-ChildItem -Path $basePath -Directory

foreach ($folder in $topicFolders) {

    $courseFile = Join-Path $folder.FullName "course.json"

    if (-not (Test-Path $courseFile)) {
        Write-Host "Skipping (no course.json): $($folder.Name)"
        continue
    }

    # Load existing JSON
    $course = Get-Content $courseFile -Raw | ConvertFrom-Json

    # Convert folder name to readable topic name
    $topicName = ($folder.Name -replace '-', ' ')

    Write-Host "Adding learning outcomes for: $topicName"

    # Create simple ASCII-only outcomes
    $outcome1 = "Understand the key ideas behind $topicName and why this topic matters for child development."
    $outcome2 = "Learn practical skills and strategies that help apply $topicName in everyday parenting situations."
    $outcome3 = "Build confidence using $topicName to support connection, safety, and positive family routines."

    # Insert outcomes
    $course.learningOutcomes = @(
        $outcome1,
        $outcome2,
        $outcome3
    )

    # Save updated JSON
    $json = $course | ConvertTo-Json -Depth 10
    Set-Content -Path $courseFile -Value $json -Encoding UTF8

    Write-Host "Updated learning outcomes for: $topicName"
}

