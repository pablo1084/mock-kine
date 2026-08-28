import React from 'react';
import { CalendarCheck } from 'lucide-react';

export function AppointmentsSection({ hidden, selectedSlot, services, slots, onSelectSlot }) {
  return (
    <section id="turnos" className={`${hidden ? 'hidden' : ''} bg-graphiteDark py-20 text-white`}>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-pulse">Turnos Online</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-normal">Solicitá tu turno de manera rápida y sencilla.</h2>
          <p className="mt-5 text-base leading-8 text-white/70">
            Completá el formulario con tus datos, elegí el servicio y seleccioná un horario disponible. Nuestro equipo revisará la solicitud y se comunicará con vos para confirmar el turno.
          </p>
          <div className="mt-8 rounded-md border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h3 className="text-lg font-semibold">Primera consulta</h3>
            <p className="mt-2 text-sm leading-7 text-white/70">
              La primera visita incluye una evaluación completa para conocer tu condición física y definir el tratamiento más adecuado.
            </p>
          </div>
        </div>
        <form className="rounded-md border border-white/10 bg-white p-4 text-ink shadow-soft sm:p-6" onSubmit={(event) => event.preventDefault()} autoComplete="on">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Nombre
              <input name="name" autoComplete="name" required maxLength={100} className="rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse" placeholder="Nombre y apellido" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Teléfono
              <input type="tel" name="phone" autoComplete="tel" required maxLength={30} className="rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse" placeholder="+54 9 ..." />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Servicio
              <select name="service" required className="rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse">
                {services.map((service) => <option key={service.title}>{service.title}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Fecha
              <input type="date" name="date" required className="rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse" />
            </label>
          </div>
          <div className="mt-5">
            <span className="text-sm font-semibold">Horarios disponibles</span>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {slots.map((slot) => (
                <button key={slot} type="button" className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${selectedSlot === slot ? 'border-pulse bg-pulse text-white' : 'border-line bg-white text-ink hover:border-pulse'}`} onClick={() => onSelectSlot(slot)}>
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <label className="mt-5 grid gap-2 text-sm font-semibold">
            Motivo de consulta
            <textarea name="reason" maxLength={1000} className="min-h-28 rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse" placeholder="Contanos brevemente qué necesitás trabajar." />
          </label>
          <p className="mt-3 text-xs leading-5 text-neutral-500">
            Si contás con obra social, consultanos previamente para verificar cobertura, requisitos y disponibilidad de la prestación.
          </p>
          <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-neutral-600">
            <input type="checkbox" name="privacyConsent" required className="mt-1 h-4 w-4 shrink-0 accent-pulse" />
            <span>
              Acepto que mis datos sean utilizados para gestionar mi solicitud de turno, según la{' '}
              <a href="/politica-de-privacidad.html" target="_blank" rel="noopener noreferrer" className="font-semibold text-pulse underline-offset-2 hover:underline">
                política de privacidad
              </a>.
            </span>
          </label>
          <button type="submit" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-graphite px-5 py-3 text-sm font-semibold text-white transition hover:bg-pulse sm:w-auto">
            Solicitar reserva <CalendarCheck size={17} />
          </button>
        </form>
      </div>
    </section>
  );
}
