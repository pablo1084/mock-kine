alter table public.services
  add column contact_mode text not null default 'request' check (contact_mode in ('request','direct','group')),
  add column contact_phone text check (contact_phone is null or contact_phone ~ '^\+[1-9][0-9]{7,14}$'),
  add column parent_id uuid references public.services(id),
  add column display_order integer not null default 100;

update public.services set slug='kinesiologia', name='Kinesiología' where slug='kinesiologia-deportiva';
update public.services set slug='entrenamiento', name='Entrenamiento' where slug='gimnasio';
insert into public.services(slug,name,duration_minutes,slot_interval_minutes,contact_mode,display_order)
values ('kinesiologia','Kinesiología',60,60,'request',1),
 ('consultas','Consultas',60,60,'request',2),
 ('ondas-de-choque','Ondas de choque',60,60,'request',3),
 ('mep-ecoguiado','MEP ecoguiado',60,60,'request',4),
 ('osteopatia','Osteopatía',60,60,'direct',5),
 ('nutricion','Nutrición',60,60,'direct',6),
 ('psicologia','Psicología',60,60,'direct',7),
 ('entrenamiento','Entrenamiento',60,60,'group',8),
 ('entrenamiento-2','Entrenamiento mensual: 2 veces por semana',60,60,'request',9),
 ('entrenamiento-3','Entrenamiento mensual: 3 veces por semana',60,60,'request',10)
on conflict(slug) do update set name=excluded.name,contact_mode=excluded.contact_mode,display_order=excluded.display_order,active=true;
update public.services set parent_id=(select id from public.services where slug='entrenamiento') where slug in ('entrenamiento-2','entrenamiento-3');
update public.services set active=false where slug not in ('kinesiologia','consultas','ondas-de-choque','mep-ecoguiado','osteopatia','nutricion','psicologia','entrenamiento','entrenamiento-2','entrenamiento-3');

-- An INSERT guard also covers direct RPC use, before notification rows are created.
create function public.enforce_contact_service_mode() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_mode text;
begin
  select contact_mode into v_mode from public.services where id=new.service_id and active for share;
  if not found then raise exception 'SERVICE_NOT_FOUND'; end if;
  if v_mode <> 'request' then raise exception 'SERVICE_DIRECT_CONTACT'; end if;
  return new;
end;
$$;
revoke all on function public.enforce_contact_service_mode() from public,anon,authenticated,service_role;
create trigger contact_service_mode_guard before insert on public.contact_requests
for each row execute function public.enforce_contact_service_mode();
