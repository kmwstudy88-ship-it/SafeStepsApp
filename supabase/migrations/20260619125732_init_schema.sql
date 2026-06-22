-- Enable RLS
alter table users enable row level security;
alter table families enable row level security;
alter table family_members enable row level security;

-- Users can view their own profile
create policy "Users can view their own profile"
on users
for select
using (auth.uid() = auth_user_id);

-- Family members can view their families
create policy "Family members can view their families"
on families
for select
using (
  exists (
    select 1
    from family_members fm
    join users u on u.id = fm.user_id
    where fm.family_id = families.id
      and u.auth_user_id = auth.uid()
  )
);
