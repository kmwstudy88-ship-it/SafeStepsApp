# Requires -Version 7.0

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet("Status", "Push", "Verify", "NewMigration", "Advisors", "SecurityAudit")]
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
        "achievements",
        "case_plan_goals",
        "case_safety_plans",
        "cases",
        "certificates",
        "child_profiles",
        "contact_sessions",
        "courses",
        "evidence_items",
        "facilitator_observations",
        "lesson_progress",
        "lessons",
        "notifications",
        "profile_cases",
        "program_reflections",
        "programs",
        "quest_progress",
        "quests",
        "reunification_cases",
        "reunification_overrides",
        "reunification_recommendations",
        "resources",
        "user_achievements",
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

function Invoke-SafeStepsSecurityAudit {
    $Sql = @"
select
  'rls_status' as audit_type,
  c.relname as table_name,
  null::text as policy_name,
  null::text as command,
  null::text as roles,
  case when c.relrowsecurity then 'enabled' else 'disabled' end as status,
  format('forced=%s policies=%s', c.relforcerowsecurity, count(p.polname)) as detail
from pg_class c
join pg_namespace n
  on n.oid = c.relnamespace
left join pg_policy p
  on p.polrelid = c.oid
where n.nspname = 'public'
  and c.relkind = 'r'
group by n.nspname, c.relname, c.relrowsecurity, c.relforcerowsecurity
union all
select
  'broad_policy' as audit_type,
  tablename,
  policyname,
  cmd::text,
  roles::text,
  'review' as status,
  'Policy applies to public or anon role.' as detail
from pg_policies
where schemaname = 'public'
  and roles && array['public'::name, 'anon'::name]
order by audit_type, table_name, policy_name;
"@

    $TempSql = Join-Path ([System.IO.Path]::GetTempPath()) "safesteps_security_audit.sql"
    $Sql | Set-Content -LiteralPath $TempSql -Encoding utf8

    Write-Host "Auditing RLS and broad public/anon policies in linked Supabase project..." -ForegroundColor Cyan
    Invoke-Supabase @("db", "query", "--linked", "--file", $TempSql)
}

switch ($Action) {
    "Status" {
        Write-Host "Checking local and remote migration status..." -ForegroundColor Cyan
        Invoke-Supabase @("migration", "list")
    }
    "Push" {
        Write-Host "Applying pending Supabase migrations to the linked project..." -ForegroundColor Cyan
        Invoke-Supabase @("db", "push", "--yes")
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
        Write-Host "Running Supabase database advisors against linked project..." -ForegroundColor Cyan
        Invoke-Supabase @("db", "advisors", "--linked")
    }
    "SecurityAudit" {
        Invoke-SafeStepsSecurityAudit
    }
}
