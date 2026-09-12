> Documento hist?rico del dise?o con agenda. El flujo vigente, sin fecha/hora ni Google Calendar, est? documentado en [CONTACT_REQUESTS.md](CONTACT_REQUESTS.md).

# Auditoría de la migración inicial — 11 de septiembre de 2026

Alcance: etapa 1, `20260911170000_booking_system.sql`. Se corrigió el archivo inicial suponiendo, como indica el pedido, que todavía no se aplicó. No se consultó ni modificó Supabase de producción. Si ya fue aplicado en algún entorno persistente, estos cambios necesitan una migración incremental; editar el archivo no actualiza una base existente.

## Hallazgos y correcciones

| Riesgo original | Corrección |
| --- | --- |
| Lock por servicio + comienzo no serializaba intervalos distintos superpuestos. | `SELECT ... FOR UPDATE` sobre la fila del servicio antes de leer disponibilidad. Todas las creaciones de ese servicio se serializan hasta commit/rollback. |
| `timestamptz::text` depende del timezone de sesión: el mismo instante podía producir distintas claves de lock. | El lock de capacidad usa el UUID de la fila de servicio. La clave de idempotencia usa un UUID de solicitud. |
| Lectura de duración/capacidad antes de esperar el lock. | Se consulta la disponibilidad después del lock, en una nueva sentencia bajo READ COMMITTED. Otros aislamientos se rechazan explícitamente. |
| Conteo total de intersecciones rechaza reservas válidas con capacidad > 1. | Se calcula el máximo de ocupación simultánea en el comienzo y cada inicio de turno dentro del intervalo candidato. Intervalos semiabiertos `[inicio, fin)`. |
| Ventanas semanales solapadas duplicaban slots y multiplicaban el conteo. | Deduplicación de candidatos antes de calcular capacidad. |
| Timezone arbitrario provisto por consumidor. | Zona fija `America/Argentina/Catamarca`; `available_slots(uuid,date)` ya no acepta timezone. Horizonte de consulta/reserva de 365 días. |
| `SECURITY DEFINER` con esquema público en search_path y EXECUTE heredado de PUBLIC/defaults Supabase. | `search_path = ''`, objetos calificados y revocación explícita a PUBLIC, anon, authenticated y service_role para cada función de esta migración. Luego grants mínimos. |
| Políticas de lectura sin GRANT efectivo en tablas administrativas. Políticas ALL demasiado amplias para futuras concesiones. | SELECT explícito + RLS; políticas de lectura específicas. Sin escritura directa de turnos, pacientes, historial, agenda o outbox desde los roles de API. |
| Cualquier transición, incluso cancelled → confirmed, podía recuperar un turno sin comprobar cupo. | Máquina de estados cerrada; fila del turno bloqueada durante transición. Repetir el estado no escribe ni encola. |
| Una repetición HTTP podía generar otro paciente/turno/outbox. | UUID de solicitud único + lock transaccional de idempotencia; mismo contenido devuelve el mismo turno; contenido diferente da `IDEMPOTENCY_CONFLICT`. |
| Teléfono usado como prueba de identidad: sobrescritura de pacientes previos. | Cada nueva reserva conserva su propia ficha. Reconciliación de identidades queda para un flujo administrativo autenticado. |
| Se registraba consentimiento sin recibir aceptación. | `p_privacy_consent = true` obligatorio; fecha asignada por servidor. |
| Validación débil, largos ilimitados y truncamiento silencioso. | Límites de campos, formato E.164, validación básica de email, UUID obligatorio, timestamp finito y source web. Normalización semántica de teléfonos queda en Edge Function. |
| DELETE en cascada podía borrar auditoría/outbox. | Referencias RESTRICT y sin DELETE/TRUNCATE a roles de API. El propietario de la base sigue siendo un actor privilegiado de confianza. |
| Cambios de estado no notificaban al asistente; payload vacío. | Los tres canales se encolan con snapshot de estado/horario e idempotency_key. |

## Contrato de acceso

- `anon`: sin acceso a tablas ni funciones del dominio. La futura Edge Function expondrá servicios/disponibilidad con validación, límites y proyección de campos.
- `authenticated/user`: servicios activos y su propio perfil; sin pacientes, turnos ni historial ajenos.
- `authenticated/admin`: lectura administrativa y RPC `set_appointment_status`; no modifica roles ni escribe directamente turnos/agenda.
- `authenticated/superadmin`: además, INSERT/UPDATE restringidos por columnas y RLS en perfiles. Crear usuarios de Auth requiere la futura operación backend. El primer superadmin debe provisionarse desde un entorno confiable.
- `service_role`: SELECT de backend y ejecución de disponibilidad/creación. Sin escritura directa de estas tablas. El worker futuro necesitará RPC específicas, no grants ALL.
- El cambio administrativo de estado requiere JWT del usuario para resolver `auth.uid()` y atribuir auditoría. No está concedido a service_role.

