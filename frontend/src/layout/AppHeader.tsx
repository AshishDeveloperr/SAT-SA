import React from 'react';
import {
  Shield,
  ArrowUpRight,
  Github
} from 'lucide-react';

interface AppHeaderProps {
  statusMessage: string;
  onOpenScenarioStudio: () => void;
  onLaunchConsole: () => void;
  onNavigateHome: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  statusMessage,
  onLaunchConsole,
  onNavigateHome
}) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="bg-[#0B0F17] text-white border-b border-slate-800/80 sticky top-0 z-50 px-4 md:px-8 py-2.5 shadow-md flex-shrink-0 transition-all">
      <div className="max-w-[76.8rem] w-full mx-auto flex items-center justify-between gap-3">
        
        {/* Left: SIH2026 Badge + SAT-SA Logo */}
        <div 
          className="flex items-center space-x-2.5 cursor-pointer select-none group" 
          onClick={onNavigateHome}
          title="Go to Home"
        >
          {/* SIH 2026 Micro Card Badge */}
          <div className="flex items-center space-x-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200/90 shadow-2xs transition group-hover:scale-102">
            <div className="w-5 h-5 rounded-full bg-linear-to-tr from-amber-500 via-emerald-500 to-indigo-600 flex items-center justify-center p-0.5 shadow-2xs">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <span className="text-[8px] font-black leading-none text-slate-900">SIH</span>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[7.5px] font-black uppercase tracking-tight text-slate-800">SMART INDIA</span>
              <span className="text-[6.5px] font-bold text-slate-500">HACKATHON 2026</span>
            </div>
          </div>

          {/* SAT-SA Brand Name */}
          <div className="flex items-center space-x-1.5 pl-1">
            <span className="font-extrabold text-lg tracking-tight text-white font-sans">
              SAT<span className="text-[#EF4444]">-SA</span>
            </span>
          </div>
        </div>

        {/* Center: Dark Rounded Capsule Pill Menu for Sections */}
        <nav className="hidden lg:flex items-center space-x-1 bg-[#131B29]/95 border border-slate-800 px-3 py-1.5 rounded-full shadow-inner">
          <button
            onClick={() => scrollToSection('problem')}
            className="px-3.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            Problem
          </button>
          <button
            onClick={() => scrollToSection('solution')}
            className="px-3.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            Solution
          </button>
          <button
            onClick={() => scrollToSection('architecture')}
            className="px-3.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            Architecture
          </button>
          <button
            onClick={() => scrollToSection('benchmarks')}
            className="px-3.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            Benchmarks
          </button>
          <button
            onClick={() => scrollToSection('validation')}
            className="px-3.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            Validation
          </button>
          <button
            onClick={() => scrollToSection('deploy')}
            className="px-3.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            CLI
          </button>
        </nav>

        {/* Right: Dashboard Button & Green GitHub Button */}
        <div className="flex items-center space-x-2 shrink-0">
          {statusMessage && (
            <span className="hidden xl:inline-block text-[11px] bg-red-950/60 text-red-300 border border-red-800/60 px-2.5 py-0.5 rounded-md font-medium">
              {statusMessage}
            </span>
          )}

          {/* White Pill Button: Dashboard */}
          <button 
            onClick={onLaunchConsole}
            className="flex items-center space-x-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-slate-900 px-4 py-1.5 rounded-full shadow-sm transition hover:scale-102 active:scale-95 cursor-pointer"
          >
            <span>Dashboard</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />
          </button>

          {/* Theme Red Pill Button: GitHub */}
          <a
            href="https://github.com/AshishDeveloperr/SIH2"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-xs font-bold bg-[#991B1B] hover:bg-[#7F1D1D] text-white px-3.5 py-1.5 rounded-full shadow-sm transition hover:scale-102 active:scale-95 cursor-pointer"
            title="View Source on GitHub"
          >
            <Github className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            <span>GitHub</span>
            <ArrowUpRight className="w-3 h-3 text-white stroke-[2.5]" />
          </a>
        </div>

      </div>
    </header>
  );
};

