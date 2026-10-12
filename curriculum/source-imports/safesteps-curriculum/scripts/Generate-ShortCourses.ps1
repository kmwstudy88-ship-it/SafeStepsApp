# ================================
# SafeSteps Short Course Generator
# DFV, AOD, Mental Health
# Durations: 4, 6, 8, 10, 12, 16 weeks
# ================================

$BasePath = "..\programs\short-courses"

$Courses = @(
    "DFV",
    "AOD",
    "MentalHealth"
)

$Durations = @(4, 6, 8, 10, 12, 16)

function New-CourseJson {
    param(
        [string]$CourseName,
        [int]$Weeks,
        [string]$Path
    )

    $json = @{
        programName = "$CourseName Short Course ($Weeks Weeks)"
        type = "ShortCourse"
        topic = $CourseName
        durationWeeks = $Weeks
        version = "1.0"
        created = (Get-Date).ToString("yyyy-MM-dd")
        modules = @()
        compliance = @{
            weeklyCheckIns = $true
            evidenceUploads = $true
            attendanceRequired = $true
        }
        metadata = @{
            generatedBy = "SafeSteps Automation"
            category = "ShortCourse"
        }
    } | ConvertTo-Json -Depth 10

    Set-Content -Path $Path -Value $json -Encoding UTF8
}

foreach ($course in $Courses) {
    foreach ($weeks in $Durations) {

        $FolderPath = Join-Path $BasePath "$course\$weeks-weeks"
        $JsonPath = Join-Path $FolderPath "course.json"

        if (-not (Test-Path $FolderPath)) {
            New-Item -ItemType Directory -Path $FolderPath -Force | Out-Null
        }

        New-CourseJson -CourseName $course -Weeks $weeks -Path $JsonPath

        Write-Host "Created: $course - $weeks week course"
    }
}

Write-Host "All short courses generated successfully."
