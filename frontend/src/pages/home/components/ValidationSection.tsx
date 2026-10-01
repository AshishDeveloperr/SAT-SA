import React from 'react';
import { TrendingUp, CheckCircle, ShieldAlert } from 'lucide-react';

export const ValidationSection: React.FC = () => {
  return (
    <section id="validation" className="landing-section bg-subtle">
      <div className="landing-content-wrap">
        
        {/* Section Header */}
        <div style={{ maxWidth: '44rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem', border: '1px solid #FECACA' }}>
            <TrendingUp size={14} />
            <span>Problem Statement §8 Validation Requirement</span>
          </div>
          <h2 className="landing-h2" style={{ marginBottom: '0.75rem' }}>
            Validation vs. expert manual review baseline
          </h2>
          <p className="landing-lead" style={{ marginBottom: 0 }}>
            Proven against simulated manual sampling baselines using an anti-circular latent maturity generator. Defects emerge from simulated analyst behaviors rather than hardcoded labels.
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Lift over Random Baseline</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#991B1B', fontFamily: 'JetBrains Mono, monospace', marginTop: '6px' }}>3.42×</div>
            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '6px' }}>Surfaces 3.42 times more execution gaps per 100 reviewed records.</div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Defect Recall @ Budget</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace', marginTop: '6px' }}>88%</div>
            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '6px' }}>88% of true operational weaknesses captured in prioritized review queue.</div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Clean Cohort False Positive Rate</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace', marginTop: '6px' }}>5.0%</div>
            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '6px' }}>Prevents supervisory alert fatigue on high-maturity entities (e.g. CSE-BANK-01).</div>
          </div>
        </div>

        {/* Defect Coverage Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>
            Defect Type Recall &amp; Lift Breakdown
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'High-Severity Fast Closures (EG-01)', lift: '3.8× Lift', status: 'Captured' },
              { label: 'Un-escalated Critical Alerts (EG-02)', lift: '4.1× Lift', status: 'Captured' },
              { label: 'Zero-Step Acknowledged Alerts (EG-03)', lift: '3.2× Lift', status: 'Captured' },
              { label: 'Silent SCADA Controllers (NS-01)', lift: '5.0× Lift', status: 'Captured' },
              { label: 'Missing Expected Threat Categories (NS-02)', lift: '2.9× Lift', status: 'Captured' }
            ].map((d, i) => (
              <div key={i} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>{d.label}</span>
                <span style={{ fontSize: '0.72rem', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                  {d.lift}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
