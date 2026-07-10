# Generate-CurriculumIndex.ps1

$root = "C:\Users\SAFES\safestepsApp\curriculum_clean"
$output = "C:\Users\SAFES\safestepsApp\curriculum-index.json"

$index = @{ programs = @() }

Get-ChildItem $root -Directory | ForEach-Object {
    $program = $_
    $programObj = @{
        id = $program.Name
        title = $program.Name
        courses = @()
    }

    Get-ChildItem $program.FullName -Directory | ForEach-Object {
        $course = $_
        $courseObj = @{
            id = $course.Name
            title = $course.Name
            modules = @()
        }

        Get-ChildItem $course.FullName -Directory | ForEach-Object {
            $module = $_
            $moduleObj = @{
                id = $module.Name
                title = $module.Name
                lessons = @()
            }

            Get-ChildItem $module.FullName -Filter *.json | ForEach-Object {
                $lesson = $_
                $lessonObj = @{
                    id = $lesson.BaseName
                    title = $lesson.BaseName
                    path = $lesson.FullName.Replace($root, "").TrimStart("\")
                }
                $moduleObj.lessons += $lessonObj
            }

            $courseObj.modules += $moduleObj
        }

        $programObj.courses += $courseObj
    }

    $index.programs += $programObj
}

$index | ConvertTo-Json -Depth 10 | Out-File $output -Encoding utf8

Write-Host "Curriculum index generated at $output"
