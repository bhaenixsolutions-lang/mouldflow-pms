import React, { useState } from 'react';
import {
  Sliders,
  Clock,
  Zap,
  Save,
  CheckCircle2,
  Cpu,
  Layers,
  Info,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const PPCCapacitySettingsTab: React.FC = () => {
  const { ppcCapacitySettings, updatePPCCapacitySettings, machines, triggerHaptic } = useApp();

  const [shiftHours, setShiftHours] = useState(ppcCapacitySettings.shiftDurationHours || 8);
  const [shiftsPerDay, setShiftsPerDay] = useState(ppcCapacitySettings.shiftsPerDay || 3);
  const [workingDays, setWorkingDays] = useState(ppcCapacitySettings.workingDaysPerMonth || 26);
  const [efficiencyPct, setEfficiencyPct] = useState(ppcCapacitySettings.defaultEfficiencyPct || 85);
  const [scrapRatePct, setScrapRatePct] = useState(ppcCapacitySettings.defaultScrapRatePct || 1.5);
  const [changeoverMins, setChangeoverMins] = useState(ppcCapacitySettings.defaultChangeoverTimeMins || 45);
  const [maintenanceBufferPct, setMaintenanceBufferPct] = useState(ppcCapacitySettings.plannedMaintenanceBufferPct || 5);
  const [isSaved, setIsSaved] = useState(false);

  // Theoretical vs Practical Calculations
  const totalPlantHoursPerMonth = machines.length * shiftsPerDay * shiftHours * workingDays;
  const netOperatingHours = totalPlantHoursPerMonth * (1 - maintenanceBufferPct / 100) * (efficiencyPct / 100);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePPCCapacitySettings({
      ...ppcCapacitySettings,
      shiftDurationHours: shiftHours,
      shiftsPerDay,
      workingDaysPerMonth: workingDays,
      defaultEfficiencyPct: efficiencyPct,
      defaultScrapRatePct: scrapRatePct,
      defaultChangeoverTimeMins: changeoverMins,
      plannedMaintenanceBufferPct: maintenanceBufferPct,
    });
    setIsSaved(true);
    triggerHaptic();
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            PPC Plant Capacity & Shift Planning Rules
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure default efficiency parameters, shift structures and changeover allowances
          </p>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 active:scale-95 transition-all self-start sm:self-center"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {isSaved && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-xl flex items-center gap-2 text-emerald-300 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Plant capacity settings updated and persisted successfully!</span>
        </div>
      )}

      {/* Grid Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Shift Configuration */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-800 pb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Shift Structure & Operating Days
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1">Shift Duration (Hours)</label>
              <input
                type="number"
                min="4"
                max="12"
                value={shiftHours}
                onChange={(e) => setShiftHours(parseInt(e.target.value) || 8)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Shifts per Day</label>
              <input
                type="number"
                min="1"
                max="3"
                value={shiftsPerDay}
                onChange={(e) => setShiftsPerDay(parseInt(e.target.value) || 3)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Working Days per Month</label>
              <input
                type="number"
                min="20"
                max="31"
                value={workingDays}
                onChange={(e) => setWorkingDays(parseInt(e.target.value) || 26)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Efficiency & Scrap Allowances */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-800 pb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Standard Efficiency & Scrap Allowances
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1">Default Planning Efficiency / OEE (%)</label>
              <input
                type="number"
                min="50"
                max="100"
                value={efficiencyPct}
                onChange={(e) => setEfficiencyPct(parseInt(e.target.value) || 85)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Default Scrap Allowance Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={scrapRatePct}
                onChange={(e) => setScrapRatePct(parseFloat(e.target.value) || 1.5)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Mould Changeover Allowance (Mins)</label>
              <input
                type="number"
                min="15"
                max="180"
                value={changeoverMins}
                onChange={(e) => setChangeoverMins(parseInt(e.target.value) || 45)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calculated Total Plant Capacity Summary */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          Plant Available Capacity (Monthly Summary)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[10px]">Active Machines</div>
            <div className="text-base font-bold text-white mt-1">{machines.length} IMMs</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[10px]">Theoretical Hours</div>
            <div className="text-base font-bold text-blue-400 mt-1">{totalPlantHoursPerMonth.toLocaleString()} hrs</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[10px]">Net Effective Hours</div>
            <div className="text-base font-bold text-emerald-400 mt-1">{Math.round(netOperatingHours).toLocaleString()} hrs</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[10px]">Plant Planning OEE</div>
            <div className="text-base font-bold text-cyan-400 mt-1">{efficiencyPct}%</div>
          </div>
        </div>
      </div>
    </form>
  );
};
