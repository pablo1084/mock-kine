import React from 'react';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { TeamMemberModal } from './components/TeamMemberModal';
import { allianceItems, contactCards, gallery, ivolutionGallery, navItems, services, slots, sportsKinesiologyStages, teamAreas, teamMembers, technologyServices } from './data/siteContent';
import { AboutSection } from './sections/AboutSection';
import { AlliancesSection } from './sections/AlliancesSection';
import { AppointmentsSection } from './sections/AppointmentsSection';
import { ContactSection } from './sections/ContactSection';
import { CenterOverviewSection } from './sections/CenterOverviewSection';
import { HeroSection } from './sections/HeroSection';
import { ExperiencesSection } from './sections/ExperiencesSection';
import { ServicesOverviewSection } from './sections/ServicesOverviewSection';

const CenterSection = React.lazy(() => import('./sections/CenterSection').then((module) => ({ default: module.CenterSection })));
const ServicesSection = React.lazy(() => import('./sections/ServicesSection').then((module) => ({ default: module.ServicesSection })));
const TeamPage = React.lazy(() => import('./sections/TeamPage').then((module) => ({ default: module.TeamPage })));

function PageFallback() {
  return <div className="min-h-screen bg-graphite pt-32 text-center text-sm text-white/60">Cargando contenido…</div>;
}

export default function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [activePage, setActivePage] = React.useState('home');
  const [selectedSlot, setSelectedSlot] = React.useState('10:00');
  const [selectedTeamMember, setSelectedTeamMember] = React.useState(null);
  const [serviceTargetId, setServiceTargetId] = React.useState(null);

  const openHomeSection = () => {
    setActivePage('home');
    setSelectedTeamMember(null);
  };

  const openTeamPage = () => {
    setActivePage('team');
    setSelectedTeamMember(null);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  const openPage = (page, targetId) => {
    setActivePage(page);
    setSelectedTeamMember(null);
    if (page === 'services') {
      setServiceTargetId(targetId || null);
      return;
    }
    window.setTimeout(() => {
      if (targetId) {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 0);
  };

  const showHome = activePage === 'home';

  return (
    <main className="min-h-screen bg-graphite text-white font-sans">
      <SiteHeader
        menuOpen={menuOpen}
        navItems={navItems}
        onCloseMenu={() => setMenuOpen(false)}
        onHomeSection={openHomeSection}
        onOpenMenu={() => setMenuOpen(true)}
      />

      <HeroSection hidden={!showHome} />
      <ServicesOverviewSection hidden={!showHome} onOpenServices={(targetId) => openPage('services', targetId)} />
      {activePage === 'services' && (
        <React.Suspense fallback={<PageFallback />}>
          <ServicesSection targetId={serviceTargetId} onBack={openHomeSection} onRequestAppointment={() => openPage('home', 'turnos')} ivolutionGallery={ivolutionGallery} services={services} stages={sportsKinesiologyStages} technologyServices={technologyServices} />
        </React.Suspense>
      )}
      <CenterOverviewSection hidden={!showHome} onOpenCenter={() => openPage('center')} />
      {activePage === 'center' && (
        <React.Suspense fallback={<PageFallback />}>
          <CenterSection onBack={openHomeSection} gallery={gallery} />
        </React.Suspense>
      )}
      <AboutSection hidden={!showHome} onOpenTeamPage={openTeamPage} />
      {activePage === 'team' && (
        <React.Suspense fallback={<PageFallback />}>
          <TeamPage teamAreas={teamAreas} teamMembers={teamMembers} onBack={openHomeSection} onSelectMember={setSelectedTeamMember} />
        </React.Suspense>
      )}
      <TeamMemberModal member={selectedTeamMember} onClose={() => setSelectedTeamMember(null)} />
      <ExperiencesSection hidden={!showHome} />
      <AlliancesSection hidden={!showHome} items={allianceItems} />
      <ContactSection contactCards={contactCards} hidden={!showHome} />
      <AppointmentsSection hidden={!showHome} selectedSlot={selectedSlot} services={services} slots={slots} onSelectSlot={setSelectedSlot} />
      <SiteFooter hidden={!showHome} />
    </main>
  );
}
