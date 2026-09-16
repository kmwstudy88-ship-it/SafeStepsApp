# ============================================================
#  SafeSteps Module Generator (ASCII Safe Version)
#  Adds 4 topic-specific modules to each course.json
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

    Write-Host "Adding modules for: $topicName"

    # Create 4 modules with topic-specific descriptions
    $modules = @(
        @{
            id = "module-1"
            title = "Understanding the Topic"
            description = "Learn what $topicName means and why it matters for child development."
        },
        @{
            id = "module-2"
            title = "Core Skills and Strategies"
            description = "Explore practical skills and strategies for applying $topicName in everyday parenting."
        },
        @{
            id = "module-3"
            title = "Real-Life Application"
            description = "See how $topicName works in real situations with examples and simple scripts."
        },
        @{
            id = "module-4"
            title = "Reflection and Integration"
            description = "Reflect on your learning and plan how to use $topicName in daily family life."
        }
    )

    # Insert modules
    $course.modules = $modules

    # Save updated JSON
    $json = $course | ConvertTo-Json -Depth 10
    Set-Content -Path $courseFile -Value $json -Encoding UTF8

    Write-Host "Updated modules for: $topicName"
}
