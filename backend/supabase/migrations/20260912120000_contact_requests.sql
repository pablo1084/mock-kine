-- Nuevo flujo: solicitudes de contacto, sin agenda, cupos ni Google Calendar.
-- Se conserva el dominio anterior por historial; se retiran sus RPC de los roles API.
revoke all on function public.available_slots(uuid, date),
  public.create_pending_appointment(uuid, timestamptz, text, text, text, text, text, text, text, uuid, boolean),
  public.set_appointment_status(uuid, public.appointment_status, text)
  from public, anon, authenticated, service_role;

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  service_id uuid not null references public.services(id),
  service_name text not null,
  full_name text not null check (length(full_name) between 3 and 160),
  phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  description text not null check (length(description) between 1 and 500),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table public.contact_notifications (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contact_requests(id) on delete restrict,
  recipient text not null check (recipient in ('patient', 'center')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'accepted', 'failed', 'unknown')),
  attempts integer not null default 0 check (attempts between 0 and 5),
  available_at timestamptz not null default now(),
  claimed_at timestamptz,
  claim_token uuid,
  provider_message_id text unique,
  error_code text,
  updated_at timestamptz not null default now(),
  unique (contact_id, recipient)
);
create index contact_notifications_pending_idx on public.contact_notifications(status, available_at);
alter table public.contact_requests enable row level security;
alter table public.contact_notifications enable row level security;
revoke all on public.contact_requests, public.contact_notifications from public, anon, authenticated, service_role;
grant select on public.contact_requests, public.contact_notifications to authenticated;
create policy contact_requests_admin_read on public.contact_requests for select to authenticated using (public.is_admin());
create policy contact_notifications_admin_read on public.contact_notifications for select to authenticated using (public.is_admin());

create function public.create_contact_request(p_request_id uuid, p_service_id uuid, p_full_name text,
  p_phone_normalized text, p_description text, p_privacy_consent boolean)
returns table (id uuid, status text)
language plpgsql security definer set search_path = ''
as $$
declare
  v_request public.contact_requests%rowtype;
  v_name text;
begin
  if current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'UNSUPPORTED_ISOLATION' using errcode = '25000';
  end if;
  if p_request_id is null or p_service_id is null or p_privacy_consent is distinct from true
    or length(trim(coalesce(p_full_name, ''))) not between 3 and 160
    or coalesce(p_phone_normalized, '') !~ '^\+[1-9][0-9]{7,14}$'
    or length(trim(coalesce(p_description, ''))) not between 1 and 500
    or p_full_name ~ '[[:cntrl:]]' or p_description ~ '[[:cntrl:]]' then
    raise exception 'INVALID_INPUT' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 121200));
  select * into v_request from public.contact_requests c where c.request_id = p_request_id;
  if found then
    if v_request.service_id <> p_service_id or v_request.full_name <> trim(p_full_name)
      or v_request.phone <> p_phone_normalized or v_request.description <> trim(p_description) then
      raise exception 'IDEMPOTENCY_CONFLICT' using errcode = '22023';
    end if;
    return query select v_request.id, 'received'::text;
    return;
  end if;
  select s.name into v_name from public.services s where s.id = p_service_id and s.active for share;
  if not found then raise exception 'SERVICE_NOT_FOUND' using errcode = 'P0002'; end if;
  insert into public.contact_requests(request_id, service_id, service_name, full_name, phone, description)
  values (p_request_id, p_service_id, v_name, trim(p_full_name), p_phone_normalized, trim(p_description))
  returning * into v_request;
  insert into public.contact_notifications(contact_id, recipient)
  values (v_request.id, 'patient'), (v_request.id, 'center');
  return query select v_request.id, 'received'::text;
end;
$$;

create function public.claim_contact_notifications(p_contact_id uuid default null)
returns table (id uuid, claim_token uuid, recipient text, full_name text, phone text, service_name text, description text)
language plpgsql security definer set search_path = ''
as $$
begin
  -- Una ejecucion interrumpida pudo enviar el mensaje. No reenviar ciegamente.
  update public.contact_notifications n set status = 'unknown', error_code = 'LEASE_EXPIRED', updated_at = now()
  where n.status = 'processing' and n.claimed_at < now() - interval '2 minutes';
  return query
  with candidates as (
    select n.id from public.contact_notifications n
    where n.status = 'pending' and n.available_at <= now() and n.attempts < 5
      and (p_contact_id is null or n.contact_id = p_contact_id)
    order by n.available_at, n.id limit 2 for update skip locked
  ), claimed as (
    update public.contact_notifications n set status = 'processing', attempts = n.attempts + 1,
      claimed_at = now(), claim_token = gen_random_uuid(), updated_at = now()
    from candidates c where n.id = c.id returning n.*
  )
  select n.id, n.claim_token, n.recipient, r.full_name, r.phone, r.service_name, r.description
  from claimed n join public.contact_requests r on r.id = n.contact_id;
end;
$$;

create function public.finish_contact_notification(p_id uuid, p_claim_token uuid, p_result text,
  p_message_id text default null, p_error_code text default null)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if p_result is null or p_result not in ('accepted', 'retry', 'failed', 'unknown')
    or (p_result = 'accepted' and (p_message_id is null or length(p_message_id) not between 1 and 500))
    or (p_error_code is not null and p_error_code !~ '^[A-Z0-9_]{1,80}$') then
    raise exception 'INVALID_INPUT' using errcode = '22023';
  end if;
  update public.contact_notifications n set
    status = case when p_result = 'retry' then case when n.attempts < 5 then 'pending' else 'failed' end else p_result end,
    available_at = now() + make_interval(secs => (60 * power(2, n.attempts - 1))::integer),
    provider_message_id = case when p_result = 'accepted' then p_message_id else null end,
    error_code = p_error_code, updated_at = now()
  where n.id = p_id and n.claim_token = p_claim_token and n.status in ('processing', 'unknown');
end;
$$;
revoke all on function public.create_contact_request(uuid, uuid, text, text, text, boolean),
  public.claim_contact_notifications(uuid), public.finish_contact_notification(uuid, uuid, text, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.create_contact_request(uuid, uuid, text, text, text, boolean),
  public.claim_contact_notifications(uuid), public.finish_contact_notification(uuid, uuid, text, text, text) to service_role;

-- Especialidades que ya muestra el sitio; sin horarios configurados ni reservas.
insert into public.services(slug, name, duration_minutes, slot_interval_minutes)
values ('osteopatia', 'Osteopatía', 60, 60), ('psicologia', 'Psicología', 60, 60), ('nutricion', 'Nutrición', 60, 60)
on conflict (slug) do nothing;
