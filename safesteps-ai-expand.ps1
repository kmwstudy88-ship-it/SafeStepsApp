param(
    [string]$Root="C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps AI Expansion Engine ===" -ForegroundColor Cyan

$out="C:\SafeSteps\ai-expansions"
if(-not(Test-Path $out)){New-Item -ItemType Directory -Path $out|Out-Null}

foreach($l in Get-ChildItem "$Root\lessons" -Filter *.json){
    $json=Get-Content $l.FullName -Raw|ConvertFrom-Json
    $text=$json.content|Out-String

    $expanded=$text + "`n`nAdditional Explanation: This section expands on the core ideas."

    $obj=[PSCustomObject]@{
        id=$json.id
        expanded=$expanded
    }

    $obj|ConvertTo-Json -Depth 20|Set-Content -Encoding UTF8 -Path (Join-Path $out "$($json.id).json")
}

Write-Host "AI expansions created: $out" -ForegroundColor Green
