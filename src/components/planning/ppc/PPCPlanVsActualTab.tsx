import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Filter,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ProductionPlanRecord } from '../../../types/ppc';

interface PPCPlanVsActualTabProps {
  onSelectPlan: (plan: ProductionPlanRecord) => void;
}

export const PPCPlanVsActualTab: React.FC<PPCPlanVsActualTabProps> = ({ onSelectPlan }) => {
  const { productionPlans, reports, triggerHaptic } = useApp();
  const [filterCustomer, setFilterCustomer] = useState('ALL');

  const customers = Array.from(new Set(productionPlans.map((p) => p.customer).filter(Boolean)));

  const filteredPlans = productionPlans.filter((p) => {
    return filterCustomer === 'ALL' || p.customer === filterCustomer;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Plan vs Actual Execution Tracking
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized with shopfloor hourly logs, actual shot counts & dispatch deadlines
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label className="text-slate-400 font-semibold">Customer:</label>
          <select
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-hidden focus:border-cyan-500"
          >
            <option value="ALL">All Customers</option>
            {customers.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Plan vs Actual Comparison Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <h3 className="font-bold text-slate-200">Component Variance & Adherence Index</h3>
          <span className="text-slate-400 font-mono text-[11px]">Real-Time Variance Updates</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-3">Plan # & Component</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Machine</th>
                <th className="py-3 px-3">Planned Qty</th>
                <th className="py-3 px-3">Actual Produced</th>
                <th className="py-3 px-3">Balance Qty</th>
                <th className="py-3 px-3">Variance Status</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPlans.map((plan) => {
                const actual = plan.alreadyProduced || 0;
                const balance = Math.max(0, plan.plannedQuantity - actual);
                const pct = plan.plannedQuantity > 0 ? Math.round((actual / plan.plannedQuantity) * 100) : 0;
                const isBehind = balance > 0 && new Date(plan.dueDate) < new Date();

                return (
                  <tr
                    key={plan.id}
                    onClick={() => onSelectPlan(plan)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-white font-sans">{plan.componentName}</div>
                      <div className="text-[10px] text-cyan-400">{plan.planNumber} • {plan.componentPartNumber}</div>
                    </td>

                    <td className="py-3 px-3 font-sans text-slate-300">
                      {plan.customer}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-blue-950 border border-blue-800 text-blue-300 text-[11px] font-bold">
                        {plan.machineCode}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-100 font-bold">
                      {plan.plannedQuantity.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-emerald-400 font-bold">
                      {actual.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-cyan-400 font-bold">
                      {balance.toLocaleString()}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {pct >= 100 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> 100% Completed
                          </span>
                        ) : isBehind ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" /> Behind Schedule
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> On Track ({pct}%)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-300 text-xs">
                      {plan.dueDate}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button className="text-cyan-400 hover:text-cyan-300 p-1 hover:bg-slate-800 rounded-lg">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
