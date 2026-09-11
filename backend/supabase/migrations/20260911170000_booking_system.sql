-- Sistema de turnos - Jose Oviedo Kinesiologia
-- Fuente de verdad: PostgreSQL/Supabase. La UI nunca decide disponibilidad final.

create extension if not exists pgcrypto;

create type public.app_role as enum ('user', 'admin', 'superadmin');
create type public.appointment_status as enum ('pending', 'confirmed', 'cancelled', 'rejected', 'completed');
create type public.outbox_status as enum ('pending', 'processing', 'sent', 'failed');
create type public.integration_channel as enum ('google_calendar', 'whatsapp_patient', 'whatsapp_assistant');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.app_role not null default 'user',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  duration_minutes integer not null check (duration_minutes between 5 and 480),
  slot_interval_minutes integer not null check (slot_interval_minutes between 5 and 480),
  capacity integer not null default 1 check (capacity between 1 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_schedules (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (end_time > start_time),
  unique (service_id, weekday, start_time, end_time)
);

create table public.blocked_periods (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  phone_normalized text not null,
  email text,
  document_number text,
  privacy_consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index patients_phone_normalized_idx on public.patients(phone_normalized);
create index patients_name_search_idx on public.patients using gin (to_tsvector('simple', full_name));

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id),
  patient_id uuid not null references public.patients(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  reason text not null default '',
  internal_notes text not null default '',
  google_event_id text unique,
  source text not null default 'web',
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  check (ends_at > starts_at)
);

create index appointments_service_start_idx on public.appointments(service_id, starts_at);
create index appointments_status_start_idx on public.appointments(status, starts_at);
create index appointments_patient_idx on public.appointments(patient_id, starts_at desc);

create table public.appointment_audit (
  id bigint generated always as identity primary key,
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index appointment_audit_appointment_idx on public.appointment_audit(appointment_id, created_at desc);

create table public.integration_outbox (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  channel public.integration_channel not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status public.outbox_status not null default 'pending',
  attempts integer not null default 0,
  idempotency_key text not null unique,
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index integration_outbox_pending_idx on public.integration_outbox(status, available_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();
create trigger services_touch before update on public.services
for each row execute function public.touch_updated_at();
create trigger patients_touch before update on public.patients
for each row execute function public.touch_updated_at();
create trigger appointments_touch before update on public.appointments
for each row execute function public.touch_updated_at();
create trigger outbox_touch before update on public.integration_outbox
for each row execute function public.touch_updated_at();

create or replace function public.audit_appointment_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.appointment_audit(appointment_id, actor_user_id, action, new_data)
    values (new.id, new.created_by, 'created', to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.appointment_audit(appointment_id, actor_user_id, action, old_data, new_data)
    values (new.id, new.updated_by, 'updated', to_jsonb(old), to_jsonb(new));
    return new;
  end if;
  return null;
end;
$$;

create trigger appointments_audit
  after insert or update on public.appointments
  for each row execute function public.audit_appointment_changes();

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where user_id = auth.uid() and active = true), 'user'::public.app_role);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() in ('admin'::public.app_role, 'superadmin'::public.app_role);
$$;

create or replace function public.available_slots(
  p_service_id uuid,
  p_date date,
  p_timezone text default 'America/Argentina/Catamarca'
)
returns table (
  starts_at timestamptz,
  ends_at timestamptz,
  available_capacity integer
)
language sql
stable
security definer
set search_path = public
as $$
with svc as (
  select id, duration_minutes, slot_interval_minutes, capacity
  from public.services
  where id = p_service_id and active = true
), windows as (
  select
    (p_date + ss.start_time) as local_start,
    (p_date + ss.end_time) as local_end,
    svc.duration_minutes,
    svc.slot_interval_minutes,
    svc.capacity
  from public.service_schedules ss
  join svc on svc.id = ss.service_id
  where ss.active = true
    and ss.weekday = extract(dow from p_date)::smallint
), slots as (
  select
    (g.local_slot at time zone p_timezone) as starts_at,
    ((g.local_slot + make_interval(mins => g.duration_minutes)) at time zone p_timezone) as ends_at,
    g.capacity
  from windows w
  cross join lateral (
    select gs as local_slot, w.duration_minutes, w.capacity
    from generate_series(
      w.local_start,
      w.local_end - make_interval(mins => w.duration_minutes),
      make_interval(mins => w.slot_interval_minutes)
    ) gs
  ) g
), counted as (
  select
    s.starts_at,
    s.ends_at,
    s.capacity,
    count(a.id) filter (where a.status in ('pending','confirmed'))::integer as occupied
  from slots s
  left join public.appointments a
    on a.service_id = p_service_id
   and a.starts_at < s.ends_at
   and a.ends_at > s.starts_at
   and a.status in ('pending','confirmed')
  where s.starts_at > now()
    and not exists (
      select 1 from public.blocked_periods b
      where (b.service_id is null or b.service_id = p_service_id)
        and b.starts_at < s.ends_at
        and b.ends_at > s.starts_at
    )
  group by s.starts_at, s.ends_at, s.capacity
)
select starts_at, ends_at, greatest(capacity - occupied, 0)
from counted
where occupied < capacity
order by starts_at;
$$;

create or replace function public.create_pending_appointment(
  p_service_id uuid,
  p_starts_at timestamptz,
  p_full_name text,
  p_phone text,
  p_phone_normalized text,
  p_email text default null,
  p_document_number text default null,
  p_reason text default '',
  p_source text default 'web'
)
returns public.appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service public.services%rowtype;
  v_ends_at timestamptz;
  v_patient_id uuid;
  v_appointment public.appointments%rowtype;
  v_occupied integer;
  v_local_date date;
  v_slot_exists boolean;
begin
  if length(trim(coalesce(p_full_name, ''))) < 3 then
    raise exception 'INVALID_NAME' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_phone_normalized, ''))) < 8 then
    raise exception 'INVALID_PHONE' using errcode = '22023';
  end if;

  select * into v_service
  from public.services
  where id = p_service_id and active = true;

  if not found then
    raise exception 'SERVICE_NOT_FOUND' using errcode = 'P0002';
  end if;

  v_ends_at := p_starts_at + make_interval(mins => v_service.duration_minutes);
  v_local_date := (p_starts_at at time zone 'America/Argentina/Catamarca')::date;

  -- Serializa todos los intentos para el mismo servicio + horario.
  perform pg_advisory_xact_lock(hashtextextended(p_service_id::text || '|' || p_starts_at::text, 0));

  select exists(
    select 1 from public.available_slots(p_service_id, v_local_date)
    where starts_at = p_starts_at
  ) into v_slot_exists;

  if not v_slot_exists then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
  end if;

  select count(*)::integer into v_occupied
  from public.appointments
  where service_id = p_service_id
    and starts_at < v_ends_at
    and ends_at > p_starts_at
    and status in ('pending','confirmed');

  if v_occupied >= v_service.capacity then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
  end if;

  select id into v_patient_id
  from public.patients
  where phone_normalized = trim(p_phone_normalized)
  order by updated_at desc
  limit 1;

  if v_patient_id is null then
    insert into public.patients(full_name, phone, phone_normalized, email, document_number, privacy_consent_at)
    values (trim(p_full_name), trim(p_phone), trim(p_phone_normalized), nullif(trim(coalesce(p_email,'')), ''), nullif(trim(coalesce(p_document_number,'')), ''), now())
    returning id into v_patient_id;
  else
    update public.patients
    set full_name = trim(p_full_name),
        phone = trim(p_phone),
        email = coalesce(nullif(trim(coalesce(p_email,'')), ''), email),
        document_number = coalesce(nullif(trim(coalesce(p_document_number,'')), ''), document_number),
        privacy_consent_at = now()
    where id = v_patient_id;
  end if;

  insert into public.appointments(service_id, patient_id, starts_at, ends_at, status, reason, source)
  values (p_service_id, v_patient_id, p_starts_at, v_ends_at, 'pending', left(coalesce(p_reason,''), 1000), left(coalesce(p_source,'web'), 40))
  returning * into v_appointment;

  insert into public.integration_outbox(appointment_id, channel, event_type, idempotency_key)
  values
    (v_appointment.id, 'google_calendar', 'appointment.created', 'calendar:create:' || v_appointment.id::text),
    (v_appointment.id, 'whatsapp_patient', 'appointment.created', 'wa:patient:create:' || v_appointment.id::text),
    (v_appointment.id, 'whatsapp_assistant', 'appointment.created', 'wa:assistant:create:' || v_appointment.id::text)
  on conflict (idempotency_key) do nothing;

  return v_appointment;
