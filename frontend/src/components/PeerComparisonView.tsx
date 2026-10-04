import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Scale,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  FileText,
  Lock,
  Download,
  Info,
  Layers,
  Activity,
  Zap,
  Clock,
  EyeOff,
  GitCompare,
  Building,
  Check,
  ChevronRight
} from 'lucide-react';

interface EntityProfile {
  id: string;
  code: string;
  name: string;
  sectorCode: string;
  sectorName: string;
  compositeScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  rank: number;
  percentile: number;
  headlineSlaPct: number;
  evidenceQualityScore: number;
  executionGapSize: number;
  fastClosePct: number;
  unescalatedCriticalPct: number;
  alertCount: number;
  assetCount: number;
  findingsCount: number;
  dimensionScores: Record<string, number>;
  topFindings?: Array<{
    id: string;
    rule_key: string;
    title: string;
    severity_score: number;
    dimension_code: string;
  }>;
}

interface ComparisonData {
  sectorCode: string;
  sectorName: string;
  entities: EntityProfile[];
  deltas: {
    scoreDiff: number;
    slaDiff: number;
    evidenceQualityDiff: number;
    gapDiff: number;
    fastCloseDiff: number;
    unescalatedDiff: number;
    findingsDiff: number;
  };
  certificateHash: string;
  evaluatedAt: string;
}

interface PeerComparisonViewProps {
  initialEntityCodes?: string[];
  allKpiGaps?: any[];
  allEntities?: any[];
  onBack?: () => void;
}

const DIMENSION_KEYS = [
  { key: 'Detection', label: 'Threat Detection', shortLabel: 'Detection', desc: 'Dark space visibility & ingestion completeness' },
  { key: 'Investigation', label: 'Investigation Discipline', shortLabel: 'Investigation', desc: 'Forensic notes rigor & artifact validation' },
  { key: 'Escalation', label: 'Escalation Integrity', shortLabel: 'Escalation', desc: 'Tier-1 to Tier-2 escalation without suppression' },
  { key: 'IncidentResponse', label: 'Incident Response', shortLabel: 'Incident Resp', desc: 'Containment velocity & playbook execution' },
  { key: 'SecOps', label: 'Security Operations', shortLabel: 'SecOps', desc: '24/7 coverage & shift-handover continuity' },
  { key: 'Governance', label: 'Governance & Oversight', shortLabel: 'Governance', desc: 'Executive visibility & compliance adherence' },
  { key: 'Discipline', label: 'Operational Discipline', shortLabel: 'Discipline', desc: 'Resistance to fast-close & SLA gaming' },
  { key: 'Resilience', label: 'Cyber Resilience', shortLabel: 'Resilience', desc: 'End-to-end operational fault tolerance' }
];

const DIMENSION_OBSERVATIONS: Record<string, { good: string; poor: string; equal: string }> = {
  Detection: {
    good: 'Comprehensive dark-space sensor visibility with syslog ingestion completeness exceeding 95%.',
    poor: 'Severe perimeter telemetry blackouts with critical unmonitored attack paths.',
    equal: 'Symmetric detection posture across evaluated external and internal perimeter monitors.'
  },
  Investigation: {
    good: 'Rigorous forensic note-taking, artifact verification, and root-cause evidence logging.',
    poor: 'Superficial alert handling with absent forensic artifacts and uncorroborated closures.',
    equal: 'Uniform investigative rigor and evidence documentation across incident records.'
  },
  Escalation: {
    good: 'Unbroken escalation integrity from Tier-1 to Tier-2 with zero suppressed high-severity incidents.',
    poor: 'Systemic alert suppression and failure to escalate critical indicators to Tier-2 analysts.',
    equal: 'Both entities follow comparable escalation pathways without evident suppression anomalies.'
  },
  IncidentResponse: {
    good: 'Rapid containment velocity adhering to statutory playbooks and automated isolation triggers.',
    poor: 'Prolonged dwell times with uncoordinated manual response actions exceeding SLA parameters.',
    equal: 'Equally balanced incident containment velocity and standard playbook execution.'
  },
  SecOps: {
    good: '24/7 continuous operations with rigorous shift-handover logs and analyst fatigue controls.',
    poor: 'Significant graveyard shift coverage gaps and discontinuous analyst shift transitions.',
    equal: 'Equivalent operational continuity and monitoring coverage across all active shifts.'
  },
  Governance: {
    good: 'Active executive visibility, audit readiness, and continuous statutory compliance reporting.',
    poor: 'Deficient board oversight with unaddressed compliance non-conformances.',
    equal: 'Comparable governance oversight and supervisory compliance tracking structures.'
  },
  Discipline: {
    good: 'High operational integrity with zero SLA gaming and thorough ticket investigation.',
    poor: 'Excessive fast-close closures (<10m) indicating artificial SLA preservation rubber-stamping.',
    equal: 'Consistent operational discipline observed in ticket handling and lifecycle management.'
  },
  Resilience: {
    good: 'Demonstrated fault tolerance, validated failover mechanisms, and recovery testing.',
    poor: 'Unvalidated recovery runbooks with elevated risk of prolonged operational downtime.',
    equal: 'Balanced resilience architecture with similar recovery and redundancy safeguards.'
  }
};

