import React, { useState } from 'react';
import { Layers, Shield, Eye, AlertOctagon, CheckCircle2, Lock, ArrowRight, Activity } from 'lucide-react';

interface SankeyNode {
  id: string;
  label: string;
  sublabel: string;
  category: 'input' | 'normalize' | 'engine' | 'scoring' | 'governance';
  col: number;
  row: number;
  totalVolume: string;
  color: string;
  details: string;
}

interface SankeyLink {
  source: string;
  target: string;
  volume: string;
  pct: string;
  formula?: string;
}

const NODES: SankeyNode[] = [
  // Col 0: Submissions
  { id: 'sub_json', label: 'Periodic JSON', sublabel: 'CSE Periodic Submission', category: 'input', col: 0, row: 0, totalVolume: '14,200', color: '#991B1B', details: 'Structured batch submissions containing periodic alert and case logs.' },
  { id: 'sub_csv', label: 'Batch CSV Export', sublabel: 'SIEM / Case Management', category: 'input', col: 0, row: 1, totalVolume: '8,450', color: '#B91C1C', details: 'Bulk CSV alert extracts from critical sector SOC platforms.' },
  { id: 'sub_enclave', label: 'Air-Gap Ingest', sublabel: 'Physical Media Enclave', category: 'input', col: 0, row: 2, totalVolume: '3,100', color: '#7F1D1D', details: 'Forensic drive images transferred across air-gapped security diode.' },

  // Col 1: Normalizer & Privacy
  { id: 'norm_chunk', label: 'Stream Parser', sublabel: 'Schema Validation', category: 'normalize', col: 1, row: 0.5, totalVolume: '25,750', color: '#991B1B', details: 'Memory-bounded chunk parser validating alert schemas without heap bloat.' },
  { id: 'norm_privacy', label: 'SHA-256 Masking', sublabel: 'Analyst Pseudonymization', category: 'normalize', col: 1, row: 1.8, totalVolume: '25,750', color: '#DC2626', details: 'Preserves forensic integrity while irreversibly masking analyst PII for supervisor safety.' },

  // Col 2: Dual Supervisory Engines
  { id: 'eng_eg', label: 'Execution Gap (EG)', sublabel: 'EG-01 to EG-06 Detectors', category: 'engine', col: 2, row: 0.3, totalVolume: '1,840 Defects', color: '#DC2626', details: 'Detects metric gaming: rubber-stamped closures (<10m), unescalated criticals, zero-step tickets, SimHash copies, SLA bunching.' },
  { id: 'eng_ns', label: 'Negative Space (NS)', sublabel: 'NS-01 to NS-05 Detectors', category: 'engine', col: 2, row: 1.5, totalVolume: '12 Blindspots', color: '#991B1B', details: 'Detects absence of expected security signals: silent SCADA assets (>14d), missing threat categories, unfiled high-severity cases.' },
  { id: 'eng_baseline', label: 'Benign Routine', sublabel: 'Clean Control Telemetry', category: 'engine', col: 2, row: 2.6, totalVolume: '23,898 Clean', color: '#16A34A', details: 'Normal SOC operational telemetry confirmed consistent with sector peer baselines.' },

  // Col 3: Scoring & Triage
  { id: 'score_comp', label: 'Composite Attention', sublabel: 'Score (0–100 Index)', category: 'scoring', col: 3, row: 0.6, totalVolume: '8 Dimensions', color: '#991B1B', details: 'Multidimensional supervisory index across Detection, Triage, Escalation, IR, SecOps, Governance, Discipline, Resilience.' },
  { id: 'score_queue', label: 'Review Queue', sublabel: '85% Priority / 15% Exploration', category: 'scoring', col: 3, row: 1.9, totalVolume: '100% Audit Valid', color: '#B91C1C', details: 'Optimized sampling portfolio yielding 3.42× more defects than random sampling while remaining mathematically unbiased.' },

  // Col 4: Governance Sink
  { id: 'gov_ledger', label: 'Section 65B Ledger', sublabel: 'SHA-256 Decision Chain', category: 'governance', col: 4, row: 1.2, totalVolume: 'Court Admissible', color: '#7F1D1D', details: 'Tamper-evident cryptographic ledger guaranteeing court admissibility under Bharatiya Sakshya Adhiniyam.' }
];

const LINKS: SankeyLink[] = [
  { source: 'sub_json', target: 'norm_chunk', volume: '14,200', pct: '55%' },
  { source: 'sub_csv', target: 'norm_chunk', volume: '8,450', pct: '33%' },
  { source: 'sub_enclave', target: 'norm_chunk', volume: '3,100', pct: '12%' },
  { source: 'norm_chunk', target: 'norm_privacy', volume: '25,750', pct: '100%', formula: 'SHA-256(Analyst_ID || Salt)' },
  { source: 'norm_privacy', target: 'eng_eg', volume: '1,840', pct: '7.1%', formula: 'Triage < 10m || Escalation = 0' },
  { source: 'norm_privacy', target: 'eng_ns', volume: '12', pct: '0.05%', formula: 'Last_Seen > 14d || Prevalent_Cat = 0' },
  { source: 'norm_privacy', target: 'eng_baseline', volume: '23,898', pct: '92.8%' },
  { source: 'eng_eg', target: 'score_comp', volume: '1,840', pct: '99.3%', formula: '0.6·Max(Dim) + 0.4·Avg(Dim)' },
  { source: 'eng_ns', target: 'score_comp', volume: '12', pct: '100%', formula: 'Severe Blindspot Weighting' },
  { source: 'score_comp', target: 'score_queue', volume: 'Top 20%', pct: '3.42× Lift', formula: '85% Risk-Targeted + 15% Uniform Random' },
  { source: 'score_queue', target: 'gov_ledger', volume: 'All Sanctions', pct: '100%', formula: 'H_n = SHA-256(H_{n-1} || Decision)' }
];

