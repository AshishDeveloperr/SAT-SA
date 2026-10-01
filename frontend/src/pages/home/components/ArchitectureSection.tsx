import React, { useState } from 'react';
import { FileCode2, Copy, Check, Terminal, Code, Layers } from 'lucide-react';

const ASCII_PIPELINE = `
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           PERIODIC CSE SUBMISSIONS (BATCH CSV / JSON / API)                     │
│    [Energy / SCADA]     [Banking & Finance]     [Telecom 5G]     [Defense]     [Healthcare]     │
└────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       STAGE 1: STREAMING INGESTION & DATA MINIMIZATION                          │
│    • Streaming CSV/JSON Parsers (50MB+ Chunked)      • Salted Pseudonymization (assignee_hash)  │
│    • Referential Foreign Key Validation              • Zero Raw Telemetry / Zero PII Storage    │
└────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       STAGE 2: POSTGRESQL 16 ENTERPRISE FACT LEDGER                             │
│    • Monthly Partitioned Fact Tables (alerts, cases) • Incremental Daily Rollups (alert_daily)  │
│    • Dynamic Rule Registry & Version Diffing         • WAL Persistence & Air-Gapped Isolation   │
└────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       STAGE 3: SUPERVISORY ANALYTICS & DETECTOR CORE                            │
│    ┌───────────────────────────────┐     ┌───────────────────────────────┐                      │
│    │ Execution Gap Detectors (EG)  │     │ Negative Space Reasoners (NS) │                      │
│    │ • EG-01: Fast Critical Close  │     │ • NS-01: Silent SCADA Assets  │                      │
│    │ • EG-02: Unescalated Threat   │     │ • NS-02: Missing Categories   │                      │
│    │ • EG-03: Zero-Step Acknowledge│     │ • NS-05: Sector Low Activity  │                      │
│    │ • EG-04: SimHash Duplicates   │     └───────────────┬───────────────┘                      │
│    └───────────────┬───────────────┘                     │                                      │
│                    └───────────────────────┬─────────────┘                                      │
│                                            ▼                                                    │
│    • Robust Statistics (Median, MAD, Robust Z)  • Latent Maturity Behavioral Generator          │
└────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       STAGE 4: SUPERVISORY DECISION-SUPPORT & GOVERNANCE                        │
│    • Composite Attention Scoring (0–100)        • Headline KPIs vs Underlying Evidence Gap View │
│    • Review Portfolio Optimizer (85% + 15%)     • Cryptographic SHA-256 Hash Chained Audit Log  │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
`;

const MERMAID_PIPELINE = `
graph TD
    CSE[Periodic Multi-CSE Submissions] --> Ingest[Stage 1: Streaming Ingestion & Pseudonymization]
    Ingest --> DB[(Stage 2: PostgreSQL 16 Partitioned Facts)]
    DB --> Analytics[Stage 3: Supervisory Analytics Engine]
    Analytics --> EG[Execution Gap Detectors: EG-01 to EG-06]
    Analytics --> NS[Negative Space Reasoners: NS-01 to NS-05]
    Analytics --> Stats[Robust Statistics: Median, MAD, Robust-Z]
    EG --> Score[Stage 4: Attention Scoring 0-100]
    NS --> Score
    Stats --> Score
    Score --> Gap[KPIs vs Evidence Discrepancy View]
    Score --> Queue[Review Portfolio: 85% Priority + 15% Exploration]
    Queue --> Audit[Cryptographic SHA-256 Hash Chain Ledger]
`;

