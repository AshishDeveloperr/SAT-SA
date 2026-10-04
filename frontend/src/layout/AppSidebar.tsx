import React from 'react';
import {
  Shield,
  Home,
  UploadCloud,
  Zap,
  Printer,
  RefreshCw,
  Database,
  Github,
  ArrowUpRight,
  Bot
} from 'lucide-react';
import { Entity, TabType } from '../types/domain';

export interface SidebarMenuItem {
  id: TabType;
  path: string;
  label: string;
  icon: any;
  count?: number;
  highlight?: boolean;
}

interface AppSidebarProps {
  sidebarMenuItems: SidebarMenuItem[];
  activeTab: TabType;
  entities: Entity[];
  isLoading: boolean;
  onNavigate: (path: string) => void;
  onOpenUpload: () => void;
  onOpenScenarioStudio: () => void;
  onOpenReportModal: (entity: Entity | null) => void;
  onRunAnalysis: () => void;
  onRegenerateSynth: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  sidebarMenuItems,
  activeTab,
  entities,
  isLoading,
  onNavigate,
  onOpenUpload,
  onOpenScenarioStudio,
  onOpenReportModal,
  onRunAnalysis,
  onRegenerateSynth
}) => {
  return (
    <aside className="w-60 bg-[#111827] text-white border-r border-slate-700/60 flex flex-col flex-shrink-0 h-full select-none print:hidden">
      {/* Sidebar Brand Header */}
      <div className="px-3.5 py-3.5 border-b border-slate-700/60 flex items-center justify-between flex-shrink-0 bg-[#111827]">
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onNavigate('/')}>
          <div className="bg-[#991B1B]/15 p-1.5 rounded-lg border border-[#991B1B]/40 text-[#EF4444] shadow-[0_0_10px_rgba(153,27,27,0.3)]">
            <Shield className="w-4 h-4 text-[#EF4444]" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            SAT<span className="text-[#EF4444]">-SA</span>
          </span>
        </div>

        <button 
          onClick={() => onNavigate('/')}
          title="Return to Technical Overview"
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700/70 transition"
        >
          <Home className="w-3.5 h-3.5 text-[#EF4444]" />
        </button>
      </div>

      {/* Menu List */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
        {sidebarMenuItems.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.path)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition text-[11px] font-semibold group ${
                active 
                  ? 'bg-[#991B1B] text-white font-bold shadow-[0_0_12px_rgba(153,27,27,0.4)] border border-red-600/50' 
                  : tab.highlight 
                    ? 'text-[#EF4444] bg-[#991B1B]/15 hover:bg-[#991B1B]/25 border border-[#991B1B]/30 hover:border-[#991B1B]/50' 
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08] border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <div className={`p-1 rounded-md transition flex-shrink-0 ${
                  active 
                    ? 'bg-black/20 text-white' 
                    : tab.highlight 
                      ? 'bg-[#991B1B]/25 text-[#EF4444]' 
                      : 'bg-white/[0.07] text-slate-400 group-hover:text-white group-hover:bg-white/10'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{tab.label}</span>
              </div>

              {tab.count !== undefined && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-1.5 flex-shrink-0 ${
                  active 
                    ? 'bg-white text-[#991B1B] shadow-sm' 
                    : 'bg-white/10 text-slate-300 group-hover:bg-white/20'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Action Buttons - Only Reset Kept */}
      <div className="px-2.5 py-2 border-t border-slate-700/60 bg-black/20 flex-shrink-0">
        <button 
          onClick={onRegenerateSynth}
          disabled={isLoading}
          title="Reset synthetic data corpus"
          className="w-full flex items-center justify-center space-x-1.5 text-xs bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 px-3 py-2 rounded-lg font-bold shadow-sm transition hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-[#EF4444]" />
          <span>Reset</span>
        </button>
      </div>


      {/* Sidebar Bottom Footer: GitHub Repo Link */}
      <div className="p-2.5 border-t border-slate-700/60 bg-black/30 flex-shrink-0">
        <a
          href="https://github.com/AshishDeveloperr/SIH2"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-slate-600 shadow-sm transition group"
        >
          <div className="flex items-center space-x-2">
            <Github className="w-3.5 h-3.5 text-slate-300 group-hover:text-white" />
            <span>GitHub Repository</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </aside>
  );
};
