# Bloqueo de solicitudes repetidas

La política está preparada, pero **desactivada durante pruebas**: `public.contact_request_policy.block_duplicates=false`. No se cambia el rate limiting existente ni Turnstile.

Al activarla, PostgreSQL impide nuevas solicitudes del mismo teléfono normalizado para el mismo servicio durante las 24 horas anteriores. Cambiar nombre o descripción no evita el bloqueo. Un lock transaccional por teléfono/servicio serializa intentos concurrentes; la comprobación precede a la inserción de la solicitud y sus dos notificaciones.

La ventana es móvil, no un día calendario. Los intentos bloqueados no reinician las 24 horas. Otro servicio u otro teléfono no quedan bloqueados por esta regla, aunque sí por las cuotas generales. Los reintentos del mismo Idempotency-Key conservan la respuesta original y no crean nuevos mensajes. Las solicitudes ya existentes también cuentan al activar la política, independientemente del estado de sus notificaciones.

El frontend muestra ante HTTP 409 / CONTACT_ALREADY_REQUESTED:

> Ya recibimos tu solicitud para este servicio en las últimas 24 horas. No es posible enviarla nuevamente por ahora. Nos comunicaremos con vos a la brevedad.

Las cuotas de seguridad se verifican primero: si se superan, se muestra el mensaje de rate limit en vez del de duplicado.

## Activación futura para producción

Primero publicar en Cloudflare el frontend que incluye el mensaje y desplegar `booking` con el mapeo del error. Aplicar la migración `20260914160000_contact_duplicate_policy.sql` (crea la política desactivada).

Cuando el titular decida finalizar las pruebas, ejecutar exclusivamente desde SQL Editor con cuenta de confianza:

```sql
update public.contact_request_policy
set block_duplicates = true
where singleton = true;
```

Consultar estado:

```sql
select block_duplicates from public.contact_request_policy where singleton = true;
```

No se requiere ningún secreto ni variable VITE nueva. Anon, authenticated (incluido un admin de la aplicación) y service_role no tienen permiso directo para editar esta política. La RPC SECURITY DEFINER consulta la política bajo permisos del propietario. El frontend no puede cambiarla ni evadirla.

No activar durante la etapa actual de pruebas. No se eliminan solicitudes ni notificaciones históricas.
