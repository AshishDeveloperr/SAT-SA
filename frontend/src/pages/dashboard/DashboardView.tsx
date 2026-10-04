import React from 'react';
import {
  AlertTriangle,
  Scale,
  EyeOff,
  TrendingUp,
  ChevronRight,
  Printer,
  ArrowRight,
  Database
} from 'lucide-react';
import { Entity, Finding, SilentAsset, ReviewSample, ValidationMetrics } from '../../types/domain';
import { SupervisorySankeyFlow } from '../../components/SupervisorySankeyFlow';
import { ResilienceDimensionPieChart } from '../../components/ResilienceDimensionPieChart';

interface DashboardViewProps {
  entities: Entity[];
  findings: Finding[];
  silentAssets: SilentAsset[];
  reviewSamples: ReviewSample[];
  validationMetrics: ValidationMetrics | null;
  trends: any[];
  setActiveTab: (tab: any) => void;
  setSelectedReportEntity: (entity: Entity) => void;
  setIsReportModalOpen: (open: boolean) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  entities,
  findings,
  silentAssets,
  reviewSamples,
  validationMetrics,
  trends,
  setActiveTab,
  setSelectedReportEntity,
  setIsReportModalOpen
}) => {
  return (
    <div className="space-y-5">
      {/* Top Stat Cards - Elegant & Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3">
        {/* Card 0: Multi-CSE Ingested Volume */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-red-50/90 text-[#991B1B] border border-red-200/80 flex items-center justify-center shrink-0">
              <Database className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Ingested Telemetry
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-slate-900 font-mono">
                  535,500+
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  Logs &amp; Cases
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-red-50 text-[#991B1B] border border-red-200/70 shrink-0 ml-2">
            500K+
          </span>
        </div>

        {/* Card 1: Supervisory Target */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-red-50/90 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Supervisory Target
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-slate-900 font-mono">
                  CSE-POWER-01
                </span>
                <span className="text-[11px] text-red-600 font-bold truncate">
                  Score: 58
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200/60 shrink-0 ml-2">
            High Risk
          </span>
        </div>

        {/* Card 2: Active Supervisory Defects */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-50/90 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Active Supervisory Defects
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-amber-600 font-mono">
                  {findings.filter(f => f.kind === 'execution_gap').length} Defects
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  Fast-close &amp; unescalated
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200/60 shrink-0 ml-2">
            {findings.filter(f => f.kind === 'execution_gap').length} Gaps
          </span>
        </div>

        {/* Card 3: Silent Critical Assets */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-purple-50/90 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <EyeOff className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Silent Critical Assets
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-purple-700 font-mono">
                  {silentAssets.length} Systems
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  &gt;14 days zero telemetry
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60 shrink-0 ml-2">
            {silentAssets.length} Silent
          </span>
        </div>

        {/* Card 4: Review Efficiency Lift */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-50/90 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Review Efficiency Lift
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-emerald-600 font-mono">
                  3.42× Lift
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  vs Random Sampling
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200/60 shrink-0 ml-2">
            3.42×
          </span>
        </div>
      </div>

      {/* End-to-End Supervisory Telemetry & Detection Sankey Flow */}
      <SupervisorySankeyFlow 
        totalAlerts={validationMetrics?.totalAlertsInPool || (entities[0] as any)?.alert_count || 535500}
        totalCases={validationMetrics?.totalCasesInPool || 128400}
        totalAssets={(entities[0] as any)?.asset_count || 160}
        executionGapsCount={findings.filter(f => f.kind === 'execution_gap').length}
        silentAssetsCount={silentAssets.length}
        findingsCount={findings.length}
        reviewQueueCount={reviewSamples.length}
        entityName={entities[0]?.name}
        entityCode={entities[0]?.code}
      />

      {/* ================= MULTI-QUARTER LONGITUDINAL RESILIENCE TRAJECTORY (REQ 16) ================= */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                NCIIPC Req 16 Longitudinal
              </span>
              <h2 className="text-base font-bold text-[#0F172A]">Multi-Quarter Resilience Trajectory &amp; Metric Gaming Tracker</h2>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Surveillance tracking triage discipline evolution across Q1, Q2, and Q3. Exposes entities whose self-reported compliance stayed high while operational defects accumulated.
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-500 font-semibold">Surveillance Epoch:</span>
            <span className="text-xs font-mono font-bold bg-[#111827] text-white px-3 py-1 rounded-lg border border-slate-700 shadow-xs">
              2026-Q1 → 2026-Q3 (9 Months)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(trends.length > 0 ? trends : [
            {
              entityId: 'CSE-POWER-01',
              entityCode: 'CSE-POWER-01',
              entityName: 'Northern Regional Grid Dispatch Centre',
              currentScore: 58,
              deltaOverTime: 26,
              trendDirection: 'DETERIORATING',
              history: [
                { quarter: '2026-Q1', score: 32, fastClosePct: 14.2 },
                { quarter: '2026-Q2', score: 45, fastClosePct: 28.0 },
                { quarter: '2026-Q3', score: 58, fastClosePct: 41.2 }
              ]
            },
            {
              entityId: 'CSE-FIN-01',
              entityCode: 'CSE-FIN-01',
              entityName: 'National Clearing & Settlement Depository',
              currentScore: 42,
              deltaOverTime: 14,
              trendDirection: 'DETERIORATING',
              history: [
                { quarter: '2026-Q1', score: 28, fastClosePct: 18.0 },
                { quarter: '2026-Q2', score: 35, fastClosePct: 24.5 },
                { quarter: '2026-Q3', score: 42, fastClosePct: 33.1 }
              ]
            },
            {
              entityId: 'CSE-BANK-01',
              entityCode: 'CSE-BANK-01',
              entityName: 'State Reserve Apex Banking Corp',
              currentScore: 10,
              deltaOverTime: -4,
              trendDirection: 'BENCHMARK',
              history: [
                { quarter: '2026-Q1', score: 14, fastClosePct: 4.8 },
                { quarter: '2026-Q2', score: 11, fastClosePct: 4.1 },
                { quarter: '2026-Q3', score: 10, fastClosePct: 3.5 }
              ]
            }
          ]).slice(0, 3).map((trend: any) => {
            const isDet = trend.trendDirection === 'DETERIORATING';
            const isBench = trend.trendDirection === 'BENCHMARK';
            return (
              <div 
                key={trend.entityId || trend.entityCode}
                className={`border rounded-xl p-4 transition flex flex-col justify-between ${
                  isDet 
                    ? 'bg-red-50/30 border-red-200 hover:border-red-300' 
                    : isBench 
                      ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-300' 
                      : 'bg-slate-50/50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-extrabold text-sm text-[#0F172A]">{trend.entityCode}</div>
                      <div className="text-[11px] text-[#64748B] truncate max-w-[170px]" title={trend.entityName}>
                        {trend.entityName}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDet 
                        ? 'bg-red-100 text-red-700 border border-red-300' 
                        : isBench 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {trend.trendDirection}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Risk Delta (9mo):</span>
                      <span className={`font-mono font-extrabold ${isDet ? 'text-red-600' : isBench ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {trend.deltaOverTime > 0 ? `+${trend.deltaOverTime}` : trend.deltaOverTime} pts ({trend.history?.[0]?.score} → {trend.currentScore})
                      </span>
                    </div>

                    {/* Sparkline Progression */}
                    <div className="bg-white/90 p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500 font-semibold">
                        <span>2026-Q1</span>
                        <span>2026-Q2</span>
                        <span>2026-Q3 (Now)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 items-end h-10 pt-1">
                        {trend.history?.map((h: any, idx: number) => {
                          const heightPct = Math.min(100, Math.max(18, (h.score / 70) * 100));
                          return (
                            <div key={idx} className="flex flex-col items-center h-full justify-end">
                              <span className="text-[9px] font-mono font-bold text-slate-700 mb-0.5">{h.score}</span>
                              <div 
                                className={`w-full rounded-t transition-all ${
                                  isDet 
                                    ? idx === 2 ? 'bg-red-600' : idx === 1 ? 'bg-red-400' : 'bg-red-300'
                                    : isBench 
                                      ? 'bg-emerald-500' 
                                      : 'bg-amber-500'
                                }`}
                                style={{ height: `${heightPct}%` }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                      <span>Fast-Close Surge:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {trend.history?.[0]?.fastClosePct}% → {trend.history?.[trend.history?.length - 1]?.fastClosePct}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Statutory Action:</span>
                  <button
                    onClick={() => {
                      const matchedEntity = entities.find(e => e.id === trend.entityId || e.code === trend.entityCode);
                      setSelectedReportEntity(matchedEntity || entities[0]);
                      setIsReportModalOpen(true);
                    }}
                    className="text-[#991B1B] hover:text-[#7F1D1D] font-bold flex items-center space-x-1 transition hover:translate-x-0.5"
                  >
                    <span>Generate SAR-01</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-slate-900">Supervisory Significance: </span>
              <span className="text-slate-600">
                In mature SOC assessments, entities often "game" KPIs by reducing closure times while latent incident counts surge. SAT-SA exposes this 9-month divergence automatically.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Entity Attention Score Ranking Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Supervisory Attention Ranking (Composite Risk 0–100)</h2>
            <p className="text-xs text-[#64748B]">Prioritization of Critical Sector Entities for on-site examination based on operational evidence</p>
          </div>
          <span className="text-xs font-mono font-semibold bg-[#DCFCE7] text-[#16A34A] px-2.5 py-1 rounded-full border border-[#86EFAC]">
            5 Monitored CSEs
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0] font-semibold">
              <tr>
                <th className="py-3 px-6">Rank</th>
                <th className="py-3 px-6">Entity</th>
                <th className="py-3 px-6">Sector</th>
                <th className="py-3 px-6">Attention Score</th>
                <th className="py-3 px-6">Risk Tier</th>
                <th className="py-3 px-6">Open Findings</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {entities.map(ent => (
                <tr key={ent.id} className="hover:bg-[#F1F5F9] transition">
                  <td className="py-4 px-6 font-mono font-bold text-[#334155]">#{ent.rank}</td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-[#0F172A]">{ent.code}</div>
                    <div className="text-[11px] text-[#64748B]">{ent.name}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1] px-2.5 py-1 rounded-md text-[11px] font-medium">
                      {ent.sector_name}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-extrabold text-sm text-[#0F172A] w-6">{ent.score}</span>
                      <div className="w-28 bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            ent.score >= 50 ? 'bg-[#DC2626]' : ent.score >= 30 ? 'bg-[#D97706]' : 'bg-[#16A34A]'
                          }`}
                          style={{ width: `${ent.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      ent.riskLevel === 'CRITICAL' ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]' :
                      ent.riskLevel === 'HIGH' ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D]' :
                      'bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]'
                    }`}>
                      {ent.riskLevel}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-[#0F172A]">
                    {ent.contributing_findings} Findings
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedReportEntity(ent);
                        setIsReportModalOpen(true);
                      }}
                      title={`Generate Form SAR-01 Dossier for ${ent.code}`}
                      className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs transition shadow-xs hover:scale-105 active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5 text-red-600" />
                      <span>SAR-01</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('gap')}
                      className="text-[#16A34A] hover:text-[#15803d] font-bold inline-flex items-center space-x-1 transition text-xs"
                    >
                      <span>Inspect Gaps</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8-DIMENSION OPERATIONAL RESILIENCE CIRCULAR DISTRIBUTION */}
      <ResilienceDimensionPieChart entities={entities} />
    </div>
  );
};
