import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Activity, Scale, GitCompare, AlertTriangle, EyeOff, CheckCircle2, 
  Sliders, TrendingUp, Lock, UploadCloud
} from 'lucide-react';
import { HomePage } from './pages/home/HomePage';
import { ScenarioStudioModal } from './components/ScenarioStudioModal';
import { StatutoryReportModal } from './components/StatutoryReportModal';
import { EvidenceIngestionEnclave } from './components/EvidenceIngestionEnclave';
import { FindingEvidenceModal } from './components/FindingEvidenceModal';
import { PeerComparisonView } from './components/PeerComparisonView';
import { SilentAssetDetailModal } from './components/SilentAssetDetailModal';

// Modals
import { AuditDocketModal } from './components/modals/AuditDocketModal';
import { RuleDetailModal } from './components/modals/RuleDetailModal';
import { ReviewActionModal } from './components/modals/ReviewActionModal';

// Layout
import { AppHeader } from './layout/AppHeader';
import { AppSidebar, SidebarMenuItem } from './layout/AppSidebar';

// Tab Views
import { DashboardView } from './pages/dashboard/DashboardView';
import { KpiGapView } from './pages/dashboard/KpiGapView';
import { FindingsExplorerView } from './pages/dashboard/FindingsExplorerView';
import { NegativeSpaceView } from './pages/dashboard/NegativeSpaceView';
import { ReviewQueueView } from './pages/dashboard/ReviewQueueView';
import { RulesStudioView } from './pages/dashboard/RulesStudioView';
import { ValidationLabView } from './pages/dashboard/ValidationLabView';
import { AuditLedgerView } from './pages/dashboard/AuditLedgerView';

// Domain Types
import { 
  Entity, Finding, KpiGap, SilentAsset, AuditLog, Rule, 
  ReviewSample, ValidationMetrics, TabType 
} from './types/domain';

