# Arquitectura del sistema de turnos

## Objetivo

El sistema usa Supabase/PostgreSQL como fuente de verdad. El frontend solamente consulta disponibilidad y solicita una reserva; nunca decide si un cupo sigue libre.

## Flujo del paciente

1. Consultar servicios activos.
2. Seleccionar servicio y fecha.
3. Consultar `available_slots`.
4. Completar nombre, teléfono, email opcional y motivo de consulta.
5. Enviar la solicitud a una Edge Function pública específica de reservas.
6. La función valida formato, rate limit/CAPTCHA cuando esté configurado y normaliza el teléfono.
7. La función llama con credenciales de servidor a `create_pending_appointment`.
8. PostgreSQL toma un advisory transaction lock para servicio+horario, vuelve a comprobar disponibilidad y capacidad y crea el turno `pending` en una única transacción.
9. La misma transacción genera eventos en `integration_outbox` para Google Calendar y WhatsApp.
10. Un worker procesa el outbox de forma idempotente. Los fallos externos no eliminan ni duplican el turno.

## Estados

- `pending`: solicitud recibida; ocupa cupo.
- `confirmed`: aceptada por administración; ocupa cupo.
- `cancelled`: cancelada por administración/paciente según las reglas futuras; libera cupo.
- `rejected`: solicitud rechazada; libera cupo.
- `completed`: atención realizada; histórico.

No se elimina físicamente un turno para conservar trazabilidad.

## Roles

- `user`: usuario autenticado sin privilegios administrativos.
- `admin`: gestiona turnos, pacientes, agenda, bloqueos y configuración operativa.
- `superadmin`: además administra usuarios/roles y configuración sensible.

El rol efectivo vive en `profiles`; no debe confiarse en un valor enviado por el navegador.

## Panel administrativo

Rutas previstas:

- `/admin/login`
- `/admin/turnos`: tabla/calendario, búsqueda por paciente y filtros por servicio, fecha y estado.
- `/admin/agenda`: confirmar, cancelar, rechazar, completar y reprogramar.
- `/admin/bloqueos`: bloquear días o rangos horarios globalmente o por servicio.
- `/admin/servicios`: duración, intervalo, capacidad y horarios semanales.
- `/admin/usuarios`: usuarios y roles; superadmin únicamente.
- `/admin/auditoria`: historial de cambios.

## Reprogramación

Debe implementarse con otra función PostgreSQL transaccional: bloquear el nuevo servicio+horario, comprobar cupo, mover el turno, registrar auditoría y encolar actualización de Calendar/WhatsApp. Nunca hacer un UPDATE directo desde React.

## Google Calendar

- Credenciales exclusivamente en Supabase Secrets/servidor.
- Nunca colocar client secret, refresh token ni claves privadas en `VITE_*`.
- Usar un calendario dedicado del centro.
- Guardar `google_event_id` para actualizar/cancelar el mismo evento, no crear duplicados.
- Usar `appointment_id` como clave de idempotencia interna.
- El worker debe poder reintentar fallos 429/5xx con backoff.

## WhatsApp Business Platform

- Usar API oficial de WhatsApp Business/Cloud API.
- Token y App Secret exclusivamente en Secrets.
- Usar plantillas aprobadas cuando corresponda iniciar conversaciones fuera de la ventana permitida por WhatsApp.
- Validar firmas de webhooks antes de procesar callbacks.
- No almacenar tokens en tablas públicas ni en el repositorio.
- Notificaciones mínimas: solicitud recibida al paciente, nueva solicitud al asistente, confirmación, rechazo/cancelación y reprogramación.

## Seguridad

- RLS habilitado en todas las tablas sensibles.
- La API pública de YouTube permanece separada de la API de turnos.
- `service_role` sólo dentro de Edge Functions; jamás en frontend.
- Auth de Supabase para el panel.
- MFA recomendado para admin/superadmin.
- Rate limiting y CAPTCHA/Turnstile en la creación pública de turnos.
- CORS restringido al dominio de producción y orígenes de desarrollo autorizados.
- Validación de entrada también en servidor.
- CSP existente debe mantenerse y ampliarse sólo para dominios estrictamente necesarios.
- Auditoría de cambios; los registros de turnos no se borran.
- Minimización de datos personales y política de retención/backups.

## Tablas iniciales

- `profiles`
- `services`
- `service_schedules`
- `blocked_periods`
- `patients`
- `appointments`
- `appointment_audit`
- `integration_outbox`

## Integraciones pendientes de credenciales

Para activar Calendar y WhatsApp se necesitarán secretos reales en Supabase, que no deben enviarse ni commitearse en GitHub. El código debe poder desarrollarse con adaptadores y luego activar cada proveedor al configurar sus secretos.
