import React from 'react';
import { ArrowUpRight, Shield, Lock, Activity, EyeOff, Scale, TrendingUp, Zap } from 'lucide-react';

interface HeroSectionProps {
  onOpenConsole?: () => void;
  onOpenScenarioStudio?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenConsole, onOpenScenarioStudio }) => {
  return (
    <section className="landing-section landing-hero-section bg-canvas">
      <div className="landing-content-wrap">
        
        {/* Status Pill Badge */}
        <div className="landing-pill">
          <span className="landing-dot"></span>
          <span>NCIIPC Supervisory Analytics Framework · Air-Gapped Enclave</span>
        </div>

        {/* High-Impact Headline */}
        <h1 className="landing-h1">
          Every SOC alert &amp; case record, audited for true cyber resilience
        </h1>
        
        {/* Context & Value Proposition */}
        <p className="landing-lead">
          <span 
            className="highlight-badge-red"
            style={{ 
              backgroundColor: '#991B1B', 
              color: '#FFFFFF',
              padding: '2px 6px', 
              borderRadius: '0.25rem', 
              textDecoration: 'underline', 
              textUnderlineOffset: '4px', 
              textDecorationColor: '#FFFFFF', 
              textDecorationThickness: '2px', 
              fontWeight: 600,
              display: 'inline',
              boxDecorationBreak: 'clone',
              WebkitBoxDecorationBreak: 'clone'
            }}
          >
            SAT-SA (Supervisory Analytics Tool for SOC Assessment)
          </span>{' '}
          assists NCIIPC examiners in evaluating periodic security submissions across{' '}
          <span className="ocsf-tooltip-wrapper">
            <span 
              className="highlight-badge-dark"
              style={{ 
                backgroundColor: '#0F172A', 
                color: '#FFFFFF',
                padding: '2px 6px', 
                borderRadius: '0.25rem', 
                border: '1px solid #1E293B',
                textDecoration: 'underline', 
                textUnderlineOffset: '4px', 
                textDecorationColor: '#FFFFFF', 
                textDecorationThickness: '2px', 
                fontWeight: 600,
                display: 'inline',
                boxDecorationBreak: 'clone',
                WebkitBoxDecorationBreak: 'clone'
              }}
            >
              Critical Sector Entities (CSEs)
            </span>

            {/* Hover Tooltip */}
            <span className="ocsf-tooltip-box">
              <span style={{ display: 'block', fontWeight: 700, fontSize: '0.78rem', color: '#0F172A', marginBottom: '4px' }}>
                Critical Sector Entities (CSEs)
              </span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#475569' }}>
                Regulated national infrastructure organizations across Power Grids, Banking &amp; Financial Services, Telecommunications, Strategic Defense Enclaves, Transport, and Health.
              </span>
              <span className="ocsf-tooltip-arrow"></span>
            </span>
          </span>{' '}
          to detect hidden execution gaps, rubber-stamped closures, and unmonitored negative-space blindspots —{' '}
          <span 
            className="highlight-badge-red"
            style={{ 
              backgroundColor: '#991B1B', 
              color: '#FFFFFF',
              padding: '2px 6px', 
              borderRadius: '0.25rem', 
              textDecoration: 'underline', 
              textUnderlineOffset: '4px', 
              textDecorationColor: '#FFFFFF', 
              textDecorationThickness: '2px', 
              fontWeight: 600,
              display: 'inline',
              boxDecorationBreak: 'clone',
              WebkitBoxDecorationBreak: 'clone'
            }}
          >
            100% air-gapped, zero cloud dependencies
          </span>
          .
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '3.5rem' }}>
          <button
            onClick={onOpenConsole}
            style={{
              padding: '0.875rem 1.75rem',
              backgroundColor: '#991B1B',
              color: '#FFFFFF',
              fontWeight: 700,
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(153, 27, 27, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            Launch Supervisory Console
            <ArrowUpRight size={16} />
          </button>

          {onOpenScenarioStudio && (
            <button
              onClick={onOpenScenarioStudio}
              style={{
                padding: '0.875rem 1.5rem',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                fontWeight: 700,
                borderRadius: '0.5rem',
                border: '1px solid #1E293B',
                fontSize: '0.875rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(15, 23, 42, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <Zap size={16} color="#EF4444" />
              "What-If" Scenario Studio
            </button>
          )}

          <a
            href="#architecture"
            style={{
              padding: '0.875rem 1.5rem',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              fontWeight: 600,
              borderRadius: '0.5rem',
              border: '1px solid #CBD5E1',
              textDecoration: 'none',
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            Inspect Architecture &amp; Methodology
          </a>
        </div>

        {/* 4 Proof Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Monitored Entities</span>
              <Shield size={18} color="#991B1B" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>5 Sectors</div>
            <div style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 600, marginTop: '2px' }}>Energy, BFSI, Telco, Defense, Health</div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Air-Gap Security</span>
              <Lock size={18} color="#991B1B" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>100% Offline</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>Zero cloud or remote model calls</div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Examiner Lift</span>
              <TrendingUp size={18} color="#991B1B" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#991B1B' }}>3.42× Gain</div>
            <div style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 600, marginTop: '2px' }}>vs Random manual review sampling</div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Supervisory Detectors</span>
              <Scale size={18} color="#D97706" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>10 Rules</div>
            <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600, marginTop: '2px' }}>Execution gaps &amp; negative space</div>
          </div>
        </div>

      </div>
    </section>
  );
};
