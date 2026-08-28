import React from 'react';
import { ArrowRight, FlaskConical, Waves } from 'lucide-react';

const highlights = [
  {
    id: 'laboratorio-ivolution',
    eyebrow: 'Evaluación objetiva',
    title: 'Ivolution Lab',
    text: 'Tecnología para medir fuerza, potencia, asimetrías y evolución.',
    image: '/assets/ivolution-lab/lab1.jpeg',
    icon: FlaskConical,
  },
  {
    id: 'ondas-de-choque',
    eyebrow: 'Tecnología terapéutica',
    title: 'Ondas de choque',
    text: 'Un recurso específico integrado a un plan de tratamiento profesional.',
    image: '/assets/ondas.jpg',
    icon: Waves,
  },
];

export function ServicesOverviewSection({ hidden, onOpenServices }) {
  return (
    <section id="servicios" className={`${hidden ? 'hidden' : ''} bg-graphiteSoft py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-pulse">Servicios</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold text-white">
              Evaluar mejor para tomar decisiones más precisas.
            </h2>
          </div>
          <p className="max-w-lg text-base leading-8 text-white/68">
            Rehabilitación, salud integral y tecnología aplicada en un recorrido pensado alrededor de cada objetivo.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {highlights.map(({ id, eyebrow, title, text, image, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className="group relative min-h-80 overflow-hidden rounded-md border border-white/10 text-left"
              onClick={() => onOpenServices(id)}
            >
              <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-graphiteDark via-graphiteDark/55 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-pulse">
                  <Icon size={17} /> {eyebrow}
                </span>
                <h3 className="mt-3 text-3xl font-semibold text-white">{title}</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/72">{text}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                  Conocer más <ArrowRight className="transition group-hover:translate-x-1" size={17} />
                </span>
              </div>
            </button>
          ))}
        </div>

        <button type="button" className="mt-8 inline-flex items-center gap-2 rounded-md border border-pulse bg-pulse/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pulse" onClick={() => onOpenServices()}>
          Explorar todos los servicios <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}
