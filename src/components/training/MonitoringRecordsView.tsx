import React, { useState } from 'react';
import {
  Eye,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Clock,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ShopfloorMonitoringRecord } from '../../types/training';
import { LogMonitoringModal } from './LogMonitoringModal';

export const MonitoringRecordsView: React.FC = () => {
  const {
    shopfloorMonitoringRecords,
    users,
    machines,
    shifts,
    triggerHaptic,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showLogModal, setShowLogModal] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  const filteredRecords = shopfloorMonitoringRecords.filter((r) => {
    if (selectedMachine !== 'all' && r.machineId !== selectedMachine && r.machineCode !== selectedMachine) return false;
    if (selectedType !== 'all' && r.monitoringType !== selectedType) return false;
    if (
      searchQuery &&
      !r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.machineCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.supervisorName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const toggleExpand = (id: string) => {
    triggerHaptic();
    setExpandedRecordId(expandedRecordId === id ? null : id);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              Shopfloor Monitoring & Live Observation Records
            </h2>
            <p className="text-xs text-slate-400">
              Shift-wise supervisor audits for safety interlocks, SOP compliance, quality checks & 5S adherence
            </p>
          </div>

          <button
            onClick={() => {
              triggerHaptic();
              setShowLogModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            <Plus className="w-4 h-4" /> Log Shift Monitoring
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search operator, machine, supervisor..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Machines</option>
            {machines.map((m) => (
              <option key={m.id} value={m.code}>
                {m.code} ({m.name})
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Audit Types</option>
            <option value="Routine">Routine Shift Audit</option>
            <option value="Random Spot-Check">Random Spot-Check</option>
            <option value="Quality Audit">Quality Audit</option>
            <option value="Post-Incident">Post-Incident Check</option>
          </select>
        </div>
      </div>

      {/* Monitoring Records Feed */}
      <div className="space-y-3">
        {filteredRecords.map((r) => {
          const isExpanded = expandedRecordId === r.id;

          return (
            <div
              key={r.id}
              className="bg-slate-850 rounded-2xl border border-slate-800 p-4 sm:p-5 hover:border-slate-700 transition-all shadow-lg space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-base">{r.employeeName}</span>
                    <span className="font-mono text-xs text-slate-400">({r.employeeCode})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 font-mono">
                      {r.machineCode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {r.monitoringType || 'Shopfloor Audit'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Audited on <strong className="text-slate-300">{r.monitoringDate || r.date}</strong> by{' '}
                    <span className="text-amber-400 font-medium">{r.supervisorName}</span>
                  </p>
                </div>

                {/* Score badge & expand trigger */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <span
                      className={`text-xl font-black ${
                        r.monitoringScorePct >= 85
                          ? 'text-emerald-400'
                          : r.monitoringScorePct >= 70
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {r.monitoringScorePct}%
                    </span>
                    <span
                      className={`block text-[10px] font-bold uppercase tracking-wider ${
                        r.scoreStatus === 'Satisfactory' || r.scoreStatus === 'EXCELLENT' || r.scoreStatus === 'GOOD'
                          ? 'text-emerald-400'
                          : r.scoreStatus === 'Needs Improvement' || r.scoreStatus === 'NEEDS IMPROVEMENT'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {r.scoreStatus}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleExpand(r.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remarks Summary */}
              {r.closureRemarks && (
                <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 italic">
                  &ldquo;{r.closureRemarks}&rdquo;
                </p>
              )}

              {/* Retraining Notification Banner if applicable */}
              {r.retrainingRecommended && (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>CAPA Action:</strong> Retraining triggered & assigned for{' '}
                    <strong>{r.retrainingTrainingName || 'Process SOP'}</strong>
                  </span>
                </div>
              )}

              {/* Expanded Checkpoints List */}
              {isExpanded && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Detailed Checkpoint Results
                  </h4>
                  <div className="space-y-1.5">
                    {(r.items || r.checkpoints || []).map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg border text-xs flex items-start justify-between gap-2 ${
                          item.status === 'Critical Issue'
                            ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                            : item.status === 'Deviation'
                            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                            : 'bg-slate-900/40 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div>
                          <span className="font-bold mr-1.5 text-slate-400">[{item.category}]</span>
                          <span>{item.checkpoint || item.label}</span>
                          {item.remarks && (
                            <p className="text-[11px] text-amber-300 mt-0.5 italic">Note: {item.remarks}</p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            item.status === 'OK'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : item.status === 'Deviation'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showLogModal && <LogMonitoringModal onClose={() => setShowLogModal(false)} />}
    </div>
  );
};
