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
import { ExperiencesSection } from './sections/ExperiencesSection';
import { HeroSection } from './sections/HeroSection';
import { ServicesSection } from './sections/ServicesSection';
import { TeamPage } from './sections/TeamPage';

export default function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [showTeamPage, setShowTeamPage] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState('10:00');
  const [selectedTeamMember, setSelectedTeamMember] = React.useState(null);
  const heroVideoRef = useSlowVideo();

  const openHomeSection = () => {
    setShowTeamPage(false);
    setSelectedTeamMember(null);
  };

  const openTeamPage = () => {
    setShowTeamPage(true);
    setSelectedTeamMember(null);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  return (
    <main className="min-h-screen bg-graphite text-white font-sans">
      <SiteHeader
        menuOpen={menuOpen}
        navItems={navItems}
        onCloseMenu={() => setMenuOpen(false)}
        onHomeSection={openHomeSection}
        onOpenMenu={() => setMenuOpen(true)}
      />

      <HeroSection hidden={showTeamPage} videoRef={heroVideoRef} />
      <AboutSection hidden={showTeamPage} onOpenTeamPage={openTeamPage} />
      <TeamPage
        hidden={!showTeamPage}
        teamAreas={teamAreas}
        teamMembers={teamMembers}
        onBack={openHomeSection}
        onSelectMember={setSelectedTeamMember}
      />
      <TeamMemberModal member={selectedTeamMember} onClose={() => setSelectedTeamMember(null)} />
      <ServicesSection hidden={showTeamPage} ivolutionGallery={ivolutionGallery} services={services} stages={sportsKinesiologyStages} technologyServices={technologyServices} />
      <CenterSection hidden={showTeamPage} gallery={gallery} />
      <AlliancesSection hidden={showTeamPage} items={allianceItems} />
      <ExperiencesSection hidden={showTeamPage} />
      <AppointmentsSection
        hidden={showTeamPage}
        selectedSlot={selectedSlot}
        services={services}
        slots={slots}
        onSelectSlot={setSelectedSlot}
      />
      <ContactSection contactCards={contactCards} hidden={showTeamPage} />
      <SiteFooter hidden={showTeamPage} />
    </main>
  );
}
