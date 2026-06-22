param(
    [string]$Root="C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps AI Rewrite Engine ===" -ForegroundColor Cyan

$out="C:\SafeSteps\ai-rewrites"
if(-not(Test-Path $out)){New-Item -ItemType Directory -Path $out|Out-Null}

foreach($l in Get-ChildItem "$Root\lessons" -Filter *.json){
    $json=Get-Content $l.FullName -Raw|ConvertFrom-Json
    $text=$json.content|Out-String
    $short=$text.Substring(0,[Math]::Min(250,$text.Length))

    $obj=[PSCustomObject]@{
        id=$json.id
        rewrite=$short
    }

    $obj|ConvertTo-Json -Depth 20|Set-Content -Encoding UTF8 -Path (Join-Path $out "$($json.id).json")
}

Write-Host "AI rewrites created: $out" -ForegroundColor Green
