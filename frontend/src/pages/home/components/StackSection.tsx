import React from 'react';
import { Cpu } from 'lucide-react';

// Authentic Official Brand SVG Icons
const NodeJsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 256 256" fill="none">
    <path d="M128 12.8L227.6 70.3V185.3L128 222.8L28.4 185.3V70.3L128 12.8Z" fill="#339933" />
    <path d="M128 22.8L219.1 75.3V180.3L128 212.8L36.9 180.3V75.3L128 22.8Z" fill="#026E00" />
    <path d="M128 53L178 82V140L128 169L78 140V82L128 53Z" fill="#FFFFFF" fillOpacity="0.9" />
  </svg>
);

const ReactIcon = () => (
  <svg width="22" height="22" viewBox="-11.5 -10.23174 23 20.46348" fill="none">
    <circle cx="0" cy="0" r="2.05" fill="#61DAFB"/>
    <g stroke="#61DAFB" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2"/>
      <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
      <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
    </g>
  </svg>
);

const TypeScriptIcon = () => (
  <svg width="22" height="22" viewBox="0 0 256 256" fill="none">
    <rect width="256" height="256" rx="32" fill="#3178C6" />
    <path d="M136.6 156.4c-4.4 2.4-9.3 3.6-14.7 3.6-6.4 0-11.4-1.7-15.1-5-3.6-3.4-5.5-8.1-5.5-14.2V89.4h-24.8V70.6h74.2v18.8h-29.2v50.2c0 2.8.8 4.9 2.4 6.3 1.6 1.4 3.9 2.1 6.8 2.1 2.4 0 4.8-.4 7.2-1.2l-1.3 9.6zm63.8-3.4c-5.7 4.7-13.4 7.1-23.1 7.1-8.5 0-15.3-2.1-20.4-6.3-5-4.2-7.6-10.2-7.6-17.9 0-7.8 2.8-13.8 8.4-18.1 5.6-4.3 13.5-6.6 23.6-6.8l12.4-.2v-5.2c0-3.6-1-6.2-3-7.9-2-1.7-5.1-2.5-9.3-2.5-4 0-7.4.8-10.2 2.3-2.8 1.5-4.6 3.6-5.4 6.2l-14.4-4.8c2.2-5.4 6.1-9.7 11.7-13 5.6-3.3 12.6-4.9 21-4.9 9.3 0 16.5 2.1 21.6 6.3 5.1 4.2 7.6 10.4 7.6 18.6v45.2h-12.8v-8.2zm-6.8-21.7l-9.8.2c-5.4.1-9.3 1.2-11.7 3.2-2.4 2-3.6 4.9-3.6 8.7 0 3.6 1.1 6.3 3.3 8.1 2.2 1.8 5.4 2.7 9.6 2.7 4.2 0 7.6-1.1 10.1-3.2 2.5-2.1 3.8-5.1 3.8-8.9v-10.8h-1.7z" fill="#FFFFFF" />
  </svg>
);

const PostgresIcon = () => (
  <svg width="22" height="22" viewBox="0 0 256 256" fill="none">
    <path d="M128 16C66.1 16 16 66.1 16 128s50.1 112 112 112 112-50.1 112-112S189.9 16 128 16z" fill="#336791" />
    <path d="M185 110c-3-15-14-30-31-38-12-6-28-7-40-2-10 4-18 12-23 21-8 15-7 34-1 50 5 13 15 25 28 31 10 5 23 6 34 2 13-5 24-16 29-29 3-8 5-18 4-27v-8h-34v13h19c-3 10-10 18-20 21-7 2-15 1-22-2-8-4-14-12-16-21-2-10-1-21 4-30 4-7 11-13 19-15 8-2 17 0 24 4 7 4 13 11 16 19l14-7z" fill="#FFFFFF" />
  </svg>
);

const SqliteIcon = () => (
  <svg width="22" height="22" viewBox="0 0 256 256" fill="none">
    <path d="M128 20L236 76v104L128 236 20 180V76L128 20z" fill="#003B57" />
    <path d="M70 128c0-30 25-54 58-54s58 24 58 54-25 54-58 54-58-24-58-54z" fill="#00A8E8" opacity="0.3" />
    <path d="M85 145c10 15 26 23 43 23s33-8 43-23" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
    <circle cx="102" cy="112" r="8" fill="#FFFFFF" />
    <circle cx="154" cy="112" r="8" fill="#FFFFFF" />
  </svg>
);

const OllamaIcon = () => (
  <svg width="22" height="22" viewBox="0 0 256 256" fill="none">
    <rect width="256" height="256" rx="48" fill="#111827" />
    <circle cx="95" cy="110" r="16" fill="#FFFFFF" />
    <circle cx="161" cy="110" r="16" fill="#FFFFFF" />
    <path d="M96 156c12 16 48 16 64 0" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round" />
    <path d="M128 40v30M70 55l20 22M186 55l-20 22" stroke="#60A5FA" strokeWidth="12" strokeLinecap="round" />
  </svg>
);

const DockerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 256 256" fill="none">
    <path d="M246 128c-3-19-17-31-35-33-3-13-12-22-26-26l-10-3-6 8c-7 9-11 20-11 31H12c-6 0-12 5-12 11 0 35 15 67 40 88 23 20 54 30 88 30 46 0 86-19 108-50 15-21 21-41 20-56zm-176-7h20v20H70v-20zm0-26h20v20H70V95zm26 26h20v20H96v-20zm0-26h20v20H96V95zm26 26h20v20h-20v-20zm0-26h20v20h-20V95zm26 26h20v20h-20v-20zm0-26h20v20h-20V95zm26 26h20v20h-20v-20z" fill="#2496ED" />
  </svg>
);

