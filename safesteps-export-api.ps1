param(
    [string]$Root="C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Export API Engine ===" -ForegroundColor Cyan

$out="C:\SafeSteps\api-export"
if(-not(Test-Path $out)){New-Item -ItemType Directory -Path $out|Out-Null}

$bundle=[ordered]@{
    programs=@()
    stages=@()
    weeks=@()
    lessons=@()
}

foreach($f in Get-ChildItem -Recurse $Root -Filter *.json){
    try{
        $json=Get-Content $f.FullName -Raw|ConvertFrom-Json
        $bundle.$($json.type)+=$json
    }catch{}
}

$bundle|ConvertTo-Json -Depth 20|Set-Content -Encoding UTF8 -Path (Join-Path $out "api-bundle.json")

Write-Host "API export created: $out" -ForegroundColor Green
