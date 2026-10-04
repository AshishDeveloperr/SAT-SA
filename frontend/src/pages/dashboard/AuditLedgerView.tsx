import React, { useState, useMemo } from 'react';
import { 
  Lock, CheckCircle2, Scale, Building2, AlertTriangle, Search, Copy 
} from 'lucide-react';
import { AuditLog } from '../../types/domain';

interface AuditLedgerViewProps {
  auditLogs: AuditLog[];
  isAuditValid: boolean;
  auditActionFilter: string;
  setAuditActionFilter: (filter: string) => void;
  auditSearchQuery: string;
  setAuditSearchQuery: (query: string) => void;
  auditCurrentPage: number;
  setAuditCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  auditPageSize: number;
  setSelectedAuditRecord: (record: AuditLog) => void;
}

export const AuditLedgerView: React.FC<AuditLedgerViewProps> = ({
  auditLogs,
  isAuditValid,
  auditActionFilter,
  setAuditActionFilter,
  auditSearchQuery,
  setAuditSearchQuery,
  auditCurrentPage,
  setAuditCurrentPage,
  auditPageSize,
  setSelectedAuditRecord
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const auditStats = useMemo(() => {
    const totalEntries = auditLogs.length;
    const ingestionBatches = auditLogs.filter(l => l.action?.toLowerCase().includes('ingest')).length;
    const examinerDecisions = auditLogs.filter(l => l.action?.toLowerCase().includes('review') || l.action?.toLowerCase().includes('decision')).length;
    const sanctionsIssued = auditLogs.filter(l => l.action?.toLowerCase().includes('sanction')).length;
    const uniqueActors = new Set(auditLogs.map(l => l.actor_id)).size;
    const latestHash = auditLogs[0]?.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

    return {
      totalEntries,
      ingestionBatches,
      examinerDecisions,
      sanctionsIssued,
      uniqueActors,
      latestHash
    };
  }, [auditLogs]);

  const auditActionTypes = useMemo(() => {
    return Array.from(new Set(auditLogs.map(l => l.action))).filter(Boolean).sort();
  }, [auditLogs]);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (auditActionFilter !== 'ALL' && log.action !== auditActionFilter) {
        return false;
      }
      if (auditSearchQuery.trim()) {
        const q = auditSearchQuery.toLowerCase().trim();
        const matches = 
          String(log.id).includes(q) ||
          log.action?.toLowerCase().includes(q) ||
          log.actor_id?.toLowerCase().includes(q) ||
          log.object_id?.toLowerCase().includes(q) ||
          log.hash?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [auditLogs, auditActionFilter, auditSearchQuery]);

  const totalAuditPages = Math.max(1, Math.ceil(filteredAuditLogs.length / auditPageSize));
  const paginatedAuditLogs = useMemo(() => {
    const start = (auditCurrentPage - 1) * auditPageSize;
    return filteredAuditLogs.slice(start, start + auditPageSize);
  }, [filteredAuditLogs, auditCurrentPage, auditPageSize]);

  return (
    <div className="space-y-4">
      {/* 4 Summary Metric Cards (Executive & Compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Metric 1: Total Immutable Ledger Entries */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Ledger Entries
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-slate-900 font-mono">
                  {auditStats.totalEntries} Blocks
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  SHA-256 Chained
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0 ml-2">
            Non-Repudiable
          </span>
        </div>

        {/* Metric 2: Cryptographic Hash Integrity */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className={`w-7 h-7 rounded-lg ${isAuditValid ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'} flex items-center justify-center shrink-0`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Ledger Integrity
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className={`text-sm font-black font-mono ${isAuditValid ? 'text-emerald-700' : 'text-red-700'}`}>
                  {isAuditValid ? '100% Intact' : 'Chain Broken'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  SHA-256 Validated
                </span>
              </div>
            </div>
          </div>
          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${isAuditValid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-red-50 text-red-700 border border-red-200/60'} shrink-0 ml-2`}>
            Air-Gapped
          </span>
        </div>

        {/* Metric 3: Supervisory Examiner Judgments */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Logged Actions
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-blue-700 font-mono">
                  {auditStats.examinerDecisions + auditStats.sanctionsIssued} Decided
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  {auditStats.sanctionsIssued} Sanctions
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0 ml-2">
            Section 70B
          </span>
        </div>

        {/* Metric 4: Verified Independent Actors */}
        <div className="bg-white border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-slate-300 transition">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">
                Active Actors
              </span>
              <div className="flex items-baseline space-x-1.5 leading-tight mt-0.5 truncate">
                <span className="text-sm font-black text-purple-700 font-mono">
                  {auditStats.uniqueActors} Principals
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  RBAC Audited
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60 shrink-0 ml-2">
            Cert-Bound
          </span>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
        {/* Ledger Header Bar (Light Mode) */}
        <div className="bg-slate-50/70 border-b border-[#E2E8F0] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 tracking-wider">
                NCIIPC §7.2
              </span>
              <h3 className="text-sm font-bold tracking-tight text-[#0F172A]">
                Statutory SHA-256 Audit Ledger &amp; Integrity Chain
              </h3>
            </div>
            <p className="text-[11px] text-[#64748B] font-mono truncate max-w-xl">
              Latest Block Hash: <span className="text-amber-700 font-semibold">{auditStats.latestHash}</span>
            </p>
          </div>

          {/* Action Filter & Search */}
          <div className="flex items-center space-x-2 font-sans">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearchQuery}
                onChange={(e) => {
                  setAuditSearchQuery(e.target.value);
                  setAuditCurrentPage(1);
                }}
                placeholder="Search action, actor, hash..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-48 sm:w-64 transition"
              />
            </div>

            <select
              value={auditActionFilter}
              onChange={(e) => {
                setAuditActionFilter(e.target.value);
                setAuditCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer hover:border-slate-300 transition"
            >
              <option value="ALL">All Actions</option>
              {auditActionTypes.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-16">Block #</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Actor / Authority</th>
                <th className="py-2.5 px-3">Target Entity / Object</th>
                <th className="py-2.5 px-3">Cryptographic SHA-256 Hash</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAuditLogs.map((log) => (
                <tr 
                  key={log.id} 
                  onClick={() => setSelectedAuditRecord(log)}
                  className="hover:bg-slate-50/80 cursor-pointer transition group"
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    #{log.id}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-800 px-2 py-0.5 rounded bg-slate-100 text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">
                    {log.actor_id}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-bold">
                    {log.object_id}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] text-slate-500 font-mono truncate max-w-[200px]" title={log.hash}>
                        {log.hash ? `${log.hash.slice(0, 10)}...${log.hash.slice(-8)}` : 'N/A'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (log.hash) handleCopyHash(log.hash);
                        }}
                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition"
                        title="Copy SHA-256 Digest"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {copiedHash === log.hash && (
                        <span className="text-[9px] text-emerald-600 font-bold">Copied</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAuditRecord(log);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#991B1B] bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-lg transition shadow-2xs"
                    >
                      Docket
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedAuditLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans text-xs">
                    No ledger records found matching the active filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        {totalAuditPages > 1 && (
          <div className="bg-slate-50/70 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs font-sans">
            <span className="text-slate-500">
              Showing <strong>{((auditCurrentPage - 1) * auditPageSize) + 1}</strong> to <strong>{Math.min(auditCurrentPage * auditPageSize, filteredAuditLogs.length)}</strong> of <strong>{filteredAuditLogs.length}</strong> blocks
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setAuditCurrentPage(p => Math.max(1, p - 1))}
                disabled={auditCurrentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              >
                Prev
              </button>
              <span className="px-2 font-mono font-bold text-slate-700 text-[11px]">
                {auditCurrentPage} / {totalAuditPages}
              </span>
              <button
                onClick={() => setAuditCurrentPage(p => Math.min(totalAuditPages, p + 1))}
                disabled={auditCurrentPage === totalAuditPages}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
