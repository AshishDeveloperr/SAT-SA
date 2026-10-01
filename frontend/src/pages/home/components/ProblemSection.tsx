import React, { useState } from 'react';
import { AlertTriangle, Copy, Check, Eye } from 'lucide-react';

interface ProblemCardData {
  id: string;
  category: string;
  dialect: string;
  friction: string;
  rawText: string;
  highlightedJsx: React.ReactNode;
}

const PROBLEM_CARDS: ProblemCardData[] = [
  {
    id: 'rubber_stamp',
    category: 'Execution Gap: Rubber-Stamping',
    dialect: 'Alert & Case Metadata',
    friction: 'Headline 98% SLA Compliance hides zero triage',
    rawText: '{"alert_id":"ALT-POWER-1042","severity":"CRITICAL","created":"02:14:10Z","acknowledged":"02:14:35Z","closed":"02:17:20Z","steps_count":0,"disposition":"false_positive","reason":"Auto-closed per queue"}',
    highlightedJsx: (
      <span>
        &#123;"alert_id": "ALT-POWER-1042", "severity": <span className="tok-act-deny">"CRITICAL"</span>, "created": "02:14:10Z", "acknowledged": "02:14:35Z", "closed": <span className="tok-ip">"02:17:20Z (3m 10s)"</span>, "steps_count": <span className="tok-act-drop">0</span>, "disposition": "false_positive"&#125;
      </span>
    )
  },
  {
    id: 'silent_scada',
    category: 'Negative Space: Silent SCADA Blindspot',
    dialect: 'Asset Telemetry Registry',
    friction: 'Zero alerts does not equal zero threats',
    rawText: '{"asset_id":"AST-POWER-01","type":"SCADA_CONTROLLER","criticality":5,"last_seen":"2026-08-20T10:00:00Z","days_silent":42,"active_alerts":0,"status":"UNMONITORED_BLACKOUT"}',
    highlightedJsx: (
      <span>
        &#123;"asset_id": "AST-POWER-01", "type": <span className="tok-proto">"SCADA_CONTROLLER"</span>, "criticality": <span className="tok-act-deny">5 (MAX)</span>, "days_silent": <span className="tok-act-drop">42 Days</span>, "active_alerts": 0, "status": <span className="tok-act-drop">"UNMONITORED_BLACKOUT"</span>&#125;
      </span>
    )
  },
  {
    id: 'unescalated',
    category: 'Execution Gap: Unescalated Critical',
    dialect: 'Incident Escalation Records',
    friction: 'Severe incident resolved locally without CIRT',
    rawText: '{"case_id":"CAS-HEALTH-2018","alert":"Ransomware Activity","severity":"CRITICAL","escalation_level":"NONE","assignee":"L1_Trainee","root_cause_recorded":false}',
    highlightedJsx: (
      <span>
        &#123;"case_id": "CAS-HEALTH-2018", "alert": <span className="tok-act-deny">"Ransomware Activity"</span>, "severity": <span className="tok-act-deny">"CRITICAL"</span>, "escalation_level": <span className="tok-act-drop">"NONE (L1 only)"</span>, "root_cause": <span className="tok-act-drop">false</span>&#125;
      </span>
    )
  }
];

export const ProblemSection: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTokens, setShowTokens] = useState<boolean>(false);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <section id="problem" className="landing-section bg-subtle">
      <div className="landing-content-wrap">
        
        {/* Header with Switch */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ maxWidth: '44rem' }}>
            <h2 className="landing-h2" style={{ marginBottom: '1rem' }}>
              The real-world problem
            </h2>
            <p className="landing-lead" style={{ marginBottom: 0 }}>
              National supervisory assessments face hundreds of thousands of alert records. Conventional dashboards rely on{' '}
              <span 
                style={{ 
                  backgroundColor: '#991B1B', 
                  color: '#FFFFFF',
                  padding: '2px 8px', 
                  borderRadius: '0.25rem', 
                  textDecoration: 'underline', 
                  textUnderlineOffset: '4px', 
                  textDecorationColor: '#FFFFFF', 
                  textDecorationThickness: '2px', 
                  fontWeight: 600,
                  display: 'inline-block'
                }}
              >
                reported metrics that mislead
              </span>
              . An entity reporting 98% SLA compliance may in reality be rubber-stamping critical alerts in 2 minutes without investigation.
            </p>
          </div>

          <button
            onClick={() => setShowTokens(!showTokens)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: showTokens ? '#0F172A' : '#FFFFFF',
              color: showTokens ? '#FFFFFF' : '#0F172A',
              border: '1px solid #CBD5E1',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <Eye size={14} />
            {showTokens ? 'Hide Forensic Highlights' : 'Highlight Forensic Weaknesses'}
          </button>
        </div>

        {/* 3 Interactive Problem Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
          {PROBLEM_CARDS.map((card) => (
            <div key={card.id} className="problem-card">
              <div className="problem-card-header">
                <span className="problem-vendor-tag">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#991B1B' }}></span>
                  {card.category}
                </span>
                <span className="problem-dialect-badge">
                  {card.dialect}
                </span>
              </div>

              <div className="problem-code-block">
                <code>
                  {showTokens ? card.highlightedJsx : card.rawText}
                </code>
              </div>

              <div className="problem-card-footer">
                <div className="problem-friction-pill">
                  <AlertTriangle size={13} color="#DC2626" />
                  <span>{card.friction}</span>
                </div>

                <button
                  onClick={() => handleCopy(card.id, card.rawText)}
                  className="problem-copy-btn"
                  title="Copy sample metadata"
                >
                  {copiedId === card.id ? <Check size={14} color="#991B1B" /> : <Copy size={14} color="#64748B" />}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
