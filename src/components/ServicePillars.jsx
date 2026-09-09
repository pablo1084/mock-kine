import React from 'react';
import { Activity, ArrowRight, Dumbbell, FlaskConical, Waves } from 'lucide-react';

const pillars = [
  { id: 'kinesiologia', icon: Activity, title: 'Kinesiología deportiva y rehabilitación', text: 'Lesiones, recuperación funcional y tratamiento personalizado.' },
  { id: 'laboratorio-ivolution', icon: FlaskConical, title: 'Evaluación funcional y del rendimiento', text: 'Ivolution Lab, fuerza, potencia, perfil de rendimiento y seguimiento.' },
  { id: 'readaptacion', icon: Dumbbell, title: 'Readaptación y entrenamiento', text: 'Fortalecimiento, reacondicionamiento, progresión y retorno a la actividad o al deporte.' },
  { id: 'tecnologia-aplicada', icon: Waves, title: 'Tecnología aplicada', text: 'Ondas de choque y MEP ecoguiado.' },
];

export function ServicePillars({ onOpenServices }) {
  return (
    <div className="mt-10 grid gap-4 md:grid-cols-2">
      {pillars.map(({ id, icon: Icon, title, text }, index) => (
        <a key={id} href={`#${id}`} onClick={onOpenServices ? (event) => { event.preventDefault(); onOpenServices(id); } : undefined} className="group flex flex-col rounded-md border border-white/10 bg-graphiteDark p-6 transition hover:-translate-y-1 hover:border-pulse/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pulse sm:p-8">
          <div className="flex items-center justify-between text-pulse"><Icon size={27} /><span className="text-sm font-semibold">0{index + 1}</span></div>
          <h3 className="mt-5 text-2xl font-semibold text-white">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-white/70">{text}</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-pulse">Conocer más <ArrowRight size={17} className="transition group-hover:translate-x-1" /></span>
        </a>
      ))}
    </div>
  );
}
