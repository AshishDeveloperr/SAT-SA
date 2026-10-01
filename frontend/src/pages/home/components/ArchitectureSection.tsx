import React, { useState, useEffect, useRef } from 'react';
import { FileCode2, Copy, Check, Terminal, Code, Layers, Sparkles } from 'lucide-react';
import mermaid from 'mermaid';

const ASCII_PIPELINE = `
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           PERIODIC CSE SUBMISSIONS (BATCH CSV / JSON / LOG)                     │
│    [Energy / SCADA]     [Banking & Finance]     [Telecom 5G]     [Defense]     [Healthcare]     │
└────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       STAGE 1: UNIVERSAL MULTI-FORMAT INGESTION & DATA MINIMIZATION             │
│    • Streaming CSV / JSON / LOG / XLSX Parsers       • Salted Pseudonymization (assignee_hash)  │
│    • Referential Foreign Key Validation              • Zero Raw Telemetry / Zero PII Storage    │
└────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       STAGE 2: FORENSIC FACT LEDGER & STORAGE                                   │
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
│    │ • EG-03: Zero-Step Acknowledge│     │ • NS-03: Unfiled Case Records │                      │
│    │ • EG-04: SimHash Duplicates   │     │ • NS-05: Alert Velocity Drops │                      │
│    │ • EG-06: SLA Bunching Gaming  │     └───────────────┬───────────────┘                      │
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
graph LR
    classDef cse fill:#FEF2F2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B,font-weight:700;
    classDef stage fill:#FFFFFF,stroke:#94A3B8,stroke-width:1.5px,color:#0F172A,font-weight:600;
    classDef detector fill:#FFFBEB,stroke:#D97706,stroke-width:1.5px,color:#92400E,font-weight:600;
    classDef audit fill:#0F172A,stroke:#EF4444,stroke-width:1.5px,color:#FFFFFF,font-weight:700;

    subgraph INGESTION ["1. Ingestion Tier"]
        CSE["Periodic Multi-CSE<br/>(CSV, JSON, LOG, XLSX)"]:::cse
        PARSER["Streaming Universal Parser<br/>&amp; Salted Anonymizer"]:::stage
    end

    subgraph STORAGE ["2. Fact Ledger"]
        DB["Partitioned SQLite WAL<br/>(Alerts, Cases, Assets)"]:::stage
    end

    subgraph ENGINE ["3. Supervisory Analytics Engine"]
        EG["Execution Gap Discovery<br/>(EG-01 to EG-06 Detectors)"]:::detector
        NS["Negative Space Reasoners<br/>(NS-01 to NS-05 Silent Assets)"]:::detector
        STATS["Robust Sector Statistics<br/>(MAD &amp; Robust Z-Scores)"]:::stage
    end

    subgraph GOVERNANCE ["4. Decision Support &amp; Audit"]
        SCORE["Composite Attention Scoring<br/>&amp; Evidence Gap View"]:::stage
        AUDIT["SHA-256 Chained Hash Ledger<br/>(Sec 65B Forensics)"]:::audit
    end

    CSE --> PARSER
    PARSER --> DB
    DB --> EG
    DB --> NS
    EG --> STATS
    NS --> STATS
    STATS --> SCORE
    SCORE --> AUDIT
`;

export const ArchitectureSection: React.FC = () => {
  const [diagramMode, setDiagramMode] = useState<'rendered' | 'flowchart' | 'ascii' | 'mermaid'>('rendered');
  const [copied, setCopied] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Poppins, -apple-system, sans-serif'
    });
    if (diagramMode === 'rendered' && mermaidRef.current) {
      mermaidRef.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [diagramMode]);

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
            End-to-end supervisory analytics pipeline from streaming multi-CSE submission ingestion through partitioned storage, deterministic detection, and SHA-256 hash-chained examiner decisions.
          </p>
        </div>

        {/* 4 Pipeline Stages Navigation Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '1.25rem' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage 1</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>Multi-CSE Streaming Ingestion</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>CSV / JSON / LOG / XLSX • Pseudonymization</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage 2</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>Forensic Fact Ledger</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>Normalized Tables • Air-Gapped WAL DB</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage 3</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>Supervisory Analytics Core</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>Execution Gaps &amp; Negative Space</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage 4</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>Decision Support &amp; Audit</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>Review Queue • SHA-256 Chained Hash</div>
          </div>
        </div>

        {/* Interactive Architecture Window */}
        <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          
          {/* Window Top Bar */}
          <div style={{ padding: '0.75rem 1.25rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode2 size={16} color="#991B1B" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace' }}>
                ARCHITECTURE.md
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '4px' }}>
                AIR-GAPPED COMPLIANT
              </span>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', background: '#E2E8F0', padding: '3px', borderRadius: '8px', gap: '2px' }}>
              <button
                onClick={() => setDiagramMode('rendered')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: diagramMode === 'rendered' ? '#FFFFFF' : 'transparent',
                  color: diagramMode === 'rendered' ? '#991B1B' : '#64748B',
                  boxShadow: diagramMode === 'rendered' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={12} />
                Rendered Diagram
              </button>

              <button
                onClick={() => setDiagramMode('flowchart')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: diagramMode === 'flowchart' ? '#FFFFFF' : 'transparent',
                  color: diagramMode === 'flowchart' ? '#0F172A' : '#64748B',
                  boxShadow: diagramMode === 'flowchart' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Pipeline Cards
              </button>

              <button
                onClick={() => setDiagramMode('ascii')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
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
                  fontSize: '0.75rem',
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

          {/* View: Rendered Mermaid Diagram */}
          {diagramMode === 'rendered' && (
            <div style={{ padding: '1.5rem 1rem', background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflowX: 'auto' }}>
              <div ref={mermaidRef} className="mermaid" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                {MERMAID_PIPELINE}
              </div>
            </div>
          )}

          {/* View: Flowchart / Cards */}
          {diagramMode === 'flowchart' && (
            <div style={{ padding: '2rem', background: '#FFFFFF' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase' }}>Ingestion Tier</div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>Multi-Format Normalizer</h4>
                  <ul style={{ fontSize: '0.78rem', color: '#475569', marginTop: '8px', lineHeight: 1.6, paddingLeft: '1rem', listStyle: 'disc' }}>
                    <li>Accepts CSV, JSON, LOG, and XLSX submissions</li>
                    <li>Streaming chunked parser (50MB+ capable)</li>
                    <li>Salted pseudonymization of analyst IDs (assignee_hash)</li>
                  </ul>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>Storage Tier</div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>Forensic Fact Ledger</h4>
                  <ul style={{ fontSize: '0.78rem', color: '#475569', marginTop: '8px', lineHeight: 1.6, paddingLeft: '1rem', listStyle: 'disc' }}>
                    <li>Partitioned fact tables for alerts, cases &amp; assets</li>
                    <li>Incremental daily rollups (alert_daily_agg)</li>
                    <li>Dynamic DB-backed rule registry &amp; parameter history</li>
                  </ul>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>Analytics Tier</div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>Supervisory Detector Engine</h4>
                  <ul style={{ fontSize: '0.78rem', color: '#475569', marginTop: '8px', lineHeight: 1.6, paddingLeft: '1rem', listStyle: 'disc' }}>
                    <li>6 Execution Gap Detectors (Fast close, unescalated)</li>
                    <li>4 Negative Space Reasoners (Silent SCADA, missing threats)</li>
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

export default ArchitectureSection;
