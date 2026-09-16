alter table public.contact_requests
  drop constraint contact_requests_description_check,
  add constraint contact_requests_description_check check (length(description) between 1 and 400);

create or replace function public.create_contact_request(p_request_id uuid, p_service_id uuid, p_full_name text,
  p_phone_normalized text, p_description text, p_privacy_consent boolean)
returns table (id uuid, status text)
language plpgsql security definer set search_path = ''
as $$
declare
  v_request public.contact_requests%rowtype;
  v_name text;
  v_block_duplicates boolean;
begin
  if current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'UNSUPPORTED_ISOLATION' using errcode = '25000';
  end if;
  if p_request_id is null or p_service_id is null or p_privacy_consent is distinct from true
    or length(trim(coalesce(p_full_name, ''))) not between 3 and 160
    or coalesce(p_phone_normalized, '') !~ '^\+[1-9][0-9]{7,14}$'
    or length(trim(coalesce(p_description, ''))) not between 1 and 400
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
  select block_duplicates into v_block_duplicates from public.contact_request_policy where singleton for share;
  if not found then raise exception 'CONTACT_POLICY_MISSING'; end if;
  if v_block_duplicates then
    perform pg_advisory_xact_lock(hashtextextended(p_phone_normalized || ':' || p_service_id::text, 241400));
    if exists (select 1 from public.contact_requests c where c.phone = p_phone_normalized
      and c.service_id = p_service_id and c.created_at > clock_timestamp() - interval '24 hours') then
      raise exception 'CONTACT_ALREADY_REQUESTED' using errcode = 'P0001';
    end if;
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
