import React from 'react';
import { ArrowLeft, ArrowRight, Building2, X } from 'lucide-react';

export function CenterSection({ hidden, gallery, onBack }) {
  const [selectedSpace, setSelectedSpace] = React.useState(null);

  return (
    <section className={`${hidden ? 'hidden' : ''} mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8`}>
      <button type="button" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-pulse" onClick={onBack}>
        <ArrowLeft size={17} /> Volver al inicio
      </button>
      <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-pulse">Nuestro Centro</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-white">Espacios pensados para evaluar, tratar y entrenar mejor.</h2>
        </div>
        <p className="max-w-xl text-base leading-8 text-white/72">
          Cada ambiente fue diseñado para ofrecer comodidad, seguridad y un tratamiento personalizado, integrando atención clínica, evaluación funcional, tecnología y entrenamiento supervisado.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item) => (
          <button
            key={item.id}
            type="button"
            className="group overflow-hidden rounded-md border border-white/10 bg-white text-left text-ink shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
            onClick={() => setSelectedSpace(item)}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-graphiteSoft">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/55">
                <Building2 size={34} />
                <span className="text-3xl font-semibold">{item.initials}</span>
              </div>
              {item.src && (
                <>
                  <img
                    src={item.src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-md"
                  />
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
                  />
                </>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-neutral-600">{item.tag}</span>
                <ArrowRight className="text-pulse transition group-hover:translate-x-1" size={18} />
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-graphite">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-neutral-600">{item.summary}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedSpace && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-graphiteDark/90 px-4 py-8 backdrop-blur" onClick={() => setSelectedSpace(null)}>
          <article className="grid max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-md border border-white/10 bg-white text-ink shadow-soft md:grid-cols-[0.95fr_1.05fr]" onClick={(event) => event.stopPropagation()}>
            <div className="relative min-h-80 bg-graphiteSoft">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/55">
                <Building2 size={42} />
                <span className="text-5xl font-semibold">{selectedSpace.initials}</span>
              </div>
              {(selectedSpace.detailSrc || selectedSpace.src) && (
                <img
                  src={selectedSpace.detailSrc || selectedSpace.src}
                  alt={selectedSpace.title}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>
            <div className="relative overflow-y-auto p-6 sm:p-8">
              <button
                type="button"
                aria-label="Cerrar espacio"
                className="absolute right-4 top-4 rounded-md border border-line p-2 text-graphite transition hover:border-pulse hover:text-pulse"
                onClick={() => setSelectedSpace(null)}
              >
                <X size={18} />
              </button>
              <span className="text-xs font-semibold uppercase text-pulse">{selectedSpace.tag}</span>
              <h3 className="mt-3 pr-12 text-3xl font-semibold text-graphite">{selectedSpace.title}</h3>
              <p className="mt-6 text-base leading-8 text-neutral-600">{selectedSpace.text}</p>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
