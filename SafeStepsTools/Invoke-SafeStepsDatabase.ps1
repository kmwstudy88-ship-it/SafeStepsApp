# Requires -Version 7.0

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet("Status", "Push", "Verify", "NewMigration", "Advisors")]
    [string]$Action,

    [Parameter(Position = 1)]
    [ValidatePattern("^[a-z0-9_]+$")]
    [string]$Name
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$SupabaseCli = Join-Path $RepoRoot "node_modules\.bin\supabase.cmd"

if (-not (Test-Path -LiteralPath $SupabaseCli)) {
    throw "Supabase CLI not found at $SupabaseCli. Run npm install first."
}

function Invoke-Supabase {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    Push-Location $RepoRoot
    try {
        & $SupabaseCli @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "supabase $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
}

function Invoke-SafeStepsVerification {
    $ExpectedTables = @(
        "app_profiles",
        "assessment_records",
        "case_plan_goals",
        "case_safety_plans",
        "certificates",
        "child_profiles",
        "courses",
        "evidence_items",
        "lesson_progress",
        "lessons",
        "notifications",
        "program_reflections",
        "programs",
        "reunification_cases",
        "resources",
        "user_tasks"
    )

    $Sql = @"
select
  expected.table_name,
  case when actual.table_name is null then 'missing' else 'present' end as status
from (
  values
    $(($ExpectedTables | ForEach-Object { "('$_')" }) -join ",`n    ")
) as expected(table_name)
left join information_schema.tables actual
  on actual.table_schema = 'public'
 and actual.table_name = expected.table_name
order by expected.table_name;

select
  count(*) filter (where actual.table_name is not null) as present_count,
  count(*) as expected_count
from (values $(($ExpectedTables | ForEach-Object { "('$_')" }) -join ", ")) as expected(table_name)
left join information_schema.tables actual
  on actual.table_schema = 'public'
 and actual.table_name = expected.table_name;
"@

    $TempSql = Join-Path ([System.IO.Path]::GetTempPath()) "safesteps_verify_backend.sql"
    $Sql | Set-Content -LiteralPath $TempSql -Encoding utf8

    Write-Host "Verifying expected SafeSteps tables in linked Supabase project..." -ForegroundColor Cyan
    Invoke-Supabase @("db", "query", "--linked", "--file", $TempSql)
}

switch ($Action) {
    "Status" {
        Write-Host "Checking local and remote migration status..." -ForegroundColor Cyan
        Invoke-Supabase @("migration", "list")
    }
    "Push" {
        Write-Host "Applying pending Supabase migrations to the linked project..." -ForegroundColor Cyan
        Invoke-Supabase @("db", "push")
    }
    "Verify" {
        Invoke-SafeStepsVerification
    }
    "NewMigration" {
        if ([string]::IsNullOrWhiteSpace($Name)) {
            throw "Provide a snake_case migration name. Example: npm run db:new add_case_notes"
        }

        Write-Host "Creating new Supabase migration: $Name" -ForegroundColor Cyan
        Invoke-Supabase @("migration", "new", $Name)
    }
    "Advisors" {
        Write-Host "Running Supabase database advisors..." -ForegroundColor Cyan
        Invoke-Supabase @("db", "advisors")
    }
}