Firma de creación: conserva los primeros nueve argumentos y agrega `p_request_id uuid` y `p_privacy_consent boolean`. Aunque tengan defaults por compatibilidad sintáctica, se rechazan valores ausentes. El backend debe reutilizar el mismo UUID en cada retry y no devolver al paciente la fila completa de `appointments` (contiene información interna). `request_data` contiene datos personales para comparar solicitudes; no debe incluirse en respuestas públicas ni logs.

Estados permitidos:

- pending → confirmed, cancelled, rejected.
- confirmed → cancelled, completed.
- completed requiere que el turno ya haya finalizado.
- cancelled, rejected, completed son terminales. No existe reapertura implícita.
- La repetición del estado devuelve el registro sin cambios; tampoco edita notas. Una operación separada de notas queda pendiente.

## Contrato obligatorio para futuras operaciones de agenda

La exclusión de reservas se garantiza para las rutas autorizadas existentes, no para SQL arbitrario del propietario. Las futuras RPC de reprogramación, bloqueos y configuración deben adquirir el mismo lock de fila de servicio **antes** de leer o escribir datos de disponibilidad. Para varios servicios, bloquear por UUID en orden; para un bloqueo global, bloquear todos los servicios implicados. Reprogramación debe bloquear primero servicio(s), luego turno; volver a verificar capacidad excluyendo el propio turno y encolar el cambio en la misma transacción. No habilitar escritura directa para implementar el panel.

La cancelación y el rechazo solo reducen ocupación; no necesitan el lock de servicio. Una lectura concurrente puede ofrecer conservadoramente menos cupos mientras la cancelación no está confirmada por commit, pero no crear sobreventa.

Capacidad independiente por servicio, conforme al modelo actual. Si varios servicios comparten kinesiólogo, sala o equipamiento, falta modelar ese recurso y su capacidad transversal antes de habilitar esas agendas simultáneas. `slot_interval_minutes` representa la separación entre comienzos, no un descanso agregado al final. Los horarios semanales no atraviesan medianoche; un día completo bloqueado usa medianoche local hasta la siguiente, convertidas a timestamptz. No se cargaron horarios reales de atención.

## Verificación

`npm.cmd --prefix backend test` ejecuta la migración completa en PostgreSQL embebido (PGlite), con stubs de Auth y grants por defecto deliberadamente permisivos. Verifica SQL, RLS/ACL, capacidad, superposición, ventanas duplicadas, bloqueos, servicio inactivo, timezone, idempotencia, estados, auditoría, roles y consentimiento. No reemplaza una validación con Supabase Auth real.

La prueba `npm.cmd --prefix backend run test:booking:concurrency` usa tres conexiones PostgreSQL y observa `pg_stat_activity` para demostrar que la segunda reserva espera el lock. Incluye último cupo, sesiones con zonas distintas, horarios superpuestos, capacidad dos y retry simultáneo. Requiere una base **local, vacía y descartable** llamada `booking_audit_test`, en un cluster de pruebas sin roles Supabase existentes, con un usuario capaz de crear roles. Configurar `BOOKING_TEST_DATABASE_URL` solo localmente. Rechaza hosts remotos y bases con tablas existentes; no elimina bases ni datos. Esta prueba queda pendiente de ejecución: no se encontró PostgreSQL nativo ni Docker en el entorno.

## Pendiente antes de producción

1. Ejecutar prueba multiconexión en PostgreSQL nativo y probar la migración en Supabase de desarrollo/staging con sus ACL reales. Revisar si hay una versión de la migración ya aplicada antes de desplegar.
2. Implementar etapas 2–5: API separada con Turnstile, rate limiting persistente, validación, CORS, respuestas sin datos internos; frontend; Auth/panel; reprogramación/configuración con los locks descriptos.
3. Implementar etapas 6–8: adaptadores Calendar/WhatsApp y worker con claim atómico, leases, backoff, máximo de intentos, orden/versiones por turno y recuperación manual. La outbox actual solo registra intención. Un UUID único en la outbox NO garantiza entrega exactamente una vez en el proveedor, especialmente ante timeout luego de enviar WhatsApp. Definir reconciliación de resultados ambiguos antes de reintentar ciegamente.
4. Agregar tests de reprogramación, cambios concurrentes de agenda, proveedores, webhooks y worker al implementar esas funciones. La prueba local de outbox fallida simula su estado almacenado; no simula ni prueba Google/Meta.
5. Configurar recursos/horarios reales, políticas de retención y provisión inicial de roles/MFA. GitHub no participa del runtime; React/Vite y la API pública existente permanecen sin cambios.

## Referencias usadas en la revisión

- [PostgreSQL: funciones SECURITY DEFINER y privilegios](https://www.postgresql.org/docs/current/sql-createfunction.html).
- [PostgreSQL: aislamiento y snapshots READ COMMITTED](https://www.postgresql.org/docs/current/transaction-iso.html).
- [PostgreSQL: bloqueos explícitos](https://www.postgresql.org/docs/17/explicit-locking.html).
- [Supabase: funciones y permisos de ejecución](https://supabase.com/docs/guides/database/functions).
- [Supabase: RLS y grants](https://supabase.com/docs/guides/database/postgres/row-level-security).
