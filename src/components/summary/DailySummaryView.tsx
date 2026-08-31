import React, { useState } from 'react';
import {
  CheckCircle,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getShiftExecutiveInsights } from '../../services/geminiService';

export const DailySummaryView: React.FC = () => {
  const {
    reports,
    activeShift,
    currentUser,
    updateReportStatus,
    triggerHaptic,
  } = useApp();

  const [aiInsights, setAiInsights] = useState<{
    headline: string;
    keyObservations: string[];
    actionsForNextShift: string[];
  } | null>({
    headline: 'Shift A completed with 94.5% OEE and nominal scrap (1.3%)',
    keyObservations: [
      'IMM-01 achieved highest throughput with 4,980 pcs against 5,200 planned (95.8% efficiency).',
      'Defect scrap was concentrated in Hour 3 due to resin hopper feed interruption (DEF-SHORT-SHOT).',
      'Insert Assembly workcell ASM-01 maintained 100% schedule compliance.',
    ],
    actionsForNextShift: [
      'Top up PBT-GF30 hopper before Shift B start-up and verify nozzle zone 3 heating.',
      'Prepare mold changeover tools for IMM-03 appliance cover at 14:30.',
    ],
  });

  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [closingConfirmed, setClosingConfirmed] = useState<boolean>(false);

  const totalTarget = reports.reduce((sum, r) => sum + r.totalTarget, 0);
  const totalActual = reports.reduce((sum, r) => sum + r.totalActual, 0);
  const totalReject = reports.reduce((sum, r) => sum + r.totalReject, 0);
  const totalDowntime = reports.reduce((sum, r) => sum + r.totalDowntimeMinutes, 0);

  // OEE Multiplier Calculation
  const totalPlannedOperatingTimeMin = 480; // 8 hours
  const actualOperatingTimeMin = Math.max(0, totalPlannedOperatingTimeMin - totalDowntime);
  const availabilityPct = Number(((actualOperatingTimeMin / totalPlannedOperatingTimeMin) * 100).toFixed(1));
  const performancePct = totalTarget > 0 ? Number(((totalActual / totalTarget) * 100).toFixed(1)) : 95.0;
  const qualityPct = totalActual + totalReject > 0 ? Number(((totalActual / (totalActual + totalReject)) * 100).toFixed(1)) : 98.7;
  const overallOee = Number(((availabilityPct * performancePct * qualityPct) / 10000).toFixed(1));

  const handleGenerateAiInsights = async () => {
    setIsAiLoading(true);
    triggerHaptic();
    try {
      const insights = await getShiftExecutiveInsights({
        shift: activeShift.code,
        totalTarget,
        totalActual,
        totalReject,
        totalDowntime,
        overallOee,
      });
      setAiInsights(insights);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSignOffShift = () => {
    triggerHaptic();
    setClosingConfirmed(true);
  };

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Daily Shift Closing & Summary
          </h1>
          <p className="text-xs text-slate-400">Shift handover consolidation & OEE calculations</p>
        </div>

        <span className="px-2.5 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-lg text-xs font-mono font-bold">
          {activeShift.code} Closing
        </span>
      </div>

      {/* 1. Official OEE Factor Cards (A x P x Q = OEE) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
            Overall Equipment Effectiveness (OEE)
          </h2>
          <span className="text-base font-bold text-blue-400 font-mono">{overallOee}% OEE</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Availability</span>
            <span className="text-base font-bold text-emerald-400 font-mono mt-0.5">{availabilityPct}%</span>
            <span className="text-[10px] text-slate-500 block mt-1">{totalDowntime}m Downtime</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Performance</span>
            <span className="text-base font-bold text-blue-400 font-mono mt-0.5">{performancePct}%</span>
            <span className="text-[10px] text-slate-500 block mt-1">{totalActual} pcs Output</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Quality</span>
            <span className="text-base font-bold text-purple-400 font-mono mt-0.5">{qualityPct}%</span>
            <span className="text-[10px] text-slate-500 block mt-1">{totalReject} pcs Scrap</span>
          </div>
        </div>
      </div>

      {/* 2. Gemini AI Shift Insights */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-900/60 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h2 className="text-xs font-bold uppercase text-slate-200 tracking-wider">
              AI Shift Intelligence & Handover
            </h2>
          </div>

          <button
            onClick={handleGenerateAiInsights}
            disabled={isAiLoading}
            className="flex items-center gap-1 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded-lg font-semibold active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>

        {aiInsights && (
          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-indigo-800/40 text-amber-200 font-medium">
              "{aiInsights.headline}"
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Key Observations:</span>
              {aiInsights.keyObservations.map((obs, idx) => (
                <div key={idx} className="text-slate-300 flex items-start gap-1.5 text-[11px]">
                  <span className="text-indigo-400 shrink-0">•</span>
                  <span>{obs}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Next Shift Actions:</span>
              {aiInsights.actionsForNextShift.map((act, idx) => (
                <div key={idx} className="text-slate-300 flex items-start gap-1.5 text-[11px]">
                  <span className="text-emerald-400 shrink-0">→</span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Shift Closing Authorization */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <h2 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
          Shift Closing Sign-Off
        </h2>

        {closingConfirmed ? (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold">Shift A Successfully Closed & Signed</div>
              <div className="text-[11px] text-emerald-400/90 font-mono mt-0.5">
                Authorized by {currentUser.name} ({currentUser.role})
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSignOffShift}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30"
            >
              <ShieldCheck className="w-4 h-4" />
              Sign-Off & Close {activeShift.code}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
