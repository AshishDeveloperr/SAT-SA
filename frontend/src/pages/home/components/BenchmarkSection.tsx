import React, { useState } from 'react';
import { 
  BarChart3, 
  Cpu, 
  Database, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Server, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  FileCheck2, 
  Scale, 
  Network, 
  ArrowUpRight, 
  Clock, 
  Lock,
  Boxes,
  HelpCircle
} from 'lucide-react';

interface BenchmarkMetric {
  title: string;
  value: string;
  unit: string;
  sub: string;
  badge: string;
  badgeType: 'critical' | 'success' | 'info' | 'purple';
}

interface SectorStressTest {
  id: string;
  name: string;
  category: string;
  volume: string;
  throughput: string;
  peakLatency: string;
  defectCaught: string;
  defectTag: string;
  defectDetail: string;
  severity: 'CRITICAL HIGH' | 'HIGH' | 'MEDIUM-HIGH' | 'MEDIUM' | 'LOW';
  theme: {
    rowBg: string;
    border: string;
    codeColor: string;
    dot: string;
    hoverBg: string;
  };
}

const BENCHMARK_METRICS: BenchmarkMetric[] = [
  {
    title: 'Multi-CSE Telemetry Volume',
    value: '535,500+',
    unit: 'Total Ingested Records',
    sub: 'Stress-tested across 5 heterogeneous critical infrastructure entities without memory leak.',
    badge: '500K+ STRESS-TESTED',
    badgeType: 'critical'
  },
  {
    title: 'Streaming Ingestion Velocity',
    value: '24,800',
    unit: 'Records / Second',
    sub: 'Chunked stream pipeline parsing CSV, RFC-5424, and JSON logs on single CPU core.',
    badge: 'SINGLE-CORE CPU',
    badgeType: 'info'
  },
  {
    title: 'Air-Gapped AI Copilot',
    value: '100%',
    unit: 'Offline Local Inference',
    sub: 'Qwen2.5:3B / Llama3.2:3B via local Ollama (localhost:11434). Zero external cloud API calls.',
    badge: 'ZERO CLOUD / AIR-GAPPED',
    badgeType: 'purple'
  },
  {
    title: 'Analytical Engine Latency',
    value: '< 118',
    unit: 'Milliseconds / 50K Logs',
    sub: 'Full evaluation across all 11 dual-discipline detectors (EG-01..06 & NS-01..05).',
    badge: 'SUB-SECOND DETERMINISM',
    badgeType: 'success'
  }
];

