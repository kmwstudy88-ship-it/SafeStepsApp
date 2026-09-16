# Path to your lessons folder
$lessonsPath = "C:\Users\SAFES\safesteps-curriculum\packages\content-courses\full-reunification-24m\v1.0.0\lessons"

# Ensure folder exists
New-Item -ItemType Directory -Force -Path $lessonsPath | Out-Null

$dayNumber = 1

for ($month = 1; $month -le 24; $month++) {

    for ($week = (($month - 1) * 4) + 1; $week -le (($month - 1) * 4) + 4; $week++) {

        for ($day = 1; $day -le 7; $day++) {

            $fileName = "M$month-W$week-D$dayNumber.json"
            $filePath = Join-Path $lessonsPath $fileName

            # Blank JSON skeleton
            $json = @{
                id = "M$month-W$week-D$dayNumber"
                title = ""
                moduleId = "module-$month"
                week = $week
                day = $dayNumber
                month = $month
                durationMinutes = 0
                learningGoal = ""
                microLesson = ""
                activity = ""
                evidenceTypes = @()
                caseworkerFlags = @()
                resources = @()
                metadata = @{
                    sensitivity = "general"
                    language = "en-AU"
                }
                version = "1.0.0"
            } | ConvertTo-Json -Depth 10

            # Create file only if it doesn't exist
            if (-not (Test-Path $filePath)) {
                $json | Set-Content -Path $filePath -Encoding UTF8
                Write-Host "Created $fileName"
            }
            else {
                Write-Host "Skipped (exists): $fileName"
            }

            $dayNumber++
        }
    }
}
