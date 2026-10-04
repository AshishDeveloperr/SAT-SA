import React, { useState } from 'react';
import { Terminal, Copy, Check, Lock, Play } from 'lucide-react';

export const DeploySection: React.FC = () => {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    if (text.includes('build')) setCopiedStep('docker');
    else if (text.includes('health')) setCopiedStep('health');
    else setCopiedStep('url');
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <section id="deploy" className="landing-section bg-subtle">
      <div className="landing-content-wrap">
        
        {/* Section Header */}
        <div style={{ maxWidth: '44rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem', border: '1px solid #FECACA' }}>
            <Lock size={14} />
            <span>Air-Gapped Deployment</span>
          </div>
          <h2 className="landing-h2" style={{ marginBottom: '0.75rem' }}>
            Zero-internet deployment in under 60 seconds
          </h2>
          <p className="landing-lead" style={{ marginBottom: 0, lineHeight: 1.75, color: '#0F172A' }}>
            Bundled with{' '}
            <span className="highlight-badge-red">
              self-contained dependencies
            </span>{' '}
            and local database seeds. Runs cleanly on{' '}
            <span className="highlight-badge-dark">
              air-gapped laptops
            </span>{' '}
            or secure server racks.
          </p>
        </div>

        {/* Docker Quickstart Cards & Commands (No dark terminal, light cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          
          {/* Step 1: Docker Compose Launch */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '14px', padding: '1.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', padding: '2px 8px', borderRadius: '4px' }}>
                  STEP 01
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                  Start All 4 Containers (Docker)
                </span>
              </div>
              <button
                onClick={() => handleCopy('docker compose up -d --build')}
                style={{
                  marginLeft: 'auto',
                  background: copiedStep === 'docker' ? '#DCFCE7' : '#F1F5F9',
                  border: copiedStep === 'docker' ? '1px solid #BBF7D0' : '1px solid #CBD5E1',
                  color: copiedStep === 'docker' ? '#166534' : '#0F172A',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}
              >
                {copiedStep === 'docker' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedStep === 'docker' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#0F172A', fontWeight: 700, marginBottom: '0.75rem' }}>
              <code>docker compose up -d --build</code>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.5 }}>
              Spins up <strong style={{ color: '#0F172A' }}>satsa-gateway</strong> (Nginx:80), <strong style={{ color: '#0F172A' }}>satsa-api</strong> (Express:5000), <strong style={{ color: '#0F172A' }}>satsa-db</strong> (PostgreSQL 16), and <strong style={{ color: '#0F172A' }}>satsa-ollama</strong> (Air-Gap LLM:11434).
            </div>
          </div>

          {/* Step 2: Verification & Healthcheck */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '14px', padding: '1.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#EDE9FE', color: '#6D28D9', border: '1px solid #DDD6FE', padding: '2px 8px', borderRadius: '4px' }}>
                  STEP 02
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                  Verify Health &amp; Ingestion Ready
                </span>
              </div>
              <button
                onClick={() => handleCopy('docker compose ps && curl -s http://localhost:5000/health')}
                style={{
                  marginLeft: 'auto',
                  background: copiedStep === 'health' ? '#DCFCE7' : '#F1F5F9',
                  border: copiedStep === 'health' ? '1px solid #BBF7D0' : '1px solid #CBD5E1',
                  color: copiedStep === 'health' ? '#166534' : '#0F172A',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}
              >
                {copiedStep === 'health' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedStep === 'health' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#0F172A', fontWeight: 700, marginBottom: '0.75rem' }}>
              <code>docker compose ps && curl -s http://localhost:5000/health</code>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.5 }}>
              Runs zero-network health checks across SQLite/PG databases and confirms offline 11 detector rule registry readiness.
            </div>
          </div>

          {/* Step 3: Access Workbench */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '14px', padding: '1.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', padding: '2px 8px', borderRadius: '4px' }}>
                  STEP 03
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                  Open Supervisory Workbench
                </span>
              </div>
              <button
                onClick={() => handleCopy('http://localhost:80')}
                style={{
                  marginLeft: 'auto',
                  background: copiedStep === 'url' ? '#DCFCE7' : '#F1F5F9',
                  border: copiedStep === 'url' ? '1px solid #BBF7D0' : '1px solid #CBD5E1',
                  color: copiedStep === 'url' ? '#166534' : '#0F172A',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}
              >
                {copiedStep === 'url' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedStep === 'url' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#0F172A', fontWeight: 700, marginBottom: '0.75rem' }}>
              <code>http://localhost (or http://localhost:5173 in dev)</code>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.5 }}>
              Ready for immediate periodic batch drop ingestion, supervisory queue triage, and Section 65B tamper-proof audit generation.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