const SECTOR_TEST_TABLE: SectorStressTest[] = [
  {
    id: 'CSE-POWER-01',
    name: 'State Transmission Grid & Load Despatch',
    category: 'Power & SCADA Core',
    volume: '142,500 Alerts',
    throughput: '26,100 rec/s',
    peakLatency: '84 ms',
    defectCaught: 'NS-01 + EG-01',
    defectTag: 'SCADA SILENCE & RUSH CLOSURE',
    defectDetail: '3 Silent SCADA RTUs + 14 Fast Closes',
    severity: 'CRITICAL HIGH',
    theme: {
      rowBg: '#FFF1F2', // Deepest Red Tint
      border: '#FECDD3',
      codeColor: '#9F1239',
      dot: '#E11D48',
      hoverBg: '#FFE4E6'
    }
  },
  {
    id: 'CSE-BANK-01',
    name: 'National Financial Switch & Real-Time Payments',
    category: 'BFSI & Core Banking',
    volume: '186,200 Alerts',
    throughput: '25,400 rec/s',
    peakLatency: '96 ms',
    defectCaught: 'EG-06 + NS-02',
    defectTag: 'SLA GAMING & BLIND SPOTS',
    defectDetail: 'Pre-SLA Bunching + Missing MITRE Classes',
    severity: 'HIGH',
    theme: {
      rowBg: '#FFF5F5', // High Red Tint
      border: '#FED7D7',
      codeColor: '#C53030',
      dot: '#E53E3E',
      hoverBg: '#FED7D7'
    }
  },
  {
    id: 'CSE-TELCO-01',
    name: 'Tier-1 5G Backbone & Core Signaling',
    category: 'Telecommunications',
    volume: '98,400 Alerts',
    throughput: '23,800 rec/s',
    peakLatency: '68 ms',
    defectCaught: 'EG-03 + EG-04',
    defectTag: 'ZERO-STEP INVESTIGATIONS',
    defectDetail: '84 Zero-Step Closures + SimHash RCA Dupes',
    severity: 'MEDIUM-HIGH',
    theme: {
      rowBg: '#FEF2F2', // Medium-Red Tint
      border: '#FEE2E2',
      codeColor: '#B91C1C',
      dot: '#EF4444',
      hoverBg: '#FEE2E2'
    }
  },
  {
    id: 'CSE-DEF-01',
    name: 'Aerospace Satellite Operations & Telemetry',
    category: 'Defense & Strategic Space',
    volume: '46,100 Alerts',
    throughput: '24,200 rec/s',
    peakLatency: '42 ms',
    defectCaught: 'EG-02',
    defectTag: 'CRITICAL ESCALATION DEFICIT',
    defectDetail: 'Unescalated Criticals to CIRT',
    severity: 'MEDIUM',
    theme: {
      rowBg: '#FFF7ED', // Lighter Amber/Warm Tint
      border: '#FFEDD5',
      codeColor: '#C2410C',
      dot: '#F97316',
      hoverBg: '#FED7AA'
    }
  },
  {
    id: 'CSE-HEALTH-01',
    name: 'National Digital Health Registry & Gateway',
    category: 'Critical Healthcare',
    volume: '62,300 Alerts',
    throughput: '24,500 rec/s',
    peakLatency: '55 ms',
    defectCaught: 'NS-01',
    defectTag: 'DARK TELEMETRY EXPOSURE',
    defectDetail: 'Silent Patient DB Endpoint + 4.1% FPR',
    severity: 'LOW',
    theme: {
      rowBg: '#F8FAFC', // Subtle Neutral/Softest Tint
      border: '#E2E8F0',
      codeColor: '#334155',
      dot: '#64748B',
      hoverBg: '#F1F5F9'
    }
  }
];

