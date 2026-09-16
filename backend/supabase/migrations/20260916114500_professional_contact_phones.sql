-- Contacto directo para áreas complementarias.
-- Los teléfonos se almacenan en formato internacional requerido por services.contact_phone.
update public.services
set contact_phone = case slug
  when 'osteopatia' then '+5493834641000'
  when 'nutricion' then '+5493834631850'
  when 'psicologia' then '+5493834365344'
  else contact_phone
end
where slug in ('osteopatia', 'nutricion', 'psicologia');
