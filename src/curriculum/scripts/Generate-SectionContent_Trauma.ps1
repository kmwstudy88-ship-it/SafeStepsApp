param(
    [string]$SectionsDir = ".\sections"
)

Write-Host "=== Generate-SectionContent_Trauma.ps1 ==="

function Load-JsonSafe {
    param([string]$Path)
    try {
        return (Get-Content $Path -Raw | ConvertFrom-Json)
    }
    catch {
        Write-Warning "Malformed JSON -> $Path"
        return $null
    }
}

function Save-Json {
    param(
        [string]$Path,
        $Object
    )
    $Object | ConvertTo-Json -Depth 50 | Set-Content $Path -Encoding UTF8
}

# ------------------------------
# Trauma-Informed Variants
# ------------------------------

function Build-ClinicalTI {
    param([string]$Skill)

    return @"
This clinical trauma-informed overlay explains how $Skill interacts with the nervous system.
Key concepts include:
- Fight, flight, freeze, and fawn responses
- Window of tolerance
- Co-regulation and self-regulation
- Predictability and routine as stabilisers
- How trauma impacts behaviour, attention, and emotional control

This version helps workers and parents understand the biological and neurological foundations behind $Skill.
"@
}

function Build-RelationalTI {
    param([string]$Skill)

    return @"
This relational trauma-informed overlay focuses on attachment, emotional safety, and connection.
Key concepts include:
- Connection before correction
- Repair after rupture
- Shame-free communication
- Emotional attunement
- Building trust through consistent presence

This version supports parents to use $Skill in ways that strengthen the parent-child relationship.
"@
}

function Build-JusticeTI {
    param([string]$Skill)

    return @"
This justice-oriented trauma-informed overlay acknowledges systemic, cultural, and intergenerational trauma.
Key concepts include:
- Structural inequality and its impact on families
- Cultural harm and historical trauma
- Power dynamics between services and families
- Community-based healing
- Strength-based, non-deficit approaches

This version ensures $Skill is delivered in a way that respects lived experience and cultural context.
"@
}

function Build-FatherhoodTI {
    param([string]$Skill)

    return @"
This fatherhood-focused trauma-informed overlay recognises how trauma and socialisation shape men's parenting.
Key concepts include:
- Emotional suppression and its impact on fathering
- Intergenerational fatherhood wounds
- Repairing trust through consistency
- Using calm leadership instead of control
- Building connection through shared activity

This version helps fathers use $Skill in ways that feel authentic, strong, and emotionally safe.
"@
}

# ------------------------------
# Main Loop
# ------------------------------

$sectionFiles = Get-ChildItem $SectionsDir -Filter *.json

foreach ($sf in $sectionFiles) {

    $section = Load-JsonSafe $sf.FullName
    if (-not $section) { continue }

    # Rebuild safely
    $newSection = [ordered]@{}
    foreach ($prop in $section.PSObject.Properties) {
        $newSection[$prop.Name] = $prop.Value
    }

    if (-not $newSection.id) {
        Write-Warning "[SECTION] $($sf.Name) missing id"
        continue
    }

    # Extract skill name
    $skill = ($newSection.id -replace "^section_", "" -replace "_\d+$", "" -replace "_", " ")

    # Ensure trauma_informed exists AND is a dictionary
    if (-not $newSection.Contains("trauma_informed") -or
        $newSection["trauma_informed"] -eq $null -or
        $newSection["trauma_informed"].GetType().Name -ne "OrderedDictionary") {

        $fixedTI = [ordered]@{}

        if ($newSection.Contains("trauma_informed") -and
            $newSection["trauma_informed"] -is [System.Management.Automation.PSObject]) {

            foreach ($prop in $newSection["trauma_informed"].PSObject.Properties) {
                $fixedTI[$prop.Name] = $prop.Value
            }
        }

        $newSection["trauma_informed"] = $fixedTI
    }

    Write-Host "[TRAUMA] Adding all trauma-informed overlays -> $($newSection.id)"

    # Add each overlay only if missing
    if (-not $newSection["trauma_informed"].Contains("clinical")) {
        $newSection["trauma_informed"]["clinical"] = Build-ClinicalTI -Skill $skill
    }

    if (-not $newSection["trauma_informed"].Contains("relational")) {
        $newSection["trauma_informed"]["relational"] = Build-RelationalTI -Skill $skill
    }

    if (-not $newSection["trauma_informed"].Contains("justice")) {
        $newSection["trauma_informed"]["justice"] = Build-JusticeTI -Skill $skill
    }

    if (-not $newSection["trauma_informed"].Contains("fatherhood")) {
        $newSection["trauma_informed"]["fatherhood"] = Build-FatherhoodTI -Skill $skill
    }

    Save-Json -Path $sf.FullName -Object $newSection
}

Write-Host "`nAll trauma-informed overlays added to all sections."
