import React, { useState } from 'react';
import { Scale, EyeOff, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

export const SolutionSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'execution' | 'negative' | 'dimensions'>('execution');

  return (
    <section id="solution" className="landing-section bg-canvas">
      <div className="landing-content-wrap">
        
        {/* Section Header */}
        <div style={{ maxWidth: '44rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem', border: '1px solid #FECACA' }}>
            <Scale size={14} />
            <span>Dual-Discipline Supervisory Engine</span>
          </div>
          <h2 className="landing-h2" style={{ marginBottom: '1rem' }}>
            How SAT-SA solves the supervisory dilemma
          </h2>
          <p className="landing-lead" style={{ marginBottom: 0 }}>
            Rather than serving as another operational SIEM, SAT-SA operates as a{' '}
            <span style={{ backgroundColor: '#991B1B', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
              supervisory audit workbench
            </span>
            . It correlates periodic alert metadata, case logs, and asset registries to surface true operational posture.
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
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
              gap: '6px'
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
              gap: '6px'
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
              gap: '6px'
            }}
          >
            <Layers size={15} />
            The 8 Capability Dimensions
          </button>
        </div>

        {/* Tab 1: Execution Gap */}
        {activeTab === 'execution' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
              Execution Gap Discovery (Documented Policies vs Operational Evidence)
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Identifies conditions where policies, reported SLAs, or dashboards suggest healthy operation, but operational evidence shows otherwise.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#991B1B' }}>DETECTOR EG-01</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>Fast Critical Closures</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px' }}>Flags critical alerts closed in &lt;10 minutes without triage depth against sectoral peer medians.</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#991B1B' }}>DETECTOR EG-02</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>Unescalated Critical Threats</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px' }}>Detects high-severity threats closed at L1 without escalation to L2/CIRT or documented approval.</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#991B1B' }}>DETECTOR EG-03</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>Acknowledged with Zero Steps</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px' }}>Surfaces tickets acknowledged to freeze SLA timers with zero forensic steps or case notes.</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#991B1B' }}>DETECTOR EG-04</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>Templated / Duplicate Notes</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px' }}>Applies 64-bit SimHash lexical fingerprinting to detect copy-pasted rubber-stamped investigations.</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Negative Space */}
        {activeTab === 'negative' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
              Negative Space Reasoning (Detecting What is Absent)
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Where conventional SIEMs only alarm on generated events, SAT-SA detects silent systems, missing threat categories, and monitoring blackouts.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#7C3AED' }}>DETECTOR NS-01</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>Silent Critical Assets</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px' }}>Identifies high-criticality SCADA, Active Directory, or DB clusters with zero telemetry for &gt;14 days.</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#7C3AED' }}>DETECTOR NS-02</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>Missing Expected Threat Categories</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px' }}>Flags complete absence of categories (e.g. Credential Dumping) prevalent across 70%+ sectoral peers.</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#7C3AED' }}>DETECTOR NS-05</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>Unexpectedly Low Activity</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px' }}>Calculates robust z-scores against sector medians to detect sensor failure or log collection blackouts.</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Dimensions */}
        {activeTab === 'dimensions' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
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
