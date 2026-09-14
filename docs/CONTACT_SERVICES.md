# Servicios del formulario

El catálogo se obtiene de Supabase. El desplegable principal muestra, en orden: Kinesiología, Consultas, Ondas de choque, MEP ecoguiado, Osteopatía, Nutrición, Psicología y Entrenamiento.

Entrenamiento agrupa dos registros hijos: mensual 2 veces por semana y mensual 3 veces por semana. El plan es obligatorio; el backend recibe su ID y guarda el nombre completo en la solicitud. La plantilla del centro recibe ese nombre como su tercera variable, sin cambiar las cuatro variables de Meta.

Osteopatía, Nutrición y Psicología tienen `services.contact_mode='direct'`. La UI muestra únicamente el selector y la información de contacto. No renderiza campos personales, consentimiento, Turnstile ni botón de envío. Un trigger en PostgreSQL rechaza nuevas solicitudes para servicios directos o el agrupador Entrenamiento, incluso si se llama la API manualmente. No se insertan notificaciones por esos intentos. Los planes hijos sí admiten solicitudes.

## Números pendientes

Los tres `contact_phone` permanecen NULL hasta recibir los números reales. Se muestra “Próximamente publicaremos aquí el número de contacto para este servicio”. Nunca se usa el teléfono del centro como sustituto implícito.

Para cargarlos posteriormente, un administrador de base de datos actualiza `public.services.contact_phone` en formato internacional por cada slug: `osteopatia`, `nutricion`, `psicologia`. El frontend mostrará el número y un enlace `tel:` al volver a cargar servicios; no se requiere reconstrucción del frontend para cambiar esos valores. No es una credencial ni una variable VITE.

## Despliegue

Aplicar `20260914180000_service_contact_modes.sql` y redesplegar `booking`. Publicar el nuevo frontend en Cloudflare. No hacen falta nuevos secrets ni cambios de plantilla Meta. El catálogo antiguo se conserva donde tiene historial: se renombran Kinesiología y Entrenamiento y se desactiva Rehabilitación, sin borrar solicitudes existentes.

El bloqueo de repetidos de 24 horas continúa desactivado durante pruebas. Los planes de entrenamiento son servicios hijos distintos para esa política. Los registros históricos y sus notificaciones se conservan; este cambio controla la creación de nuevas solicitudes.
