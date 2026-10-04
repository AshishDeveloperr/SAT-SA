import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ChevronRight,
  Bot,
  RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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

export interface BenchmarkMetricDef {
  key: string;
  label: string;
  shortLabel: string;
  category: 'core' | 'triage';
  desc: string;
  unit?: string;
  isGap?: boolean;
}

export const ALL_BENCHMARK_METRICS: BenchmarkMetricDef[] = [
  { key: 'Detection', label: 'Threat Detection', shortLabel: 'Detection', category: 'core', desc: 'Dark space visibility & ingestion completeness' },
  { key: 'Investigation', label: 'Investigation Discipline', shortLabel: 'Investigation', category: 'core', desc: 'Forensic notes rigor & artifact validation' },
  { key: 'Escalation', label: 'Escalation Integrity', shortLabel: 'Escalation', category: 'core', desc: 'Tier-1 to Tier-2 escalation without suppression' },
  { key: 'IncidentResponse', label: 'Incident Response', shortLabel: 'Incident Resp', category: 'core', desc: 'Containment velocity & playbook execution' },
  { key: 'SecOps', label: 'Security Operations', shortLabel: 'SecOps', category: 'core', desc: '24/7 coverage & shift-handover continuity' },
  { key: 'Governance', label: 'Governance & Oversight', shortLabel: 'Governance', category: 'core', desc: 'Executive visibility & compliance adherence' },
  { key: 'Discipline', label: 'Operational Discipline', shortLabel: 'Discipline', category: 'core', desc: 'Resistance to fast-close & SLA gaming' },
  { key: 'Resilience', label: 'Cyber Resilience', shortLabel: 'Resilience', category: 'core', desc: 'End-to-end operational fault tolerance' },
  // Integrated Statutory Triage & SLA Integrity Dimensions
  { key: 'HeadlineSLA', label: 'Headline Reported SLA %', shortLabel: 'Reported SLA', category: 'triage', unit: '%', desc: 'Claimed ticket resolution within 60m SLA threshold' },
  { key: 'EvidenceQuality', label: 'Forensic Evidence Quality', shortLabel: 'Evidence Quality', category: 'triage', unit: '%', desc: 'Verified root-cause artifacts, investigator notes & escalation depth' },
  { key: 'DiscrepancyGap', label: 'Execution Discrepancy Gap', shortLabel: 'Discrepancy Gap', category: 'triage', unit: '%', isGap: true, desc: 'Goodhart divergence gap (Reported SLA − Forensic Evidence Quality)' }
];

const DIMENSION_KEYS = ALL_BENCHMARK_METRICS.filter(m => m.category === 'core');

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
  },
  HeadlineSLA: {
    good: 'High self-reported SLA resolution rate meeting statutory timelines.',
    poor: 'Severe ticket SLA breaches with excessive unresolved incidents.',
    equal: 'Comparable self-reported SLA resolution percentages across entities.'
  },
  EvidenceQuality: {
    good: 'Exemplary investigative depth with comprehensive forensic artifacts and corroborated escalation logs.',
    poor: 'Deficient investigation with absent artifacts, indicating rubber-stamping closures.',
    equal: 'Equivalent forensic documentation rigor and artifact corroboration.'
  },
  DiscrepancyGap: {
    good: 'Minimal execution gap demonstrating authentic operational transparency.',
    poor: 'Severe divergence gap under Goodhart’s Law, indicating SLA gaming to mask triage deficiencies.',
    equal: 'Symmetric execution gaps observed across both entities.'
  }
};

