param(
    [string]$Root="C:\Users\SAFES\SafeStepsApp\curriculum",
    [int]$Iterations=50
)

Write-Host "=== SafeSteps Stress Test Engine ===" -ForegroundColor Cyan

for($i=1;$i -le $Iterations;$i++){
    foreach($f in Get-ChildItem -Recurse $Root -Filter *.json){
        try{
            Get-Content $f.FullName -Raw|ConvertFrom-Json|Out-Null
        }catch{
            Write-Host "Error in $($f.FullName)" -ForegroundColor Red
        }
    }
}

Write-Host "Stress test completed." -ForegroundColor Green
