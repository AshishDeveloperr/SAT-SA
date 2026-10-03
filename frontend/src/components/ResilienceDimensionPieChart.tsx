import React, { useState, useMemo } from 'react';
import { 
  PieChart as PieIcon, 
  Layers, 
  Compass, 
  Filter, 
  Info, 
  AlertTriangle
} from 'lucide-react';

interface Entity {
  id: string;
  code: string;
  name: string;
  sector_name: string;
  score: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  rank: number;
  percentile: number;
  contributing_findings: number;
  dimension_scores: Record<string, number>;
}

interface DimensionDef {
  key: string;
  label: string;
  description: string;
}

const DIMENSIONS: DimensionDef[] = [
  { 
    key: 'Detection', 
    label: 'Threat Detection', 
    description: 'Telemetry ingestion completeness, rule coverage, and dark-space detection latency'
  },
  { 
    key: 'Investigation', 
    label: 'Investigation', 
    description: 'Triage discipline, artifact collection, and forensic root-cause notes rigor'
  },
  { 
    key: 'Escalation', 
    label: 'Escalation', 
    description: 'Tier-1 to Tier-2 escalation latency and critical unescalated alert mitigation'
  },
  { 
    key: 'IncidentResponse', 
    label: 'Incident Response', 
    description: 'Containment SLA adherence, dynamic playbook execution, and breach mitigation'
  },
  { 
    key: 'SecOps', 
    label: 'SecOps', 
    description: '24/7 SOC staffing resilience, shift-handover integrity, and queue health'
  },
  { 
    key: 'Governance', 
    label: 'Governance', 
    description: 'Statutory compliance tracking, executive escalation, and policy enforcement'
  },
  { 
    key: 'Discipline', 
    label: 'Discipline', 
    description: 'Resistance to fast-close KPI gaming and unvalidated mass alert clearing'
  },
  { 
    key: 'Resilience', 
    label: 'Resilience', 
    description: 'Cyber resilience survivability, disaster recovery, and silent asset surveillance'
  }
];

// Light Strict Cyber Palette (Clean, Modern, Soft & High Readability)
const STRICT_PALETTE = {
  critical: '#F87171',    // Light Coral Red (>60)
  elevated: '#FB923C',    // Light Peach Orange (35-59)
  disciplined: '#34D399', // Light Mint Emerald (<35)
  
  // High-legibility text tones for badges and status labels
  criticalText: '#DC2626',   // High-contrast readable red
  elevatedText: '#EA580C',   // High-contrast readable orange
  disciplinedText: '#059669',// High-contrast readable emerald

  criticalTrack: 'rgba(248, 113, 113, 0.16)',
  elevatedTrack: 'rgba(251, 146, 60, 0.16)',
  disciplinedTrack: 'rgba(52, 211, 153, 0.16)'
};

interface ResilienceDimensionPieChartProps {
  entities: Entity[];
}

