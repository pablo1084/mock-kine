import React from 'react';
import { X } from 'lucide-react';

export function TeamMemberModal({ member, onClose }) {
  React.useEffect(() => {
    if (!member) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [member, onClose]);

  if (!member) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-graphiteDark/90 px-4 py-8 backdrop-blur" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="team-member-name">
      <article
        className="grid max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-md border border-white/10 bg-white text-ink shadow-soft md:grid-cols-[0.86fr_1.14fr]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative min-h-80 bg-graphiteSoft">
          <div className="absolute inset-0 flex items-center justify-center text-5xl font-semibold text-white/50">
            {member.initials}
          </div>
          <img
            src={member.photo}
            alt={member.name}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover ${member.imagePosition}`}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="relative overflow-y-auto p-6 sm:p-8">
          <button
            type="button"
            aria-label="Cerrar presentación"
            className="absolute right-4 top-4 rounded-md border border-line p-2 text-graphite transition hover:border-pulse hover:text-pulse"
            onClick={onClose}
          >
            <X size={18} />
          </button>
          <span className="text-xs font-semibold uppercase text-pulse">{member.area}</span>
          <h3 id="team-member-name" className="mt-3 pr-12 text-3xl font-semibold text-graphite">{member.name}</h3>
          {member.title && <p className="mt-2 text-lg font-semibold text-graphite">{member.title}</p>}
          <p className="mt-2 text-base font-semibold text-neutral-600">{member.role}</p>
          <p className="mt-6 text-base leading-8 text-neutral-600">{member.bio}</p>
          {member.certificationsUrl && (
            <a
              href={member.certificationsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-md bg-graphite px-5 py-3 text-sm font-semibold text-white transition hover:bg-pulse"
            >
              Ver certificaciones
            </a>
          )}
        </div>
      </article>
    </div>
  );
}
