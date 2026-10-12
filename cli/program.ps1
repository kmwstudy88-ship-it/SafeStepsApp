param(
    [Parameter(Mandatory=$true)]
    [string]$Action,
    [string]$Arg1,
    [string]$Arg2
)

$root = "C:\Users\SAFES\SafeStepsApp"
$curriculum = Join-Path $root "safesteps-curriculum"

switch ($Action) {

    "export" {
        $out = if ($Arg1) { $Arg1 } else { "program-export.json" }
        $src = Join-Path $curriculum "combined-curriculum.json"
        if (Test-Path $src) {
            Copy-Item $src $out -Force
            Write-Host "Exported to $out"
        } else {
            Write-Host "No combined curriculum found. Run ss build first."
        }
    }

    "diff" {
        if (-not $Arg1 -or -not $Arg2) {
            Write-Host "Usage: ss program diff <file1> <file2>"
            exit
        }
        $a = Get-Content $Arg1 -Raw | ConvertFrom-Json
        $b = Get-Content $Arg2 -Raw | ConvertFrom-Json

        Compare-Object ($a | ConvertTo-Json -Depth 10) ($b | ConvertTo-Json -Depth 10)
    }

    default {
        Write-Host "Unknown program command: $Action"
    }
}