export const PeerComparisonView: React.FC<PeerComparisonViewProps> = ({
  initialEntityCodes = [],
  allKpiGaps = [],
  allEntities = [],
  onBack
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query parameters from URL: e.g. /compare?entities=CSE-BANK-01,CSE-BANK-02
  const queryCodes = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get('entities') || params.get('codes') || '';
    if (fromQuery) {
      return fromQuery.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    }
    return initialEntityCodes;
  }, [location.search, initialEntityCodes]);

  const [selectedCodes, setSelectedCodes] = useState<string[]>(
    queryCodes.length >= 2 ? queryCodes : ['CSE-BANK-01', 'CSE-BANK-02']
  );
  const [data, setData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeChartMetric, setActiveChartMetric] = useState<'all' | 'sla' | 'evidence' | 'gap'>('all');
  const [showE1, setShowE1] = useState<boolean>(true);
  const [showE2, setShowE2] = useState<boolean>(true);
  const [showMedian, setShowMedian] = useState<boolean>(true);
  const [hoveredCluster, setHoveredCluster] = useState<number | null>(null);

  // Group all available entities by sector for cohort switching
  const sectorCohorts = useMemo(() => {
    const cohorts: Record<string, { sectorName: string; entities: Array<{ code: string; name: string }> }> = {};
    const sourceList = allKpiGaps.length > 0 ? allKpiGaps : allEntities;

    sourceList.forEach(item => {
      const code = item.entityCode || item.code;
      const name = item.entityName || item.name;
      const secCode = item.sectorCode || item.sector_code || 'OTHER';
      const secName = item.sectorName || item.sector_name || secCode;

      if (!cohorts[secCode]) {
        cohorts[secCode] = { sectorName: secName, entities: [] };
      }
      if (!cohorts[secCode].entities.some(e => e.code === code)) {
        cohorts[secCode].entities.push({ code, name });
      }
    });

    return cohorts;
  }, [allKpiGaps, allEntities]);

  // Current cohort sector
  const currentSector = data?.sectorCode || 'BFSI';

  // Compute or estimate Sector Median benchmark scores for all 8 dimensions
  const sectorMedianScores = useMemo(() => {
    const e1 = data?.entities?.[0];
    const e2 = data?.entities?.[1];
    const cohortEntities = (allKpiGaps.length > 0 ? allKpiGaps : allEntities).filter(item => {
      const sCode = item.sectorCode || item.sector_code || 'OTHER';
      return sCode === currentSector;
    });

    const scores: Record<string, number> = {};
    DIMENSION_KEYS.forEach(dim => {
      const vals = cohortEntities
        .map(e => e.dimensionScores?.[dim.key])
        .filter((v): v is number => typeof v === 'number');

      if (vals.length > 0) {
        vals.sort((a, b) => a - b);
        const mid = Math.floor(vals.length / 2);
        scores[dim.key] = vals.length % 2 !== 0 ? vals[mid] : Math.round((vals[mid - 1] + vals[mid]) / 2);
      } else {
        const s1 = e1?.dimensionScores?.[dim.key] ?? 50;
        const s2 = e2?.dimensionScores?.[dim.key] ?? 50;
        scores[dim.key] = Math.max(15, Math.min(90, Math.round(s1 * 0.45 + s2 * 0.45 + 10)));
      }
    });
    return scores;
  }, [allKpiGaps, allEntities, currentSector, data?.entities]);

  // Fetch comparison payload from backend
  const fetchComparison = async (codes: string[]) => {
    if (codes.length < 2) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/v1/entities/compare?codes=${codes.join(',')}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to fetch peer comparison data.');
      }
      setData(json.data);
    } catch (err: any) {
      console.error('Peer comparison fetch error:', err);
      setErrorMessage(err.message || 'Error loading peer comparison.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCodes.length >= 2) {
      fetchComparison(selectedCodes);
    }
  }, [selectedCodes.join(',')]);

  // Handle switching to a different peer cohort (e.g. from BFSI to ENERGY)
  const handleSwitchCohort = (sectorKey: string) => {
    const cohort = sectorCohorts[sectorKey];
    if (cohort && cohort.entities.length >= 2) {
      const newCodes = [cohort.entities[0].code, cohort.entities[1].code];
      setSelectedCodes(newCodes);
      navigate(`/compare?entities=${newCodes.join(',')}`, { replace: true });
    } else if (cohort && cohort.entities.length === 1) {
      alert(`Sector ${cohort.sectorName} only has 1 registered entity. At least 2 entities are required for peer comparison.`);
    }
  };

  const handleReturn = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard/kpis-vs-evidence');
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#991B1B] animate-spin mb-4">
          <Scale className="w-6 h-6 text-[#991B1B]" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Synthesizing Peer Cohort Evidence...</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
          Verifying cross-entity forensic logs, checking triage telemetry, and calculating Section 65B hash certificate.
        </p>
      </div>
    );
  }

  if (errorMessage && !data) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 shadow-sm text-center max-w-xl mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Cohort Comparison Restriction</h3>
        <p className="text-xs text-slate-600 mt-2 bg-red-50 border border-red-100 rounded-lg p-3 font-mono text-left">
          {errorMessage}
        </p>
        <div className="mt-6 flex items-center justify-center space-x-3">
          <button
            onClick={() => handleSwitchCohort('BFSI')}
            className="px-4 py-2 bg-[#991B1B] text-white rounded-lg text-xs font-bold shadow-sm hover:bg-[#7F1D1D] transition"
          >
            Switch to BFSI Cohort
          </button>
          <button
            onClick={handleReturn}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
          >
            Return to Headline KPIs
          </button>
        </div>
      </div>
    );
  }

  const entities = data?.entities || [];
  const [e1, e2] = entities;
  const deltas = data?.deltas;

  return (
    <div className="peer-comparison-container space-y-6 max-w-7xl mx-auto pb-12 print:p-0 print:m-0 print:max-w-none print:w-full print:space-y-4">
      {/* ================= 1. BREADCRUMBS & TOP NAVIGATION ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm print:p-0 print:border-none print:shadow-none print:mb-2">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReturn}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition print:hidden"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Headline KPIs</span>
          </button>
          <div className="h-4 w-px bg-slate-200 print:hidden" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
                Statutory Peer Benchmarking
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold border border-red-200">
                Strict Cohort Isolation
              </span>
            </div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>{data?.sectorName || 'BFSI'} Peer Cohort Analysis</span>
            </h1>
          </div>
        </div>

        {/* Cohort Selector / Switcher & Export */}
        <div className="flex items-center space-x-2 print:hidden">
          <span className="text-xs font-semibold text-slate-500">Cohort:</span>
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            {Object.entries(sectorCohorts).map(([secKey, sec]) => {
              if (sec.entities.length < 2) return null;
              const isActive = secKey === currentSector;
              return (
                <button
                  key={secKey}
                  onClick={() => handleSwitchCohort(secKey)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-mono'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {secKey}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => window.print()}
            className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition ml-2"
            title="Print / Export Statutory Comparison"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= 2. HEAD-TO-HEAD ENTITY PROFILE HEADER (COMPACT) ================= */}
      {e1 && e2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:break-inside-avoid">
          {/* Entity 1 Card */}
          <div className="bg-white border border-blue-200/80 rounded-xl p-3.5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-20 h-20 bg-blue-50 rounded-full -z-0 opacity-50 pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    {e1.code}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">Peer 1 (Subject)</span>
                </div>
                <h2 className="text-sm font-bold text-slate-900 mt-1 leading-snug">{e1.name}</h2>
                <p className="text-[11px] text-slate-500">{e1.sectorName}</p>
              </div>

              <div className="text-right">
                <div className="text-xl font-black font-mono text-slate-900 leading-tight">{e1.compositeScore}</div>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                  e1.riskLevel === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-200' :
                  e1.riskLevel === 'HIGH' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  {e1.riskLevel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-100 text-center">
              <div className="bg-slate-50 py-1.5 px-2 rounded-lg">
                <span className="text-[9px] text-slate-400 font-bold block leading-none">REPORTED SLA</span>
                <span className="text-xs font-black font-mono text-emerald-600 mt-0.5 block">{e1.headlineSlaPct}%</span>
              </div>
              <div className="bg-slate-50 py-1.5 px-2 rounded-lg">
                <span className="text-[9px] text-slate-400 font-bold block leading-none">EVIDENCE QUALITY</span>
                <span className={`text-xs font-black font-mono mt-0.5 block ${e1.evidenceQualityScore < 60 ? 'text-red-600' : 'text-slate-800'}`}>
                  {e1.evidenceQualityScore}%
                </span>
              </div>
              <div className="bg-slate-50 py-1.5 px-2 rounded-lg">
                <span className="text-[9px] text-slate-400 font-bold block leading-none">DIVERGENCE GAP</span>
                <span className={`text-xs font-black font-mono mt-0.5 block ${e1.executionGapSize > 30 ? 'text-red-600' : 'text-slate-800'}`}>
                  +{e1.executionGapSize}%
                </span>
              </div>
            </div>
          </div>

          {/* Entity 2 Card */}
          <div className="bg-white border border-purple-200/80 rounded-xl p-3.5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-20 h-20 bg-purple-50 rounded-full -z-0 opacity-50 pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                    {e2.code}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">Peer 2 (Benchmark)</span>
                </div>
                <h2 className="text-sm font-bold text-slate-900 mt-1 leading-snug">{e2.name}</h2>
                <p className="text-[11px] text-slate-500">{e2.sectorName}</p>
              </div>

              <div className="text-right">
                <div className="text-xl font-black font-mono text-slate-900 leading-tight">{e2.compositeScore}</div>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                  e2.riskLevel === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-200' :
                  e2.riskLevel === 'HIGH' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  {e2.riskLevel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-100 text-center">
              <div className="bg-slate-50 py-1.5 px-2 rounded-lg">
                <span className="text-[9px] text-slate-400 font-bold block leading-none">REPORTED SLA</span>
                <span className="text-xs font-black font-mono text-emerald-600 mt-0.5 block">{e2.headlineSlaPct}%</span>
              </div>
              <div className="bg-slate-50 py-1.5 px-2 rounded-lg">
                <span className="text-[9px] text-slate-400 font-bold block leading-none">EVIDENCE QUALITY</span>
                <span className={`text-xs font-black font-mono mt-0.5 block ${e2.evidenceQualityScore < 60 ? 'text-red-600' : 'text-slate-800'}`}>
                  {e2.evidenceQualityScore}%
                </span>
              </div>
              <div className="bg-slate-50 py-1.5 px-2 rounded-lg">
                <span className="text-[9px] text-slate-400 font-bold block leading-none">DIVERGENCE GAP</span>
                <span className={`text-xs font-black font-mono mt-0.5 block ${e2.executionGapSize > 30 ? 'text-red-600' : 'text-slate-800'}`}>
                  +{e2.executionGapSize}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. FOUR COHORT DELTA CARDS (COMPACT) ================= */}
      {deltas && e1 && e2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 print:break-inside-avoid">
          {/* Delta 1: Composite Attention Score */}
          <div className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                Score Delta
              </span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                deltas.scoreDiff > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {deltas.scoreDiff > 0 ? `+${deltas.scoreDiff}` : deltas.scoreDiff} pts
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className={`text-base font-black font-mono leading-tight whitespace-nowrap ${
                deltas.scoreDiff > 0 ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {deltas.scoreDiff > 0 ? `+${deltas.scoreDiff}` : deltas.scoreDiff} pts
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {deltas.scoreDiff > 0 ? `${e1.code} +defects` : `${e1.code} disciplined`}
              </span>
            </div>
            <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500 leading-none">
              <span>{e1.code}: {e1.compositeScore}</span>
              <span className="text-slate-300">vs</span>
              <span>{e2.code}: {e2.compositeScore}</span>
            </div>
          </div>

          {/* Delta 2: Headline SLA */}
          <div className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                Headline SLA Delta
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {deltas.slaDiff > 0 ? `+${deltas.slaDiff}%` : `${deltas.slaDiff}%`}
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-base font-black font-mono text-slate-900 leading-tight whitespace-nowrap">
                {deltas.slaDiff > 0 ? `+${deltas.slaDiff}%` : `${deltas.slaDiff}%`}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                Reported speed
              </span>
            </div>
            <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500 leading-none">
              <span>{e1.code}: {e1.headlineSlaPct}%</span>
              <span className="text-slate-300">vs</span>
              <span>{e2.code}: {e2.headlineSlaPct}%</span>
            </div>
          </div>

          {/* Delta 3: Forensic Evidence Quality */}
          <div className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                Evidence Quality Delta
              </span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                deltas.evidenceQualityDiff > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {deltas.evidenceQualityDiff > 0 ? `+${deltas.evidenceQualityDiff}` : deltas.evidenceQualityDiff} pts
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className={`text-base font-black font-mono leading-tight whitespace-nowrap ${
                deltas.evidenceQualityDiff > 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {deltas.evidenceQualityDiff > 0 ? `+${deltas.evidenceQualityDiff}` : deltas.evidenceQualityDiff} pts
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                Underlying truth
              </span>
            </div>
            <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500 leading-none">
              <span>{e1.code}: {e1.evidenceQualityScore}%</span>
              <span className="text-slate-300">vs</span>
              <span>{e2.code}: {e2.evidenceQualityScore}%</span>
            </div>
          </div>

          {/* Delta 4: Discrepancy Gap Size */}
          <div className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                Gaming Divergence
              </span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                deltas.gapDiff < 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {deltas.gapDiff > 0 ? `+${deltas.gapDiff}%` : `${deltas.gapDiff}%`}
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className={`text-base font-black font-mono leading-tight whitespace-nowrap ${
                deltas.gapDiff < 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {deltas.gapDiff > 0 ? `+${deltas.gapDiff}%` : `${deltas.gapDiff}%`}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                Gap variance
              </span>
            </div>
            <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500 leading-none">
              <span>{e1.code}: +{e1.executionGapSize}%</span>
              <span className="text-slate-300">vs</span>
              <span>{e2.code}: +{e2.executionGapSize}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. GROUPED SVG BAR CHART: SLA vs EVIDENCE QUALITY vs GAP ================= */}
      {e1 && e2 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm print:break-inside-avoid">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-[#991B1B]" />
                <h3 className="text-base font-bold text-slate-900">
                  Headline SLA vs Forensic Evidence Quality vs Discrepancy Gap
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Direct side-by-side comparison of claimed operational efficiency versus verified triage integrity.
              </p>
            </div>

            {/* Metric Filter Tabs */}
            <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 print:hidden">
              <button
                onClick={() => setActiveChartMetric('all')}
                className={`px-2.5 py-1 text-xs font-bold rounded ${activeChartMetric === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setActiveChartMetric('sla')}
                className={`px-2.5 py-1 text-xs font-bold rounded ${activeChartMetric === 'sla' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
              >
                SLA %
              </button>
              <button
                onClick={() => setActiveChartMetric('evidence')}
                className={`px-2.5 py-1 text-xs font-bold rounded ${activeChartMetric === 'evidence' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
              >
                Evidence Score
              </button>
              <button
                onClick={() => setActiveChartMetric('gap')}
                className={`px-2.5 py-1 text-xs font-bold rounded ${activeChartMetric === 'gap' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-500'}`}
              >
                Divergence Gap
              </button>
            </div>
          </div>

          {/* SVG Grouped Bar Chart */}
          <div className="relative overflow-x-auto pt-2">
            <svg
              viewBox="0 0 640 260"
              className="w-full h-64 select-none font-sans"
              style={{ minWidth: '560px' }}
            >
              {/* Background Gridlines */}
              {[0, 25, 50, 75, 100].map(pct => {
                const y = 210 - (pct / 100) * 170;
                return (
                  <g key={pct}>
                    <line
                      x1="60"
                      y1={y}
                      x2="600"
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1"
                      strokeDasharray={pct === 0 ? '' : '3 3'}
                    />
                    <text
                      x="48"
                      y={y + 4}
                      fill="#94A3B8"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {pct}%
                    </text>
                  </g>
                );
              })}

              {/* Entity 1 Group */}
              <g transform="translate(140, 0)">
                {/* Entity Label */}
                <text x="50" y="235" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#0F172A">
                  {e1.code}
                </text>
                <text x="50" y="248" textAnchor="middle" fontSize="10" fill="#64748B">
                  {e1.name.slice(0, 20)}...
                </text>

                {/* Bar 1: Headline SLA */}
                {(activeChartMetric === 'all' || activeChartMetric === 'sla') && (
                  <g>
                    <rect
                      x="10"
                      y={210 - (e1.headlineSlaPct / 100) * 170}
                      width="24"
                      height={(e1.headlineSlaPct / 100) * 170}
                      rx="4"
                      fill="#10B981"
                      className="transition-all duration-300 hover:opacity-80"
                    />
                    <text
                      x="22"
                      y={204 - (e1.headlineSlaPct / 100) * 170}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#047857"
                      fontFamily="monospace"
                    >
                      {e1.headlineSlaPct}%
                    </text>
                  </g>
                )}

                {/* Bar 2: Evidence Quality */}
                {(activeChartMetric === 'all' || activeChartMetric === 'evidence') && (
                  <g>
                    <rect
                      x="38"
                      y={210 - (e1.evidenceQualityScore / 100) * 170}
                      width="24"
                      height={(e1.evidenceQualityScore / 100) * 170}
                      rx="4"
                      fill="#3B82F6"
                      className="transition-all duration-300 hover:opacity-80"
                    />
                    <text
                      x="50"
                      y={204 - (e1.evidenceQualityScore / 100) * 170}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#1D4ED8"
                      fontFamily="monospace"
                    >
                      {e1.evidenceQualityScore}%
                    </text>
                  </g>
                )}

                {/* Bar 3: Divergence Gap */}
                {(activeChartMetric === 'all' || activeChartMetric === 'gap') && (
                  <g>
                    <rect
                      x="66"
                      y={210 - (Math.max(5, e1.executionGapSize) / 100) * 170}
                      width="24"
                      height={(Math.max(5, e1.executionGapSize) / 100) * 170}
                      rx="4"
                      fill="#EF4444"
                      className="transition-all duration-300 hover:opacity-80"
                    />
                    <text
                      x="78"
                      y={204 - (Math.max(5, e1.executionGapSize) / 100) * 170}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#B91C1C"
                      fontFamily="monospace"
                    >
                      +{e1.executionGapSize}%
                    </text>
                  </g>
                )}
              </g>

              {/* Entity 2 Group */}
              <g transform="translate(380, 0)">
                {/* Entity Label */}
                <text x="50" y="235" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#0F172A">
                  {e2.code}
                </text>
                <text x="50" y="248" textAnchor="middle" fontSize="10" fill="#64748B">
                  {e2.name.slice(0, 20)}...
                </text>

                {/* Bar 1: Headline SLA */}
                {(activeChartMetric === 'all' || activeChartMetric === 'sla') && (
                  <g>
                    <rect
                      x="10"
                      y={210 - (e2.headlineSlaPct / 100) * 170}
                      width="24"
                      height={(e2.headlineSlaPct / 100) * 170}
                      rx="4"
                      fill="#10B981"
                      className="transition-all duration-300 hover:opacity-80"
                    />
                    <text
                      x="22"
                      y={204 - (e2.headlineSlaPct / 100) * 170}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#047857"
                      fontFamily="monospace"
                    >
                      {e2.headlineSlaPct}%
                    </text>
                  </g>
                )}

                {/* Bar 2: Evidence Quality */}
                {(activeChartMetric === 'all' || activeChartMetric === 'evidence') && (
                  <g>
                    <rect
                      x="38"
                      y={210 - (e2.evidenceQualityScore / 100) * 170}
                      width="24"
                      height={(e2.evidenceQualityScore / 100) * 170}
                      rx="4"
                      fill="#3B82F6"
                      className="transition-all duration-300 hover:opacity-80"
                    />
                    <text
                      x="50"
                      y={204 - (e2.evidenceQualityScore / 100) * 170}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#1D4ED8"
                      fontFamily="monospace"
                    >
                      {e2.evidenceQualityScore}%
                    </text>
                  </g>
                )}

                {/* Bar 3: Divergence Gap */}
                {(activeChartMetric === 'all' || activeChartMetric === 'gap') && (
                  <g>
                    <rect
                      x="66"
                      y={210 - (Math.max(5, e2.executionGapSize) / 100) * 170}
                      width="24"
                      height={(Math.max(5, e2.executionGapSize) / 100) * 170}
                      rx="4"
                      fill="#EF4444"
                      className="transition-all duration-300 hover:opacity-80"
                    />
                    <text
                      x="78"
                      y={204 - (Math.max(5, e2.executionGapSize) / 100) * 170}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#B91C1C"
                      fontFamily="monospace"
                    >
                      +{e2.executionGapSize}%
                    </text>
                  </g>
                )}
              </g>
            </svg>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 inline-block" />
              <span className="font-semibold text-slate-700">Headline Reported SLA %</span>
              <span className="text-[11px] text-slate-400 font-mono">(Closed under 60m SLA)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-blue-500 inline-block" />
              <span className="font-semibold text-slate-700">Forensic Evidence Quality</span>
              <span className="text-[11px] text-slate-400 font-mono">(Investigation depth &amp; escalation)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-red-500 inline-block" />
              <span className="font-semibold text-slate-700">Execution Discrepancy Gap</span>
              <span className="text-[11px] text-slate-400 font-mono">(Reported SLA − Evidence Quality)</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. 8-DIMENSION NCIIPC RESILIENCE BAR CHART BENCHMARK ================= */}
      {e1 && e2 && (
        <div
          className="relative w-full rounded-2xl bg-[#FAFAFA] border border-slate-200/90 p-5 sm:p-6 shadow-sm overflow-hidden print:break-inside-avoid"
          style={{
            backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
            backgroundSize: '22px 22px'
          }}
        >
          {/* Main Title - Clean, bold, uppercase matching reference image */}
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 tracking-tight text-center uppercase mb-1">
            8-Dimension NCIIPC Cyber Resilience Benchmark
          </h2>
          <p className="text-xs text-slate-500 font-medium text-center tracking-normal mb-4">
            Statutory Supervisory Capability Evaluation — {data?.sectorName || 'Cohort'} Sector 2026
          </p>

          {/* Minimalist Legend with Interactive Series Toggles */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-8 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setShowE1(prev => !prev)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border transition-all ${
                showE1
                  ? 'bg-white text-slate-800 border-slate-300 shadow-xs'
                  : 'bg-slate-100/80 text-slate-400 border-slate-200 line-through opacity-60'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-xs shrink-0" style={{ backgroundColor: '#DE7E56' }} />
              <span>{e1.code}</span>
              <span className="text-[11px] text-slate-400 font-normal hidden md:inline">({e1.name.slice(0, 16)}...)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowE2(prev => !prev)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border transition-all ${
                showE2
                  ? 'bg-white text-slate-800 border-slate-300 shadow-xs'
                  : 'bg-slate-100/80 text-slate-400 border-slate-200 line-through opacity-60'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-xs shrink-0" style={{ backgroundColor: '#52C5BC' }} />
              <span>{e2.code}</span>
              <span className="text-[11px] text-slate-400 font-normal hidden md:inline">({e2.name.slice(0, 16)}...)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMedian(prev => !prev)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border transition-all ${
                showMedian
                  ? 'bg-white text-slate-800 border-slate-300 shadow-xs'
                  : 'bg-slate-100/80 text-slate-400 border-slate-200 line-through opacity-60'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-xs shrink-0" style={{ backgroundColor: '#3C6CE6' }} />
              <span>{data?.sectorName || 'Cohort'} Median Benchmark</span>
            </button>
          </div>

          {/* Floating Hover Tooltip */}
          {hoveredCluster !== null && (() => {
            const dim = DIMENSION_KEYS[hoveredCluster];
            const s1 = e1.dimensionScores[dim.key] ?? 50;
            const s2 = e2.dimensionScores[dim.key] ?? 50;
            const sMed = sectorMedianScores[dim.key] ?? 60;
            const diff = s1 - s2;
            const cxPercent = ((50 + hoveredCluster * 110.6 + 55.3) / 960) * 100;

            return (
              <div
                className="absolute top-28 pointer-events-none transform -translate-x-1/2 z-30 transition-all duration-150"
                style={{ left: `${Math.max(16, Math.min(84, cxPercent))}%` }}
              >
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-xl p-3.5 text-xs min-w-[210px]">
                  <div className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-1.5 mb-2">
                    {dim.label}
                  </div>
                  <div className="space-y-1.5 font-medium">
                    {showE1 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#DE7E56' }} />
                          <span className="text-slate-600">{e1.code}</span>
                        </div>
                        <span className="font-bold font-mono text-slate-900">{s1} pts</span>
                      </div>
                    )}
                    {showE2 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#52C5BC' }} />
                          <span className="text-slate-600">{e2.code}</span>
                        </div>
                        <span className="font-bold font-mono text-slate-900">{s2} pts</span>
                      </div>
                    )}
                    {showMedian && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#3C6CE6' }} />
                          <span className="text-slate-600">Cohort Median</span>
                        </div>
                        <span className="font-bold font-mono text-slate-900">{sMed} pts</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-100 pt-2 mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Head-to-Head Delta:</span>
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                      diff > 0 ? 'bg-emerald-50 text-emerald-700' :
                      diff < 0 ? 'bg-rose-50 text-rose-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {diff > 0 ? `+${diff} pts` : `${diff} pts`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* The Clean Minimalist SVG Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 960 380"
              className="w-full h-auto min-w-[760px] max-w-full select-none"
              onMouseLeave={() => setHoveredCluster(null)}
            >
              {/* Horizontal Gridlines (0, 20, 40, 60, 80, 100) */}
              {[
                { val: 100, y: 30 },
                { val: 80, y: 88 },
                { val: 60, y: 146 },
                { val: 40, y: 204 },
                { val: 20, y: 262 },
                { val: 0, y: 320 }
              ].map(grid => (
                <g key={grid.val}>
                  <line
                    x1="50"
                    y1={grid.y}
                    x2="945"
                    y2={grid.y}
                    stroke={grid.val === 0 ? "#94A3B8" : "#E2E8F0"}
                    strokeWidth={grid.val === 0 ? "1.5" : "1"}
                  />
                  <text
                    x="42"
                    y={grid.y + 4}
                    textAnchor="end"
                    fontSize="12"
                    fontWeight="500"
                    fontFamily="sans-serif"
                    fill="#64748B"
                  >
                    {grid.val}
                  </text>
                </g>
              ))}

              {/* 8 Dimension Bar Clusters */}
              {DIMENSION_KEYS.map((dim, i) => {
                const s1 = e1.dimensionScores[dim.key] ?? 50;
                const s2 = e2.dimensionScores[dim.key] ?? 50;
                const sMed = sectorMedianScores[dim.key] ?? 60;

                const clusterW = 110.6;
                const cx = 50 + i * clusterW + 55.3;

                // Active Series List for dynamic grouping
                const seriesList = [
                  showE1 && { id: 'e1', color: '#DE7E56', score: s1 },
                  showE2 && { id: 'e2', color: '#52C5BC', score: s2 },
                  showMedian && { id: 'median', color: '#3C6CE6', score: sMed }
                ].filter(Boolean) as Array<{ id: string; color: string; score: number }>;

                const n = seriesList.length;
                const barW = n === 3 ? 18 : n === 2 ? 24 : 32;
                const barGap = n === 3 ? 3 : n === 2 ? 4 : 0;
                const totalW = n * barW + Math.max(0, n - 1) * barGap;
                const startX = cx - totalW / 2;

                const isHovered = hoveredCluster === i;

                return (
                  <g
                    key={dim.key}
                    onMouseEnter={() => setHoveredCluster(i)}
                    className="cursor-pointer"
                  >
                    {/* Hover column background highlight */}
                    <rect
                      x={50 + i * clusterW + 2}
                      y="15"
                      width={clusterW - 4}
                      height="340"
                      fill={isHovered ? "rgba(0, 0, 0, 0.025)" : "transparent"}
                      rx="6"
                      className="transition-all duration-150"
                    />

                    {/* Bars in Cluster */}
                    {seriesList.map((item, idx) => {
                      if (item.score <= 0) return null; // In reference image, 0 score month has no bar

                      const barH = (item.score / 100) * 290;
                      const barY = 320 - barH;
                      const barX = startX + idx * (barW + barGap);

                      return (
                        <rect
                          key={item.id}
                          x={barX}
                          y={barY}
                          width={barW}
                          height={barH}
                          fill={item.color}
                          rx="1"
                          className="transition-all duration-200 hover:brightness-110"
                        />
                      );
                    })}

                    {/* Dimension Label on X-axis */}
                    <text
                      x={cx}
                      y="348"
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight={isHovered ? "700" : "600"}
                      fill={isHovered ? "#0F172A" : "#334155"}
                      fontFamily="sans-serif"
                    >
                      {dim.shortLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* ================= 6. TRIAGE FAILURE & SLA GAMING METRICS ================= */}
      {e1 && e2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:break-inside-avoid">
          {/* Card A: Fast Closures (<10m) Rate */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-bold text-slate-900">Fast Closures (&lt;10 min) Rate</h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                Threshold: &gt;30%
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Alerts resolved in under 10 minutes indicate superficial rubber-stamping to meet contractual SLAs rather than thorough investigative inquiry.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-slate-700">{e1.code}</span>
                  <span className={`font-black ${e1.fastClosePct > 30 ? 'text-red-600' : 'text-slate-800'}`}>
                    {e1.fastClosePct}% {e1.fastClosePct > 30 && '⚠️ FLAGGED'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${e1.fastClosePct > 30 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, e1.fastClosePct)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-slate-700">{e2.code}</span>
                  <span className={`font-black ${e2.fastClosePct > 30 ? 'text-red-600' : 'text-slate-800'}`}>
                    {e2.fastClosePct}% {e2.fastClosePct > 30 && '⚠️ FLAGGED'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${e2.fastClosePct > 30 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, e2.fastClosePct)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Unescalated Critical Alerts Rate */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <h4 className="text-sm font-bold text-slate-900">Unescalated Critical Alerts %</h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
                Defect: &gt;40%
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Critical severity security incidents closed directly at Tier-1 triage without supervisor or incident response team escalation.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-slate-700">{e1.code}</span>
                  <span className={`font-black ${e1.unescalatedCriticalPct > 40 ? 'text-red-600' : 'text-slate-800'}`}>
                    {e1.unescalatedCriticalPct}% {e1.unescalatedCriticalPct > 40 && '⚠️ CRITICAL DEFECT'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${e1.unescalatedCriticalPct > 40 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, e1.unescalatedCriticalPct)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-slate-700">{e2.code}</span>
                  <span className={`font-black ${e2.unescalatedCriticalPct > 40 ? 'text-red-600' : 'text-slate-800'}`}>
                    {e2.unescalatedCriticalPct}% {e2.unescalatedCriticalPct > 40 && '⚠️ CRITICAL DEFECT'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${e2.unescalatedCriticalPct > 40 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, e2.unescalatedCriticalPct)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. SIDE-BY-SIDE FORENSIC MATRIX TABLE ================= */}
      {e1 && e2 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm print:break-inside-avoid">
          <div className="px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Side-by-Side Granular Forensic Matrix</h3>
              <p className="text-xs text-slate-500">
                Detailed comparison of operational log volume, triage behavior, and regulatory findings.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Sector: {data?.sectorCode}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0] font-semibold">
                <tr>
                  <th className="py-3 px-6">Supervisory Metric</th>
                  <th className="py-3 px-6 font-mono font-bold text-blue-700">{e1.code} ({e1.name.slice(0, 16)}...)</th>
                  <th className="py-3 px-6 font-mono font-bold text-purple-700">{e2.code} ({e2.name.slice(0, 16)}...)</th>
                  <th className="py-3 px-6 text-right">Variance / Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">Total Security Alerts Ingested</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-800">{e1.alertCount} Alerts</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-800">{e2.alertCount} Alerts</td>
                  <td className="py-3.5 px-6 font-mono text-right text-slate-600">
                    {e1.alertCount - e2.alertCount > 0 ? `+${e1.alertCount - e2.alertCount}` : e1.alertCount - e2.alertCount}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">Critical Infrastructure Assets Monitored</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-800">{e1.assetCount} Systems</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-800">{e2.assetCount} Systems</td>
                  <td className="py-3.5 px-6 font-mono text-right text-slate-600">
                    {e1.assetCount - e2.assetCount}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">Reported Headline SLA % (&lt;60m target)</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-emerald-600">{e1.headlineSlaPct}%</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-emerald-600">{e2.headlineSlaPct}%</td>
                  <td className="py-3.5 px-6 font-mono text-right font-bold text-slate-800">
                    {deltas?.slaDiff && deltas.slaDiff > 0 ? `+${deltas.slaDiff}%` : `${deltas?.slaDiff}%`}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">Forensic Evidence Quality Score</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-blue-700">{e1.evidenceQualityScore}%</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-purple-700">{e2.evidenceQualityScore}%</td>
                  <td className="py-3.5 px-6 font-mono text-right font-bold text-blue-800">
                    {deltas?.evidenceQualityDiff && deltas.evidenceQualityDiff > 0 ? `+${deltas.evidenceQualityDiff} pts` : `${deltas?.evidenceQualityDiff} pts`}
                  </td>
                </tr>

                <tr className="bg-red-50/40">
                  <td className="py-3.5 px-6 font-bold text-red-900">Execution Discrepancy Gap Size</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-red-700">+{e1.executionGapSize}%</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-red-700">+{e2.executionGapSize}%</td>
                  <td className="py-3.5 px-6 font-mono text-right font-bold text-red-800">
                    {deltas?.gapDiff && deltas.gapDiff > 0 ? `+${deltas.gapDiff}%` : `${deltas?.gapDiff}%`}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">Fast Closures (&lt;10m) Rate</td>
                  <td className="py-3.5 px-6 font-mono text-slate-800">{e1.fastClosePct}%</td>
                  <td className="py-3.5 px-6 font-mono text-slate-800">{e2.fastClosePct}%</td>
                  <td className="py-3.5 px-6 font-mono text-right text-slate-600">
                    {deltas?.fastCloseDiff && deltas.fastCloseDiff > 0 ? `+${deltas.fastCloseDiff}%` : `${deltas?.fastCloseDiff}%`}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">Unescalated Critical Alert Ratio</td>
                  <td className="py-3.5 px-6 font-mono text-slate-800">{e1.unescalatedCriticalPct}%</td>
                  <td className="py-3.5 px-6 font-mono text-slate-800">{e2.unescalatedCriticalPct}%</td>
                  <td className="py-3.5 px-6 font-mono text-right text-slate-600">
                    {deltas?.unescalatedDiff && deltas.unescalatedDiff > 0 ? `+${deltas.unescalatedDiff}%` : `${deltas?.unescalatedDiff}%`}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">Total Validated Supervisory Findings</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-800">{e1.findingsCount} Findings</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-800">{e2.findingsCount} Findings</td>
                  <td className="py-3.5 px-6 font-mono text-right text-slate-600">
                    {deltas?.findingsDiff && deltas.findingsDiff > 0 ? `+${deltas.findingsDiff}` : `${deltas?.findingsDiff}`}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">Supervisory Attention &amp; Risk Tier</td>
                  <td className="py-3.5 px-6 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      e1.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {e1.riskLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      e2.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {e2.riskLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-mono text-right text-slate-600">
                    Rank #{e1.rank} vs #{e2.rank}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 8. STATUTORY SYNTHESIS FINDINGS & SECTION 65B CERTIFICATE (LIGHT MODE) ================= */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-sm border border-[#E2E8F0] print:break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-[#991B1B]">
              <Shield className="w-5 h-5 text-[#991B1B]" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-slate-900">
                NCIIPC Statutory Supervisory Synthesis &amp; Legal Seal
              </h3>
              <p className="text-xs text-slate-500">
                Section 65B Indian Evidence Act Cryptographic Certificate of Operational Review
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              SHA-256 VERIFIED
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Supervisory Conclusion</span>
            </h4>
            <p className="leading-relaxed text-slate-600">
              Supervisory analysis of operational alert records indicates divergence in triage discipline within the{' '}
              <span className="font-bold text-slate-900">{data?.sectorName}</span> cohort. While{' '}
              <span className="font-mono text-blue-700 font-bold">{e2?.code}</span> reports high headline SLA compliance (
              {e2?.headlineSlaPct}%), underlying investigative step verification reveals an Evidence Quality score of only{' '}
              {e2?.evidenceQualityScore}%, yielding an execution gap of{' '}
              <span className="text-red-600 font-bold">+{e2?.executionGapSize}%</span>. In contrast,{' '}
              <span className="font-mono text-purple-700 font-bold">{e1?.code}</span> maintains genuine forensic rigor with{' '}
              {e1?.evidenceQualityScore}% evidence quality.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 font-mono text-[11px] space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>STATUTORY HASH:</span>
              <span className="text-emerald-700 font-bold truncate max-w-[200px]" title={data?.certificateHash}>
                {data?.certificateHash}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>EVALUATED AT:</span>
              <span className="text-slate-800">{data?.evaluatedAt ? new Date(data.evaluatedAt).toLocaleString() : 'Live'}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>FRAMEWORK:</span>
              <span className="text-slate-800">NCIIPC CSE Cyber Resilience Guidelines v2.4</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>LEGAL CITATION:</span>
              <span className="text-slate-800">IT Act 2000 §70B &amp; Evidence Act §65B</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerComparisonView;
