-- Ejecutar SOLO despues de configurar y validar las funciones en el entorno elegido.
-- Habilitar pg_cron y pg_net desde Supabase. Crear en Vault (no en Git):
-- contact_project_url = URL HTTPS del proyecto, sin barra final
-- contact_worker_secret = mismo secreto que CONTACT_WORKER_SECRET de Edge Functions
do $$
begin
  if not exists (select 1 from vault.decrypted_secrets where name = 'contact_project_url' and decrypted_secret ~ '^https://[a-z0-9]+\.supabase\.co$')
    or not exists (select 1 from vault.decrypted_secrets where name = 'contact_worker_secret' and length(decrypted_secret) >= 32) then
    raise exception 'CONTACT_CRON_NOT_CONFIGURED';
  end if;
end;
$$;
select cron.schedule('contact-notifications-every-minute', '* * * * *', $task$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'contact_project_url') || '/functions/v1/contact-notifications',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'contact_worker_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$task$);