function highlightWordsColorful(text: string): React.ReactNode {
  if (!text) return null;

  // Pattern matching entity codes, execution gaps, metrics, goodhart's law, and statutory directives
  const pattern = /(CSE-[A-Z0-9-]+|\+\d+(?:\.\d+)?%|execution\s+gap(?:\s+of\s+\+\d+(?:\.\d+)?%)?|Goodhart's\s+Law|forensic\s+evidence\s+quality(?:\s+score)?(?:\s+of\s+\d+(?:\.\d+)?%)?|Evidence\s+Quality|reported\s+SLA(?:\s+compliance)?(?:\s+of\s+\d+(?:\.\d+)?%)?|SLA\s+compliance|\b\d+(?:\.\d+)?%|NCIIPC(?:\s+Guidelines)?(?:\s+v2\.4)?|Section\s+70A(?:\s+verification\s+directive)?|Section\s+65B|urgently\s+address\s+and\s+rectify|priority\s+on-site\s+verification)/gi;

  const parts = text.split(pattern);
  return parts.map((part, i) => {
    if (!part) return null;

    // 1. Entity codes -> Indigo colored font with underline & subtle tint
    if (/^CSE-[A-Z0-9-]+$/i.test(part)) {
      return (
        <span
          key={i}
          className="font-mono font-semibold text-indigo-700 bg-indigo-50/80 underline decoration-indigo-400 decoration-2 underline-offset-2 px-1 py-0.5 rounded"
        >
          {part}
        </span>
      );
    }

    // 2. Execution Gaps & Goodhart's Law -> Rose/Red font with underline & subtle tint
    if (/^\+\d/i.test(part) || /execution\s+gap|Goodhart/i.test(part)) {
      return (
        <span
          key={i}
          className="font-semibold text-rose-700 bg-rose-50/80 underline decoration-rose-400 decoration-2 underline-offset-2 px-1 py-0.5 rounded"
        >
          {part}
        </span>
      );
    }

    // 3. Forensic Evidence Quality & Rigor -> Emerald font with underline & subtle tint
    if (/forensic|Evidence\s+Quality/i.test(part)) {
      return (
        <span
          key={i}
          className="font-semibold text-emerald-800 bg-emerald-50/80 underline decoration-emerald-500 decoration-2 underline-offset-2 px-1 py-0.5 rounded"
        >
          {part}
        </span>
      );
    }

    // 4. Reported SLAs & Percentages -> Amber font with underline & subtle tint
    if (/SLA|\d+(?:\.\d+)?%/i.test(part)) {
      return (
        <span
          key={i}
          className="font-semibold text-amber-800 bg-amber-50/80 underline decoration-amber-500 decoration-2 underline-offset-2 px-1 py-0.5 rounded"
        >
          {part}
        </span>
      );
    }

    // 5. Statutory Directives & Regulations -> Blue font with underline & subtle tint
    if (/NCIIPC|Section\s+70A|Section\s+65B|urgently\s+address|verification/i.test(part)) {
      return (
        <span
          key={i}
          className="font-semibold text-blue-800 bg-blue-50/80 underline decoration-blue-500 decoration-2 underline-offset-2 px-1 py-0.5 rounded"
        >
          {part}
        </span>
      );
    }

    return part;
  });
}

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
  const [benchmarkViewMode, setBenchmarkViewMode] = useState<'all' | 'core' | 'triage'>('all');
  const [showValuesOnBars, setShowValuesOnBars] = useState<boolean>(true);
  const [showE1, setShowE1] = useState<boolean>(true);
  const [showE2, setShowE2] = useState<boolean>(true);
  const [showMedian, setShowMedian] = useState<boolean>(true);
  const [hoveredCluster, setHoveredCluster] = useState<number | null>(null);

  // Local Air-Gapped AI Synthesis state (Ollama / Qwen2.5:3B)
  const [aiSynthesis, setAiSynthesis] = useState<{
    narrative: string;
    engine: string;
    isAiGenerated: boolean;
    model: string;
  } | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  const fetchAiPeerSynthesis = useCallback(async (compData: ComparisonData | null) => {
    if (!compData || !compData.entities || compData.entities.length < 2) return;
    setIsGeneratingAi(true);
    try {
      const e1 = compData.entities[0];
      const e2 = compData.entities[1];
      const res = await fetch('/api/v1/copilot/peer-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectorName: compData.sectorName,
          entity1: {
            code: e1.code,
            name: e1.name,
            headlineSlaPct: e1.headlineSlaPct,
            evidenceQualityScore: e1.evidenceQualityScore,
            executionGapSize: e1.executionGapSize,
            unescalatedCriticalPct: e1.unescalatedCriticalPct,
            compositeScore: e1.compositeScore
          },
          entity2: {
            code: e2.code,
            name: e2.name,
            headlineSlaPct: e2.headlineSlaPct,
            evidenceQualityScore: e2.evidenceQualityScore,
            executionGapSize: e2.executionGapSize,
            unescalatedCriticalPct: e2.unescalatedCriticalPct,
            compositeScore: e2.compositeScore
          },
          deltas: compData.deltas
        })
      });
      if (res.ok) {
        const json = await res.json();
        setAiSynthesis(json.data);
      }
    } catch (err) {
      console.warn('Failed to fetch AI peer comparison synthesis:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  }, []);

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

  // Helper to extract score for any metric key from an entity
  const getMetricScore = (entity: EntityProfile | undefined, metricKey: string): number => {
    if (!entity) return 0;
    if (metricKey === 'HeadlineSLA') return entity.headlineSlaPct ?? 0;
    if (metricKey === 'EvidenceQuality') return entity.evidenceQualityScore ?? 0;
    if (metricKey === 'DiscrepancyGap') return entity.executionGapSize ?? 0;
    return entity.dimensionScores?.[metricKey] ?? 0;
  };

  // Compute or estimate Sector Median benchmark scores for all 8 core dimensions + 3 triage metrics
  const sectorMedianScores = useMemo(() => {
    const e1 = data?.entities?.[0];
    const e2 = data?.entities?.[1];
    const cohortEntities = (allKpiGaps.length > 0 ? allKpiGaps : allEntities).filter(item => {
      const sCode = item.sectorCode || item.sector_code || 'OTHER';
      return sCode === currentSector;
    });

    const scores: Record<string, number> = {};

    // 8 Core NCIIPC dimensions
    ALL_BENCHMARK_METRICS.filter(m => m.category === 'core').forEach(dim => {
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

    // 3 Triage & SLA metrics medians
    const getMedian = (getter: (e: any) => number | undefined, fallback: number) => {
      const vals = cohortEntities
        .map(getter)
        .filter((v): v is number => typeof v === 'number' && !isNaN(v));
      if (vals.length === 0) return fallback;
      vals.sort((a, b) => a - b);
      const mid = Math.floor(vals.length / 2);
      return vals.length % 2 !== 0 ? vals[mid] : Math.round((vals[mid - 1] + vals[mid]) / 2);
    };

    scores['HeadlineSLA'] = Math.round(getMedian(e => e.headlineSlaPct, 82));
    scores['EvidenceQuality'] = Math.round(getMedian(e => e.evidenceQualityScore, 70));
    scores['DiscrepancyGap'] = Math.round(getMedian(e => e.executionGapSize, 12));

    return scores;
  }, [allKpiGaps, allEntities, currentSector, data?.entities]);

  // Determine active metrics based on the selected view mode
  const activeMetrics = useMemo(() => {
    if (benchmarkViewMode === 'core') {
      return ALL_BENCHMARK_METRICS.filter(m => m.category === 'core');
    }
    if (benchmarkViewMode === 'triage') {
      return ALL_BENCHMARK_METRICS.filter(m => m.category === 'triage');
    }
    return ALL_BENCHMARK_METRICS; // 'all': 11 dimensions unified
  }, [benchmarkViewMode]);

  // Fetch comparison payload from backend
  const fetchComparison = async (codes: string[]) => {
    if (codes.length < 2) return;
    setIsLoading(true);
    setErrorMessage(null);
    setAiSynthesis(null);
    try {
      const res = await fetch(`/api/v1/entities/compare?codes=${codes.join(',')}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to fetch peer comparison data.');
      }
      setData(json.data);
      fetchAiPeerSynthesis(json.data);
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
    <div className="peer-comparison-container space-y-6 w-full pb-12 print:p-0 print:m-0 print:max-w-none print:w-full print:space-y-4">
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

      {/* ================= 4. UNIFIED CYBER RESILIENCE & STATUTORY TRIAGE BENCHMARK ================= */}
      {e1 && e2 && (
        <div
          className="relative w-full rounded-2xl bg-[#FAFAFA] border border-slate-200/90 p-5 sm:p-6 shadow-sm overflow-hidden print:break-inside-avoid"
          style={{
            backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
            backgroundSize: '22px 22px'
          }}
        >
          {/* Header Bar: Benchmark Title + View Mode Tabs + Values Toggle */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 mb-5 border-b border-slate-200/80 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-5 h-5 text-indigo-600 shrink-0" />
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight uppercase">
                  {benchmarkViewMode === 'core'
                    ? '8-Dimension NCIIPC Cyber Resilience Benchmark'
                    : benchmarkViewMode === 'triage'
                    ? 'Statutory Triage Integrity & SLA Discrepancy Benchmark'
                    : 'Unified Cyber Resilience & Forensic Triage Benchmark'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Statutory Supervisory Capability Evaluation — {data?.sectorName || 'Cohort'} Sector 2026
              </p>
            </div>

            {/* Interactive Filters: View Mode Segmented Control + Data Labels Toggle */}
            <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2 print:hidden">
              <div className="flex items-center bg-slate-200/60 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setBenchmarkViewMode('all'); setHoveredCluster(null); }}
                  className={`px-3 py-1 rounded transition-all ${
                    benchmarkViewMode === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Metrics (11D)
                </button>
                <button
                  type="button"
                  onClick={() => { setBenchmarkViewMode('core'); setHoveredCluster(null); }}
                  className={`px-3 py-1 rounded transition-all ${
                    benchmarkViewMode === 'core'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  8 Core Resilience
                </button>
                <button
                  type="button"
                  onClick={() => { setBenchmarkViewMode('triage'); setHoveredCluster(null); }}
                  className={`px-3 py-1 rounded transition-all ${
                    benchmarkViewMode === 'triage'
                      ? 'bg-white text-rose-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  SLA &amp; Triage Integrity (3D)
                </button>
              </div>

              {/* Data Labels Toggle */}
              <button
                type="button"
                onClick={() => setShowValuesOnBars(prev => !prev)}
                className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all ${
                  showValuesOnBars
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
                title="Toggle exact numeric values above chart bars"
              >
                Data Labels: {showValuesOnBars ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Series Legend with Interactive Series Toggles */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setShowE1(prev => !prev)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all ${
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
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all ${
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
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all ${
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
          {hoveredCluster !== null && hoveredCluster < activeMetrics.length && (() => {
            const dim = activeMetrics[hoveredCluster];
            const s1 = getMetricScore(e1, dim.key);
            const s2 = getMetricScore(e2, dim.key);
            const sMed = sectorMedianScores[dim.key] ?? 60;
            const diff = s1 - s2;

            const numCols = activeMetrics.length;
            const totalPlotWidth = 910;
            const colW = totalPlotWidth / numCols;
            const cxPercent = ((50 + hoveredCluster * colW + colW / 2) / 980) * 100;

            return (
              <div
                className="absolute top-32 pointer-events-none transform -translate-x-1/2 z-30 transition-all duration-150"
                style={{ left: `${Math.max(16, Math.min(84, cxPercent))}%` }}
              >
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-xl p-3.5 text-xs min-w-[240px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2 gap-2">
                    <span className="font-bold text-slate-800 text-sm">{dim.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      dim.category === 'triage'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {dim.category === 'triage' ? 'Triage Integrity' : 'Resilience Dimension'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mb-2 leading-tight">{dim.desc}</p>

                  <div className="space-y-1.5 font-medium">
                    {showE1 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#DE7E56' }} />
                          <span className="text-slate-600">{e1.code}</span>
                        </div>
                        <span className="font-bold font-mono text-slate-900">
                          {dim.isGap ? `+${s1}%` : `${s1}${dim.unit || ' pts'}`}
                        </span>
                      </div>
                    )}
                    {showE2 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#52C5BC' }} />
                          <span className="text-slate-600">{e2.code}</span>
                        </div>
                        <span className="font-bold font-mono text-slate-900">
                          {dim.isGap ? `+${s2}%` : `${s2}${dim.unit || ' pts'}`}
                        </span>
                      </div>
                    )}
                    {showMedian && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#3C6CE6' }} />
                          <span className="text-slate-600">Cohort Median</span>
                        </div>
                        <span className="font-bold font-mono text-slate-900">
                          {dim.isGap ? `+${sMed}%` : `${sMed}${dim.unit || ' pts'}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {dim.isGap ? (
                    <div className="border-t border-slate-100 pt-2 mt-2 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Divergence Variance:</span>
                        <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                          diff > 0 ? 'bg-rose-50 text-rose-700' : diff < 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {diff > 0 ? `+${diff}% higher gap` : `${diff}% lower gap`}
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-700 font-medium">
                        ⚠️ High execution gap flags potential Goodhart's Law SLA gaming.
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-slate-100 pt-2 mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Head-to-Head Delta:</span>
                      <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                        diff > 0 ? 'bg-emerald-50 text-emerald-700' :
                        diff < 0 ? 'bg-rose-50 text-rose-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {diff > 0 ? `+${diff}` : `${diff}`} {dim.unit || 'pts'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Unified SVG Bar Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 980 400"
              className="w-full h-auto min-w-[760px] max-w-full select-none"
              onMouseLeave={() => setHoveredCluster(null)}
            >
              {(() => {
                const numCols = activeMetrics.length;
                const totalPlotWidth = 910;
                const colW = totalPlotWidth / numCols;
                const yBase = 330;
                const yTop = numCols === 11 ? 48 : 36;
                const plotHeight = yBase - yTop;

                return (
                  <>
                    {/* Top Grouping Banners when in All Metrics (11D) mode */}
                    {numCols === 11 && (
                      <g>
                        {/* Core Capabilities Ribbon (cols 0-7) */}
                        <rect
                          x="50"
                          y="10"
                          width={8 * colW - 6}
                          height="22"
                          rx="4"
                          fill="#F1F5F9"
                          stroke="#CBD5E1"
                          strokeWidth="1"
                        />
                        <text
                          x={50 + (8 * colW - 6) / 2}
                          y="25"
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="700"
                          fill="#475569"
                          letterSpacing="0.05em"
                        >
                          8 CORE CYBER RESILIENCE CAPABILITIES
                        </text>

                        {/* Triage & SLA Integrity Ribbon (cols 8-10) */}
                        <rect
                          x={50 + 8 * colW + 4}
                          y="10"
                          width={3 * colW - 4}
                          height="22"
                          rx="4"
                          fill="#FEF2F2"
                          stroke="#FCA5A5"
                          strokeWidth="1"
                        />
                        <text
                          x={50 + 8 * colW + 4 + (3 * colW - 4) / 2}
                          y="25"
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="700"
                          fill="#991B1B"
                          letterSpacing="0.05em"
                        >
                          STATUTORY TRIAGE &amp; SLA INTEGRITY
                        </text>

                        {/* Vertical Section Divider */}
                        <line
                          x1={50 + 8 * colW}
                          y1="36"
                          x2={50 + 8 * colW}
                          y2="385"
                          stroke="#CBD5E1"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                      </g>
                    )}

                    {/* Horizontal Gridlines (0, 20, 40, 60, 80, 100) */}
                    {[100, 80, 60, 40, 20, 0].map(val => {
                      const y = yBase - (val / 100) * plotHeight;
                      return (
                        <g key={val}>
                          <line
                            x1="50"
                            y1={y}
                            x2="960"
                            y2={y}
                            stroke={val === 0 ? "#94A3B8" : "#E2E8F0"}
                            strokeWidth={val === 0 ? "1.5" : "1"}
                            strokeDasharray={val === 0 ? "" : "3 3"}
                          />
                          <text
                            x="42"
                            y={y + 4}
                            textAnchor="end"
                            fontSize="11"
                            fontWeight="500"
                            fontFamily="monospace"
                            fill="#64748B"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Metric Bar Clusters */}
                    {activeMetrics.map((metric, i) => {
                      const s1 = getMetricScore(e1, metric.key);
                      const s2 = getMetricScore(e2, metric.key);
                      const sMed = sectorMedianScores[metric.key] ?? 60;

                      const cx = 50 + i * colW + colW / 2;

                      // Active Series List for dynamic grouping
                      const seriesList = [
                        showE1 && { id: 'e1', color: '#DE7E56', textColor: '#9C461F', score: s1 },
                        showE2 && { id: 'e2', color: '#52C5BC', textColor: '#0D7A73', score: s2 },
                        showMedian && { id: 'median', color: '#3C6CE6', textColor: '#1D4ED8', score: sMed }
                      ].filter(Boolean) as Array<{ id: string; color: string; textColor: string; score: number }>;

                      const n = seriesList.length;
                      const barW = numCols === 11 ? (n === 3 ? 16 : n === 2 ? 22 : 30) : numCols === 8 ? (n === 3 ? 20 : n === 2 ? 28 : 38) : (n === 3 ? 36 : n === 2 ? 48 : 64);
                      const barGap = numCols === 11 ? (n === 3 ? 3 : n === 2 ? 4 : 0) : numCols === 8 ? 4 : 8;
                      const totalW = n * barW + Math.max(0, n - 1) * barGap;
                      const startX = cx - totalW / 2;

                      const isHovered = hoveredCluster === i;

                      return (
                        <g
                          key={metric.key}
                          onMouseEnter={() => setHoveredCluster(i)}
                          className="cursor-pointer"
                        >
                          {/* Hover column background highlight */}
                          <rect
                            x={50 + i * colW + 2}
                            y={yTop - 6}
                            width={colW - 4}
                            height={plotHeight + 35}
                            fill={isHovered ? "rgba(15, 23, 42, 0.035)" : "transparent"}
                            rx="6"
                            className="transition-all duration-150"
                          />

                          {/* Bars in Cluster */}
                          {seriesList.map((item, idx) => {
                            const clamped = Math.max(0, Math.min(100, item.score));
                            const barH = (clamped / 100) * plotHeight;
                            const barY = yBase - barH;
                            const barX = startX + idx * (barW + barGap);

                            return (
                              <g key={item.id}>
                                <rect
                                  x={barX}
                                  y={barY}
                                  width={barW}
                                  height={Math.max(2, barH)}
                                  fill={item.color}
                                  rx="2"
                                  className="transition-all duration-200 hover:brightness-110"
                                />

                                {/* Exact Value on top of bar */}
                                {showValuesOnBars && (
                                  <text
                                    x={barX + barW / 2}
                                    y={Math.min(yBase - 5, barY - 4)}
                                    textAnchor="middle"
                                    fontSize={numCols === 11 ? "9" : numCols === 8 ? "10" : "12"}
                                    fontWeight="bold"
                                    fontFamily="monospace"
                                    fill={item.textColor}
                                  >
                                    {metric.isGap ? `+${Math.round(clamped)}%` : metric.unit ? `${Math.round(clamped)}%` : `${Math.round(clamped)}`}
                                  </text>
                                )}
                              </g>
                            );
                          })}

                          {/* Primary Metric Label on X-axis */}
                          <text
                            x={cx}
                            y="354"
                            textAnchor="middle"
                            fontSize={numCols === 11 ? "10" : "12"}
                            fontWeight={isHovered ? "700" : "600"}
                            fill={isHovered ? "#0F172A" : metric.category === 'triage' ? "#991B1B" : "#334155"}
                            fontFamily="sans-serif"
                          >
                            {metric.shortLabel}
                          </text>

                          {/* Category Tag on X-axis */}
                          <text
                            x={cx}
                            y="368"
                            textAnchor="middle"
                            fontSize="8.5"
                            fontWeight="600"
                            fill={metric.category === 'triage' ? "#DC2626" : "#94A3B8"}
                            fontFamily="monospace"
                          >
                            {metric.category === 'triage' ? 'TRIAGE' : 'NCIIPC'}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>

          {/* Bottom Explanatory Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-2 border-t border-slate-200/80 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-slate-600">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 inline-block" />
                <span className="text-slate-500 font-medium">Core Capabilities: <strong className="text-slate-700">8 NCIIPC Dimensions (0–100 pts)</strong></span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-red-400 inline-block" />
                <span className="text-slate-500 font-medium">Triage Integrity: <strong className="text-slate-700">Reported SLA % · Evidence Quality % · Divergence Gap %</strong></span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
              <span>NCIIPC Guidelines v2.4</span>
              <span>•</span>
              <span>Section 70A Supervisory Baseline</span>
            </div>
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
              <tbody className="divide-y divide-slate-200/80">
                {/* Row 1: Total Alerts - Light Sky Blue */}
                <tr className="bg-sky-50/70 hover:bg-sky-100/70 transition-colors border-l-4 border-l-sky-400">
                  <td className="py-3 px-6 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                      <span>Total Security Alerts Ingested</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-mono font-bold text-slate-800">{e1.alertCount} Alerts</td>
                  <td className="py-3 px-6 font-mono font-bold text-slate-800">{e2.alertCount} Alerts</td>
                  <td className="py-3 px-6 font-mono text-right">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-sky-100/90 text-sky-800 border border-sky-200/80">
                      {e1.alertCount - e2.alertCount > 0 ? `+${e1.alertCount - e2.alertCount}` : e1.alertCount - e2.alertCount}
                    </span>
                  </td>
                </tr>

                {/* Row 2: Monitored Assets - Light Indigo */}
                <tr className="bg-indigo-50/65 hover:bg-indigo-100/65 transition-colors border-l-4 border-l-indigo-400">
                  <td className="py-3 px-6 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <span>Critical Infrastructure Assets Monitored</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-mono font-bold text-slate-800">{e1.assetCount} Systems</td>
                  <td className="py-3 px-6 font-mono font-bold text-slate-800">{e2.assetCount} Systems</td>
                  <td className="py-3 px-6 font-mono text-right">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-100/90 text-indigo-800 border border-indigo-200/80">
                      {e1.assetCount - e2.assetCount}
                    </span>
                  </td>
                </tr>

                {/* Row 3: Headline SLA % - Light Emerald */}
                <tr className="bg-emerald-50/75 hover:bg-emerald-100/75 transition-colors border-l-4 border-l-emerald-500">
                  <td className="py-3 px-6 font-semibold text-emerald-950">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>Reported Headline SLA % (&lt;60m target)</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-mono font-bold text-emerald-700">{e1.headlineSlaPct}%</td>
                  <td className="py-3 px-6 font-mono font-bold text-emerald-700">{e2.headlineSlaPct}%</td>
                  <td className="py-3 px-6 font-mono text-right">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300/80">
                      {deltas?.slaDiff && deltas.slaDiff > 0 ? `+${deltas.slaDiff}%` : `${deltas?.slaDiff}%`}
                    </span>
                  </td>
                </tr>

                {/* Row 4: Forensic Evidence Quality - Light Blue */}
                <tr className="bg-blue-50/75 hover:bg-blue-100/75 transition-colors border-l-4 border-l-blue-500">
                  <td className="py-3 px-6 font-semibold text-blue-950">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span>Forensic Evidence Quality Score</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-mono font-bold text-blue-700">{e1.evidenceQualityScore}%</td>
                  <td className="py-3 px-6 font-mono font-bold text-purple-700">{e2.evidenceQualityScore}%</td>
                  <td className="py-3 px-6 font-mono text-right">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300/80">
                      {deltas?.evidenceQualityDiff && deltas.evidenceQualityDiff > 0 ? `+${deltas.evidenceQualityDiff} pts` : `${deltas?.evidenceQualityDiff} pts`}
                    </span>
                  </td>
                </tr>

                {/* Row 5: Execution Discrepancy Gap - Light Rose / Red Highlight */}
                <tr className="bg-rose-50/90 hover:bg-rose-100/90 transition-colors border-l-4 border-l-rose-500">
                  <td className="py-3 px-6 font-bold text-rose-950">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span>Execution Discrepancy Gap Size</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-200 text-rose-900 rounded font-mono border border-rose-300">
                        Goodhart Risk
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-mono font-bold text-rose-700">+{e1.executionGapSize}%</td>
                  <td className="py-3 px-6 font-mono font-bold text-rose-700">+{e2.executionGapSize}%</td>
                  <td className="py-3 px-6 font-mono text-right">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                      {deltas?.gapDiff && deltas.gapDiff > 0 ? `+${deltas.gapDiff}%` : `${deltas?.gapDiff}%`}
                    </span>
                  </td>
                </tr>

                {/* Row 6: Fast Closures Rate - Light Amber */}
                <tr className="bg-amber-50/80 hover:bg-amber-100/80 transition-colors border-l-4 border-l-amber-500">
                  <td className="py-3 px-6 font-semibold text-amber-950">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span>Fast Closures (&lt;10m) Rate</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-mono font-bold text-amber-800">{e1.fastClosePct}%</td>
                  <td className="py-3 px-6 font-mono font-bold text-amber-800">{e2.fastClosePct}%</td>
                  <td className="py-3 px-6 font-mono text-right">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300/80">
                      {deltas?.fastCloseDiff && deltas.fastCloseDiff > 0 ? `+${deltas.fastCloseDiff}%` : `${deltas?.fastCloseDiff}%`}
                    </span>
                  </td>
                </tr>

                {/* Row 7: Unescalated Critical Alert Ratio - Light Orange */}
                <tr className="bg-orange-50/80 hover:bg-orange-100/80 transition-colors border-l-4 border-l-orange-500">
                  <td className="py-3 px-6 font-semibold text-orange-950">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                      <span>Unescalated Critical Alert Ratio</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-mono font-bold text-orange-800">{e1.unescalatedCriticalPct}%</td>
                  <td className="py-3 px-6 font-mono font-bold text-orange-800">{e2.unescalatedCriticalPct}%</td>
                  <td className="py-3 px-6 font-mono text-right">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-300/80">
                      {deltas?.unescalatedDiff && deltas.unescalatedDiff > 0 ? `+${deltas.unescalatedDiff}%` : `${deltas?.unescalatedDiff}%`}
                    </span>
                  </td>
                </tr>

                {/* Row 8: Supervisory Findings - Light Purple */}
                <tr className="bg-purple-50/75 hover:bg-purple-100/75 transition-colors border-l-4 border-l-purple-500">
                  <td className="py-3 px-6 font-semibold text-purple-950">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                      <span>Total Validated Supervisory Findings</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-mono font-bold text-purple-800">{e1.findingsCount} Findings</td>
                  <td className="py-3 px-6 font-mono font-bold text-purple-800">{e2.findingsCount} Findings</td>
                  <td className="py-3 px-6 font-mono text-right">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300/80">
                      {deltas?.findingsDiff && deltas.findingsDiff > 0 ? `+${deltas.findingsDiff}` : `${deltas?.findingsDiff}`}
                    </span>
                  </td>
                </tr>

                {/* Row 9: Risk Tier & Attention - Light Teal */}
                <tr className="bg-teal-50/75 hover:bg-teal-100/75 transition-colors border-l-4 border-l-teal-500">
                  <td className="py-3 px-6 font-semibold text-teal-950">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                      <span>Supervisory Attention &amp; Risk Tier</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-bold">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono tracking-wider border shadow-2xs ${
                      e1.riskLevel === 'CRITICAL'
                        ? 'bg-red-100 text-red-900 border-red-300'
                        : e1.riskLevel === 'HIGH'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}>
                      {e1.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-6 font-bold">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono tracking-wider border shadow-2xs ${
                      e2.riskLevel === 'CRITICAL'
                        ? 'bg-red-100 text-red-900 border-red-300'
                        : e2.riskLevel === 'HIGH'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}>
                      {e2.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-6 font-mono text-right">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300/80">
                      Rank #{e1.rank} vs #{e2.rank}
                    </span>
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
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-slate-900">
                  NCIIPC Statutory Supervisory Synthesis &amp; Legal Seal
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {aiSynthesis?.engine || 'Local Air-Gapped (Ollama / Qwen2.5:3B)'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Section 65B Indian Evidence Act Cryptographic Certificate of Operational Review
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fetchAiPeerSynthesis(data)}
              disabled={isGeneratingAi}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin text-red-600' : ''}`} />
              <span>{isGeneratingAi ? 'Synthesizing...' : 'Re-synthesize AI'}</span>
            </button>
            <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              SHA-256 VERIFIED
            </span>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-600">
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5">
              <Bot className="w-3.5 h-3.5 text-red-600" />
              <span>Supervisory Conclusion (Air-Gapped AI Synthesis)</span>
            </h4>

            {isGeneratingAi && !aiSynthesis ? (
              <div className="p-3 text-center text-xs text-slate-500 animate-pulse flex items-center justify-center gap-2 bg-slate-50 rounded-xl border border-slate-200">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-600" />
                <span>Local Qwen2.5:3B is evaluating cross-entity Goodhart's law discrepancy...</span>
              </div>
            ) : (
              <div className={`relative bg-slate-50/90 p-3 sm:p-3.5 rounded-xl border border-slate-200/90 transition-opacity ${isGeneratingAi ? 'opacity-50' : 'opacity-100'}`}>
                <div className="prose prose-xs max-w-none text-slate-700 leading-normal space-y-1.5">
                  <ReactMarkdown
                    components={{
                      p: ({ children }: any) => (
                        <p className="text-[12.5px] leading-relaxed text-slate-800 mb-1.5 last:mb-0 font-normal">
                          {React.Children.map(children, child =>
                            typeof child === 'string' ? highlightWordsColorful(child) : child
                          )}
                        </p>
                      ),
                      li: ({ children }: any) => (
                        <li className="text-[12px] text-slate-800 leading-relaxed mb-1">
                          {React.Children.map(children, child =>
                            typeof child === 'string' ? highlightWordsColorful(child) : child
                          )}
                        </li>
                      ),
                      ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-1 text-[12px]" {...props} />,
                      strong: ({ children }: any) => (
                        <strong className="font-bold text-slate-900">
                          {children}
                        </strong>
                      )
                    }}
                  >
                    {aiSynthesis?.narrative || (
                      `While **${e1?.code}** reports **${e1?.headlineSlaPct}% SLA compliance**, underlying investigation telemetry verifies only **${e1?.evidenceQualityScore}% Evidence Quality**, exposing an execution gap of **+${e1?.executionGapSize}%** under Goodhart's Law compared to **${e2?.code}**'s authentic **${e2?.evidenceQualityScore}% Evidence Quality**. Pursuant to **NCIIPC Guidelines v2.4**, supervisory examiners mandate a priority **Section 70A verification directive** to inspect triage depth and unescalated alerts.`
                    )}
                  </ReactMarkdown>
                </div>
                {isGeneratingAi && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-xs rounded-xl flex items-center justify-center text-xs font-bold text-slate-700 gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-600" />
                    <span>Re-synthesizing compact peer comparison via local Qwen2.5:3B...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comparative Forensic Evidence Table (Side-by-Side View) */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Comparative Operational Metric</th>
                  <th className="py-2.5 px-3 text-indigo-700 font-mono">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      {e1?.code || 'Entity A'}
                    </span>
                  </th>
                  <th className="py-2.5 px-3 text-purple-700 font-mono">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      {e2?.code || 'Entity B'}
                    </span>
                  </th>
                  <th className="py-2.5 px-3 text-slate-700">Forensic Discrepancy (Goodhart Variance)</th>
                  <th className="py-2.5 px-3 text-right">Statutory Determination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11.5px]">
                {/* Row 1: Self-Reported SLA */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2 px-3 font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>Self-Reported SLA Compliance</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-semibold text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/60 underline decoration-amber-400 decoration-1 underline-offset-2">
                      {e1?.headlineSlaPct}% SLA
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-semibold text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/60 underline decoration-amber-400 decoration-1 underline-offset-2">
                      {e2?.headlineSlaPct}% SLA
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600">
                    Δ {Math.abs((e1?.headlineSlaPct ?? 0) - (e2?.headlineSlaPct ?? 0)).toFixed(1)}% variance
                  </td>
                  <td className="py-2 px-3 text-right text-[10.5px] font-semibold text-slate-500">
                    Self-attested metric
                  </td>
                </tr>

                {/* Row 2: Forensic Evidence Quality */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2 px-3 font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Forensic Evidence Quality</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`font-semibold px-2 py-0.5 rounded border ${
                      (e1?.evidenceQualityScore ?? 0) >= 70
                        ? 'text-emerald-800 bg-emerald-50/80 border-emerald-200/60 underline decoration-emerald-400 decoration-1 underline-offset-2'
                        : 'text-rose-800 bg-rose-50/80 border-rose-200/60 underline decoration-rose-400 decoration-1 underline-offset-2'
                    }`}>
                      {e1?.evidenceQualityScore}% Evidence
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`font-semibold px-2 py-0.5 rounded border ${
                      (e2?.evidenceQualityScore ?? 0) >= 70
                        ? 'text-emerald-800 bg-emerald-50/80 border-emerald-200/60 underline decoration-emerald-400 decoration-1 underline-offset-2'
                        : 'text-rose-800 bg-rose-50/80 border-rose-200/60 underline decoration-rose-400 decoration-1 underline-offset-2'
                    }`}>
                      {e2?.evidenceQualityScore}% Evidence
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600">
                    Δ {Math.abs((e1?.evidenceQualityScore ?? 0) - (e2?.evidenceQualityScore ?? 0)).toFixed(1)}% verification gap
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      Telemetry Proven
                    </span>
                  </td>
                </tr>

                {/* Row 3: Execution Gap */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-2 px-3 font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>Execution Gap (Goodhart's Law)</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`font-semibold px-2 py-0.5 rounded border ${
                      (e1?.executionGapSize ?? 0) > 30
                        ? 'text-rose-800 bg-rose-50/80 border-rose-200/60 underline decoration-rose-500 decoration-2 underline-offset-2'
                        : 'text-emerald-800 bg-emerald-50/80 border-emerald-200/60 underline decoration-emerald-500 decoration-1 underline-offset-2'
                    }`}>
                      +{e1?.executionGapSize}% Gap
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`font-semibold px-2 py-0.5 rounded border ${
                      (e2?.executionGapSize ?? 0) > 30
                        ? 'text-rose-800 bg-rose-50/80 border-rose-200/60 underline decoration-rose-500 decoration-2 underline-offset-2'
                        : 'text-emerald-800 bg-emerald-50/80 border-emerald-200/60 underline decoration-emerald-500 decoration-1 underline-offset-2'
                    }`}>
                      +{e2?.executionGapSize}% Gap
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600">
                    {(e1?.executionGapSize ?? 0) > (e2?.executionGapSize ?? 0) 
                      ? `${e1?.code} exhibits metric gaming` 
                      : (e2?.executionGapSize ?? 0) > (e1?.executionGapSize ?? 0)
                      ? `${e2?.code} exhibits metric gaming`
                      : 'Parity'}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                      Section 70A Trigger
                    </span>
                  </td>
                </tr>

                {/* Row 4: Supervisory Determination */}
                <tr className="bg-slate-50/40">
                  <td className="py-2 px-3 font-semibold text-slate-800">
                    Statutory Supervisory Status
                  </td>
                  <td className="py-2 px-3">
                    {(e1?.executionGapSize ?? 0) > 30 ? (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100/90 border border-rose-300 px-2 py-0.5 rounded text-[11px]">
                        <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
                        Priority Rectification Notice
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        Forensically Verified
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {(e2?.executionGapSize ?? 0) > 30 ? (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100/90 border border-rose-300 px-2 py-0.5 rounded text-[11px]">
                        <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
                        Priority Rectification Notice
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        Forensically Verified
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-slate-700 font-medium" colSpan={2}>
                    <span className="text-[11px] text-blue-900 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200">
                      Pursuant to NCIIPC Guidelines v2.4 &amp; IT Act §70B
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 65B Cryptographic Metadata Block - Positioned Below */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 font-mono text-[11px] space-y-2.5 shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <span className="font-bold tracking-wider shrink-0 text-slate-600">STATUTORY HASH:</span>
                <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded shadow-2xs truncate max-w-[280px]" title={data?.certificateHash}>
                  {data?.certificateHash}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <span className="font-bold tracking-wider shrink-0 text-slate-600">EVALUATED AT:</span>
                <span className="font-bold text-slate-900 bg-slate-200/80 border border-slate-300 px-2 py-0.5 rounded font-sans">
                  {data?.evaluatedAt ? new Date(data.evaluatedAt).toLocaleString() : 'Live'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <span className="font-bold tracking-wider shrink-0 text-slate-600">FRAMEWORK:</span>
                <span className="font-bold text-blue-900 bg-blue-50/90 border border-blue-200/90 px-2 py-0.5 rounded font-sans">
                  NCIIPC CSE Cyber Resilience Guidelines v2.4
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <span className="font-bold tracking-wider shrink-0 text-slate-600">LEGAL CITATION:</span>
                <span className="font-bold text-red-900 bg-red-50/90 border border-red-200/90 px-2 py-0.5 rounded font-sans">
                  IT Act 2000 §70B &amp; Evidence Act §65B
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-slate-500 pt-2 border-t border-slate-200">
              <span className="font-bold tracking-wider shrink-0 text-slate-600 text-[10px]">SYNTHESIS ENGINE:</span>
              <span className="font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded flex items-center gap-1.5 font-sans text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{aiSynthesis?.engine || 'Local Air-Gapped (Ollama / Qwen2.5:3B)'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerComparisonView;
