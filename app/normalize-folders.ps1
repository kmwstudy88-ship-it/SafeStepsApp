# ============================================
# SafeSteps Folder Name Normalization
# ============================================

Write-Host "Normalizing SafeSteps folder names..."

$root = "SafeStepsLibrary\Courses"

# Characters allowed: letters, numbers, dash, underscore
$allowed = '[^a-zA-Z0-9_\-]'

$folders = Get-ChildItem -Recurse -Directory $root

foreach ($folder in $folders) {

    $original = $folder.FullName
    $name = $folder.Name

    # Replace spaces and invalid characters
    $newName = $name -replace $allowed, '-'  # replace invalid chars with dash
    $newName = $newName -replace '--+', '-'  # collapse multiple dashes
    $newName = $newName.Trim('-')            # trim leading/trailing dashes

    # Optional: enforce lowercase
    $newName = $newName.ToLower()

    if ($newName -ne $name) {
        $newPath = Join-Path $folder.Parent.FullName $newName
        Write-Host "Renaming: $name -> $newName"
        Rename-Item -Path $folder.FullName -NewName $newName
    }
}

Write-Host "Folder normalization complete."