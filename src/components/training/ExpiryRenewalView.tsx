import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  RotateCcw,
  Search,
  Filter,
  Award,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AssignTrainingModal } from './AssignTrainingModal';

export const ExpiryRenewalView: React.FC = () => {
  const {
    trainingAssignments,
    machines,
    assignTraining,
    currentUser,
    triggerHaptic,
  } = useApp();

  const [timeWindow, setTimeWindow] = useState<'all' | 'expired' | '30days' | '60days' | '90days'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reassignModalTarget, setReassignModalTarget] = useState<any | null>(null);

  const nowMs = Date.now();

  const expiryItems = trainingAssignments
    .filter((a) => a.validityExpiryDate || a.status === 'Expired')
    .map((a) => {
      const expDate = a.validityExpiryDate ? new Date(a.validityExpiryDate) : new Date(0);
      const daysUntilExpiry = Math.ceil((expDate.getTime() - nowMs) / (1000 * 60 * 60 * 24));

      let bracket: 'Expired' | '30 Days' | '60 Days' | '90 Days' | 'Safe' = 'Safe';
      if (daysUntilExpiry < 0 || a.status === 'Expired') bracket = 'Expired';
      else if (daysUntilExpiry <= 30) bracket = '30 Days';
      else if (daysUntilExpiry <= 60) bracket = '60 Days';
      else if (daysUntilExpiry <= 90) bracket = '90 Days';

      return {
        ...a,
        daysUntilExpiry,
        bracket,
      };
    });

  const filteredItems = expiryItems.filter((item) => {
    if (timeWindow === 'expired' && item.bracket !== 'Expired') return false;
    if (timeWindow === '30days' && item.bracket !== '30 Days' && item.bracket !== 'Expired') return false;
    if (timeWindow === '60days' && item.bracket !== '60 Days' && item.bracket !== '30 Days' && item.bracket !== 'Expired') return false;
    if (
      searchQuery &&
      !item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.trainingTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const expiredCount = expiryItems.filter((i) => i.bracket === 'Expired').length;
  const thirtyDaysCount = expiryItems.filter((i) => i.bracket === '30 Days').length;
  const sixtyDaysCount = expiryItems.filter((i) => i.bracket === '60 Days').length;

  const handleQuickRenew = (item: any) => {
    triggerHaptic();
    assignTraining([
      {
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        employeeCode: item.employeeCode,
        departmentId: item.departmentId,
        designation: item.role,
        role: item.role,
        trainingId: item.trainingId,
        trainingTitle: item.trainingTitle,
        trainingCode: item.trainingCode,
        category: item.category,
        machineId: item.machineId,
        machineCode: item.machineCode,
        assignedDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        priority: 'High',
        trainerName: currentUser.name,
        trainingMode: item.trainingMode,
        status: 'Assigned',
        contentCompleted: false,
        testTaken: false,
        practicalCompleted: false,
        attemptsCount: 0,
        remarks: `Annual Qualification Renewal (Re-assigned on ${new Date().toISOString().slice(0, 10)})`,
        createdBy: currentUser.name,
      },
    ]);
  };

  return (
    <div className="space-y-5">
      {/* Header & Expiry Windows */}
      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Qualification Expiry & Renewal Center
          </h2>
          <p className="text-xs text-slate-400">
            Track annual certifications, machine operation licenses & 1-click re-assignment of refresher training
          </p>
        </div>

        {/* Expiry Window Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800">
          <button
            onClick={() => setTimeWindow('expired')}
            className={`p-3 rounded-xl border text-left transition-all ${
              timeWindow === 'expired'
                ? 'bg-rose-950/40 border-rose-500 text-white shadow-lg'
                : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-[11px] uppercase font-bold text-rose-400 block">Overdue / Expired</span>
            <span className="text-xl font-black text-rose-400 mt-0.5 block">{expiredCount}</span>
          </button>

          <button
            onClick={() => setTimeWindow('30days')}
            className={`p-3 rounded-xl border text-left transition-all ${
              timeWindow === '30days'
                ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg'
                : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-[11px] uppercase font-bold text-amber-400 block">Due within 30 Days</span>
            <span className="text-xl font-black text-amber-400 mt-0.5 block">{thirtyDaysCount}</span>
          </button>

          <button
            onClick={() => setTimeWindow('60days')}
            className={`p-3 rounded-xl border text-left transition-all ${
              timeWindow === '60days'
                ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg'
                : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-[11px] uppercase font-bold text-cyan-400 block">Due within 60 Days</span>
            <span className="text-xl font-black text-cyan-400 mt-0.5 block">{sixtyDaysCount}</span>
          </button>

          <button
            onClick={() => setTimeWindow('all')}
            className={`p-3 rounded-xl border text-left transition-all ${
              timeWindow === 'all'
                ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg'
                : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-[11px] uppercase font-bold text-purple-400 block">All Tracked Expiries</span>
            <span className="text-xl font-black text-purple-400 mt-0.5 block">{expiryItems.length}</span>
          </button>
        </div>
      </div>

      {/* Expiry Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-slate-850 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:border-slate-700 transition-all"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    item.bracket === 'Expired'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : item.bracket === '30 Days'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {item.bracket === 'Expired' ? 'EXPIRED' : `EXPIRES IN ${item.daysUntilExpiry} DAYS`}
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold">{item.trainingCode}</span>
                {item.machineCode && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                    {item.machineCode}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white leading-snug">{item.trainingTitle}</h3>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-200">{item.employeeName}</span>
                <span className="font-mono">({item.employeeCode})</span>
                <span>•</span>
                <span>Role: {item.role}</span>
                <span>•</span>
                <span>Expiry: <strong className="text-slate-300">{item.validityExpiryDate || 'Overdue'}</strong></span>
              </div>
            </div>

            {/* Quick 1-Click Renewal */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => handleQuickRenew(item)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-950/50"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Re-Assign Refresher
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
