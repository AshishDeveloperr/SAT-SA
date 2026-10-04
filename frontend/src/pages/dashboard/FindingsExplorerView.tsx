import React, { useMemo } from 'react';
import {
  FileText,
  ShieldAlert,
  Building2,
  Scale,
  Search,
  X,
  Filter,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Terminal,
  AlertTriangle,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { Finding, Entity } from '../../types/domain';
import { getPageNumbers } from '../../utils/pagination';

interface FindingsExplorerViewProps {
  findings: Finding[];
  entities: Entity[];
  findingSearchQuery: string;
  setFindingSearchQuery: (query: string) => void;
  findingEntityFilter: string;
  setFindingEntityFilter: (filter: string) => void;
  findingDimensionFilter: string;
  setFindingDimensionFilter: (filter: string) => void;
  findingSeverityFilter: string;
  setFindingSeverityFilter: (filter: string) => void;
  findingCurrentPage: number;
  setFindingCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  findingPageSize: number;
  setFindingPageSize: (size: number) => void;
  findingGroupPageSize: number;
  setFindingGroupPageSize: (size: number) => void;
  findingDimensionPageSize: number;
  setFindingDimensionPageSize: (size: number) => void;
  findingGroupBy: 'entity' | 'dimension' | 'none';
  setFindingGroupBy: (mode: 'entity' | 'dimension' | 'none') => void;
  findingFlatViewMode: 'table' | 'cards';
  setFindingFlatViewMode: (mode: 'table' | 'cards') => void;
  collapsedGroups: Record<string, boolean>;
  toggleGroupCollapse: (key: string) => void;
  expandedGroupFindings: Record<string, boolean>;
  setExpandedGroupFindings: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setInspectingFinding: (finding: Finding) => void;
}

export const FindingsExplorerView: React.FC<FindingsExplorerViewProps> = ({
  findings,
  entities,
  findingSearchQuery,
  setFindingSearchQuery,
  findingEntityFilter,
  setFindingEntityFilter,
  findingDimensionFilter,
  setFindingDimensionFilter,
  findingSeverityFilter,
  setFindingSeverityFilter,
  findingCurrentPage,
  setFindingCurrentPage,
  findingPageSize,
  setFindingPageSize,
  findingGroupPageSize,
  setFindingGroupPageSize,
  findingDimensionPageSize,
  setFindingDimensionPageSize,
  findingGroupBy,
  setFindingGroupBy,
  findingFlatViewMode,
  setFindingFlatViewMode,
  collapsedGroups,
  toggleGroupCollapse,
  expandedGroupFindings,
  setExpandedGroupFindings,
  setInspectingFinding
}) => {
  // 4 Metric cards stats for Findings Explorer
  const findingsStats = useMemo(() => {
    const total = findings.length;
    const critical = findings.filter(f => f.severity_score >= 80).length;
    const entitiesAffected = new Set(findings.map(f => f.entity_code)).size;
    const avgSeverity = total > 0 ? Math.round(findings.reduce((acc, f) => acc + f.severity_score, 0) / total) : 0;
    
    // Dominant dimension
    const dimCounts: Record<string, number> = {};
    findings.forEach(f => {
      dimCounts[f.dimension_code] = (dimCounts[f.dimension_code] || 0) + 1;
    });
    const dominantDim = Object.entries(dimCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'IncidentResponse';

    return { total, critical, entitiesAffected, avgSeverity, dominantDim };
  }, [findings]);

  // Unique entities for filter dropdown
  const findingEntitiesList = useMemo(() => {
    return Array.from(new Set(findings.map(f => f.entity_code))).filter(Boolean).sort();
  }, [findings]);

  // Unique dimensions for filter dropdown
  const findingDimensionsList = useMemo(() => {
    return Array.from(new Set(findings.map(f => f.dimension_code))).filter(Boolean).sort();
  }, [findings]);

  // Filtered findings based on search and dropdowns
  const filteredFindings = useMemo(() => {
    return findings.filter(f => {
      if (findingSearchQuery.trim()) {
        const q = findingSearchQuery.toLowerCase().trim();
        const matchesQuery = 
          f.title?.toLowerCase().includes(q) ||
          f.rationale?.toLowerCase().includes(q) ||
          f.rule_key?.toLowerCase().includes(q) ||
          f.entity_code?.toLowerCase().includes(q) ||
          f.dimension_code?.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (findingEntityFilter !== 'ALL' && f.entity_code !== findingEntityFilter) {
        return false;
      }

      if (findingDimensionFilter !== 'ALL' && f.dimension_code !== findingDimensionFilter) {
        return false;
      }

      if (findingSeverityFilter === 'CRITICAL' && f.severity_score < 80) return false;
      if (findingSeverityFilter === 'ELEVATED' && (f.severity_score < 50 || f.severity_score >= 80)) return false;
      if (findingSeverityFilter === 'MODERATE' && f.severity_score >= 50) return false;

      return true;
    });
  }, [findings, findingSearchQuery, findingEntityFilter, findingDimensionFilter, findingSeverityFilter]);

  // Flat findings pagination
  const totalFlatPages = Math.max(1, Math.ceil(filteredFindings.length / findingPageSize));
  const safeFlatPage = Math.min(findingCurrentPage, totalFlatPages);
  const paginatedFindings = useMemo(() => {
    const start = (safeFlatPage - 1) * findingPageSize;
    return filteredFindings.slice(start, start + findingPageSize);
  }, [filteredFindings, safeFlatPage, findingPageSize]);

  // Grouped findings by Entity (CSE)
  const groupedFindingsByEntity = useMemo(() => {
    const map: Record<string, { entityCode: string; entityName: string; sector: string; findings: Finding[] }> = {};
    filteredFindings.forEach(f => {
      const code = f.entity_code || 'OTHER';
      if (!map[code]) {
        const ent = entities.find(e => e.code === code);
        map[code] = {
          entityCode: code,
          entityName: f.entity_name || ent?.name || code,
          sector: ent?.sector_name || 'CRITICAL INFRASTRUCTURE',
          findings: []
        };
      }
      map[code].findings.push(f);
    });
    return Object.values(map);
  }, [filteredFindings, entities]);

  const totalEntityPages = Math.max(1, Math.ceil(groupedFindingsByEntity.length / findingGroupPageSize));
  const safeEntityPage = Math.min(findingCurrentPage, totalEntityPages);
  const paginatedGroupedFindingsByEntity = useMemo(() => {
    const start = (safeEntityPage - 1) * findingGroupPageSize;
    return groupedFindingsByEntity.slice(start, start + findingGroupPageSize);
  }, [groupedFindingsByEntity, safeEntityPage, findingGroupPageSize]);

  // Grouped findings by Dimension
  const groupedFindingsByDimension = useMemo(() => {
    const map: Record<string, { dimensionCode: string; findings: Finding[] }> = {};
    filteredFindings.forEach(f => {
      const dim = f.dimension_code || 'General';
      if (!map[dim]) {
        map[dim] = {
          dimensionCode: dim,
          findings: []
        };
      }
      map[dim].findings.push(f);
    });
    return Object.values(map);
  }, [filteredFindings]);

  const totalDimensionPages = Math.max(1, Math.ceil(groupedFindingsByDimension.length / findingDimensionPageSize));
  const safeDimensionPage = Math.min(findingCurrentPage, totalDimensionPages);
  const paginatedGroupedFindingsByDimension = useMemo(() => {
    const start = (safeDimensionPage - 1) * findingDimensionPageSize;
    return groupedFindingsByDimension.slice(start, start + findingDimensionPageSize);
  }, [groupedFindingsByDimension, safeDimensionPage, findingDimensionPageSize]);

  // Active pagination metadata based on findingGroupBy
  const activeFindingTotalPages = findingGroupBy === 'entity'
    ? totalEntityPages
    : findingGroupBy === 'dimension'
    ? totalDimensionPages
    : totalFlatPages;

  const activeFindingCurrentPage = findingGroupBy === 'entity'
    ? safeEntityPage
    : findingGroupBy === 'dimension'
    ? safeDimensionPage
    : safeFlatPage;

  return (
    <div className="space-y-5">
      {/* 4 Summary Metric Cards (Elegant & Compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Card 1: Total Findings */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-50/90 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Total Findings
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-slate-900 font-mono">
                  {findingsStats.total}
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  Validated records
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200/60 shrink-0 ml-2">
            {findingsStats.total}
          </span>
        </div>

        {/* Card 2: Critical Severity */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-red-50/90 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Critical Severity (&ge;80)
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-red-600 font-mono">
                  {findingsStats.critical}
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  Immediate focus
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200/60 shrink-0 ml-2">
            {findingsStats.critical}
          </span>
        </div>

        {/* Card 3: Implicated Entities */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-50/90 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Implicated Entities
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-amber-600 font-mono">
                  {findingsStats.entitiesAffected}
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  CSEs affected
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200/60 shrink-0 ml-2">
            {findingsStats.entitiesAffected} CSEs
          </span>
        </div>

        {/* Card 4: Mean Severity Score */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-50/90 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Mean Severity Index
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-slate-900 font-mono">
                  {findingsStats.avgSeverity}
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">
                  Dominant: {findingsStats.dominantDim}
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200/60 shrink-0 ml-2">
            {findingsStats.avgSeverity}/100
          </span>
        </div>
      </div>

      {/* Filter & Search Controls Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={findingSearchQuery}
              onChange={(e) => { setFindingSearchQuery(e.target.value); setFindingCurrentPage(1); }}
              placeholder="Search findings by rule (e.g. EG-01), keyword, entity code, or rationale..."
              className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition text-slate-800 placeholder:text-slate-400"
            />
            {findingSearchQuery && (
              <button
                onClick={() => { setFindingSearchQuery(''); setFindingCurrentPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Selectors Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Entity Filter */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={findingEntityFilter}
                onChange={(e) => { setFindingEntityFilter(e.target.value); setFindingCurrentPage(1); }}
                className="text-xs font-semibold bg-transparent text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Entities ({findingEntitiesList.length})</option>
                {findingEntitiesList.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            {/* Dimension Filter */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={findingDimensionFilter}
                onChange={(e) => { setFindingDimensionFilter(e.target.value); setFindingCurrentPage(1); }}
                className="text-xs font-semibold bg-transparent text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Dimensions ({findingDimensionsList.length})</option>
                {findingDimensionsList.map(dim => (
                  <option key={dim} value={dim}>{dim}</option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={findingSeverityFilter}
                onChange={(e) => { setFindingSeverityFilter(e.target.value); setFindingCurrentPage(1); }}
                className="text-xs font-semibold bg-transparent text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical (&ge;80)</option>
                <option value="ELEVATED">Elevated (50–79)</option>
                <option value="MODERATE">Moderate (&lt;50)</option>
              </select>
            </div>

            {/* Page Size Selector (Available in all modes) */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">Per page:</span>
              {findingGroupBy === 'none' && (
                <select
                  value={findingPageSize}
                  onChange={(e) => { setFindingPageSize(Number(e.target.value)); setFindingCurrentPage(1); }}
                  className="text-xs font-bold bg-transparent text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value={5}>5 findings</option>
                  <option value={10}>10 findings</option>
                  <option value={20}>20 findings</option>
                  <option value={50}>50 findings</option>
                </select>
              )}
              {findingGroupBy === 'entity' && (
                <select
                  value={findingGroupPageSize}
                  onChange={(e) => { setFindingGroupPageSize(Number(e.target.value)); setFindingCurrentPage(1); }}
                  className="text-xs font-bold bg-transparent text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value={2}>2 entities</option>
                  <option value={4}>4 entities</option>
                  <option value={6}>6 entities</option>
                  <option value={10}>10 entities</option>
                </select>
              )}
              {findingGroupBy === 'dimension' && (
                <select
                  value={findingDimensionPageSize}
                  onChange={(e) => { setFindingDimensionPageSize(Number(e.target.value)); setFindingCurrentPage(1); }}
                  className="text-xs font-bold bg-transparent text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value={2}>2 dimensions</option>
                  <option value={4}>4 dimensions</option>
                  <option value={8}>8 dimensions</option>
                </select>
              )}
            </div>

            {/* Clear Filters Button if any active */}
            {(findingSearchQuery || findingEntityFilter !== 'ALL' || findingDimensionFilter !== 'ALL' || findingSeverityFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setFindingSearchQuery('');
                  setFindingEntityFilter('ALL');
                  setFindingDimensionFilter('ALL');
                  setFindingSeverityFilter('ALL');
                  setFindingCurrentPage(1);
                }}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span className="font-medium">
            Showing <strong className="text-slate-800 font-bold">{filteredFindings.length}</strong> of <strong className="text-slate-800 font-bold">{findings.length}</strong> supervisory findings across <strong className="text-slate-800 font-bold">{groupedFindingsByEntity.length}</strong> entity groups
          </span>
          <span className="text-[11px] text-slate-600 font-mono font-medium">
            Page <strong className="text-slate-900 font-bold">{safeEntityPage}</strong> of <strong className="text-slate-900 font-bold">{totalEntityPages}</strong>
          </span>
        </div>
      </div>

      {/* Grouped by Entity View */}
      {findingGroupBy === 'entity' && (
        <div className="space-y-4">
          {paginatedGroupedFindingsByEntity.length > 0 ? (
            paginatedGroupedFindingsByEntity.map(grp => {
              const isOpen = Boolean(collapsedGroups[grp.entityCode]);
              const isExpanded = expandedGroupFindings[grp.entityCode];
              const findingsToShow = isExpanded ? grp.findings : grp.findings.slice(0, 5);
              const hasMore = grp.findings.length > 5;

              return (
                <div key={grp.entityCode} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden transition hover:border-slate-300">
                  {/* Entity Group Header Banner */}
                  <div 
                    onClick={() => toggleGroupCollapse(grp.entityCode)}
                    className={`bg-slate-50/90 hover:bg-slate-100/90 px-5 py-3.5 flex items-center justify-between cursor-pointer transition select-none ${isOpen ? 'border-b border-[#E2E8F0]' : ''}`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-sm text-[#0F172A] font-mono tracking-tight">
                            {grp.entityCode}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                            {grp.sector}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          {grp.entityName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200/60 flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        <span>{grp.findings.length} {grp.findings.length === 1 ? 'Finding' : 'Findings'}</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
                    </div>
                  </div>

                  {/* Findings Cards Inside Entity Group */}
                  {isOpen && (
                    <div className="p-4 space-y-3 bg-slate-50/30">
                      {findingsToShow.map(f => (
                        <div 
                          key={f.id}
                          onClick={() => setInspectingFinding(f)}
                          className="bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] p-5 rounded-2xl cursor-pointer transition shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="space-y-1.5 flex-1 pr-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono font-bold bg-[#0F172A] text-white px-2.5 py-0.5 rounded-md shadow-xs">
                                {f.rule_key}
                              </span>
                              <span className="text-xs font-bold text-[#334155] bg-[#F1F5F9] border border-[#CBD5E1] px-2 py-0.5 rounded-md">
                                {f.entity_code}
                              </span>
                              <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                                {f.dimension_code}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-red-700 transition-colors">
                              {f.title}
                            </h3>
                            <p className="text-xs text-[#334155] line-clamp-2 leading-relaxed">{f.rationale}</p>
                          </div>

                          <div className="flex items-center space-x-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                            <div className="text-right">
                              <div className="text-xs text-[#64748B] font-medium">Severity</div>
                              <div className={`text-base font-extrabold font-mono ${f.severity_score >= 80 ? 'text-[#DC2626]' : 'text-[#D97706]'}`}>
                                {f.severity_score} / 100
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectingFinding(f);
                              }}
                              className="flex items-center space-x-1.5 text-xs font-bold bg-[#991B1B] hover:bg-[#7F1D1D] active:scale-[0.98] text-white px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition"
                            >
                              <Terminal className="w-3.5 h-3.5 text-red-200" />
                              <span>Inspect Reference Logs</span>
                              <ChevronRight className="w-3.5 h-3.5 text-red-200" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Show More / Show Less Toggle Button */}
                      {hasMore && (
                        <button
                          type="button"
                          onClick={() => setExpandedGroupFindings(prev => ({ ...prev, [grp.entityCode]: !prev[grp.entityCode] }))}
                          className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center justify-center space-x-1.5 shadow-2xs"
                        >
                          <span>{isExpanded ? 'Show less (first 5 findings)' : `View all ${grp.findings.length} findings (+${grp.findings.length - 5} more)`}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center shadow-xs">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No findings match your filter criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting the search keyword or resetting filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Grouped by Dimension View */}
      {findingGroupBy === 'dimension' && (
        <div className="space-y-4">
          {paginatedGroupedFindingsByDimension.length > 0 ? (
            paginatedGroupedFindingsByDimension.map(grp => {
              const isOpen = Boolean(collapsedGroups[grp.dimensionCode]);
              const isExpanded = expandedGroupFindings[grp.dimensionCode];
              const findingsToShow = isExpanded ? grp.findings : grp.findings.slice(0, 5);
              const hasMore = grp.findings.length > 5;

              return (
                <div key={grp.dimensionCode} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden transition hover:border-slate-300">
                  {/* Dimension Header Banner */}
                  <div 
                    onClick={() => toggleGroupCollapse(grp.dimensionCode)}
                    className={`bg-slate-50/90 hover:bg-slate-100/90 px-5 py-3.5 flex items-center justify-between cursor-pointer transition select-none ${isOpen ? 'border-b border-[#E2E8F0]' : ''}`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
                        <Layers className="w-4 h-4 text-blue-300" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-sm text-[#0F172A] font-mono tracking-tight">
                          {grp.dimensionCode}
                        </span>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          NCIIPC Core Operational Capability Dimension
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span>{grp.findings.length} {grp.findings.length === 1 ? 'Finding' : 'Findings'}</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
                    </div>
                  </div>

                  {/* Findings Cards Inside Dimension Group */}
                  {isOpen && (
                    <div className="p-4 space-y-3 bg-slate-50/30">
                      {findingsToShow.map(f => (
                        <div 
                          key={f.id}
                          onClick={() => setInspectingFinding(f)}
                          className="bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] p-5 rounded-2xl cursor-pointer transition shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="space-y-1.5 flex-1 pr-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono font-bold bg-[#0F172A] text-white px-2.5 py-0.5 rounded-md shadow-xs">
                                {f.rule_key}
                              </span>
                              <span className="text-xs font-bold text-[#334155] bg-[#F1F5F9] border border-[#CBD5E1] px-2 py-0.5 rounded-md">
                                {f.entity_code}
                              </span>
                              <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                                {f.dimension_code}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-red-700 transition-colors">
                              {f.title}
                            </h3>
                            <p className="text-xs text-[#334155] line-clamp-2 leading-relaxed">{f.rationale}</p>
                          </div>

                          <div className="flex items-center space-x-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                            <div className="text-right">
                              <div className="text-xs text-[#64748B] font-medium">Severity</div>
                              <div className={`text-base font-extrabold font-mono ${f.severity_score >= 80 ? 'text-[#DC2626]' : 'text-[#D97706]'}`}>
                                {f.severity_score} / 100
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectingFinding(f);
                              }}
                              className="flex items-center space-x-1.5 text-xs font-bold bg-[#991B1B] hover:bg-[#7F1D1D] active:scale-[0.98] text-white px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition"
                            >
                              <Terminal className="w-3.5 h-3.5 text-red-200" />
                              <span>Inspect Reference Logs</span>
                              <ChevronRight className="w-3.5 h-3.5 text-red-200" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Show More / Show Less Toggle Button */}
                      {hasMore && (
                        <button
                          type="button"
                          onClick={() => setExpandedGroupFindings(prev => ({ ...prev, [grp.dimensionCode]: !prev[grp.dimensionCode] }))}
                          className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center justify-center space-x-1.5 shadow-2xs"
                        >
                          <span>{isExpanded ? 'Show less (first 5 findings)' : `View all ${grp.findings.length} findings (+${grp.findings.length - 5} more)`}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center shadow-xs">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No findings match your filter criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting the search keyword or resetting filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Flat Paginated Findings View (Table or Cards) */}
      {findingGroupBy === 'none' && (
        <>
          {paginatedFindings.length > 0 ? (
            findingFlatViewMode === 'table' ? (
              /* Flat Table View */
              <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0] font-semibold">
                      <tr>
                        <th className="py-3 px-4">Rule Key</th>
                        <th className="py-3 px-4">Entity</th>
                        <th className="py-3 px-4">Dimension</th>
                        <th className="py-3 px-4">Title & Context</th>
                        <th className="py-3 px-4 text-center">Severity</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedFindings.map(f => (
                        <tr
                          key={f.id}
                          onClick={() => setInspectingFinding(f)}
                          className="hover:bg-slate-50/80 cursor-pointer transition"
                        >
                          <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                            <span className="bg-[#0F172A] text-white px-2 py-0.5 rounded text-[11px] shadow-2xs font-mono font-bold">
                              {f.rule_key}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-bold text-slate-900">{f.entity_code}</span>
                            <span className="text-[11px] text-slate-400 block truncate max-w-[130px]">{f.entity_name}</span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                              {f.dimension_code}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-md">
                            <div className="font-bold text-slate-900 truncate hover:text-red-700 transition">{f.title}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{f.rationale}</div>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-extrabold ${f.severity_score >= 80 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                              {f.severity_score} / 100
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectingFinding(f);
                              }}
                              className="inline-flex items-center space-x-1 text-xs font-bold text-slate-700 hover:text-white bg-slate-100 hover:bg-[#0F172A] px-2.5 py-1.5 rounded-lg transition shadow-2xs"
                            >
                              <Terminal className="w-3 h-3 text-slate-500" />
                              <span>Inspect Logs</span>
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Flat Cards View */
              <div className="grid grid-cols-1 gap-3.5">
                {paginatedFindings.map(f => (
                  <div 
                    key={f.id}
                    onClick={() => setInspectingFinding(f)}
                    className="bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] p-5 rounded-2xl cursor-pointer transition shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="space-y-1.5 flex-1 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold bg-[#0F172A] text-white px-2.5 py-0.5 rounded-md shadow-xs">
                          {f.rule_key}
                        </span>
                        <span className="text-xs font-bold text-[#334155] bg-[#F1F5F9] border border-[#CBD5E1] px-2 py-0.5 rounded-md">
                          {f.entity_code}
                        </span>
                        <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                          {f.dimension_code}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-red-700 transition-colors">
                        {f.title}
                      </h3>
                      <p className="text-xs text-[#334155] line-clamp-2 leading-relaxed">{f.rationale}</p>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-right">
                        <div className="text-xs text-[#64748B] font-medium">Severity</div>
                        <div className={`text-base font-extrabold font-mono ${f.severity_score >= 80 ? 'text-[#DC2626]' : 'text-[#D97706]'}`}>
                          {f.severity_score} / 100
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingFinding(f);
                        }}
                        className="flex items-center space-x-1.5 text-xs font-bold bg-[#991B1B] hover:bg-[#7F1D1D] active:scale-[0.98] text-white px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition"
                      >
                        <Terminal className="w-3.5 h-3.5 text-red-200" />
                        <span>Inspect Reference Logs</span>
                        <ChevronRight className="w-3.5 h-3.5 text-red-200" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center shadow-xs">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No findings match your filter criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting the search keyword or resetting filters.</p>
              <button
                onClick={() => {
                  setFindingSearchQuery('');
                  setFindingEntityFilter('ALL');
                  setFindingDimensionFilter('ALL');
                  setFindingSeverityFilter('ALL');
                  setFindingCurrentPage(1);
                }}
                className="mt-3 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#111827] text-white hover:bg-black transition shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </>
      )}

      {/* Unified Pagination Controls Bar for all modes */}
      {activeFindingTotalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#E2E8F0] px-5 py-3.5 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-600 font-medium">
            {findingGroupBy === 'entity' && (
              <>
                Showing <strong className="text-slate-900 font-bold">{(activeFindingCurrentPage - 1) * findingGroupPageSize + 1}</strong> to <strong className="text-slate-900 font-bold">{Math.min(activeFindingCurrentPage * findingGroupPageSize, groupedFindingsByEntity.length)}</strong> of <strong className="text-slate-900 font-bold">{groupedFindingsByEntity.length}</strong> entity clusters
              </>
            )}
            {findingGroupBy === 'dimension' && (
              <>
                Showing <strong className="text-slate-900 font-bold">{(activeFindingCurrentPage - 1) * findingDimensionPageSize + 1}</strong> to <strong className="text-slate-900 font-bold">{Math.min(activeFindingCurrentPage * findingDimensionPageSize, groupedFindingsByDimension.length)}</strong> of <strong className="text-slate-900 font-bold">{groupedFindingsByDimension.length}</strong> dimension clusters
              </>
            )}
            {findingGroupBy === 'none' && (
              <>
                Showing <strong className="text-slate-900 font-bold">{(activeFindingCurrentPage - 1) * findingPageSize + 1}</strong> to <strong className="text-slate-900 font-bold">{Math.min(activeFindingCurrentPage * findingPageSize, filteredFindings.length)}</strong> of <strong className="text-slate-900 font-bold">{filteredFindings.length}</strong> findings
              </>
            )}
          </span>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setFindingCurrentPage(1)}
              disabled={activeFindingCurrentPage === 1}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold border transition disabled:opacity-30 disabled:cursor-not-allowed bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              title="First Page"
            >
              First
            </button>

            <button
              type="button"
              onClick={() => setFindingCurrentPage(p => Math.max(1, p - 1))}
              disabled={activeFindingCurrentPage === 1}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition disabled:opacity-30 disabled:cursor-not-allowed bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-1">
              {getPageNumbers(activeFindingCurrentPage, activeFindingTotalPages).map((pageNum, idx) => {
                if (pageNum === '...') {
                  return (
                    <span key={`ell-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs text-slate-400">
                      ...
                    </span>
                  );
                }
                const num = Number(pageNum);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFindingCurrentPage(num)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                      activeFindingCurrentPage === num
                        ? 'bg-[#111827] text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setFindingCurrentPage(p => Math.min(activeFindingTotalPages, p + 1))}
              disabled={activeFindingCurrentPage === activeFindingTotalPages}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition disabled:opacity-30 disabled:cursor-not-allowed bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setFindingCurrentPage(activeFindingTotalPages)}
              disabled={activeFindingCurrentPage === activeFindingTotalPages}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold border transition disabled:opacity-30 disabled:cursor-not-allowed bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              title="Last Page"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
