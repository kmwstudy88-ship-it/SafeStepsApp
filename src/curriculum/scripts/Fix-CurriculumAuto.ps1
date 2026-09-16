param(
    [string]$TopicsDir   = ".\topics",
    [string]$ModulesDir  = ".\modules",
    [string]$LessonsDir  = ".\lessons",
    [string]$SectionsDir = ".\sections"
)

Write-Host "=== Fix-CurriculumAuto.ps1 ==="

function Load-JsonSafe {
    param([string]$Path)
    try {
        return (Get-Content $Path -Raw | ConvertFrom-Json)
    }
    catch {
        Write-Warning "Malformed JSON → $Path"
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

function Fix-Filename {
    param(
        [string]$Path,
        [string]$CorrectName
    )

    $dir = Split-Path $Path
    $newPath = Join-Path $dir $CorrectName

    if ($Path -ne $newPath) {
        if (Test-Path $newPath) {
            Write-Host "[SKIP] File already exists → $CorrectName"
        }
        else {
            Write-Host "[RENAME] $Path → $CorrectName"
            Rename-Item -Path $Path -NewName $CorrectName -Force
        }
    }
}

function Fix-Object {
    param(
        [string]$Path
    )

    $obj = Load-JsonSafe $Path
    if (-not $obj) { return }

    # ⭐ REBUILD OBJECT SAFELY
    $newObj = [ordered]@{}
    foreach ($prop in $obj.PSObject.Properties) {
        $newObj[$prop.Name] = $prop.Value
    }

    # Ensure ID exists
    if (-not $newObj.Contains("id") -or [string]::IsNullOrWhiteSpace($newObj["id"])) {
        $base = [IO.Path]::GetFileNameWithoutExtension($Path)
        $newObj["id"] = $base
        Write-Host "[FIX] Added missing id → $base"
    }

    # Normalise ID
    $normalId = $newObj["id"].ToLower().Replace(" ", "_").Replace("-", "_")
    $newObj["id"] = $normalId

    # Ensure arrays exist
    foreach ($field in @("modules", "lessons", "sections")) {
        if ($newObj.Contains($field)) {
            if ($newObj[$field] -eq $null -or $newObj[$field] -isnot [System.Collections.IEnumerable]) {
                Write-Host "[FIX] Resetting '$field' → $normalId"
                $newObj[$field] = @()
            }
        }
    }

    # Save fixed JSON
    Save-Json -Path $Path -Object $newObj

    # Fix filename
    Fix-Filename -Path $Path -CorrectName "$normalId.json"
}

# Process all folders
foreach ($dir in @($TopicsDir, $ModulesDir, $LessonsDir, $SectionsDir)) {
    if (-not (Test-Path $dir)) { continue }

    Write-Host "`n[DIR] $dir" -ForegroundColor Cyan

    $files = Get-ChildItem $dir -Filter *.json
    foreach ($f in $files) {
        Fix-Object -Path $f.FullName
    }
}

Write-Host "`nAuto-fix complete." -ForegroundColor Green
