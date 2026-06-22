param(
    [string]$Root = "C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Redundancy Detector ===" -ForegroundColor Cyan

$lessons = Get-ChildItem "$Root\lessons" -Filter *.json
$report = @()

foreach ($a in $lessons) {
    foreach ($b in $lessons) {
        if ($a.FullName -eq $b.FullName) { continue }

        $ja = Get-Content $a.FullName -Raw | ConvertFrom-Json
        $jb = Get-Content $b.FullName -Raw | ConvertFrom-Json

        $ta = ($ja.content | Out-String)
        $tb = ($jb.content | Out-String)

        $sim = [math]::Round((($ta.Length - ($ta -replace $tb, "").Length) / $ta.Length) * 100, 2)

        if ($sim -gt 60) {
            $report += [PSCustomObject]@{
                lessonA = $ja.id
                lessonB = $jb.id
                similarity = "$sim%"
            }
        }
    }
}

$path = Join-Path $Root "redundancy-report.json"
$report | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path $path

Write-Host "Redundancy report: $path" -ForegroundColor Green
