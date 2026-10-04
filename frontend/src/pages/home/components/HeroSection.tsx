import React from 'react';
import { ArrowUpRight, LayoutDashboard } from 'lucide-react';

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

        {/* Action buttons (Exactly two: Dashboard & GitHub) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '3.5rem' }}>
          {/* 1. Dashboard Button */}
          <button
            onClick={onOpenConsole}
            style={{
              padding: '0.65rem 1.6rem',
              backgroundColor: '#991B1B',
              color: '#FFFFFF',
              fontWeight: 700,
              borderRadius: '9999px',
              border: 'none',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(153, 27, 27, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
            <ArrowUpRight size={16} />
          </button>

          {/* 2. GitHub Button */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.65rem 1.5rem',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              fontWeight: 700,
              borderRadius: '9999px',
              border: '1px solid #1E293B',
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            {/* GitHub Octocat SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </section>
  );
};
