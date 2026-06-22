-- ============================================
-- SafeSteps Initial Schema (PostgreSQL)
-- ============================================

-- USERS TABLE (linked to auth.users)
create table users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  role text not null check (role in ('parent', 'worker', 'admin')),
  created_at timestamptz default now()
);

-- FAMILIES TABLE
create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- FAMILY MEMBERS TABLE (links users to families)
create table family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  created_at timestamptz default now()
);