export function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Route determines view: /dashboard and its sub-routes activate supervisory console
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/compare');
  const currentView = isDashboard ? 'console' : 'landing';

  // Compute activeTab dynamically from URL pathname
  const activeTab = useMemo<TabType>(() => {
    if (location.pathname.startsWith('/compare')) return 'compare';
    const sub = location.pathname.replace(/^\/dashboard\/?/, '').toLowerCase().trim();
    if (sub === 'compare') return 'compare';
    if (sub === 'upload' || sub === 'inject' || sub === 'inject-logs' || sub === 'telemetry' || sub === 'ingest' || sub === 'intake' || sub === 'evidence-intake') return 'upload';
    if (sub === 'gap' || sub === 'kpis' || sub === 'kpis-vs-evidence') return 'gap';
    if (sub === 'findings') return 'findings';
    if (sub === 'negative' || sub === 'negative-space') return 'negative';
    if (sub === 'queue' || sub === 'review' || sub === 'review-queue') return 'queue';
    if (sub === 'rules') return 'rules';
    if (sub === 'validation' || sub === 'lab') return 'validation';
    if (sub === 'audit') return 'audit';
    return 'dashboard';
  }, [location.pathname]);

  // Navigate to specific sub-route
  const setActiveTab = (tab: TabType) => {
    if (tab === 'dashboard') navigate('/dashboard');
    else if (tab === 'upload') navigate('/dashboard/inject-logs');
    else if (tab === 'gap') navigate('/dashboard/kpis-vs-evidence');
    else if (tab === 'compare') navigate('/compare');
    else if (tab === 'negative') navigate('/dashboard/negative-space');
    else if (tab === 'queue') navigate('/dashboard/review-queue');
    else navigate(`/dashboard/${tab}`);
  };

  // Peer Cohort Comparison State
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [selectedCompareEntities, setSelectedCompareEntities] = useState<string[]>([]);
  const [lockedSector, setLockedSector] = useState<string | null>(null);

  const handleToggleCompareEntity = (entityCode: string, sectorCode: string) => {
    if (selectedCompareEntities.includes(entityCode)) {
      const next = selectedCompareEntities.filter(c => c !== entityCode);
      setSelectedCompareEntities(next);
      if (next.length === 0) {
        setLockedSector(null);
      }
    } else {
      if (selectedCompareEntities.length === 0) {
        setLockedSector(sectorCode);
        setSelectedCompareEntities([entityCode]);
      } else {
        if (lockedSector && sectorCode !== lockedSector) {
          alert(`Cross-sector comparison prohibited. Selected entity belongs to ${sectorCode}, but current cohort is locked to ${lockedSector}.`);
          return;
        }
        setSelectedCompareEntities([...selectedCompareEntities, entityCode]);
      }
    }
  };

  const handleLaunchComparison = () => {
    if (selectedCompareEntities.length < 2) {
      alert('Please select at least 2 entities from the same sector cohort to compare.');
      return;
    }
    navigate(`/compare?entities=${selectedCompareEntities.join(',')}`);
  };

  const handleClearCompareSelection = () => {
    setSelectedCompareEntities([]);
    setLockedSector(null);
  };

  // Data State
  const [entities, setEntities] = useState<Entity[]>([]);
  const [kpiGaps, setKpiGaps] = useState<KpiGap[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [silentAssets, setSilentAssets] = useState<SilentAsset[]>([]);
  const [reviewSamples, setReviewSamples] = useState<ReviewSample[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [validationMetrics, setValidationMetrics] = useState<ValidationMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isAuditValid, setIsAuditValid] = useState<boolean>(true);
  const [trends, setTrends] = useState<any[]>([]);
  
  // UI Selection State
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [selectedEntityGap, setSelectedEntityGap] = useState<KpiGap | null>(null);
  const [selectedSilentAsset, setSelectedSilentAsset] = useState<SilentAsset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isScenarioStudioOpen, setIsScenarioStudioOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [selectedReportEntity, setSelectedReportEntity] = useState<Entity | null>(null);
  const [sanctionSuccessMsg, setSanctionSuccessMsg] = useState<string | null>(null);
  
  // Review Modal State
  const [reviewActionModal, setReviewActionModal] = useState<{
    sample: ReviewSample;
    decision: 'confirmed' | 'benign';
  } | null>(null);
  const [reviewModalComment, setReviewModalComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [selectedQueueEntity, setSelectedQueueEntity] = useState<string | null>(null);
  const [copiedTerminalLog, setCopiedTerminalLog] = useState<boolean>(false);

  // Rules & Audit Detail Modal State
  const [selectedRuleDetail, setSelectedRuleDetail] = useState<any | null>(null);
  const [auditActionFilter, setAuditActionFilter] = useState<string>('ALL');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [auditCurrentPage, setAuditCurrentPage] = useState<number>(1);
  const [auditPageSize, setAuditPageSize] = useState<number>(10);
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<AuditLog | null>(null);

  // Findings Explorer Filter & Pagination States
  const [findingSearchQuery, setFindingSearchQuery] = useState<string>('');
  const [findingEntityFilter, setFindingEntityFilter] = useState<string>('ALL');
  const [findingDimensionFilter, setFindingDimensionFilter] = useState<string>('ALL');
  const [findingSeverityFilter, setFindingSeverityFilter] = useState<string>('ALL');
  const [findingCurrentPage, setFindingCurrentPage] = useState<number>(1);
  const [findingPageSize, setFindingPageSize] = useState<number>(10);
  const [findingGroupPageSize, setFindingGroupPageSize] = useState<number>(4);
  const [findingDimensionPageSize, setFindingDimensionPageSize] = useState<number>(4);
  const [findingGroupBy, setFindingGroupBy] = useState<'entity' | 'dimension' | 'none'>('entity');
  const [findingFlatViewMode, setFindingFlatViewMode] = useState<'table' | 'cards'>('table');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [expandedGroupFindings, setExpandedGroupFindings] = useState<Record<string, boolean>>({});
  const [inspectingFinding, setInspectingFinding] = useState<Finding | null>(null);

  const toggleGroupCollapse = (key: string) => {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setFindingCurrentPage(1);
  }, [findingSearchQuery, findingEntityFilter, findingDimensionFilter, findingSeverityFilter, findingPageSize, findingGroupPageSize, findingDimensionPageSize, findingGroupBy]);

  // Review Queue Filter States
  const [queueSearchQuery, setQueueSearchQuery] = useState<string>('');
  const [queueStrategyFilter, setQueueStrategyFilter] = useState<string>('ALL');
  const [queueStatusFilter, setQueueStatusFilter] = useState<string>('ALL');

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [entRes, gapRes, fndRes, negRes, smpRes, rulRes, valRes, audRes, trnRes] = await Promise.all([
        fetch('/api/v1/entities').then(r => r.json()),
        fetch('/api/v1/kpis-vs-evidence').then(r => r.json()),
        fetch('/api/v1/findings').then(r => r.json()),
        fetch('/api/v1/negative-space').then(r => r.json()),
        fetch('/api/v1/review-samples').then(r => r.json()),
        fetch('/api/v1/rules').then(r => r.json()),
        fetch('/api/v1/validation/metrics').then(r => r.json()),
        fetch('/api/v1/audit-log').then(r => r.json()),
        fetch('/api/v1/trends').then(r => r.json())
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
      setTrends(trnRes.data?.trends || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleIssueSanction = async (entityId: string, sanctionType: string, deadlineDays: number) => {
    try {
      const res = await fetch(`/api/v1/entities/${entityId}/sanction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sanctionType,
          deadlineDays,
          legalBasis: 'NCIIPC Rule 12 / Section 70B IT Act'
        })
      });
      const json = await res.json();
      if (json.data) {
        setSanctionSuccessMsg(`Statutory Directive Issued: ${sanctionType.replace(/_/g, ' ')} (${deadlineDays} Days). Hash: ${json.data.auditHash?.slice(0, 16)}...`);
        fetchAllData();
        setTimeout(() => setSanctionSuccessMsg(null), 5000);
      }
    } catch (e) {
      console.error(e);
    }
  };

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

  const openReviewModal = (sample: ReviewSample, decision: 'confirmed' | 'benign') => {
    setReviewActionModal({ sample, decision });
    setReviewModalComment(
      decision === 'confirmed' 
        ? `Confirmed supervisory defect for ${sample.record_id}: Evidence exhibits non-compliant rapid clearance without secondary tier escalation.`
        : `Verified operational anomaly for ${sample.record_id}: Authorized operational maintenance or legitimate benign event validated.`
    );
  };

  const handleSubmitReviewDecision = async () => {
    if (!reviewActionModal) return;
    const { sample, decision } = reviewActionModal;
    setIsSubmittingReview(true);
    try {
      await fetch(`/api/v1/review-samples/${sample.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, comment: reviewModalComment })
      });
      await fetchAllData();
      setReviewActionModal(null);
      setReviewModalComment('');
    } catch (err) {
      alert('Error recording decision');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const sidebarMenuItems: SidebarMenuItem[] = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: Activity },
    { id: 'upload', path: '/dashboard/inject-logs', label: 'Inject Telemetry & Logs', icon: UploadCloud, highlight: true },
    { id: 'gap', path: '/dashboard/kpis-vs-evidence', label: 'Headline KPIs vs Evidence Gap', icon: Scale },
    { id: 'compare', path: '/compare', label: 'Peer Cohort Comparison', icon: GitCompare },
    { id: 'findings', path: '/dashboard/findings', label: 'Findings Explorer', icon: AlertTriangle, count: findings.length },
    { id: 'negative', path: '/dashboard/negative-space', label: 'Negative Space Matrix', icon: EyeOff, count: silentAssets.length },
    { id: 'queue', path: '/dashboard/review-queue', label: 'Review Queue', icon: CheckCircle2, count: reviewSamples.length },
    { id: 'rules', path: '/dashboard/rules', label: 'Dynamic Rules Studio', icon: Sliders },
    { id: 'validation', path: '/dashboard/validation', label: 'Validation Lab (Lift)', icon: TrendingUp },
    { id: 'audit', path: '/dashboard/audit', label: 'Audit Trail & Integrity', icon: Lock }
  ];

  return (
    <div className={`bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#991B1B] selection:text-white ${
      currentView === 'console' ? 'h-screen overflow-hidden print:h-auto print:min-h-0 print:overflow-visible print:block' : 'min-h-screen'
    } print:h-auto print:min-h-0 print:overflow-visible print:block print:bg-white`}>
      
      {/* 1. APP HEADER / NAV BAR (Visible ONLY on Landing Page) */}
      {currentView === 'landing' ? (
        <AppHeader
          statusMessage={statusMessage}
          onOpenScenarioStudio={() => setIsScenarioStudioOpen(true)}
          onLaunchConsole={() => navigate('/dashboard')}
          onNavigateHome={() => navigate('/')}
        />
      ) : null}

      {/* CONDITIONAL VIEW: LANDING PAGE OR CONSOLE WITH LEFT SIDEBAR */}
      {currentView === 'landing' ? (
        <HomePage 
          onOpenConsole={() => navigate('/dashboard')} 
          onOpenScenarioStudio={() => setIsScenarioStudioOpen(true)}
        />
      ) : (
        /* SUPERVISORY OPERATIONAL CONSOLE (WITH FIXED FULL-HEIGHT LEFT SIDEBAR) */
        <div className="console-layout-wrapper flex-1 min-h-0 w-full flex flex-row overflow-hidden bg-[#111827] print:bg-white print:overflow-visible print:h-auto print:block">
          {/* FIXED LEFT SIDEBAR */}
          <AppSidebar
            sidebarMenuItems={sidebarMenuItems}
            activeTab={activeTab}
            entities={entities}
            isLoading={isLoading}
            onNavigate={(path) => navigate(path)}
            onOpenUpload={() => setActiveTab('upload')}
            onOpenScenarioStudio={() => setIsScenarioStudioOpen(true)}
            onOpenReportModal={(ent) => {
              setSelectedReportEntity(ent || entities[0] || null);
              setIsReportModalOpen(true);
            }}
            onRunAnalysis={handleRunAnalysis}
            onRegenerateSynth={handleRegenerateSynth}
          />

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-6 md:px-7 md:pt-5 md:pb-8 space-y-5 bg-[#F8FAFC] print:bg-white print:overflow-visible print:h-auto print:p-0 print:m-0 print:w-full">

            {/* TAB 1: EXECUTIVE DASHBOARD */}
            {activeTab === 'dashboard' && (
              <DashboardView
                entities={entities}
                findings={findings}
                silentAssets={silentAssets}
                reviewSamples={reviewSamples}
                validationMetrics={validationMetrics}
                trends={trends}
                setActiveTab={setActiveTab}
                setSelectedReportEntity={setSelectedReportEntity}
                setIsReportModalOpen={setIsReportModalOpen}
              />
            )}

            {/* TAB: INJECT TELEMETRY & LOGS */}
            {activeTab === 'upload' && (
              <EvidenceIngestionEnclave 
                entities={entities}
                findings={findings}
                kpiGaps={kpiGaps}
                onDataRefreshed={fetchAllData}
                onNavigateToDashboard={() => setActiveTab('dashboard')}
                onSelectReportEntity={(ent) => {
                  setSelectedReportEntity(ent);
                  setIsReportModalOpen(true);
                }}
                onInspectGaps={() => setActiveTab('gap')}
              />
            )}

            {/* TAB 2: HEADLINE KPIS VS UNDERLYING EVIDENCE */}
            {activeTab === 'gap' && (
              <KpiGapView
                kpiGaps={kpiGaps}
                isCompareMode={isCompareMode}
                setIsCompareMode={setIsCompareMode}
                selectedCompareEntities={selectedCompareEntities}
                lockedSector={lockedSector}
                handleToggleCompareEntity={handleToggleCompareEntity}
                handleLaunchComparison={handleLaunchComparison}
                handleClearCompareSelection={handleClearCompareSelection}
                setSelectedEntityGap={(gap) => {
                  setSelectedEntityGap(gap);
                  // Find matching finding for this entity, or create a rich forensic finding so modal displays immediately
                  const entityFindings = findings.filter(f => 
                    f.entity_id === gap.entityId || 
                    (f as any).entity_code === gap.entityCode ||
                    (gap.entityCode && f.title?.includes(gap.entityCode))
                  );
                  const targetFinding = entityFindings[0] || {
                    id: `gap-inspect-${gap.entityCode}`,
                    rule_key: (gap.executionGapSize || 0) > 40 ? 'EG-01' : 'EG-02',
                    title: `${gap.entityCode}: ${gap.executionGapSize}% Operational Execution Gap vs Reported SLA`,
                    kind: 'EXECUTION_GAP',
                    severity_score: gap.executionGapSize || 85,
                    description: `Supervisory analysis detected severe divergence: Entity reported ${gap.headlineSlaPct}% SLA compliance, but underlying telemetry indicates an Evidence Quality Score of only ${gap.evidenceQualityScore}%.`,
                    entity_code: gap.entityCode,
                    entity_id: gap.entityId
                  };
                  setInspectingFinding(targetFinding as any);
                }}
              />
            )}

            {/* TAB 3: FINDINGS EXPLORER */}
            {activeTab === 'findings' && (
              <FindingsExplorerView
                findings={findings}
                entities={entities}
                findingSearchQuery={findingSearchQuery}
                setFindingSearchQuery={setFindingSearchQuery}
                findingEntityFilter={findingEntityFilter}
                setFindingEntityFilter={setFindingEntityFilter}
                findingDimensionFilter={findingDimensionFilter}
                setFindingDimensionFilter={setFindingDimensionFilter}
                findingSeverityFilter={findingSeverityFilter}
                setFindingSeverityFilter={setFindingSeverityFilter}
                findingCurrentPage={findingCurrentPage}
                setFindingCurrentPage={setFindingCurrentPage}
                findingPageSize={findingPageSize}
                setFindingPageSize={setFindingPageSize}
                findingGroupPageSize={findingGroupPageSize}
                setFindingGroupPageSize={setFindingGroupPageSize}
                findingDimensionPageSize={findingDimensionPageSize}
                setFindingDimensionPageSize={setFindingDimensionPageSize}
                findingGroupBy={findingGroupBy}
                setFindingGroupBy={setFindingGroupBy}
                findingFlatViewMode={findingFlatViewMode}
                setFindingFlatViewMode={setFindingFlatViewMode}
                collapsedGroups={collapsedGroups}
                toggleGroupCollapse={toggleGroupCollapse}
                expandedGroupFindings={expandedGroupFindings}
                setExpandedGroupFindings={setExpandedGroupFindings}
                setInspectingFinding={(finding) => setInspectingFinding(finding)}
              />
            )}

            {/* TAB 4: NEGATIVE SPACE MATRIX */}
            {activeTab === 'negative' && (
              <NegativeSpaceView
                silentAssets={silentAssets}
                findings={findings}
                setSelectedSilentAsset={setSelectedSilentAsset}
              />
            )}

            {/* TAB 5: SUPERVISORY REVIEW QUEUE */}
            {activeTab === 'queue' && (
              <ReviewQueueView
                reviewSamples={reviewSamples}
                queueSearchQuery={queueSearchQuery}
                setQueueSearchQuery={setQueueSearchQuery}
                queueStrategyFilter={queueStrategyFilter}
                setQueueStrategyFilter={setQueueStrategyFilter}
                queueStatusFilter={queueStatusFilter}
                setQueueStatusFilter={setQueueStatusFilter}
                selectedQueueEntity={selectedQueueEntity}
                setSelectedQueueEntity={setSelectedQueueEntity}
                openReviewModal={openReviewModal}
              />
            )}

            {/* TAB 6: DYNAMIC RULES STUDIO */}
            {activeTab === 'rules' && (
              <RulesStudioView
                rules={rules}
                findings={findings}
                setSelectedRuleDetail={setSelectedRuleDetail}
                setFindingSearchQuery={setFindingSearchQuery}
                setActiveTab={setActiveTab}
              />
            )}

            {/* TAB 7: VALIDATION LAB */}
            {activeTab === 'validation' && (
              <ValidationLabView
                validationMetrics={validationMetrics}
              />
            )}

            {/* TAB 8: CRYPTOGRAPHIC AUDIT LEDGER */}
            {activeTab === 'audit' && (
              <AuditLedgerView
                auditLogs={auditLogs}
                isAuditValid={isAuditValid}
                auditActionFilter={auditActionFilter}
                setAuditActionFilter={setAuditActionFilter}
                auditSearchQuery={auditSearchQuery}
                setAuditSearchQuery={setAuditSearchQuery}
                auditCurrentPage={auditCurrentPage}
                setAuditCurrentPage={setAuditCurrentPage}
                auditPageSize={auditPageSize}
                setSelectedAuditRecord={setSelectedAuditRecord}
              />
            )}

            {/* TAB 9: PEER COHORT FORENSIC COMPARISON */}
            {activeTab === 'compare' && (
              <PeerComparisonView
                initialEntityCodes={selectedCompareEntities.length >= 2 ? selectedCompareEntities : undefined}
                allKpiGaps={kpiGaps}
                allEntities={entities}
                onBack={() => navigate('/dashboard/kpis-vs-evidence')}
              />
            )}
          </main>
        </div>
      )}

      {/* MODAL: FINDING EVIDENCE DOSSIER & LOGS */}
      {inspectingFinding && (
        <FindingEvidenceModal
          finding={inspectingFinding}
          entityCode={inspectingFinding.entity_code || 'CSE-POWER-01'}
          onClose={() => setInspectingFinding(null)}
        />
      )}

      {/* MODAL: SILENT CRITICAL INFRASTRUCTURE ASSET DOSSIER */}
      {selectedSilentAsset && (
        <SilentAssetDetailModal
          asset={selectedSilentAsset}
          onClose={() => setSelectedSilentAsset(null)}
        />
      )}


      {/* MODAL: STATUTORY SUPERVISORY REPORT DOSSIER (FORM SAR-01) */}
      <StatutoryReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        entity={selectedReportEntity || entities[0]}
        findings={findings}
        kpiGap={kpiGaps.find(g => g.entityId === (selectedReportEntity?.id || entities[0]?.id) || g.entityCode === (selectedReportEntity?.code || entities[0]?.code))}
        silentAssets={silentAssets}
        auditHash={auditLogs[0]?.hash}
      />

      {/* MODAL: REVIEW ACTION (EXAMINER VERDICT) */}
      <ReviewActionModal
        reviewActionModal={reviewActionModal}
        isSubmittingReview={isSubmittingReview}
        reviewModalComment={reviewModalComment}
        setReviewModalComment={setReviewModalComment}
        copiedTerminalLog={copiedTerminalLog}
        setCopiedTerminalLog={setCopiedTerminalLog}
        onClose={() => setReviewActionModal(null)}
        onSubmit={handleSubmitReviewDecision}
      />

      {/* MODAL: RULE DETAIL SPECIFICATION */}
      <RuleDetailModal
        selectedRuleDetail={selectedRuleDetail}
        onClose={() => setSelectedRuleDetail(null)}
        onInspectEvidence={(ruleKey) => {
          setFindingSearchQuery(ruleKey);
          setActiveTab('findings');
          setSelectedRuleDetail(null);
        }}
      />

      {/* MODAL: CRYPTOGRAPHIC BLOCK DOCKET INSPECTION */}
      <AuditDocketModal
        selectedAuditRecord={selectedAuditRecord}
        onClose={() => setSelectedAuditRecord(null)}
      />
    </div>
  );
}

export default App;