end;
$$;

create or replace function public.set_appointment_status(
  p_appointment_id uuid,
  p_status public.appointment_status,
  p_internal_notes text default null
)
returns public.appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.app_role;
  v_appt public.appointments%rowtype;
begin
  v_role := public.current_app_role();
  if v_role not in ('admin', 'superadmin') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  update public.appointments
  set status = p_status,
      internal_notes = coalesce(p_internal_notes, internal_notes),
      updated_by = auth.uid(),
      cancelled_at = case when p_status in ('cancelled','rejected') then now() else cancelled_at end
  where id = p_appointment_id
  returning * into v_appt;

  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0002';
  end if;

  insert into public.integration_outbox(appointment_id, channel, event_type, idempotency_key)
  values
    (v_appt.id, 'google_calendar', 'appointment.status_changed', 'calendar:status:' || v_appt.id::text || ':' || p_status::text),
    (v_appt.id, 'whatsapp_patient', 'appointment.status_changed', 'wa:patient:status:' || v_appt.id::text || ':' || p_status::text)
  on conflict (idempotency_key) do nothing;

  return v_appt;
end;
$$;

-- RLS: ninguna tabla sensible queda abierta al navegador anónimo.
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.service_schedules enable row level security;
alter table public.blocked_periods enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_audit enable row level security;
alter table public.integration_outbox enable row level security;