export const ArchitectureSection: React.FC = () => {
  const [diagramMode, setDiagramMode] = useState<'flowchart' | 'ascii' | 'mermaid'>('flowchart');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="architecture" className="landing-section bg-subtle">
      <div className="landing-content-wrap">
        
        {/* Section Header */}
        <div style={{ maxWidth: '64rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', padding: '2px 10px', borderRadius: '9999px' }}>
              Master Supervisory Architecture
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              • Dual-Discipline • 10 Core Detectors • SHA-256 Hash Chain • Zero-Cloud Air-Gapped
            </span>
          </div>
          <h2 className="landing-h2" style={{ marginBottom: '0.75rem' }}>
            System architecture &amp; processing dataflow
          </h2>
          <p className="landing-lead" style={{ maxWidth: '100%', marginBottom: 0 }}>
            End-to-end supervisory analytics pipeline from streaming multi-CSE submission ingestion through partitioned PostgreSQL 16 fact storage, deterministic detection, and SHA-256 hash-chained examiner decisions.
          </p>
        </div>

        {/* 4 Pipeline Stages Navigation Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '1.25rem' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage 1</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>Multi-CSE Streaming Ingestion</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>Batch CSV / JSON / API • Pseudonymization</div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage 2</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>PostgreSQL 16 Fact Storage</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>Partitioned Facts • Incremental Rollups</div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage 3</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>Supervisory Analytics Engine</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>10 Detectors • Robust Stats (Median, MAD)</div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage 4</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>Explainability &amp; Audit Trail</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>Review Portfolio • SHA-256 Hash Chain</div>
          </div>
        </div>

        {/* Master Diagram Container */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)' }}>
          
          {/* Bar */}
          <div style={{ background: '#F8FAFC', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode2 size={16} color="#475569" />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                ARCHITECTURE.md
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', padding: '2px 8px', background: '#FEE2E2', color: '#991B1B', borderRadius: '4px', fontWeight: 700 }}>
                AIR-GAPPED COMPLIANT
              </span>
            </div>

            {/* View Mode Toggle */}
            <div style={{ display: 'inline-flex', gap: '4px', background: '#E2E8F0', padding: '3px', borderRadius: '8px' }}>
              <button
                onClick={() => setDiagramMode('flowchart')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: diagramMode === 'flowchart' ? '#FFFFFF' : 'transparent',
                  color: diagramMode === 'flowchart' ? '#0F172A' : '#64748B',
                  boxShadow: diagramMode === 'flowchart' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Pipeline View
              </button>

              <button
                onClick={() => setDiagramMode('ascii')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: diagramMode === 'ascii' ? '#FFFFFF' : 'transparent',
                  color: diagramMode === 'ascii' ? '#0F172A' : '#64748B',
                  boxShadow: diagramMode === 'ascii' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                ASCII Diagram
              </button>

              <button
                onClick={() => setDiagramMode('mermaid')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: diagramMode === 'mermaid' ? '#FFFFFF' : 'transparent',
                  color: diagramMode === 'mermaid' ? '#0F172A' : '#64748B',
                  boxShadow: diagramMode === 'mermaid' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Mermaid Code
              </button>
            </div>
          </div>

          {/* View: Flowchart / Cards */}
          {diagramMode === 'flowchart' && (
            <div style={{ padding: '2rem', background: '#FFFFFF' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase' }}>Ingestion Tier</div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>Periodic Multi-CSE Ingestion</h4>
                  <ul style={{ fontSize: '0.78rem', color: '#475569', marginTop: '8px', lineHeight: 1.6, paddingLeft: '1rem', listStyle: 'disc' }}>
                    <li>Accepts CSV, JSON, and REST API submissions</li>
                    <li>Streaming chunked parser (50MB+ capable)</li>
                    <li>Pseudonymizes analyst identities (assignee_hash)</li>
                  </ul>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>Storage Tier</div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>PostgreSQL 16 &amp; Partitioning</h4>
                  <ul style={{ fontSize: '0.78rem', color: '#475569', marginTop: '8px', lineHeight: 1.6, paddingLeft: '1rem', listStyle: 'disc' }}>
                    <li>Monthly partitioned facts for alerts and cases</li>
                    <li>Incremental daily rollups (alert_daily_agg)</li>
                    <li>Dynamic DB-backed rule registry &amp; parameter history</li>
                  </ul>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>Analytics Tier</div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>Supervisory Detector Engine</h4>
                  <ul style={{ fontSize: '0.78rem', color: '#475569', marginTop: '8px', lineHeight: 1.6, paddingLeft: '1rem', listStyle: 'disc' }}>
                    <li>6 Execution Gap Detectors (Fast close, unescalated)</li>
                    <li>4 Negative Space Detectors (Silent SCADA, missing threats)</li>
                    <li>Robust Z-score benchmarking (Median, MAD)</li>
                  </ul>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase' }}>Supervisory Tier</div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>Decision Support &amp; Audit</h4>
                  <ul style={{ fontSize: '0.78rem', color: '#475569', marginTop: '8px', lineHeight: 1.6, paddingLeft: '1rem', listStyle: 'disc' }}>
                    <li>Composite Attention Score ranking (0–100)</li>
                    <li>Review Portfolio: 85% priority + 15% exploration</li>
                    <li>Cryptographic SHA-256 hash-chained decision audit</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* View: ASCII */}
          {diagramMode === 'ascii' && (
            <div style={{ background: '#0B0F17', color: '#E2E8F0', padding: '1.5rem', overflowX: 'auto', position: 'relative' }}>
              <button
                onClick={() => handleCopy(ASCII_PIPELINE)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: '#1E293B', border: '1px solid #334155', color: '#CBD5E1', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}
              >
                {copied ? <Check size={12} color="#EF4444" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <pre style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', lineHeight: 1.45 }}>
                {ASCII_PIPELINE}
              </pre>
            </div>
          )}

          {/* View: Mermaid */}
          {diagramMode === 'mermaid' && (
            <div style={{ background: '#0B0F17', color: '#E2E8F0', padding: '1.5rem', overflowX: 'auto', position: 'relative' }}>
              <button
                onClick={() => handleCopy(MERMAID_PIPELINE)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: '#1E293B', border: '1px solid #334155', color: '#CBD5E1', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}
              >
                {copied ? <Check size={12} color="#EF4444" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <pre style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', lineHeight: 1.45 }}>
                {MERMAID_PIPELINE}
              </pre>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
