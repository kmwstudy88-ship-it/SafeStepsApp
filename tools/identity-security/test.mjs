import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

// PostgreSQL execution against a disposable fixture, never a production connection.
// Physical columns come from the master snapshot. Domain FKs/other RPCs are outside
// this direct-client privilege test; full-stack staging remains a deployment gate.
const snapshot = JSON.parse(readFileSync(new URL('../../docs/architecture/safesteps-schema-snapshot.json', import.meta.url)));
const migration = readFileSync(new URL('../../supabase/migrations/20260912092748_identity_client_write_boundaries.sql', import.meta.url), 'utf8');
const db = new PGlite();
const q = (s) => '"' + s.replaceAll('"', '""') + '"';
const tables = ['profiles', 'staff_profiles', 'platform_tenant_memberships'];
const actor = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
let passed = 0;
async function check(label, operation) {
  await operation();
  passed++;
  console.log('PASS ' + label);
}
async function denied(sql) {
  await assert.rejects(db.exec(sql), (e) => e.code === '42501');
}
try {
  await db.exec(`
    create role authenticated;
    create role anon;
    create role service_role bypassrls;
    create schema auth;
    grant usage on schema public, auth to authenticated, anon, service_role;
    create function auth.uid() returns uuid language sql stable
      as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  `);
  for (const table of tables) {
    const columns = snapshot.columns.filter(c => c.table_name === table);
    assert.ok(columns.length, table + ' fixture missing');
    const declarations = columns.map(c => {
      let type = c.udt_name === 'citext' ? 'text' : c.udt_name;
      if (type.startsWith('_')) type = type.slice(1) + '[]';
      return q(c.column_name) + ' ' + type;
    });
    await db.exec('create table public.' + q(table) + ' (' + declarations.join(',') + ')');
    await db.exec('alter table public.' + q(table) + ' enable row level security');
    const ownerColumn = table === 'profiles' ? 'id' : 'user_id';
    await db.exec('create policy owner_all on public.' + q(table) +
      ' for all to authenticated using (' + q(ownerColumn) + '=auth.uid()) with check (' + q(ownerColumn) + '=auth.uid())');
    await db.exec('grant all on public.' + q(table) + ' to authenticated, anon, service_role');
  }
  await db.exec(`
    create view public.workers with (security_invoker=true) as
      select id,user_id,organisation_id,staff_role as role,display_name from public.staff_profiles;
    grant all on public.workers to authenticated,anon,service_role;
    -- Independent column grants are intentionally present before migration.
    grant update(role), insert(role) on public.profiles to authenticated;
    grant update(role), insert(role) on public.workers to authenticated;
    grant update(membership_role) on public.platform_tenant_memberships to public;
    insert into public.profiles(id,role,display_name) values
      ('11111111-1111-4111-8111-111111111111','parent','Original'), ('22222222-2222-4222-8222-222222222222','parent','Other');
    insert into public.staff_profiles(id,user_id,staff_role,display_name)
      values ('11111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','worker','Original');
    insert into public.platform_tenant_memberships(id,user_id,membership_role)
      values ('11111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','member');
    set role authenticated;
    select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
  `);
  await check('fixture reproduces profile self-promotion before fix', async () => {
    await db.exec("update profiles set role='admin' where id=auth.uid()");
    assert.equal((await db.query('select role from profiles where id=auth.uid()')).rows[0].role, 'admin');
    await db.exec("update profiles set role='parent' where id=auth.uid()");
  });
  await check('fixture reproduces membership self-promotion before fix', async () => {
    await db.exec("update platform_tenant_memberships set membership_role='tenant_admin'");
    assert.equal((await db.query('select membership_role from platform_tenant_memberships')).rows[0].membership_role,'tenant_admin');
    await db.exec("update platform_tenant_memberships set membership_role='member'");
  });
  await db.exec('reset role');
  await db.exec(migration);
  await check('migration can be reapplied without widening privileges', async () => { await db.exec(migration); });
  await db.exec('set role authenticated');
  for (const [label, sql] of [
    ['profile role promotion', "update profiles set role='admin' where id=auth.uid()"],
    ['profile alias reassignment', "update profiles set auth_user_id='22222222-2222-4222-8222-222222222222' where id=auth.uid()"],
    ['profile case reassignment', "update profiles set case_id='22222222-2222-4222-8222-222222222222' where id=auth.uid()"],
    ['profile tenant reassignment', "update profiles set default_tenant_id='22222222-2222-4222-8222-222222222222' where id=auth.uid()"],
    ['profile account-state reassignment', "update profiles set profile_status='active' where id=auth.uid()"],
    ['profile self-provisioning', "insert into profiles(id,role) values ('11111111-1111-4111-8111-111111111111','admin')"],
    ['profile delete/recreate path', "delete from profiles where id=auth.uid()"],
    ['staff role promotion', "update staff_profiles set staff_role='admin'"],
    ['staff organization reassignment', "update staff_profiles set organisation_id='22222222-2222-4222-8222-222222222222'"],
    ['staff self-provisioning', "insert into staff_profiles(id,user_id,staff_role) values ('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','admin')"],
    ['membership promotion', "update platform_tenant_memberships set membership_role='tenant_admin'"],
    ['membership self-admission', "insert into platform_tenant_memberships(user_id,tenant_id) values ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222')"],
    ['membership deletion', "delete from platform_tenant_memberships"],
    ['compatibility-view role promotion', "update workers set role='admin'"],
    ['compatibility-view insertion', "insert into workers(id,user_id,role) values ('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','admin')"],
    ['compatibility-view deletion', "delete from workers"]
  ]) await check('denies ' + label, () => denied(sql));
  await check('owner presentation update remains available', async () => {
    await db.exec("update profiles set display_name='Changed',preferred_name='Preferred',updated_at=now() where id=auth.uid()");
    assert.equal((await db.query('select display_name from profiles where id=auth.uid()')).rows[0].display_name,'Changed');
  });
  await check('staff display-name update remains available', async () => {
    await db.exec("update staff_profiles set display_name='Staff' where user_id=auth.uid()");
    assert.equal((await db.query('select display_name from staff_profiles')).rows[0].display_name,'Staff');
  });
  await check('RLS still excludes another actor', async () => {
    const result = await db.query("update profiles set display_name='Intrusion' where id='22222222-2222-4222-8222-222222222222' returning id");
    assert.equal(result.rows.length,0);
    assert.equal((await db.query('select id from profiles')).rows.length,1);
  });
  await db.exec('reset role; set role anon');
  await check('anonymous profile changes denied', () => denied("update profiles set display_name='Intrusion'"));
  await db.exec('reset role; set role service_role');
  await check('trusted service administration retained', async () => {
    await db.exec("update profiles set role='caseworker' where id='22222222-2222-4222-8222-222222222222'");
    assert.equal((await db.query("select role from profiles where id='22222222-2222-4222-8222-222222222222'")).rows[0].role,'caseworker');
  });
  await db.exec('reset role');
  await check('future protected columns fail closed', async () => {
    await db.exec('alter table profiles add column future_authority text');
    await db.exec('set role authenticated');
    await denied("update profiles set future_authority='admin'");
    await db.exec('reset role');
  });
  await check('migration aborts when inherited grants bypass boundaries', async () => {
    await db.exec('create role inherited_identity_writer');
    await db.exec('grant delete on profiles to inherited_identity_writer');
    await db.exec('grant inherited_identity_writer to authenticated');
    await assert.rejects(
      db.exec(migration),
      (e) => e.message?.includes('Inherited destructive client privilege remains on profiles')
    );
    await db.exec('rollback');
    const result = await db.query("select has_table_privilege('authenticated','public.profiles','DELETE') as can_delete");
    assert.equal(result.rows[0].can_delete, true);
  });
  await check('all non-allowlisted writes are absent from effective privileges', async () => {
    const allowed = {
      profiles: ['display_name','preferred_name','avatar_url','avatar_storage_path','story_goal','strengths','representation_preferences','primary_phone','preferred_language_code','preferred_timezone','accessibility_preferences','notification_preferences','updated_at'],
      staff_profiles: ['display_name'], platform_tenant_memberships: []
    };
    for (const table of tables) {
      for (const c of snapshot.columns.filter(x => x.table_name === table)) {
        const result = await db.query("select has_column_privilege('authenticated',$1,$2,'INSERT') as ins, has_column_privilege('authenticated',$1,$2,'UPDATE') as upd",['public.'+table,c.column_name]);
        assert.equal(result.rows[0].ins,false);
        assert.equal(result.rows[0].upd,allowed[table].includes(c.column_name));
      }
    }
  });
  await check('migration aborts when required identity tables are missing', async () => {
    await db.exec('drop table platform_tenant_memberships');
    await assert.rejects(
      db.exec(migration),
      (e) => e.message?.includes('Required identity table public.platform_tenant_memberships is missing')
    );
    await db.exec('rollback');
  });
  console.log('Passed ' + passed + ' isolated PostgreSQL checks. Production deployment not tested.');
} finally {
  await db.close();
}
