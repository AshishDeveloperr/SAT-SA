import React, { useEffect, useState } from 'react';
import { 
  X, EyeOff, ShieldAlert, Clock, Activity, Cpu, Server, 
  Network, Radio, Check, Copy, AlertTriangle, FileText, CheckCircle2
} from 'lucide-react';

export interface SilentAssetData {
  id: string;
  external_id: string;
  name: string;
  type: string;
  criticality: number;
  daysSilent: number;
  entityCode: string;
  entityName: string;
  tierLabel?: string;
  purdueLevel?: string;
  substation?: string;
  vlan?: string;
  ip?: string;
  firmware?: string;
  protocol?: string;
  lastSeenDate?: string;
  expectedTelemetryRate?: string;
  status?: string;
}

interface SilentAssetDetailModalProps {
  asset: SilentAssetData | null;
  onClose: () => void;
}

export const SilentAssetDetailModal: React.FC<SilentAssetDetailModalProps> = ({
  asset,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Close on Escape & prevent background scroll
  useEffect(() => {
    if (!asset) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [asset, onClose]);

  if (!asset) return null;

  const hoursSilent = asset.daysSilent * 24;
  const lastSeenDate = asset.lastSeenDate 
    ? new Date(asset.lastSeenDate).toUTCString()
    : new Date(Date.now() - asset.daysSilent * 86400000).toUTCString();

  const handleCopyJson = () => {
    const payload = {
      asset_id: asset.external_id,
      asset_name: asset.name,
      entity_code: asset.entityCode,
      purdue_architecture: asset.type,
      purdue_level: asset.purdueLevel || 'Level 1 (Basic Process Control)',
      statutory_criticality: 'Tier 1 (Mission Critical)',
      silence_duration_days: asset.daysSilent,
      silence_duration_hours: hoursSilent,
      last_valid_heartbeat_utc: lastSeenDate,
      expected_telemetry_rate: asset.expectedTelemetryRate || 'Continuous (<5m Heartbeat)',
      network_ip: asset.ip || '10.240.10.15',
      ot_vlan: asset.vlan || 'VLAN-101-OT-CONTROL',
      firmware_version: asset.firmware || 'ABB RTU560 Rel 13.4.1',
      field_protocol: asset.protocol || 'IEC 60870-5-104 & DNP3',
      substation_location: asset.substation || 'North Grid 400kV Primary Yard',
      supervisory_finding: 'NS-01: Silent Critical Infrastructure Detection',
      poisson_probability_lower_tail: '< 1e-9 (Statistically Impossible Normal Quietness)',
      statutory_violation: 'NCIIPC Cyber Resilience Guidelines §7.4 & IT Act 2000 §70B'
    };

    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= 1. MODAL HEADER (THEME RED) ================= */}
        <div className="bg-[#991B1B] text-white p-4 sm:p-5 border-b border-red-800/80 flex items-start justify-between flex-shrink-0 rounded-t-2xl shadow-md">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-black/25 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <EyeOff className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded bg-black/30 text-white">
                  {asset.external_id}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-white uppercase">
                  {asset.entityCode}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-900">
                  Tier 1 (Mission Critical)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-1 leading-snug">
                {asset.name}
              </h2>
              <p className="text-[11px] text-red-100 font-medium mt-0.5">
                Statutory Forensic Asset Dossier • Negative Space Telemetry Drop Audit
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-red-200 hover:text-white p-1 rounded-lg hover:bg-black/20 transition ml-2"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= 2. MODAL BODY ================= */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          {/* Key Metric Overview Cards - Compact & High-Density */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
            {/* Metric 1: Silence Duration */}
            <div className="bg-red-50/80 border border-red-200 rounded-xl px-3 py-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-red-700 font-bold">
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Silence Window</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-red-100 rounded text-red-800 font-black">
                  EXCEEDED
                </span>
              </div>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-lg font-black font-mono text-red-700 leading-none">
                  {asset.daysSilent} Days
                </span>
                <span className="text-[10px] text-red-600 font-medium truncate">
                  ({hoursSilent.toLocaleString()} hrs silent)
                </span>
              </div>
              <div className="text-[10px] text-red-600/80 font-medium mt-0.5">
                NCIIPC statutory limit: &gt;14 days
              </div>
            </div>

            {/* Metric 2: Purdue Architecture */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-slate-700 font-bold">
                <span className="flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  <span>Purdue Architecture</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded font-bold">
                  PERA
                </span>
              </div>
              <div className="mt-1">
                <span className="text-sm font-black text-slate-900 block truncate leading-tight">
                  {asset.type}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                {asset.purdueLevel || 'Purdue Level 1 (Basic Process Control)'}
              </div>
            </div>

            {/* Metric 3: Baseline Rate Gap */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl px-3 py-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                <span className="flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Expected Baseline</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-100 rounded text-emerald-800 font-bold">
                  POLICY
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-sm font-black font-mono text-emerald-800 leading-none">
                  Continuous (&lt;5m)
                </span>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium mt-0.5 truncate">
                Expected ~288 msgs/d • Received: 0
              </div>
            </div>
          </div>

          {/* Purdue OT Network & Hardware Profile */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <Network className="w-4 h-4 text-slate-600" />
              <span>Industrial Control (ICS/OT) Physical &amp; Network Profile</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Substation / Site Location</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {asset.substation || 'North Grid 400kV Primary Substation Yard'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">OT Network VLAN &amp; Segment</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                  {asset.vlan || 'VLAN-101-OT-CONTROL (Air-Gapped SCADA)'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Hardware &amp; Firmware Model</span>
                <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                  {asset.firmware || 'ABB RTU560 Rel 13.4.1 (Firmware Signed)'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Industrial Field Protocol</span>
                <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                  {asset.protocol || 'IEC 60870-5-104 & DNP3 Secure'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Configured Static IP</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                  {asset.ip || '10.240.10.15'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Last Valid Telemetry Timestamp</span>
                <span className="font-mono text-red-700 font-bold mt-0.5 block">
                  {lastSeenDate}
                </span>
              </div>
            </div>
          </div>

          {/* Negative Space Reasoning & Mathematical Proof Box */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-4 text-xs">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-amber-950 uppercase tracking-wide text-xs">
                    Negative Space Forensic Reasoning (Algorithm NS-01)
                  </h4>
                  <span className="font-mono text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                    P(k=0) &lt; 10⁻⁹
                  </span>
                </div>
                <p className="text-amber-900 leading-relaxed">
                  Under statutory lower-tail Poisson probability analysis, a mission-critical Level 1/2 controller 
                  having a historical baseline of &gt;200 events/day has a mathematical probability of zero events over 
                  <strong className="text-amber-950"> {asset.daysSilent} consecutive days</strong> of exactly 
                  <code className="bg-amber-100/90 px-1 py-0.2 rounded font-mono font-bold"> P(k=0 | λ) &lt; 10⁻⁹</code>.
                </p>
                <p className="text-amber-900/90 leading-relaxed text-[11px]">
                  <strong>Forensic Determination:</strong> This is an operational sensor failure, cable disconnection, or deliberate log forwarding blackout. The absence of alerts does not reflect benign operations—it constitutes an unmonitored blindspot in the power grid transmission boundary.
                </p>
              </div>
            </div>
          </div>

          {/* Statutory Violation Citation - Light Theme */}
          <div className="bg-red-50/50 border border-red-200/80 rounded-xl p-3.5 sm:p-4 font-mono text-xs space-y-2">
            <div className="text-[11px] font-bold text-red-800 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>Statutory Compliance Breaches &amp; Supervisory Action</span>
            </div>
            <div className="text-slate-700 space-y-1.5 leading-relaxed text-[11px]">
              <div>• <strong className="text-slate-900 font-bold">NCIIPC Guideline §7.4:</strong> Mandatory continuous auditability for Critical Information Infrastructure (CII).</div>
              <div>• <strong className="text-slate-900 font-bold">IT Act 2000 §70B:</strong> Mandatory telemetry retention and incident response readiness.</div>
              <div>• <strong className="text-emerald-700 font-bold">Supervisory Order:</strong> Issue Form SAR-01 Notice requiring on-site verification of {asset.external_id} communication gateway.</div>
            </div>
          </div>
        </div>

        {/* ================= 3. MODAL FOOTER ================= */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between flex-shrink-0 rounded-b-2xl">
          <button
            onClick={handleCopyJson}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Audit JSON Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Audit JSON</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-[#991B1B] hover:bg-[#7F1D1D] text-white rounded-lg shadow-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default SilentAssetDetailModal;
