import React, { useState } from 'react';
import {
  Zap,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CorrectiveTrainingRecord } from '../../types/training';

export const CorrectiveTrainingView: React.FC = () => {
  const {
    correctiveTrainingRecords,
    trainingMasters,
    updateCorrectiveTraining,
    triggerHaptic,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRecords = correctiveTrainingRecords.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (
      searchQuery &&
      !r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.requiredTrainingTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.triggerSource.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleMarkResolved = (id: string) => {
    triggerHaptic();
    updateCorrectiveTraining(id, {
      status: 'Closed',
      effectivenessVerified: true,
      closureDate: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-400" />
              Corrective Retraining & CAPA Action Center
            </h2>
            <p className="text-xs text-slate-400">
              Closed-loop retraining triggered by production scrap spikes, downtime root causes, or audit deviations
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee, trigger source, or course..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-400"
          >
            <option value="all">All Statuses ({correctiveTrainingRecords.length})</option>
            <option value="Open">Open (Pending Retraining)</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed & Verified</option>
          </select>
        </div>
      </div>

      {/* Corrective Records List */}
      <div className="space-y-3">
        {filteredRecords.map((r) => (
          <div
            key={r.id}
            className="bg-slate-850 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:border-slate-700 transition-all space-y-2 md:space-y-0"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    r.status === 'Open'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : r.status === 'In Progress'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {r.status}
                </span>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-950/50 text-orange-300 border border-orange-500/30">
                  Trigger: {r.triggerSource}
                </span>

                <span className="text-xs font-mono text-slate-400">Due: {r.dueDate}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white leading-snug">
                  {r.requiredTrainingTitle}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span className="font-semibold text-slate-200">{r.employeeName}</span>
                  <span className="font-mono">({r.employeeCode})</span>
                  <span>•</span>
                  <span>Assigned Trainer: <strong className="text-slate-300">{r.trainerName}</strong></span>
                </div>
              </div>

              {/* Problem & Root Cause Box */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <p className="text-slate-300">
                  <strong className="text-rose-400">Issue / Defect:</strong> {r.issueDescription}
                </p>
                {r.rootCause && (
                  <p className="text-slate-400 italic">
                    <strong className="text-amber-400">Root Cause Identified:</strong> {r.rootCause}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              {r.status !== 'Closed' ? (
                <button
                  onClick={() => handleMarkResolved(r.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Sign-off & Close CAPA
                </button>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Retraining Verified
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
