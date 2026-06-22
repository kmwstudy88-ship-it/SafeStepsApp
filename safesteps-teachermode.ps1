param(
    [string]$Root="C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Teacher Mode Engine ===" -ForegroundColor Cyan

$out="C:\SafeSteps\teacher-mode"
if(-not(Test-Path $out)){New-Item -ItemType Directory -Path $out|Out-Null}

$lessons=Get-ChildItem "$Root\lessons" -Filter *.json

foreach($l in $lessons){
    $json=Get-Content $l.FullName -Raw|ConvertFrom-Json
    $text=$json.content|Out-String

    $notes="Teacher Notes: Focus on key concepts, check understanding, encourage discussion."

    $obj=[PSCustomObject]@{
        id=$json.id
        teacherNotes=$notes
        summary=$text.Substring(0,[Math]::Min(200,$text.Length))
    }

    $obj|ConvertTo-Json -Depth 20|Set-Content -Encoding UTF8 -Path (Join-Path $out "$($json.id).json")
}

Write-Host "Teacher mode summaries created: $out" -ForegroundColor Green
