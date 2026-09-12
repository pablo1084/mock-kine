> Documento hist?rico del dise?o con agenda. El flujo vigente, sin fecha/hora ni Google Calendar, est? documentado en [CONTACT_REQUESTS.md](CONTACT_REQUESTS.md).

# API pública de reservas — etapa 2

Implementación separada en `backend/supabase/functions/booking`. La función pública `api` de YouTube/configuración no cambia. PostgreSQL continúa siendo la autoridad de disponibilidad y reserva; ninguna integración externa se ejecuta dentro de la transacción del turno.

## Rutas

Base después de desplegar: `https://oiipswlnxbcgfflqnlid.supabase.co/functions/v1/booking`.

| Método/ruta | Entrada | Respuesta 200 |
| --- | --- | --- |
| GET `/services` | Sin query | `{ "services": [...] }`: id, slug, name, description, duration_minutes de servicios activos, máximo 100. |
| GET `/availability` | `service_id` UUID y `date` YYYY-MM-DD | `{ "timezone": "America/Argentina/Catamarca", "slots": [...] }`: starts_at, ends_at, available_capacity. Servicio inexistente/inactivo o sin cupos devuelve lista vacía. |
| POST `/appointments` | JSON y header `Idempotency-Key` UUID | `{ "appointment": { "id", "service_id", "starts_at", "ends_at", "status" } }`. Nunca devuelve patient_id, notas internas, request_data ni identificadores de integraciones. |

Todas las solicitudes requieren `Origin` incluido exactamente en la lista configurada. Se acepta OPTIONS para el método de cada ruta con `Content-Type, Idempotency-Key`. No se envían cookies, claves Supabase ni Authorization desde el paciente. CORS restringe navegadores, **no autentica a los solicitantes**: un cliente externo puede falsificar Origin. La protección de creación depende además de Turnstile, cuotas persistentes, validación y RPC restringidas.

JSON de creación (datos ilustrativos; UUID/token se generan en el cliente):

```json
{
  "service_id": "UUID_DEL_SERVICIO",
  "starts_at": "2026-09-14T12:00:00.000Z",
  "full_name": "Nombre del paciente",
  "phone": "+54 9 383 4123456",
  "email": "paciente@example.com",
  "reason": "Consulta",
  "privacy_consent": true,
  "turnstile_token": "TOKEN_DEL_WIDGET"
}
```

- `starts_at`: UTC ISO, con segundos y opcional `.000`; convertir el valor devuelto por disponibilidad mediante `new Date(slot.starts_at).toISOString()`. No se aceptan horas locales sin zona ni fechas normalizadas silenciosamente. PostgreSQL vuelve a validar cupo, grilla, servicio, bloqueos y horizonte al crear. La API no hace una comprobación de disponibilidad separada para autorizar la reserva.
- `email` y `reason` son opcionales. No se solicita DNI en esta etapa. Campos desconocidos, como status o phone_normalized, se rechazan.
- Teléfonos normalizados a E.164 con `libphonenumber-js/max`; país por defecto AR para formato nacional con código de área. No se extraen números de texto arbitrario ni se admiten extensiones. Normalizar no acredita identidad ni garantiza que el número tenga WhatsApp.
- Nombre: 3–160 caracteres; teléfono recibido: 8–40; email: hasta 254; motivo: hasta 1000. Se rechazan caracteres de control. JSON máximo 8 KiB, incluso sin Content-Length; lectura del cuerpo limitada a 5 segundos. No se admiten cuerpos comprimidos.
- Disponibilidad: fecha desde hoy en Catamarca hasta 365 días. Los intervalos disponibles pueden mostrarse en horario local en la etapa 3.

## Idempotencia y Turnstile

Generar `crypto.randomUUID()` para una solicitud nueva y enviarlo en `Idempotency-Key`. Configurar el widget Turnstile con `action: 'booking'` y `cData` igual a ese UUID (en minúsculas). El backend comprueba `success`, `hostname` igual al hostname del Origin admitido, `action` y `cdata`.

Cada nuevo intento HTTP necesita un token fresco de Turnstile, conservando el mismo UUID y datos normalizados si se trata de un retry. Los tokens duran cinco minutos y son de un solo uso. No reintentar automáticamente con el token usado. Si se cambia servicio/horario/datos de la solicitud, usar otro UUID y otro token. PostgreSQL devuelve la reserva existente para la misma solicitud o `IDEMPOTENCY_CONFLICT` si cambian los datos. El retry no crea pacientes ni tareas outbox adicionales. Devuelve el estado actual, que puede haber cambiado desde pending.

La respuesta 200 significa que la solicitud está persistida (o ya existía), no que Calendar/WhatsApp hayan sido enviados ni que el asistente la haya confirmado. Las credenciales de Google/WhatsApp no se necesitan todavía.

## Límites persistentes

Nueva migración `20260912090000_booking_api_rate_limits.sql`, posterior a la migración auditada:

| Alcance | Límite inicial |
| --- | --- |
| Consultas de servicios/disponibilidad | 600 por minuto, globales |
| Intentos de POST antes de leer/verificar cuerpo/token | 60 por minuto, globales |
| Creaciones/reintentos con Turnstile válido | 3 por hora por teléfono normalizado |

Las ventanas son fijas, calculadas por reloj PostgreSQL. En el límite de dos ventanas puede haber una ráfaga de hasta dos cuotas. INSERT ON CONFLICT contabiliza atómicamente y comparte límites entre instancias Edge. El backend no permite al cliente elegir la cuota; solo service_role ejecuta la RPC. Las tablas no son legibles/escribibles por roles de API. Si falla el límite, la operación no continúa.

