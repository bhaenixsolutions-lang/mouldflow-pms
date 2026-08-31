import React, { useState } from 'react';
import {
  Cpu,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  Plus,
  Zap,
  Package,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ProductionPlanRecord } from '../../../types/ppc';

interface PPCMachineLoadingTabProps {
  onOpenCreatePlan: () => void;
  onOpenBreakdownReplan: (machineCode?: string) => void;
  onSelectPlan: (plan: ProductionPlanRecord) => void;
}

export const PPCMachineLoadingTab: React.FC<PPCMachineLoadingTabProps> = ({
  onOpenCreatePlan,
  onOpenBreakdownReplan,
  onSelectPlan,
}) => {
  const { machines, productionPlans, triggerHaptic } = useApp();
  const [selectedDay, setSelectedDay] = useState<'TODAY' | 'TOMORROW' | 'WEEK'>('TODAY');

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            Machine Loading & Shift Allocation
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time machine schedule, tonnage loading & shift capacity allocation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedDay('TODAY')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                selectedDay === 'TODAY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDay('TOMORROW')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                selectedDay === 'TOMORROW' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tomorrow
            </button>
            <button
              onClick={() => setSelectedDay('WEEK')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                selectedDay === 'WEEK' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              7-Day View
            </button>
          </div>

          <button
            onClick={() => {
              triggerHaptic();
              onOpenBreakdownReplan();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Route Stoppage</span>
          </button>
        </div>
      </div>

      {/* Machine Timeline Cards */}
      <div className="space-y-4">
        {machines.map((machine) => {
          const machinePlans = productionPlans.filter(
            (p) => p.machineCode === machine.code && p.status !== 'COMPLETED'
          );

          const totalPlannedHours = machinePlans.reduce((acc, p) => {
            const hrs = p.expectedProductionRatePerHour > 0 ? p.balanceQuantity / p.expectedProductionRatePerHour : 0;
            return acc + hrs;
          }, 0);

          const utilizationPct = Math.min(100, Math.round((totalPlannedHours / (24 * 7)) * 100 * 2.5));

          return (
            <div
              key={machine.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm space-y-3 p-4"
            >
              {/* Machine Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-mono font-bold text-blue-400">
                    {machine.code}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{machine.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono font-normal">({machine.tonnage} Ton clamping)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Standard Cycle: {machine.standardCycleTimeSec}s • Max Cavities: 8
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <div className="text-right">
                    <div className="text-slate-400 text-[10px]">Weekly Load</div>
                    <div className="font-bold text-cyan-400">{totalPlannedHours.toFixed(1)} hrs</div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      machine.status === 'Running'
                        ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400'
                        : machine.status === 'Breakdown'
                        ? 'border-rose-500/40 bg-rose-950/40 text-rose-400'
                        : 'border-amber-500/40 bg-amber-950/40 text-amber-400'
                    }`}
                  >
                    {machine.status}
                  </span>
                </div>
              </div>

              {/* Shift Allocation Slots (Shift A, Shift B, Shift C) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-xs">
                {/* Shift A */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-cyan-400 font-bold">Shift A (06:00 - 14:00)</span>
                    <span className="text-slate-400">8 hrs capacity</span>
                  </div>

                  {machinePlans[0] ? (
                    <div
                      onClick={() => onSelectPlan(machinePlans[0])}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 cursor-pointer transition-all space-y-1"
                    >
                      <div className="font-semibold text-slate-200 truncate text-[11px]">
                        {machinePlans[0].componentName}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Target: {machinePlans[0].targetPerShift} pcs</span>
                        <span className="text-emerald-400 font-bold">{machinePlans[0].expectedProductionRatePerHour} pcs/hr</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        Mould: {machinePlans[0].mouldCode} ({machinePlans[0].cavities}C)
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-[10px] italic py-2">No active job scheduled</div>
                  )}
                </div>

                {/* Shift B */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-blue-400 font-bold">Shift B (14:00 - 22:00)</span>
                    <span className="text-slate-400">8 hrs capacity</span>
                  </div>

                  {machinePlans[0] ? (
                    <div
                      onClick={() => onSelectPlan(machinePlans[0])}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 cursor-pointer transition-all space-y-1"
                    >
                      <div className="font-semibold text-slate-200 truncate text-[11px]">
                        {machinePlans[0].componentName} (Cont.)
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Target: {machinePlans[0].targetPerShift} pcs</span>
                        <span className="text-emerald-400 font-bold">{machinePlans[0].expectedProductionRatePerHour} pcs/hr</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        Mould: {machinePlans[0].mouldCode}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-[10px] italic py-2">No active job scheduled</div>
                  )}
                </div>

                {/* Shift C */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-purple-400 font-bold">Shift C (22:00 - 06:00)</span>
                    <span className="text-slate-400">8 hrs capacity</span>
                  </div>

                  {machinePlans[1] || machinePlans[0] ? (
                    <div
                      onClick={() => onSelectPlan(machinePlans[1] || machinePlans[0])}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 cursor-pointer transition-all space-y-1"
                    >
                      <div className="font-semibold text-slate-200 truncate text-[11px]">
                        {(machinePlans[1] || machinePlans[0]).componentName}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Target: {(machinePlans[1] || machinePlans[0]).targetPerShift} pcs</span>
                        <span className="text-emerald-400 font-bold">{(machinePlans[1] || machinePlans[0]).expectedProductionRatePerHour} pcs/hr</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        Mould: {(machinePlans[1] || machinePlans[0]).mouldCode}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-[10px] italic py-2">Planned Preventive Maintenance / Idle</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
