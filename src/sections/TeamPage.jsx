import React from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { TeamMemberCard } from '../components/TeamMemberCard';

export function TeamPage({ hidden, teamAreas, teamMembers, onBack, onSelectMember }) {
  const [activeMemberIndex, setActiveMemberIndex] = React.useState(0);
  const [desktopViewerIndex, setDesktopViewerIndex] = React.useState(null);
  const didSwipeRef = React.useRef(false);

  const showPreviousMember = React.useCallback(() => {
    setActiveMemberIndex((current) => (current - 1 + teamMembers.length) % teamMembers.length);
  }, [teamMembers.length]);

  const showNextMember = React.useCallback(() => {
    setActiveMemberIndex((current) => (current + 1) % teamMembers.length);
  }, [teamMembers.length]);

  const showPreviousDesktopMember = React.useCallback(() => {
    setDesktopViewerIndex((current) => (current - 1 + teamMembers.length) % teamMembers.length);
  }, [teamMembers.length]);

  const showNextDesktopMember = React.useCallback(() => {
    setDesktopViewerIndex((current) => (current + 1) % teamMembers.length);
  }, [teamMembers.length]);

  React.useEffect(() => {
    if (hidden) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') showPreviousMember();
      if (event.key === 'ArrowRight') showNextMember();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hidden, showPreviousMember, showNextMember]);

  React.useEffect(() => {
    if (desktopViewerIndex === null) return undefined;

    const handleViewerKeyDown = (event) => {
      if (event.key === 'Escape') setDesktopViewerIndex(null);
      if (event.key === 'ArrowLeft') showPreviousDesktopMember();
      if (event.key === 'ArrowRight') showNextDesktopMember();
    };

    window.addEventListener('keydown', handleViewerKeyDown);
    return () => window.removeEventListener('keydown', handleViewerKeyDown);
  }, [desktopViewerIndex, showPreviousDesktopMember, showNextDesktopMember]);

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

        <div className="lg:hidden">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase text-pulse">{teamMembers[activeMemberIndex].area}</p>
            <p className="mt-1 text-sm text-white/60">{activeMemberIndex + 1} de {teamMembers.length}</p>
          </div>

          <div className="relative mx-auto max-w-lg">
            <button type="button" aria-label="Profesional anterior" className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-graphiteDark/75 text-white shadow-lg backdrop-blur transition active:bg-pulse sm:left-0" onClick={showPreviousMember}>
              <ChevronLeft size={25} />
            </button>

            <div className="mx-auto max-w-md" onTouchStart={(event) => { didSwipeRef.current = false; event.currentTarget.dataset.touchX = event.touches[0].clientX; }} onTouchEnd={(event) => {
              const startX = Number(event.currentTarget.dataset.touchX);
              const distance = event.changedTouches[0].clientX - startX;
              if (Math.abs(distance) > 45) {
                didSwipeRef.current = true;
                if (distance > 0) showPreviousMember();
                else showNextMember();
              }
            }}>
              <TeamMemberCard member={teamMembers[activeMemberIndex]} onSelect={(member) => {
                if (didSwipeRef.current) {
                  didSwipeRef.current = false;
                  return;
                }
                onSelectMember(member);
              }} />
            </div>

            <button type="button" aria-label="Profesional siguiente" className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-graphiteDark/75 text-white shadow-lg backdrop-blur transition active:bg-pulse sm:right-0" onClick={showNextMember}>
              <ChevronRight size={25} />
            </button>
          </div>

          <div className="mt-5 flex justify-center gap-1.5">
            {teamMembers.map((member, index) => (
              <button key={member.id} type="button" aria-label={`Mostrar a ${member.name}`} className={`h-1.5 rounded-full transition-all ${index === activeMemberIndex ? 'w-7 bg-pulse' : 'w-1.5 bg-white/25'}`} onClick={() => setActiveMemberIndex(index)} />
            ))}
          </div>
        </div>

        <div className="hidden gap-7 lg:grid">
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
                    <TeamMemberCard key={member.id} member={member} onSelect={() => setDesktopViewerIndex(teamMembers.findIndex((item) => item.id === member.id))} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {desktopViewerIndex !== null && (
        <div className="fixed inset-0 z-[60] hidden items-center justify-center bg-graphiteDark/95 p-6 backdrop-blur lg:flex" onClick={() => setDesktopViewerIndex(null)}>
          <button type="button" aria-label="Cerrar visor del equipo" className="absolute right-8 top-8 rounded-md border border-white/20 p-2 text-white transition hover:border-pulse hover:text-pulse" onClick={() => setDesktopViewerIndex(null)}>
            <X size={22} />
          </button>

          <button type="button" aria-label="Profesional anterior" className="absolute left-8 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-pulse" onClick={(event) => { event.stopPropagation(); showPreviousDesktopMember(); }}>
            <ChevronLeft size={28} />
          </button>

          <div className="w-full max-w-md" onClick={(event) => event.stopPropagation()}>
            <p className="mb-4 text-center text-sm font-semibold uppercase text-pulse">
              {desktopViewerIndex + 1} de {teamMembers.length} · {teamMembers[desktopViewerIndex].area}
            </p>
            <TeamMemberCard member={teamMembers[desktopViewerIndex]} onSelect={onSelectMember} />
            <p className="mt-4 text-center text-sm text-white/60">Hacé clic en la card para ver la presentación completa.</p>
          </div>

          <button type="button" aria-label="Profesional siguiente" className="absolute right-8 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-pulse" onClick={(event) => { event.stopPropagation(); showNextDesktopMember(); }}>
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </section>
  );
}
