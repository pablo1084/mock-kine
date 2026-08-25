import React from 'react';
import { ArrowRight } from 'lucide-react';
import { TeamMemberCard } from '../components/TeamMemberCard';

export function TeamPage({ hidden, teamAreas, teamMembers, onBack, onSelectMember }) {
  return (
    <section id="equipo" className={`${hidden ? 'hidden' : 'block'} min-h-screen border-b border-white/10 bg-graphiteDark pt-32 pb-24`}>
      <a
        href="#quienes-somos"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center justify-center gap-2 rounded-md bg-pulse px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pulse/25 transition hover:bg-orange-600"
        onClick={onBack}
      >
        Volver <ArrowRight size={17} className="rotate-180" />
      </a>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-pulse">Equipo profesional</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-white">Profesionales que acompañan cada etapa del proceso.</h2>
          </div>
          <a href="#quienes-somos" className="inline-flex items-center justify-center rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white hover:text-graphite" onClick={onBack}>
            Volver a quienes somos
          </a>
        </div>

        <div className="grid gap-7">
          {teamAreas.map((area) => {
            const members = teamMembers.filter((member) => member.area === area);

            return (
              <div key={area}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <h3 className="text-sm font-semibold uppercase text-white/70">{area}</h3>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <div className={`grid gap-4 ${area === 'Dirección' ? 'lg:grid-cols-[1fr_1.35fr]' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
                  {members.map((member) => (
                    <TeamMemberCard key={member.id} member={member} onSelect={onSelectMember} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
