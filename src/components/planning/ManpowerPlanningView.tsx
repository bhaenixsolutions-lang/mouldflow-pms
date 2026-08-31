import React from 'react';
import { Users, Plus, CheckCircle, Cpu, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ManpowerPlanningView: React.FC = () => {
  const { users, machines, departments, activeShift, manpower } = useApp();

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <Users className="w-5 h-5 text-blue-400" />
            Manpower Planning & Allocation
          </h1>
          <p className="text-xs text-slate-400">Shift operator-to-workcell allocation matrix</p>
        </div>

        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-200">
          {manpower.length} Allocations
        </span>
      </div>

      {/* Allocation Cards */}
      <div className="space-y-2.5">
        {manpower.map((alloc) => {
          const op = users.find((u) => u.id === alloc.operatorId);
          const mach = machines.find((m) => m.id === alloc.machineId);
          const dept = departments.find((d) => d.id === alloc.departmentId);

          return (
            <div
              key={alloc.id}
              className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-2 shadow-md"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">{op?.name || 'Operator'}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-amber-300 font-mono font-bold">
                    L{op?.skillLevel || 2}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Code: {op?.employeeCode} • {dept?.name}
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-lg text-xs font-mono font-bold">
                  {mach?.code || 'Floating Reserve'}
                </span>
                <div className="text-[10px] text-emerald-400 font-mono mt-1">
                  Score: {alloc.skillMatchScore}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
