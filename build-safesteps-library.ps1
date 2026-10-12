# Build SafeSteps Library JSON
Write-Host "Generating SafeSteps Library..."

$library = @{
    program = @{
        name = "SafeSteps Program"
        courses = @(
            @{
                title = "Trauma-Informed Housing Support"
                lessons = @(
                    @{
                        title = "Part 1 (Foundations)"
                        topics = @(
                            @{
                                title = "Understanding trauma responses"
                                sections = @("Video", "Reflection")
                            }
                        )
                    }
                )
            }
        )
    }
}

# Output path
$outputPath = "safesteps\assets\SafeSteps.library.json"
# Auto-generate SafeSteps Library from folder structure

$root = "SafeStepsLibrary\Courses"

$library = @{
    program = @{
        name = "SafeSteps Program"
        courses = @()
    }
}

# Loop through courses
Get-ChildItem $root -Directory | ForEach-Object {
    $courseName = $_.Name
    $coursePath = $_.FullName

    $courseObj = @{
        title = $courseName
        lessons = @()
    }

    # Loop through lessons
    Get-ChildItem "$coursePath\Lessons" -Directory | ForEach-Object {
        $lessonName = $_.Name
        $lessonPath = $_.FullName

        $lessonObj = @{
            title = $lessonName
            topics = @()
        }

        # Loop through topics
        Get-ChildItem "$lessonPath\Topics" -Directory | ForEach-Object {
            $topicName = $_.Name
            $topicPath = $_.FullName

            $sections = @()

            # Read section files
            Get-ChildItem $topicPath -File | ForEach-Object {
                $sections += $_.BaseName
            }

            $topicObj = @{
                title = $topicName
                sections = $sections
            }

            $lessonObj.topics += $topicObj
        }

        $courseObj.lessons += $lessonObj
    }

    $library.program.courses += $courseObj
}

# Output JSON
$output = "safesteps\assets\SafeSteps.library.json"
$library | ConvertTo-Json -Depth 20 | Set-Content $output

Write-Host "SafeSteps Library generated successfully!"

# Convert to JSON
$library | ConvertTo-Json -Depth 10 | Set-Content $outputPath

Write-Host "Library created at $outputPath"
