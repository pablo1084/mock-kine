import React from 'react';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { ContactChallenge } from '../components/ContactChallenge';
import { getContactServices, submitContactRequest } from '../utils/contactApi';

export function AppointmentsSection({ hidden }) {
  const [services, setServices] = React.useState([]);
  const [servicesError, setServicesError] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [reload, setReload] = React.useState(0);
  const [phase, setPhase] = React.useState('idle');
  const [error, setError] = React.useState('');
  const challenge = React.useRef(null);
  const attempt = React.useRef(null);
  const busy = React.useRef(false);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
  const sending = phase === 'verifying' || phase === 'sending';
  React.useEffect(() => {
    if (hidden) return undefined;
    const controller = new AbortController();
    let active = true;
    setLoading(true); setServicesError('');
    const timer = setTimeout(() => {
      controller.abort();
      if (active) { setLoading(false); setServicesError('No pudimos cargar los servicios. Volvé a intentar.'); }
    }, 15000);
    getContactServices(controller.signal).then(data => { if (active) setServices(data); }).catch(() => {
      if (active && !controller.signal.aborted) setServicesError('No pudimos cargar los servicios. Volvé a intentar.');
    }).finally(() => { clearTimeout(timer); if (active) setLoading(false); });
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [hidden, reload]);

  async function submit(event) {
    event.preventDefault();
    if (busy.current) return;
    const form = new FormData(event.currentTarget);
    const data = { full_name: form.get('full_name').trim(), phone: form.get('phone').trim(), service_id: form.get('service_id'),
      description: form.get('description').trim(), privacy_consent: form.get('privacyConsent') === 'on' };
    const fingerprint = JSON.stringify(data);
    if (attempt.current?.fingerprint !== fingerprint) attempt.current = { fingerprint, id: crypto.randomUUID() };
    busy.current = true; setError(''); setPhase('verifying');
    try {
      const token = await challenge.current.execute(attempt.current.id);
      setPhase('sending');
      await submitContactRequest(data, attempt.current.id, token);
      setPhase('success'); attempt.current = null;
    } catch (failure) {
      setError(failure.name === 'TimeoutError' || failure instanceof TypeError
        ? 'No pudimos comprobar el envío. Tus datos siguen aquí; volvé a intentar.' : failure.message);
      setPhase('idle');
    } finally { busy.current = false; }
  }

  return (
    <section id="turnos" className={`${hidden ? 'hidden' : ''} bg-graphiteDark py-20 text-white`}>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-pulse">Turnos Online</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-normal">Solicitá tu turno de manera rápida y sencilla.</h2>
          <p className="mt-5 text-base leading-8 text-white/70">
            Dejanos tus datos, elegí el servicio y contanos brevemente qué necesitás. Nuestro equipo se comunicará con vos a la brevedad para coordinar la atención.
          </p>
          <div className="mt-8 rounded-md border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h3 className="text-lg font-semibold">Primera consulta</h3>
            <p className="mt-2 text-sm leading-7 text-white/70">La primera visita incluye una evaluación completa para conocer tu condición física y definir el tratamiento más adecuado.</p>
          </div>
        </div>
        {phase === 'success' ? (
          <div role="status" className="rounded-md border border-white/10 bg-white p-6 text-ink shadow-soft">
            <CheckCircle2 className="text-pulse" size={36} />
            <h3 className="mt-4 text-2xl font-semibold">Recibimos tu solicitud</h3>
            <p className="mt-3 leading-7 text-neutral-600">El centro se comunicará con vos a la brevedad para coordinar tu atención.</p>
          </div>
        ) : (
          <form className="rounded-md border border-white/10 bg-white p-4 text-ink shadow-soft sm:p-6" onSubmit={submit} autoComplete="on" aria-busy={sending}>
            <fieldset disabled={sending}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold">Nombre y apellido
                  <input name="full_name" autoComplete="name" required minLength={3} maxLength={160} className="rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse" placeholder="Nombre y apellido" />
                </label>
                <label className="grid gap-2 text-sm font-semibold">Teléfono de WhatsApp
                  <input type="tel" name="phone" autoComplete="tel" required minLength={8} maxLength={40} className="rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse" placeholder="+54 9 ..." />
                </label>
                <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Servicio
                  <select name="service_id" required defaultValue="" disabled={loading || !services.length || !!servicesError} className="rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse disabled:bg-neutral-100">
                    <option value="" disabled>{loading ? 'Cargando servicios…' : 'Seleccioná un servicio'}</option>
                    {services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
                  </select>
                </label>
              </div>
              {servicesError && <p role="alert" className="mt-3 text-sm text-red-700">{servicesError} <button type="button" onClick={() => setReload(n => n + 1)} className="font-semibold underline">Reintentar</button></p>}
              {!loading && !servicesError && !services.length && <p role="status" className="mt-3 text-sm text-neutral-600">No hay servicios disponibles por el momento.</p>}
              <label className="mt-5 grid gap-2 text-sm font-semibold">Breve descripción
                <textarea name="description" required maxLength={500} className="min-h-28 rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse" placeholder="Contanos brevemente qué necesitás." />
              </label>
              <p className="mt-3 text-xs leading-5 text-neutral-500">Si contás con obra social, consultanos previamente para verificar cobertura y requisitos de la prestación.</p>
              <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-neutral-600">
                <input type="checkbox" name="privacyConsent" required className="mt-1 h-4 w-4 shrink-0 accent-pulse" />
                <span>Acepto el uso de mis datos para gestionar esta solicitud y recibir el aviso y contacto por WhatsApp, según la{' '}
                  <a href="/politica-de-privacidad.html" target="_blank" rel="noopener noreferrer" className="font-semibold text-pulse underline-offset-2 hover:underline">política de privacidad</a>.
                </span>
              </label>
            </fieldset>
            <ContactChallenge ref={challenge} siteKey={siteKey} />
            {!siteKey && <p role="status" className="mt-3 text-sm text-neutral-600">Las solicitudes online no están disponibles por el momento. Contactanos por los medios del centro.</p>}
            {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={sending || loading || !services.length || !!servicesError || !siteKey} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-graphite px-5 py-3 text-sm font-semibold text-white transition hover:bg-pulse disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
              {phase === 'verifying' ? 'Verificando…' : phase === 'sending' ? 'Enviando…' : 'Reservar turno'} <MessageCircle size={17} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
