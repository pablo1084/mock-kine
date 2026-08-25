import React from 'react';
export function CenterSection({ hidden, gallery }) {
  return (
    <section id="nuestro-centro" className={`${hidden ? 'hidden' : ''} mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8`}>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-pulse">Nuestro Centro</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-normal text-white">Conocé nuestro espacio de trabajo</h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-white/68">
          Cada ambiente fue diseñado para ofrecer comodidad, seguridad y un tratamiento personalizado.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item) => (
          <figure key={item.title} className="group overflow-hidden rounded-md border border-white/10 bg-white text-ink">
            <img src={item.src} alt={item.title} className="h-72 w-full object-cover transition duration-500 group-hover:scale-105" />
            <figcaption className="flex items-center justify-between p-4">
              <span className="font-semibold text-graphite">{item.title}</span>
              <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-neutral-600">{item.tag}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
