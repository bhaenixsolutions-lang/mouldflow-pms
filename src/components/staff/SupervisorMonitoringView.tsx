import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Cpu,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  BarChart3,
  TrendingUp,
  Flame,
  Search,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  computeSupervisorPerformance,
  SupervisorPerformanceMetric,
} from '../../utils/monitoringCalculations';

export const SupervisorMonitoringView: React.FC = () => {
  const { users, reports, machines, departments, shifts, activeShift, triggerHaptic } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const supervisorMetrics = useMemo(() => {
    return computeSupervisorPerformance(users, reports, machines, departments, shifts, activeShift);
  }, [users, reports, machines, departments, shifts, activeShift]);

  const filteredSupervisors = useMemo(() => {
    return supervisorMetrics.filter((sup) => {
      const q = searchQuery.toLowerCase();
      return (
        !searchQuery ||
        sup.supervisorName.toLowerCase().includes(q) ||
        sup.employeeCode.toLowerCase().includes(q) ||
        sup.departmentName.toLowerCase().includes(q) ||
        sup.machinesList.some((m) => m.toLowerCase().includes(q))
      );
    });
  }, [supervisorMetrics, searchQuery]);

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            Supervisor Shift Performance
          </h1>
          <p className="text-xs text-slate-400">
            Shift compliance, approval turnaround, station oversight & OEE
          </p>
        </div>

        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-200">
          {supervisorMetrics.length} Leads
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by supervisor name, employee code, department..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Supervisors Cards List */}
      <div className="space-y-3.5">
        {filteredSupervisors.map((sup) => {
          return (
            <div
              key={sup.supervisorId}
              className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-xl hover:border-slate-750 transition-all"
            >
              {/* Top Header: Name, Department, Shift, OEE */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800 flex items-center justify-center font-bold text-purple-200 text-xs shrink-0">
                    {sup.supervisorName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-white">{sup.supervisorName}</h3>
                      <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                        Supervisor
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {sup.employeeCode} • {sup.departmentName} • {sup.shiftName}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">OEE:</span>
                    <span className="text-sm font-black font-mono text-purple-400">{sup.oeePct}%</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                    {sup.targetAchievementPct}% Target Met
                  </span>
                </div>
              </div>

              {/* Oversight Coverage: Stations & Operators */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <Cpu className="w-2.5 h-2.5 text-blue-400" /> Machines Supervised ({sup.machinesSupervisedCount})
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sup.machinesList.slice(0, 5).map((m) => (
                      <span
                        key={m}
                        className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 font-mono text-[10px]"
                      >
                        {m}
                      </span>
                    ))}
                    {sup.machinesList.length > 5 && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        +{sup.machinesList.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <Users className="w-2.5 h-2.5 text-emerald-400" /> Operators Supervised ({sup.operatorsSupervisedCount})
                  </span>
                  <p className="text-[11px] text-slate-300 truncate mt-1">
                    {sup.operatorsList.slice(0, 3).join(', ') || 'None assigned'}
                    {sup.operatorsList.length > 3 && ` +${sup.operatorsList.length - 3} more`}
                  </p>
                </div>
              </div>

              {/* Production Totals Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Shift Output</span>
                  <span className="font-bold text-emerald-400 font-mono text-xs">
                    {sup.totalProduction.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    /{sup.totalTarget.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Achievement</span>
                  <span className="font-bold text-white font-mono text-xs">
                    {sup.targetAchievementPct}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Total Scrap</span>
                  <span className="font-bold text-rose-400 font-mono text-xs">
                    {sup.totalRejection}
                  </span>
                  <span className="text-[9px] text-rose-500 font-mono block">
                    {sup.rejectionPct}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Total Downtime</span>
                  <span className="font-bold text-amber-400 font-mono text-xs">
                    {sup.totalDowntimeMinutes}m
                  </span>
                </div>
              </div>

              {/* Verification Turnaround & Compliance Bar */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <FileCheck className="w-3 h-3 text-emerald-400" /> Verification Status
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {sup.reportsVerifiedCount} Verified
                    </span>
                    {sup.reportsPendingCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                        {sup.reportsPendingCount} Pending
                      </span>
                    )}
                    {sup.missingReportsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                        {sup.missingReportsCount} Missing
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3 text-blue-400" /> Sign-off Turnaround Time
                  </span>
                  <span className="font-mono text-xs font-bold text-blue-300 mt-1 block">
                    {sup.approvalTurnaroundTime}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredSupervisors.length === 0 && (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No matching supervisors found.
          </div>
        )}
      </div>
    </div>
  );
};
