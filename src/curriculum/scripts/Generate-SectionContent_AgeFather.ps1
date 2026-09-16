param(
    [string]$SectionsDir = ".\sections"
)

Write-Host "=== Generate-SectionContent_AgeFather.ps1 ==="

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

function Build-AgeVariant {
    param(
        [string]$Age,
        [string]$BaseContent
    )

    switch ($Age) {
        "toddlers" {
            return "For toddlers: Use very simple words, short sentences, and lots of calm, gentle reassurance. $BaseContent"
        }
        "school_age" {
            return "For school-age children: Explain things clearly, invite questions, and help them name their feelings. $BaseContent"
        }
        "teens" {
            return "For teens: Respect their growing independence, listen carefully, and involve them in decisions. $BaseContent"
        }
        default {
            return $BaseContent
        }
    }
}

function Build-FatherhoodVariant {
    param(
        [string]$BaseContent
    )

    return "For fathers and father-figures: Focus on staying present, accountable, and emotionally available. $BaseContent"
}

$sectionFiles = Get-ChildItem $SectionsDir -Filter *.json

foreach ($sf in $sectionFiles) {

    $raw = Load-JsonSafe $sf.FullName
    if (-not $raw -or -not $raw.id) { continue }

    $section = To-OrderedHashtable $raw

    if (-not $section.Contains("content")) {
        Write-Warning "[SKIP] No base content -> $($section.id)"
        continue
    }

    $baseContent = $section.content.overview

    # Ensure content_variants exists and is a real hashtable
    if (-not $section.Contains("content_variants")) {
        $section["content_variants"] = [ordered]@{}
    }
    elseif ($section["content_variants"] -is [System.Management.Automation.PSCustomObject]) {
        $section["content_variants"] = To-OrderedHashtable $section["content_variants"]
    }

    Write-Host "[VARIANTS] Adding age + fatherhood -> $($section.id)"

    $section["content_variants"]["toddlers"]   = Build-AgeVariant -Age "toddlers" -BaseContent $baseContent
    $section["content_variants"]["school_age"] = Build-AgeVariant -Age "school_age" -BaseContent $baseContent
    $section["content_variants"]["teens"]      = Build-AgeVariant -Age "teens" -BaseContent $baseContent
    $section["content_variants"]["fatherhood"] = Build-FatherhoodVariant -BaseContent $baseContent

    Save-Json -Path $sf.FullName -Object $section
}

Write-Host "`nAge-specific + fatherhood variants added to all sections."
