import React, { useState } from 'react';
import { Terminal, Copy, Check, Lock, Play } from 'lucide-react';

export const DeploySection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const command = `# 1. Clone repository in air-gapped machine
git clone <repo-url> && cd SIH2

# 2. Start PostgreSQL, Analytics API, and Nginx Gateway
docker compose up -d --build

# 3. Access Supervisory Dashboard
# URL: http://localhost`;

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <p className="landing-lead" style={{ marginBottom: 0 }}>
            Bundled with self-contained dependencies and local database seeds. Runs cleanly on air-gapped laptops or server racks.
          </p>
        </div>

        {/* Code Terminal Box */}
        <div style={{ background: '#0B0F17', border: '1px solid #1E293B', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
          <div style={{ background: '#080C14', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyItems: 'space-between', borderBottom: '1px solid #1E293B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#94A3B8', marginLeft: '8px' }}>
                terminal — airgap-deploy.sh
              </span>
            </div>

            <button
              onClick={handleCopy}
              style={{
                marginLeft: 'auto',
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#CBD5E1',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem'
              }}
            >
              {copied ? <Check size={14} color="#EF4444" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Commands'}</span>
            </button>
          </div>

          <div style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <pre style={{ margin: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#E2E8F0', lineHeight: 1.6 }}>
              {command}
            </pre>
          </div>
        </div>

      </div>
    </section>
  );
};
