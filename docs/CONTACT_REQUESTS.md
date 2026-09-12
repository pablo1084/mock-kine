# Solicitudes por WhatsApp — flujo vigente

El paciente completa **nombre y apellido, teléfono, servicio y una descripción breve**. Acepta el contacto por WhatsApp y toca **Reservar turno**. Se guarda una solicitud de contacto y se preparan exactamente dos mensajes: acuse al paciente e información al centro. El equipo coordina posteriormente la atención.

No se elige fecha/hora, no se consultan cupos, no se crea un turno clínico y no hay Google Calendar. No se necesita un panel administrativo para el recorrido solicitado. Supabase ejecuta el backend; Cloudflare sirve React/Vite; GitHub no participa del runtime.

## Estado de activación

El código y las pruebas están implementados. **No se configuró Meta, no se desplegaron estas funciones ni se ejecutaron estas migraciones en producción. No se enviaron mensajes reales.** Sin las credenciales/plantillas backend válidas, la API devuelve 503 en lugar de simular éxito. Sin la site key pública de Turnstile el formulario no permite enviar.

## Formulario y API

- `GET /functions/v1/booking/services`: catálogo activo de Supabase, solo id/slug/name. Incluye las especialidades del sitio; sin horarios.
- `POST /functions/v1/booking/requests`: guarda y devuelve `{ "request": { "id": "...", "status": "received" } }`.
- `/booking/availability` y `/booking/appointments` ya no existen.

El POST lleva `Idempotency-Key: <UUID>` y este JSON:

```json
{
  "full_name": "Nombre y apellido",
  "phone": "+54 9 383 4123456",
  "service_id": "UUID_DEL_SERVICIO",
  "description": "Quisiera una consulta",
  "privacy_consent": true,
  "turnstile_token": "TOKEN_NUEVO"
}
```

Nombre 3–160 caracteres; teléfono validado y normalizado a E.164, con AR por defecto; descripción obligatoria de hasta 500 caracteres. Saltos de línea de la descripción se convierten en espacios para las plantillas. No se aceptan fechas, horarios, emails, estados ni destinatarios arbitrarios del cliente. Se mantienen JSON máximo 8 KiB, validación, CORS exacto, cuotas persistentes globales y por teléfono, HMAC y logs sin datos personales.

El widget usa `action: booking` y `cData` igual al UUID. Cada intento obtiene otro token; para reintentar los mismos datos el formulario conserva la clave en memoria. Cambiar los datos genera otra clave. La clave no persiste al recargar/cerrar la página. No se guardan datos del formulario en localStorage.

La respuesta confirma recepción persistida, no entrega del WhatsApp ni reserva de una fecha. Ante timeout, reintentar sin cambiar los datos mientras se mantenga la página: PostgreSQL devuelve la solicitud existente. No generar otra solicitud únicamente porque aún no llegó el WhatsApp.

## Base de datos y envío

Nueva migración: `20260912120000_contact_requests.sql`.

- `contact_requests`: datos mínimos y snapshot del nombre del servicio, consentimiento y UUID de solicitud.
- `contact_notifications`: dos filas únicas `(contact_id, recipient)` con destinatarios `patient` y `center`.
- `create_contact_request`: creación transaccional e idempotente, servicio activo, sin agenda.
- `claim_contact_notifications`: reclama hasta dos mensajes con `FOR UPDATE SKIP LOCKED`, token de claim y lease. Dos workers no deben enviar la misma fila.
- `finish_contact_notification`: actualiza exclusivamente la fila con su token de claim; conserva identificador de mensaje aceptado por Meta.

RLS activo y sin escritura directa desde roles de API. RPC solo service_role. Lectura de soporte solo para admin/superadmin autenticados. Se revoca ejecución de las antiguas funciones de disponibilidad/reserva/cambio de estado a los roles API. Las tablas y migraciones previas se conservan por historial y compatibilidad; el worker nuevo jamás procesa su `integration_outbox` ni envía Calendar.

