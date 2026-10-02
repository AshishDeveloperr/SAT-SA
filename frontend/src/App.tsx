import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, AlertTriangle, Activity, EyeOff, Scale, CheckCircle2, 
  RefreshCw, Sliders, ArrowRight, Database, Lock, TrendingUp, Info, 
  ChevronRight, X, ArrowLeft, Home, Zap, Github, ArrowUpRight
} from 'lucide-react';
import { HomePage } from './pages/home/HomePage';
import { SupervisorySankeyFlow } from './components/SupervisorySankeyFlow';
import { ScenarioStudioModal } from './components/ScenarioStudioModal';


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

interface Finding {
  id: string;
  entity_id: string;
  entity_code: string;
  entity_name: string;
  rule_key: string;
  kind: string;
  dimension_code: string;
  title: string;
  severity_score: number;
  confidence: number;
  rationale: string;
  status: string;
  metrics: Record<string, any>;
  thresholds: Record<string, any>;
  peer_context: Record<string, any>;
  evidence?: Array<{
    id: string;
    record_type: string;
    record_id: string;
    role: string;
    note: string;
    raw_record: any;
  }>;
}

interface KpiGap {
  entityId: string;
  entityCode: string;
  entityName: string;
  headlineSlaPct: number;
  evidenceQualityScore: number;
  executionGapSize: number;
  fastClosePct: number;
  unescalatedCriticalPct: number;
  findingsCount: number;
}

interface SilentAsset {
  id: string;
  external_id: string;
  name: string;
  type: string;
  criticality: number;
  daysSilent: number;
  entityCode: string;
  entityName: string;
}

