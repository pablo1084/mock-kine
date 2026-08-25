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
            Completá el formulario con tus datos y el servicio que necesitás según la agenda disponible del centro para confirmar el día y horario. Nos comunicaremos con vos a la brevedad.
          </p>

          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h3 className="text-lg font-semibold">Primera consulta</h3>
            <p className="mt-2 text-sm leading-7 text-white/70">
              La primera visita incluye una evaluación completa para conocer tu condición física, establecer un diagnóstico funcional y definir el tratamiento más adecuado para alcanzar tus objetivos.
            </p>
          </div>
        </div>
        <form className="rounded-md border border-white/10 bg-white p-4 text-ink shadow-soft sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Nombre
              <input className="rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse" placeholder="Nombre y apellido" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Teléfono
              <input className="rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse" placeholder="+54 9 ..." />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Servicio
              <select className="rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse">
                {services.map((service) => (
                  <option key={service.title}>{service.title}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Fecha
              <input type="date" className="rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse" />
            </label>
          </div>
          <div className="mt-5">
            <span className="text-sm font-semibold">Horarios disponibles</span>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    selectedSlot === slot ? 'border-pulse bg-pulse text-white' : 'border-line bg-white text-ink hover:border-pulse'
                  }`}
                  onClick={() => onSelectSlot(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <label className="mt-5 grid gap-2 text-sm font-semibold">
            Motivo de consulta
            <textarea className="min-h-28 rounded-md border border-line px-3 py-3 font-normal outline-none focus:border-pulse" placeholder="Contanos brevemente qué necesitás trabajar." />
          </label>
          <button type="button" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-graphite px-5 py-3 text-sm font-semibold text-white transition hover:bg-pulse sm:w-auto">
            Solicitar reserva <CalendarCheck size={17} />
          </button>
        </form>
      </div>
    </section>
  );
}