Al recibir una solicitud, `booking` inicia el despacho en segundo plano mediante `EdgeRuntime.waitUntil`. La función privada `contact-notifications` recupera pendientes con Supabase Cron cada minuto; no necesita Node local ni GitHub Actions. Cada ejecución procesa hasta dos mensajes en paralelo. Un fallo de un destinatario no impide procesar al otro.

Estados internos de envío:

- `pending`: esperando envío o reintento por 429.
- `processing`: reclamado por un worker.
- `accepted`: Meta devolvió identificador de mensaje; **no equivale a entrega/leído**.
- `failed`: rechazo explícito o cinco intentos alcanzados.
- `unknown`: timeout, respuesta ambigua, 5xx o lease vencido; podría haberse enviado.

Solo un rechazo 429 se reintenta automáticamente, con espera de 60/120/240/480 segundos y máximo cinco intentos. Los casos ambiguos no se reenvían automáticamente para evitar mensajes duplicados. Reconciliarlos con Meta antes de cualquier reenvío manual. No se promete entrega exactamente una vez ni se oculta esa incertidumbre. Una respuesta tardía con el claim original puede completar una fila unknown; una fila accepted no vuelve a enviarse.

No se implementan webhooks de recepción ni seguimiento delivered/read porque el alcance actual es únicamente enviar estos dos avisos. Supervisar `contact_notifications` (cuenta administrativa/SQL de confianza) para detectar failed/unknown y pendientes antiguos. El cron es necesario como recuperación si el despacho inicial no se ejecuta o recibe un 429.

## Configurar Meta por primera vez

1. Configurar WhatsApp Business Platform / Cloud API en una aplicación de Meta, registrar/verificar el número emisor y obtener su **Phone Number ID**, token de acceso de servidor y una versión Graph API compatible. Un token de prueba temporal sirve solo para pruebas; producción necesita credenciales administradas y vigentes.
2. Elegir un número del centro que **reciba** avisos, con código de país. No confundirlo con Phone Number ID. Usar un destinatario diferente al número emisor registrado. Para el entorno de prueba de Meta, registrar/verificar los destinatarios de prueba que Meta permita.
3. Crear y obtener aprobación de dos plantillas en el idioma elegido. Los nombres e idioma deben coincidir exactamente con la configuración. El formulario web no abre una conversación de WhatsApp; se usan plantillas aprobadas también cuando no hay conversación previa.
4. Configurar los secretos indicados abajo en Supabase, no en el frontend ni en el chat.
5. Probar en staging con destinatarios de prueba autorizados antes de abrir el formulario real.

**Texto propuesto para el paciente** (plantilla estática, sin variables):

> Recibimos tu solicitud en José Oviedo Kinesiología. Nos comunicaremos con vos a la brevedad para coordinar tu atención.

**Texto propuesto para el centro** (cuatro parámetros BODY posicionales, en este orden):

> Nueva solicitud de contacto desde la web de José Oviedo Kinesiología.
> Nombre y apellido: {{1}}
> Teléfono: {{2}}
> Servicio: {{3}}
> Descripción: {{4}}

La plantilla del centro debe aprobarse sin parámetros extra en encabezados/botones. La del paciente no lleva parámetros ni datos clínicos. Meta decide aprobación/categoría y disponibilidad; no se garantiza aprobación de estos textos. El consentimiento existente ahora menciona explícitamente el aviso y contacto por WhatsApp; la política pública refleja los campos y el uso de Meta.

## Variables

Frontend, `.env.local` (la plantilla `.env.supabase.example` solo documenta valores públicos):

```dotenv
VITE_API_BASE_URL=https://oiipswlnxbcgfflqnlid.supabase.co/functions/v1/api
VITE_BOOKING_API_BASE_URL=https://oiipswlnxbcgfflqnlid.supabase.co/functions/v1/booking
VITE_TURNSTILE_SITE_KEY=SITE_KEY_PUBLICA
```

