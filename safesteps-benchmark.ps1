param(
    [string]$Root="C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Benchmark Engine ===" -ForegroundColor Cyan

$sw=[System.Diagnostics.Stopwatch]::StartNew()

foreach($f in Get-ChildItem -Recurse $Root -Filter *.json){
    Get-Content $f.FullName -Raw|ConvertFrom-Json|Out-Null
}

$sw.Stop()

$path=Join-Path $Root "benchmark.json"
@{milliseconds=$sw.ElapsedMilliseconds}|ConvertTo-Json|Set-Content -Encoding UTF8 -Path $path

Write-Host "Benchmark complete: $path" -ForegroundColor Green