revoke all on public.profiles, public.services, public.service_schedules, public.blocked_periods,
  public.patients, public.appointments, public.appointment_audit, public.integration_outbox from anon;
revoke all on public.profiles, public.patients, public.appointments, public.appointment_audit, public.integration_outbox from authenticated;

grant select on public.services, public.service_schedules to anon, authenticated;
grant select on public.blocked_periods to authenticated;

grant execute on function public.available_slots(uuid, date, text) to anon, authenticated;
revoke execute on function public.create_pending_appointment(uuid, timestamptz, text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.create_pending_appointment(uuid, timestamptz, text, text, text, text, text, text, text) to service_role;
grant execute on function public.set_appointment_status(uuid, public.appointment_status, text) to authenticated, service_role;

create policy services_public_read on public.services for select using (active = true or public.is_admin());
create policy schedules_public_read on public.service_schedules for select using (active = true or public.is_admin());
create policy blocked_admin_read on public.blocked_periods for select using (public.is_admin());
create policy profiles_self_read on public.profiles for select using (user_id = auth.uid() or public.is_admin());
create policy profiles_superadmin_write on public.profiles for all using (public.current_app_role() = 'superadmin') with check (public.current_app_role() = 'superadmin');
create policy patients_admin_all on public.patients for all using (public.is_admin()) with check (public.is_admin());
create policy appointments_admin_all on public.appointments for all using (public.is_admin()) with check (public.is_admin());
create policy audit_admin_read on public.appointment_audit for select using (public.is_admin());
create policy outbox_superadmin_read on public.integration_outbox for select using (public.current_app_role() = 'superadmin');

-- Datos iniciales editables desde el panel.
insert into public.services(slug, name, description, duration_minutes, slot_interval_minutes, capacity)
values
  ('kinesiologia-deportiva', 'Kinesiología deportiva', 'Evaluación y tratamiento orientado a la actividad deportiva.', 60, 60, 1),
  ('rehabilitacion', 'Rehabilitación', 'Tratamientos de rehabilitación funcional.', 60, 60, 1),
  ('ondas-de-choque', 'Ondas de choque', 'Sesiones de ondas de choque.', 30, 30, 1),
  ('gimnasio', 'Gimnasio y rutinas personalizadas', 'Entrenamiento y seguimiento personalizado.', 60, 60, 1)
on conflict (slug) do nothing;
