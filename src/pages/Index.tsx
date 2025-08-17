import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ExecomSection from "@/components/ExecomSection";
import ActivitiesSection from "@/components/ActivitiesSection";
import AchievementsSection from "@/components/AchievementsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import SplashCursor from "@/components/SplashCursor";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SplashCursor />
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <ExecomSection />
        <ActivitiesSection />
        <AchievementsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
