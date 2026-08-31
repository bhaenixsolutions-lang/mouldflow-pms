import React, { useState, useMemo } from 'react';
import {
  Layers,
  Award,
  AlertTriangle,
  BarChart3,
  Cpu,
  Package,
  TrendingUp,
  Clock,
  Flame,
  ArrowUpDown,
  Filter,
  Search,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  computeProductMachinePerformance,
  ProductMachineComboMetric,
} from '../../utils/monitoringCalculations';

export const ProductMachineAnalysisView: React.FC = () => {
  const { machines, products, reports, users, departments, triggerHaptic } = useApp();
  const [sortBy, setSortBy] = useState<'oee' | 'achievement' | 'rejection' | 'downtime'>('oee');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const combos = useMemo(() => {
    return computeProductMachinePerformance(machines, products, reports, users, departments);
  }, [machines, products, reports, users, departments]);

  const filteredAndSortedCombos = useMemo(() => {
    let list = combos.filter((item) => {
      const matchesDept = selectedDept === 'all' || item.departmentName.toLowerCase().includes(selectedDept.toLowerCase());
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        item.machineCode.toLowerCase().includes(q) ||
        item.productSku.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.machineName.toLowerCase().includes(q);

      return matchesDept && matchesSearch;
    });

    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortBy === 'oee') {
        valA = a.oeePct;
        valB = b.oeePct;
      } else if (sortBy === 'achievement') {
        valA = a.achievementPct;
        valB = b.achievementPct;
      } else if (sortBy === 'rejection') {
        valA = a.rejectionPct;
        valB = b.rejectionPct;
      } else if (sortBy === 'downtime') {
        valA = a.totalDowntimeMinutes;
        valB = b.totalDowntimeMinutes;
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return list;
  }, [combos, sortBy, sortOrder, searchQuery, selectedDept]);

  // Overall best and worst
  const bestCombo = useMemo(() => {
    if (combos.length === 0) return null;
    return [...combos].sort((a, b) => b.oeePct - a.oeePct)[0];
  }, [combos]);

  const worstCombo = useMemo(() => {
    if (combos.length <= 1) return null;
    return [...combos].sort((a, b) => a.oeePct - b.oeePct)[0];
  }, [combos]);

  const toggleSort = (type: 'oee' | 'achievement' | 'rejection' | 'downtime') => {
    triggerHaptic();
    if (sortBy === type) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <Layers className="w-5 h-5 text-blue-400" />
            Product + Machine Performance
          </h1>
          <p className="text-xs text-slate-400">
            Tooling efficiency & mould-to-machine matching matrix
          </p>
        </div>

        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-200">
          {combos.length} Pairs
        </span>
      </div>

      {/* Best vs Worst Performance Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {bestCombo && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-emerald-300">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4 text-emerald-400" /> Top Performer Match
              </span>
              <span className="font-mono text-xs font-bold bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-300">
                {bestCombo.oeePct}% OEE
              </span>
            </div>
            <div>
              <span className="font-mono font-black text-white text-sm">
                {bestCombo.machineCode} + {bestCombo.productSku}
              </span>
              <p className="text-[11px] text-slate-300 truncate">{bestCombo.productName}</p>
            </div>
            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono pt-1 border-t border-emerald-900/40">
              <span>Achieve: {bestCombo.achievementPct}%</span>
              <span>Scrap: {bestCombo.rejectionPct}%</span>
              <span>Downtime: {bestCombo.totalDowntimeMinutes}m</span>
            </div>
          </div>
        )}

        {worstCombo && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-rose-300">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Needs Tooling Attention
              </span>
              <span className="font-mono text-xs font-bold bg-rose-900/60 px-2 py-0.5 rounded text-rose-300">
                {worstCombo.oeePct}% OEE
              </span>
            </div>
            <div>
              <span className="font-mono font-black text-white text-sm">
                {worstCombo.machineCode} + {worstCombo.productSku}
              </span>
              <p className="text-[11px] text-slate-300 truncate">{worstCombo.productName}</p>
            </div>
            <div className="flex items-center justify-between text-[10px] text-rose-400 font-mono pt-1 border-t border-rose-900/40">
              <span>Achieve: {worstCombo.achievementPct}%</span>
              <span>Scrap: {worstCombo.rejectionPct}%</span>
              <span>Downtime: {worstCombo.totalDowntimeMinutes}m</span>
            </div>
          </div>
        )}
      </div>

      {/* Sorting & Search Controls */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Machine (IMM-01) or Product SKU..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Sort Pill Buttons */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-slate-400 self-center shrink-0 pr-1">Sort:</span>
          {[
            { id: 'oee', label: 'OEE %' },
            { id: 'achievement', label: 'Achievement %' },
            { id: 'rejection', label: 'Rejection %' },
            { id: 'downtime', label: 'Downtime min' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => toggleSort(s.id as any)}
              className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap flex items-center gap-1 transition-all ${
                sortBy === s.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {s.label}
              {sortBy === s.id && (
                <ArrowUpDown className="w-3 h-3 text-blue-200" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Product-Machine Matrix Cards */}
      <div className="space-y-3">
        {filteredAndSortedCombos.map((item) => {
          return (
            <div
              key={`${item.machineId}__${item.productId}`}
              className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-lg hover:border-slate-700 transition-all"
            >
              {/* Top Row: Machine & Product Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono font-bold text-xs">
                      {item.machineCode}
                    </span>
                    <span className="text-slate-400 font-mono">+</span>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono font-bold text-xs">
                      {item.productSku}
                    </span>
                    {item.isBestPerformer && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold">
                        Top Performer
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-semibold text-white mt-1">
                    {item.productName}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {item.machineName} • {item.departmentName}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">OEE:</span>
                    <span className="text-sm font-black font-mono text-blue-400">{item.oeePct}%</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                    {item.productionHours} Production Hrs
                  </span>
                </div>
              </div>

              {/* Numerical Metrics Summary Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Prod</span>
                  <span className="font-bold text-emerald-400 font-mono text-xs">
                    {item.totalProduction.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    /{item.totalTarget.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Achieve %</span>
                  <span className="font-bold text-white font-mono text-xs">
                    {item.achievementPct}%
                  </span>
                  <span className="text-[9px] text-emerald-500 font-mono block">
                    Target Met
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Rejection</span>
                  <span className="font-bold text-rose-400 font-mono text-xs">
                    {item.totalRejection}
                  </span>
                  <span className="text-[9px] text-rose-500 font-mono block">
                    {item.rejectionPct}% scrap
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Downtime</span>
                  <span className="font-bold text-amber-400 font-mono text-xs">
                    {item.totalDowntimeMinutes}m
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    Lost time
                  </span>
                </div>
              </div>

              {/* 3 Pillars & Operator Allocation */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>Avail: <strong className="text-slate-200">{item.availabilityPct}%</strong></span>
                  <span>•</span>
                  <span>Perf: <strong className="text-slate-200">{item.performancePct}%</strong></span>
                  <span>•</span>
                  <span>Qual: <strong className="text-slate-200">{item.qualityPct}%</strong></span>
                </div>

                {item.operators.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span>Operators: </span>
                    <strong className="text-slate-200">
                      {item.operators.map((o) => o.name).join(', ')}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredAndSortedCombos.length === 0 && (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No matching product-machine combinations found.
          </div>
        )}
      </div>
    </div>
  );
};
