import React, { useState } from 'react';
import { RotateCcw, Database, ShieldCheck, CheckCircle, Info, Sparkles, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminView: React.FC = () => {
  const { resetAllData, triggerHaptic } = useApp();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    triggerHaptic();
    resetAllData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <RotateCcw className="w-5 h-5 text-rose-400" />
            System Administration & Data Engine
          </h1>
          <p className="text-xs text-slate-400">Database architecture, schema integrity & factory initialization</p>
        </div>

        <span className="px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-800 rounded-lg text-xs font-mono font-bold">
          Admin Gate
        </span>
      </div>

      {/* System Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <h2 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
          Plant Architecture Status
        </h2>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Persistence Engine</span>
            <span className="font-bold text-emerald-400 font-mono mt-0.5">Local Vault + Sync</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">AI Vision Engine</span>
            <span className="font-bold text-amber-300 font-mono mt-0.5">Gemini 3.7 Flash</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Active RBAC Roles</span>
            <span className="font-bold text-white font-mono mt-0.5">7 Dedicated Roles</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Plant Departments</span>
            <span className="font-bold text-white font-mono mt-0.5">5 Specialized Formats</span>
          </div>
        </div>
      </div>

      {/* Database Factory Reset Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-xs font-bold uppercase text-rose-300 tracking-wider">
            Re-Initialize Factory Demo Dataset
          </h2>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Restore all 18 modules (Machines, Products, Hourly Reports, Rejections, Downtimes, PPC Monthly Plans, Inventory, and Staff) to calibrated injection moulding plant baseline records.
        </p>

        {resetSuccess && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Factory database successfully reloaded with injection moulding plant data!</span>
          </div>
        )}

        <button
          onClick={handleReset}
          className="w-full py-3 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition-transform"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Factory Data to Calibrated Baseline
        </button>
      </div>
    </div>
  );
};
