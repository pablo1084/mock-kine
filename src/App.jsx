import React from 'react';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { TeamMemberModal } from './components/TeamMemberModal';
import { allianceItems, contactCards, gallery, ivolutionGallery, navItems, services, slots, sportsKinesiologyStages, teamAreas, teamMembers, technologyServices } from './data/siteContent';
import { useSlowVideo } from './hooks/useSlowVideo';
import { AboutSection } from './sections/AboutSection';
import { AlliancesSection } from './sections/AlliancesSection';
import { AppointmentsSection } from './sections/AppointmentsSection';
import { CenterSection } from './sections/CenterSection';
import { ContactSection } from './sections/ContactSection';
import { CenterOverviewSection } from './sections/CenterOverviewSection';
import { HeroSection } from './sections/HeroSection';
import { ServicesSection } from './sections/ServicesSection';
import { ServicesOverviewSection } from './sections/ServicesOverviewSection';
import { TeamPage } from './sections/TeamPage';

export default function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [activePage, setActivePage] = React.useState('home');
  const [selectedSlot, setSelectedSlot] = React.useState('10:00');
  const [selectedTeamMember, setSelectedTeamMember] = React.useState(null);
  const heroVideoRef = useSlowVideo();

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

      <HeroSection hidden={!showHome} videoRef={heroVideoRef} />
      <AboutSection hidden={!showHome} onOpenTeamPage={openTeamPage} />
      <TeamPage
        hidden={activePage !== 'team'}
        teamAreas={teamAreas}
        teamMembers={teamMembers}
        onBack={openHomeSection}
        onSelectMember={setSelectedTeamMember}
      />
      <TeamMemberModal member={selectedTeamMember} onClose={() => setSelectedTeamMember(null)} />
      <ServicesOverviewSection hidden={!showHome} onOpenServices={(targetId) => openPage('services', targetId)} />
      <ServicesSection hidden={activePage !== 'services'} onBack={openHomeSection} ivolutionGallery={ivolutionGallery} services={services} stages={sportsKinesiologyStages} technologyServices={technologyServices} />
      <CenterOverviewSection hidden={!showHome} onOpenCenter={() => openPage('center')} />
      <CenterSection hidden={activePage !== 'center'} onBack={openHomeSection} gallery={gallery} />
      <AlliancesSection hidden={!showHome} items={allianceItems} />
      <AppointmentsSection hidden={!showHome} selectedSlot={selectedSlot} services={services} slots={slots} onSelectSlot={setSelectedSlot} />
      <ContactSection contactCards={contactCards} hidden={!showHome} />
      <SiteFooter hidden={!showHome} />
    </main>
  );
}
