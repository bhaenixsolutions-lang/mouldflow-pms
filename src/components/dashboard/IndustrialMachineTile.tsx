import React from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Machine, ProductMould } from '../../types/schema';

export interface MachineTelemetrySpec {
  target: number;
  actual: number;
  achPct: string;
  rejects: number;
  rejPct: string;
  oeePct: string;
  cycleTime: number;
  downtimeMin: number;
  stoppages: number;
  lastUpdated: string;
}

interface IndustrialMachineTileProps {
  machine: Machine;
  product?: ProductMould;
  spec: MachineTelemetrySpec;
  onClick: () => void;
}

export const IndustrialMachineTile: React.FC<IndustrialMachineTileProps> = ({
  machine,
  product,
  spec,
  onClick,
}) => {
  const status = machine.status;
  const achNum = parseFloat(spec.achPct.replace('%', '')) || 0;
  const oeeNum = parseFloat(spec.oeePct.replace('%', '')) || 0;

  // Status visual themes inspired by industrial factory monitoring boards
  const getStatusTheme = () => {
    switch (status) {
      case 'Running':
        return {
          cardBorder: 'border-emerald-500/50 hover:border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.12)]',
          headerBg: 'bg-emerald-950/40 border-emerald-800/60',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
          dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
          glow: 'from-emerald-950/20 to-transparent',
          codeText: 'text-emerald-300',
          progressBar: 'bg-emerald-500',
          achBadge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80',
          statusText: 'RUNNING',
        };
      case 'Idle':
        return {
          cardBorder: 'border-amber-500/50 hover:border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.12)]',
          headerBg: 'bg-amber-950/40 border-amber-800/60',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
          glow: 'from-amber-950/20 to-transparent',
          codeText: 'text-amber-300',
          progressBar: 'bg-amber-500',
          achBadge: 'bg-amber-950/80 text-amber-300 border-amber-700/80',
          statusText: 'IDLE',
        };
      case 'Breakdown':
        return {
          cardBorder: 'border-rose-500 hover:border-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.25)] ring-1 ring-rose-500/30',
          headerBg: 'bg-rose-950/60 border-rose-700/80',
          badgeBg: 'bg-rose-600/30 text-rose-200 border-rose-500/80 animate-pulse',
          dot: 'bg-rose-500 animate-ping shadow-[0_0_10px_#f43f5e]',
          glow: 'from-rose-950/30 to-transparent',
          codeText: 'text-rose-300',
          progressBar: 'bg-rose-500',
          achBadge: 'bg-rose-950/80 text-rose-300 border-rose-700/80',
          statusText: 'BREAKDOWN',
        };
      case 'Setup':
        return {
          cardBorder: 'border-blue-500/50 hover:border-blue-400 shadow-[0_0_18px_rgba(59,130,246,0.12)]',
          headerBg: 'bg-blue-950/40 border-blue-800/60',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
          dot: 'bg-blue-400 shadow-[0_0_8px_#60a5fa]',
          glow: 'from-blue-950/20 to-transparent',
          codeText: 'text-blue-300',
          progressBar: 'bg-blue-500',
          achBadge: 'bg-blue-950/80 text-blue-300 border-blue-700/80',
          statusText: 'SETUP',
        };
      case 'Maintenance':
        return {
          cardBorder: 'border-purple-500/50 hover:border-purple-400 shadow-[0_0_18px_rgba(168,85,247,0.12)]',
          headerBg: 'bg-purple-950/40 border-purple-800/60',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
          dot: 'bg-purple-400 shadow-[0_0_8px_#c084fc]',
          glow: 'from-purple-950/20 to-transparent',
          codeText: 'text-purple-300',
          progressBar: 'bg-purple-500',
          achBadge: 'bg-purple-950/80 text-purple-300 border-purple-700/80',
          statusText: 'MAINTENANCE',
        };
      default:
        return {
          cardBorder: 'border-slate-800 hover:border-slate-700',
          headerBg: 'bg-slate-900 border-slate-800',
          badgeBg: 'bg-slate-800 text-slate-400 border-slate-700',
          dot: 'bg-slate-500',
          glow: 'from-slate-900/20 to-transparent',
          codeText: 'text-slate-300',
          progressBar: 'bg-slate-600',
          achBadge: 'bg-slate-900 text-slate-400 border-slate-800',
          statusText: 'OFFLINE',
        };
    }
  };

  const theme = getStatusTheme();
  const progressWidth = Math.min(100, Math.max(0, achNum));

  return (
    <div
      id={`machine-tile-${machine.code}`}
      onClick={onClick}
      className={`relative group bg-[#090f1d] border ${theme.cardBorder} rounded-xl p-3 sm:p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl active:scale-[0.98] flex flex-col justify-between overflow-hidden`}
    >
      {/* Background Ambient Glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${theme.glow} rounded-full blur-2xl pointer-events-none`} />

      {/* TOP HEADER: STATUS & MACHINE NUMBER */}
      <div>
        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/80">
          {/* Status Badge */}
          <div className="flex flex-col items-start gap-1">
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border ${theme.badgeBg}`}>
              <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
              <span>{theme.statusText}</span>
            </div>
            {/* Machine maker / Sub-name */}
            <span className="text-[11px] text-slate-400 font-medium truncate max-w-[130px] sm:max-w-[150px]">
              {machine.name}
            </span>
          </div>

          {/* Machine Code (HIGHLY VISIBLE) */}
          <div className="text-right">
            <div className="font-mono font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center justify-end gap-1 group-hover:text-blue-300 transition-colors">
              <span>{machine.code}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            {machine.tonnage > 0 && (
              <span className="text-[10px] font-mono text-slate-400">
                {machine.tonnage}T
              </span>
            )}
          </div>
        </div>

        {/* PRODUCTION & TARGET HERO SECTION */}
        <div className="py-2.5 my-0.5">
          <div className="flex items-baseline justify-between gap-1">
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
              {spec.actual.toLocaleString()}{' '}
              <span className="text-xs sm:text-sm font-normal text-slate-400">
                / {spec.target.toLocaleString()} pcs
              </span>
            </div>
            <div
              className={`font-mono text-xs sm:text-sm font-bold px-1.5 py-0.5 rounded ${
                achNum >= 90
                  ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50'
                  : achNum > 0
                  ? 'text-amber-400 bg-amber-950/60 border border-amber-800/50'
                  : 'text-slate-400 bg-slate-900 border border-slate-800'
              }`}
            >
              {spec.achPct}
            </div>
          </div>

          {/* Achievement Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800/90 rounded-full mt-2 overflow-hidden flex">
            <div
              className={`h-full ${theme.progressBar} rounded-full transition-all duration-500`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>
      </div>

      {/* TELEMETRY METRICS GRID */}
      <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
        {/* Part Name */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] text-slate-400">Part</span>
          <span className="font-semibold text-slate-100 truncate max-w-[140px] text-right" title={product?.name || 'Component'}>
            {product ? product.name : 'Component'}
          </span>
        </div>

        {/* OEE & Cycle Time */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] text-slate-400">OEE / Cycle</span>
          <div className="font-mono text-[11px] font-semibold text-right">
            <span className={oeeNum >= 90 ? 'text-blue-400 font-bold' : oeeNum > 0 ? 'text-amber-400' : 'text-slate-500'}>
              {spec.oeePct}
            </span>
            <span className="text-slate-500 mx-1">•</span>
            <span className="text-slate-300">
              {spec.cycleTime > 0 ? `${spec.cycleTime.toFixed(1)}s` : '-'}
            </span>
          </div>
        </div>

        {/* Reject & Downtime */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] text-slate-400">Reject / DT</span>
          <div className="font-mono text-[11px] font-semibold text-right">
            <span className={spec.rejects > 0 ? 'text-rose-300' : 'text-slate-400'}>
              {spec.rejects} pcs {spec.rejPct !== '0.00%' ? `(${spec.rejPct})` : ''}
            </span>
            <span className="text-slate-500 mx-1">•</span>
            <span className={spec.downtimeMin > 0 ? 'text-amber-300' : 'text-slate-400'}>
              {spec.downtimeMin}m DT
            </span>
          </div>
        </div>

        {/* Stoppage Count & Last Sync */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/40">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Stops:</span>
            <span
              className={`px-1.5 py-0.2 rounded font-mono font-bold ${
                spec.stoppages > 0 ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60' : 'text-slate-400'
              }`}
            >
              {spec.stoppages}
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{spec.lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