const Sha256Icon = () => (
  <svg width="22" height="22" viewBox="0 0 256 256" fill="none">
    <rect width="256" height="256" rx="36" fill="#991B1B" />
    <path d="M128 48L64 78v54c0 48 27 92 64 104 37-12 64-56 64-104V78l-64-30z" fill="#7F1D1D" stroke="#FECACA" strokeWidth="8" />
    <path d="M104 130l18 18 36-36" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const StackSection: React.FC = () => {
  const stackItems = [
    {
      title: 'Backend API & Streaming Workers',
      tech: 'Node.js 20 (ESM) · Express 4 · Knex.js',
      desc: 'Single-runtime native ESM with streaming chunked CSV/JSON/XLSX parsers, Zod 4 contract guards, and Pino forensic structured logging.',
      icon: NodeJsIcon,
      tag: 'BACKEND CORE',
      tagColor: '#166534',
      tagBg: '#DCFCE7'
    },
    {
      title: 'Supervisory User Interface',
      tech: 'React 18.3 · TypeScript 5.6 · Vite 6',
      desc: 'Zero-latency single page app with Mermaid 12 visual architectures, Tailwind CSS, Lucide icons, and pure offline browser execution.',
      icon: ReactIcon,
      tag: 'FRONTEND SPA',
      tagColor: '#0369A1',
      tagBg: '#E0F2FE'
    },
    {
      title: 'Air-Gapped Sovereign AI Copilot',
      tech: 'Ollama Daemon · Qwen2.5:3B / Llama 3.2',
      desc: 'Local air-gapped LLM on localhost:11434 with zero outbound internet calls. Synthesizes Sec 70A regulatory briefing dossiers and root-cause evidence.',
      icon: OllamaIcon,
      tag: '100% OFFLINE AI',
      tagColor: '#6D28D9',
      tagBg: '#EDE9FE'
    },
    {
      title: 'Enterprise Fact Ledger & Storage',
      tech: 'PostgreSQL 16 & Embedded SQLite 3',
      desc: 'Monthly partitioned fact tables (alerts, cases, assets) on PostgreSQL with SQLite WAL fallback for instant offline workstation deployments.',
      icon: PostgresIcon,
      tag: 'DATABASE DUAL-ENGINE',
      tagColor: '#1E40AF',
      tagBg: '#DBEAFE'
    },
    {
      title: 'Statistical Math & Heuristic Detectors',
      tech: 'Simple-Statistics · SimHash 64 · Robust MAD',
      desc: 'Deterministic mathematical unmasking algorithms running in sub-100ms. Calculates Median Absolute Deviation (MAD), robust Z-scores, and Lexical SimHash.',
      icon: TypeScriptIcon,
      tag: '11 DETERMINISTIC DETECTORS',
      tagColor: '#B45309',
      tagBg: '#FEF3C7'
    },
    {
      title: 'Air-Gapped Container Ecosystem',
      tech: 'Docker Compose · Nginx Alpine · Multi-Stage',
      desc: 'Self-contained multi-container deployment with internal no-network bridge isolation, zero internet phone-home, and instant single-command spinup.',
      icon: DockerIcon,
      tag: 'ZERO-NET ISOLATION',
      tagColor: '#0F172A',
      tagBg: '#F1F5F9'
    }
  ];

  return (
    <section id="stack" className="landing-section bg-canvas">
      <div className="landing-content-wrap">
        
        {/* Section Header */}
        <div style={{ maxWidth: '64rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem', border: '1px solid #FECACA' }}>
            <Cpu size={14} />
            <span>Sovereign Tech Stack</span>
          </div>
          <h2 className="landing-h2" style={{ marginBottom: '0.75rem' }}>
            Built for air-gapped sovereign resilience
          </h2>
          <p className="landing-lead" style={{ maxWidth: '100%', marginBottom: 0, lineHeight: 1.8, color: '#0F172A', fontSize: '0.96rem' }}>
            Every component is audited to guarantee{' '}
            <span className="highlight-badge-red">
              zero external dependency leaks
            </span>
            , maximum{' '}
            <span className="highlight-badge-dark">
              horizontal throughput
            </span>
            , and{' '}
            <span className="highlight-badge-red">
              long-term maintainability
            </span>
            . Architected from the ground up for{' '}
            <span className="highlight-badge-dark">
              classified enclaves &amp; SCADA environments
            </span>
            , our runtime operates entirely self-contained with{' '}
            <span className="highlight-badge-red">
              pure offline JavaScript execution
            </span>
            , embedded database persistence, and local AI inference without a single outbound internet call.
          </p>
        </div>

        {/* 6 Stack Cards Grid (Exactly 3 Cards Per Row: 3 x 2) */}
        <div 
          className="stack-cards-grid"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', 
            gap: '1.25rem' 
          }}
        >
          {stackItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '14px', padding: '1.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon />
                  </div>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, background: item.tagBg, color: item.tagColor, padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.03em' }}>
                    {item.tag}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>{item.title}</div>
                  <div style={{ fontSize: '0.74rem', color: '#991B1B', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px' }}>{item.tech}</div>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.6, margin: 0, marginTop: 'auto' }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
