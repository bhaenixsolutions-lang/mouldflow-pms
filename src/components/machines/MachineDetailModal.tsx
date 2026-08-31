import React, { useState } from 'react';
import {
  X,
  Cpu,
  User,
  ShieldCheck,
  Building,
  Clock,
  Package,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
  Wrench,
  RotateCcw,
  Award,
  ShieldAlert,
} from 'lucide-react';
import { MachineLiveMetric } from '../../utils/monitoringCalculations';
import { useApp } from '../../context/AppContext';

interface MachineDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: MachineLiveMetric | null;
  onOpenHourlyEntry?: (reportId?: string, hourIndex?: number) => void;
  onOpenLogRejection?: () => void;
  onOpenLogDowntime?: () => void;
}

export const MachineDetailModal: React.FC<MachineDetailModalProps> = ({
  isOpen,
  onClose,
  metric,
  onOpenHourlyEntry,
  onOpenLogRejection,
  onOpenLogDowntime,
}) => {
  const { rejections, downtimes, updateMachineStatus, triggerHaptic, isOperatorQualifiedForMachine } = useApp();
  const [activeTab, setActiveTab] = useState<'hourly' | 'defects' | 'downtime' | 'history'>('hourly');

  if (!isOpen || !metric) return null;

  const {
    machine,
    product,
    operator,
    supervisor,
    department,
    shift,
    report,
    currentHour,
    targetQty,
    actualQty,
    achievementPct,
    rejectionQty,
    rejectionPct,
    downtimeMinutes,
    availabilityPct,
    performancePct,
    qualityPct,
    oeePct,
    isReportMissing,
    liveColor,
    statusLabel,
    statusReason,
    hourlyTrend,
  } = metric;

  // Filter rejections and downtimes for this machine
  const machineRejections = rejections.filter((r) => r.machineId === machine.id);
  const machineDowntimes = downtimes.filter((d) => d.machineId === machine.id);

  // Check operator qualification for this machine
  const operatorQual = operator ? isOperatorQualifiedForMachine(operator.id, machine.id) : null;

  const colorStyles = {
    green: {
      badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
      dot: 'bg-emerald-400',
      border: 'border-emerald-500/40',
      headerBg: 'from-emerald-950/40 via-slate-900 to-slate-900',
    },
    orange: {
      badge: 'bg-amber-950/80 text-amber-300 border-amber-700',
      dot: 'bg-amber-400',
      border: 'border-amber-500/40',
      headerBg: 'from-amber-950/40 via-slate-900 to-slate-900',
    },
    red: {
      badge: 'bg-rose-950/80 text-rose-300 border-rose-700',
      dot: 'bg-rose-500 animate-ping',
      border: 'border-rose-500/40',
      headerBg: 'from-rose-950/40 via-slate-900 to-slate-900',
    },
    grey: {
      badge: 'bg-slate-800 text-slate-300 border-slate-700',
      dot: 'bg-slate-500',
      border: 'border-slate-800',
      headerBg: 'from-slate-900 via-slate-900 to-slate-900',
    },
  }[liveColor];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className={`relative w-full max-w-xl bg-slate-900 border ${colorStyles.border} rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col`}>
        
        {/* Modal Top Header */}
        <div className={`p-4 bg-gradient-to-r ${colorStyles.headerBg} border-b border-slate-800 flex items-start justify-between gap-3 shrink-0`}>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${colorStyles.dot}`} />
              <h2 className="text-lg font-black text-white font-mono">{machine.code}</h2>
              <span className="text-xs text-slate-300 font-semibold">{machine.name}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{department?.name || 'Moulding'}</span>
              <span>•</span>
              <span>{machine.maker || 'Injection Press'}</span>
              {machine.tonnage > 0 && <span>• {machine.tonnage}T Clamping</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${colorStyles.badge}`}>
              {statusLabel}
            </span>
            <button
              onClick={() => {
                triggerHaptic();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Missing Report Banner */}
        {isReportMissing && (
          <div className="p-3 bg-rose-950/90 border-b border-rose-800 flex items-center justify-between gap-2 text-xs text-rose-200 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
              <div>
                <strong className="text-rose-100 uppercase tracking-wider block">HOURLY REPORT MISSING</strong>
                <span className="text-[11px] text-rose-300">No shift log uploaded for this active station.</span>
              </div>
            </div>
            {onOpenHourlyEntry && (
              <button
                onClick={() => {
                  triggerHaptic();
                  onClose();
                  onOpenHourlyEntry(report?.id, currentHour);
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[11px] shrink-0"
              >
                Log Now
              </button>
            )}
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">

          {/* Operational Context Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <Package className="w-3 h-3 text-blue-400" /> Current Product
              </span>
              <strong className="text-slate-100 font-mono text-[11px] block truncate">
                {product?.sku || 'None'}
              </strong>
              <span className="text-[10px] text-slate-400 truncate block">{product?.name || 'Unassigned'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <User className="w-3 h-3 text-emerald-400" /> Operator
              </span>
              <strong className="text-slate-100 text-[11px] block truncate">
                {operator?.name || 'Unassigned'}
              </strong>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-slate-400 font-mono">{operator?.employeeCode || '-'}</span>
                {operatorQual && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      operatorQual.qualified
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {operatorQual.qualified ? 'Certified' : 'Unqualified'}
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-400" /> Supervisor
              </span>
              <strong className="text-slate-100 text-[11px] block truncate">
                {supervisor?.name || 'Vikramaditya Rao'}
              </strong>
              <span className="text-[10px] text-slate-400 font-mono">{shift.code} (06:00-14:00)</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> Current Hour
              </span>
              <strong className="text-slate-100 text-[11px] block font-mono">
                Hour {currentHour} of 8
              </strong>
              <span className="text-[10px] text-emerald-400 font-mono">{machine.targetPerHour} pcs/hr</span>
            </div>
          </div>

          {/* OEE & Key Indicators KPI Card */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-400" /> Overall Equipment Effectiveness (OEE)
              </span>
              <span className="font-mono text-base font-black text-blue-400">{oeePct}%</span>
            </div>

            {/* OEE Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  oeePct >= 85 ? 'bg-emerald-500' : oeePct >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, oeePct))}%` }}
              />
            </div>

            {/* 3 Pillars: Availability, Performance, Quality */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-850 text-center">
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Availability</span>
                <span className="text-sm font-bold font-mono text-white">{availabilityPct}%</span>
                <span className="text-[9px] text-slate-500 block">{downtimeMinutes}m lost</span>
              </div>
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Performance</span>
                <span className="text-sm font-bold font-mono text-white">{performancePct}%</span>
                <span className="text-[9px] text-slate-500 block">{actualQty} / {targetQty} pcs</span>
              </div>
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Quality</span>
                <span className="text-sm font-bold font-mono text-white">{qualityPct}%</span>
                <span className="text-[9px] text-rose-400 font-mono block">{rejectionPct}% scrap</span>
              </div>
            </div>
          </div>

          {/* Production Numbers Summary */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Target Qty</span>
              <span className="font-bold text-white font-mono text-sm">{targetQty.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">Planned</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Actual Produced</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">{actualQty.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-500/90 font-mono block">{achievementPct}% achieved</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Rejection Qty</span>
              <span className="font-bold text-rose-400 font-mono text-sm">{rejectionQty}</span>
              <span className="text-[10px] text-rose-500/90 font-mono block">{rejectionPct}% scrap rate</span>
            </div>
          </div>

          {/* Sub-Tabs for Drilldown */}
          <div className="flex border-b border-slate-800 text-xs gap-1">
            {[
              { id: 'hourly', label: 'Hourly Log Trend', count: hourlyTrend.length },
              { id: 'defects', label: 'Rejection Log', count: machineRejections.length },
              { id: 'downtime', label: 'Downtimes', count: machineDowntimes.length },
              { id: 'history', label: 'Day History', count: null },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  triggerHaptic();
                  setActiveTab(t.id as any);
                }}
                className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === t.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
                {t.count !== null && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content: Hourly Trend */}
          {activeTab === 'hourly' && (
            <div className="space-y-2">
              {hourlyTrend.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800">
                  No hourly entries uploaded yet for this machine shift.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {hourlyTrend.map((h) => (
                    <div
                      key={h.hour}
                      className="p-2.5 bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-white">Hr {h.hour}</span>
                          <span className="text-[11px] text-slate-400">({h.timeSlot})</span>
                        </div>
                        {h.notes && <p className="text-[10px] text-slate-400 italic mt-0.5">{h.notes}</p>}
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <span className="font-mono font-bold text-emerald-400">{h.actual}</span>
                          <span className="text-[10px] text-slate-500 font-mono"> / {h.target}</span>
                        </div>

                        <div className="text-right">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-blue-300">
                            {h.achievePct}%
                          </span>
                          {h.reject > 0 && (
                            <span className="text-[10px] text-rose-400 font-mono block">
                              -{h.reject} rej
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Defects */}
          {activeTab === 'defects' && (
            <div className="space-y-2">
              {machineRejections.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800">
                  Zero critical rejections logged for this machine today.
                </div>
              ) : (
                machineRejections.map((rej) => (
                  <div
                    key={rej.id}
                    className="p-2.5 bg-slate-950/90 rounded-xl border border-rose-900/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                        <Flame className="w-3.5 h-3.5 text-rose-400" />
                        {rej.defectCode}
                      </div>
                      <span className="text-[10px] text-slate-400">{rej.defectName || 'Moulding Defect'}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-rose-400 text-sm">{rej.quantity} pcs</span>
                      <span className="text-[10px] text-slate-500 block">{rej.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab Content: Downtime */}
          {activeTab === 'downtime' && (
            <div className="space-y-2">
              {machineDowntimes.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800">
                  Zero stoppage records logged for this station.
                </div>
              ) : (
                machineDowntimes.map((dt) => (
                  <div
                    key={dt.id}
                    className="p-2.5 bg-slate-950/90 rounded-xl border border-amber-900/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {dt.categoryCode}
                      </div>
                      <span className="text-[10px] text-slate-400">{dt.categoryName || 'Stoppage'}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-400 text-sm">{dt.durationMinutes} mins</span>
                      <span className={`text-[10px] font-bold block ${dt.isResolved ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {dt.isResolved ? 'Resolved' : 'Active Stop'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab Content: History for Selected Day */}
          {activeTab === 'history' && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Day Summary (2026-08-25)
                </span>
                <span className="font-mono text-emerald-400">Shift A Active</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Machine {machine.code} was scheduled for SKU {product?.sku || 'None'}. Shot counter cumulative: {machine.totalShotCount.toLocaleString()} cycles. Hydraulic pressure steady at {machine.hydraulicPressureBar || 140} bar.
              </p>
              <div className="pt-2 border-t border-slate-850 flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Last PM: {machine.lastMaintenanceDate || '2026-08-10'}</span>
                <span>Next Due: {machine.nextMaintenanceDue || '2026-09-10'}</span>
              </div>
            </div>
          )}

          {/* State Controls Quick Bar */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Change State:</span>
            <div className="grid grid-cols-5 gap-1 text-[10px]">
              {(['Running', 'Idle', 'Breakdown', 'Setup', 'Maintenance'] as const).map((st) => (
                <button
                  key={st}
                  disabled={machine.status === st}
                  onClick={() => {
                    triggerHaptic();
                    updateMachineStatus(machine.id, st);
                  }}
                  className={`py-1.5 rounded font-bold transition-all ${
                    machine.status === st
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
          {onOpenLogDowntime && (
            <button
              onClick={() => {
                triggerHaptic();
                onClose();
                onOpenLogDowntime();
              }}
              className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-amber-300 font-semibold rounded-xl text-xs border border-slate-700 flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" /> Log Stoppage
            </button>
          )}

          {onOpenLogRejection && (
            <button
              onClick={() => {
                triggerHaptic();
                onClose();
                onOpenLogRejection();
              }}
              className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-rose-300 font-semibold rounded-xl text-xs border border-slate-700 flex items-center gap-1"
            >
              <Flame className="w-3.5 h-3.5" /> Log Scrap
            </button>
          )}

          {onOpenHourlyEntry && (
            <button
              onClick={() => {
                triggerHaptic();
                onClose();
                onOpenHourlyEntry(report?.id, currentHour);
              }}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
            >
              <Layers className="w-3.5 h-3.5" /> Hourly Entry
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
