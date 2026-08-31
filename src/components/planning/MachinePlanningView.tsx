import React from 'react';
import { Sliders, Cpu, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MachinePlanningView: React.FC = () => {
  const { machineSlots, machines, products, shifts } = useApp();

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <Sliders className="w-5 h-5 text-blue-400" />
            Machine Schedule Matrix
          </h1>
          <p className="text-xs text-slate-400">PPC slot assignments & planned mould changeover windows</p>
        </div>

        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-200">
          {machineSlots.length} Slots
        </span>
      </div>

      {/* Schedules Matrix */}
      <div className="space-y-3">
        {machineSlots.map((sch) => {
          const mach = machines.find((m) => m.id === sch.machineId);
          const prod = products.find((p) => p.id === sch.productId);
          const sh = shifts.find((s) => s.id === sch.shiftId);

          return (
            <div
              key={sch.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white font-mono">{mach?.code}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                      {sh?.code || 'Shift A'}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mt-1">
                    {prod?.sku} - {prod?.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Mould: {prod?.mouldCode} • Date: {sch.date}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {sch.plannedQty.toLocaleString()} pcs
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-300 font-semibold mt-1 inline-block">
                    {sch.status}
                  </span>
                </div>
              </div>

              {sch.isMoldChangeover && (
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-amber-300 font-mono">
                  <span className="text-slate-400 font-sans">Changeover: </span>
                  Mold Change planned ({sch.changeoverDurationMin} mins)
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
