import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Terminal, 
  Code, 
  Sparkles, 
  Maximize2, 
  Minimize2,
  Lock,
  Bot,
  Database,
  Activity,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import mermaid from 'mermaid';

const MERMAID_PIPELINE = `flowchart LR
    %% Stage 1: Ingestion Tier
    subgraph STAGE1 ["1. Ingestion Tier"]
        direction LR
        CSE["CSE Streams<br/>CSV / JSON / Logs"]
        PARSER["Streaming Parser<br/>& Pseudonymizer"]
        CSE --> PARSER
    end

    %% Stage 2: Forensic Fact Ledger
    subgraph STAGE2 ["2. Fact Ledger"]
        direction LR
        DB[("SQLite WAL DB<br/>Fact Tables")]
        AGG["Rule Registry &<br/>Daily Rollups"]
        DB --> AGG
    end

    %% Stage 3: Supervisory Analytics Core
    subgraph STAGE3 ["3. Analytics Core"]
        direction LR
        EG["Execution Gaps<br/>(EG-01..06)"]
        NS["Negative Space<br/>(NS-01..05)"]
        STATS["Sector Z-Score<br/>(Median / MAD)"]
        EG --> STATS
        NS --> STATS
    end

    %% Stage 4: Air-Gapped AI Copilot Tier
    subgraph STAGE4 ["4. AI Copilot (Air-Gap)"]
        direction LR
        OLLAMA["Local Ollama 3B<br/>localhost:11434"]
        FALLBACK["Safety Fallback<br/>(Deterministic)"]
        SYNTH{"Statutory SAR-01<br/>Synthesizer"}
        OLLAMA --> SYNTH
        FALLBACK -.-> SYNTH
    end

    %% Stage 5: Decision Support & Forensics
    subgraph STAGE5 ["5. Audit & Governance"]
        direction LR
        SCORE["85/15 Portfolio<br/>& Priority Score"]
        AUDIT[("SHA-256 Ledger<br/>(Sec 65B Audit)")]
        SCORE --> AUDIT
    end

    %% Inter-Stage Pipeline Connections
    PARSER --> DB
    AGG --> EG
    AGG --> NS
    STATS --> OLLAMA
    STATS --> SCORE
    SYNTH --> SCORE
`;

const ASCII_PIPELINE = `
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               PERIODIC CSE SUBMISSIONS (BATCH CSV / JSON / LOG / XLSX)                            │
│     [Energy / SCADA Grid]     [Banking & Finance]     [Telecom 5G Core]     [Defense & Space]     [Healthcare]    │
└─────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                          │
                                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 1: UNIVERSAL MULTI-FORMAT INGESTION & DATA MINIMIZATION                              │
│     • Streaming Universal Chunked Parser (50MB+ capable)      • Salted Pseudonymization (assignee_hash)           │
│     • Foreign Key Referential & Schema Integrity Validation   • Zero Raw Telemetry / Zero PII Storage             │
└─────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                          │
                                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 2: FORENSIC FACT LEDGER & PARTITIONED STORAGE                                        │
│     • Monthly Partitioned Fact Tables (alerts, cases, assets) • Incremental Daily Rollups (alert_daily_agg)       │
│     • Dynamic DB-Backed Rule Registry & Parameter Diffing     • WAL Persistence & Zero-Cloud Air-Gapped Isolation │
└─────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                          │
                                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 3: SUPERVISORY ANALYTICS & DETECTOR CORE                                             │
│     ┌────────────────────────────────┐       ┌────────────────────────────────┐                                   │
│     │  Execution Gap Detectors (EG)  │       │ Negative Space Reasoners (NS)  │                                   │
│     │  • EG-01: 3-Min Critical Close │       │ • NS-01: Silent SCADA Assets   │                                   │
│     │  • EG-02: Unescalated Critical │       │ • NS-02: Missing Threat Types  │                                   │
│     │  • EG-03: Zero-Step Triage     │       │ • NS-03: Unfiled Case Records  │                                   │
│     │  • EG-04: SimHash Duplication  │       │ • NS-05: Alert Velocity Drops  │                                   │
│     │  • EG-06: SLA Bunching Gaming  │       └────────────────┬───────────────┘                                   │
│     └────────────────┬───────────────┘                        │                                                   │
│                      └───────────────────────┬────────────────┘                                                   │
│                                              ▼                                                                    │
│     • Robust Sector Statistics (Median, MAD, Robust Z-Scores) • Latent Maturity Behavioral Generator              │
└──────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 4: LOCAL AIR-GAPPED AI COPILOT & STATUTORY SYNTHESIS                                 │
│     ┌─────────────────────────────────────────────────┐   ┌─────────────────────────────────────────────────┐     │
│     │ Local Ollama Daemon (Qwen2.5:3B / Llama3.2:3B)  │   │ Deterministic Heuristic Fallback Engine         │     │
│     │ • 100% Offline Local Inference on localhost:11434│   │ • 100% Uptime Guarantee (Zero-Cloud Standard)   │     │
│     │ • Safety Invariant: AI Never Alters Risk Scores │   │ • Statutory Template Synthesizer (NCIIPC v2.4)  │     │
│     └────────────────────────┬────────────────────────┘   └────────────────────────┬────────────────────────┘     │
│                              └────────────────────────┬────────────────────────────┘                              │
│                                                       ▼                                                           │
│     • SAR-01 Statutory Briefing Generation (Sec 70A)  • Sec 65B Peer Comparative Synthesis (Goodhart Discrepancy) │
└──────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 5: DECISION SUPPORT, GOVERNANCE & HASH-CHAINED FORENSICS                             │
│     • Composite Attention Scoring (0–100 Weighted Rank)       • Headline KPIs vs Underlying Evidence Quality View │
│     • Review Portfolio Optimizer (85% Priority + 15% Explore) • Cryptographic SHA-256 Chained Hash Ledger (Sec 65B│
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
`;

