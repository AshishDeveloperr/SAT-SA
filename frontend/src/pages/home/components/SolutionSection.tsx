import React, { useState } from 'react';
import { 
  Scale, EyeOff, Layers, FileText, Database, HardDrive, 
  Cpu, ShieldCheck, ArrowRight, Timer, GitPullRequest, 
  CheckSquare, Copy, BellOff, Radar, Activity, ChevronRight
} from 'lucide-react';

export const SolutionSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'execution' | 'negative' | 'dimensions'>('execution');

  return (
    <section id="solution" className="landing-section bg-canvas">
      <div className="landing-content-wrap">
        
        {/* Section Header */}
        <div style={{ maxWidth: '100%', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem', border: '1px solid #FECACA' }}>
            <Scale size={14} />
            <span>Dual-Discipline Supervisory Engine</span>
          </div>
          <h2 className="landing-h2" style={{ marginBottom: '1rem', whiteSpace: 'nowrap' }}>
            How SAT-SA solves the supervisory dilemma
          </h2>
          <p className="landing-lead" style={{ marginBottom: 0, maxWidth: '58rem' }}>
            Rather than serving as another operational SIEM, SAT-SA operates as a{' '}
            <span style={{ backgroundColor: '#991B1B', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
              supervisory audit workbench
            </span>
            . It correlates periodic alert metadata, case logs, and asset registries to surface true operational posture.
          </p>
        </div>

        {/* ================= 2. INPUT -> OUTPUT EQUATION FORMULA ================= */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', 
            border: '1px solid #E2E8F0', 
            borderRadius: '18px', 
            padding: '1.75rem 2rem', 
            marginBottom: '2.5rem',
            boxShadow: '0 4px 16px -4px rgba(15,23,42,0.06)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', alignItems: 'center', gap: '1.25rem' }}>
            
            {/* 1. Inputs Multi-Card Block */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
                1. Ingested Evidence Feeds
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#E0F2FE', padding: '4px', borderRadius: '6px', color: '#0284C7' }}>
                      <FileText size={15} />
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Alert Metadata</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace', color: '#64748B', fontWeight: 600 }}>SIEM / EDR</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#E0F2FE', padding: '4px', borderRadius: '6px', color: '#0284C7' }}>
                      <Database size={15} />
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Case & Triage Notes</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace', color: '#64748B', fontWeight: 600 }}>ITSM / SOAR</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#E0F2FE', padding: '4px', borderRadius: '6px', color: '#0284C7' }}>
                      <HardDrive size={15} />
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>Asset Registries</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace', color: '#64748B', fontWeight: 600 }}>OT / SCADA</span>
                </div>
              </div>
            </div>

            {/* Transform Arrow 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#991B1B' }}>
              <div style={{ background: '#FEE2E2', padding: '8px', borderRadius: '50%', color: '#991B1B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={22} strokeWidth={2.5} />
              </div>
            </div>

            {/* 2. SAT-SA Core Engine Card */}
            <div 
              style={{ 
                background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)', 
                color: '#FFFFFF', 
                borderRadius: '14px', 
                padding: '1.25rem 1.4rem', 
                border: '1px solid #334155',
                boxShadow: '0 8px 24px -4px rgba(15,23,42,0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.18)', border: '1px solid #EF4444', padding: '7px', borderRadius: '8px', color: '#F87171' }}>
                  <Cpu size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.01em', color: '#FFFFFF' }}>SAT-SA Engine Core</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>Supervisory Workbench</div>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.75rem', color: '#CBD5E1', lineHeight: 1.45, border: '1px solid rgba(255,255,255,0.08)' }}>
                <strong style={{ color: '#FCA5A5' }}>10 Statistical Detectors</strong> correlate timeline timestamps & negative space anomalies against sector benchmarks.
              </div>
            </div>

            {/* Transform Arrow 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#991B1B' }}>
              <div style={{ background: '#FEE2E2', padding: '8px', borderRadius: '50%', color: '#991B1B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={22} strokeWidth={2.5} />
              </div>
            </div>

            {/* 3. Output Assessment Card */}
            <div 
              style={{ 
                background: '#FFFFFF', 
                border: '2px solid #EF4444', 
                borderRadius: '14px', 
                padding: '1.25rem 1.4rem', 
                boxShadow: '0 8px 24px -4px rgba(239,68,68,0.12)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '7px', borderRadius: '8px', color: '#DC2626' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#991B1B' }}>True Operational Posture</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Audited Cyber Resilience</div>
                </div>
              </div>
              <div style={{ background: '#FEF2F2', borderRadius: '8px', padding: '8px 10px', fontSize: '0.75rem', color: '#7F1D1D', lineHeight: 1.45, border: '1px solid #FCA5A5' }}>
                <strong style={{ color: '#991B1B' }}>Real Gap Score (0–100)</strong> + deterministic evidence chain for regulators & senior leadership oversight.
              </div>
            </div>

          </div>
        </div>

        {/* Tab Buttons & Teaser Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('execution')}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '0.5rem',
                border: activeTab === 'execution' ? '1px solid #991B1B' : '1px solid #CBD5E1',
                backgroundColor: activeTab === 'execution' ? '#991B1B' : '#FFFFFF',
                color: activeTab === 'execution' ? '#FFFFFF' : '#0F172A',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Scale size={15} />
              Execution Gap Discovery
            </button>

            <button
              onClick={() => setActiveTab('negative')}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '0.5rem',
                border: activeTab === 'negative' ? '1px solid #991B1B' : '1px solid #CBD5E1',
                backgroundColor: activeTab === 'negative' ? '#991B1B' : '#FFFFFF',
                color: activeTab === 'negative' ? '#FFFFFF' : '#0F172A',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <EyeOff size={15} />
              Negative Space Reasoning
            </button>

            <button
              onClick={() => setActiveTab('dimensions')}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '0.5rem',
                border: activeTab === 'dimensions' ? '1px solid #991B1B' : '1px solid #CBD5E1',
                backgroundColor: activeTab === 'dimensions' ? '#991B1B' : '#FFFFFF',
                color: activeTab === 'dimensions' ? '#FFFFFF' : '#0F172A',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={15} />
              The 8 Capability Dimensions
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
            <span>10 Automated Mathematical Detectors</span>
            <ChevronRight size={14} color="#991B1B" />
          </div>
        </div>

        {/* Tab 1: Execution Gap with Visual Mini-Graphics */}
        {activeTab === 'execution' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                Execution Gap Discovery (Documented Policies vs Operational Evidence)
              </h3>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: '6px' }}>
                4 DETECTORS ACTIVE
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              Identifies conditions where policies, reported SLAs, or dashboards suggest healthy operation, but operational evidence shows otherwise.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* EG-01 */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #FCA5A5', padding: '1.25rem', borderRadius: '14px', position: 'relative', boxShadow: '0 4px 12px rgba(239,68,68,0.06)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#991B1B' }}>DETECTOR EG-01</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, background: '#FEE2E2', color: '#DC2626', padding: '2px 6px', borderRadius: '4px' }}>HIGH ANOMALY</span>
                </div>
                
                {/* Visual Mini-Graphic: Stopwatch / Mini Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FEF2F2', padding: '8px 10px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ background: '#DC2626', padding: '6px', borderRadius: '6px', color: '#FFFFFF', flexShrink: 0 }}>
                    <Timer size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#991B1B', whiteSpace: 'nowrap' }}>Closure Time</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626' }}>&lt; 3 mins</span>
                    </div>
                    {/* Mini Bar Comparison */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
                      <div style={{ height: '6px', width: '22%', background: '#DC2626', borderRadius: '3px' }} title="Rubber stamp (<3m)"></div>
                      <div style={{ height: '6px', width: '78%', background: '#CBD5E1', borderRadius: '3px' }} title="Peer average (>60m)"></div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '2px', lineHeight: 1.3 }}>Fast Critical Closures</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '6px', lineHeight: 1.5, flex: 1 }}>
                  Flags critical alerts closed in <strong style={{ color: '#0F172A' }}>&lt;10 minutes</strong> without authentic triage depth against sectoral peer medians.
                </div>
              </div>

              {/* EG-02 */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #FCA5A5', padding: '1.25rem', borderRadius: '14px', position: 'relative', boxShadow: '0 4px 12px rgba(239,68,68,0.06)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#991B1B' }}>DETECTOR EG-02</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, background: '#FEE2E2', color: '#DC2626', padding: '2px 6px', borderRadius: '4px' }}>CRITICAL BREACH</span>
                </div>
                
                {/* Visual Mini-Graphic: Broken L1 -> L2 Escalation Arrow */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FEF2F2', padding: '8px 10px', borderRadius: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', background: '#FFFFFF', padding: '3px 8px', borderRadius: '5px', border: '1px solid #CBD5E1' }}>L1 Triage</span>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative', color: '#DC2626' }}>
                    <div style={{ width: '28px', height: '2px', background: '#DC2626' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#DC2626', marginLeft: '1px' }}>✕</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', background: '#FFFFFF', padding: '3px 8px', borderRadius: '5px', border: '1px dashed #CBD5E1' }}>L2 / CIRT</span>
                </div>

                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '2px', lineHeight: 1.3 }}>Unescalated Critical Threats</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '6px', lineHeight: 1.5, flex: 1 }}>
                  Detects high-severity threats closed at L1 with <strong style={{ color: '#0F172A' }}>No L2/CIRT Escalation</strong> or supervisory sign-off.
                </div>
              </div>

              {/* EG-03 */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #FCA5A5', padding: '1.25rem', borderRadius: '14px', position: 'relative', boxShadow: '0 4px 12px rgba(239,68,68,0.06)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#991B1B' }}>DETECTOR EG-03</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, background: '#FEE2E2', color: '#DC2626', padding: '2px 6px', borderRadius: '4px' }}>SLA GAMING</span>
                </div>
                
                {/* Visual Mini-Graphic: Empty Checklist with Paused Timer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FEF2F2', padding: '8px 10px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', border: '1.5px solid #DC2626', borderRadius: '3px' }}></div>
                    <div style={{ width: '12px', height: '12px', border: '1.5px solid #DC2626', borderRadius: '3px' }}></div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#991B1B' }}>0 Steps Done</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#FEE2E2', color: '#DC2626', padding: '2px 6px', borderRadius: '4px' }}>Timer Frozen</span>
                </div>

                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '2px', lineHeight: 1.3 }}>Acknowledged with Zero Steps</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '6px', lineHeight: 1.5, flex: 1 }}>
                  Surfaces tickets acknowledged to freeze SLA timers with <strong style={{ color: '#0F172A' }}>Zero forensic steps</strong> or case notes.
                </div>
              </div>

              {/* EG-04 */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #FCA5A5', padding: '1.25rem', borderRadius: '14px', position: 'relative', boxShadow: '0 4px 12px rgba(239,68,68,0.06)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#991B1B' }}>DETECTOR EG-04</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, background: '#FEE2E2', color: '#DC2626', padding: '2px 6px', borderRadius: '4px' }}>BOILERPLATE</span>
                </div>
                
                {/* Visual Mini-Graphic: Overlapping Duplicate Docs / SimHash match */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FEF2F2', padding: '8px 10px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Copy size={14} color="#991B1B" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#991B1B' }}>Template Match</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#0F172A', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>SimHash 93%</span>
                </div>

                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '2px', lineHeight: 1.3 }}>Templated / Duplicate Notes</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '6px', lineHeight: 1.5, flex: 1 }}>
                  Applies <strong style={{ color: '#0F172A' }}>64-bit SimHash</strong> to detect <strong style={{ color: '#0F172A' }}>copy-pasted</strong> closing remarks.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Negative Space with Visual Mini-Graphics */}
        {activeTab === 'negative' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                Negative Space Reasoning (Detecting What is Suspiciously Absent)
              </h3>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: '6px' }}>
                3 DETECTORS ACTIVE
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              Where conventional SIEMs only alarm on generated events, SAT-SA detects silent systems, missing threat categories, and monitoring blackouts.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              
              {/* NS-01 */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #FCA5A5', padding: '1.35rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(239,68,68,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#991B1B' }}>DETECTOR NS-01</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#FEE2E2', color: '#DC2626', padding: '2px 6px', borderRadius: '4px' }}>BLIND SPOT</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FEF2F2', padding: '8px 10px', borderRadius: '8px', marginBottom: '10px' }}>
                  <BellOff size={16} color="#DC2626" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#991B1B' }}>SCADA Node: 0 Alerts for &gt;14 Days</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>Silent Critical Assets</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px', lineHeight: 1.5 }}>
                  Identifies Tier-1 SCADA or Domain Controllers that have gone <strong style={{ color: '#0F172A' }}>completely silent</strong>, indicating disabled sensors.
                </div>
              </div>

              {/* NS-02 */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #FCA5A5', padding: '1.35rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(239,68,68,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#991B1B' }}>DETECTOR NS-02</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#FEE2E2', color: '#DC2626', padding: '2px 6px', borderRadius: '4px' }}>UNOBSERVED TAXONOMY</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FEF2F2', padding: '8px 10px', borderRadius: '8px', marginBottom: '10px' }}>
                  <Radar size={16} color="#DC2626" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#991B1B' }}>Missing: Modbus Injection (0%)</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>Missing Expected Threat Classes</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px', lineHeight: 1.5 }}>
                  Flags complete absence of threat vectors prevalent across <strong style={{ color: '#0F172A' }}>70%+ sectoral peers</strong> in that cohort.
                </div>
              </div>

              {/* NS-05 */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #FCA5A5', padding: '1.35rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(239,68,68,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#991B1B' }}>DETECTOR NS-05</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#FEE2E2', color: '#DC2626', padding: '2px 6px', borderRadius: '4px' }}>VELOCITY SUPPRESSION</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FEF2F2', padding: '8px 10px', borderRadius: '8px', marginBottom: '10px' }}>
                  <Activity size={16} color="#DC2626" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#991B1B' }}>Z-Score: -2.85 (Suppressed Logs)</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>Unexpectedly Low Activity</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px', lineHeight: 1.5 }}>
                  Uses <strong style={{ color: '#0F172A' }}>Median Absolute Deviation (MAD)</strong> to flag unplausibly quiet infrastructure periods.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Dimensions */}
        {activeTab === 'dimensions' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
              The 8 Mandated Capability Dimensions (NCIIPC Framework)
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Every finding maps deterministically into the eight supervisory cyber resilience capabilities:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {[
                { name: '1. Threat Detection', desc: 'Category mix, entropy, asset coverage' },
                { name: '2. Investigation', desc: 'Triage duration, steps per alert, SimHash duplicates' },
                { name: '3. Escalation Integrity', desc: 'L1 to L2/CIRT completeness & delays' },
                { name: '4. Incident Response', desc: 'MTTR, root cause documentation, rework rate' },
                { name: '5. Security Operations', desc: 'Unhandled backlog aging, analyst concentration' },
                { name: '6. Governance & Oversight', desc: 'Closure completeness, disposition hygiene' },
                { name: '7. Operational Discipline', desc: 'SLA variance, burst closure bunching' },
                { name: '8. Cyber Resilience', desc: 'Critical system coverage, silent asset detection' }
              ].map((dim, i) => (
                <div key={i} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{dim.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>{dim.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default SolutionSection;