export function ResilienceDimensionPieChart({ entities }: ResilienceDimensionPieChartProps) {
  // Filters & Controls
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('ALL');
  const [chartType, setChartType] = useState<'donut' | 'pie' | 'polar'>('donut');
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);

  const activePalette = STRICT_PALETTE;

  // Available unique sectors
  const sectors = useMemo(() => {
    return Array.from(new Set(entities.map(e => e.sector_name).filter(Boolean)));
  }, [entities]);

  // Entities matching selected sector
  const filteredEntities = useMemo(() => {
    if (selectedSector === 'ALL') return entities;
    return entities.filter(e => e.sector_name === selectedSector);
  }, [entities, selectedSector]);

  // Active entities based on sector + entity filter
  const targetEntities = useMemo(() => {
    if (selectedEntityId === 'ALL') return filteredEntities;
    return filteredEntities.filter(e => e.id === selectedEntityId);
  }, [filteredEntities, selectedEntityId]);

  // Calculate aggregated dimension scores (0 to 100) & assign strict category colors
  const dimensionData = useMemo(() => {
    const totals: Record<string, number> = {};
    DIMENSIONS.forEach(d => { totals[d.key] = 0; });

    if (targetEntities.length > 0) {
      targetEntities.forEach(ent => {
        DIMENSIONS.forEach(d => {
          const val = ent.dimension_scores?.[d.key];
          const score = (val !== undefined && val > 0) ? val : 15;
          totals[d.key] += score;
        });
      });
    }

    const scores = DIMENSIONS.map(d => {
      const avgScore = targetEntities.length > 0 ? Math.round(totals[d.key] / targetEntities.length) : 15;

      const isCritical = avgScore >= 60;
      const isElevated = avgScore >= 35 && avgScore < 60;
      const isDisciplined = avgScore < 35;

      // Solid color matching active light palette
      const color = isCritical
        ? activePalette.critical
        : isElevated
          ? activePalette.elevated
          : activePalette.disciplined;

      const textColor = isCritical
        ? activePalette.criticalText
        : isElevated
          ? activePalette.elevatedText
          : activePalette.disciplinedText;

      const trackColor = isCritical
        ? activePalette.criticalTrack
        : isElevated
          ? activePalette.elevatedTrack
          : activePalette.disciplinedTrack;

      const statusLabel = isCritical ? 'Critical' : isElevated ? 'Elevated' : 'Disciplined';

      return {
        ...d,
        score: avgScore,
        color,
        textColor,
        trackColor,
        isCritical,
        isElevated,
        isDisciplined,
        statusLabel
      };
    });

    const sumScore = scores.reduce((sum, item) => sum + item.score, 0);

    return scores.map(item => ({
      ...item,
      sharePct: sumScore > 0 ? Number(((item.score / sumScore) * 100).toFixed(1)) : 12.5
    }));
  }, [targetEntities, activePalette]);

  // Overall average deficit metric
  const totalDeficitScore = useMemo(() => {
    if (dimensionData.length === 0) return 0;
    return Math.round(dimensionData.reduce((acc, d) => acc + d.score, 0) / dimensionData.length);
  }, [dimensionData]);

  // Count of critical capabilities (>60)
  const criticalCount = useMemo(() => {
    return dimensionData.filter(d => d.isCritical).length;
  }, [dimensionData]);

  // Count of elevated capabilities (35-59)
  const elevatedCount = useMemo(() => {
    return dimensionData.filter(d => d.isElevated).length;
  }, [dimensionData]);

  // Count of disciplined capabilities (<35)
  const disciplinedCount = useMemo(() => {
    return dimensionData.filter(d => d.isDisciplined).length;
  }, [dimensionData]);

  // Highest deficit dimension
  const maxDeficit = useMemo(() => {
    if (dimensionData.length === 0) return null;
    return [...dimensionData].sort((a, b) => b.score - a.score)[0];
  }, [dimensionData]);

  // Math for SVG Pie & Donut slices - Balanced, clean proportions
  const cx = 210;
  const cy = 210;
  const outerRadius = 165;
  const innerRadius = chartType === 'donut' ? 102 : 0;

  const totalShare = dimensionData.reduce((acc, d) => acc + d.score, 0);

  let currentAngle = -90; // Start at 12 o'clock
  const slices = dimensionData.map((d, index) => {
    const isHovered = hoveredDimension === d.key;

    if (chartType === 'polar') {
      const sliceAngle = 360 / DIMENSIONS.length;
      const startAngle = -90 + index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      const polarInner = 38;
      const polarMaxOuter = 165;
      const sliceRadius = polarInner + (Math.max(12, Math.min(100, d.score)) / 100) * (polarMaxOuter - polarInner);

      const path = createDonutArc(cx, cy, sliceRadius + (isHovered ? 6 : 0), polarInner, startAngle, endAngle);

      return {
        ...d,
        path,
        startAngle,
        endAngle,
        isHovered
      };
    }

    // Slice angle weighted strictly by capability deficit score
    const rawPct = totalShare > 0 ? d.score / totalShare : 1 / DIMENSIONS.length;
    const sliceAngle = rawPct * 360;

    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const rOut = outerRadius + (isHovered ? 6 : 0);
    const rIn = innerRadius;

    let path = '';
    if (chartType === 'donut') {
      path = createDonutArc(cx, cy, rOut, rIn, startAngle, endAngle);
    } else {
      path = createPieArc(cx, cy, rOut, startAngle, endAngle);
    }

    return {
      ...d,
      path,
      startAngle,
      endAngle,
      isHovered
    };
  });

  const activeDisplay = hoveredDimension 
    ? dimensionData.find(d => d.key === hoveredDimension) 
    : null;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] space-y-5">
      {/* ================= HEADER & CONTROLS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-[#0F172A]">
              8-Dimension Operational Resilience Capability Distribution
            </h2>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Institutional capability distribution with strict mathematical color linkage across chart, legend, and metric cards.
          </p>
        </div>

        {/* Action Controls: Chart Form */}
        <div className="flex items-center gap-2.5">
          {/* Chart Style Switcher */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setChartType('donut')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                chartType === 'donut' 
                  ? 'bg-white text-[#0F172A] shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Hollow ring with central telemetry HUD"
            >
              <PieIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Donut</span>
            </button>

            <button
              onClick={() => setChartType('pie')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                chartType === 'pie' 
                  ? 'bg-white text-[#0F172A] shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Solid circular pie"
            >
              <Layers className="w-3.5 h-3.5 text-slate-700" />
              <span>Pie</span>
            </button>

            <button
              onClick={() => setChartType('polar')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                chartType === 'polar' 
                  ? 'bg-white text-[#0F172A] shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Radial area chart where slice radius represents deficit severity"
            >
              <Compass className="w-3.5 h-3.5 text-rose-600" />
              <span>Polar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= SECTOR & ENTITY FILTER BAR ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Sector:</span>
          </div>

          <button
            onClick={() => { setSelectedSector('ALL'); setSelectedEntityId('ALL'); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              selectedSector === 'ALL'
                ? 'bg-[#111827] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Sectors (National)
          </button>

          {sectors.map(sec => {
            const isSelected = selectedSector === sec;
            const shortLabel = sec.replace('Infrastructure', '').replace(', Energy & Petroleum', '').trim();
            return (
              <button
                key={sec}
                onClick={() => { setSelectedSector(sec); setSelectedEntityId('ALL'); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition truncate max-w-[190px] ${
                  isSelected
                    ? 'bg-[#991B1B] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                title={sec}
              >
                {shortLabel}
              </button>
            );
          })}
        </div>

        {/* Entity Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-semibold">Entity:</span>
          <select
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 shadow-xs"
          >
            <option value="ALL">
              {selectedSector === 'ALL' ? 'Sector Average (All 5 CSEs)' : `Sector Average (${filteredEntities.length} CSE)`}
            </option>
            {filteredEntities.map(ent => (
              <option key={ent.id} value={ent.id}>
                {ent.code} ({ent.name.slice(0, 25)}...)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= MAIN SPLIT: CIRCULAR GRAPH + GRANULAR BREAKDOWN ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* LEFT: SVG CIRCULAR CHART (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-2 relative">
          <div className="relative w-[320px] h-[320px] sm:w-[350px] sm:h-[350px] xl:w-[370px] xl:h-[370px]">
            <svg 
              viewBox="0 0 420 420" 
              className="w-full h-full filter drop-shadow-md select-none transition-transform duration-300"
            >
              {/* Background circular guide rings */}
              <circle cx={cx} cy={cy} r={outerRadius} fill="none" stroke="#F1F5F9" strokeWidth="1" />
              {chartType === 'donut' && (
                <circle cx={cx} cy={cy} r={innerRadius} fill="none" stroke="#F1F5F9" strokeWidth="1" />
              )}
              {chartType === 'polar' && (
                <>
                  <circle cx={cx} cy={cy} r={75} fill="none" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <circle cx={cx} cy={cy} r={120} fill="none" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <circle cx={cx} cy={cy} r={165} fill="none" stroke="#CBD5E1" strokeWidth="1" />
                </>
              )}

              {/* Slices: Solid Colors only, exactly matching the 3 legend categories */}
              {slices.map((slice) => {
                const isHovered = slice.isHovered;
                return (
                  <g 
                    key={slice.key} 
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredDimension(slice.key)}
                    onMouseLeave={() => setHoveredDimension(null)}
                  >
                    <path
                      d={slice.path}
                      fill={slice.color}
                      stroke="#FFFFFF"
                      strokeWidth={isHovered ? '3.5' : '2.5'}
                      className="transition-all duration-300"
                      style={{
                        filter: isHovered ? 'drop-shadow(0 0 6px rgba(0,0,0,0.25))' : 'none'
                      }}
                    />
                  </g>
                );
              })}

              {/* Donut Center Telemetry HUD with Enlarged Typography */}
              {chartType === 'donut' && (
                <g className="pointer-events-none select-none">
                  <circle cx={cx} cy={cy} r={innerRadius - 2} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />

                  {activeDisplay ? (
                    <>
                      <text
                        x={cx}
                        y={cy - 34}
                        textAnchor="middle"
                        className="text-[12.5px] font-black fill-slate-500 uppercase tracking-widest"
                      >
                        {activeDisplay.label}
                      </text>
                      <text
                        x={cx}
                        y={cy + 12}
                        textAnchor="middle"
                        className="text-5xl font-black fill-[#0F172A] font-mono"
                      >
                        {activeDisplay.score}
                      </text>
                      <text
                        x={cx}
                        y={cy + 36}
                        textAnchor="middle"
                        className="text-[12px] font-black font-mono tracking-wide"
                        fill={activeDisplay.textColor}
                      >
                        {activeDisplay.isCritical ? 'CRITICAL DEFICIT' : activeDisplay.isElevated ? 'ELEVATED RISK' : 'DISCIPLINED'}
                      </text>
                      <text
                        x={cx}
                        y={cy + 54}
                        textAnchor="middle"
                        className="text-xs font-semibold font-mono fill-slate-400"
                      >
                        {activeDisplay.sharePct}% of Risk Pool
                      </text>
                    </>
                  ) : (
                    <>
                      <text
                        x={cx}
                        y={cy - 34}
                        textAnchor="middle"
                        className="text-[12.5px] font-black fill-slate-500 uppercase tracking-widest"
                      >
                        Resilience Deficit
                      </text>
                      <text
                        x={cx}
                        y={cy + 12}
                        textAnchor="middle"
                        className="text-5xl font-black fill-[#0F172A] font-mono"
                      >
                        {totalDeficitScore}
                      </text>
                      <text
                        x={cx}
                        y={cy + 36}
                        textAnchor="middle"
                        className="text-[12px] font-black font-mono tracking-wide"
                        fill={criticalCount > 0 ? activePalette.criticalText : activePalette.disciplinedText}
                      >
                        {criticalCount > 0 ? `${criticalCount} CAPABILITIES AT RISK` : 'HEALTHY PROFILE'}
                      </text>
                      <text
                        x={cx}
                        y={cy + 54}
                        textAnchor="middle"
                        className="text-xs font-semibold fill-slate-400"
                      >
                        Hover Slice for Details
                      </text>
                    </>
                  )}
                </g>
              )}
            </svg>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-1 font-medium">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Interactive: Hover any slice to inspect supervisory capability health</span>
          </div>
        </div>

        {/* RIGHT: STRUCTURED 8-DIMENSION METRIC BREAKDOWN (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Header & Exact Matching 3-Color Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Capability Deficit Severity Breakdown ({targetEntities.length} {targetEntities.length === 1 ? 'Entity' : 'Entities'})
            </span>
            <div className="flex items-center space-x-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: activePalette.critical }} />
                &gt;60 Critical ({criticalCount})
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: activePalette.elevated }} />
                35–59 Elevated ({elevatedCount})
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: activePalette.disciplined }} />
                &lt;35 Disciplined ({disciplinedCount})
              </span>
            </div>
          </div>

          {/* Dimension Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {dimensionData.map(dim => {
              const isSelected = hoveredDimension === dim.key;
              const isAnotherHovered = hoveredDimension !== null && !isSelected;

              return (
                <div
                  key={dim.key}
                  onMouseEnter={() => setHoveredDimension(dim.key)}
                  onMouseLeave={() => setHoveredDimension(null)}
                  className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'scale-[1.03] shadow-md z-10'
                      : isAnotherHovered
                        ? 'opacity-60 bg-white border-slate-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                  style={isSelected ? {
                    backgroundColor: `${dim.color}22`, // Noticeable light pastel colored background
                    borderColor: dim.color,
                    boxShadow: `0 6px 18px -2px ${dim.color}40`
                  } : undefined}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2 truncate">
                      {/* Card dot strictly matching category solid color */}
                      <div 
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-xs" 
                        style={{ backgroundColor: dim.color }}
                      />
                      <span className="text-xs font-bold text-[#0F172A] truncate">
                        {dim.label}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {/* Score Badge matching category color */}
                      <span 
                        className="text-xs font-extrabold font-mono px-2 py-0.5 rounded border"
                        style={{
                          color: dim.textColor,
                          borderColor: `${dim.color}70`,
                          backgroundColor: `${dim.color}20`
                        }}
                      >
                        {dim.score}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar with 10% Opacity Background Track */}
                  <div 
                    className="w-full h-1.5 rounded-full overflow-hidden mb-1"
                    style={{ backgroundColor: dim.trackColor }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(8, dim.score))}%`,
                        backgroundColor: dim.color
                      }}
                    />
                  </div>

                  <p className="text-[10px] text-slate-500 leading-tight line-clamp-1">
                    {dim.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Dominant Supervisory Weakness Banner (Light Mode) */}
          <div className="bg-red-50/80 border border-red-200 p-3.5 rounded-xl text-xs flex items-center justify-between shadow-[0_1px_2px_0_rgba(239,68,68,0.05)]">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-red-100 text-red-600 border border-red-200 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-slate-800 leading-relaxed">
                <span className="font-bold text-red-900">Dominant Supervisory Bottleneck: </span>
                <span className="text-slate-700">
                  {maxDeficit ? (
                    <>
                      <strong className="text-slate-900 font-extrabold">{maxDeficit.label}</strong> (Score: <span className="font-mono font-bold text-red-600">{maxDeficit.score}/100</span>) represents the most critical deficit in this cohort, accounting for <strong className="text-slate-900 font-bold">{maxDeficit.sharePct}%</strong> of total identified capability weakness.
                    </>
                  ) : (
                    'All capabilities meet baseline supervisory requirements.'
                  )}
                </span>
              </div>
            </div>
            {maxDeficit && (
              <span className="hidden md:inline-flex items-center text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-100/90 text-red-700 border border-red-200 shrink-0 ml-3">
                High Priority
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper: SVG Path math for Donut Arc
function createDonutArc(cx: number, cy: number, rOut: number, rIn: number, startAngle: number, endAngle: number): string {
  const angleDiff = Math.abs(endAngle - startAngle);
  if (angleDiff <= 0.01) return '';

  const safeEndAngle = angleDiff >= 360 ? startAngle + 359.99 : endAngle;

  const radStart = ((startAngle - 90) * Math.PI) / 180;
  const radEnd = ((safeEndAngle - 90) * Math.PI) / 180;

  const ox1 = cx + rOut * Math.cos(radStart);
  const oy1 = cy + rOut * Math.sin(radStart);
  const ox2 = cx + rOut * Math.cos(radEnd);
  const oy2 = cy + rOut * Math.sin(radEnd);

  const ix1 = cx + rIn * Math.cos(radStart);
  const iy1 = cy + rIn * Math.sin(radStart);
  const ix2 = cx + rIn * Math.cos(radEnd);
  const iy2 = cy + rIn * Math.sin(radEnd);

  const largeArc = angleDiff > 180 ? 1 : 0;

  return `M ${ox1} ${oy1} A ${rOut} ${rOut} 0 ${largeArc} 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${rIn} ${rIn} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
}

// Helper: SVG Path math for Solid Pie Arc
function createPieArc(cx: number, cy: number, rOut: number, startAngle: number, endAngle: number): string {
  const angleDiff = Math.abs(endAngle - startAngle);
  if (angleDiff <= 0.01) return '';

  const safeEndAngle = angleDiff >= 360 ? startAngle + 359.99 : endAngle;

  const radStart = ((startAngle - 90) * Math.PI) / 180;
  const radEnd = ((safeEndAngle - 90) * Math.PI) / 180;

  const ox1 = cx + rOut * Math.cos(radStart);
  const oy1 = cy + rOut * Math.sin(radStart);
  const ox2 = cx + rOut * Math.cos(radEnd);
  const oy2 = cy + rOut * Math.sin(radEnd);

  const largeArc = angleDiff > 180 ? 1 : 0;

  return `M ${cx} ${cy} L ${ox1} ${oy1} A ${rOut} ${rOut} 0 ${largeArc} 1 ${ox2} ${oy2} Z`;
}

export default ResilienceDimensionPieChart;
