# === SAFE STEPS — REUNIFICATION 24M PROGRAM GENERATOR ===

$root = "C:\Users\SAFES\safesteps\safesteps-curriculum\programs\reunification-24m"

# PHASES
$phases = @(
    @{ id = "phase-1"; title = "Stabilisation"; stages = 3 },
    @{ id = "phase-2"; title = "Capacity Building"; stages = 3 },
    @{ id = "phase-3"; title = "Demonstration"; stages = 3 },
    @{ id = "phase-4"; title = "Transition"; stages = 2 },
    @{ id = "phase-5"; title = "Sustainment"; stages = 2 }
)

# CREATE ROOT
if (-not (Test-Path $root)) {
    New-Item -ItemType Directory -Path $root -Force | Out-Null
}

# CREATE PHASES + STAGES
foreach ($phase in $phases) {

    $phasePath = Join-Path $root $phase.id
    if (-not (Test-Path $phasePath)) {
        New-Item -ItemType Directory -Path $phasePath -Force | Out-Null
    }

    for ($i = 1; $i -le $phase.stages; $i++) {

        $stageId = "stage-$i"
        $stagePath = Join-Path $phasePath $stageId

        if (-not (Test-Path $stagePath)) {
            New-Item -ItemType Directory -Path $stagePath -Force | Out-Null
        }

        $json = @"
{
  "id": "$($phase.id)-$stageId",
  "title": "$($phase.title) — Stage $i",
  "objectives": [],
  "required_lessons": [],
  "recommended_lessons": [],
  "evidence": []
}
"@

        $json | Set-Content -Path "$stagePath\stage.json" -Encoding UTF8
    }
}

# PROGRAM INDEX
$programJson = @"
{
  "id": "reunification-24m",
  "title": "Reunification Program (24 Months)",
  "phases": [
    "phase-1",
    "phase-2",
    "phase-3",
    "phase-4",
    "phase-5"
  ]
}
"@

$programJson | Set-Content -Path "$root\program.json" -Encoding UTF8

Write-Host "Reunification 24M program generated successfully."
