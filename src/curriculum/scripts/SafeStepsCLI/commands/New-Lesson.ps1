function New-Lesson {
    param(
        [Parameter(Mandatory)]
        [string]$Program,

        [Parameter(Mandatory)]
        [int]$LessonNumber
    )

    $path = "C:\SafeSteps\Programs\$Program\lessons\Lesson-$LessonNumber"

    if (-Not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path | Out-Null
    }

    $config = @{
        lessonNumber = $LessonNumber
        title = "Lesson $LessonNumber"
        completed = $false
        content = ""
    }

    $config | ConvertTo-Json -Depth 10 | Out-File "$path\lesson.json"

    Write-Host "Lesson $LessonNumber created for program '$Program'"
}
