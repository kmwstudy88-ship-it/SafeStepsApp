$root = "C:\Users\SAFES\safesteps\safesteps-curriculum"

$lessons = Get-ChildItem "$root\lessons" -Recurse -File -Filter *.json | ForEach-Object {
    [PSCustomObject]@{
        id = $_.BaseName
        path = $_.FullName.Replace($root, "")
    }
}

$programs = Get-ChildItem "$root\programs" -Directory | ForEach-Object {
    [PSCustomObject]@{
        program = $_.Name
        path = $_.FullName.Replace($root, "")
    }
}

$index = [PSCustomObject]@{
    generated_at = (Get-Date)
    lessons = $lessons
    programs = $programs
}

$index | ConvertTo-Json -Depth 10 | Set-Content "$root\master-index.json" -Encoding UTF8

Write-Host "Master index generated successfully."
