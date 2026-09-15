alter table public.services
  add column if not exists price_ars integer check (price_ars is null or price_ars >= 0);

insert into public.services(slug,name,duration_minutes,slot_interval_minutes,contact_mode,display_order,price_ars)
values
  ('recovery','Recovery',60,60,'request',5,25000),
  ('evaluacion-funcional','Evaluación funcional',60,60,'request',6,40000)
on conflict(slug) do update set
  name=excluded.name,
  contact_mode=excluded.contact_mode,
  display_order=excluded.display_order,
  price_ars=excluded.price_ars,
  active=true;

update public.services set price_ars=40000 where slug in ('ondas-de-choque','mep-ecoguiado','entrenamiento-2');
update public.services set price_ars=60000 where slug='entrenamiento-3';
update public.services set price_ars=null where slug in ('osteopatia','nutricion','psicologia','entrenamiento');

update public.services
set display_order = case slug
  when 'kinesiologia' then 1
  when 'consultas' then 2
  when 'ondas-de-choque' then 3
  when 'mep-ecoguiado' then 4
  when 'recovery' then 5
  when 'evaluacion-funcional' then 6
  when 'osteopatia' then 7
  when 'nutricion' then 8
  when 'psicologia' then 9
  when 'entrenamiento' then 10
  when 'entrenamiento-2' then 11
  when 'entrenamiento-3' then 12
  else display_order
end;
