import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export const IntegrityChainSection: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(true);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerified(true);
    }, 800);
  };

  const sampleBlocks = [
    {
      id: 1,
      action: 'SYSTEM_BOOTSTRAP',
      actor: 'system',
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    {
      id: 2,
      action: 'INGESTION_COMMITTED',
      actor: 'batch_worker',
      prevHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      hash: '8f4c2198e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b'
    },
    {
      id: 3,
      action: 'EXAMINER_DECISION_RECORDED',
      actor: 'examiner_supervisor',
      prevHash: '8f4c2198e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b',
      hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0'
    }
  ];

  return (
    <section id="integrity" className="landing-section bg-canvas">
      <div className="landing-content-wrap">
        
        {/* Section Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ maxWidth: '44rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem', border: '1px solid #FECACA' }}>
              <Lock size={14} />
              <span>Section 65B BSA Cryptographic Evidence</span>
            </div>
            <h2 className="landing-h2" style={{ marginBottom: '0.75rem' }}>
              Cryptographic hash chaining &amp; tamper-proof audit
            </h2>
            <p className="landing-lead" style={{ marginBottom: 0 }}>
              Every supervisory action, parameter modification, and examiner review decision is cryptographically anchored in a sequential SHA-256 hash chain, guaranteeing court-admissible auditability.
            </p>
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: '#991B1B',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(153, 27, 27, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldCheck size={16} />
            {isVerifying ? 'Verifying Chain Integrity...' : 'Verify Cryptographic Integrity'}
          </button>
        </div>

        {/* Verification Status Banner */}
        <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} color="#991B1B" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
              Hash Chain Status: <span style={{ color: '#991B1B' }}>VERIFIED (Tamper-Free)</span>
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#64748B' }}>
            Algorithm: SHA-256 Chained
          </span>
        </div>

        {/* Chain Visualization */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {sampleBlocks.map((block, i) => (
            <div key={block.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991B1B', fontFamily: 'JetBrains Mono, monospace' }}>
                  BLOCK #{block.id}
                </span>
                <span style={{ fontSize: '0.7rem', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  {block.actor}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{block.action}</div>
              
              <div style={{ marginTop: '12px', background: '#0B0F17', padding: '8px 10px', borderRadius: '8px', fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace' }}>
                <div style={{ color: '#94A3B8' }}>prev: {block.prevHash.substring(0, 20)}...</div>
                <div style={{ color: '#F87171', fontWeight: 700, marginTop: '2px' }}>hash: {block.hash.substring(0, 20)}...</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
