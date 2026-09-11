-- Sistema de turnos - Jose Oviedo Kinesiologia
-- Fuente de verdad: PostgreSQL/Supabase. La UI nunca decide disponibilidad final.

-- gen_random_uuid() es parte de PostgreSQL (>= 13); no requiere pgcrypto.

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
  request_id uuid not null unique,
  request_data jsonb not null,
  check (ends_at > starts_at)
);

create index appointments_service_start_idx on public.appointments(service_id, starts_at);
create index appointments_status_start_idx on public.appointments(status, starts_at);
create index appointments_patient_idx on public.appointments(patient_id, starts_at desc);

create table public.appointment_audit (
  id bigint generated always as identity primary key,
  appointment_id uuid not null references public.appointments(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index appointment_audit_appointment_idx on public.appointment_audit(appointment_id, created_at desc);

create table public.integration_outbox (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete restrict,
  channel public.integration_channel not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status public.outbox_status not null default 'pending',
  attempts integer not null default 0 check (attempts >= 0),
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
set search_path = ''
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
set search_path = ''
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
set search_path = ''
as $$
  select coalesce((select role from public.profiles where user_id = auth.uid() and active = true), 'user'::public.app_role);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_app_role() in ('admin'::public.app_role, 'superadmin'::public.app_role);
$$;

create or replace function public.available_slots(
  p_service_id uuid,
  p_date date
)
returns table (
  starts_at timestamptz,
  ends_at timestamptz,
  available_capacity integer
)
language sql
stable
security definer
set search_path = ''
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
  select distinct
    (g.local_slot at time zone 'America/Argentina/Catamarca') as starts_at,
    ((g.local_slot + make_interval(mins => g.duration_minutes)) at time zone 'America/Argentina/Catamarca') as ends_at,
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
  select s.starts_at, s.ends_at, s.capacity,
    coalesce((
      -- El maximo simultaneo, no la cantidad total de turnos que se cruzan.
      select max((select count(*) from public.appointments a
        where a.service_id = p_service_id
          and a.status in ('pending', 'confirmed', 'completed')
          and a.starts_at <= points.t and a.ends_at > points.t))::integer
      from (
        select s.starts_at as t
        union
        select a.starts_at from public.appointments a
        where a.service_id = p_service_id
          and a.status in ('pending', 'confirmed', 'completed')
          and a.starts_at > s.starts_at and a.starts_at < s.ends_at
      ) points
    ), 0) as occupied
  from slots s
  where s.starts_at > statement_timestamp()
    and p_date <= (statement_timestamp() at time zone 'America/Argentina/Catamarca')::date + 365
    and not exists (
      select 1 from public.blocked_periods b
      where (b.service_id is null or b.service_id = p_service_id)
        and b.starts_at < s.ends_at and b.ends_at > s.starts_at
    )
)
select starts_at, ends_at, capacity - occupied
from counted where occupied < capacity order by starts_at;
$$;

-- Solo backend de confianza, despues de Turnstile/rate limit/normalizacion.
create or replace function public.create_pending_appointment(
  p_service_id uuid,
  p_starts_at timestamptz,
  p_full_name text,
  p_phone text,
  p_phone_normalized text,
  p_email text default null,
  p_document_number text default null,
  p_reason text default '',
  p_source text default 'web',
  p_request_id uuid default null,
  p_privacy_consent boolean default false
)
returns public.appointments
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ends_at timestamptz;
  v_patient_id uuid;
  v_appointment public.appointments%rowtype;
  v_request jsonb;
begin
  -- READ COMMITTED permite una nueva instantanea despues de esperar el lock.
  if current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'UNSUPPORTED_ISOLATION' using errcode = '25000';
  end if;
  if p_service_id is null or p_starts_at is null or not isfinite(p_starts_at)
    or p_request_id is null or p_privacy_consent is distinct from true then
    raise exception 'INVALID_REQUEST' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_full_name, ''))) not between 3 and 160 then
    raise exception 'INVALID_NAME' using errcode = '22023';
  end if;
  if coalesce(p_phone_normalized, '') !~ '^\+[1-9][0-9]{7,14}$'
    or length(coalesce(p_phone, '')) not between 8 and 40 then
    raise exception 'INVALID_PHONE' using errcode = '22023';
  end if;
  if length(coalesce(p_email, '')) > 254
    or (nullif(trim(p_email), '') is not null and trim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')
    or length(coalesce(p_document_number, '')) > 40
    or length(coalesce(p_reason, '')) > 1000
    or p_source is distinct from 'web' then
    raise exception 'INVALID_INPUT' using errcode = '22023';
  end if;
  v_request := jsonb_build_object('service_id', p_service_id,
    'starts_at_epoch', extract(epoch from p_starts_at), 'name', trim(p_full_name),
    'phone', trim(p_phone), 'phone_normalized', p_phone_normalized,
    'email', nullif(trim(p_email), ''), 'document', nullif(trim(p_document_number), ''),
    'reason', coalesce(p_reason, ''), 'source', p_source);
  -- Mismo request concurrente: devolver el resultado original sin duplicar tareas.
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 17000));
  select * into v_appointment from public.appointments where request_id = p_request_id;
  if found then
    if v_appointment.request_data <> v_request then
      raise exception 'IDEMPOTENCY_CONFLICT' using errcode = '22023';
    end if;
    return v_appointment;
  end if;
  -- Un lock por servicio protege tambien horarios diferentes superpuestos.
  -- Futuras RPC de bloqueos/agenda/reprogramacion deben adquirir este mismo lock
  -- antes de escribir. Bloqueos globales: todos los servicios, ordenados por id.
  perform 1 from public.services where id = p_service_id for update;
  if not found or not exists (select 1 from public.services where id = p_service_id and active) then
    raise exception 'SERVICE_NOT_FOUND' using errcode = 'P0002';
  end if;
  select ends_at into v_ends_at
  from public.available_slots(p_service_id, (p_starts_at at time zone 'America/Argentina/Catamarca')::date)
  where starts_at = p_starts_at and starts_at > clock_timestamp();
  if not found then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
  end if;
  -- Un telefono no acredita identidad: no sobrescribir pacientes anteriores.
  insert into public.patients(full_name, phone, phone_normalized, email, document_number, privacy_consent_at)
  values (trim(p_full_name), trim(p_phone), p_phone_normalized,
    nullif(trim(p_email), ''), nullif(trim(p_document_number), ''), clock_timestamp())
  returning id into v_patient_id;
  insert into public.appointments(service_id, patient_id, starts_at, ends_at, status, reason, source, request_id, request_data)
  values (p_service_id, v_patient_id, p_starts_at, v_ends_at, 'pending', coalesce(p_reason, ''), p_source, p_request_id, v_request)
  returning * into v_appointment;
  insert into public.integration_outbox(appointment_id, channel, event_type, idempotency_key, payload)
  select v_appointment.id, channel, 'appointment.created',
    channel::text || ':create:' || v_appointment.id::text,
    jsonb_build_object('appointment_id', v_appointment.id, 'status', v_appointment.status,
      'starts_at', v_appointment.starts_at, 'ends_at', v_appointment.ends_at)
  from unnest(enum_range(null::public.integration_channel)) channel;
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
set search_path = ''
as $$
declare
  v_role public.app_role;
  v_appt public.appointments%rowtype;
