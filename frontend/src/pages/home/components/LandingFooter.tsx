import React from 'react';
import { Shield, Lock } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer style={{ background: '#0B0F19', color: '#94A3B8', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '3.5rem 1.5rem 2.5rem' }}>
      <div style={{ maxWidth: '76.8rem', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(153,27,27,0.15)', border: '1px solid rgba(153,27,27,0.4)', padding: '8px', borderRadius: '8px', color: '#EF4444' }}>
            <Shield size={20} />
          </div>
          <div>
            <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1rem' }}>
              SAT<span style={{ color: '#EF4444' }}>-SA</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              National Critical Information Infrastructure Protection Centre (NCIIPC)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#EF4444' }}>
            <Lock size={13} />
            Air-Gapped Sovereign Deployment
          </span>
          <span style={{ color: '#475569' }}>•</span>
          <span>Problem Statement SIH26157</span>
          <span style={{ color: '#475569' }}>•</span>
          <span>100% Offline Analytical Tool</span>
        </div>
      </div>
    </footer>
  );
};
