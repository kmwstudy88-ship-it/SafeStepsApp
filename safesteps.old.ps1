param(
    [string]$Command = "",
    [string]$Arg1 = "",
    [string]$Arg2 = ""
)

$root = "C:\Users\SAFES\SafeStepsApp"

$arguments = @(
    "-Command", "$Command",
    "-Arg1", "$Arg1",
    "-Arg2", "$Arg2"
)

powershell -ExecutionPolicy Bypass -File "$root\safesteps-engine.ps1" @arguments