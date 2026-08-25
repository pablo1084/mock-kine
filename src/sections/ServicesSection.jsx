import React from 'react';
import { Activity, Dumbbell, ShieldCheck, Waves } from 'lucide-react';

const serviceIcons = {
  activity: Activity,
  shield: ShieldCheck,
  waves: Waves,
  dumbbell: Dumbbell,
};

export function ServicesSection({ hidden, services }) {
  return (
    <section id="servicios" className={`${hidden ? 'hidden' : ''} mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8`}>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-pulse">Servicios</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-normal text-white">Tratamientos orientados a movimiento, dolor y rendimiento.</h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-white/68">
          Cada plan combina evaluación clínica, objetivos concretos y progresiones medibles según tu deporte, lesión o rutina diaria.
        </p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {services.map(({ icon, title, text }) => {
          const Icon = serviceIcons[icon];

          return (
            <article key={title} className="rounded-md border border-white/10 bg-white p-6 text-ink shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <Icon className="text-pulse" size={30} />
              <h3 className="mt-5 text-xl font-semibold text-graphite">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-neutral-600">{text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