begin
  v_role := public.current_app_role();
  if v_role not in ('admin', 'superadmin') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if p_status is null or length(coalesce(p_internal_notes, '')) > 4000 then
    raise exception 'INVALID_INPUT' using errcode = '22023';
  end if;
  select * into v_appt from public.appointments where id = p_appointment_id for update;
  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_appt.status = p_status then return v_appt; end if;
  if not ((v_appt.status = 'pending' and p_status in ('confirmed','cancelled','rejected'))
    or (v_appt.status = 'confirmed' and p_status in ('cancelled','completed'))) then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = '22023';
  end if;
  if p_status = 'completed' and v_appt.ends_at > clock_timestamp() then
    raise exception 'APPOINTMENT_NOT_FINISHED' using errcode = '22023';
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

  insert into public.integration_outbox(appointment_id, channel, event_type, idempotency_key, payload)
  select v_appt.id, channel, 'appointment.status_changed',
    channel::text || ':status:' || v_appt.id::text || ':' || p_status::text,
    jsonb_build_object('appointment_id', v_appt.id, 'status', v_appt.status,
      'starts_at', v_appt.starts_at, 'ends_at', v_appt.ends_at)
  from unnest(enum_range(null::public.integration_channel)) channel;

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

-- ACL explicitas: RLS no sustituye GRANT, ni protege funciones DEFINER.
revoke all on public.profiles, public.services, public.service_schedules, public.blocked_periods,
  public.patients, public.appointments, public.appointment_audit, public.integration_outbox
  from public, anon, authenticated, service_role;
