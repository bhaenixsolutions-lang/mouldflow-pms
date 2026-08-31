import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getDefectTroubleshootingAdvice } from '../../services/geminiService';
import { AIRecommendation } from '../../types/schema';

interface AIAdvisorViewProps {
  initialDefectCode?: string;
}

export const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({ initialDefectCode }) => {
  const { defects, machines, products, departments, triggerHaptic } = useApp();

  const [selectedDefectCode, setSelectedDefectCode] = useState<string>(
    initialDefectCode || defects[0]?.code || 'DEF-SHORT-SHOT'
  );
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || '');
  const [polymerMaterial, setPolymerMaterial] = useState<string>('PBT-GF30 (Glass Filled Polybutylene)');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [advisory, setAdvisory] = useState<AIRecommendation | null>({
    id: 'ai-rec-init',
    department: 'Moulding',
    machineCode: 'IMM-01',
    defectTrigger: 'DEF-SHORT-SHOT',
    title: 'Short Shot Mitigation on IMM-01 (PBT-GF30)',
    severity: 'Medium',
    analysis:
      'High glass fiber concentration (30%) creates rapid freezing at thin wall sections. Volumetric switchover occurs before complete cavity packing, resulting in incomplete fill.',
    parameterAdjustments: [
      {
        parameter: 'Holding Pressure Stage 1',
        currentValue: '75 Bar',
        suggestedValue: '88 Bar (+13 Bar)',
        reason: 'Pack thin rib sections to prevent early freeze-off',
      },
      {
        parameter: 'VP Transfer Position',
        currentValue: '12.0 mm',
        suggestedValue: '13.8 mm',
        reason: 'Transfer closer to 95% volumetric fill',
      },
      {
        parameter: 'Barrel Zone 3 & Nozzle Temp',
        currentValue: '242 °C',
        suggestedValue: '248 °C (+6 °C)',
        reason: 'Lower melt viscosity to assist flow into distant ribs',
      },
      {
        parameter: 'Mold Core Water Temp',
        currentValue: '65 °C',
        suggestedValue: '72 °C (+7 °C)',
        reason: 'Delay skin layer freeze during high speed injection phase',
      },
    ],
    preventiveAction:
      'Clean mold parting line gas vents (0.025 mm vent depth) to avoid trapped air backpressure.',
    timestamp: new Date().toISOString().substring(0, 16),
  });

  const selectedDefect = defects.find((d) => d.code === selectedDefectCode) || defects[0];
  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  const handleRunAdvisory = async () => {
    setIsLoading(true);
    triggerHaptic();

    try {
      const rec = await getDefectTroubleshootingAdvice({
        defectName: selectedDefect.name,
        defectCode: selectedDefect.code,
        department: 'Moulding',
        machineCode: selectedMachine.code,
        polymerMaterial,
        parameters: {
          currentTempC: selectedMachine.nozzleTempC || 240,
          currentCycleSec: selectedMachine.standardCycleTimeSec || 22,
        },
      });
      setAdvisory(rec);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-amber-300" />
            AI Scientific Moulding Advisor
          </h1>
          <p className="text-xs text-slate-400">Gemini-powered process parameter optimization & defect tuning</p>
        </div>

        <span className="px-2.5 py-1 bg-amber-950/80 text-amber-300 border border-amber-800 rounded-lg text-xs font-mono font-bold">
          Gemini 3.7
        </span>
      </div>

      {/* 1. Interactive Troubleshooting Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <h2 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
          Select Shopfloor Defect to Troubleshoot
        </h2>

        <div className="space-y-2.5 text-xs">
          {/* Defect Picker */}
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Moulding Defect Encountered:</label>
            <select
              value={selectedDefectCode}
              onChange={(e) => setSelectedDefectCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            >
              {defects.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.category}) - {d.code}
                </option>
              ))}
            </select>
          </div>

          {/* Machine & Resin */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Target Machine:</label>
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} ({m.tonnage > 0 ? `${m.tonnage}T` : 'Line'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Polymer Resin Grade:</label>
              <input
                type="text"
                value={polymerMaterial}
                onChange={(e) => setPolymerMaterial(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white font-mono text-[11px]"
              />
            </div>
          </div>

          <button
            onClick={handleRunAdvisory}
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Consulting Gemini AI...' : 'Generate Process Tuning Recommendations'}</span>
          </button>
        </div>
      </div>

      {/* 2. Advisory Output Card */}
      {advisory && (
        <div className="bg-slate-900 border border-amber-900/50 rounded-2xl p-4 space-y-3.5 shadow-xl">
          {/* Advisory Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{advisory.title}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                {advisory.machineCode} • {advisory.department} ({advisory.timestamp})
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-700 font-bold">
              Severity: {advisory.severity}
            </span>
          </div>

          {/* Root Cause Physics Analysis */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-300 block">
              Physical Root Cause Analysis:
            </span>
            <p className="text-slate-300 leading-relaxed">{advisory.analysis}</p>
          </div>

          {/* Scientific Parameter Adjustments Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-slate-300 tracking-wider block">
              Recommended Parameter Adjustments:
            </span>

            <div className="space-y-2">
              {advisory.parameterAdjustments.map((adj, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{adj.parameter}</span>
                    <span className="font-mono font-bold text-emerald-400">{adj.suggestedValue}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span>Current: {adj.currentValue}</span>
                  </div>

                  <div className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800/80">
                    <span className="text-slate-500">Why: </span>
                    {adj.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preventive Action */}
          {advisory.preventiveAction && (
            <div className="p-3 bg-blue-950/30 border border-blue-800/60 rounded-xl text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">
                Tooling & Maintenance Preventive Action:
              </span>
              <p className="text-slate-300 leading-relaxed">{advisory.preventiveAction}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
