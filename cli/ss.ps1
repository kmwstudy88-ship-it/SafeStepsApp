"assessment-install" {
    param($name)

    switch ($name) {
        "drug-alcohol-use" {
            & (Join-Path $cli "install-drug-alcohol-use.ps1")
        }
        default {
            Write-Host "Unknown assessment module: $name"
        }
    }
}
