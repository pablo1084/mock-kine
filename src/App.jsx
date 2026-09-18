import React from 'react';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { allianceItems, contactCards, gallery, navItems, services, sportsKinesiologyStages, teamAreas, teamMembers, technologyServices } from './data/siteContent';
import { AboutSection } from './sections/AboutSection';
import { AlliancesSection } from './sections/AlliancesSection';
import { AppointmentsSection } from './sections/AppointmentsSection';
import { ContactSection } from './sections/ContactSection';
import { CenterOverviewSection } from './sections/CenterOverviewSection';
import { HeroSection } from './sections/HeroSection';
import { ExperiencesSection } from './sections/ExperiencesSection';
import { NewsSection } from './sections/NewsSection';
import { ServicesOverviewSection } from './sections/ServicesOverviewSection';
import { useTheme } from './hooks/useTheme';

const CenterSection = React.lazy(() => import('./sections/CenterSection').then((module) => ({ default: module.CenterSection })));
const ServicesSection = React.lazy(() => import('./sections/ServicesSection').then((module) => ({ default: module.ServicesSection })));
const TeamPage = React.lazy(() => import('./sections/TeamPage').then((module) => ({ default: module.TeamPage })));

function PageFallback() {
  return <div className="min-h-screen bg-graphite pt-32 text-center text-sm text-white/60">Cargando contenido…</div>;
}

export default function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [activePage, setActivePage] = React.useState('home');
  const [serviceTargetId, setServiceTargetId] = React.useState(null);
  const { theme, setTheme } = useTheme();

  const openHomeSection = () => {
    setActivePage('home');
  };

  const openTeamPage = () => {
    setActivePage('team');
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  const openPage = (page, targetId) => {
    setActivePage(page);
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
    <main className="theme-light-adaptive min-h-screen bg-[#ddd9d1] text-white dark:bg-graphite font-sans">
      <SiteHeader
        menuOpen={menuOpen}
        navItems={navItems}
        onCloseMenu={() => setMenuOpen(false)}
        onHomeSection={openHomeSection}
        onOpenMenu={() => setMenuOpen(true)}
        theme={theme}
        onThemeChange={setTheme}
      />

      <HeroSection hidden={!showHome} />
      <ServicesOverviewSection hidden={!showHome} onOpenServices={(targetId) => openPage('services', targetId)} />
      {activePage === 'services' && (
        <React.Suspense fallback={<PageFallback />}>
          <ServicesSection targetId={serviceTargetId} onBack={() => openPage('home', 'servicios')} onRequestAppointment={() => openPage('home', 'turnos')} services={services} stages={sportsKinesiologyStages} technologyServices={technologyServices} teamMembers={teamMembers} />
        </React.Suspense>
      )}
      <CenterOverviewSection hidden={!showHome} onOpenCenter={() => openPage('center')} />
      {activePage === 'center' && (
        <React.Suspense fallback={<PageFallback />}>
          <CenterSection onBack={() => openPage('home', 'nuestro-centro')} gallery={gallery} />
        </React.Suspense>
      )}
      <AboutSection hidden={!showHome} onOpenTeamPage={openTeamPage} />
      {activePage === 'team' && (
        <React.Suspense fallback={<PageFallback />}>
          <TeamPage teamAreas={teamAreas} teamMembers={teamMembers} onBack={openHomeSection} />
        </React.Suspense>
      )}
      <ExperiencesSection hidden={!showHome} />
      <NewsSection hidden={!showHome} />
      <AlliancesSection hidden={!showHome} items={allianceItems} />
      <ContactSection contactCards={contactCards} hidden={!showHome} />
      <AppointmentsSection hidden={!showHome} />
      <SiteFooter hidden={!showHome} />
    </main>
  );
}
