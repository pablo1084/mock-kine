import React from 'react';
import { ChevronDown } from 'lucide-react';

const experiences = [
  {
    id: 'moreno',
    name: 'Aníbal Moreno',
    sport: 'Fútbol',
    role: 'Jugador profesional de fútbol en River Plate',
    caption: 'La intensidad de cada partido empieza mucho antes de entrar a la cancha.',
    image: '/assets/experiencias/moreno.jpg',
    position: 'center 48%',
  },
  {
    id: 'tapia',
    name: 'Agustín Tapia',
    sport: 'Pádel',
    role: 'Número 1° del mundo en pádel',
    caption: 'Precisión, potencia y movimiento: los detalles que se trabajan entre un punto y el siguiente.',
    image: '/assets/experiencias/tapia.jpg',
    position: 'center 65%',
  },
  {
    id: 'llanos',
    name: 'Diego Llanos',
    sport: 'Enduro · Rally',
    role: 'Tres veces campeón de Rally Dakar',
    caption: 'Detrás de cada etapa hay preparación, resistencia y un nuevo desafío por recorrer.',
    image: '/assets/experiencias/llanos.jpg',
    position: 'center 48%',
  },
  {
    id: 'aguero',
    name: 'Josué Agüero',
    sport: 'Boxeo',
    role: 'Boxeador profesional',
    caption: 'La fuerza de cada round también se construye con disciplina fuera del ring.',
    image: '/assets/experiencias/aguero.jpg',
    position: 'center 48%',
  },
];

export function ExperiencesSection({ hidden }) {
  return (
    <section id="experiencias" aria-labelledby="experiencias-title" className={`${hidden ? 'hidden' : ''} scroll-mt-24 bg-graphiteDark py-16 sm:py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="experiencias-title" className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Experiencias</h2>
        <p className="mt-3 font-body text-base leading-7 text-white/70">Deportistas que pasaron por nuestro centro.</p>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-6 lg:grid-cols-4">
          {experiences.map(({ id, name, sport, role, caption, image, position }) => (
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
                <h3 id={`experiencia-${id}`} className="text-base font-semibold text-white sm:text-xl">{name}</h3>
                <p className="mt-1 text-xs leading-6 text-pulse sm:text-sm">{sport}</p>
              </div>
              <details name="experiencias" className="group/details mt-2">
                <summary className="experience-tab mx-auto flex min-h-11 w-16 cursor-pointer list-none items-center justify-center rounded-b-lg border border-white/10 bg-white/[0.03] text-white/50 transition-colors hover:border-pulse/40 hover:text-pulse focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulse [&::-webkit-details-marker]:hidden">
                  <span className="sr-only">Detalles de la experiencia de {name}</span>
                  <ChevronDown aria-hidden="true" size={18} className="transition-transform duration-200 group-open/details:rotate-180 motion-reduce:transition-none" />
                </summary>
                <div className="mt-3 border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold leading-6 text-white/85">{role}</p>
                  <p className="mt-2 font-body text-sm leading-7 text-white/65">{caption}</p>
                </div>
              </details>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
