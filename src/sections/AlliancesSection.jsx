import React from 'react';
export function AlliancesSection({ hidden, items }) {
  return (
    <section id="alianzas-estrategicas" className={`${hidden ? 'hidden' : ''} border-y border-white/10 bg-graphiteSoft py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-pulse">Alianzas estratégicas</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-white">Un espacio para sumar instituciones, marcas y profesionales aliados.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <article key={item} className="rounded-md border border-white/10 bg-white/8 p-6">
              <h3 className="text-xl font-semibold text-white">{item}</h3>
              <p className="mt-3 text-sm leading-7 text-white/68">Contenido pendiente para incorporar próximamente.</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
