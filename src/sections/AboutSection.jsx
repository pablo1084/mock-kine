import React from 'react';
import { ArrowRight } from 'lucide-react';

export function AboutSection({ hidden, onOpenTeamPage }) {
  return (
    <section id="quienes-somos" className={`${hidden ? 'hidden' : ''} border-y border-white/10 bg-graphite py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-pulse">Quiénes somos</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <a
            href="#equipo"
            className="group block overflow-hidden rounded-md border border-white/10 bg-white/8 shadow-soft"
            onClick={(event) => {
              event.preventDefault();
              onOpenTeamPage();
            }}
          >
            <div className="relative aspect-[4/3] bg-graphiteSoft">
              <img
                src="/assets/equipo.jpg"
                alt="Equipo completo de José Oviedo kinesiología deportiva"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-graphiteDark/80 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-md bg-pulse px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-orange-600">
                Ver equipo <ArrowRight size={17} />
              </span>
            </div>
          </a>
          <div className="max-w-2xl lg:pl-4">
            <div className="border-l-2 border-pulse pl-5 sm:pl-7">
              <p className="text-3xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-4xl lg:text-5xl">
                No somos un equipo.<br />
                Somos <span className="text-pulse">UN</span> equipo.<br />
                Somos <span className="text-pulse">TU</span> equipo.
              </p>
            </div>
            <p className="mt-8 font-body text-base leading-8 text-white/72 sm:text-lg">
              En José Oviedo Kinesiología trabajamos como un equipo interdisciplinario que integra evaluación, tratamiento, entrenamiento y seguimiento en un mismo lugar, acompañando cada proceso desde el diagnóstico hasta la vuelta segura a la actividad.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
