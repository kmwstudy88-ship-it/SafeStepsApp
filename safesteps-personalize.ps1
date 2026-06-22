param(
    [string]$Root = "C:\Users\SAFES\SafeStepsApp\curriculum",
    [string]$Profile = "beginner"
)

Write-Host "=== SafeSteps Personalization Engine ===" -ForegroundColor Cyan

$out = "C:\SafeSteps\personalized\$Profile"
if (-not (Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }

$lessons = Get-ChildItem "$Root\lessons" -Filter *.json

foreach ($l in $lessons) {
    $json = Get-Content $l.FullName -Raw | ConvertFrom-Json

    if ($Profile -eq "beginner" -and $json.difficulty -eq "low") {
        Copy-Item $l.FullName -Destination $out -Force
    }

    if ($Profile -eq "advanced" -and $json.difficulty -eq "high") {
        Copy-Item $l.FullName -Destination $out -Force
    }
}

Write-Host "Personalized curriculum created: $out" -ForegroundColor Green