export const ArchitectureSection: React.FC = () => {
  const [diagramMode, setDiagramMode] = useState<'rendered' | 'code' | 'ascii'>('rendered');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        darkMode: false,
        background: '#FFFFFF',
        mainBkg: '#FFFFFF',
        nodeBorder: '#1E293B',
        nodeTextColor: '#0F172A',
        lineColor: '#334155',
        textColor: '#0F172A',
        titleColor: '#0F172A',
        subgraphBkg: '#F8FAFC',
        subgraphBorder: '#CBD5E1',
        edgeLabelBackground: '#FFFFFF',
        clusterBkg: '#F8FAFC',
        clusterBorder: '#CBD5E1',
        defaultLinkColor: '#334155',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '11px'
      }
    });

    if (diagramMode === 'rendered' && mermaidRef.current) {
      mermaidRef.current.innerHTML = '';
      const renderId = `mermaid-arch-${Date.now()}`;
      mermaid
        .render(renderId, MERMAID_PIPELINE)
        .then(({ svg }) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        })
        .catch((err) => {
          console.error('Mermaid render error:', err);
        });
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
        <div style={{ maxWidth: '64rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#0F172A', color: '#FFFFFF', padding: '2px 10px', borderRadius: '9999px', letterSpacing: '0.04em' }}>
              MASTER SUPERVISORY ARCHITECTURE
            </span>
            <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
              • 5 Air-Gapped Tiers • Dual-Discipline Detectors • Local AI Copilot • SHA-256 Hash Chain
            </span>
          </div>
          <h2 className="landing-h2" style={{ marginBottom: '0.5rem' }}>
            System architecture &amp; processing dataflow
          </h2>
          <p className="landing-lead" style={{ maxWidth: '100%', marginBottom: 0, fontSize: '0.94rem', color: '#0F172A', lineHeight: 1.8 }}>
            End-to-end{' '}
            <span className="highlight-badge-red">
              supervisory analytics pipeline
            </span>{' '}
            from streaming multi-CSE submission ingestion through partitioned storage,{' '}
            <span className="highlight-badge-dark">
              deterministic detection
            </span>
            , local{' '}
            <span className="highlight-badge-red">
              air-gapped AI narrative synthesis
            </span>
            , and{' '}
            <span className="highlight-badge-dark">
              SHA-256 hash-chained forensic audit
            </span>
            .
          </p>
        </div>

        {/* 5 Pipeline Stages Navigation Bar (Vibrant & Colorful) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px', marginBottom: '1.25rem' }}>
          
          {/* Stage 1: Sky Blue */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #BAE6FD', borderTop: '3.5px solid #0284C7', borderRadius: '12px', padding: '10px 12px', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#0369A1', background: '#E0F2FE', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage 1</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0284C7' }}>⚡ INGEST</span>
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>Multi-CSE Ingestion</div>
            <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>CSV/JSON/LOG • Pseudonymizer</div>
          </div>

          {/* Stage 2: Indigo / Purple */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #DDD6FE', borderTop: '3.5px solid #7C3AED', borderRadius: '12px', padding: '10px 12px', boxShadow: '0 2px 6px rgba(124, 58, 237, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#6D28D9', background: '#EDE9FE', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage 2</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#7C3AED' }}>🔒 LEDGER</span>
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>Forensic Fact Ledger</div>
            <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>Partitioned Tables • SQLite WAL</div>
          </div>

          {/* Stage 3: Crimson / Amber Flame */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #FECACA', borderTop: '3.5px solid #DC2626', borderRadius: '12px', padding: '10px 12px', boxShadow: '0 2px 6px rgba(220, 38, 38, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#991B1B', background: '#FEE2E2', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage 3</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#DC2626' }}>🚨 11 DETECTORS</span>
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>Supervisory Analytics</div>
            <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>Execution Gaps &amp; Negative Space</div>
          </div>

          {/* Stage 4: Magenta / Violet AI */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #FBCFE8', borderTop: '3.5px solid #DB2777', borderRadius: '12px', padding: '10px 12px', boxShadow: '0 2px 6px rgba(219, 39, 119, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#9D174D', background: '#FCE7F3', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage 4</span>
              <span style={{ fontSize: '0.62rem', padding: '1px 6px', background: '#FDF2F8', color: '#BE185D', borderRadius: '4px', fontWeight: 800, border: '1px solid #FBCFE8' }}>✨ AIR-GAP AI</span>
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>Local AI Copilot</div>
            <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>Ollama 3B • Zero Cloud</div>
          </div>

          {/* Stage 5: Emerald Green */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #BBF7D0', borderTop: '3.5px solid #16A34A', borderRadius: '12px', padding: '10px 12px', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#166534', background: '#DCFCE7', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage 5</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#16A34A' }}>🛡️ AUDIT</span>
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>Decision Support &amp; Audit</div>
            <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>85/15 Queue • SHA-256 Ledger</div>
          </div>

        </div>

        {/* White Markdown Mermaid Architecture Window (Pure Neutral, Low Height, Small Boxes) */}
        <div 
          style={{ 
            background: '#FFFFFF', 
            border: '1.5px solid #CBD5E1', 
            borderRadius: '14px', 
            overflow: 'hidden', 
            boxShadow: '0 4px 16px -2px rgba(0,0,0,0.05)' 
          }}
        >
          
          {/* Markdown Code Window Header */}
          <div 
            style={{ 
              padding: '0.65rem 1.25rem', 
              background: '#F8FAFC', 
              borderBottom: '1px solid #E2E8F0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              flexWrap: 'wrap', 
              gap: '0.75rem' 
            }}
          >
            {/* Title & Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode2 size={16} color="#64748B" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                ARCHITECTURE.md
              </span>
              <span style={{ fontSize: '0.64rem', fontWeight: 700, background: '#FFFFFF', color: '#475569', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: '5px' }}>
                ```mermaid
              </span>
              <span style={{ fontSize: '0.64rem', fontWeight: 700, background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: '5px' }}>
                AIR-GAPPED COMPLIANT
              </span>
            </div>

            {/* Controls: Mode Switcher & Copy & Expand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', gap: '2px', border: '1px solid #E2E8F0' }}>
                <button
                  onClick={() => setDiagramMode('rendered')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: diagramMode === 'rendered' ? '#FFFFFF' : 'transparent',
                    color: diagramMode === 'rendered' ? '#0F172A' : '#64748B',
                    boxShadow: diagramMode === 'rendered' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={12} />
                  Mermaid Preview
                </button>

                <button
                  onClick={() => setDiagramMode('code')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: diagramMode === 'code' ? '#FFFFFF' : 'transparent',
                    color: diagramMode === 'code' ? '#0F172A' : '#64748B',
                    boxShadow: diagramMode === 'code' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Code size={12} />
                  Mermaid Source
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
                    boxShadow: diagramMode === 'ascii' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Terminal size={12} />
                  ASCII Spec
                </button>
              </div>

              {/* Action Buttons: Fullscreen & Copy */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Expand View'}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    padding: '5px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>

                <button
                  onClick={() => handleCopy(MERMAID_PIPELINE)}
                  title="Copy Mermaid Code"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.72rem',
                    fontWeight: 600
                  }}
                >
                  {copied ? <Check size={13} color="#16A34A" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* VIEW 1: Rendered Mermaid Diagram (White Background, Low Height, Small Boxes) */}
          {diagramMode === 'rendered' && (
            <div 
              style={{ 
                padding: '1.25rem 1rem', 
                background: '#FFFFFF', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                overflowX: 'auto',
                minHeight: '220px'
              }}
            >
              <style>{`
                .mermaid-white-render svg {
                  max-width: 100% !important;
                  height: auto !important;
                  background: #FFFFFF !important;
                }
                .mermaid-white-render .node rect,
                .mermaid-white-render .node circle,
                .mermaid-white-render .node polygon {
                  rx: 6px !important;
                  ry: 6px !important;
                  fill: #FFFFFF !important;
                  stroke: #1E293B !important;
                  stroke-width: 1.4px !important;
                }
                .mermaid-white-render .node text {
                  fill: #0F172A !important;
                  font-size: 11px !important;
                  font-weight: 600 !important;
                  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
                }
                .mermaid-white-render .cluster rect {
                  rx: 10px !important;
                  ry: 10px !important;
                  fill: #F8FAFC !important;
                  stroke: #CBD5E1 !important;
                  stroke-width: 1px !important;
                }
                .mermaid-white-render .cluster text {
                  fill: #475569 !important;
                  font-size: 10.5px !important;
                  font-weight: 700 !important;
                  letter-spacing: 0.04em !important;
                  text-transform: uppercase !important;
                }
                .mermaid-white-render .edgePath path {
                  stroke: #334155 !important;
                  stroke-width: 1.4px !important;
                }
                .mermaid-white-render marker path,
                .mermaid-white-render .marker {
                  fill: #334155 !important;
                  stroke: #334155 !important;
                }
                .mermaid-white-render .edgeLabel {
                  background-color: #FFFFFF !important;
                  color: #334155 !important;
                  font-size: 9.5px !important;
                  font-weight: 600 !important;
                  padding: 1px 4px !important;
                }
              `}</style>
              <div 
                ref={mermaidRef} 
                className="mermaid-white-render"
                style={{ 
                  width: '100%', 
                  maxWidth: isFullscreen ? '100%' : '1100px', 
                  display: 'flex', 
                  justifyContent: 'center' 
                }} 
              />
            </div>
          )}

          {/* VIEW 2: Raw Mermaid Code Block */}
          {diagramMode === 'code' && (
            <div style={{ background: '#F8FAFC', color: '#0F172A', padding: '1.25rem', overflowX: 'auto', borderTop: '1px solid #E2E8F0' }}>
              <pre style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '0.74rem', lineHeight: 1.5, margin: 0, color: '#0F172A' }}>
                {MERMAID_PIPELINE}
              </pre>
            </div>
          )}

          {/* VIEW 3: ASCII Pipeline View */}
          {diagramMode === 'ascii' && (
            <div style={{ background: '#F8FAFC', color: '#0F172A', padding: '1.25rem', overflowX: 'auto', borderTop: '1px solid #E2E8F0' }}>
              <pre style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '0.7rem', lineHeight: 1.45, margin: 0, color: '#0F172A' }}>
                {ASCII_PIPELINE}
              </pre>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default ArchitectureSection;
