import React from 'react';
import { ArrowRight } from 'lucide-react';

export function CenterOverviewSection({ hidden, onOpenCenter }) {
  return (
    <section id="nuestro-centro" className={`${hidden ? 'hidden' : ''} bg-graphite py-20`}>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8">
        <button type="button" className="group relative min-h-96 overflow-hidden rounded-md border border-white/10" onClick={onOpenCenter}>
          <img src="/assets/centro/fachada.jpeg" alt="Fachada del centro José Oviedo Kinesiología" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-graphiteDark/65 to-transparent" />
        </button>
        <div className="lg:pl-8">
          <p className="text-sm font-semibold uppercase text-pulse">Nuestro centro</p>
          <h2 className="mt-3 text-4xl font-semibold text-white">Un espacio diseñado para evaluar, tratar y entrenar.</h2>
          <p className="mt-5 text-base leading-8 text-white/70">
            Boxes, consultorios, gimnasio y laboratorio integrados para acompañar cada etapa del proceso.
          </p>
          <button type="button" className="mt-7 inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-pulse hover:text-pulse" onClick={onOpenCenter}>
            Recorrer el centro <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}
