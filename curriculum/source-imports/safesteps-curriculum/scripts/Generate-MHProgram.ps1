# === SAFE STEPS — MH STABILISATION PROGRAM STRUCTURE (8 WEEKS) ===

$root = "C:\Users\SAFES\safesteps\safesteps-curriculum\programs\mh-stabilisation-8w"

if (-not (Test-Path $root)) {
    New-Item -ItemType Directory -Path $root -Force | Out-Null
}

for ($i = 1; $i -le 8; $i++) {

    $stagePath = Join-Path $root "week-$i"
    if (-not (Test-Path $stagePath)) {
        New-Item -ItemType Directory -Path $stagePath -Force | Out-Null
    }

    $json = @"
{
  "id": "week-$i",
  "title": "MH Stabilisation — Week $i",
  "objectives": [],
  "required_lessons": [],
  "recommended_lessons": [],
  "evidence": [],
  "compliance": {}
}
"@

    $json | Set-Content "$stagePath\stage.json" -Encoding UTF8
}

$programJson = @"
{
  "id": "mh-stabilisation-8w",
  "title": "Mental Health Stabilisation Program (8 Weeks)",
  "weeks": 8
}
"@

$programJson | Set-Content "$root\program.json" -Encoding UTF8

Write-Host "MH Stabilisation program structure generated."
