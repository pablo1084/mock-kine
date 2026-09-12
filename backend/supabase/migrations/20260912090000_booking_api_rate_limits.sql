-- Limites persistentes compartidos por todas las instancias de Edge Functions.
-- No depende de IPs enviadas en headers que el cliente podria falsificar.
create table public.booking_rate_limits (
  scope text not null check (scope in ('read', 'create', 'phone')),
  subject text not null,
  attempts integer not null check (attempts > 0),
  expires_at timestamptz not null,
  primary key (scope, subject),
  check ((scope in ('read', 'create') and subject = 'global')
    or (scope = 'phone' and subject ~ '^[0-9a-f]{64}$'))
);
create index booking_rate_limits_expiry_idx on public.booking_rate_limits(expires_at);
alter table public.booking_rate_limits enable row level security;
revoke all on public.booking_rate_limits from public, anon, authenticated, service_role;

create function public.consume_booking_rate_limit(p_scope text, p_subject text default 'global')
returns table (allowed boolean, retry_after integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit integer;
  v_seconds integer;
  v_now timestamptz := clock_timestamp();
  v_expiry timestamptz;
  v_attempts integer;
begin
  if p_scope is null or p_subject is null
    or p_scope not in ('read', 'create', 'phone')
    or (p_scope in ('read', 'create') and p_subject <> 'global')
    or (p_scope = 'phone' and p_subject !~ '^[0-9a-f]{64}$') then
    raise exception 'INVALID_RATE_LIMIT' using errcode = '22023';
  end if;
  v_limit := case p_scope when 'read' then 600 when 'create' then 60 else 3 end;
  v_seconds := case p_scope when 'phone' then 3600 else 60 end;
  v_expiry := to_timestamp((floor(extract(epoch from v_now) / v_seconds) + 1) * v_seconds);
  insert into public.booking_rate_limits as b(scope, subject, attempts, expires_at)
  values (p_scope, p_subject, 1, v_expiry)
  on conflict (scope, subject) do update
    set attempts = case when b.expires_at <= v_now then 1 else least(b.attempts + 1, v_limit + 1) end,
        expires_at = case when b.expires_at <= v_now then v_expiry else b.expires_at end
  returning attempts, expires_at into v_attempts, v_expiry;
  -- Limpieza acotada de pseudonimos caducados; no se guardan telefonos ni IPs.
  delete from public.booking_rate_limits where (scope, subject) in (
    select b.scope, b.subject from public.booking_rate_limits b
    where b.expires_at < v_now - interval '1 day' order by b.expires_at
    limit 100 for update skip locked
  );
  return query select v_attempts <= v_limit,
    case when v_attempts <= v_limit then 0 else greatest(1, ceil(extract(epoch from v_expiry - v_now))::integer) end;
end;
$$;
revoke all on function public.consume_booking_rate_limit(text, text) from public, anon, authenticated, service_role;
grant execute on function public.consume_booking_rate_limit(text, text) to service_role;
