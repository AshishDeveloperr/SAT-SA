import React, { useState } from 'react';
import {
  Sliders,
  ShieldAlert,
  EyeOff,
  Layers,
  AlertTriangle,
  Info,
  ArrowRight
} from 'lucide-react';
import { Rule, Finding } from '../../types/domain';

interface RulesStudioViewProps {
  rules: Rule[];
  findings: Finding[];
  setSelectedRuleDetail: (rule: any) => void;
  setFindingSearchQuery: (query: string) => void;
  setActiveTab: (tab: any) => void;
}

export const RulesStudioView: React.FC<RulesStudioViewProps> = ({
  rules,
  findings,
  setSelectedRuleDetail,
  setFindingSearchQuery,
  setActiveTab
}) => {
  const [rulesCategoryFilter, setRulesCategoryFilter] = useState<'ALL' | 'EG' | 'NS'>('ALL');

  const rulesStats = {
    total: rules.length,
    egCount: rules.filter(r => r.key?.startsWith('EG')).length,
    nsCount: rules.filter(r => r.key?.startsWith('NS')).length,
    dimensionsCovered: new Set(rules.map(r => r.dimension_code).filter(Boolean)).size || 8
  };

  return (
    <div className="space-y-4">
      {/* 4 Summary Metric Cards (Executive & Compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Card 1: Active Detectors */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-50/90 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Active Detectors
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-slate-900 font-mono">
                  {rulesStats.total} Rules
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  Production live
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0 ml-2">
            100% DB-Backed
          </span>
        </div>

        {/* Card 2: Evidence-Gap Engine Rules */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-red-50/90 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Evidence-Gap Rules
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-red-600 font-mono">
                  {rulesStats.egCount || 6} Detectors
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  EG-01 through EG-06
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200/60 shrink-0 ml-2">
            Triage Gaming
          </span>
        </div>

        {/* Card 3: Negative Space Rules */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-purple-50/90 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <EyeOff className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Negative Space Rules
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-purple-700 font-mono">
                  {rulesStats.nsCount || 5} Detectors
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  NS-01 through NS-05
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60 shrink-0 ml-2">
            Silent Blindspots
          </span>
        </div>

        {/* Card 4: Resilience Dimensions Covered */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-50/90 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Dimensions Covered
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-blue-600 font-mono">
                  {rulesStats.dimensionsCovered || 8} Dimensions
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  NCIIPC Framework
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200/60 shrink-0 ml-2">
            Dynamic Config
          </span>
        </div>
      </div>

      {/* Controls Bar: Category Filters */}
      <div className="bg-white border border-[#E2E8F0] p-3 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setRulesCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              rulesCategoryFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Detectors ({rules.length})
          </button>
          <button
            onClick={() => setRulesCategoryFilter('EG')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              rulesCategoryFilter === 'EG'
                ? 'bg-[#991B1B] text-white shadow-2xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <span>Evidence-Gap (EG-01–06)</span>
          </button>
          <button
            onClick={() => setRulesCategoryFilter('NS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              rulesCategoryFilter === 'NS'
                ? 'bg-purple-900 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>Negative Space (NS-01–05)</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <strong>{
            rules.filter(r => {
              if (rulesCategoryFilter === 'EG') return r.key?.startsWith('EG');
              if (rulesCategoryFilter === 'NS') return r.key?.startsWith('NS');
              return true;
            }).length
          }</strong> active production policies
        </span>
      </div>

      {/* EXECUTIVE CARDS VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules
          .filter(r => {
            if (rulesCategoryFilter === 'EG') return r.key?.startsWith('EG');
            if (rulesCategoryFilter === 'NS') return r.key?.startsWith('NS');
            return true;
          })
          .map(r => {
            const isEG = r.key?.startsWith('EG');
            // Live triggering stats from ingested findings
            const matchedFindings = findings.filter(f => f.rule_key === r.key);
            const violationCount = matchedFindings.length;
            const affectedEntities = Array.from(new Set(matchedFindings.map(f => f.entity_code))).filter(Boolean);

            // Algorithmic formulation per detector key
            const algorithmFormulas: Record<string, { formula: string; logic: string }> = {
              'EG-01': {
                formula: 'MTTC < min_minutes (10m) ∩ Severity ∈ {CRITICAL, HIGH}',
                logic: 'Triage duration below empirical 10th peer percentile indicates superficial closure.'
              },
              'EG-02': {
                formula: 'Severity == CRITICAL ∩ Escalation_Record == Ø',
                logic: 'Unescalated critical security events breach CIRP §4.1 escalation protocol.'
              },
              'EG-03': {
                formula: 'Alert_Status == "ACKNOWLEDGED" ∩ Action_Steps == 0',
                logic: 'Acknowledged to stop SLA clock with zero forensic evidence logged.'
              },
              'EG-04': {
                formula: 'Hamming_Distance(SimHash(Note_i), SimHash(Note_j)) ≤ 4',
                logic: 'Near-duplicate investigation commentary across distinct incidents implies scripted rubber-stamping.'
              },
              'EG-05': {
                formula: 'Count(Alerts | Asset_ID) ≥ 4 ∩ Window ≤ 30d ∩ Remediation == Ø',
                logic: 'Persistent recurring alerts on critical asset with no root-cause fix.'
              },
              'EG-06': {
                formula: 'Density(Closures) within [SLA_Deadline - 15m, SLA_Deadline] > 3.0× Poisson μ',
                logic: 'Statistically anomalous spike in ticket resolutions immediately prior to SLA breach deadline.'
              },
              'NS-01': {
                formula: 'Asset_Criticality ≥ 4 ∩ Silence_Duration > 14 Days',
                logic: 'High-criticality assets generating 0 telemetry while peer systems exhibit baseline activity.'
              },
              'NS-02': {
                formula: 'Peer_Prevalence(Category) ≥ 70% ∩ Entity_Volume(Category) == 0',
                logic: 'Complete absence of standard threat categories present in ≥70% of sectoral peers.'
              },
              'NS-03': {
                formula: 'Severity ∈ {CRITICAL, HIGH} ∩ Case_File_ID == Ø',
                logic: 'Critical threats resolved without formal investigation case docket.'
              },
              'NS-05': {
                formula: 'Robust_Z_Score(Volume / Asset_Day) < -2.0',
                logic: 'Gross alert under-reporting relative to sectoral median asset density.'
              }
            };

            const algo = algorithmFormulas[r.key] || {
              formula: 'Threshold(Metric) ∉ Normal_Supervisory_Range',
              logic: 'Standard deviation outlier relative to calibrated sectoral baseline.'
            };

            return (
              <div key={r.id} className="bg-white border border-[#E2E8F0] hover:border-slate-300 p-5 rounded-2xl shadow-xs hover:shadow-md transition space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Card Header: Key + Dimension + Live Detection Pill */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-md ${
                        isEG 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {r.key}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                        {r.dimension_code}
                      </span>
                    </div>

                    {/* Live Trigger Status Badge */}
                    {violationCount > 0 ? (
                      <span className="text-[11px] font-mono font-bold text-red-700 bg-red-50 border border-red-200/80 px-2.5 py-0.5 rounded-full flex items-center space-x-1.5 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                        <span>{violationCount} Violations ({affectedEntities.length} Entities)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>0 Violations (Clean Baseline)</span>
                      </span>
                    )}
                  </div>

                  {/* Rule Name & Description */}
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-snug">{r.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{r.description}</p>
                  </div>

                  {/* Supervisory Rationale Callout Box */}
                  <div className="bg-amber-50/70 border-l-4 border-l-amber-500 border border-amber-200/60 p-3 rounded-r-xl text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-1 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Supervisory Rationale:</span>
                    </span>
                    <p className="text-amber-950 font-medium leading-relaxed text-[11px]">
                      {r.rationale}
                    </p>
                  </div>

                  {/* Active Configured Parameters (Pill Grid) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                      Calibrated Policy Thresholds:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries(r.default_params || {}).map(([k, v]) => (
                        <div key={k} className="bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-lg text-xs">
                          <span className="text-[10px] text-slate-500 font-mono block truncate">{k}</span>
                          <span className="font-mono font-bold text-slate-900 text-[11px] block truncate">
                            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer: Statutory Reference + View Details Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Statutory Reference: <strong className="text-slate-600 font-mono">NCIIPC §7.4</strong></span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedRuleDetail({ ...r, violationCount, affectedEntities, algo, matchedFindings })}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center space-x-1.5 cursor-pointer border border-slate-200"
                    >
                      <Info className="w-3.5 h-3.5 text-slate-600" />
                      <span>View Details</span>
                    </button>

                    {violationCount > 0 && (
                      <button
                        onClick={() => {
                          setFindingSearchQuery(r.key);
                          setActiveTab('findings');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#991B1B] hover:bg-[#7F1D1D] text-white transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                      >
                        <span>Evidence ({violationCount})</span>
                        <ArrowRight className="w-3 h-3 text-red-200" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
