param(
    [string]$SectionsDir = ".\sections"
)

Write-Host "=== Generate-SectionContent_Safety.ps1 ==="

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

function Build-RedFlags {
    param([string]$Skill)

    return @(
        "The child appears fearful, withdrawn, or hypervigilant during discussions related to $Skill.",
        "The parent becomes overwhelmed, dissociative, or unable to remain emotionally regulated.",
        "There is evidence of escalating conflict, shouting, or intimidation in the home.",
        "The child reports feeling unsafe, scared, or threatened.",
        "The parent expresses hopelessness, extreme frustration, or thoughts of harming themselves or others.",
        "There are signs of substance use impacting safety or supervision.",
        "The parent or child discloses past or current abuse, neglect, or violence."
    )
}

function Build-Escalation {
    param([string]$Skill)

    return @(
        "If the parent or child expresses feeling unsafe or at risk.",
        "If conflict escalates beyond verbal disagreement and becomes threatening.",
        "If the parent is unable to regulate enough to continue practicing $Skill safely.",
        "If the child shows signs of trauma activation that require clinical support.",
        "If there is any disclosure of abuse, neglect, or violence.",
        "If the worker feels unsure, overwhelmed, or out of scope.",
        "If mandatory reporting thresholds are met or suspected."
    )
}

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

    # Ensure safety_guidance exists AND is a dictionary
    if (-not $newSection.Contains("safety_guidance") -or
        $newSection["safety_guidance"] -eq $null -or
        $newSection["safety_guidance"].GetType().Name -ne "OrderedDictionary") {

        $fixedSafety = [ordered]@{}

        if ($newSection.Contains("safety_guidance") -and
            $newSection["safety_guidance"] -is [System.Management.Automation.PSObject]) {

            foreach ($prop in $newSection["safety_guidance"].PSObject.Properties) {
                $fixedSafety[$prop.Name] = $prop.Value
            }
        }

        $newSection["safety_guidance"] = $fixedSafety
    }

    Write-Host "[SAFETY] Adding red flags + escalation -> $($newSection.id)"

    # Only add if missing
    if (-not $newSection["safety_guidance"].Contains("red_flags")) {
        $newSection["safety_guidance"]["red_flags"] = Build-RedFlags -Skill $skill
    }

    if (-not $newSection["safety_guidance"].Contains("when_to_escalate")) {
        $newSection["safety_guidance"]["when_to_escalate"] = Build-Escalation -Skill $skill
    }

    Save-Json -Path $sf.FullName -Object $newSection
}

Write-Host "`nSafety guidance added to all sections."
