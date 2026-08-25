import React from 'react';
import { ArrowRight } from 'lucide-react';

export function AboutSection({ hidden, onOpenTeamPage }) {
  return (
    <section id="quienes-somos" className={`${hidden ? 'hidden' : ''} border-y border-white/10 bg-graphite py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase text-pulse">Quienes Somos</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-white">Un equipo interdisciplinario para acompañarte en cada etapa.</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
            Evaluación, tratamiento, entrenamiento y seguimiento en un mismo lugar.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
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
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-graphiteDark/80 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-md bg-pulse px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-orange-600">
                Ver equipo <ArrowRight size={17} />
              </span>
            </div>
          </a>
          <div className="max-w-2xl lg:pl-4">
            <span className="text-xs font-semibold uppercase text-pulse">Nuestro enfoque</span>
            <p className="mt-4 text-3xl font-semibold leading-snug text-white sm:text-4xl">
              José Oviedo Kinesiología integra boxes de atención, gimnasio, laboratorio de evaluación y profesionales enfocados en recuperación funcional.
            </p>
            <p className="mt-5 text-base leading-8 text-white/70">
              El abordaje es moderno, medible y pensado para acompañar desde el diagnóstico hasta la vuelta segura a la actividad.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
