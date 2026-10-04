import React from 'react';
import { X, Terminal, AlertTriangle, ArrowRight } from 'lucide-react';

interface RuleDetailModalProps {
  rule?: any;
  selectedRuleDetail?: any;
  onClose: () => void;
  onInspectEvidence: (ruleKey: string) => void;
}

export function RuleDetailModal({
  rule: propRule,
  selectedRuleDetail,
  onClose,
  onInspectEvidence
}: RuleDetailModalProps) {
  const rule = propRule || selectedRuleDetail;
  if (!rule) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#991B1B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-black bg-white/20 text-white px-2.5 py-1 rounded-lg">
              {rule.key}
            </span>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {rule.name}
              </h3>
              <span className="text-[11px] text-red-100 font-mono">
                Resilience Dimension: {rule.dimension_code}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Live Status Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Live Enforcement Status
              </span>
              <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center space-x-2">
                {rule.violationCount > 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                    <span className="text-red-700">{rule.violationCount} Active Incidents Detected</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-emerald-700">0 Violations (Clean Baseline)</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Statutory Framework
              </span>
              <span className="text-xs font-mono font-bold text-slate-800">
                NCIIPC §7.4 / NIST 800-61
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
              Regulatory Objective & Description
            </h4>
            <p className="text-slate-700 leading-relaxed text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              {rule.description}
            </p>
          </div>

          {/* Algorithmic Formulation & Formal Logic (Mac Terminal Style) */}
          <div className="bg-[#0B0F17] text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-md">
            {/* Terminal Titlebar with Mac 3 Dots on the Left */}
            <div className="bg-[#111827] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block shadow-2xs"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block shadow-2xs"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block shadow-2xs"></span>
                <span className="text-[10px] font-mono font-bold text-slate-400 pl-2 uppercase tracking-wider flex items-center space-x-1.5">
                  <Terminal className="w-3 h-3 text-cyan-400" />
                  <span>Algorithmic Formulation</span>
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[10px] tracking-wider uppercase font-semibold">
                Deterministic Evaluation
              </span>
            </div>

            {/* Terminal Body */}
            <div className="p-4 space-y-2.5">
              <div className="font-mono text-xs font-bold text-amber-300 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800/80 overflow-x-auto whitespace-nowrap shadow-inner">
                {rule.algo?.formula}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                {rule.algo?.logic}
              </p>
            </div>
          </div>

          {/* Supervisory Rationale */}
          <div className="bg-amber-50/80 border-l-4 border-l-amber-500 border border-amber-200/70 p-3.5 rounded-r-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-1.5 font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Supervisory Examination Rationale</span>
            </span>
            <p className="text-amber-950 font-medium leading-relaxed text-xs">
              {rule.rationale}
            </p>
          </div>

          {/* Calibrated Policy Thresholds */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Active Calibrated Threshold Parameters
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(rule.default_params || {}).map(([k, v]) => (
                <div key={k} className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-mono block">{k}</span>
                  <span className="font-mono font-bold text-slate-900 text-xs block mt-0.5">
                    {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Affected Entities */}
          {rule.affectedEntities?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                Entities Flagged Under This Policy ({rule.affectedEntities.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {rule.affectedEntities.map((code: string) => (
                  <span
                    key={code}
                    className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-red-50 text-red-700 border border-red-200/80"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between rounded-b-3xl">
          <span className="text-[11px] text-slate-500 font-medium">
            National Cyber Resilience Matrix — Rule ID: <strong className="font-mono text-slate-700">{rule.id}</strong>
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Close
            </button>
            {rule.violationCount > 0 && (
              <button
                onClick={() => onInspectEvidence(rule.key)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
              >
                <span>Inspect {rule.violationCount} Evidence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
