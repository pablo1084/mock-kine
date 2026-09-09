import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ServicePillars } from '../components/ServicePillars';


export function ServicesOverviewSection({ hidden, onOpenServices }) {
  return (
    <section id="servicios" className={`${hidden ? 'hidden' : ''} bg-graphiteSoft py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-pulse">Servicios</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold text-white">
              Cuatro pilares para acompañar tu recuperación y rendimiento.
            </h2>
          </div>
          <p className="max-w-lg text-base leading-8 text-white/68">
            Rehabilitación, salud integral y tecnología aplicada en un recorrido pensado alrededor de cada objetivo.
          </p>
        </div>

        <ServicePillars onOpenServices={onOpenServices} />

        <button type="button" className="mt-8 inline-flex items-center gap-2 rounded-md border border-pulse bg-pulse/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pulse" onClick={() => onOpenServices()}>
          Explorar todos los servicios <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}
