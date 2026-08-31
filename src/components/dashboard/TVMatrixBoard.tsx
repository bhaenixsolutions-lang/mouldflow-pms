import React from 'react';
import { Machine, ProductMould } from '../../types/schema';
import { MachineTelemetrySpec } from './IndustrialMachineTile';

interface TVMatrixBoardProps {
  machines: Machine[];
  products: ProductMould[];
  specs: Record<string, MachineTelemetrySpec>;
  onSelectMachine: (machineId: string) => void;
}

export const TVMatrixBoard: React.FC<TVMatrixBoardProps> = ({
  machines,
  products,
  specs,
  onSelectMachine,
}) => {
  const getMatrixBg = (status: string, achPct: string) => {
    const ach = parseFloat(achPct.replace('%', '')) || 0;
    if (status === 'Breakdown') return 'bg-red-600 hover:bg-red-500 text-white';
    if (status === 'Maintenance') return 'bg-purple-700 hover:bg-purple-600 text-white';
    if (status === 'Idle') return 'bg-amber-600 hover:bg-amber-500 text-white';
    if (status === 'Setup') return 'bg-blue-600 hover:bg-blue-500 text-white';
    if (ach >= 90) return 'bg-emerald-600 hover:bg-emerald-500 text-white';
    if (ach >= 80) return 'bg-cyan-600 hover:bg-cyan-500 text-white';
    if (ach >= 70) return 'bg-purple-600 hover:bg-purple-500 text-white';
    if (ach > 0) return 'bg-amber-600 hover:bg-amber-500 text-white';
    return 'bg-slate-700 hover:bg-slate-600 text-slate-300';
  };

  return (
    <div className="bg-[#070b14] border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl space-y-3">
      {/* TV Matrix Board Header / Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Factory TV Production Matrix</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-300">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> 90-100%</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" /> 80-90%</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" /> 70-80%</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Idle / Setup</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-600 inline-block" /> Breakdown / &lt;60%</span>
        </div>
      </div>

      {/* Grid of Dense TV Machine Blocks */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
        {machines.map((m) => {
          const spec = specs[m.code] || {
            target: m.targetPerHour,
            actual: m.status === 'Running' ? Math.round(m.targetPerHour * 0.95) : 0,
            achPct: m.status === 'Running' ? '95.0%' : '0.0%',
            rejects: 0,
            rejPct: '0.0%',
            oeePct: m.status === 'Running' ? '93.5%' : '0.0%',
            cycleTime: 0,
            downtimeMin: 0,
            stoppages: 0,
            lastUpdated: '08:32:45',
          };
          const bgClass = getMatrixBg(m.status, spec.achPct);
          const achVal = spec.achPct.replace('%', '');

          return (
            <div
              key={m.id}
              onClick={() => onSelectMachine(m.id)}
              className={`${bgClass} rounded-lg p-2.5 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-md text-center select-none`}
            >
              <div className="text-xl sm:text-2xl font-black font-mono tracking-tighter leading-none">
                {m.status === 'Breakdown' ? 'STOP' : m.status === 'Idle' ? 'IDLE' : m.status === 'Setup' ? 'SETUP' : Math.round(parseFloat(achVal) || 0)}
              </div>
              <div className="text-[11px] font-bold font-mono uppercase tracking-wide opacity-90 mt-1">
                {m.code}
              </div>
              <div className="text-[9px] truncate max-w-full opacity-80 mt-0.5">
                {spec.actual} pcs
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
