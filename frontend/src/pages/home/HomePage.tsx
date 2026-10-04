import React from 'react';
import { HeroSection } from './components/HeroSection';
import { ProblemSection } from './components/ProblemSection';
import { SolutionSection } from './components/SolutionSection';
import { ArchitectureSection } from './components/ArchitectureSection';
import { IntegrityChainSection } from './components/IntegrityChainSection';
import { BenchmarkSection } from './components/BenchmarkSection';
import { ValidationSection } from './components/ValidationSection';
import { StackSection } from './components/StackSection';
import { DeploySection } from './components/DeploySection';
import { LandingFooter } from './components/LandingFooter';
import './styles/landingPage.css';

interface HomePageProps {
  onOpenConsole?: () => void;
  onOpenScenarioStudio?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenConsole, onOpenScenarioStudio }) => {
  return (
    <div className="landing-container">
      {/* 1. Hero Section */}
      <HeroSection 
        onOpenConsole={onOpenConsole} 
        onOpenScenarioStudio={onOpenScenarioStudio}
      />

      {/* 2. The Real-World Problem Section */}
      <ProblemSection />

      {/* 3. How SAT-SA Solves It Section */}
      <SolutionSection />

      {/* 4. System Architecture Section */}
      <ArchitectureSection />

      {/* 5. Cryptographic Hash Chaining & Tamper-Proof Audit Section */}
      <IntegrityChainSection />

      {/* 6. Empirical Scale & NCIIPC Problem Scope Benchmarks (500K+ Logs & Air-Gapped AI) */}
      <BenchmarkSection />

      {/* 7. Empirical Validation Report vs Random Baseline */}
      <ValidationSection />

      {/* 7. Tech Stack Section */}
      <StackSection />

      {/* 8. Deploy Section */}
      <DeploySection />

      {/* 9. Minimal Sovereign Footer */}
      <LandingFooter />
    </div>
  );
};

export default HomePage;
