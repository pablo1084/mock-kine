import React from 'react';

const experiences = [
  {
    id: 'moreno',
    name: 'Aníbal Moreno',
    sport: 'Fútbol',
    role: 'Jugador profesional de fútbol en River Plate',
    image: '/assets/experiencias/moreno.webp',
    position: 'center 48%',
  },
  {
    id: 'tapia',
    name: 'Agustín Tapia',
    sport: 'Pádel',
    role: 'Número 1° del mundo en pádel',
    image: '/assets/experiencias/tapia.webp',
    position: 'center 65%',
  },
  {
    id: 'llanos',
    name: 'Diego Llanos',
    sport: 'Enduro · Rally',
    role: 'Campeón mundial del desierto 2023 y participante en tres ediciones del Rally Dakar',
    image: '/assets/experiencias/llanos.webp',
    position: 'center 48%',
  },
  {
    id: 'aguero',
    name: 'Josué Agüero',
    sport: 'Boxeo',
    role: 'Boxeador profesional',
    image: '/assets/experiencias/aguero.webp',
    position: 'center 48%',
  },
];

export function ExperiencesSection({ hidden }) {
  return (
    <section id="experiencias" aria-labelledby="experiencias-title" className={`${hidden ? 'hidden' : ''} scroll-mt-24 bg-graphiteDark py-16 sm:py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="experiencias-title" className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Experiencias que respaldan nuestro trabajo</h2>
        <p className="mt-3 font-body text-base leading-7 text-white/70">Deportistas que confían en nuestro equipo para recuperar, preparar y volver a competir.</p>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-6 lg:grid-cols-4">
          {experiences.map(({ id, name, sport, role, image, position }) => (
            <article key={id} aria-labelledby={`experiencia-${id}`} className="experience-card group min-w-0 self-start">
              <div className="aspect-[3/4] overflow-hidden rounded-md bg-graphite">
                <img
                  src={image}
                  alt={`${name} junto al equipo en el centro José Oviedo`}
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: position }}
                  className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.025]"
                />
              </div>
              <div className="pt-3">
                <p className="text-xs font-semibold uppercase leading-6 tracking-wide text-pulse sm:text-sm">{sport}</p>
                <h3 id={`experiencia-${id}`} className="mt-1 text-base font-semibold text-white sm:text-xl">{name}</h3>
                <p className="mt-1 font-body text-sm leading-6 text-white/65">{role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
