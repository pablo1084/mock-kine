import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HERO_VIDEO_SPEED } from '../hooks/useSlowVideo';

export function HeroSection({ hidden, videoRef }) {
  return (
    <section id="inicio" className={`${hidden ? 'hidden' : ''} relative overflow-hidden bg-graphite pt-24 text-white`}>
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className="hero-video h-full w-full object-cover"
          src="/assets/centro2.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onLoadedMetadata={(event) => {
            event.currentTarget.playbackRate = HERO_VIDEO_SPEED;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-graphite via-graphite/82 to-graphite/20" />
        <div className="hero-video-texture" />
      </div>
      <div className="relative mx-auto grid min-h-[88vh] max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold uppercase text-white/80">
            <Sparkles size={15} /> Readaptación + rendimiento
          </span>
          <div className="mt-6 max-w-4xl">
            <img src="/assets/jose-oviedo-hero-wordmark.png" alt="José Oviedo kinesiología deportiva" className="h-auto w-full max-w-[520px] object-contain sm:max-w-[680px]" />
          </div>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/76">
            Centro integral de kinesiología, rehabilitación y entrenamiento personalizado para recuperarte mejor, moverte con seguridad y volver a tu actividad.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#turnos" className="inline-flex items-center justify-center gap-2 rounded-md bg-pulse px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
              Reservar turno <ArrowRight size={17} />
            </a>
            <a href="#servicios" className="inline-flex items-center justify-center rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white hover:text-graphite">
              Ver servicios
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <img src="/assets/paciente-tapia.jpeg" alt="Paciente y equipo del centro" className="h-72 w-full rounded-md object-cover shadow-soft sm:h-96" />
          <div className="grid gap-3">
            <img src="/assets/consulta-deportiva.jpg" alt="Consulta deportiva" className="h-36 w-full rounded-md object-cover object-[50%_42%] sm:h-48" />
            <div className="rounded-md border border-white/10 bg-white/10 p-5 backdrop-blur">
              <strong className="block text-4xl">360°</strong>
              <span className="mt-2 block text-sm leading-6 text-white/72">
                Evaluación, tratamiento, fuerza y seguimiento en un solo lugar.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