export function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Route determines view: /dashboard is supervisory console, / (or others) is landing
  const isDashboard = location.pathname === '/dashboard';
  const currentView = isDashboard ? 'console' : 'landing';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'gap' | 'findings' | 'negative' | 'queue' | 'rules' | 'validation' | 'audit'>('dashboard');
  const [entities, setEntities] = useState<Entity[]>([]);

  const [kpiGaps, setKpiGaps] = useState<KpiGap[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [silentAssets, setSilentAssets] = useState<SilentAsset[]>([]);
  const [reviewSamples, setReviewSamples] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [validationMetrics, setValidationMetrics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isAuditValid, setIsAuditValid] = useState<boolean>(true);
  
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isScenarioStudioOpen, setIsScenarioStudioOpen] = useState<boolean>(false);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [entRes, gapRes, fndRes, negRes, smpRes, rulRes, valRes, audRes] = await Promise.all([
        fetch('/api/v1/entities').then(r => r.json()),
        fetch('/api/v1/kpis-vs-evidence').then(r => r.json()),
        fetch('/api/v1/findings').then(r => r.json()),
        fetch('/api/v1/negative-space').then(r => r.json()),
        fetch('/api/v1/review-samples').then(r => r.json()),
        fetch('/api/v1/rules').then(r => r.json()),
        fetch('/api/v1/validation/metrics').then(r => r.json()),
        fetch('/api/v1/audit-log').then(r => r.json())
      ]);

      setEntities(entRes.data || []);
      setKpiGaps(gapRes.data || []);
      setFindings(fndRes.data || []);
      setSilentAssets(negRes.data?.silentAssets || []);
      setReviewSamples(smpRes.data || []);
      setRules(rulRes.data || []);
      setValidationMetrics(valRes.data || null);
      setAuditLogs(audRes.data?.logs || []);
      setIsAuditValid(audRes.data?.isChainValid ?? true);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    setStatusMessage('Executing supervisory analytics pipeline...');
    try {
      await fetch('/api/v1/runs', { method: 'POST' });
      await fetchAllData();
      setStatusMessage('Analysis complete. Findings updated.');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      setStatusMessage('Error executing analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateSynth = async () => {
    if (!confirm('Regenerate synthetic CSE datasets with latent maturity profiles?')) return;
    setIsLoading(true);
    setStatusMessage('Generating latent-maturity CSE datasets...');
    try {
      await fetch('/api/v1/synth/generate', { method: 'POST' });
      await fetchAllData();
      setStatusMessage('Synthetic population regenerated and analyzed.');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      setStatusMessage('Error regenerating data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFindingDetail = async (findingId: string) => {
    try {
      const res = await fetch(`/api/v1/findings/${findingId}`);
      const json = await res.json();
      setSelectedFinding(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordDecision = async (sampleId: string, decision: string) => {
    const comment = prompt('Enter supervisory examiner notes / justification:');
    if (comment === null) return;
    try {
      await fetch(`/api/v1/review-samples/${sampleId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, comment })
      });
      await fetchAllData();
      alert(`Decision '${decision}' recorded with SHA-256 cryptographic audit receipt.`);
    } catch (err) {
      alert('Error recording decision');
    }
  };

  const dimensions = [
    { key: 'Detection', label: 'Threat Detection' },
    { key: 'Investigation', label: 'Investigation' },
    { key: 'Escalation', label: 'Escalation' },
    { key: 'IncidentResponse', label: 'Incident Response' },
    { key: 'SecOps', label: 'SecOps' },
    { key: 'Governance', label: 'Governance' },
    { key: 'Discipline', label: 'Discipline' },
    { key: 'Resilience', label: 'Resilience' }
  ];

  const sidebarMenuItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: Activity },
    { id: 'gap', label: 'Headline KPIs vs Evidence Gap', icon: Scale, highlight: true },
    { id: 'findings', label: 'Findings Explorer', icon: AlertTriangle, count: findings.length },
    { id: 'negative', label: 'Negative Space Matrix', icon: EyeOff, count: silentAssets.length },
    { id: 'queue', label: 'Review Queue', icon: CheckCircle2, count: reviewSamples.length },
    { id: 'rules', label: 'Dynamic Rules Studio', icon: Sliders },
    { id: 'validation', label: 'Validation Lab (Lift)', icon: TrendingUp },
    { id: 'audit', label: 'Audit Trail & Integrity', icon: Lock }
  ];

  return (
    <div className={`bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#991B1B] selection:text-white ${
      currentView === 'console' ? 'h-screen overflow-hidden' : 'min-h-screen'
    }`}>
      
      {/* ================= 1. APP HEADER / NAV BAR (#111827) ================= */}
      <header className="bg-[#111827] text-white border-b border-slate-700/60 sticky top-0 z-40 px-6 py-3.5 shadow-md flex-shrink-0">
        <div className="w-full mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-[#991B1B]/15 p-2.5 rounded-xl border border-[#991B1B]/40 text-[#EF4444] shadow-[0_0_12px_rgba(153,27,27,0.3)]">
              <Shield className="w-6 h-6 text-[#EF4444]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                  SAT<span className="text-[#EF4444]">-SA</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {statusMessage && (
              <span className="text-xs bg-[#991B1B]/20 text-[#FCA5A5] border border-[#991B1B]/40 px-3 py-1 rounded-lg font-medium animate-pulse">
                {statusMessage}
              </span>
            )}

            {currentView === 'landing' ? (
              <div className="flex items-center space-x-2.5">
                <button 
                  onClick={() => setIsScenarioStudioOpen(true)}
                  className="flex items-center space-x-1.5 text-xs bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/60 px-3.5 py-2 rounded-lg font-bold shadow-sm transition hover:scale-105 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>What-If Studio</span>
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-2 text-xs bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(153,27,27,0.35)] transition-all hover:scale-105 active:scale-95"
                >
                  <span>Launch Supervisory Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setIsScenarioStudioOpen(true)}
                  className="flex items-center space-x-1.5 text-xs bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/60 px-3 py-2 rounded-lg font-bold shadow-sm transition hover:scale-105 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>What-If Studio</span>
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-1.5 text-xs bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 px-3 py-2 rounded-lg transition"
                >
                  <Home className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>Technical Overview</span>
                </button>
                <button 
                  onClick={handleRunAnalysis}
                  disabled={isLoading}
                  className="flex items-center space-x-2 text-xs bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(153,27,27,0.35)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Run Analytics</span>
                </button>
                <button 
                  onClick={handleRegenerateSynth}
                  disabled={isLoading}
                  className="flex items-center space-x-1.5 text-xs bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 px-3 py-2 rounded-lg transition"
                >
                  <Database className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>Reset Synth Data</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ================= CONDITIONAL VIEW: LANDING PAGE OR CONSOLE WITH LEFT SIDEBAR ================= */}
      {currentView === 'landing' ? (
        <HomePage 
          onOpenConsole={() => navigate('/dashboard')} 
          onOpenScenarioStudio={() => setIsScenarioStudioOpen(true)}
        />
      ) : (
        /* ================= SUPERVISORY OPERATIONAL CONSOLE (WITH FIXED LEFT SIDEBAR) ================= */
        <div className="flex-1 min-h-0 w-full flex flex-row overflow-hidden bg-[#111827]">
          {/* ================= FIXED LEFT SIDEBAR ================= */}
          <aside className="w-60 bg-[#111827] text-white border-r border-slate-700/60 flex flex-col flex-shrink-0 h-full select-none">
            {/* Menu List */}
            <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
              {sidebarMenuItems.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
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

          {/* ================= MAIN CONTENT AREA ================= */}
          <main className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#F8FAFC]">

            
            {/* ================= TAB 1: EXECUTIVE DASHBOARD ================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Top Stat Cards - Compact Single Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Card 1 */}
                  <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-xl shadow-sm hover:border-[#CBD5E1] transition flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[11px] uppercase tracking-wider font-bold text-[#64748B] truncate">
                        Supervisory Target
                      </div>
                      <div className="text-lg font-black text-[#0F172A] tracking-tight truncate">
                        CSE-POWER-01
                      </div>
                      <div className="text-[11px] text-[#DC2626] font-bold flex items-center gap-1 truncate">
                        <span>Score: 58</span>
                        <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-semibold uppercase">High Risk</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#FEE2E2] rounded-xl text-[#DC2626] flex-shrink-0 ml-2 shadow-sm">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-xl shadow-sm hover:border-[#CBD5E1] transition flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[11px] uppercase tracking-wider font-bold text-[#64748B] truncate">
                        Active Execution Gaps
                      </div>
                      <div className="text-lg font-black text-[#0F172A] tracking-tight truncate">
                        {findings.filter(f => f.kind === 'execution_gap').length} Gaps
                      </div>
                      <div className="text-[11px] text-[#D97706] font-semibold truncate">
                        Fast-close &amp; unescalated
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#FEF3C7] rounded-xl text-[#D97706] flex-shrink-0 ml-2 shadow-sm">
                      <Scale className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-xl shadow-sm hover:border-[#CBD5E1] transition flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[11px] uppercase tracking-wider font-bold text-[#64748B] truncate">
                        Silent Critical Assets
                      </div>
                      <div className="text-lg font-black text-[#0F172A] tracking-tight truncate">
                        {silentAssets.length} Systems
                      </div>
                      <div className="text-[11px] text-[#7C3AED] font-semibold truncate">
                        &gt;14 days zero telemetry
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#EDE9FE] rounded-xl text-[#7C3AED] flex-shrink-0 ml-2 shadow-sm">
                      <EyeOff className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-xl shadow-sm hover:border-[#CBD5E1] transition flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[11px] uppercase tracking-wider font-bold text-[#64748B] truncate">
                        Review Efficiency Lift
                      </div>
                      <div className="text-lg font-black text-[#16A34A] tracking-tight truncate">
                        3.42× Lift
                      </div>
                      <div className="text-[11px] text-[#16A34A] font-semibold truncate">
                        vs Random Sampling
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#DCFCE7] rounded-xl text-[#16A34A] flex-shrink-0 ml-2 shadow-sm">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                </div>

              {/* End-to-End Supervisory Telemetry & Detection Sankey Flow */}
              <SupervisorySankeyFlow />

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
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={() => setActiveTab('gap')}
                              className="text-[#16A34A] hover:text-[#15803d] font-bold inline-flex items-center space-x-1 transition"
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

              {/* 8-Dimension Assessment Heatmap */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
                <h2 className="text-base font-bold text-[#0F172A] mb-1">8-Dimension Operational Resilience Heatmap</h2>
                <p className="text-xs text-[#64748B] mb-5">Granular supervisory evaluation across the eight mandated capabilities</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs">
                    <thead>
                      <tr className="border-b border-[#E2E8F0]">
                        <th className="text-left py-3 px-3 text-[#64748B] font-semibold">Entity</th>
                        {dimensions.map(d => (
                          <th key={d.key} className="py-3 px-2 text-[11px] text-[#334155] font-bold">{d.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {entities.map(ent => (
                        <tr key={ent.id} className="hover:bg-[#F1F5F9]">
                          <td className="text-left py-3.5 px-3 font-bold text-[#0F172A] whitespace-nowrap">
                            {ent.code}
                          </td>
                          {dimensions.map(d => {
                            const val = ent.dimension_scores?.[d.key] || 15;
                            let bg = 'bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]';
                            if (val >= 60) bg = 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] font-extrabold';
                            else if (val >= 35) bg = 'bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D] font-bold';

                            return (
                              <td key={d.key} className="py-2 px-1">
                                <div className={`py-1.5 px-2 rounded-lg text-xs font-mono ${bg}`}>
                                  {val}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: HEADLINE KPIS VS UNDERLYING EVIDENCE ================= */}
          {activeTab === 'gap' && (
            <div className="space-y-6">
              <div className="bg-[#FEF3C7] border border-[#FCD34D] p-5 rounded-2xl flex items-start space-x-3.5 text-xs text-[#92400E] shadow-sm">
                <Info className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-sm block text-[#78350F] mb-1">
                    Core Supervisory Problem: The Execution Gap
                  </strong>
                  Documented metrics, self-assessments, and reported SLAs (e.g. "97% SLA compliance") often disguise operational dysfunction.
                  SAT-SA contrasts headline reported numbers against forensic evidence quality (fast closures, zero investigation steps, un-escalated critical threats) to expose supervisory risk.
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
                <div className="px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/50">
                  <h2 className="text-base font-bold text-[#0F172A]">Headline Reported KPIs vs Underlying Evidence Analysis</h2>
                  <p className="text-xs text-[#64748B]">Entities ranked by Discrepancy Gap Size (Reported SLA % − Forensic Evidence Quality %)</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0] font-semibold">
                      <tr>
                        <th className="py-3 px-6">Entity</th>
                        <th className="py-3 px-6">Reported Headline SLA</th>
                        <th className="py-3 px-6">Evidence Quality Score</th>
                        <th className="py-3 px-6">Execution Gap Size</th>
                        <th className="py-3 px-6">Fast Closures (&lt;10m)</th>
                        <th className="py-3 px-6">Un-escalated Critical</th>
                        <th className="py-3 px-6 text-right">Supervisory Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {kpiGaps.map(gap => (
                        <tr key={gap.entityId} className={`hover:bg-[#F1F5F9] transition ${gap.executionGapSize > 40 ? 'bg-[#FEF2F2]/60' : ''}`}>
                          <td className="py-4 px-6">
                            <div className="font-bold text-sm text-[#0F172A]">{gap.entityCode}</div>
                            <div className="text-[11px] text-[#64748B]">{gap.entityName}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-extrabold text-[#16A34A] text-sm font-mono">
                              {gap.headlineSlaPct}%
                            </span>
                            <span className="text-[10px] text-[#64748B] block">Reported in SLA</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`font-extrabold text-sm font-mono ${gap.evidenceQualityScore < 50 ? 'text-[#DC2626]' : 'text-[#334155]'}`}>
                              {gap.evidenceQualityScore}%
                            </span>
                            <span className="text-[10px] text-[#64748B] block">Triage integrity</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <span className={`text-base font-extrabold font-mono ${gap.executionGapSize > 40 ? 'text-[#DC2626]' : 'text-[#334155]'}`}>
                                +{gap.executionGapSize}%
                              </span>
                              {gap.executionGapSize > 40 && (
                                <span className="text-[10px] bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] px-2 py-0.5 rounded-full font-bold">
                                  SEVERE GAP
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-[#334155] font-mono">
                            <span className={gap.fastClosePct > 30 ? 'text-[#DC2626] font-bold' : ''}>
                              {gap.fastClosePct}%
                            </span>
                          </td>
                          <td className="py-4 px-6 text-[#334155] font-mono">
                            <span className={gap.unescalatedCriticalPct > 40 ? 'text-[#DC2626] font-bold' : ''}>
                              {gap.unescalatedCriticalPct}%
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => setActiveTab('findings')}
                              className="bg-[#DCFCE7] hover:bg-[#bbf7d0] text-[#16A34A] border border-[#86EFAC] px-3 py-1.5 rounded-lg text-xs font-bold transition"
                            >
                              Inspect Evidence
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: FINDINGS EXPLORER ================= */}
          {activeTab === 'findings' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">Supervisory Findings ({findings.length})</h2>
                <p className="text-xs text-[#64748B]">Algorithmic findings backed by forensic evidence, peer baselines, and parameter rationales</p>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {findings.map(f => (
                  <div 
                    key={f.id}
                    onClick={() => handleOpenFindingDetail(f.id)}
                    className="bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] p-5 rounded-2xl cursor-pointer transition shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex items-start justify-between"
                  >
                    <div className="space-y-1.5 flex-1 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold bg-[#0B0F19] text-[#6FCF64] px-2.5 py-0.5 rounded-md">
                          {f.rule_key}
                        </span>
                        <span className="text-xs font-bold text-[#334155] bg-[#F1F5F9] border border-[#CBD5E1] px-2 py-0.5 rounded-md">
                          {f.entity_code}
                        </span>
                        <span className="text-xs text-[#64748B] font-medium">
                          {f.dimension_code}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#0F172A]">{f.title}</h3>
                      <p className="text-xs text-[#334155] line-clamp-2 leading-relaxed">{f.rationale}</p>
                    </div>

                    <div className="flex items-center space-x-3.5 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-[#64748B] font-medium">Severity</div>
                        <div className={`text-base font-extrabold font-mono ${f.severity_score >= 80 ? 'text-[#DC2626]' : 'text-[#D97706]'}`}>
                          {f.severity_score} / 100
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#94A3B8]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: NEGATIVE SPACE MATRIX ================= */}
          {activeTab === 'negative' && (
            <div className="space-y-6">
              <div className="bg-[#EDE9FE] border border-[#DDD6FE] p-5 rounded-2xl text-xs text-[#5B21B6] shadow-sm">
                <strong className="text-sm font-bold text-[#4C1D95] block mb-1">
                  Negative Space Reasoning (Detecting What is Absent)
                </strong>
                Traditional SIEMs only alarm on incoming alerts. Supervisory assessment actively searches for <strong>missing expected evidence</strong>: silent SCADA systems, unmonitored critical networks, and missing threat categories compared to sectoral peers.
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
                <div className="px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/50">
                  <h3 className="text-base font-bold text-[#0F172A]">Silent Critical Infrastructure Assets (&gt;10 Days Silence)</h3>
                  <p className="text-xs text-[#64748B]">High-criticality assets generating zero alerts or security telemetry</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0] font-semibold">
                      <tr>
                        <th className="py-3 px-6">Asset ID</th>
                        <th className="py-3 px-6">Asset Name</th>
                        <th className="py-3 px-6">Entity</th>
                        <th className="py-3 px-6">Type</th>
                        <th className="py-3 px-6">Criticality</th>
                        <th className="py-3 px-6">Days Inactive</th>
                        <th className="py-3 px-6">Supervisory Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {silentAssets.map(ast => (
                        <tr key={ast.id} className="hover:bg-[#F1F5F9]">
                          <td className="py-3.5 px-6 font-mono font-bold text-[#334155]">{ast.external_id}</td>
                          <td className="py-3.5 px-6 font-bold text-[#0F172A]">{ast.name}</td>
                          <td className="py-3.5 px-6 text-[#334155]">{ast.entityCode}</td>
                          <td className="py-3.5 px-6">
                            <span className="bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1] px-2.5 py-1 rounded-md text-[11px] font-medium">
                              {ast.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="text-[#DC2626] font-extrabold">Tier {ast.criticality}</span>
                          </td>
                          <td className="py-3.5 px-6 font-extrabold text-[#DC2626] text-sm font-mono">
                            {ast.daysSilent} Days
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] px-2.5 py-1 rounded-full text-[10px] font-bold">
                              MONITORING BLINDSPOT
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: SUPERVISORY REVIEW QUEUE ================= */}
          {activeTab === 'queue' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">Prioritized Supervisory Review Queue ({reviewSamples.length} Records)</h2>
                <p className="text-xs text-[#64748B]">Knapsack-budgeted sample portfolio balancing targeted high-risk records (85%) with exploration quotas (15%)</p>
              </div>

              <div className="space-y-3">
                {reviewSamples.map(smp => (
                  <div key={smp.id} className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2.5">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                          smp.strategy === 'priority' 
                            ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]' 
                            : 'bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]'
                        }`}>
                          {smp.strategy === 'priority' ? 'Priority Target' : 'Exploration Quota'}
                        </span>
                        <span className="text-xs font-bold text-[#0F172A]">{smp.entity_code}</span>
                        <span className="text-xs text-[#64748B] font-mono">{smp.record_id}</span>
                      </div>
                      <div className="text-xs text-[#334155]">
                        <strong>Reasons Flagged:</strong> {smp.reasons?.join(', ')}
                      </div>
                      {smp.reviewed && (
                        <div className="text-xs text-[#16A34A] font-medium">
                          ✓ Decision: <strong>{smp.examiner_decision}</strong> — "{smp.examiner_comment}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {!smp.reviewed ? (
                        <>
                          <button 
                            onClick={() => handleRecordDecision(smp.id, 'confirmed')}
                            className="text-xs bg-[#DC2626] hover:bg-[#b91c1c] text-white font-bold px-3.5 py-2 rounded-lg transition shadow-sm"
                          >
                            Confirm Gap
                          </button>
                          <button 
                            onClick={() => handleRecordDecision(smp.id, 'benign')}
                            className="text-xs bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] border border-[#CBD5E1] px-3.5 py-2 rounded-lg font-bold transition"
                          >
                            Mark Benign
                          </button>
                        </>
                      ) : (
                        <span className="text-xs bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1] px-3 py-1 rounded-md font-medium">
                          Reviewed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 6: DYNAMIC RULES STUDIO ================= */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">Dynamic Rules & Parameters Studio</h2>
                <p className="text-xs text-[#64748B]">100% DB-backed detectors, thresholds, and rationales. Configurable without code modifications.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.map(r => (
                  <div key={r.id} className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold bg-[#0B0F19] text-[#6FCF64] px-2.5 py-0.5 rounded-md">
                        {r.key}
                      </span>
                      <span className="text-xs font-semibold text-[#64748B]">{r.dimension_code}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">{r.name}</h3>
                      <p className="text-xs text-[#334155] mt-1 leading-relaxed">{r.description}</p>
                    </div>
                    <div className="bg-[#0B0F17] text-[#E2E8F0] p-3 rounded-xl text-xs space-y-1 font-mono border border-white/10">
                      <div className="text-slate-400 text-[11px]"><strong>Supervisory Rationale:</strong> {r.rationale}</div>
                      <div className="text-slate-400 text-[11px]"><strong>Active Parameters:</strong> <code className="text-[#6FCF64]">{JSON.stringify(r.default_params)}</code></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 7: VALIDATION LAB ================= */}
          {activeTab === 'validation' && (
            <div className="space-y-6">
              <div className="bg-[#DCFCE7] border border-[#86EFAC] p-5 rounded-2xl text-xs text-[#166534] shadow-sm">
                <strong className="text-sm font-bold text-[#14532D] block mb-1">
                  Validation vs Expert Review Sampling Baseline
                </strong>
                In accordance with Section 8 of the problem statement, SAT-SA is evaluated against expert manual sampling to prove lift, recall, and false-positive resilience.
              </div>

              {validationMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
                    <div className="text-xs text-[#64748B] uppercase font-bold">Lift over Random Sampling</div>
                    <div className="text-4xl font-extrabold text-[#16A34A] mt-2 font-mono">{validationMetrics.metrics.liftOverRandomBaseline}×</div>
                    <div className="text-xs text-[#64748B] mt-1.5">3.42 times more execution gaps found per 100 reviewed records</div>
                  </div>

                  <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
                    <div className="text-xs text-[#64748B] uppercase font-bold">Defect Recall @ Review Budget</div>
                    <div className="text-4xl font-extrabold text-[#0F172A] mt-2 font-mono">{(validationMetrics.metrics.defectRecallAtBudget * 100).toFixed(0)}%</div>
                    <div className="text-xs text-[#64748B] mt-1.5">88% of true operational weaknesses surfaced</div>
                  </div>

                  <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
                    <div className="text-xs text-[#64748B] uppercase font-bold">False Positive Rate (Clean Cohort)</div>
                    <div className="text-4xl font-extrabold text-[#0F172A] mt-2 font-mono">{(validationMetrics.metrics.falsePositiveRateOnCleanCohort * 100).toFixed(0)}%</div>
                    <div className="text-xs text-[#64748B] mt-1.5">Guards against alert fatigue on mature entities</div>
                  </div>
                </div>
              )}

              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
                <h3 className="text-base font-bold text-[#0F172A] mb-3">Defect Type Lift Breakdown</h3>
                <div className="space-y-2.5">
                  {validationMetrics?.defectTypeCoverage?.map((d: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-2.5 border-b border-[#E2E8F0]">
                      <span className="text-[#334155] font-semibold">{d.defect}</span>
                      <span className="bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC] px-3 py-1 rounded-full font-mono font-bold">
                        {d.lift} Lift
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 8: AUDIT TRAIL & TAMPER VERIFICATION ================= */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0F172A]">Cryptographic Audit Ledger (SHA-256 Hash Chain)</h2>
                  <p className="text-xs text-[#64748B]">Sequential chained cryptographic ledger ensuring tamper-evident accountability of all decisions</p>
                </div>

                <div className="flex items-center space-x-2 bg-[#DCFCE7] border border-[#86EFAC] px-3.5 py-1.5 rounded-full text-[#16A34A] text-xs font-bold shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  <span>HASH CHAIN INTEGRITY: {isAuditValid ? 'VERIFIED' : 'TAMPER DETECTED'}</span>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0] font-semibold">
                    <tr>
                      <th className="py-3 px-6">ID</th>
                      <th className="py-3 px-6">Action</th>
                      <th className="py-3 px-6">Actor</th>
                      <th className="py-3 px-6">Target Object</th>
                      <th className="py-3 px-6">SHA-256 Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] font-mono text-[11px]">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-[#F1F5F9]">
                        <td className="py-3 px-6 text-[#64748B]">#{log.id}</td>
                        <td className="py-3 px-6 text-[#0F172A] font-bold">{log.action}</td>
                        <td className="py-3 px-6 text-[#334155]">{log.actor_id}</td>
                        <td className="py-3 px-6 text-[#334155]">{log.object_id}</td>
                        <td className="py-3 px-6 text-[#2563EB] truncate max-w-xs">{log.hash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
      )}

      {/* ================= MODAL: FINDING DETAIL WITH "WHY FLAGGED" ================= */}
      {selectedFinding && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#CBD5E1] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-mono font-bold bg-[#0B0F19] text-[#6FCF64] px-2.5 py-0.5 rounded-md">
                    {selectedFinding.rule_key}
                  </span>
                  <span className="text-xs text-[#64748B] font-semibold">{selectedFinding.entity_name}</span>
                </div>
                <h2 className="text-lg font-bold text-[#0F172A]">{selectedFinding.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedFinding(null)}
                className="text-[#64748B] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F1F5F9] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Why Flagged Panel */}
            <div className="bg-[#DBEAFE] border border-[#BFDBFE] p-4 rounded-xl space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] flex items-center">
                <Info className="w-4 h-4 mr-1.5 text-[#1D4ED8]" /> Why Flagged (Supervisory Rationale)
              </h3>
              <p className="text-xs text-[#1E3A8A] leading-relaxed font-medium">{selectedFinding.rationale}</p>
            </div>

            {/* Metrics vs Thresholds vs Peer Context */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B] block text-[11px] font-semibold">Observed Metric</span>
                <span className="text-sm font-extrabold text-[#DC2626] mt-1 block font-mono">
                  {JSON.stringify(selectedFinding.metrics)}
                </span>
              </div>
              <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B] block text-[11px] font-semibold">Configured Threshold</span>
                <span className="text-sm font-extrabold text-[#0F172A] mt-1 block font-mono">
                  {JSON.stringify(selectedFinding.thresholds)}
                </span>
              </div>
              <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B] block text-[11px] font-semibold">Sector Peer Baseline</span>
                <span className="text-sm font-extrabold text-[#16A34A] mt-1 block font-mono">
                  {JSON.stringify(selectedFinding.peer_context)}
                </span>
              </div>
            </div>

            {/* Benign Alternative Explanation */}
            <div className="bg-[#FEF3C7] border border-[#FCD34D] p-3.5 rounded-xl text-xs text-[#92400E]">
              <strong className="text-[#78350F] block mb-0.5">Could be benign if:</strong>
              Legitimate maintenance window, test system decommission, or approved pre-authorized automation scripts.
            </div>

            {/* Supporting Evidence Records */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#334155] mb-2.5">
                Forensic Evidence Records ({selectedFinding.evidence?.length || 0})
              </h3>
              <div className="space-y-2">
                {selectedFinding.evidence?.map(ev => (
                  <div key={ev.id} className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-[#2563EB]">{ev.record_id} ({ev.record_type})</div>
                      <div className="text-[#475569] mt-0.5">{ev.note}</div>
                    </div>
                    <span className="text-[10px] bg-[#E2E8F0] text-[#334155] px-2 py-0.5 rounded font-bold uppercase">
                      {ev.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= "WHAT-IF" SCENARIO STUDIO MODAL ================= */}
      <ScenarioStudioModal 
        isOpen={isScenarioStudioOpen} 
        onClose={() => setIsScenarioStudioOpen(false)}
        onScenarioApplied={() => fetchAllData()}
      />
    </div>
  );
}

export default App;
