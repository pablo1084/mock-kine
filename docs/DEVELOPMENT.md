# Desarrollo del frontend

Copiar `.env.supabase.example` como `.env.local` en la raíz del repositorio:

```dotenv
VITE_API_BASE_URL=https://oiipswlnxbcgfflqnlid.supabase.co/functions/v1/api
```

Ejecutar `npm run dev`. El navegador consulta directamente `/config` y `/youtube` bajo esa URL HTTPS. No requiere backend Node local, proxy `/api`, claves de Supabase ni GitHub en runtime. `.env.local` está ignorado por Git; `.env.supabase.example` es solamente una plantilla y Vite no la carga.

`npm run dev:supabase` es un alias de `npm run dev`. `npm run build:supabase` es un alias de `npm run build`. Ya no se usa el modo personalizado `supabase`: si existe un antiguo `.env.supabase`, trasladar su URL a `.env.local`. Eliminar configuraciones antiguas `BACKEND_URL` y `VITE_API_URL`. Revisar posibles overrides en `.env.development*`, `.env.production*` o variables del proceso si se cambia de entorno. Reiniciar Vite al cambiar variables.

`npm run build` produce `dist/`; `npm run preview` (también `npm start`) permite revisar ese build localmente. Configurar `VITE_API_BASE_URL` en el entorno de build de Cloudflare con la URL de la Edge Function. Las variables Vite quedan incorporadas al bundle: cambiarlas requiere reconstruir. Nunca poner service_role, tokens de Google/WhatsApp ni otros secretos en variables VITE_*.

El código histórico `backend/src` permanece para sus pruebas, pero no participa del arranque del frontend ni del despliegue estático. La API pública de configuración/YouTube sigue separada de las futuras operaciones sensibles de turnos.

## Solicitudes por WhatsApp

El formulario ahora solicita nombre y apellido, tel?fono, servicio y descripci?n. Consultar [CONTACT_REQUESTS.md](CONTACT_REQUESTS.md) para variables p?blicas de Turnstile, configuraci?n backend de Meta, migraci?n y cron. Sin configuraci?n no simula env?os exitosos. `npm run test:browser` prueba escritorio y m?vil con servicios simulados.
