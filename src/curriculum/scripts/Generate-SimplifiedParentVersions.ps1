param(
    [string]$SectionsDir = ".\sections"
)

Write-Host "=== Generate-SimplifiedParentVersions.ps1 ==="

function Load-JsonSafe {
    param([string]$Path)
    try { return (Get-Content $Path -Raw | ConvertFrom-Json) }
    catch { Write-Warning "Malformed JSON -> $Path"; return $null }
}

function To-OrderedHashtable {
    param($obj)

    $ht = [ordered]@{}

    foreach ($prop in $obj.PSObject.Properties) {
        $value = $prop.Value

        if ($value -is [System.Management.Automation.PSCustomObject]) {
            $ht[$prop.Name] = To-OrderedHashtable $value
        }
        elseif ($value -is [System.Collections.IEnumerable] -and -not ($value -is [string])) {
            $arr = @()
            foreach ($item in $value) {
                if ($item -is [System.Management.Automation.PSCustomObject]) {
                    $arr += To-OrderedHashtable $item
                }
                else {
                    $arr += $item
                }
            }
            $ht[$prop.Name] = $arr
        }
        else {
            $ht[$prop.Name] = $value
        }
    }

    return $ht
}

function Save-Json {
    param([string]$Path, $Object)
    $Object | ConvertTo-Json -Depth 50 | Set-Content $Path -Encoding UTF8
}

function Build-SimplifiedVersion {
    param([string]$Skill)

    return @"
What this skill means:
$Skill is about helping you and your child stay calm, understand each other, and get through tricky moments together.

Why it matters:
When you use $Skill, your child feels safer, more understood, and more connected to you. This makes hard moments easier for both of you.

How to use it:
- Keep your voice calm and steady.
- Use short, simple sentences.
- Show your child you are listening.
- Give clear choices when things feel stuck.
- Take a slow breath before responding.

Example:
If your child is upset, you might say:
"I'm here. Let's take a breath. We can figure this out together."

Try this today:
Pick one small moment — like getting ready, bedtime, or a small disagreement — and practice using $Skill in a calm, simple way.
"@
}

# ------------------------------
# Main Loop
# ------------------------------

$sectionFiles = Get-ChildItem $SectionsDir -Filter *.json

foreach ($sf in $sectionFiles) {

    $raw = Load-JsonSafe $sf.FullName
    if (-not $raw -or -not $raw.id) { continue }

    $section = To-OrderedHashtable $raw

    # Extract skill name
    $skill = ($section.id -replace "^section_", "" -replace "_\d+$", "" -replace "_", " ")

    if (-not $section.Contains("simplified_parent_version")) {
        Write-Host "[SIMPLIFY] Adding simplified version -> $($section.id)"
        $section["simplified_parent_version"] = Build-SimplifiedVersion -Skill $skill
    }
    else {
        Write-Host "[SKIP] Already has simplified version -> $($section.id)"
    }

    Save-Json -Path $sf.FullName -Object $section
}

Write-Host "`nSimplified parent versions added to all sections."
