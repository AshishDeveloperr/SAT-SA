import React from 'react';
import {
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';

interface AppHeaderProps {
  statusMessage: string;
  onOpenScenarioStudio: () => void;
  onLaunchConsole: () => void;
  onNavigateHome: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  statusMessage,
  onOpenScenarioStudio,
  onLaunchConsole,
  onNavigateHome
}) => {
  return (
    <header className="bg-[#111827] text-white border-b border-slate-700/60 sticky top-0 z-40 px-6 py-3.5 shadow-md flex-shrink-0">
      <div className="w-full mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3.5 cursor-pointer" onClick={onNavigateHome}>
          <div className="bg-[#991B1B]/15 p-2.5 rounded-xl border border-[#991B1B]/40 text-[#EF4444] shadow-[0_0_12px_rgba(153,27,27,0.3)]">
            <Shield className="w-6 h-6 text-[#EF4444]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                SAT<span className="text-[#EF4444]">-SA</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {statusMessage && (
            <span className="text-xs bg-[#991B1B]/20 text-[#FCA5A5] border border-[#991B1B]/40 px-3 py-1 rounded-lg font-medium animate-pulse">
              {statusMessage}
            </span>
          )}

          <div className="flex items-center space-x-2.5">
            <button 
              onClick={onOpenScenarioStudio}
              className="flex items-center space-x-1.5 text-xs bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/60 px-3.5 py-2 rounded-lg font-bold shadow-sm transition hover:scale-105 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-[#EF4444]" />
              <span>What-If Studio</span>
            </button>
            <button 
              onClick={onLaunchConsole}
              className="flex items-center space-x-2 text-xs bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(153,27,27,0.35)] transition-all hover:scale-105 active:scale-95"
            >
              <span>Launch Supervisory Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
