import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ArrowRight,
  Cpu,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface PPCReplanBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBrokenMachineCode?: string;
}

export const PPCReplanBreakdownModal: React.FC<PPCReplanBreakdownModalProps> = ({
  isOpen,
  onClose,
  defaultBrokenMachineCode = 'IM-04',
}) => {
  const {
    machines,
    productionPlans,
    replanForMachineBreakdown,
    triggerHaptic,
  } = useApp();

  const [brokenMachineCode, setBrokenMachineCode] = useState(defaultBrokenMachineCode);
  const [alternateMachineId, setAlternateMachineId] = useState(machines[1]?.id || '');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const impactedPlans = productionPlans.filter(
    (p) => p.machineCode === brokenMachineCode && (p.status === 'RUNNING' || p.status === 'PLANNED' || p.status === 'DELAYED')
  );

  const brokenMach = machines.find((m) => m.code === brokenMachineCode);
  const targetMach = machines.find((m) => m.id === alternateMachineId);

  const handleExecuteReplan = () => {
    if (!targetMach) return;
    setIsSimulating(true);
    triggerHaptic();

    setTimeout(() => {
      replanForMachineBreakdown(brokenMachineCode, targetMach.id);
      setIsSimulating(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-rose-800/60 rounded-2xl w-full max-w-lg shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-rose-950/40 border-b border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Machine Breakdown Re-Planning</h2>
              <p className="text-[11px] text-rose-300/80">
                1-Click Dynamic Re-Routing & Load Balancing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Breakdown Selection */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-semibold">1. Broken / Down Machine</label>
            <select
              value={brokenMachineCode}
              onChange={(e) => setBrokenMachineCode(e.target.value)}
              className="w-full bg-slate-950 border border-rose-900/60 rounded-xl px-3 py-2 text-rose-300 font-semibold focus:outline-hidden"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.code}>
                  {m.code} - {m.name} ({m.tonnage}T, Status: {m.status})
                </option>
              ))}
            </select>
          </div>

          {/* Impacted Plans Notice */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Impacted Production Plans:</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-600/20 text-rose-300 font-bold font-mono">
                {impactedPlans.length} active plans
              </span>
            </div>
            {impactedPlans.length > 0 ? (
              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                {impactedPlans.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-[11px] bg-slate-900 p-1.5 rounded-lg border border-slate-800"
                  >
                    <span className="font-medium text-slate-200 truncate max-w-[200px]">{p.componentName}</span>
                    <span className="font-mono text-cyan-400">{p.plannedQuantity.toLocaleString()} pcs</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 italic text-[11px]">No active plans currently on this machine.</div>
            )}
          </div>

          {/* Destination Machine Selection */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-semibold">2. Target Alternate Machine (Compatible Tonnage)</label>
            <select
              value={alternateMachineId}
              onChange={(e) => setAlternateMachineId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-semibold focus:outline-hidden"
            >
              {machines
                .filter((m) => m.code !== brokenMachineCode)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.name} ({m.tonnage}T, {m.status})
                  </option>
                ))}
            </select>
          </div>

          {/* Re-Routing Transfer Visualization */}
          <div className="bg-gradient-to-r from-rose-950/30 via-slate-900 to-cyan-950/30 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-center">
            <div className="flex-1">
              <div className="text-[10px] text-slate-400">Source</div>
              <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">{brokenMachineCode}</div>
              <div className="text-[10px] text-slate-400">{brokenMach?.tonnage || 180}T</div>
            </div>
            <div className="px-3">
              <ArrowRight className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-slate-400">Target</div>
              <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{targetMach?.code || 'IM-02'}</div>
              <div className="text-[10px] text-slate-400">{targetMach?.tonnage || 180}T</div>
            </div>
          </div>

          {isSuccess && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Plans successfully re-routed and cycle times re-calculated!</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteReplan}
              disabled={impactedPlans.length === 0 || isSimulating}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              {isSimulating ? 'Re-Scheduling...' : 'Re-Route & Recalculate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
