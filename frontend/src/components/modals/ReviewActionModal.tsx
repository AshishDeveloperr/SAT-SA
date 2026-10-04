import React from 'react';
import { X, ShieldAlert, CheckCircle2, FileText, Check, Copy, AlertTriangle } from 'lucide-react';
import { ReviewSample } from '../../types/domain';

interface ReviewActionModalProps {
  modalState?: {
    sample: ReviewSample;
    decision: 'confirmed' | 'benign';
  } | null;
  reviewActionModal?: {
    sample: ReviewSample;
    decision: 'confirmed' | 'benign';
  } | null;
  comment?: string;
  reviewModalComment?: string;
  setReviewModalComment?: (comment: string) => void;
  onCommentChange?: (comment: string) => void;
  isSubmitting?: boolean;
  isSubmittingReview?: boolean;
  copiedLog?: boolean;
  copiedTerminalLog?: boolean;
  setCopiedTerminalLog?: (copied: boolean) => void;
  onCopyLog?: (text: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function ReviewActionModal({
  modalState: propModalState,
  reviewActionModal,
  comment = '',
  reviewModalComment,
  setReviewModalComment,
  onCommentChange,
  isSubmitting = false,
  isSubmittingReview = false,
  copiedLog = false,
  copiedTerminalLog,
  setCopiedTerminalLog,
  onCopyLog,
  onSubmit,
  onClose
}: ReviewActionModalProps) {
  const modalState = reviewActionModal || propModalState;
  if (!modalState) return null;

  const currentComment = reviewModalComment !== undefined ? reviewModalComment : comment;
  const submitting = isSubmittingReview || isSubmitting;
  const isCopied = copiedTerminalLog !== undefined ? copiedTerminalLog : copiedLog;

  const handleCommentChange = (val: string) => {
    if (setReviewModalComment) setReviewModalComment(val);
    if (onCommentChange) onCommentChange(val);
  };

  const handleCopy = (val: string) => {
    if (setCopiedTerminalLog) {
      navigator.clipboard.writeText(val);
      setCopiedTerminalLog(true);
      setTimeout(() => setCopiedTerminalLog(false), 2000);
    }
    if (onCopyLog) onCopyLog(val);
  };

  const { sample, decision } = modalState;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={() => !isSubmitting && onClose()}
    >
      <div 
        className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col text-slate-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`p-4 text-white flex items-center justify-between ${
          decision === 'confirmed' ? 'bg-[#991B1B]' : 'bg-slate-800'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center border border-white/20">
              {decision === 'confirmed' ? (
                <ShieldAlert className="w-4 h-4 text-white" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white">
                {decision === 'confirmed' ? 'Confirm Defect' : 'Mark as Safe'}
              </h3>
              <p className="text-[11px] text-white/80 font-medium">
                Supervisory Review Record: <span className="font-mono font-bold">{sample.record_id}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={() => !isSubmitting && onClose()}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Record Summary Box with Triage Timing Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Entity</span>
                <span className="font-mono font-bold text-slate-900 px-2 py-0.5 rounded bg-white border border-slate-200">
                  {sample.entity_code}
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                Score: {sample.priority_score || '92'}/100
              </span>
            </div>

            {/* 3-Pill Triage Forensic Timing & Severity Strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Severity</span>
                <span className="font-black font-mono text-red-600 text-xs">
                  {sample.alertDetails?.severity || 'CRITICAL'}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Triage Speed</span>
                <span className="font-black font-mono text-amber-600 text-xs">
                  &lt; 4m (Rubber-Stamp)
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">SOC Disposition</span>
                <span className="font-bold font-mono text-slate-700 text-xs truncate block">
                  {sample.alertDetails?.disposition || 'FALSE_POSITIVE'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Flagged Reasons</span>
              <span className="text-slate-800 text-[11px] font-medium leading-relaxed block mt-0.5">
                {sample.reasons?.join(', ') || 'High severity closure anomaly, Missing escalation trace'}
              </span>
            </div>
          </div>

          {/* Raw Forensic Log / Terminal View */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Raw Evidence Telemetry Stream</span>
              </span>
              <span className="text-[10px] text-slate-400">Verbatim Ingested Event</span>
            </div>
            
            {/* Terminal Window with 3 Dots & Copy Button */}
            <div className="bg-[#0B0F17] rounded-xl overflow-hidden border border-slate-800 shadow-md">
              <div className="bg-[#111827] px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block shadow-xs"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block shadow-xs"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block shadow-xs"></span>
                  <span className="text-[10px] font-mono text-slate-400 pl-2 truncate">audit-terminal ~ tail -f forensic_stream.log</span>
                </div>
                
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      const text = `${sample.rawLog || ''}\n${sample.rawCsv || ''}`;
                      onCopyLog(text);
                    }}
                    className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-200 border border-slate-700 transition cursor-pointer"
                    title="Copy raw logs to clipboard"
                  >
                    {copiedLog ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copy Log</span>
                      </>
                    )}
                  </button>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                    RFC 5424
                  </span>
                </div>
              </div>

              {/* Terminal Screen */}
              <div className="p-3 text-[11px] font-mono text-slate-200 leading-relaxed space-y-2 select-text overflow-x-auto bg-black">
                <div>
                  <span className="text-emerald-400 font-bold">$ syslog --stream --record={sample.record_id}</span>
                  <div className="text-emerald-300/90 break-all pl-2 border-l border-emerald-500/30 mt-0.5">
                    {sample.rawLog || 
                     `2026-10-01T08:15:00.120Z [CRITICAL] ${sample.entity_code} (${sample.record_id}): Fast critical triage anomaly | disposition=FALSE_POSITIVE closed_at=2026-10-01T08:18:22.000Z operator=analyst_sharma_01`}
                  </div>
                </div>
                <div>
                  <span className="text-cyan-400 font-bold">$ csvcut --columns=ID,Category,Severity,Created,Closed,Operator</span>
                  <div className="text-slate-300 break-all pl-2 border-l border-cyan-500/30 mt-0.5">
                    {sample.rawCsv || 
                     `${sample.record_id},"Fast Critical Triage Anomaly",CRITICAL,2026-10-01T08:15:00.120Z,2026-10-01T08:18:22.000Z,FALSE_POSITIVE,analyst_sharma_01,${sample.entity_code}-GW-01`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Violation Rule Citation */}
          <div className="bg-red-50/60 border border-red-200/80 rounded-xl px-3 py-2 text-[11px] text-red-900 flex items-center justify-between">
            <span className="flex items-center space-x-1.5 font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>Statutory Violation Citation:</span>
            </span>
            <span className="font-mono text-[10px] text-red-700 bg-red-100/80 px-2 py-0.5 rounded font-bold">
              NCIIPC Guidelines §7.4 • IT Act §70B
            </span>
          </div>

          {/* Justification Textarea */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Auditor Justification &amp; Notes</span>
              <span className="text-[10px] text-slate-400 font-normal">Stored in SHA-256 Ledger</span>
            </label>
            <textarea 
              value={currentComment}
              onChange={(e) => handleCommentChange(e.target.value)}
              rows={3}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 bg-slate-50/50 resize-none font-sans"
              placeholder="Enter examiner rationale or verification notes..."
            />
          </div>

          {/* Cryptographic notice */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl px-3 py-2 text-[10px] text-amber-800 flex items-center space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Submitting creates an immutable cryptographic audit record chained to previous reviews.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end space-x-2 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting || !currentComment.trim()}
            className={`px-4 py-1.5 text-xs font-bold text-white rounded-lg shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center space-x-1.5 ${
              decision === 'confirmed' 
                ? 'bg-[#991B1B] hover:bg-[#7F1D1D]' 
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {submitting ? (
              <span>Saving...</span>
            ) : (
              <>
                {decision === 'confirmed' ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{decision === 'confirmed' ? 'Confirm Defect' : 'Mark Safe'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
