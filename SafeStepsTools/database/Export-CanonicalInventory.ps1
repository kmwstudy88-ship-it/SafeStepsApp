param(
  [string]$OutputDirectory = "docs/database/inventory"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

$queries = @{
  "current_tables.csv" = "select * from safesteps_stage1_inventory.current_tables;"
  "current_columns.csv" = "select * from safesteps_stage1_inventory.current_columns;"
  "current_foreign_keys.csv" = "select * from safesteps_stage1_inventory.current_foreign_keys;"
  "current_indexes.csv" = "select * from safesteps_stage1_inventory.current_indexes;"
  "current_rls_policies.csv" = "select * from safesteps_stage1_inventory.current_rls_policies;"
  "current_functions.csv" = "select * from safesteps_stage1_inventory.current_functions;"
  "current_triggers.csv" = "select * from safesteps_stage1_inventory.current_triggers;"
  "tenant_boundary_gaps.csv" = "select * from safesteps_stage1_inventory.tenant_boundary_gaps;"
  "blocked_legacy_names.csv" = "select * from safesteps_stage1_inventory.blocked_legacy_names;"
}

foreach ($item in $queries.GetEnumerator()) {
  $target = Join-Path $OutputDirectory $item.Key
  $csv = & .\node_modules\.bin\supabase.cmd db query --linked $item.Value
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to export $($item.Key)"
  }
  $csv | Set-Content -Path $target -Encoding utf8
}

Write-Host "Canonical inventory exported to $OutputDirectory"
