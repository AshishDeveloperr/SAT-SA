import React, { useRef, useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const criticalRef = useRef<HTMLSpanElement>(null);
  const accessRef = useRef<HTMLSpanElement>(null);
  const analystRef = useRef<HTMLSpanElement>(null);

  const cardCriticalRef = useRef<HTMLDivElement>(null);
  const cardAccessRef = useRef<HTMLDivElement>(null);
  const cardAnalystRef = useRef<HTMLDivElement>(null);

  const [arrows, setArrows] = useState<{
    critical: { path: string; origin: { x: number; y: number } };
    access: { path: string; origin: { x: number; y: number } };
    analyst: { path: string; origin: { x: number; y: number } };
  } | null>(null);

  useEffect(() => {
    const calculateArrows = () => {
      if (!containerRef.current) return;
      const cRect = containerRef.current.getBoundingClientRect();

      let criticalData = null;
      let accessData = null;
      let analystData = null;

      // 1. Critical Token -> Top-Right Card
      if (criticalRef.current && cardCriticalRef.current) {
        const k = criticalRef.current.getBoundingClientRect();
        const card = cardCriticalRef.current.getBoundingClientRect();

        // Origin: top edge of the [CRITICAL] badge
        const startX = k.left + k.width / 2 - cRect.left;
        const startY = k.top - cRect.top;

        // Destination: bottom edge of the Top-Right card
        const endX = card.left + 60 - cRect.left;
        const endY = card.bottom - cRect.top;

        // Smooth curve heading up and to the right
        const cp1X = startX + 15;
        const cp1Y = startY - 45;
        const cp2X = endX - 40;
        const cp2Y = endY + 25;

        criticalData = {
          path: `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`,
          origin: { x: startX, y: startY }
        };
      }

      // 2. Unauthorized Remote Access -> Right Card
      if (accessRef.current && cardAccessRef.current) {
        const k = accessRef.current.getBoundingClientRect();
        const card = cardAccessRef.current.getBoundingClientRect();

        // Origin: right edge of the keyword
        const startX = k.right - cRect.left + 4;
        const startY = k.top + k.height / 2 - cRect.top;

        // Destination: left edge of the Right card
        const endX = card.left - cRect.left;
        const endY = card.top + card.height / 2 - cRect.top;

        // Smooth curve heading directly right
        const cp1X = startX + (endX - startX) * 0.45;
        const cp1Y = startY;
        const cp2X = startX + (endX - startX) * 0.75;
        const cp2Y = endY;

        accessData = {
          path: `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`,
          origin: { x: startX, y: startY }
        };
      }

      // 3. analyst_ANALYST_ -> Left Card
      if (analystRef.current && cardAnalystRef.current) {
        const k = analystRef.current.getBoundingClientRect();
        const card = cardAnalystRef.current.getBoundingClientRect();

        // Origin: left edge of operator / analyst keyword
        const startX = k.left - cRect.left - 4;
        const startY = k.top + k.height / 2 - cRect.top;

        // Destination: right edge of the Left card
        const endX = card.right - cRect.left;
        const endY = card.top + card.height / 2 - cRect.top;

        // Smooth curve heading left
        const cp1X = startX - Math.abs(startX - endX) * 0.35;
        const cp1Y = startY;
        const cp2X = endX + Math.abs(startX - endX) * 0.35;
        const cp2Y = endY;

        analystData = {
          path: `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`,
          origin: { x: startX, y: startY }
        };
      }

      if (criticalData && accessData && analystData) {
        setArrows({
          critical: criticalData,
          access: accessData,
          analyst: analystData
        });
      }
    };

    // Calculate immediately, after next frame, and on window resize
    calculateArrows();
    const rafId = requestAnimationFrame(calculateArrows);
    window.addEventListener('resize', calculateArrows);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', calculateArrows);
    };
  }, []);

  return (
    <section id="problem" className="landing-section" style={{ backgroundColor: '#991B1B', color: '#FFFFFF', borderBottom: '1px solid #7F1D1D' }}>
      <div className="landing-content-wrap">
        
        {/* Header */}
        <div style={{ maxWidth: '46rem', marginBottom: '2.5rem' }}>
          <h2 className="landing-h2" style={{ color: '#FFFFFF', marginBottom: '1rem' }}>
            The real-world problem
          </h2>
          <p className="landing-lead" style={{ color: '#FFFFFF', marginBottom: 0 }}>
            National supervisory assessments face{' '}
            <span 
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
              hundreds of thousands of alert records
            </span>
            . Conventional dashboards rely on{' '}
            <span 
              style={{ 
                backgroundColor: '#FFFFFF', 
                color: '#991B1B', 
                padding: '2px 6px', 
                borderRadius: '0.25rem', 
                border: '1px solid #F87171',
                textDecoration: 'underline', 
                textUnderlineOffset: '4px', 
                textDecorationColor: '#991B1B', 
                textDecorationThickness: '2px', 
                fontWeight: 700,
                display: 'inline',
                boxDecorationBreak: 'clone',
                WebkitBoxDecorationBreak: 'clone'
              }}
            >
              reported metrics that mislead
            </span>
            . An entity reporting{' '}
            <span 
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
              98% SLA compliance
            </span>{' '}
            may in reality be{' '}
            <span 
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
              rubber-stamping critical alerts in 3 minutes
            </span>{' '}
            without investigation.
          </p>
        </div>

        {/* Interactive Annotation Stage with Generous Width & Breathing Room */}
        <div 
          ref={containerRef}
          style={{ 
            position: 'relative', 
            maxWidth: '86rem', 
            margin: '0 auto', 
            width: '100%', 
            paddingTop: '4.5rem',
            paddingBottom: '2rem',
            paddingLeft: '1rem',
            paddingRight: '1rem'
          }}
        >
          
          {/* TOP-RIGHT CALLOUT CARD: Critical Alert Tier (3-line comfortable description) */}
          <div 
            ref={cardCriticalRef}
            className="hidden xl:flex"
            style={{
              position: 'absolute',
              top: '-48px',
              right: '160px',
              width: '295px',
              minHeight: '105px',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              boxShadow: '0 16px 32px -8px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.15)',
              border: '1.5px solid #CBD5E1',
              zIndex: 25,
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0F172A', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>[CRITICAL] Alert Tier</span>
              </div>
              <span style={{ fontSize: '0.64rem', padding: '2px 7px', background: '#FEE2E2', color: '#991B1B', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>Mandatory Audit</span>
            </div>
            <p style={{ fontSize: '0.73rem', color: '#475569', margin: 0, lineHeight: 1.45, whiteSpace: 'normal' }}>
              High-severity SCADA trigger requiring supervisory L2 sign-off under national standard.
            </p>
          </div>

          {/* LEFT CALLOUT CARD: Single-Analyst Closure (3-line comfortable description) */}
          <div 
            ref={cardAnalystRef}
            className="hidden xl:flex"
            style={{
              position: 'absolute',
              top: '40%',
              left: '-35px',
              transform: 'translateY(-50%)',
              width: '310px',
              minHeight: '105px',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              boxShadow: '0 16px 32px -8px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.15)',
              border: '1.5px solid #CBD5E1',
              zIndex: 25,
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>Single-Analyst Closure</span>
              </div>
              <span style={{ fontSize: '0.64rem', padding: '2px 7px', background: '#D1FAE5', color: '#065F46', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>Zero Oversight</span>
            </div>
            <p style={{ fontSize: '0.73rem', color: '#475569', margin: 0, lineHeight: 1.45, whiteSpace: 'normal' }}>
              Closed by solo operator without four-eyes peer verification or recorded forensic audit notes.
            </p>
          </div>

          {/* RIGHT CALLOUT CARD: SCADA Threat Signature (3-line comfortable description) */}
          <div 
            ref={cardAccessRef}
            className="hidden xl:flex"
            style={{
              position: 'absolute',
              top: '52%',
              right: '-35px',
              transform: 'translateY(-50%)',
              width: '325px',
              minHeight: '105px',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              boxShadow: '0 16px 32px -8px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.15)',
              border: '1.5px solid #CBD5E1',
              zIndex: 25,
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>SCADA Threat Signature</span>
              </div>
              <span style={{ fontSize: '0.64rem', padding: '2px 7px', background: '#DBEAFE', color: '#1E40AF', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>Telemetry Alert</span>
            </div>
            <p style={{ fontSize: '0.73rem', color: '#475569', margin: 0, lineHeight: 1.45, whiteSpace: 'normal' }}>
              Malicious command injection detected on power transmission controller telemetry stream.
            </p>
          </div>

          {/* SVG Pointer Arrows Layer - Originating strictly from keywords, pointing to cards */}
          <svg 
            className="hidden xl:block"
            style={{ 
              position: 'absolute', 
              inset: 0, 
              width: '100%', 
              height: '100%', 
              pointerEvents: 'none', 
              zIndex: 20 
            }}
          >
            <defs>
              {/* Arrowheads pointing at the destination cards */}
              <marker id="marker-slate" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
                <polygon points="0 0, 9 4.5, 0 9" fill="#0F172A" />
              </marker>
              <marker id="marker-blue" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
                <polygon points="0 0, 9 4.5, 0 9" fill="#2563EB" />
              </marker>
              <marker id="marker-green" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
                <polygon points="0 0, 9 4.5, 0 9" fill="#10B981" />
              </marker>
            </defs>

            {arrows && (
              <>
                {/* 1. Critical Token -> Top-Right Card */}
                {/* Origin Dot on [CRITICAL] */}
                <circle cx={arrows.critical.origin.x} cy={arrows.critical.origin.y} r="4" fill="#0F172A" />
                <path 
                  d={arrows.critical.path} 
                  fill="none" 
                  stroke="#0F172A" 
                  strokeWidth="2.5" 
                  strokeDasharray="5 3.5"
                  markerEnd="url(#marker-slate)" 
                />

                {/* 2. Unauthorized Remote Access -> Right Card */}
                {/* Origin Dot on keyword */}
                <circle cx={arrows.access.origin.x} cy={arrows.access.origin.y} r="4" fill="#2563EB" />
                <path 
                  d={arrows.access.path} 
                  fill="none" 
                  stroke="#2563EB" 
                  strokeWidth="2.5" 
                  strokeDasharray="5 3.5"
                  markerEnd="url(#marker-blue)" 
                />

                {/* 3. analyst_ANALYST_ -> Left Card (Bolder Green Arrow) */}
                {/* Origin Dot on keyword */}
                <circle cx={arrows.analyst.origin.x} cy={arrows.analyst.origin.y} r="4" fill="#10B981" />
                <path 
                  d={arrows.analyst.path} 
                  fill="none" 
                  stroke="#10B981" 
                  strokeWidth="2.5" 
                  strokeDasharray="5 3.5"
                  markerEnd="url(#marker-green)" 
                />
              </>
            )}
          </svg>

          {/* Centered Light-Mode Audit Terminal Window */}
          <div style={{ maxWidth: '38.5rem', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
            <div 
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.3), 0 10px 15px -5px rgba(0, 0, 0, 0.15)',
                border: '1px solid #E2E8F0',
                width: '100%'
              }}
            >
              {/* Terminal Window Header */}
              <div 
                style={{
                  padding: '0.75rem 1rem',
                  background: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                {/* 3 Dots & Terminal Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }}></span>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></span>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                  </div>
                  <span 
                    style={{ 
                      fontSize: '0.72rem', 
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      fontWeight: 600,
                      color: '#475569',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    audit-terminal ~ tail -f forensic_stream.log
                  </span>
                </div>

                {/* Standard Badge */}
                <span 
                  style={{ 
                    fontSize: '0.65rem',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontWeight: 700,
                    padding: '2px 7px',
                    backgroundColor: '#EDE9FE',
                    color: '#6D28D9',
                    borderRadius: '6px',
                    border: '1px solid #DDD6FE',
                    flexShrink: 0
                  }}
                >
                  RFC 5424
                </span>
              </div>

              {/* Terminal Light Screen with Dark Log Lines */}
              <div 
                style={{
                  padding: '1.1rem 1.25rem',
                  background: '#FFFFFF',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.76rem',
                  lineHeight: '1.65',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  overflowX: 'auto'
                }}
              >
                {/* Primary Command & Output */}
                <div>
                  <div style={{ color: '#047857', fontWeight: 800, marginBottom: '6px', fontSize: '0.8rem' }}>
                    <span>$ syslog</span>{' '}
                    <span style={{ color: '#0369A1', textDecoration: 'underline', textUnderlineOffset: '3px' }}>--stream</span>{' '}
                    <span style={{ color: '#0F172A' }}>--record=</span>
                    <span style={{ color: '#991B1B', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }}>alt_CSE-POWER-01_4</span>
                  </div>
                  <div style={{ borderLeft: '3px solid #94A3B8', paddingLeft: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ color: '#0F172A', fontWeight: 600, wordBreak: 'break-word' }}>
                      <span style={{ color: '#1E293B' }}>2026-10-01T02:14:10.120Z</span>{' '}
                      <span 
                        ref={criticalRef}
                        style={{ 
                          backgroundColor: '#991B1B', 
                          color: '#FFFFFF', 
                          fontWeight: 800, 
                          padding: '1px 6px', 
                          borderRadius: '4px', 
                          textDecoration: 'underline', 
                          textUnderlineOffset: '2px', 
                          textDecorationColor: '#FECACA',
                          display: 'inline-block'
                        }}
                      >
                        [CRITICAL]
                      </span>{' '}
                      <span style={{ color: '#1E3A8A', fontWeight: 800, textDecoration: 'underline', textUnderlineOffset: '3px' }}>CSE-POWER-01</span>{' '}
                      <span style={{ color: '#1E293B' }}>(ast_CSE-POWER-01_5):</span>{' '}
                      <span 
                        ref={accessRef}
                        style={{ 
                          backgroundColor: '#1D4ED8',
                          color: '#FFFFFF', 
                          fontWeight: 700, 
                          padding: '1px 6px',
                          borderRadius: '4px',
                          textDecoration: 'underline', 
                          textUnderlineOffset: '2px', 
                          textDecorationColor: '#BFDBFE',
                          display: 'inline-block'
                        }}
                      >
                        Unauthorized Remote Access
                      </span>{' '}
                      <span style={{ color: '#0F172A', fontWeight: 800 }}>|</span>{' '}
                      <span style={{ color: '#0F172A' }}>disposition=</span>
                      <span style={{ color: '#047857', fontWeight: 800, textDecoration: 'underline', textUnderlineOffset: '3px' }}>true_positive</span>{' '}
                      <span style={{ color: '#0F172A' }}>closed_at=</span>
                      <span style={{ color: '#B45309', fontWeight: 700 }}>2026-10-01T02:17:20.381Z</span>{' '}
                      <span style={{ color: '#0F172A' }}>operator=</span>
                      <span 
                        ref={analystRef}
                        style={{ 
                          backgroundColor: '#059669',
                          color: '#FFFFFF', 
                          fontWeight: 800, 
                          padding: '1px 6px',
                          borderRadius: '4px',
                          textDecoration: 'underline', 
                          textUnderlineOffset: '2px',
                          textDecorationColor: '#A7F3D0',
                          display: 'inline-block'
                        }}
                      >
                        analyst_ANALYST_
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub Command & Output */}
                <div>
                  <div style={{ color: '#0369A1', fontWeight: 800, marginBottom: '6px', fontSize: '0.8rem' }}>
                    <span>$ csvcut</span>{' '}
                    <span style={{ color: '#0F172A', textDecoration: 'underline', textUnderlineOffset: '3px' }}>--columns</span>
                    <span style={{ color: '#1E293B' }}>=ID,Category,Severity,Created,Closed,Operator</span>
                  </div>
                  <div style={{ borderLeft: '3px solid #94A3B8', paddingLeft: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ color: '#0F172A', fontWeight: 600, wordBreak: 'break-word' }}>
                      <span style={{ color: '#991B1B', fontWeight: 800, textDecoration: 'underline', textUnderlineOffset: '3px' }}>alt_CSE-POWER-01_4</span>
                      <span style={{ color: '#0F172A', fontWeight: 800 }}>, </span>
                      <span style={{ 
                        backgroundColor: '#1D4ED8', 
                        color: '#FFFFFF', 
                        fontWeight: 700, 
                        padding: '1px 6px', 
                        borderRadius: '4px',
                        textDecoration: 'underline', 
                        textUnderlineOffset: '2px', 
                        textDecorationColor: '#BFDBFE',
                        display: 'inline-block'
                      }}>
                        "Unauthorized Remote Access"
                      </span>
                      <span style={{ color: '#0F172A', fontWeight: 800 }}>, </span>
                      <span style={{ color: '#B91C1C', fontWeight: 800, textDecoration: 'underline', textUnderlineOffset: '3px' }}>CRITICAL</span>
                      <span style={{ color: '#1E293B', fontWeight: 600 }}>, 02:14:10Z, 02:17:20Z, </span>
                      <span style={{ 
                        backgroundColor: '#059669', 
                        color: '#FFFFFF', 
                        fontWeight: 800, 
                        padding: '1px 6px', 
                        borderRadius: '4px',
                        textDecoration: 'underline', 
                        textUnderlineOffset: '2px', 
                        textDecorationColor: '#A7F3D0',
                        display: 'inline-block'
                      }}>
                        analyst_ANALYST_
                      </span>
                      <span style={{ color: '#1E293B' }}>, ast_CSE-POWER-01_5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer with Highlight Warning */}
              <div 
                style={{
                  padding: '0.75rem 1.15rem',
                  background: '#FEF2F2',
                  borderTop: '1px solid #FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertTriangle size={15} color="#DC2626" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#991B1B' }}>
                  Headline 98% SLA hides 3-minute zero-step triage
                </span>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Fallback Cards (Visible on screens < xl, cleanly stacked below terminal) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 xl:hidden">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-900 block">[CRITICAL] Alert Tier</span>
              <span className="text-[11px] text-slate-600">High-severity SCADA trigger requiring supervisory L2 sign-off under national standard.</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-blue-700 block">SCADA Threat Signature</span>
              <span className="text-[11px] text-slate-600">Malicious command injection on power transmission controller telemetry.</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-emerald-700 block">Single-Analyst Closure</span>
              <span className="text-[11px] text-slate-600">Closed by solo operator without four-eyes peer verification or notes.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ProblemSection;
