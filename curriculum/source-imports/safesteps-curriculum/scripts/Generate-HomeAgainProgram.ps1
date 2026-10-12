# === SAFE STEPS — HOME AGAIN 12M PROGRAM STRUCTURE ===

$root = "C:\Users\SAFES\safesteps\safesteps-curriculum\programs\home-again-12m"

$phases = @(
    @{ id = "phase-1"; title = "Stability"; stages = 2 },
    @{ id = "phase-2"; title = "Strengthening"; stages = 2 },
    @{ id = "phase-3"; title = "Sustainment"; stages = 2 }
)

if (-not (Test-Path $root)) {
    New-Item -ItemType Directory -Path $root -Force | Out-Null
}

foreach ($phase in $phases) {

    $phasePath = Join-Path $root $phase.id
    if (-not (Test-Path $phasePath)) {
        New-Item -ItemType Directory -Path $phasePath -Force | Out-Null
    }

    for ($i = 1; $i -le $phase.stages; $i++) {

        $stagePath = Join-Path $phasePath "stage-$i"
        if (-not (Test-Path $stagePath)) {
            New-Item -ItemType Directory -Path $stagePath -Force | Out-Null
        }

        $json = @"
{
  "id": "$($phase.id)-stage-$i",
  "title": "$($phase.title) — Stage $i",
  "objectives": [],
  "required_lessons": [],
  "recommended_lessons": [],
  "evidence": [],
  "compliance": {}
}
"@

        $json | Set-Content "$stagePath\stage.json" -Encoding UTF8
    }
}

$programJson = @"
{
  "id": "home-again-12m",
  "title": "Home Again Program (12 Months)",
  "phases": [
    "phase-1",
    "phase-2",
    "phase-3"
  ]
}
"@

$programJson | Set-Content "$root\program.json" -Encoding UTF8

Write-Host "Home Again 12M program structure generated."
