param(
    [string]$Root="C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Auto-Fix Engine ===" -ForegroundColor Cyan

foreach($f in Get-ChildItem -Recurse $Root -Filter *.json){
    try{
        $json=Get-Content $f.FullName -Raw|ConvertFrom-Json
        if(-not$json.id){
            $json|Add-Member -NotePropertyName id -NotePropertyValue ([guid]::NewGuid().ToString())
        }
        $json|ConvertTo-Json -Depth 20|Set-Content -Encoding UTF8 -Path $f.FullName
    }catch{}
}

Write-Host "Auto-fix complete." -ForegroundColor Green