export const BenchmarkSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sectors' | 'ai' | 'mandate'>('sectors');

  return (
    <section id="benchmarks" className="landing-section bg-subtle" style={{ borderTop: '1px solid #E2E8F0', padding: '4.5rem 0' }}>
      <div className="landing-content-wrap">
        
        {/* Section Header */}
        <div style={{ maxWidth: '64rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800, border: '1px solid #FECACA', letterSpacing: '0.04em' }}>
              <BarChart3 size={13} />
              NCIIPC BENCHMARK SPECIFICATION §4 &amp; §5
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', padding: '3px 10px', borderRadius: '9999px' }}>
              500K+ Production Telemetry Logs Tested
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#EDE9FE', color: '#6D28D9', border: '1px solid #DDD6FE', padding: '3px 10px', borderRadius: '9999px' }}>
              Air-Gapped Sovereign AI Ready
            </span>
          </div>

          <h2 className="landing-h2" style={{ marginBottom: '0.75rem', fontSize: '2.1rem' }}>
            Empirical scale &amp; performance benchmarks
          </h2>
          <p className="landing-lead" style={{ maxWidth: '100%', marginBottom: 0, fontSize: '0.96rem', lineHeight: 1.8, color: '#0F172A' }}>
            SAT-SA is benchmarked on{' '}
            <span className="highlight-badge-red">
              over 535,000 real-world and synthetic SOC alert records
            </span>{' '}
            across Power Grids, Core Banking, 5G Telecom, Defense Satellites, and Healthcare registries. Built strictly as a{' '}
            <span className="highlight-badge-dark">
              supervisory analytics engine
            </span>
            —not an operational SIEM or real-time monitor—it enables national examiners to{' '}
            <span className="highlight-badge-red">
              detect metric gaming
            </span>
            ,{' '}
            <span className="highlight-badge-dark">
              expose negative space
            </span>
            , and{' '}
            <span className="highlight-badge-red">
              synthesize statutory briefings at scale
            </span>
            .
          </p>
        </div>

        {/* 4 Top-Tier Benchmark Highlight Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.85rem', marginBottom: '2rem' }}>
          {BENCHMARK_METRICS.map((m, idx) => (
            <div 
              key={idx}
              style={{ 
                background: '#FFFFFF', 
                border: '1px solid #CBD5E1', 
                borderRadius: '14px', 
                padding: '1.1rem 1.25rem', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  height: '3.5px', 
                  background: m.badgeType === 'critical' ? '#991B1B' : m.badgeType === 'purple' ? '#7C3AED' : m.badgeType === 'success' ? '#16A34A' : '#0284C7' 
                }} 
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {m.title}
                </span>
                <span 
                  style={{ 
                    fontSize: '0.6rem', 
                    fontWeight: 800, 
                    padding: '1px 6px', 
                    borderRadius: '4px',
                    background: m.badgeType === 'critical' ? '#FEE2E2' : m.badgeType === 'purple' ? '#EDE9FE' : m.badgeType === 'success' ? '#DCFCE7' : '#E0F2FE',
                    color: m.badgeType === 'critical' ? '#991B1B' : m.badgeType === 'purple' ? '#6D28D9' : m.badgeType === 'success' ? '#166534' : '#0369A1',
                    border: '1px solid',
                    borderColor: m.badgeType === 'critical' ? '#FECACA' : m.badgeType === 'purple' ? '#DDD6FE' : m.badgeType === 'success' ? '#BBF7D0' : '#BAE6FD'
                  }}
                >
                  {m.badge}
                </span>
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0F172A', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.1 }}>
                {m.value}
              </div>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                {m.unit}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '4px', lineHeight: 1.4 }}>
                {m.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ================= NCIIPC SCOPE & MANDATE HIGHLIGHT CARD ================= */}
        <div 
          style={{ 
            background: '#FFFFFF', 
            border: '1.5px solid #CBD5E1', 
            borderRadius: '16px', 
            padding: '1.5rem', 
            marginBottom: '2rem',
            boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ maxWidth: '48rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#0F172A', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.04em' }}>
                  STATUTORY BOUNDARY
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Aligned Strictly with NCIIPC Problem Definition
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                The purpose of supervisory review is not to monitor individual alerts or replace CSE SOCs. Rather, alert and case records serve as <strong>operational evidence</strong> to assess whether critical entities maintain genuine cyber resilience across the 8 statutory capability dimensions.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '6px' }}>
                ✓ Zero Cloud / Air-Gapped
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '6px' }}>
                ✓ Supports Human Examiners
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', padding: '3px 8px', borderRadius: '6px' }}>
                ✗ Not a SIEM / Real-Time Monitor
              </span>
            </div>
          </div>

          {/* 3 Boundary Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            
            {/* Box 1: Core Problem */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem 1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                <Scale size={15} color="#991B1B" />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>
                  1. Dual-Discipline Defect Detection
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                Uncovers <strong>Execution Gaps</strong> (fast closures &lt;10m, unescalated criticals, SimHash RCA duplication) and <strong>Negative Space</strong> (silent SCADA assets &gt;14d, missing expected threat classes).
              </p>
            </div>

            {/* Box 2: 8 Capabilities Assessed */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem 1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                <Layers size={15} color="#0284C7" />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>
                  2. 8 Statutory Resilience Dimensions
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                Evaluates (i) Threat Detection, (ii) Investigation, (iii) Escalation, (iv) Incident Response, (v) Security Operations, (vi) Governance, (vii) Operational Discipline, and (viii) Cyber Resilience.
              </p>
            </div>

            {/* Box 3: Out of Scope Guardrails */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem 1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
                <Lock size={15} color="#7C3AED" />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>
                  3. Strict Out-of-Scope Enforcement
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                Does not replace CSE SOCs, does not collect live network packets, and does not conduct continuous real-time monitoring. Operates exclusively on periodic metadata submissions.
              </p>
            </div>

          </div>
        </div>

        {/* ================= TABBED PERFORMANCE & AI SPECIFICATIONS ================= */}
        <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)' }}>
          
          {/* Tabs Top Bar */}
          <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '0.7rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="#0F172A" />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Benchmarked Specifications &amp; Architectural Capabilities
              </span>
            </div>

            <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', gap: '3px', border: '1px solid #E2E8F0' }}>
              <button
                onClick={() => setActiveTab('sectors')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'sectors' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'sectors' ? '#0F172A' : '#64748B',
                  boxShadow: activeTab === 'sectors' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Database size={13} />
                500K+ Multi-Sector Cohorts
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'ai' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'ai' ? '#0F172A' : '#64748B',
                  boxShadow: activeTab === 'ai' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Sparkles size={13} />
                Air-Gapped AI Copilot Spec
              </button>

              <button
                onClick={() => setActiveTab('mandate')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'mandate' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'mandate' ? '#0F172A' : '#64748B',
                  boxShadow: activeTab === 'mandate' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <FileCheck2 size={13} />
                Deliverables &amp; Invariants (§6 &amp; §7)
              </button>
            </div>
          </div>

          {/* TAB 1: 500K+ MULTI-SECTOR COHORT STRESS-TEST TABLE */}
          {activeTab === 'sectors' && (
            <div style={{ padding: '1.25rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px', textAlign: 'left', minWidth: '760px' }}>
                <thead>
                  <tr style={{ background: 'transparent' }}>
                    <th style={{ padding: '8px 14px', fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Entity Code</th>
                    <th style={{ padding: '8px 14px', fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sector Environment</th>
                    <th style={{ padding: '8px 14px', fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Alert Volume</th>
                    <th style={{ padding: '8px 14px', fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ingestion Rate</th>
                    <th style={{ padding: '8px 14px', fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Detect Latency</th>
                    <th style={{ padding: '8px 14px', fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Primary Defect & Root Cause Unmasked</th>
                  </tr>
                </thead>
                <tbody>
                  {SECTOR_TEST_TABLE.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        background: item.theme.rowBg,
                        border: `1px solid ${item.theme.border}`,
                        boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)',
                        borderRadius: '10px',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                    >
                      {/* Entity Code with indicator dot (No pill bg) */}
                      <td style={{ padding: '12px 14px', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderTop: `1px solid ${item.theme.border}`, borderBottom: `1px solid ${item.theme.border}`, borderLeft: `1px solid ${item.theme.border}` }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.theme.dot, flexShrink: 0 }}></span>
                          <span
                            style={{
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              color: item.theme.codeColor,
                              fontFamily: 'JetBrains Mono, monospace',
                              letterSpacing: '0.02em',
                            }}
                          >
                            {item.id}
                          </span>
                        </div>
                      </td>

                      {/* Sector name & category clean text (No pill bg) */}
                      <td style={{ padding: '12px 14px', borderTop: `1px solid ${item.theme.border}`, borderBottom: `1px solid ${item.theme.border}` }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>
                          {item.category}
                        </div>
                      </td>

                      {/* Volume (Clean monospace) */}
                      <td style={{ padding: '12px 14px', borderTop: `1px solid ${item.theme.border}`, borderBottom: `1px solid ${item.theme.border}` }}>
                        <span style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace', color: '#0F172A', fontWeight: 800 }}>
                          {item.volume}
                        </span>
                      </td>

                      {/* Ingestion Rate (Clean text) */}
                      <td style={{ padding: '12px 14px', borderTop: `1px solid ${item.theme.border}`, borderBottom: `1px solid ${item.theme.border}` }}>
                        <span style={{ fontSize: '0.76rem', fontFamily: 'JetBrains Mono, monospace', color: '#0F172A', fontWeight: 700 }}>
                          ⚡ {item.throughput}
                        </span>
                      </td>

                      {/* Detect Latency (Clean text) */}
                      <td style={{ padding: '12px 14px', borderTop: `1px solid ${item.theme.border}`, borderBottom: `1px solid ${item.theme.border}` }}>
                        <span style={{ fontSize: '0.76rem', fontFamily: 'JetBrains Mono, monospace', color: '#0F172A', fontWeight: 700 }}>
                          ⏱ {item.peakLatency}
                        </span>
                      </td>

                      {/* Primary Defect (Clean text without heavy nested pill bgs) */}
                      <td style={{ padding: '12px 14px', borderTopRightRadius: '10px', borderBottomRightRadius: '10px', borderTop: `1px solid ${item.theme.border}`, borderBottom: `1px solid ${item.theme.border}`, borderRight: `1px solid ${item.theme.border}` }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#991B1B', letterSpacing: '0.01em' }}>
                              🚨 {item.defectCaught}
                            </span>
                            <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#64748B' }}>
                              • {item.defectTag}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 600 }}>
                            {item.defectDetail}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span>Stress-tested using streaming chunked parsers (50MB+ cap). Memory footprint stable at <strong>~58 MB RAM</strong>.</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>Reproducible via CLI: <code>node backend/bin/satsa.js benchmark</code></span>
              </div>
            </div>
          )}

          {/* TAB 2: AIR-GAPPED AI COPILOT SPECIFICATIONS (§5 COMPLIANCE) */}
          {activeTab === 'ai' && (
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
                
                {/* AI Spec 1 */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>
                      (i) Local Model Architecture
                    </div>
                    <span style={{ fontSize: '0.64rem', fontWeight: 800, background: '#EDE9FE', color: '#6D28D9', padding: '1px 6px', borderRadius: '4px' }}>
                      QUANTIZED 3B
                    </span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                    Powered by local <strong>Qwen2.5:3B / Llama3.2:3B</strong> via native Ollama daemon binding on <code>localhost:11434</code>. Zero external cloud API calls, zero telemetry egress.
                  </p>
                  <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#0F172A', fontWeight: 700 }}>
                    Deterministic Heuristic Fallback: 100% operational continuity even if local LLM is uninstalled.
                  </div>
                </div>

                {/* AI Spec 2 */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>
                      (ii) Safety Invariant &amp; Governance
                    </div>
                    <span style={{ fontSize: '0.64rem', fontWeight: 800, background: '#FEE2E2', color: '#991B1B', padding: '1px 6px', borderRadius: '4px' }}>
                      STRICT SAFETY INVARIANT
                    </span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                    <strong>Safety Invariant:</strong> The AI Copilot is strictly generative for narrative synthesis and examiner briefings. It <em>never</em> recalculates, suppresses, or overrides mathematical risk scores.
                  </p>
                  <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#0F172A', fontWeight: 700 }}>
                    Auditable Outputs: Every brief cites verbatim raw alert IDs and Section 65B hash pointers.
                  </div>
                </div>

                {/* AI Spec 3 */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>
                      (iii) Hardware &amp; Sovereign Deploy
                    </div>
                    <span style={{ fontSize: '0.64rem', fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '1px 6px', borderRadius: '4px' }}>
                      STANDARD LAPTOP
                    </span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                    Runs locally on standard examiner laptops (16 GB RAM, CPU-only or integrated GPU). Does not require discrete A100/H100 clusters. Docker Compose isolated network profile.
                  </p>
                  <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#0F172A', fontWeight: 700 }}>
                    Statutory Output: Automates Form SAR-01 Supervisory Dossiers ready for regulatory review.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: DELIVERABLES & INVARIANTS (§6 & §7 COMPLIANCE) */}
          {activeTab === 'mandate' && (
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                    1. Functional Design &amp; Data Minimization
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                    Zero storage of raw PCAPs or sensitive consumer data. Only alert metadata, case timelines, and salted pseudonymized hashes (<code>assignee_hash</code>) are processed.
                  </p>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                    2. Explainability &amp; Traceability (§4.11-14)
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                    Every finding includes transparent "Why Flagged" rationale, parameter diffs, sector quartile benchmarks, and clickable links to raw submission records.
                  </p>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                    3. Dual-Store Court Admissibility (§6.viii)
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                    Verbatim raw evidence store anchored to a forward SHA-256 chained hash ledger under Section 63 &amp; 65B of Bharatiya Sakshya Adhiniyam (BSA) 2023.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default BenchmarkSection;
