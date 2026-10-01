import React from 'react';
import { Cpu, Database, Server, Code2, ShieldCheck, Box } from 'lucide-react';

export const StackSection: React.FC = () => {
  const stackItems = [
    {
      title: 'Backend API & Workers',
      tech: 'Node.js (ESM) · Express · Knex',
      desc: 'Single-runtime JavaScript with streaming CSV/JSON parsers, strict Zod boundary validation, and zero cloud calls.',
      icon: Server,
      color: '#991B1B'
    },
    {
      title: 'Supervisory Presentation',
      tech: 'React 18 · TypeScript · Tailwind CSS',
      desc: 'Sovereign light canvas with high-readability typography, interactive gap inspectors, and zero external script tags.',
      icon: Code2,
      color: '#2563EB'
    },
    {
      title: 'Enterprise Fact Storage',
      tech: 'PostgreSQL 16 · Monthly Partitioning',
      desc: 'Partitioned tables for alert and case facts, incremental daily rollups, and embedded SQLite for instant local dev.',
      icon: Database,
      color: '#7C3AED'
    },
    {
      title: 'Statistical & ML Analytics',
      tech: 'Robust MAD · SimHash · Isolation Forest',
      desc: 'Pure-JS algorithms for outlier detection and 64-bit lexical duplication without heavy GPU or Python runtime friction.',
      icon: Cpu,
      color: '#D97706'
    },
    {
      title: 'Cryptographic Audit Ledger',
      tech: 'SHA-256 Sequential Hash Chaining',
      desc: 'Tamper-evident audit trail linking supervisory review decisions to immutable mathematical block hashes.',
      icon: ShieldCheck,
      color: '#991B1B'
    },
    {
      title: 'Air-Gapped Containerization',
      tech: 'Docker Compose · Nginx Reverse Proxy',
      desc: 'Multi-stage container packaging with verified no-network profile for strictly isolated defense network deployment.',
      icon: Box,
      color: '#0F172A'
    }
  ];

  return (
    <section id="stack" className="landing-section bg-canvas">
      <div className="landing-content-wrap">
        
        {/* Section Header */}
        <div style={{ maxWidth: '44rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem', border: '1px solid #FECACA' }}>
            <Cpu size={14} />
            <span>Sovereign Tech Stack</span>
          </div>
          <h2 className="landing-h2" style={{ marginBottom: '0.75rem' }}>
            Built for air-gapped sovereign resilience
          </h2>
          <p className="landing-lead" style={{ marginBottom: 0 }}>
            Every component is audited to guarantee zero external dependency leaks, maximum horizontal throughput, and long-term maintainability.
          </p>
        </div>

        {/* 6 Stack Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {stackItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '8px', borderRadius: '8px' }}>
                    <Icon size={18} color={item.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{item.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#991B1B', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{item.tech}</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
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
