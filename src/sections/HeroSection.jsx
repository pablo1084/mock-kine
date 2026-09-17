import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const highlights = ['Evaluación personalizada', 'Tecnología aplicada', 'Equipo interdisciplinario'];

const heroVariants = {
  actual: { src: '/assets/hero2-optimized.webp', alt: 'José Oviedo atiende a un paciente en el centro de kinesiología', width: 738, height: 1600, desktop: 'center 40%', tablet: 'center 46%', mobile: 'center 48%', filter: 'contrast(1.11) saturate(1.08) brightness(0.88)' },
  opcion2: { src: '/assets/hero.jpeg', alt: 'Vista panorámica del gimnasio del centro de kinesiología', width: 1600, height: 995, desktop: '62% center', tablet: '62% center', mobile: '64% center', filter: 'contrast(1.08) saturate(0.88) brightness(0.78)' },
  opcion3: { src: '/assets/hero2.png', alt: 'Vista del área de entrenamiento y readaptación del centro', width: 1200, height: 1600, desktop: 'center 54%', tablet: 'center 55%', mobile: 'center 56%', filter: 'contrast(1.08) saturate(0.88) brightness(0.8)' },
  opcion4: { src: '/assets/hero3.jpeg', alt: 'José Oviedo durante una consulta de kinesiología', width: 4000, height: 3000, desktop: '58% center', tablet: '57% center', mobile: '56% center', shift: '5%', filter: 'contrast(1.08) saturate(0.9) brightness(0.78)' },
  opcion5: { src: '/assets/hero4.jpeg', alt: 'José Oviedo atendiendo a una paciente en el consultorio', width: 4000, height: 3000, desktop: '62% center', tablet: '61% center', mobile: '60% center', shift: '5%', filter: 'contrast(1.1) saturate(0.9) brightness(0.8)' },
};

function getHeroVariant() {
  const requested = new URLSearchParams(window.location.search).get('hero')?.toLowerCase();
  const key = requested && heroVariants[requested] ? requested : 'actual';
  return { key, ...heroVariants[key] };
}

export function HeroSection({ hidden }) {
  const heroImage = getHeroVariant();
  const imageStyle = {
    '--hero-image-filter': heroImage.filter,
    '--hero-position-desktop': heroImage.desktop,
    '--hero-position-tablet': heroImage.tablet,
    '--hero-position-mobile': heroImage.mobile,
    '--hero-image-shift': heroImage.shift || '0%',
  };

  return (
    <section id="inicio" data-hero-variant={heroImage.key} className={`${hidden ? 'hidden' : ''} hero--vertical relative isolate overflow-hidden bg-[#15181b] pt-24 text-white`}>
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
            src={heroImage.src}
            alt={heroImage.alt}
            className="hero-image h-full w-full object-cover object-bottom"
            width={heroImage.width}
            height={heroImage.height}
            style={imageStyle}
            fetchPriority="high"
          />
          <div className="hero-image-texture" />
          <div className="hero-photo-fade pointer-events-none absolute inset-0" />
        </div>
      </div>
    </section>
  );
}
