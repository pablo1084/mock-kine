import React from 'react';
export function TeamMemberCard({ member, onSelect, showTraining = false, imagePosition = member.imagePosition }) {
  const Element = onSelect ? 'button' : 'article';
  return (
    <Element
      {...(onSelect ? { type: 'button', onClick: () => onSelect(member) } : {})}
      className={`group flex h-full flex-col overflow-hidden rounded-md border border-white/10 bg-white text-left text-ink shadow-sm ${onSelect ? 'transition hover:-translate-y-1 hover:shadow-soft' : ''} ${member.highlight ? 'lg:grid lg:grid-cols-[0.82fr_1fr]' : ''}`}
    >
      <div className={`relative shrink-0 bg-graphiteSoft ${member.highlight ? 'min-h-80' : 'h-72'}`}>
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-semibold text-white/50">
          {member.initials}
        </div>
        <img
          src={member.photo}
          alt={member.name}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover ${imagePosition} transition duration-500 group-hover:scale-105`}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <div className={`flex flex-1 flex-col p-5 ${member.highlight ? 'border-t-4 border-pulse lg:border-l-4 lg:border-t-0' : ''}`}>
        <span className="text-xs font-semibold uppercase text-pulse">{member.role}</span>
        <h4 className="mt-2 text-2xl font-semibold text-graphite">{member.name}</h4>
        {member.title && <p className="mt-1 text-sm font-semibold text-neutral-500">{member.title}</p>}
        <p className="mt-3 text-sm leading-7 text-neutral-600">{member.summary}</p>
        {showTraining && member.training?.length > 0 && (
          <div className="mt-5 border-t border-neutral-200 pt-4">
            <h5 className="text-xs font-bold uppercase tracking-wide text-pulse">{member.trainingLabel || 'Formación complementaria'}</h5>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-600 marker:text-pulse">
              {member.training.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        )}
        {onSelect && <span className="mt-auto inline-flex pt-5 text-sm font-semibold text-pulse">Ver en carrusel</span>}
      </div>
    </Element>
  );
}
