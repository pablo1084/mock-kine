-- La cobertura se valida en el servidor: solo Kinesiología admite obra social.
drop function if exists public.create_contact_request(uuid, uuid, text, text, text, boolean);

create or replace function public.create_contact_request(
  p_request_id uuid,
  p_service_id uuid,
  p_full_name text,
  p_phone_normalized text,
  p_description text,
  p_privacy_consent boolean,
  p_coverage text,
  p_health_insurance text
)
returns table (id uuid, status text)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_request public.contact_requests%rowtype;
  v_name text;
  v_slug text;
  v_block_duplicates boolean;
begin
  if p_request_id is null or p_service_id is null or p_privacy_consent is distinct from true
    or length(trim(coalesce(p_full_name, ''))) not between 3 and 160
    or p_phone_normalized !~ '^\+54[0-9]{10}$'
    or length(trim(coalesce(p_description, ''))) not between 1 and 400
    or p_full_name ~ '[[:cntrl:]]' or p_description ~ '[[:cntrl:]]'
    or p_coverage not in ('Obra social', 'Particular')
    or length(trim(coalesce(p_health_insurance, ''))) > 80
    or p_health_insurance ~ '[[:cntrl:]]' then
    raise exception 'INVALID_INPUT';
  end if;

  select s.name, s.slug into v_name, v_slug
  from public.services s where s.id = p_service_id and s.active for share;
  if v_name is null then raise exception 'SERVICE_NOT_FOUND'; end if;

  if (v_slug <> 'kinesiologia' and (p_coverage <> 'Particular' or trim(coalesce(p_health_insurance, '')) <> ''))
    or (v_slug = 'kinesiologia' and p_coverage = 'Obra social' and trim(coalesce(p_health_insurance, '')) = '')
    or (p_coverage = 'Particular' and trim(coalesce(p_health_insurance, '')) <> '') then
    raise exception 'INVALID_INPUT';
  end if;

  select * into v_request from public.contact_requests c where c.request_id = p_request_id;
  if found then
    if v_request.service_id <> p_service_id or v_request.full_name <> trim(p_full_name)
      or v_request.phone <> p_phone_normalized or v_request.description <> trim(p_description) then
      raise exception 'IDEMPOTENCY_CONFLICT';
    end if;
    return query select v_request.id, 'received'::text;
    return;
  end if;

  select block_duplicates into v_block_duplicates from public.contact_request_policy where singleton for share;
  if coalesce(v_block_duplicates, false) then
    perform pg_advisory_xact_lock(hashtextextended(p_phone_normalized || ':' || p_service_id::text, 241400));
    if exists (select 1 from public.contact_requests c where c.phone = p_phone_normalized
      and c.service_id = p_service_id and c.created_at > clock_timestamp() - interval '24 hours') then
      raise exception 'CONTACT_ALREADY_REQUESTED';
    end if;
  end if;

  insert into public.contact_requests(request_id, service_id, service_name, full_name, phone, description)
  values (p_request_id, p_service_id, v_name, trim(p_full_name), p_phone_normalized, trim(p_description))
  returning * into v_request;
  insert into public.contact_notifications(contact_id, recipient) values (v_request.id, 'patient'), (v_request.id, 'center');
  return query select v_request.id, 'received'::text;
end $$;

revoke all on function public.create_contact_request(uuid, uuid, text, text, text, boolean, text, text) from public, anon, authenticated;
grant execute on function public.create_contact_request(uuid, uuid, text, text, text, boolean, text, text) to service_role;
