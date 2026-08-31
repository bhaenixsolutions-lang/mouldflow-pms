import React, { useState, useMemo } from 'react';
import {
  User,
  Cpu,
  Package,
  Award,
  BarChart3,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  computeOperatorPerformance,
  OperatorPerformanceMetric,
} from '../../utils/monitoringCalculations';

export const OperatorMonitoringView: React.FC = () => {
  const { users, reports, machines, products, departments, activeShift, triggerHaptic } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');

  const operatorMetrics = useMemo(() => {
    return computeOperatorPerformance(users, reports, machines, products, departments, activeShift);
  }, [users, reports, machines, products, departments, activeShift]);

  const filteredOperators = useMemo(() => {
    return operatorMetrics.filter((op) => {
      const matchesDept = filterDept === 'all' || op.departmentName.toLowerCase().includes(filterDept.toLowerCase());
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        op.operatorName.toLowerCase().includes(q) ||
        op.employeeCode.toLowerCase().includes(q) ||
        op.machinesWorked.some((m) => m.toLowerCase().includes(q)) ||
        op.productsHandled.some((p) => p.toLowerCase().includes(q));

      return matchesDept && matchesSearch;
    });
  }, [operatorMetrics, filterDept, searchQuery]);

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <User className="w-5 h-5 text-blue-400" />
            Operator Live Performance
          </h1>
          <p className="text-xs text-slate-400">
            Shift efficiency, scrap rate, report compliance & OEE metrics
          </p>
        </div>

        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-200">
          {operatorMetrics.length} Operators
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by operator name, code (OP-104), machine, SKU..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Operator Cards List */}
      <div className="space-y-3.5">
        {filteredOperators.map((op) => {
          return (
            <div
              key={op.operatorId}
              className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-xl hover:border-slate-750 transition-all"
            >
              {/* Top Row: Name, Employee Code, Skill Badge, OEE */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                    {op.operatorName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-white">{op.operatorName}</h3>
                      <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold flex items-center gap-0.5 font-mono">
                        <Award className="w-3 h-3 text-amber-400" /> L{op.skillLevel}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {op.employeeCode} • {op.departmentName}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">OEE:</span>
                    <span className="text-sm font-black font-mono text-blue-400">{op.oeePct}%</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                    {op.achievementPct}% Achieved
                  </span>
                </div>
              </div>

              {/* Station Assignments & SKUs Handled */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <Cpu className="w-2.5 h-2.5 text-blue-400" /> Machines Worked
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {op.machinesWorked.length > 0 ? (
                      op.machinesWorked.map((m) => (
                        <span
                          key={m}
                          className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 font-mono text-[10px]"
                        >
                          {m}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500">None</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <Package className="w-2.5 h-2.5 text-purple-400" /> Products Handled
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {op.productsHandled.length > 0 ? (
                      op.productsHandled.map((p) => (
                        <span
                          key={p}
                          className="px-1.5 py-0.2 rounded bg-slate-800 text-purple-300 font-mono text-[10px]"
                        >
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500">None</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Production Numbers Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 block">Produced</span>
                  <span className="font-bold text-emerald-400 font-mono text-xs">
                    {op.totalProduction.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    /{op.totalTarget.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Achievement</span>
                  <span className="font-bold text-white font-mono text-xs">
                    {op.achievementPct}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Rejection</span>
                  <span className="font-bold text-rose-400 font-mono text-xs">
                    {op.totalRejection}
                  </span>
                  <span className="text-[9px] text-rose-500 font-mono block">
                    {op.rejectionPct}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Downtime</span>
                  <span className="font-bold text-amber-400 font-mono text-xs">
                    {op.downtimeMinutes}m
                  </span>
                </div>
              </div>

              {/* Reports Compliance & Supervisor Verification Status */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[11px] text-slate-300">
                    Reports: <strong className="text-white">{op.reportsSubmittedCount} submitted</strong>
                  </span>
                  {op.missingReportsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                      {op.missingReportsCount} Missing
                    </span>
                  )}
                  {op.pendingReportsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                      {op.pendingReportsCount} Pending Sign-off
                    </span>
                  )}
                </div>

                <div className="text-right font-mono text-[10px]">
                  <span className="text-slate-400">Verified: </span>
                  <strong className="text-emerald-400">{op.verificationStatusPct}%</strong>
                </div>
              </div>

              {/* 3 Pillars Footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                <span>Availability: <strong className="text-slate-200">{op.availabilityPct}%</strong></span>
                <span>•</span>
                <span>Performance: <strong className="text-slate-200">{op.performancePct}%</strong></span>
                <span>•</span>
                <span>Quality: <strong className="text-slate-200">{op.qualityPct}%</strong></span>
              </div>
            </div>
          );
        })}

        {filteredOperators.length === 0 && (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No matching operators found.
          </div>
        )}
      </div>
    </div>
  );
};
