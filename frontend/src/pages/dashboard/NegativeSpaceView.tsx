import React from 'react';
import {
  EyeOff,
  Clock,
  ShieldAlert,
  Layers,
  Eye
} from 'lucide-react';
import { SilentAsset, Finding } from '../../types/domain';

interface NegativeSpaceViewProps {
  silentAssets: SilentAsset[];
  findings: Finding[];
  setSelectedSilentAsset: (asset: SilentAsset) => void;
}

export const NegativeSpaceView: React.FC<NegativeSpaceViewProps> = ({
  silentAssets,
  findings,
  setSelectedSilentAsset
}) => {
  const negativeSpaceStats = {
    totalSilent: silentAssets.length,
    maxDays: silentAssets.length > 0 ? Math.max(...silentAssets.map(a => a.daysSilent || 0)) : 22,
    avgDays: silentAssets.length > 0 ? Math.round(silentAssets.reduce((acc, curr) => acc + (curr.daysSilent || 0), 0) / silentAssets.length) : 18,
    tier1Count: silentAssets.filter(a => a.criticality === 5 || !a.criticality).length,
    nsFindingsCount: findings.filter(f => f.rule_key?.startsWith('NS')).length,
    entitiesAffected: new Set(findings.filter(f => f.rule_key?.startsWith('NS')).map(f => f.entity_code)).size || 1
  };

  return (
    <div className="space-y-5">
      {/* 4 Summary Metric Cards (Executive & Compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Card 1: Silent Critical Assets */}
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
                <span className="text-sm font-black text-slate-900 font-mono">
                  {negativeSpaceStats.totalSilent} Systems
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  Zero telemetry &gt;10d
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60 shrink-0 ml-2">
            {negativeSpaceStats.totalSilent} Blindspots
          </span>
        </div>

        {/* Card 2: Maximum Silence Window */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-red-50/90 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Max Silence Window
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-red-600 font-mono">
                  {negativeSpaceStats.maxDays} Days
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  Avg: {negativeSpaceStats.avgDays}d inactive
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200/60 shrink-0 ml-2">
            Audit Defect
          </span>
        </div>

        {/* Card 3: Tier 1 Mission-Critical Assets (Purdue L1/L2) */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-50/90 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Tier-1 Mission Critical OT
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-amber-600 font-mono">
                  {negativeSpaceStats.tier1Count} Critical
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  Purdue L1/L2 field assets
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0 ml-2">
            Tier 1 (PERA)
          </span>
        </div>

        {/* Card 4: Negative Space Defects */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-50/90 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Negative Space Findings
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-slate-900 font-mono">
                  {negativeSpaceStats.nsFindingsCount} Defect Instances
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  Across {negativeSpaceStats.entitiesAffected} CSE entity
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200/60 shrink-0 ml-2">
            5 Detectors (NS-01–05)
          </span>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Silent Critical Infrastructure Assets (&gt;10 Days Silence)</h3>
            <p className="text-xs text-[#64748B]">High-criticality Purdue L1/L2 assets generating zero alerts or security telemetry</p>
          </div>
          <span className="text-xs font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200/60 px-3 py-1 rounded-full self-start sm:self-auto">
            {silentAssets.length} Inactive Assets Detected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0] font-semibold">
              <tr>
                <th className="py-3 px-5 whitespace-nowrap">Asset ID</th>
                <th className="py-3 px-5 whitespace-nowrap">Asset Name</th>
                <th className="py-3 px-5 whitespace-nowrap">Entity</th>
                <th className="py-3 px-5 whitespace-nowrap">Purdue / OT Architecture</th>
                <th className="py-3 px-5 whitespace-nowrap">Statutory Criticality</th>
                <th className="py-3 px-5 whitespace-nowrap">Expected Telemetry Rate</th>
                <th className="py-3 px-5 whitespace-nowrap">Days Inactive</th>
                <th className="py-3 px-5 whitespace-nowrap">Supervisory Status</th>
                <th className="py-3 px-5 text-center whitespace-nowrap">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {silentAssets.map(ast => (
                <tr 
                  key={ast.id} 
                  onClick={() => setSelectedSilentAsset(ast)}
                  className="hover:bg-purple-50/50 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-5 font-mono font-bold text-[#334155] whitespace-nowrap">{ast.external_id}</td>
                  <td className="py-3.5 px-5 font-bold text-[#0F172A] group-hover:text-purple-950 transition-colors whitespace-nowrap">{ast.name}</td>
                  <td className="py-3.5 px-5 text-[#334155] whitespace-nowrap font-mono">{ast.entityCode}</td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono whitespace-nowrap inline-block">
                      {ast.type || 'Purdue L1 SCADA RTU'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span className="inline-flex items-center space-x-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px] font-extrabold whitespace-nowrap">
                      <span>Tier 1 (Mission Critical)</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold whitespace-nowrap">
                      {ast.expectedTelemetryRate || 'Continuous (<5m Heartbeat)'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-extrabold text-[#DC2626] text-sm font-mono whitespace-nowrap">
                    {ast.daysSilent} Days
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span className="bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap">
                      MONITORING BLINDSPOT
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSilentAsset(ast);
                      }}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-bold text-slate-700 hover:text-purple-700 bg-white hover:bg-purple-100/70 border border-slate-300 hover:border-purple-300 rounded-lg shadow-2xs transition group-hover:border-purple-300 whitespace-nowrap"
                      title="Inspect Detailed Forensic Dossier"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-600" />
                      <span>Detail</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
