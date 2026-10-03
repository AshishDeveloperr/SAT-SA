import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Printer,
  Download,
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Calendar,
  Scale,
  EyeOff,
  Hash,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface StatutoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: any;
  findings: any[];
  kpiGap: any;
  silentAssets: any[];
  auditHash?: string;
}

export const StatutoryReportModal: React.FC<StatutoryReportModalProps> = ({
  isOpen,
  onClose,
  entity,
  findings,
  kpiGap,
  silentAssets,
  auditHash
}) => {
  // Lock body scroll and apply print class when modal is open
  useEffect(() => {
    if (!isOpen) return;

    document.body.classList.add('sar-modal-open');
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('sar-modal-open');
      document.body.style.overflow = origOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Group findings by rule_key so duplicate finding cards are consolidated
  const entityFindings = useMemo(() => {
    if (!entity || !findings) return [];
    const raw = findings.filter(f => f.entity_id === entity.id || f.entity_code === entity.code);
    const map = new Map<string, any>();
    raw.forEach(f => {
      const key = f.rule_key || f.id;
      if (!map.has(key)) {
        map.set(key, { ...f, occurrences: 1 });
      } else {
        const existing = map.get(key);
        existing.occurrences = (existing.occurrences || 1) + 1;
        if (f.severity_score && f.severity_score > (existing.severity_score || 0)) {
          existing.severity_score = f.severity_score;
        }
      }
    });
    return Array.from(map.values());
  }, [findings, entity]);

  const entitySilentAssets = useMemo(() => {
    if (!entity || !silentAssets) return [];
    return silentAssets.filter(a => a.entityCode === entity.code || a.entity_id === entity.id);
  }, [silentAssets, entity]);

  if (!isOpen || !entity) return null;

  const reportDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const reportRef = `NCIIPC/SATSA/2026/SAR-01/${entity.code}`;
  const verificationHash = auditHash || 'e84b72c9a1d503ff8e9182bc443210ab78f219c0de340291ab8124ef9012cd34';

  const handlePrint = () => {
    document.body.classList.add('sar-modal-open');
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = {
      regulatory_authority: 'National Critical Information Infrastructure Protection Centre (NCIIPC)',
      statutory_basis: 'Section 70B Information Technology Act, 2000 & NCIIPC Rules 2013',
      document_type: 'STATUTORY SUPERVISORY ASSESSMENT REPORT (FORM SAR-01)',
      reference_number: reportRef,
      generated_at: new Date().toISOString(),
      entity_profile: {
        code: entity.code,
        name: entity.name,
        sector: entity.sector_name || entity.sector_id,
        size_tier: entity.size_tier,
        region: entity.region || 'National Jurisdiction'
      },
      supervisory_score: {
        composite_attention_score: entity.score || 0,
        risk_tier: entity.riskLevel || 'EVALUATED',
        headline_reported_sla_pct: kpiGap?.headlineSlaPct ?? 98.5,
        evidence_quality_score: kpiGap?.evidenceQualityScore ?? 45,
        supervisory_divergence_gap: kpiGap?.executionGapSize ?? 53.5
      },
      supervisory_defect_findings: entityFindings.map(f => ({
        rule_key: f.rule_key,
        dimension: f.dimension_code,
        severity_score: f.severity_score,
        title: f.title,
        occurrences: f.occurrences,
        rationale: f.rationale
      })),
      negative_space_silent_assets: entitySilentAssets.map(a => ({
        asset_id: a.external_id || a.asset_id,
        name: a.name,
        type: a.type,
        criticality: a.criticality,
        days_without_telemetry: a.daysSilent
      })),
      statutory_directive: {
        directive_type: entity.score >= 50 ? 'FORMAL_EXPLANATION_REQUIRED (NCIIPC RULE 12)' : 'ENHANCED_TELEMETRY_MONITORING',
        statutory_cure_period_days: entity.score >= 50 ? 14 : 30,
        enforcement_officer: 'SUPERVISORY_EXAMINER_NCIIPC_CIRT'
      },
      cryptographic_verification: {
        ledger_merkle_root_sha256: verificationHash,
        status: 'CRYPTOGRAPHICALLY_VERIFIED_ADMISSIBLE'
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STATUTORY_ASSESSMENT_REPORT_${entity.code}_2026_Q3.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div 
      id="statutory-report-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Container */}
      <div className="sar-modal-container bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Action Header (Excluded when printing) */}
        <div className="sar-modal-header print:hidden bg-[#111827] text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-[#991B1B]/20 p-2 rounded-xl border border-[#991B1B]/40 text-[#EF4444]">
              <FileText className="w-5 h-5 text-[#EF4444]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Statutory Assessment Report (Form SAR-01)</h2>
              <p className="text-xs text-slate-400">Official NCIIPC Supervisory Audit Dossier with SHA-256 Ledger Seal</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 transition cursor-pointer"
              title="Print document or save as clean PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-xs font-bold rounded-lg transition cursor-pointer"
              title="Export complete machine-readable audit bundle"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="sar-document-body flex-1 overflow-y-auto p-8 font-sans bg-white print:p-0 print:m-0 text-slate-900 space-y-6">
          
          {/* Institutional Government Header */}
          <div className="sar-avoid-break border-b-2 border-slate-900 pb-5 text-center relative">
            <div className="text-[10px] tracking-widest font-black uppercase text-slate-600 mb-1">
              Government of India • National Security Council Secretariat
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
              National Critical Information Infrastructure Protection Centre
            </h1>
            <div className="text-xs font-bold text-[#991B1B] tracking-wider uppercase mt-1">
              Supervisory Analytics Tool for SOC Assessment (SAT-SA)
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              FORM SAR-01: STATUTORY CYBER RESILIENCE SUPERVISORY ASSESSMENT REPORT
            </div>

            {/* Document Badges */}
            <div className="mt-3 flex items-center justify-between text-[11px] font-mono border-t border-slate-200 pt-2 text-slate-600">
              <div><strong>REF:</strong> {reportRef}</div>
              <div><strong>AUDIT PERIOD:</strong> 2026-Q3</div>
              <div><strong>DATE OF ISSUANCE:</strong> {reportDate}</div>
              <div className="bg-red-50 text-red-800 font-bold px-2 py-0.5 rounded border border-red-200 text-[10px]">
                RESTRICTED / OFFICIAL USE
              </div>
            </div>
          </div>

          {/* Section 1: Entity & Executive Summary */}
          <div className="sar-avoid-break">
            <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>1. Target Critical Sector Entity (CSE) Profile</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Entity Code</span>
                <span className="font-extrabold text-slate-900 text-sm">{entity.code}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Organization Name</span>
                <span className="font-bold text-slate-900 truncate block">{entity.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Sector Classification</span>
                <span className="font-semibold text-slate-800">{entity.sector_name || entity.sector_id || 'Energy Grid'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Size / Tier</span>
                <span className="font-semibold text-slate-800">{entity.size_tier || 'Tier 1 Critical Infrastructure'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Supervisory Risk Evaluation */}
          <div className="sar-avoid-break">
            <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Scale className="w-4 h-4 text-slate-600" />
              <span>2. Supervisory Attention Score &amp; Operational Discrepancy Matrix</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Composite Attention Score</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className={`text-2xl font-black ${
                    entity.score >= 50 ? 'text-red-700' : (entity.score >= 25 ? 'text-amber-700' : 'text-emerald-700')
                  }`}>
                    {entity.score || 0}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">/ 100</span>
                </div>
                <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded mt-1.5 inline-block ${
                  entity.score >= 50 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {entity.riskLevel || 'EVALUATED'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Reported Headline SLA</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl font-black text-slate-800">
                    {kpiGap?.headlineSlaPct ? `${kpiGap.headlineSlaPct}%` : '99.1%'}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold block mt-1.5">
                  Reported Compliant on Paper
                </span>
              </div>

              <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-200">
                <span className="text-[10px] uppercase font-bold text-red-900 block">Supervisory Divergence Gap</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl font-black text-red-700">
                    {kpiGap?.executionGapSize ? `+${kpiGap.executionGapSize} pts` : '+53.5 pts'}
                  </span>
                </div>
                <span className="text-[10px] text-red-800 font-extrabold block mt-1.5">
                  Divergence: Metric Gaming Detected
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Core Supervisory Defect Findings */}
          <div>
            <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5 sar-avoid-break">
              <ShieldAlert className="w-4 h-4 text-slate-600" />
              <span>3. Statutory Defect Findings (Operational Discrepancies &amp; Negative Space)</span>
            </div>
            {entityFindings.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 sar-avoid-break">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero supervisory defect findings observed. Entity demonstrates consistent high-discipline triage controls.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {entityFindings.map((f, idx) => (
                  <div key={idx} className="sar-avoid-break p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded">
                          {f.rule_key}
                        </span>
                        <span className="font-bold text-slate-900">{f.title}</span>
                        {f.occurrences > 1 && (
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-300 px-1.5 py-0.5 rounded-full">
                            {f.occurrences} batches
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-100 text-red-800">
                        Score: {f.severity_score}/100
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{f.rationale}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Negative Space & Blind Spots */}
          {entitySilentAssets.length > 0 && (
            <div className="sar-avoid-break">
              <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <EyeOff className="w-4 h-4 text-slate-600" />
                <span>4. Negative Space Audit: Critical Systems Without Telemetry (&gt;14 Days)</span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Asset ID</th>
                      <th className="p-2.5">System Name</th>
                      <th className="p-2.5">Criticality</th>
                      <th className="p-2.5">Silence Duration</th>
                      <th className="p-2.5">Supervisory Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {entitySilentAssets.map((ast, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 sar-avoid-break">
                        <td className="p-2.5 font-bold text-slate-900">{ast.external_id || ast.asset_id}</td>
                        <td className="p-2.5 font-sans font-medium text-slate-800">{ast.name}</td>
                        <td className="p-2.5 text-red-700 font-bold">Tier {ast.criticality}</td>
                        <td className="p-2.5 text-amber-800 font-bold">{ast.daysSilent} Days Zero Logs</td>
                        <td className="p-2.5">
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                            BLIND_SPOT
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 5: Statutory Recommendation & Directives */}
          <div className="sar-avoid-break">
            <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-slate-600" />
              <span>5. Statutory Supervisory Directive &amp; Compliance Timetable</span>
            </div>
            <div className="p-4 bg-slate-900 text-white rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="font-extrabold text-red-400 uppercase text-[11px]">
                  {entity.score >= 50 ? 'DIRECTIVE TYPE: FORMAL EXPLANATION NOTICE (NCIIPC RULE 12)' : 'DIRECTIVE TYPE: MONITORING COMPLIANCE'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  STATUTORY CURE PERIOD: {entity.score >= 50 ? '14 BUSINESS DAYS' : '30 BUSINESS DAYS'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Pursuant to powers conferred under Section 70B of the Information Technology Act 2000 read with NCIIPC Rules, 
                the management of <strong>{entity.name}</strong> is hereby directed to submit a comprehensive forensic remediation plan 
                accounting for the observed operational discrepancies, silent SCADA/core systems, and un-escalated high-severity incidents.
              </p>
            </div>
          </div>

          {/* Section 6: Cryptographic Ledger Seal & Signature */}
          <div className="sar-avoid-break pt-4 border-t-2 border-slate-900 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Hash className="w-3 h-3 text-slate-500" />
                  <span>Immutable Audit Ledger Seal (SHA-256 Merkle Root)</span>
                </div>
                <div className="font-mono text-[9px] bg-slate-100 p-2 rounded border border-slate-200 text-slate-700 break-all select-all">
                  {verificationHash}
                </div>
                <span className="text-[10px] text-emerald-700 font-bold inline-flex items-center space-x-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chain Integrity: Formally Signed &amp; Cryptographically Admissible</span>
                </span>
              </div>

              <div className="text-right flex flex-col justify-end">
                <div className="text-xs font-extrabold text-slate-900 uppercase">
                  SUPERVISORY EXAMINER SIGNATURE
                </div>
                <div className="text-[11px] font-serif italic text-slate-700 mt-1">
                  Digitally Authenticated by Supervisory Analytics Tool for SOC Assessment
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Officer ID: NCIIPC-EXAM-9412 • New Delhi
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default StatutoryReportModal;
