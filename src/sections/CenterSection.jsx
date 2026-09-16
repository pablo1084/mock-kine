import React from 'react';
import { ArrowLeft } from 'lucide-react';

export function CenterSection({ hidden, gallery, onBack }) {
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
          <article
            key={item.id}
            className="group overflow-hidden rounded-md border border-white/10 bg-white text-ink shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-graphiteSoft">
              <img src={item.src} alt={item.title} loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 ${item.imagePosition || 'object-center'}`} />
            </div>
            <div className="p-5">
              <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-neutral-600">{item.tag}</span>
              <h3 className="mt-4 text-2xl font-semibold text-graphite">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-neutral-600">{item.summary}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
