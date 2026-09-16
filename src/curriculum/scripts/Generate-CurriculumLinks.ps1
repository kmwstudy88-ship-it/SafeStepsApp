Write-Host "=== Generate-CurriculumLinks.ps1 ==="

$LessonsDir  = ".\lessons"
$SectionsDir = ".\sections"

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

# ---------------------------------------------------------
# LOAD ALL SECTIONS (SUPPORT BOTH NAMING PATTERNS)
# ---------------------------------------------------------
$sectionFiles = Get-ChildItem $SectionsDir -Filter *.json
$sections = @{}

foreach ($sf in $sectionFiles) {

    $raw = Load-JsonSafe $sf.FullName
    if (-not $raw -or -not $raw.id) { continue }

    $sec = To-OrderedHashtable $raw

    # Example IDs:
    #   section_understanding_child_trauma_01
    #   section_lesson_understanding_child_trauma_01

    # Remove "section_" prefix
    $clean = $sec.id -replace "^section_", ""

    # Remove trailing _NN
    $clean = $clean -replace "_\d+$", ""

    # Remove "lesson_" prefix if present
    $lessonId = $clean -replace "^lesson_", ""

    if (-not $sections.ContainsKey($lessonId)) {
        $sections[$lessonId] = @()
    }

    $sections[$lessonId] += $sec
}

# ---------------------------------------------------------
# LINK SECTIONS INTO LESSONS
# ---------------------------------------------------------
$lessonFiles = Get-ChildItem $LessonsDir -Filter *.json

foreach ($lf in $lessonFiles) {

    $raw = Load-JsonSafe $lf.FullName
    if (-not $raw -or -not $raw.id) { continue }

    $lesson = To-OrderedHashtable $raw
    $lessonId = $lesson.id

    if ($sections.ContainsKey($lessonId)) {
        $linked = $sections[$lessonId]
        $lesson["sections"] = $linked

        Write-Host "[LINK] $lessonId -> $($linked.Count) sections"
    }
    else {
        $lesson["sections"] = @()
        Write-Warning "[SKIP] No sections found for $lessonId"
    }

    Save-Json -Path $lf.FullName -Object $lesson
}

Write-Host "`n=== Curriculum linking complete ==="
