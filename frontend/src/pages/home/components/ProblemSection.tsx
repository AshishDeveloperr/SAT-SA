import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface CodeLine {
  num: string;
  indent?: number;
  key?: string;
  value?: React.ReactNode;
  isClose?: boolean;
}

interface ProblemCardData {
  id: string;
  filename: string;
  friction: string;
  lines: CodeLine[];
}

const PROBLEM_CARDS: ProblemCardData[] = [
  {
    id: 'alert_triage',
    filename: 'alert_triage.json',
    friction: 'Headline 98% SLA hides 3-minute zero-step triage',
    lines: [
      { num: '01', isClose: true, value: '{' },
      { num: '02', indent: 1, key: '"alert_id"', value: <span style={{ color: '#059669' }}>"ALT-POWER-1042",</span> },
      { num: '03', indent: 1, key: '"severity"', value: <span style={{ color: '#DC2626', fontWeight: 600 }}>"CRITICAL",</span> },
      { num: '04', indent: 1, key: '"category"', value: <span style={{ color: '#059669' }}>"SCADA Modbus Injection",</span> },
      { num: '05', indent: 1, key: '"created_at"', value: <span style={{ color: '#059669' }}>"2024-10-01T02:14:10Z",</span> },
      { num: '06', indent: 1, key: '"closed_at"', value: <span style={{ color: '#D97706', fontWeight: 600 }}>"2024-10-01T02:17:20Z",</span> },
      { num: '07', indent: 1, key: '"steps_count"', value: <span style={{ color: '#7C3AED', fontWeight: 600 }}>0,</span> },
      { num: '08', indent: 1, key: '"disposition"', value: <span style={{ color: '#059669' }}>"false_positive",</span> },
      { num: '09', indent: 1, key: '"closure_reason"', value: <span style={{ color: '#059669' }}>"routine_maintenance"</span> },
      { num: '10', isClose: true, value: '}' }
    ]
  },
  {
    id: 'telemetry_health',
    filename: 'telemetry_health.json',
    friction: 'Tier-1 critical SCADA asset unmonitored for 42 days',
    lines: [
      { num: '01', isClose: true, value: '{' },
      { num: '02', indent: 1, key: '"asset_id"', value: <span style={{ color: '#059669' }}>"AST-POWER-01",</span> },
      { num: '03', indent: 1, key: '"asset_type"', value: <span style={{ color: '#059669' }}>"SCADA_CONTROLLER",</span> },
      { num: '04', indent: 1, key: '"criticality_tier"', value: <span style={{ color: '#7C3AED', fontWeight: 600 }}>1,</span> },
      { num: '05', indent: 1, key: '"last_telemetry_received"', value: <span style={{ color: '#059669' }}>"2024-08-20T00:00:00Z",</span> },
      { num: '06', indent: 1, key: '"endpoint"', value: <span>{'{'}</span> },
      { num: '07', indent: 2, key: '"ip"', value: <span style={{ color: '#059669' }}>"10.45.2.110",</span> },
      { num: '08', indent: 2, key: '"port"', value: <span style={{ color: '#7C3AED', fontWeight: 600 }}>502</span> },
      { num: '09', indent: 1, isClose: true, value: '}' },
      { num: '10', isClose: true, value: '}' }
    ]
  }
];

export const ProblemSection: React.FC = () => {
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

        {/* 2 Mac-Style Code Window Cards Matching the Reference Design */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
          {PROBLEM_CARDS.map((card) => (
            <div 
              key={card.id} 
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Window Header with 3 colored dots & filename */}
              <div 
                style={{
                  padding: '1rem 1.25rem 0.75rem 1.25rem',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                {/* 3 Mac Dots */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }}></span>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></span>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                </div>
                {/* Filename */}
                <span 
                  style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    color: '#0F172A', 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    marginLeft: '4px'
                  }}
                >
                  {card.filename}
                </span>
              </div>

              {/* Code Container with exact reference typography */}
              <div 
                style={{
                  padding: '0.5rem 1.5rem 1.5rem 1.5rem',
                  background: '#FFFFFF',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontSize: '0.875rem',
                  lineHeight: '1.8',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {card.lines.map((line, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Line Number */}
                    <span 
                      style={{ 
                        width: '36px', 
                        color: '#94A3B8', 
                        fontSize: '0.8rem', 
                        userSelect: 'none',
                        flexShrink: 0,
                        fontWeight: 400
                      }}
                    >
                      {line.num}
                    </span>
                    {/* Code Content */}
                    <div 
                      style={{ 
                        flex: 1, 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        color: '#0F172A',
                        paddingLeft: line.indent ? `${line.indent * 1.25}rem` : '0'
                      }}
                    >
                      {line.key && (
                        <span style={{ color: '#0284C7', fontWeight: 600, marginRight: '6px' }}>
                          {line.key}:
                        </span>
                      )}
                      {line.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer with Highlight Flag */}
              <div 
                style={{
                  padding: '0.75rem 1.25rem',
                  background: '#FEF2F2',
                  borderTop: '1px solid #FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <AlertTriangle size={14} color="#DC2626" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#991B1B' }}>
                  {card.friction}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ProblemSection;