La segunda URL se deriva de la primera si se omite. La site key debe permitir los dominios de Cloudflare y los hostnames locales usados. Reiniciar Vite o reconstruir Cloudflare al cambiar variables. No se agregó una clave ficticia ni se cambió `.env.local` durante esta modificación.

Backend, Supabase Secrets, plantilla `backend/supabase/.env.booking.example`:

- `BOOKING_ALLOWED_ORIGINS`: orígenes HTTPS exactos, sin barra final; incluir localhost/127.0.0.1 con puerto únicamente para pruebas autorizadas. No usar comodines.
- `TURNSTILE_SECRET_KEY` y `BOOKING_RATE_LIMIT_SECRET` (aleatorio, al menos 32 caracteres).
- `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_GRAPH_VERSION` (formato `vNN.0`, versión elegida en Meta).
- `WHATSAPP_CENTER_PHONE` (E.164, con +), `WHATSAPP_PATIENT_TEMPLATE`, `WHATSAPP_CENTER_TEMPLATE`, `WHATSAPP_TEMPLATE_LANGUAGE` (código exacto del idioma aprobado, por ejemplo es_AR si esa es la plantilla).
- `CONTACT_WORKER_SECRET`: secreto aleatorio de al menos 32 caracteres. Protege la función de recuperación.
- `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`: provistos por Supabase Edge Runtime.

Ninguna credencial Meta, worker o service_role va en variables VITE, archivos públicos ni Git. Todos los valores de ejemplo de secretos permanecen vacíos.

## Activación técnica

1. Revisar qué migraciones están aplicadas; aplicar las tres migraciones en orden en staging. La primera debe ser la versión corregida de la auditoría; si ya hay otra versión aplicada, preparar la actualización incremental correspondiente. No borrar tablas existentes.
2. Configurar secretos y desplegar `booking` y `contact-notifications` desde `backend` al proyecto de staging elegido:

```sh
npx supabase functions deploy booking --project-ref PROYECTO_STAGING --use-api
npx supabase functions deploy contact-notifications --project-ref PROYECTO_STAGING --use-api
```

3. Habilitar pg_cron/pg_net en Supabase y crear en Vault `contact_project_url` y `contact_worker_secret` (mismo valor del worker). Ejecutar `backend/supabase/operations/schedule-contact-notifications.sql`. No guardar secretos literales en el script. `verify_jwt=false` en el worker no lo hace público: verifica su bearer secreto; no admite llamadas administrativas desde el navegador.
4. Configurar variables públicas, reconstruir frontend, probar formulario y ambos destinatarios. Revisar estados internos y consola Meta; luego activar el entorno de producción con sus propios valores.

## Verificaciones

- `npm --prefix backend test`: API simplificada, RPC reales en PostgreSQL embebido, dos notificaciones sin turnos/Calendar, idempotencia, servicio inactivo, ACL, claims, leases, backoff, proveedor simulado y worker privado. Las pruebas de las migraciones históricas se mantienen para no romper su aplicación anterior.
- `npm run test:browser`: Chrome headless, escritorio/móvil, servicios y Turnstile simulados. Verifica campos sin fecha/hora, consentimiento, recepción, conservación de datos y UUID al reintentar, y servicio no configurado. No llama Meta ni Supabase reales.
- `npm run build` y Deno check para ambas Edge Functions.
- Pendiente al activar: prueba real de Meta, Turnstile y cron en staging. Las pruebas embebidas no reemplazan una prueba multiconexión de PostgreSQL nativo.

Referencias: [API oficial de WhatsApp en Postman de Meta](https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api), [plantillas en el SDK de Meta](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/messages/template/), [tareas en segundo plano de Supabase](https://supabase.com/docs/guides/functions/background-tasks), [Supabase Cron y Vault](https://supabase.com/docs/guides/functions/schedule-functions).
