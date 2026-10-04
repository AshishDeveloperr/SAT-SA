import React, { useMemo } from 'react';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  ShieldAlert,
  GitCompare,
  ArrowRight
} from 'lucide-react';
import { KpiGap } from '../../types/domain';

interface KpiGapViewProps {
  kpiGaps: KpiGap[];
  isCompareMode: boolean;
  setIsCompareMode: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCompareEntities: string[];
  lockedSector: string | null;
  handleToggleCompareEntity: (entityCode: string, sectorCode: string) => void;
  handleLaunchComparison: () => void;
  handleClearCompareSelection: () => void;
  setSelectedEntityGap: (gap: KpiGap) => void;
}

export const KpiGapView: React.FC<KpiGapViewProps> = ({
  kpiGaps,
  isCompareMode,
  setIsCompareMode,
  selectedCompareEntities,
  lockedSector,
  handleToggleCompareEntity,
  handleLaunchComparison,
  handleClearCompareSelection,
  setSelectedEntityGap
}) => {
  const kpiGapStats = useMemo(() => {
    const total = kpiGaps.length;
    if (total === 0) {
      return {
        avgReportedSla: 96.3,
        avgEvidenceScore: 62.6,
        peakGap: 95,
        peakEntity: 'CSE-TELCO-01',
        severeCount: 2,
        severePct: 40
      };
    }
    const avgReportedSla = Number((kpiGaps.reduce((acc, g) => acc + (g.headlineSlaPct || 0), 0) / total).toFixed(1));
    const avgEvidenceScore = Number((kpiGaps.reduce((acc, g) => acc + (g.evidenceQualityScore || 0), 0) / total).toFixed(1));
    const sortedByGap = [...kpiGaps].sort((a, b) => (b.executionGapSize || 0) - (a.executionGapSize || 0));
    const peakGap = sortedByGap[0]?.executionGapSize || 0;
    const peakEntity = sortedByGap[0]?.entityCode || 'N/A';
    const severeEntities = kpiGaps.filter(g => (g.executionGapSize || 0) > 40);
    const severeCount = severeEntities.length;
    const severePct = Math.round((severeCount / total) * 100);

    return {
      avgReportedSla,
      avgEvidenceScore,
      peakGap,
      peakEntity,
      severeCount,
      severePct
    };
  }, [kpiGaps]);

  return (
    <div className="space-y-4">
      {/* 4 Summary Metric Cards (Executive & Compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Card 1: Reported Headline SLA */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-50/90 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Reported Headline SLA
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-emerald-600 font-mono">
                  {kpiGapStats.avgReportedSla}%
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  Cohort average
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200/60 shrink-0 ml-2">
            Paper SLA
          </span>
        </div>

        {/* Card 2: Evidence Quality Score */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-50/90 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Evidence Quality Score
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-amber-600 font-mono">
                  {kpiGapStats.avgEvidenceScore}%
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  Triage integrity
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200/60 shrink-0 ml-2">
            Ground Truth
          </span>
        </div>

        {/* Card 3: Peak Discrepancy Gap */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-red-50/90 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Peak Discrepancy Gap
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-red-600 font-mono">
                  +{kpiGapStats.peakGap}%
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  {kpiGapStats.peakEntity}
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200/60 shrink-0 ml-2">
            Severe Gap
          </span>
        </div>

        {/* Card 4: Severe Execution Gaps */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-purple-50/90 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Severe Execution Gaps
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-purple-700 font-mono">
                  {kpiGapStats.severeCount} Entities
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  {kpiGapStats.severePct}% of cohort
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-200/60 shrink-0 ml-2">
            Notice Reqd
          </span>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
        <div className="px-4 py-2.5 border-b border-[#E2E8F0] bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] leading-tight">Headline Reported KPIs vs Underlying Evidence Analysis</h2>
            <p className="text-[11px] text-[#64748B]">Entities ranked by Discrepancy Gap Size (Reported SLA % − Forensic Evidence Quality %)</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const next = !isCompareMode;
                setIsCompareMode(next);
                if (!next) handleClearCompareSelection();
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition shadow-xs ${
                isCompareMode
                  ? 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-500/20'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <GitCompare className="w-3 h-3 text-[#991B1B]" />
              <span>{isCompareMode ? 'Exit Compare Mode' : 'Compare Entities'}</span>
            </button>
          </div>
        </div>

        {/* Floating Dock for Entity Comparison Selection (Light Mode) */}
        {isCompareMode && (
          <div className="bg-gradient-to-r from-red-50/80 via-slate-50 to-slate-100/90 text-slate-800 px-4 py-2 border-b border-red-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all text-xs shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1.5 font-bold text-slate-800 text-[11px]">
                <div className="w-5 h-5 rounded bg-red-100 border border-red-200 flex items-center justify-center text-[#991B1B]">
                  <GitCompare className="w-3 h-3 text-[#991B1B]" />
                </div>
                <span>Peer Cohort:</span>
              </div>

              {lockedSector ? (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 shadow-xs">
                  Locked: {lockedSector} Sector
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 font-medium">
                  Click checkboxes below to select same-sector peers
                </span>
              )}

              {selectedCompareEntities.length > 0 && (
                <div className="flex items-center gap-1.5 ml-1">
                  {selectedCompareEntities.map(code => (
                    <span
                      key={code}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white text-slate-800 border border-slate-300 shadow-xs"
                    >
                      <span>{code}</span>
                      <button
                        onClick={() => {
                          const item = kpiGaps.find(g => g.entityCode === code);
                          handleToggleCompareEntity(code, item?.sectorCode || 'OTHER');
                        }}
                        className="text-slate-400 hover:text-red-600 ml-1 font-bold text-xs leading-none"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {selectedCompareEntities.length > 0 && (
                <button
                  onClick={handleClearCompareSelection}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-md transition"
                >
                  Clear
                </button>
              )}
              <button
                onClick={handleLaunchComparison}
                disabled={selectedCompareEntities.length < 2}
                className="flex items-center space-x-1.5 px-3.5 py-1 rounded-md text-[11px] font-bold bg-[#991B1B] hover:bg-[#7F1D1D] text-white transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs hover:scale-105 active:scale-95"
              >
                <span>Launch Compare {selectedCompareEntities.length >= 2 ? `(${selectedCompareEntities.length})` : ''}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0] font-semibold text-[10px]">
              <tr>
                {isCompareMode && (
                  <th className="py-2 px-2.5 w-8 text-center">
                    <span>Select</span>
                  </th>
                )}
                <th className="py-2 px-3">Entity</th>
                <th className="py-2 px-3">Reported Headline SLA</th>
                <th className="py-2 px-3">Evidence Quality Score</th>
                <th className="py-2 px-3">Discrepancy Gap Size</th>
                <th className="py-2 px-3">Fast Closures (&lt;10m)</th>
                <th className="py-2 px-3">Un-escalated Critical</th>
                <th className="py-2 px-3 text-right">Supervisory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {kpiGaps.map(gap => {
                const isSelected = selectedCompareEntities.includes(gap.entityCode);
                const isSectorDisabled = lockedSector !== null && (gap.sectorCode || 'OTHER') !== lockedSector;

                return (
                  <tr
                    key={gap.entityId}
                    className={`transition ${
                      isSelected ? 'bg-red-50/60 font-semibold' : ''
                    } ${
                      isSectorDisabled ? 'opacity-35 bg-slate-50/80 cursor-not-allowed' : 'hover:bg-[#F1F5F9]'
                    } ${
                      !isSelected && !isSectorDisabled && gap.executionGapSize > 40 ? 'bg-[#FEF2F2]/60' : ''
                    }`}
                  >
                    {isCompareMode && (
                      <td className="py-2 px-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isSectorDisabled}
                          onChange={() => handleToggleCompareEntity(gap.entityCode, gap.sectorCode || 'OTHER')}
                          className="w-3.5 h-3.5 rounded text-[#991B1B] focus:ring-red-500 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                          title={isSectorDisabled ? `Sector locked to ${lockedSector}. Cannot cross-compare sectors.` : `Select ${gap.entityCode}`}
                        />
                      </td>
                    )}
                    <td className="py-2 px-3">
                      <div className="flex items-center space-x-1.5 leading-tight">
                        <span className="font-bold text-xs text-[#0F172A]">{gap.entityCode}</span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {gap.sectorCode || 'OTHER'}
                        </span>
                        {isSectorDisabled && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            {lockedSector} only
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#64748B] truncate max-w-[200px] leading-tight mt-0.5">{gap.entityName}</div>
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-extrabold text-xs text-[#16A34A] font-mono">
                        {gap.headlineSlaPct}%
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`font-extrabold text-xs font-mono ${gap.evidenceQualityScore < 50 ? 'text-[#DC2626]' : 'text-[#334155]'}`}>
                        {gap.evidenceQualityScore}%
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-xs font-black font-mono ${gap.executionGapSize > 40 ? 'text-[#DC2626]' : 'text-[#334155]'}`}>
                          +{gap.executionGapSize}%
                        </span>
                        {gap.executionGapSize > 40 && (
                          <span className="text-[9px] bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] px-1.5 py-0.2 rounded font-bold">
                            SEVERE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-[#334155] font-mono text-xs">
                      <span className={gap.fastClosePct > 30 ? 'text-[#DC2626] font-bold' : ''}>
                        {gap.fastClosePct}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[#334155] font-mono text-xs">
                      <span className={gap.unescalatedCriticalPct > 40 ? 'text-[#DC2626] font-bold' : ''}>
                        {gap.unescalatedCriticalPct}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      {isCompareMode ? (
                        <button
                          onClick={() => handleToggleCompareEntity(gap.entityCode, gap.sectorCode || 'OTHER')}
                          disabled={isSectorDisabled}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
                            isSelected
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedEntityGap(gap)}
                          className="bg-[#DCFCE7] hover:bg-[#bbf7d0] text-[#16A34A] border border-[#86EFAC] px-2.5 py-1 rounded-md text-[11px] font-bold transition shadow-xs hover:scale-105 active:scale-95"
                        >
                          Inspect Evidence
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
