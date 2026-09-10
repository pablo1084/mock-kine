import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const highlights = ['Evaluación personalizada', 'Tecnología aplicada', 'Equipo interdisciplinario'];

export function HeroSection({ hidden }) {
  return (
    <section id="inicio" className={`${hidden ? 'hidden' : ''} relative isolate overflow-hidden bg-[#15181b] pt-24 text-white`}>
      <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-pulse/10 blur-[110px]" />
      <div className="hero-layout relative mx-auto grid max-w-7xl items-end gap-8 px-4 pb-6 pt-8 sm:gap-10 sm:px-6 sm:pb-8 lg:static lg:grid-cols-2 lg:items-center lg:gap-0 lg:px-8 lg:py-10">
        <div className="hero-content relative z-10 min-w-0 sm:pt-2 lg:py-6 lg:pr-6">
          <p className="flex items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/75 sm:text-xs">
            <span className="h-px w-9 bg-pulse" /> Readaptación · Rendimiento · Prevención
          </p>
          <h1 className="mt-6 max-w-3xl text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[1.04] tracking-[-0.035em] text-white">
            Tu mejor versión.<br />
            <span className="text-white/70">Nuestro propósito.</span>
          </h1>
          <p className="mt-6 max-w-2xl font-body text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
            Kinesiología deportiva, evaluación y readaptación para acompañarte desde la lesión hasta el rendimiento.
          </p>
          <div className="hero-actions mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#turnos" className="group inline-flex items-center justify-center gap-2 rounded-md bg-pulse px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(240,90,40,0.24)] transition hover:-translate-y-0.5 hover:bg-orange-600">
              Reservar turno <ArrowRight size={17} className="transition group-hover:translate-x-1" />
            </a>
            <a href="#nuestro-centro" className="group hidden items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10 sm:inline-flex">
              Conocer el centro <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </a>
          </div>
          <div className="hero-highlights mt-10 flex flex-col gap-3 border-t border-white/15 pt-5 text-xs font-medium text-white/70 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {highlights.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-pulse" /> {item}
              </span>
            ))}
          </div>
        </div>
        <div className="hero-photo relative -mx-4 aspect-[4/5] overflow-hidden sm:-mx-6 lg:mx-0">
          <img
            src="/assets/hero-centro.png"
            alt="Dos profesionales acompañan a una paciente durante una evaluación en Ivolution Lab"
            className="hero-image h-full w-full object-cover object-bottom"
            width="1200"
            height="1800"
            fetchPriority="high"
          />
          <div className="hero-image-texture" />
          <div className="hero-photo-fade pointer-events-none absolute inset-0" />
        </div>
      </div>
    </section>
  );
}
