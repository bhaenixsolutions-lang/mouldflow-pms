import React, { useState } from 'react';
import {
  Clock,
  Plus,
  AlertOctagon,
  CheckCircle,
  Wrench,
  Zap,
  Filter,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DowntimeLogItem } from '../../types/schema';

interface DowntimeViewProps {
  onOpenLogDowntime: () => void;
}

export const DowntimeView: React.FC<DowntimeViewProps> = ({ onOpenLogDowntime }) => {
  const {
    downtimes,
    downtimeCategories,
    machines,
    departments,
    selectedDepartmentId,
    resolveDowntime,
    triggerHaptic,
  } = useApp();

  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');

  const filteredDowntimes = downtimes.filter(
    (d) => selectedDepartmentId === 'all' || d.departmentId === selectedDepartmentId
  );

  const activeStoppages = filteredDowntimes.filter((d) => !d.isResolved);
  const resolvedStoppages = filteredDowntimes.filter((d) => d.isResolved);
  const totalDowntimeMinutes = filteredDowntimes.reduce((sum, d) => sum + d.durationMinutes, 0);

  // Group summary
  const groupTotals: Record<string, number> = {
    Unplanned: 0,
    Planned: 0,
    Mold: 0,
    Material: 0,
    Quality: 0,
  };

  filteredDowntimes.forEach((d) => {
    const cat = downtimeCategories.find((c) => c.code === d.categoryCode);
    const grp = cat?.group || 'Unplanned';
    if (groupTotals[grp] !== undefined) {
      groupTotals[grp] += d.durationMinutes;
    } else {
      groupTotals.Unplanned += d.durationMinutes;
    }
  });

  const handleResolve = (downtimeId: string) => {
    triggerHaptic();
    resolveDowntime(downtimeId, resolutionNote || 'Technician resolved issue on shopfloor');
    setResolvingId(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-amber-400" />
            Downtime & Stoppages
          </h1>
          <p className="text-xs text-slate-400">Machine stoppage root cause & recovery tracking</p>
        </div>

        <button
          onClick={() => {
            triggerHaptic();
            onOpenLogDowntime();
          }}
          className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Stoppage</span>
        </button>
      </div>

      {/* High-Level Metric Tiles */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Total Stoppage</div>
          <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">{totalDowntimeMinutes} min</div>
          <div className="text-[10px] text-slate-500 mt-1">Shift Downtime</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Active Stoppages</div>
          <div className={`text-lg font-bold font-mono mt-0.5 ${activeStoppages.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {activeStoppages.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {activeStoppages.length > 0 ? 'Urgent Action' : 'All Clear'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Unplanned</div>
          <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">{groupTotals.Unplanned} min</div>
          <div className="text-[10px] text-slate-500 mt-1">Breakdown loss</div>
        </div>
      </div>

      {/* 1. Active Stoppages Live Action Cards */}
      {activeStoppages.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 px-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Live Machine Stoppages Requiring Resolution ({activeStoppages.length})
          </div>

          {activeStoppages.map((item) => {
            const mach = machines.find((m) => m.id === item.machineId);
            const dept = departments.find((d) => d.id === item.departmentId);
            const isEditing = resolvingId === item.id;

            return (
              <div
                key={item.id}
                className="p-3.5 bg-rose-950/30 border border-rose-800/80 rounded-2xl space-y-2.5 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{mach?.code} - {item.categoryName}</span>
                    </div>
                    <div className="text-xs text-rose-300/80 mt-0.5">
                      {mach?.name} ({dept?.name}) • Code: {item.categoryCode}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-900/80 text-rose-200 border border-rose-700 font-mono font-bold">
                      {item.durationMinutes} mins
                    </span>
                  </div>
                </div>

                {isEditing ? (
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700 space-y-2">
                    <label className="text-[11px] text-slate-300 font-semibold block">
                      Technician Resolution & Action Taken:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cleared stuck runner, replaced thermocouple wire..."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setResolvingId(null)}
                        className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleResolve(item.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 active:scale-95"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Confirm Machine Ready
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center pt-1 border-t border-rose-900/40">
                    <span className="text-[11px] text-rose-400/80">Started: {item.startTime || '06:30'}</span>
                    <button
                      onClick={() => {
                        triggerHaptic();
                        setResolvingId(item.id);
                        setResolutionNote('');
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1 active:scale-95 shadow-sm"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Resolve & Resume
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Downtime Root Cause Categorization Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
          Stoppage Cause Distribution (Minutes)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {Object.entries(groupTotals).map(([grp, mins]) => (
            <div key={grp} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{grp}</span>
              <span className="text-sm font-bold text-white font-mono mt-0.5">{mins}m</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Resolved Stoppages History */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Resolved Shift Downtime Records ({resolvedStoppages.length})
        </div>

        <div className="space-y-2">
          {resolvedStoppages.map((item) => {
            const mach = machines.find((m) => m.id === item.machineId);
            return (
              <div key={item.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200">
                    {mach?.code} • {item.categoryName}
                  </div>
                  <span className="font-mono font-bold text-amber-400">{item.durationMinutes} min</span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Code: {item.categoryCode}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Resolved
                  </span>
                </div>
                {item.actionTaken && (
                  <div className="text-[11px] text-slate-400 bg-slate-950 p-1.5 rounded-lg mt-1">
                    <span className="text-slate-500">Action:</span> {item.actionTaken}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
