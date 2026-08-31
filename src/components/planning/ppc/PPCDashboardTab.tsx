import React from 'react';
import {
  TrendingUp,
  Cpu,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  Zap,
  Activity,
  Plus,
  Camera,
  RefreshCw,
  Gauge,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ProductionPlanRecord } from '../../../types/ppc';

interface PPCDashboardTabProps {
  onOpenCreatePlan: () => void;
  onOpenOCRImport: () => void;
  onOpenBreakdownReplan: (machineCode?: string) => void;
  onSelectPlan: (plan: ProductionPlanRecord) => void;
}

export const PPCDashboardTab: React.FC<PPCDashboardTabProps> = ({
  onOpenCreatePlan,
  onOpenOCRImport,
  onOpenBreakdownReplan,
  onSelectPlan,
}) => {
  const {
    productionPlans,
    ppcRequirementDocs,
    machines,
    reports,
    triggerHaptic,
  } = useApp();

  // Metrics aggregation
  const totalRequirementQty = productionPlans.reduce((acc, p) => acc + (p.requiredQuantity || p.plannedQuantity), 0);
  const totalPlannedQty fundament = productionPlans.reduce((acc, p) => acc + p.plannedQuantity, 0);
  const totalProducedQty = productionPlans.reduce((acc, p) => acc + (p.alreadyProduced || 0), 0);
  const totalBalanceQty = Math.max(0, totalPlannedQty fundament - totalProducedQty);
  const completionPct = totalPlannedQty fundament > 0 ? Math.round((totalProducedQty / totalPlannedQty fundament) * 100) : 0;

  // Active machines and capacity
  const runningPlans = productionPlans.filter((p) => p.status === 'RUNNING' || p.status === 'PLANNED');
  const criticalPlans = productionPlans.filter((p) => p.priority === 'CRITICAL' && p.status !== 'COMPLETED');
  const delayedPlans = productionPlans.filter((p) => p.status === 'DELAYED' || (new Date(p.dueDate) < new Date() && p.balanceQuantity > 0));

  // Machines with status breakdown
  const brokenMachines = machines.filter((m) => m.status === 'Breakdown' || m.status === 'Maintenance');
  const impactedPlansCount = productionPlans.filter((p) => p.isImpactedByBreakdown).length;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 sm:p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            Production Planning & PPC Dashboard
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Component-wise scheduling, capacity loading & real-time plan execution
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              triggerHaptic();
              onOpenOCRImport();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold active:scale-95 transition-all shadow-sm"
          >
            <Camera className="w-4 h-4 text-purple-400" />
            <span>AI OCR Schedule Import</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              onOpenBreakdownReplan();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold active:scale-95 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-rose-400" />
            <span>Breakdown Re-Plan</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              onOpenCreatePlan();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* Breakdown Impact Emergency Banner (if machines are broken or plans re-routed) */}
      {brokenMachines.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-rose-950/40 p-4 rounded-2xl border border-rose-800/60 shadow-lg shadow-rose-950/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Shopfloor Stoppage Alert:</span>
                  <span className="text-rose-400 font-mono">
                    {brokenMachines.map((m) => m.code).join(', ')} Breakdown
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Machine breakdown requires schedule re-routing to prevent customer dispatch delays.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic();
                onOpenBreakdownReplan(brokenMachines[0]?.code);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold self-start sm:self-center shrink-0 shadow-md shadow-rose-600/40 active:scale-95 transition-transform"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>1-Click Re-Route Schedule</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Requirement */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Customer Requirement</span>
            <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-white font-mono mt-2">
            {totalRequirementQty.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-blue-400 font-semibold">{productionPlans.length}</span> component plans
          </div>
        </div>

        {/* Planned vs Actual Produced */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Actual Produced</span>
            <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono mt-2">
            {totalProducedQty.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400 font-semibold">{completionPct}%</span> fulfilled of planned
          </div>
        </div>

        {/* Balance Quantity */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Balance to Produce</span>
            <div className="p-2 rounded-lg bg-cyan-600/10 text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-cyan-400 font-mono mt-2">
            {totalBalanceQty.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-amber-400 font-semibold">{runningPlans.length}</span> active running items
          </div>
        </div>

        {/* Plan Compliance & Alerts */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Priority Alerts</span>
            <div className="p-2 rounded-lg bg-rose-600/10 text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-white font-mono mt-2 flex items-center gap-2">
            <span className="text-rose-400">{criticalPlans.length}</span>
            <span className="text-xs text-slate-400 font-normal">Hot / Critical</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {delayedPlans.length > 0 ? (
              <span className="text-rose-400 font-semibold">{delayedPlans.length} Delayed items</span>
            ) : (
              <span className="text-emerald-400 font-semibold">100% On-Schedule</span>
            )}
          </div>
        </div>
      </div>

      {/* Machine Loading & Capacity Matrix */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-white">Shopfloor Machine Loading Matrix</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {machines.length} Injection Moulding Machines
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {machines.map((machine) => {
            const machinePlans = productionPlans.filter((p) => p.machineCode === machine.code && p.status !== 'COMPLETED');
            const totalPlannedMins = machinePlans.reduce((acc, p) => {
              const hrs = p.expectedProductionRatePerHour > 0 ? p.balanceQuantity / p.expectedProductionRatePerHour : 0;
              return acc + hrs * 60;
            }, 0);

            // Available 24 hrs per day (1440 mins)
            const capacityUtilizationPct = Math.min(100, Math.round((totalPlannedMins / (24 * 60 * 7)) * 100 * 2.5)); // weekly load normalized

            const statusColors = {
              Running: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
              Idle: 'border-amber-500/40 bg-amber-950/20 text-amber-400',
              Breakdown: 'border-rose-500/40 bg-rose-950/20 text-rose-400',
              Maintenance: 'border-purple-500/40 bg-purple-950/20 text-purple-400',
            }[machine.status] || 'border-slate-800 bg-slate-950 text-slate-400';

            return (
              <div
                key={machine.id}
                className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white">{machine.code}</span>
                    <span className="text-[11px] text-slate-400">({machine.tonnage}T)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors}`}>
                    {machine.status}
                  </span>
                </div>

                {/* Running Component */}
                <div className="text-xs">
                  {machinePlans.length > 0 ? (
                    <div>
                      <div className="font-medium text-slate-200 truncate">{machinePlans[0].componentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Mould: {machinePlans[0].mouldCode} • Cavities: {machinePlans[0].cavities}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 italic text-[11px]">No active plan scheduled</div>
                  )}
                </div>

                {/* Capacity Loading Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Loading Utilization</span>
                    <span className="font-mono font-semibold text-slate-200">{capacityUtilizationPct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        capacityUtilizationPct > 90
                          ? 'bg-rose-500'
                          : capacityUtilizationPct > 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${capacityUtilizationPct}%` }}
                    />
                  </div>
                </div>

                {/* Shift Details Footer */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900 font-mono">
                  <span>{machinePlans.length} queued plans</span>
                  <span className="text-cyan-400">{(totalPlannedMins / 60).toFixed(1)} hrs load</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical & Near-Due Production Plans */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Active Component Production Schedules</h3>
          </div>
          <span className="text-xs text-slate-400">Top Priority Orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Plan #</th>
                <th className="py-2.5 px-3">Component / Part</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Machine</th>
                <th className="py-2.5 px-3">Planned Qty</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {productionPlans.slice(0, 5).map((plan) => {
                const pct = plan.plannedQuantity > 0 ? Math.round(((plan.alreadyProduced || 0) / plan.plannedQuantity) * 100) : 0;
                return (
                  <tr
                    key={plan.id}
                    onClick={() => onSelectPlan(plan)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{plan.planNumber}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-200">{plan.componentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{plan.componentPartNumber}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{plan.customer}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-mono text-[11px] font-bold">
                        {plan.machineCode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-white">
                      {plan.plannedQuantity.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                        <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {plan.alreadyProduced || 0} / {plan.plannedQuantity} ({pct}%)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{plan.dueDate}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          plan.status === 'RUNNING'
                            ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                            : plan.status === 'PLANNED'
                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {plan.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPlan(plan);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 p-1 hover:bg-slate-800 rounded-lg"
                      >
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
