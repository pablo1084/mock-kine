# Diagnóstico Cloudflare → Supabase → WhatsApp (14/09/2026)

## Hallazgos verificados

- `finish_contact_notification` devuelve HTTP 204 sin cuerpo. Comprobado en el proyecto real con un UUID inexistente, sin enviar mensajes ni modificar registros. Antes el cliente REST llamaba a `response.json()` y lanzaba un error después de una operación válida. Ahora acepta 204 exclusivamente para esta RPC; no ignora errores HTTP.
- `contact_dispatch_incomplete.count=2` cuenta promesas rechazadas, no necesariamente mensajes rechazados por Meta. Ambos destinatarios pueden fallar en la lectura de la respuesta de persistencia. Las nuevas trazas distinguen `send` y `persist`.
- Al consultar a las 15:02 UTC, `contact_notifications` no devolvió filas. No se pueden identificar retrospectivamente los dos IDs ni afirmar qué respondió Meta en esas ejecuciones. No se borraron registros durante este diagnóstico.
- La cuota por teléfono registraba 4 intentos, con vencimiento a las 15:00 UTC (12:00 Argentina). Ya había vencido al consultar; no se reinició ninguna cuota.
- Meta aceptó la consulta del token. El emisor pertenece a WABA `2151162542099600` y está CONNECTED. Ambas plantillas están APPROVED en `es_AR`: `solicitud_recibida` sin variables y `nueva_solicitud_centro` con cuatro variables BODY numéricas, en orden nombre, teléfono, servicio y descripción. No hay encabezados/botones con parámetros en los componentes devueltos.
- El destinatario del centro coincide con el número autorizado confirmado por el titular: `+543834320138`. La lista de destinatarios de prueba se verifica en el panel de Meta; consultar el emisor y las plantillas no demuestra pertenencia a esa lista. La recepción previa fue confirmada por el titular.

## Cuotas conservadas

| Scope | Límite | Ventana fija | Identificación |
| --- | --- | --- | --- |
| read | 600 | minuto UTC | global, todas las instancias |
| create | 60 | minuto UTC | global, todas las instancias |
| phone | 3 | hora UTC | HMAC-SHA256 del teléfono normalizado |

No se identifica por IP, cookie, sesión ni GitHub. El secreto HMAC nunca sale del backend. La ventana termina en el próximo límite de minuto/hora; no se prolonga con nuevos intentos rechazados.

Orden POST: origen/ruta → cuota global create → input → Turnstile (hostname/action/cdata) → cuota phone → RPC transaccional → despacho independiente. Un 429 de booking ocurre ANTES de crear la solicitud en ese intento. No es un 429 de Meta: la respuesta de Meta solo afecta a la notificación.

El worker y los reintentos de WhatsApp no consumen cuotas de booking. Un nuevo POST del usuario sí consume create; tras superar Turnstile también consume phone, incluso con el mismo Idempotency-Key o si la RPC después falla. La idempotencia evita duplicar la solicitud, no evita consumir cuotas de intentos. Recargar el formulario y enviarlo otra vez genera una nueva clave. No repetir solicitudes para recuperar notificaciones fallidas.

La UI ahora usa `Retry-After` para indicar cuántos minutos esperar. Para ver vencimientos sin datos personales:

```sql
select scope, attempts, expires_at,
       greatest(0, ceil(extract(epoch from expires_at - now()))) as seconds_left
from public.booking_rate_limits
order by expires_at desc;
```

No hace falta eliminar filas vencidas: el siguiente intento reinicia su contador automáticamente. No usar TRUNCATE, cambiar el secreto ni desactivar Turnstile para pruebas. Para pruebas repetidas sin cuota ni mensajes reales, ejecutar `npm run test:browser` y `npm --prefix backend test`: usan proveedores simulados y datos aislados. Para la prueba real, esperar la ventana. No se agregó un bypass público de testing.

## Logs

`booking_request_received`, `turnstile_verified`, `rate_limit_allowed` y `rate_limit_rejected` llevan `request_id`; las cuotas incluyen `scope` y el rechazo incluye `retry_after`. `contact_request_recorded` vincula `request_id` con `contact_id`. No se llama `appointment_created`: se guarda una solicitud de contacto, y la RPC puede devolver una solicitud idempotente existente.

