import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Layers,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Search,
  X,
  Filter,
  RotateCcw,
  ChevronRight
} from 'lucide-react';
import { ReviewSample } from '../../types/domain';

interface ReviewQueueViewProps {
  reviewSamples: ReviewSample[];
  queueSearchQuery: string;
  setQueueSearchQuery: (query: string) => void;
  queueStrategyFilter: string;
  setQueueStrategyFilter: (filter: string) => void;
  queueStatusFilter: string;
  setQueueStatusFilter: (filter: string) => void;
  selectedQueueEntity: string | null;
  setSelectedQueueEntity: (entity: string | null) => void;
  openReviewModal: (sample: ReviewSample, decision: 'confirmed' | 'benign') => void;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  reviewSamples,
  queueSearchQuery,
  setQueueSearchQuery,
  queueStrategyFilter,
  setQueueStrategyFilter,
  queueStatusFilter,
  setQueueStatusFilter,
  selectedQueueEntity,
  setSelectedQueueEntity,
  openReviewModal
}) => {
  const filteredReviewSamples = useMemo(() => {
    return reviewSamples.filter(smp => {
      if (queueStrategyFilter !== 'ALL' && smp.strategy !== queueStrategyFilter) return false;
      if (queueStatusFilter === 'PENDING' && smp.reviewed) return false;
      if (queueStatusFilter === 'REVIEWED' && !smp.reviewed) return false;
      if (queueSearchQuery.trim()) {
        const q = queueSearchQuery.toLowerCase().trim();
        const matchesEntity = smp.entity_code?.toLowerCase().includes(q);
        const matchesRecord = smp.record_id?.toLowerCase().includes(q);
        const matchesReasons = Array.isArray(smp.reasons) && smp.reasons.some((r: string) => r.toLowerCase().includes(q));
        if (!matchesEntity && !matchesRecord && !matchesReasons) return false;
      }
      return true;
    });
  }, [reviewSamples, queueStrategyFilter, queueStatusFilter, queueSearchQuery]);

  const queueStats = {
    total: reviewSamples.length,
    entitiesRepresented: new Set(reviewSamples.map(s => s.entity_code).filter(Boolean)).size,
    priorityCount: reviewSamples.filter(s => s.strategy === 'priority').length,
    explorationCount: reviewSamples.filter(s => s.strategy === 'exploration').length,
    reviewedCount: reviewSamples.filter(s => s.reviewed).length,
    pendingCount: reviewSamples.filter(s => !s.reviewed).length,
    confirmedGaps: reviewSamples.filter(s => s.reviewed && s.examiner_decision === 'confirmed').length,
    benignCount: reviewSamples.filter(s => s.reviewed && s.examiner_decision === 'benign').length,
    reviewProgressPct: reviewSamples.length > 0 ? Math.round((reviewSamples.filter(s => s.reviewed).length / reviewSamples.length) * 100) : 0
  };

  // Grouped review samples by entity
  const groupedQueueEntities = useMemo(() => {
    const map: Record<string, {
      entityCode: string;
      entityName: string;
      samples: ReviewSample[];
      priorityCount: number;
      explorationCount: number;
      pendingCount: number;
      reviewedCount: number;
      confirmedCount: number;
      benignCount: number;
    }> = {};

    filteredReviewSamples.forEach(smp => {
      const code = smp.entity_code || 'OTHER';
      if (!map[code]) {
        map[code] = {
          entityCode: code,
          entityName: smp.entity_name || code,
          samples: [],
          priorityCount: 0,
          explorationCount: 0,
          pendingCount: 0,
          reviewedCount: 0,
          confirmedCount: 0,
          benignCount: 0
        };
      }
      map[code].samples.push(smp);
      if (smp.strategy === 'priority') map[code].priorityCount += 1;
      if (smp.strategy === 'exploration') map[code].explorationCount += 1;
      if (smp.reviewed) {
        map[code].reviewedCount += 1;
        if (smp.examiner_decision === 'confirmed') map[code].confirmedCount += 1;
        if (smp.examiner_decision === 'benign') map[code].benignCount += 1;
      } else {
        map[code].pendingCount += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.pendingCount - a.pendingCount || b.samples.length - a.samples.length);
  }, [filteredReviewSamples]);

  // Active entity samples currently selected for the 60% drawer
  const activeEntityQueueGroup = useMemo(() => {
    if (!selectedQueueEntity) return null;
    return groupedQueueEntities.find(g => g.entityCode === selectedQueueEntity) || null;
  }, [groupedQueueEntities, selectedQueueEntity]);

  return (
    <div className="space-y-4">
      {/* 4 Summary Metric Cards (Executive & Compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Card 1: Sample Portfolio Allocation */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-50/90 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Portfolio Sampling
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-slate-900 font-mono">
                  {queueStats.total} Records
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  Across {queueStats.entitiesRepresented} entities
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 shrink-0 ml-2">
            Knapsack
          </span>
        </div>

        {/* Card 2: Priority Target Quota (85%) */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-red-50/90 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Priority Targets
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-red-600 font-mono">
                  {queueStats.priorityCount} Records
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  High-risk anomaly cluster
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200/60 shrink-0 ml-2">
            85% Budget
          </span>
        </div>

        {/* Card 3: Exploration Quota (15%) */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-50/90 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Exploration Quota
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-emerald-700 font-mono">
                  {queueStats.explorationCount} Records
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  Stratified baseline control
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0 ml-2">
            15% Quota
          </span>
        </div>

        {/* Card 4: Audit Clearance Status */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-50/90 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Review Clearance
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-amber-600 font-mono">
                  {queueStats.pendingCount} Pending
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  {queueStats.reviewedCount} reviewed ({queueStats.confirmedGaps} confirmed)
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0 ml-2">
            {queueStats.reviewProgressPct}% Done
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={queueSearchQuery}
              onChange={(e) => setQueueSearchQuery(e.target.value)}
              placeholder="Search by entity (e.g. CSE-TELCO-01), record ID, or reason..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
            />
            {queueSearchQuery && (
              <button 
                onClick={() => setQueueSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Selects */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500 uppercase">Strategy:</span>
              <select
                value={queueStrategyFilter}
                onChange={(e) => setQueueStrategyFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Strategies</option>
                <option value="priority">Priority Target (85%)</option>
                <option value="exploration">Exploration Quota (15%)</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500 uppercase">Status:</span>
              <select
                value={queueStatusFilter}
                onChange={(e) => setQueueStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Records</option>
                <option value="PENDING">Pending Review</option>
                <option value="REVIEWED">Reviewed</option>
              </select>
            </div>

            {(queueSearchQuery || queueStrategyFilter !== 'ALL' || queueStatusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setQueueSearchQuery('');
                  setQueueStrategyFilter('ALL');
                  setQueueStatusFilter('ALL');
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                title="Reset Filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grouped Entity Cards */}
      <div className="space-y-3">
        {groupedQueueEntities.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] p-10 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No review records matched the selected criteria.</p>
            <p className="text-xs text-slate-500">Try clearing your search query or dropdown filters to view items in the queue.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {groupedQueueEntities.map(group => (
              <div 
                key={group.entityCode}
                onClick={() => setSelectedQueueEntity(group.entityCode)}
                className={`bg-white border rounded-2xl px-5 py-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group border-[#E2E8F0] hover:border-[#991B1B]/40 hover:bg-slate-50/50 ${
                  selectedQueueEntity === group.entityCode ? 'ring-2 ring-[#991B1B] border-[#991B1B] bg-red-50/20' : ''
                }`}
              >
                {/* Left: Entity Identification */}
                <div className="flex items-center space-x-3.5 min-w-0 md:w-5/12">
                  <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white tracking-wider shrink-0 shadow-2xs">
                    {group.entityCode}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#991B1B] transition leading-snug">
                      {group.entityName}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium truncate block">
                      Total Ingested: <strong className="text-slate-700">{group.samples.length} review records</strong>
                    </span>
                  </div>
                </div>

                {/* Center: Allocation Badges & Progress Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:w-5/12">
                  {/* Badges */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200/60 whitespace-nowrap">
                      {group.priorityCount} Priority (85%)
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 whitespace-nowrap">
                      {group.explorationCount} Quota (15%)
                    </span>
                  </div>

                  {/* Progress Meter */}
                  <div className="flex-1 min-w-[130px] space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span>Reviewed</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {group.reviewedCount}/{group.samples.length} ({Math.round((group.reviewedCount / group.samples.length) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-[#991B1B] h-full" 
                        style={{ width: `${(group.confirmedCount / group.samples.length) * 100}%` }}
                        title={`${group.confirmedCount} Defect Confirmed`}
                      />
                      <div 
                        className="bg-emerald-500 h-full" 
                        style={{ width: `${(group.benignCount / group.samples.length) * 100}%` }}
                        title={`${group.benignCount} Marked Safe`}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Status Pill & Action Arrow */}
                <div className="flex items-center justify-between md:justify-end space-x-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                    group.pendingCount > 0 
                      ? 'bg-amber-50 text-amber-800 border-amber-200' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{group.pendingCount} Pending</span>
                  </span>

                  <button 
                    type="button"
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#991B1B] group-hover:bg-[#991B1B] group-hover:text-white border border-[#991B1B]/30 transition shadow-2xs cursor-pointer whitespace-nowrap"
                  >
                    <span>Open Rows</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 60% SLIDE-OVER SIDEBAR: ENTITY REVIEW QUEUE ROWS */}
      {selectedQueueEntity && activeEntityQueueGroup && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 w-screen h-screen bg-slate-950/70 backdrop-blur-xs z-[9000] flex justify-end animate-in fade-in duration-200"
          onClick={() => setSelectedQueueEntity(null)}
        >
          <div 
            className="w-full sm:w-[85vw] md:w-[70vw] lg:w-[60vw] h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header (Theme Red) */}
            <div className="bg-[#991B1B] text-white p-5 border-b border-red-800/80 flex items-start justify-between shrink-0 shadow-md">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-black/30 text-white border border-white/20 tracking-wide">
                    {activeEntityQueueGroup.entityCode}
                  </span>
                  <span className="text-xs font-bold text-red-100">
                    {activeEntityQueueGroup.entityName}
                  </span>
                </div>
                <h2 className="text-base font-black tracking-tight text-white flex items-center space-x-2">
                  <span>Targeted Review Portfolio</span>
                  <span className="text-xs font-mono font-medium text-red-200">
                    ({activeEntityQueueGroup.samples.length} Records)
                  </span>
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-red-100 pt-1">
                  <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-black/25 border border-white/15 text-[11px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    <span>{activeEntityQueueGroup.priorityCount} Priority Targets</span>
                  </span>
                  <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-black/25 border border-white/15 text-[11px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                    <span>{activeEntityQueueGroup.explorationCount} Exploration Quota</span>
                  </span>
                  <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-600 text-white border border-amber-500 text-[11px] font-black tracking-wide shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    <span>{activeEntityQueueGroup.pendingCount} Pending</span>
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedQueueEntity(null)}
                className="text-red-200 hover:text-white p-1.5 rounded-xl hover:bg-black/20 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body - Scrollable list of rows */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/60">
              {activeEntityQueueGroup.samples.map((smp: any) => (
                <div 
                  key={smp.id}
                  className={`bg-white border rounded-2xl p-4 shadow-xs transition space-y-3 ${
                    smp.reviewed 
                      ? 'border-emerald-200 bg-emerald-50/20' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase font-mono ${
                        smp.strategy === 'priority' 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {smp.strategy === 'priority' ? 'Priority Target' : 'Exploration Quota'}
                      </span>
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {smp.record_id}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Score: <strong>{smp.priority_score || '92'}</strong>
                      </span>
                    </div>

                    {/* Action buttons or review badge */}
                    <div className="flex items-center space-x-2 shrink-0">
                      {!smp.reviewed ? (
                        <>
                          <button 
                            onClick={() => openReviewModal(smp, 'confirmed')}
                            className="text-xs bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold px-3 py-1.5 rounded-xl transition shadow-2xs cursor-pointer flex items-center space-x-1"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-white" />
                            <span>Confirm Defect</span>
                          </button>
                          <button 
                            onClick={() => openReviewModal(smp, 'benign')}
                            className="text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl font-bold transition shadow-2xs cursor-pointer flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mark Safe</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center space-x-1 ${
                            smp.examiner_decision === 'confirmed'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {smp.examiner_decision === 'confirmed' ? (
                              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            <span>{smp.examiner_decision === 'confirmed' ? 'Defect Confirmed' : 'Marked Safe'}</span>
                          </span>
                          <button 
                            onClick={() => openReviewModal(smp, smp.examiner_decision === 'confirmed' ? 'confirmed' : 'benign')}
                            className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Flagged reasons summary */}
                  <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <strong className="text-slate-900">Reasons Flagged:</strong> {smp.reasons?.join(', ')}
                  </div>

                  {/* Examiner remark if already reviewed */}
                  {smp.reviewed && smp.examiner_comment && (
                    <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 italic">
                      "{smp.examiner_comment}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 px-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Clicking either option opens the live raw evidence audit popup.
              </span>
              <button
                onClick={() => setSelectedQueueEntity(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