export const SupervisorySankeyFlow: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<SankeyNode | null>(NODES[0]);

  // Coordinate geometry
  const colX = [30, 240, 470, 730, 970];
  const nodeW = 165;
  const nodeH = 56;

  const getNodePos = (node: SankeyNode) => {
    const x = colX[node.col];
    const y = 40 + node.row * 94;
    return { x, y };
  };

  const getPath = (source: SankeyNode, target: SankeyNode) => {
    const s = getNodePos(source);
    const t = getNodePos(target);
    const startX = s.x + nodeW;
    const startY = s.y + nodeH / 2;
    const endX = t.x;
    const endY = t.y + nodeH / 2;
    const c1X = startX + (endX - startX) * 0.5;
    const c2X = startX + (endX - startX) * 0.5;
    return `M ${startX} ${startY} C ${c1X} ${startY}, ${c2X} ${endY}, ${endX} ${endY}`;
  };

  const isLinkActive = (link: SankeyLink) => {
    if (!hoveredNode) return true;
    return link.source === hoveredNode || link.target === hoveredNode;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-100 rounded text-red-800">
              <Layers className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-slate-900 text-lg">Supervisory Telemetry & Anomaly Sankey Flow</h3>
            <span className="text-xs bg-red-50 text-red-800 px-2.5 py-0.5 rounded-full font-semibold border border-red-200">
              Air-Gapped Ingestion
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time SVG dataflow routing periodic CSE submissions through dual-engine supervisory analytics into court-admissible decision ledger.
          </p>
        </div>

        {/* Quick KPI pills */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <span className="text-slate-400 block text-[10px]">TOTAL INGESTED</span>
            <span className="font-bold text-slate-800">25,750 Alerts</span>
          </div>
          <div className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg text-red-900">
            <span className="text-red-600 block text-[10px]">DEFECT RECALL</span>
            <span className="font-bold">88.0% @ 20% Budget</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-900">
            <span className="text-emerald-600 block text-[10px]">SUPERVISORY LIFT</span>
            <span className="font-bold">3.42× Multiplier</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 1170 380"
          className="w-full min-w-[1020px] h-[380px] select-none"
        >
          <defs>
            <linearGradient id="flowGradRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#991B1B" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="flowGradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#16A34A" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Links (splines) */}
          {LINKS.map((link, idx) => {
            const sNode = NODES.find(n => n.id === link.source)!;
            const tNode = NODES.find(n => n.id === link.target)!;
            const active = isLinkActive(link);
            const isBenign = link.target === 'eng_baseline';

            return (
              <g key={`link-${idx}`} className="transition-opacity duration-300">
                <path
                  d={getPath(sNode, tNode)}
                  fill="none"
                  stroke={isBenign ? '#CBD5E1' : active && hoveredNode ? '#991B1B' : '#E2E8F0'}
                  strokeWidth={active && hoveredNode ? 5 : 2.5}
                  strokeDasharray={isBenign ? '4 4' : 'none'}
                  opacity={active ? 0.85 : 0.2}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map(node => {
            const pos = getNodePos(node);
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(node)}
              >
                {/* Node Box */}
                <rect
                  width={nodeW}
                  height={nodeH}
                  rx={8}
                  fill={isSelected ? '#FEF2F2' : '#FFFFFF'}
                  stroke={isSelected ? '#991B1B' : isHovered ? '#DC2626' : '#E2E8F0'}
                  strokeWidth={isSelected || isHovered ? 2 : 1}
                  className="transition-all duration-150"
                  filter={isSelected ? 'url(#glowEffect)' : undefined}
                />

                {/* Left Accent Bar */}
                <rect
                  width={4}
                  height={nodeH}
                  rx={2}
                  fill={node.color}
                />

                {/* Node Text */}
                <text
                  x={12}
                  y={19}
                  className="text-[11px] font-bold fill-slate-900"
                >
                  {node.label}
                </text>
                <text
                  x={12}
                  y={34}
                  className="text-[9.5px] fill-slate-500 font-medium"
                >
                  {node.sublabel}
                </text>
                <text
                  x={12}
                  y={48}
                  className="text-[9px] font-mono font-bold"
                  fill={node.color}
                >
                  {node.totalVolume}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Detail Inspector for Selected Node */}
      {selectedNode && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: selectedNode.color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{selectedNode.label}</span>
                <span className="text-xs text-slate-500">({selectedNode.sublabel})</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                  {selectedNode.category}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                {selectedNode.details}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0 text-xs">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">THROUGHPUT VOLUME</span>
              <span className="font-mono font-bold text-slate-900">{selectedNode.totalVolume}</span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-slate-400 hover:text-slate-700 p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorySankeyFlow;