revoke all on sequence public.appointment_audit_id_seq from public, anon, authenticated, service_role;
grant select on public.profiles, public.services, public.service_schedules, public.blocked_periods,
  public.patients, public.appointments, public.appointment_audit, public.integration_outbox to authenticated, service_role;
-- Ningun rol de API escribe turnos/historial/configuracion directamente.
-- La gestion de agenda se habilitara solo mediante RPC que tomen el lock de servicio.
grant insert (user_id, full_name, role, active), update (full_name, role, active)
  on public.profiles to authenticated;

revoke all on function public.touch_updated_at(), public.audit_appointment_changes(),
  public.current_app_role(), public.is_admin(), public.available_slots(uuid, date),
  public.create_pending_appointment(uuid, timestamptz, text, text, text, text, text, text, text, uuid, boolean),
  public.set_appointment_status(uuid, public.appointment_status, text)
  from public, anon, authenticated, service_role;
grant execute on function public.current_app_role(), public.is_admin() to authenticated;
grant execute on function public.available_slots(uuid, date),
  public.create_pending_appointment(uuid, timestamptz, text, text, text, text, text, text, text, uuid, boolean) to service_role;
grant execute on function public.set_appointment_status(uuid, public.appointment_status, text) to authenticated;

create policy services_read on public.services for select to authenticated using (active or public.is_admin());
create policy schedules_read on public.service_schedules for select to authenticated using (public.is_admin());
create policy blocked_admin_read on public.blocked_periods for select to authenticated using (public.is_admin());
create policy profiles_self_read on public.profiles for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy profiles_superadmin_insert on public.profiles for insert to authenticated
  with check (public.current_app_role() = 'superadmin');
create policy profiles_superadmin_update on public.profiles for update to authenticated
  using (public.current_app_role() = 'superadmin') with check (public.current_app_role() = 'superadmin');
create policy patients_admin_read on public.patients for select to authenticated using (public.is_admin());
create policy appointments_admin_read on public.appointments for select to authenticated using (public.is_admin());
create policy audit_admin_read on public.appointment_audit for select to authenticated using (public.is_admin());
create policy outbox_superadmin_read on public.integration_outbox for select to authenticated using (public.current_app_role() = 'superadmin');

-- Datos iniciales editables desde el panel.
insert into public.services(slug, name, description, duration_minutes, slot_interval_minutes, capacity)
values
  ('kinesiologia-deportiva', 'Kinesiología deportiva', 'Evaluación y tratamiento orientado a la actividad deportiva.', 60, 60, 1),
  ('rehabilitacion', 'Rehabilitación', 'Tratamientos de rehabilitación funcional.', 60, 60, 1),
  ('ondas-de-choque', 'Ondas de choque', 'Sesiones de ondas de choque.', 30, 30, 1),
  ('gimnasio', 'Gimnasio y rutinas personalizadas', 'Entrenamiento y seguimiento personalizado.', 60, 60, 1)
on conflict (slug) do nothing;
