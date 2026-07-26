# === SAFE STEPS — DFV RECOVERY PROGRAM STRUCTURE (12 WEEKS) ===

$root = "C:\Users\SAFES\safesteps\safesteps-curriculum\programs\dfv-recovery-12w"

if (-not (Test-Path $root)) {
    New-Item -ItemType Directory -Path $root -Force | Out-Null
}

for ($i = 1; $i -le 12; $i++) {

    $stagePath = Join-Path $root "week-$i"
    if (-not (Test-Path $stagePath)) {
        New-Item -ItemType Directory -Path $stagePath -Force | Out-Null
    }

    $json = @"
{
  "id": "week-$i",
  "title": "DFV Recovery — Week $i",
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
  "id": "dfv-recovery-12w",
  "title": "DFV Recovery Program (12 Weeks)",
  "weeks": 12
}
"@

$programJson | Set-Content "$root\program.json" -Encoding UTF8

Write-Host "DFV Recovery program structure generated."
