import React, { useState } from 'react';
import { Database, Search, ShieldCheck, UserCheck, Clock, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <Database className="w-5 h-5 text-blue-400" />
            Audit Logs & Activity Ledger
          </h1>
          <p className="text-xs text-slate-400">Tamper-evident log of all shopfloor entries, edits and sign-offs</p>
        </div>

        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-200">
          {auditLogs.length} Events
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Filter audit logs by action, user or details..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Log Events List */}
      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 text-xs shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200">{log.action}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400 font-mono">
                  {log.module}
                </span>
              </div>

              <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">{log.description}</p>

            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
              <span>
                User: <strong className="text-slate-300">{log.userName}</strong> ({log.role})
              </span>
              <span>Entity ID: {log.entityId}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