Cada notificación registra `whatsapp_patient_attempt` / `whatsapp_center_attempt`, seguido de `success` o `failed`. Incluye `notification_id`, destinatario, HTTP y resultado. `success` significa accepted, no delivered. `contact_notification_persisted` confirma persistencia; `contact_notification_incomplete` identifica la etapa fallida. El cron puede no tener contact_id en el contexto, pero siempre tiene notification_id para consultar la fila y su contact_id.

En rechazos se registra `meta_body` con código, subcódigo e is_transient cuando existen. Los textos libres (`message`, `error_data`) se sustituyen por `[REDACTED]`; no se imprime el body bruto porque puede contener teléfono, datos clínicos o credenciales. No se registran tokens Turnstile, Authorization ni el cuerpo del formulario.

Los códigos numéricos se conservan también en `contact_notifications.error_code`. Un código no siempre permite atribuir una única causa: por ejemplo 131005 exige revisar permisos/recursos de Meta, no demuestra un fallo de plantilla. Plantillas, idioma, parámetros, destinatario y credencial deben contrastarse con el diagnóstico de la cuenta. El HTTP 204 de persistencia no es un error de Meta.

## Configuración y despliegue

Todas las variables operativas estaban presentes en el archivo privado: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_GRAPH_VERSION, WHATSAPP_CENTER_PHONE, WHATSAPP_PATIENT_TEMPLATE, WHATSAPP_CENTER_TEMPLATE, WHATSAPP_TEMPLATE_LANGUAGE, BOOKING_ALLOWED_ORIGINS, BOOKING_RATE_LIMIT_SECRET, TURNSTILE_SECRET_KEY y CONTACT_WORKER_SECRET.

WHATSAPP_WABA_ID no es requerido por el envío: la ruta usa Phone Number ID. Se documenta opcionalmente para herramientas de diagnóstico, sin agregarlo a React. SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los provee Edge Runtime. La configuración local de orígenes contiene `https://mock-kine.pages.dev` y los dos orígenes locales.

Este arreglo no requiere migraciones ni secretos nuevos, ni cambiar las plantillas. Redesplegar ambas funciones, desde backend:

```powershell
.\node_modules\.bin\supabase.cmd functions deploy booking --project-ref oiipswlnxbcgfflqnlid --use-api
.\node_modules\.bin\supabase.cmd functions deploy contact-notifications --project-ref oiipswlnxbcgfflqnlid --use-api
```

Solo si cambiaste credenciales/orígenes locales y falta sincronizarlos:

```powershell
.\node_modules\.bin\supabase.cmd secrets set --env-file supabase/.env.booking --project-ref oiipswlnxbcgfflqnlid
```

No ejecutar lo anterior con valores en blanco o secretos temporales vencidos. Nunca copiar este archivo a Cloudflare/VITE. Cloudflare necesita reconstruir el frontend para mostrar la mejora de Retry-After; build `npm run build`, salida `dist`, variables VITE públicas existentes.

## Una prueba de punta a punta

1. Confirmar despliegue de ambas funciones y del frontend actualizado; abrir `https://mock-kine.pages.dev` y recargar.
2. Confirmar token vigente y que paciente y centro son destinatarios verificados en Meta mientras se usa su número de prueba.
3. Esperar a que `seconds_left` de la cuota bloqueada sea 0. No borrar solicitudes ni notificaciones.
4. Abrir Network del navegador, completar UNA vez con el teléfono local de prueba, consentimiento y descripción “Prueba de punta a punta”. Resolver Turnstile real y enviar una sola vez.
5. POST esperado: HTTP 200, `request.status=received` y un ID. Anotar ese ID y X-Request-Id. Si 429, leer Retry-After y esperar; ese intento no creó otra solicitud. Si timeout, conservar la página y los datos para mantener la clave idempotente; comprobar primero el registro.
6. En logs buscar request_id → contact_id → notification_id, y consultar las dos filas en contact_notifications filtradas por contact_id. Deben terminar accepted con provider_message_id y confirmarse en ambos teléfonos. Si hay failed/unknown, no crear otra solicitud: usar los códigos y reconciliar la notificación afectada antes de reintentar.

No se enviaron mensajes reales durante este diagnóstico ni se reactivaron notificaciones.
