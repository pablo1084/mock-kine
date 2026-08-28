import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const highlights = ['Evaluación personalizada', 'Tecnología aplicada', 'Equipo interdisciplinario'];

export function HeroSection({ hidden }) {
  return (
    <section id="inicio" className={`${hidden ? 'hidden' : ''} relative isolate overflow-hidden bg-graphite pt-24 text-white`}>
      <div className="absolute inset-0">
        <img
          src="/assets/hero-centro.jpeg"
          alt="Área de entrenamiento y rehabilitación del centro José Oviedo"
          className="hero-image h-full w-full object-cover object-center md:object-[70%_48%]"
          fetchPriority="high"
        />
        <div className="hero-contrast-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#15181b]/85 via-transparent to-[#15181b]/25" />
        <div className="hero-image-texture" />
        <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-pulse/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-6rem)] max-w-7xl items-center px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8">
        <div className="max-w-[760px] py-8">
          <p className="flex items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/75 sm:text-xs">
            <span className="h-px w-9 bg-pulse" /> Readaptación · Rendimiento · Prevención
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.04] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
            Tu mejor versión.<br />
            <span className="text-white/70">Nuestro propósito.</span>
          </h1>
          <p className="mt-6 max-w-2xl font-body text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
            Kinesiología deportiva, rehabilitación y entrenamiento basado en evaluación para acompañarte desde la lesión hasta tu mejor rendimiento.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#turnos" className="group inline-flex items-center justify-center gap-2 rounded-md bg-pulse px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(240,90,40,0.24)] transition hover:-translate-y-0.5 hover:bg-orange-600">
              Reservar turno <ArrowRight size={17} className="transition group-hover:translate-x-1" />
            </a>
            <a href="#nuestro-centro" className="group inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10">
              Conocer el centro <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </a>
          </div>
          <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-5 text-xs font-medium text-white/70 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {highlights.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-pulse" /> {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
