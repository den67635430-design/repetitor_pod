import React from 'react';
import Navigation from './src/components/Navigation';
import HeroSection from './src/components/HeroSection';
import ProblemsSection from './src/components/ProblemsSection';
import ChatSection from './src/components/ChatSection';
import PricingSection from './src/components/PricingSection';
import CTASection from './src/components/CTASection';
import Footer from './src/components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Navigation />
      <HeroSection />
      <ProblemsSection />
      <ChatSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default App;
