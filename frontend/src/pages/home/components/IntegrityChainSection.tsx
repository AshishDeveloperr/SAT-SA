import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Lock, ArrowRight, Database, Check, Cpu, Link2, KeyRound } from 'lucide-react';

interface AuditEntry {
  id: number;
  actor_id: string;
  action: string;
  object_type: string;
  object_id?: string;
  details_json?: string;
  prev_hash: string;
  hash: string;
  created_at?: string;
}

export const IntegrityChainSection: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [totalEntries, setTotalEntries] = useState<number>(3);
  const [blocks, setBlocks] = useState<AuditEntry[]>([]);
  const [lastVerifiedAt, setLastVerifiedAt] = useState<string>('Just now');
  const [tamperTriggered, setTamperTriggered] = useState<boolean>(false);

  const fallbackBlocks: AuditEntry[] = [
    {
      id: 1,
      actor_id: 'system_bootstrap',
      action: 'SYSTEM_BOOTSTRAP',
      object_type: 'SYSTEM',
      object_id: 'INIT',
      details_json: JSON.stringify({ version: '2.4.0-airgap', rule_registry_count: 10 }),
      prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      created_at: '2024-10-01 00:00:00'
    },
    {
      id: 2,
      actor_id: 'universal_parser',
      action: 'INGESTION_BATCH_COMMITTED',
      object_type: 'PAYLOAD_BATCH',
      object_id: 'BATCH-2024-10-01-01',
      details_json: JSON.stringify({ entity_code: 'CSE-ENERGY-01', format: 'CSV', alerts_count: 342 }),
      prev_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      hash: '8f4c2198e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b',
      created_at: '2024-10-01 02:14:00'
    },
    {
      id: 3,
      actor_id: 'examiner_supervisor',
      action: 'EXAMINER_DECISION_RECORDED',
      object_type: 'REVIEW_SAMPLE',
      object_id: 'SAMPLE-99',
      details_json: JSON.stringify({ decision: 'DEFECT_CONFIRMED', defect_type: 'EG-01', fine_assessed: true }),
      prev_hash: '8f4c2198e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b',
      hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      created_at: '2024-10-01 02:45:00'
    }
  ];

  const fetchLiveAuditLogs = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/v1/audit-log');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setIsValid(json.data.isChainValid ?? true);
          setTotalEntries(json.data.totalEntries || json.data.logs?.length || 3);
          if (json.data.logs && json.data.logs.length > 0) {
            const sorted = [...json.data.logs].sort((a: AuditEntry, b: AuditEntry) => a.id - b.id);
            setBlocks(sorted.slice(-3));
          } else {
            setBlocks(fallbackBlocks);
          }
        }
      } else {
        setBlocks(fallbackBlocks);
      }
    } catch (e) {
      setBlocks(fallbackBlocks);
    } finally {
      setIsVerifying(false);
      setLastVerifiedAt(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchLiveAuditLogs();
  }, []);

  return (
    <section id="integrity" className="landing-section bg-canvas">
      <div className="landing-content-wrap">
        
        {/* Section Header */}
        <div style={{ maxWidth: '100%', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem', border: '1px solid #FECACA' }}>
            <Lock size={14} />
            <span>Section 65B BSA Cryptographic Evidence</span>
          </div>
          <h2 className="landing-h2" style={{ marginBottom: '0.75rem', whiteSpace: 'nowrap' }}>
            Cryptographic hash chaining &amp; tamper-proof audit
          </h2>
          <p className="landing-lead" style={{ maxWidth: '64rem', marginBottom: 0, lineHeight: 1.75, color: '#0F172A' }}>
            Every supervisory action, parameter modification, and examiner decision is cryptographically anchored in a{' '}
            <span className="highlight-badge-red">
              sequential SHA-256 hash chain
            </span>
            —guaranteeing{' '}
            <span className="highlight-badge-dark">
              zero-trust integrity
            </span>
            , complete{' '}
            <span className="highlight-badge-dark">
              chain of custody
            </span>
            , and{' '}
            <span className="highlight-badge-red">
              court-admissible forensic proof
            </span>
            .
          </p>
        </div>

        {/* ================= RED HIGHLIGHTED CARD: ZERO-TRUST SUPERVISORY OVERSIGHT ================= */}
        <div 
          style={{ 
            background: '#991B1B', 
            color: '#FFFFFF', 
            borderRadius: '16px', 
            padding: '1.75rem 2rem', 
            marginBottom: '1.75rem',
            boxShadow: '0 8px 24px -4px rgba(153, 27, 27, 0.35)',
            border: '1px solid #7F1D1D'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '6px', borderRadius: '8px' }}>
              <KeyRound size={20} color="#FFFFFF" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Zero-Trust Supervisory Oversight (Guarding the Guardians)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
            {/* The Problem */}
            <div style={{ background: '#FFFFFF', border: '1px solid #FECACA', borderRadius: '12px', padding: '1.1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#991B1B', background: '#FEE2E2', padding: '2px 8px', borderRadius: '4px', marginBottom: '0.5rem' }}>
                The Problem
              </div>
              <p style={{ fontSize: '0.84rem', color: '#1E293B', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                Even internal supervisory staff or database administrators (DBAs) with{' '}
                <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                  direct SQL access
                </span>{' '}
                could theoretically{' '}
                <strong style={{ color: '#DC2626' }}>delete or modify findings</strong> to favor certain entities.
              </p>
            </div>

            {/* The Solution */}
            <div style={{ background: '#FFFFFF', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '1.1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#15803D', background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px', marginBottom: '0.5rem' }}>
                The Solution
              </div>
              <p style={{ fontSize: '0.84rem', color: '#1E293B', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                Because every record is{' '}
                <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                  chained to the previous one
                </span>
                , modifying a single past record or timestamp{' '}
                <strong style={{ color: '#991B1B' }}>breaks every subsequent hash</strong> in the ledger. Any tampering is{' '}
                <span style={{ backgroundColor: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                  instantly detected
                </span>{' '}
                by SAT-SA's verification algorithm.
              </p>
            </div>
          </div>

          {/* Mathematical Formula Banner - Compact White Box */}
          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link2 size={15} color="#991B1B" />
                <span style={{ fontSize: '0.75rem', color: '#0F172A', fontWeight: 800 }}>Deterministic Chaining Formula:</span>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: '#0F172A', fontWeight: 800, background: '#F8FAFC', padding: '3px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                Hash<sub style={{ color: '#991B1B', fontWeight: 900 }}>n</sub> = SHA-256( Hash<sub style={{ color: '#991B1B', fontWeight: 900 }}>n-1</sub> + Event_Payload<sub style={{ color: '#991B1B', fontWeight: 900 }}>n</sub> )
              </div>
            </div>
          </div>
        </div>

        {/* ================= HOW HASH CHAINING IS CREATED & LINKED ================= */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sequential Cryptographic Blocks in SQLite WAL Ledger
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
              Every event block mathematically consumes the previous block's output digest
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                if (tamperTriggered) {
                  setTamperTriggered(false);
                } else {
                  setTamperTriggered(true);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: tamperTriggered ? '#DC2626' : '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(239,68,68,0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <AlertTriangle size={14} />
              <span>{tamperTriggered ? 'Restore Original Chain' : 'Simulate Tamper Attack on Log #2'}</span>
            </button>
          </div>
        </div>

        {/* ================= INTERACTIVE VISUAL HASH CHAIN FORMULA BLOCKS ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* BLOCK 1: Log #1 (Cisco Firewall / Ingestion) */}
          <div 
            style={{ 
              background: '#FFFFFF', 
              border: '1.5px solid #E2E8F0', 
              borderRadius: '14px', 
              padding: '1.25rem 1.5rem', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)' 
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#16A34A' }}></div>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Log #1</span>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>(Cisco Firewall Ingestion)</span>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0', padding: '3px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={13} strokeWidth={3} /> Sealed &amp; Intact
              </span>
            </div>

            {/* 3-Column Equation Formula */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1.5fr auto 1fr', alignItems: 'center', gap: '0.75rem' }}>
              
              {/* 1. PREVIOUS HASH */}
              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '10px 12px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  1. Previous Hash
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#0F172A', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                    GENESIS
                  </span>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', color: '#334155', fontWeight: 600 }}>
                    00000000...00
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '4px' }}>First event in pipeline</div>
              </div>

              {/* Plus Sign */}
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#94A3B8' }}>+</div>

              {/* 2. TELEMETRY PAYLOAD */}
              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '10px 12px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  2. Telemetry Payload
                </div>
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '6px 8px', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#0F172A', fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                  %ASA-4-106023: Deny tcp 198.51.100.24 -&gt; 10.0.1.50/22
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '4px' }}>Raw unparsed event data</div>
              </div>

              {/* Arrow */}
              <div style={{ color: '#991B1B', display: 'flex', alignItems: 'center' }}>
                <ArrowRight size={18} strokeWidth={2.5} />
              </div>

              {/* 3. SEALED HASH OUTPUT */}
              <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '10px', padding: '10px 12px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', marginBottom: '6px' }}>
                  3. Sealed Hash Output
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#16A34A', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                    HASH-A1
                  </span>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', color: '#15803D', fontWeight: 800 }}>
                    4e0a7f1b...1122
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#16A34A', marginTop: '4px' }}>Computed by SHA-256</div>
              </div>

            </div>
          </div>

          {/* Linking Downward Connector 1 -> 2 */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '3px 14px', borderRadius: '9999px', fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              <span>↓ Hash Output (HASH-A1) links directly as Previous Hash for Log #2</span>
            </div>
          </div>

          {/* BLOCK 2: Log #2 (Check Point CEF / Case Notes) - Tamperable */}
          <div 
            style={{ 
              background: '#FFFFFF', 
              border: tamperTriggered ? '2px solid #EF4444' : '1.5px solid #E2E8F0', 
              borderRadius: '14px', 
              padding: '1.25rem 1.5rem', 
              boxShadow: tamperTriggered ? '0 4px 16px rgba(239,68,68,0.15)' : '0 2px 10px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: tamperTriggered ? '#DC2626' : '#16A34A' }}></div>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Log #2</span>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>(Check Point CEF Triage)</span>
              </div>
              {tamperTriggered ? (
                <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', padding: '3px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={13} /> TAMPERED (Payload Modified)
                </span>
              ) : (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0', padding: '3px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={13} strokeWidth={3} /> Sealed &amp; Intact
                </span>
              )}
            </div>

            {/* 3-Column Equation Formula */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1.5fr auto 1fr', alignItems: 'center', gap: '0.75rem' }}>
              
              {/* 1. PREVIOUS HASH (Inherited from Log #1) */}
              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '10px 12px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  1. Previous Hash
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#16A34A', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                    HASH-A1
                  </span>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', color: '#334155', fontWeight: 600 }}>
                    4e0a7f1b...1122
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '4px' }}>Inherited from Log #1</div>
              </div>

              {/* Plus Sign */}
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#94A3B8' }}>+</div>

              {/* 2. TELEMETRY PAYLOAD */}
              <div style={{ background: tamperTriggered ? '#FEF2F2' : '#F8FAFC', border: tamperTriggered ? '1.5px solid #FCA5A5' : '1.5px solid #CBD5E1', borderRadius: '10px', padding: '10px 12px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: tamperTriggered ? '#DC2626' : '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  2. Telemetry Payload {tamperTriggered && '(MODIFIED)'}
                </div>
                <div style={{ background: '#FFFFFF', border: tamperTriggered ? '1px solid #EF4444' : '1px solid #E2E8F0', padding: '6px 8px', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: tamperTriggered ? '#DC2626' : '#0F172A', fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                  {tamperTriggered 
                    ? 'CEF:0|CheckPoint|SYN_FLOOD|src=1.1.1.1 (MODIFIED BY DBA)' 
                    : 'CEF:0|CheckPoint|SYN_FLOOD|src=203.0.113.19 dst=10.0.2.1'}
                </div>
                <div style={{ fontSize: '0.68rem', color: tamperTriggered ? '#DC2626' : '#94A3B8', marginTop: '4px' }}>
                  {tamperTriggered ? 'Attacker altered IP address in DB' : 'Raw unparsed event data'}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ color: tamperTriggered ? '#DC2626' : '#991B1B', display: 'flex', alignItems: 'center' }}>
                <ArrowRight size={18} strokeWidth={2.5} />
              </div>

              {/* 3. SEALED HASH OUTPUT */}
              <div style={{ background: tamperTriggered ? '#FEF2F2' : '#F0FDF4', border: tamperTriggered ? '1.5px solid #EF4444' : '1.5px solid #86EFAC', borderRadius: '10px', padding: '10px 12px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: tamperTriggered ? '#DC2626' : '#16A34A', textTransform: 'uppercase', marginBottom: '6px' }}>
                  3. Sealed Hash Output
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, background: tamperTriggered ? '#DC2626' : '#16A34A', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {tamperTriggered ? 'CORRUPT' : 'HASH-B2'}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', color: tamperTriggered ? '#DC2626' : '#15803D', fontWeight: 800 }}>
                    {tamperTriggered ? 'f99c01aa...BAD!' : '8d92f5a1...2019'}
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: tamperTriggered ? '#DC2626' : '#16A34A', marginTop: '4px' }}>
                  {tamperTriggered ? 'HASH MISMATCH BROKEN CHAIN' : 'Computed by SHA-256'}
                </div>
              </div>

            </div>
          </div>

          {/* Linking Downward Connector 2 -> 3 */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '3px 14px', borderRadius: '9999px', fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              <span>↓ Hash Output ({tamperTriggered ? 'CORRUPT' : 'HASH-B2'}) links directly as Previous Hash for Log #3</span>
            </div>
          </div>

        </div>

        {/* Section 65B Legal Admissibility Tag */}
        <div style={{ marginTop: '1.5rem', background: '#FFFFFF', border: '1px dashed #CBD5E1', borderRadius: '10px', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#475569' }}>
            <Database size={15} color="#0284C7" />
            <span>
              <strong style={{ color: '#0F172A' }}>Section 65B BSA Certificate Generation:</strong> SAT-SA SQLite WAL audit ledger generates cryptographic integrity certificates for regulatory inquiries and court defense.
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Check size={14} /> Immutable Storage
          </span>
        </div>

      </div>
    </section>
  );
};

export default IntegrityChainSection;

