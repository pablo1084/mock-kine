import { readFile } from 'node:fs/promises';

export const migration = await readFile(new URL('../../supabase/migrations/20260911170000_booking_system.sql', import.meta.url), 'utf8');
// Solo base VACIA de pruebas. Emula identidad y ACL por defecto de Supabase.
export const bootstrap = `
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as
$$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth, public to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
`;
export const service = '00000000-0000-4000-8000-000000000001';
export const admin = '00000000-0000-4000-8000-000000000002';
export const superadmin = '00000000-0000-4000-8000-000000000003';
export const user = '00000000-0000-4000-8000-000000000004';
export const fixture = `
insert into auth.users values ('${admin}'), ('${superadmin}'), ('${user}');
insert into public.profiles(user_id, role) values ('${admin}', 'admin'), ('${superadmin}', 'superadmin'), ('${user}', 'user');
insert into public.services(id, slug, name, duration_minutes, slot_interval_minutes, capacity)
values ('${service}', 'test', 'Test', 60, 30, 1);
insert into public.service_schedules(service_id, weekday, start_time, end_time)
select '${service}', d, '09:00', '14:00' from generate_series(0,6) d;
`;
export const daySql = `(statement_timestamp() at time zone 'America/Argentina/Catamarca')::date + 2`;
export const startSql = (time = '09:00') => `((${daySql}) + time '${time}') at time zone 'America/Argentina/Catamarca'`;
export const bookingSql = (time = '09:00') => `select * from public.create_pending_appointment(
 '${service}', ${startSql(time)}, 'Paciente Test', '+5493834123456', '+5493834123456',
 null, null, '', 'web', $1::uuid, true)`;