Se almacena HMAC-SHA256 del teléfono con un secreto backend, no el número ni la IP. Cada consumo limpia hasta 100 filas vencidas hace más de un día; si no hay tráfico quedan hasta una próxima limpieza. Rotar el secreto cambia los pseudónimos y reinicia de hecho las cuotas por teléfono. Los retries también consumen cuota; la cuota no es un límite de turnos definitivos sino de intentos. Un teléfono compartido comparte cuota.

No se confía en `X-Forwarded-For` ni `CF-Connecting-IP` sin una garantía validada del gateway. Las cuotas globales son conservadoras: un tercero podría agotarlas y denegar temporalmente el servicio. Antes de abrir a público, ajustar límites al tráfico real y complementar con protección de tráfico en una entrada controlada/gateway. Esto no promete protección completa contra DDoS ni verifica la propiedad del teléfono.

## Errores y logs

Formato: `{ "error": { "code": "..." }, "request_id": "UUID_DE_TRAZA" }`. La traza es distinta de la clave de idempotencia.

| HTTP | Códigos principales |
| --- | --- |
| 400 | INVALID_INPUT, INVALID_DATE, INVALID_JSON, INVALID_PHONE, CONSENT_REQUIRED |
| 403 | ORIGIN_NOT_ALLOWED, VERIFICATION_FAILED, HEADERS_NOT_ALLOWED |
| 404 / 405 | NOT_FOUND, SERVICE_NOT_FOUND / METHOD_NOT_ALLOWED |
| 408 / 413 / 415 | REQUEST_TIMEOUT / BODY_TOO_LARGE / UNSUPPORTED_MEDIA_TYPE |
| 409 | SLOT_UNAVAILABLE, IDEMPOTENCY_CONFLICT |
| 429 | RATE_LIMITED, con header Retry-After en segundos |
| 503 | BOOKING_NOT_CONFIGURED, BACKEND_UNAVAILABLE, VERIFICATION_UNAVAILABLE |
| 500 | INTERNAL_ERROR |

Respuestas sin caché. Logs de errores 5xx contienen solo evento, UUID de traza y código seguro; no se imprimen cuerpos, tokens, emails, teléfonos, claves ni errores crudos de proveedores/PostgreSQL. Timeouts de 10 segundos para REST y 8 para Siteverify. Un timeout del POST puede ser ambiguo: PostgreSQL podría haber hecho commit; reintentar con la misma clave, datos y token nuevo.

## Configuración y activación

No se desplegó esta función ni se aplicaron migraciones a producción durante esta etapa. Primero ejecutar migraciones y pruebas en staging, incluida la prueba multiconexión pendiente de la etapa 1. Confirmar que la migración inicial aplicada sea la versión corregida; si ya hay otra versión aplicada, preparar una migración incremental compatible antes de continuar.

Plantilla de **backend**: `backend/supabase/.env.booking.example`. Configurar en Supabase Secrets:

- `BOOKING_ALLOWED_ORIGINS`: dominios reales completos separados por comas, sin `/` final, paths ni comodines. Para pruebas se admiten orígenes exactos `http://localhost:5173` y `http://127.0.0.1:5173`, solo si se agregan explícitamente. El widget debe permitir esos hostnames. No hay dominios asumidos por defecto.
- `TURNSTILE_SECRET_KEY`: secreto del widget configurado en Cloudflare. No usar claves de prueba en producción.
- `BOOKING_RATE_LIMIT_SECRET`: valor aleatorio de alta entropía de al menos 32 caracteres. Mantener estable para que las cuotas sobrevivan a redeploys.
- `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`: variables provistas por Supabase Edge Runtime; nunca colocar en React ni copiar claves al chat/repositorio. El runtime configurado usa URL HTTPS de Supabase.

Sin estos valores válidos la función responde 503 y no procesa reservas. Cualquier archivo local con secretos debe quedar ignorado por Git; la plantilla contiene valores vacíos. No se modificó `.env.local` del frontend ni `.env.supabase.example`.

Después de configurar staging y completar verificaciones, desde `backend`:

```sh
npx supabase functions deploy booking --project-ref <PROYECTO_STAGING> --use-api
```

`verify_jwt = false` permite pacientes sin cuenta: es intencional solo para estas tres rutas; no habilita RPC anónimas de PostgreSQL ni administración. La función ignora credenciales aportadas por el paciente y usa exclusivamente las suyas en REST. La autorización administrativa sigue pendiente de su función/panel autenticado.

## Pruebas y alcance

- `npm --prefix backend test`: pruebas HTTP, validación/CORS/proveedores simulados, ambas migraciones en PostgreSQL embebido, ACL/cuotas y prueba de integración handler → adaptador REST simulado → RPC reales. Esta última verifica último cupo, retry con teléfono en formato diferente, replay Turnstile y cantidad de pacientes/outbox.
- `npm --prefix backend run test:booking:concurrency`: PostgreSQL nativo local vacío; incluye carrera real del último cupo y de la última cuota. No se reemplaza por promesas concurrentes en PGlite. Requisitos en `BOOKING_MIGRATION_AUDIT.md`.
- La verificación de Siteverify se prueba con respuestas simuladas; la comprobación real del widget y gateway requiere staging. No se crean turnos ni se consumen servicios externos de producción en las pruebas.
- Etapa 3 pendiente: integrar servicios, fechas, slots, datos, consentimiento y widget Turnstile en `AppointmentsSection.jsx`, conservando el diseño. Etapas de Auth, administración y worker siguen pendientes.

Referencias: [validación server-side de Turnstile](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [seguridad de Supabase Edge Functions](https://supabase.com/docs/guides/functions/auth), [normalización con libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js).
