import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  ShieldCheck,
  Zap,
  Filter,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductionReport, HourlyReportEntry } from '../../types/schema';

interface HourlyReportViewProps {
  onOpenNewReportModal: () => void;
  onOpenHourlyEntryModal: (reportId: string, hourIndex?: number) => void;
  onOpenOcr: () => void;
}

export const HourlyReportView: React.FC<HourlyReportViewProps> = ({
  onOpenNewReportModal,
  onOpenHourlyEntryModal,
  onOpenOcr,
}) => {
  const {
    reports,
    machines,
    products,
    departments,
    shifts,
    users,
    selectedDepartmentId,
    currentUser,
    updateReportStatus,
    triggerHaptic,
  } = useApp();

  const [selectedReportId, setSelectedReportId] = useState<string | null>(reports[0]?.id || null);

  const filteredReports = reports.filter(
    (r) => selectedDepartmentId === 'all' || r.departmentId === selectedDepartmentId
  );

  const activeReport = reports.find((r) => r.id === selectedReportId) || filteredReports[0];

  const getMachine = (id: string) => machines.find((m) => m.id === id);
  const getProduct = (id: string) => products.find((p) => p.id === id);
  const getDepartment = (id: string) => departments.find((d) => d.id === id);
  const getShift = (id: string) => shifts.find((s) => s.id === id);
  const getUser = (id: string) => users.find((u) => u.id === id);

  const statusBadgeColor: Record<ProductionReport['status'], string> = {
    Draft: 'bg-slate-700 text-slate-300',
    Submitted: 'bg-blue-600 text-white',
    Verified: 'bg-emerald-600 text-white',
    Approved: 'bg-purple-600 text-white',
    Locked: 'bg-slate-900 text-slate-400 border border-slate-700',
    Rejected: 'bg-rose-600 text-white',
  };

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header with Title and Create / OCR Buttons */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            Hourly Production Logs
          </h1>
          <p className="text-xs text-slate-400">Hour-by-hour shopfloor production sheets</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              triggerHaptic();
              onOpenOcr();
            }}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm active:scale-95 transition-all"
            title="Scan Physical Report with AI OCR"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">OCR</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic();
              onOpenNewReportModal();
            }}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Sheet</span>
          </button>
        </div>
      </div>

      {/* Reports Horizontal Selector Carousel */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filteredReports.map((rep) => {
          const isSelected = activeReport?.id === rep.id;
          const mach = getMachine(rep.machineId);
          const prod = getProduct(rep.productId);

          return (
            <div
              key={rep.id}
              onClick={() => {
                setSelectedReportId(rep.id);
                triggerHaptic();
              }}
              className={`p-3 rounded-xl border shrink-0 w-44 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500 shadow-md'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold text-slate-200">{mach?.code || 'Machine'}</span>
                <span className={`px-1.5 py-0.2 rounded font-semibold text-[9px] ${statusBadgeColor[rep.status]}`}>
                  {rep.status}
                </span>
              </div>
              <div className="text-xs font-semibold text-white truncate">{prod?.sku}</div>
              <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>{rep.totalActual} pcs</span>
                <span className="text-emerald-400">{rep.efficiencyPct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Report Detailed Card */}
      {activeReport ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
          {/* Sheet Header Metadata */}
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white font-mono">{activeReport.reportNumber}</h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadgeColor[activeReport.status]}`}>
                    {activeReport.status}
                  </span>
                  {activeReport.isOcrGenerated && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-900/60 text-purple-300 border border-purple-700 flex items-center gap-1 font-semibold">
                      <Sparkles className="w-2.5 h-2.5" /> OCR
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  <strong>{getProduct(activeReport.productId)?.name}</strong> ({getProduct(activeReport.productId)?.sku})
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-col items-end gap-1">
                {currentUser.role === 'Operator' && activeReport.status === 'Draft' && (
                  <button
                    onClick={() => updateReportStatus(activeReport.id, 'Submitted', 'Ready for Supervisor verification')}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold active:scale-95"
                  >
                    Submit to Supervisor
                  </button>
                )}

                {currentUser.role === 'Supervisor' && (activeReport.status === 'Submitted' || activeReport.status === 'Draft') && (
                  <button
                    onClick={() => updateReportStatus(activeReport.id, 'Verified', 'Shift hours and scrap verified')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-95"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verify Report
                  </button>
                )}

                {currentUser.role === 'Production Manager' && activeReport.status === 'Verified' && (
                  <button
                    onClick={() => updateReportStatus(activeReport.id, 'Approved', 'Manager sign-off completed')}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-95"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Manager Approve
                  </button>
                )}
              </div>
            </div>

            {/* Metadata Tags */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-400 block">Department</span>
                <span className="font-semibold text-slate-200">{getDepartment(activeReport.departmentId)?.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Machine</span>
                <span className="font-semibold text-slate-200">{getMachine(activeReport.machineId)?.code}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Operator</span>
                <span className="font-semibold text-slate-200">{getUser(activeReport.operatorId)?.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Date & Shift</span>
                <span className="font-semibold text-slate-200 font-mono text-[11px]">
                  {activeReport.date} ({getShift(activeReport.shiftId)?.code})
                </span>
              </div>
            </div>

            {/* OCR Uncertainty Alert Banner if report has flagged or missing fields */}
            {(activeReport.uncertainFields?.length > 0 || activeReport.missingFields?.length > 0) && (
              <div className="mt-3 p-2.5 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-300">OCR Review Needed: </span>
                    {activeReport.uncertainFields?.length > 0 && (
                      <span className="font-mono text-[11px]">Flagged: {activeReport.uncertainFields.join(', ')}. </span>
                    )}
                    {activeReport.missingFields?.length > 0 && (
                      <span className="text-slate-300 text-[11px]">Blank on sheet: {activeReport.missingFields.join(', ')}.</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    triggerHaptic();
                    updateReportStatus(activeReport.id, 'Submitted', 'Operator verified flagged OCR fields');
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[11px] shrink-0 active:scale-95"
                >
                  Confirm Values
                </button>
              </div>
            )}

            {/* Original Uploaded Paper Photo Thumbnail / Inspector (if available) */}
            {activeReport.originalImageUrl && (
              <div className="mt-3 p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    Original Uploaded Paper Sheet Photo:
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {activeReport.ocrConfidenceScore || 94.5}% Confidence
                  </span>
                </div>
                <div className="max-h-36 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-center">
                  <img
                    src={activeReport.originalImageUrl}
                    alt="Original Log Sheet"
                    referrerPolicy="no-referrer"
                    className="max-h-36 w-auto object-contain hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => {
                      triggerHaptic();
                      window.open(activeReport.originalImageUrl, '_blank');
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Produced</span>
              <span className="text-sm font-bold text-white font-mono">{activeReport.totalActual}</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Rejection</span>
              <span className="text-sm font-bold text-rose-400 font-mono">{activeReport.totalReject}</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Downtime</span>
              <span className="text-sm font-bold text-amber-400 font-mono">{activeReport.totalDowntimeMinutes}m</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">OEE</span>
              <span className="text-sm font-bold text-blue-400 font-mono">{activeReport.oeePct}%</span>
            </div>
          </div>

          {/* Hourly Rows Breakdown Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
                Hour-by-Hour Logs ({activeReport.hourlyEntries.length}/8 Hours Logged)
              </h3>

              {activeReport.hourlyEntries.length < 8 && (
                <button
                  onClick={() => {
                    triggerHaptic();
                    onOpenHourlyEntryModal(activeReport.id, activeReport.hourlyEntries.length + 1);
                  }}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log Next Hour
                </button>
              )}
            </div>

            <div className="space-y-2">
              {activeReport.hourlyEntries.map((row) => (
                <div
                  key={row.hourIndex}
                  onClick={() => {
                    triggerHaptic();
                    onOpenHourlyEntryModal(activeReport.id, row.hourIndex);
                  }}
                  className="p-3 bg-slate-950/80 border border-slate-800/90 rounded-xl hover:border-blue-500/50 cursor-pointer active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-200 font-bold flex items-center justify-center text-xs font-mono">
                        H{row.hourIndex}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-100">{row.timeSlotLabel}</div>
                        <div className="text-[10px] text-slate-400">
                          Target: {row.targetQty} pcs
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-emerald-400 font-mono">{row.actualQty} pcs</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 justify-end">
                          {row.rejectQty > 0 && <span className="text-rose-400">Rej: {row.rejectQty}</span>}
                          {row.downtimeMinutes > 0 && <span className="text-amber-400">DT: {row.downtimeMinutes}m</span>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  {/* Department Custom Metrics Preview Pills */}
                  {row.mouldingFields && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                      <span>Shots: <strong className="text-slate-200">{row.mouldingFields.shotCount}</strong></span>
                      <span>Cycle: <strong className="text-slate-200">{row.mouldingFields.cycleTimeSec}s</strong></span>
                      <span>Melt: <strong className="text-slate-200">{row.mouldingFields.meltTempC}°C</strong></span>
                      <span>Runner: <strong className="text-slate-200">{row.mouldingFields.runnerWeightGrams}g</strong></span>
                    </div>
                  )}

                  {row.insertAssemblyFields && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                      <span>Lot: <strong className="text-slate-200">{row.insertAssemblyFields.insertLotNo}</strong></span>
                      <span>Jig: <strong className="text-slate-200">{row.insertAssemblyFields.jigId}</strong></span>
                      <span>Loaded: <strong className="text-slate-200">{row.insertAssemblyFields.loadedInsertsQty}</strong></span>
                    </div>
                  )}

                  {row.bdvFields && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                      <span>Test kV: <strong className="text-slate-200">{row.bdvFields.testVoltageKV}kV</strong></span>
                      <span>Leakage: <strong className="text-slate-200">{row.bdvFields.leakageCurrentMA}mA</strong></span>
                      <span>Pass: <strong className="text-emerald-400">{row.bdvFields.passRatePct}%</strong></span>
                    </div>
                  )}

                  {row.notes && (
                    <div className="mt-1.5 text-[11px] text-slate-400 italic">
                      "{row.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Operator / Supervisor Remarks Box */}
          {(activeReport.operatorNotes || activeReport.supervisorRemarks || activeReport.managerRemarks) && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="font-bold text-slate-300">Sign-Off & Handover Remarks:</div>
              {activeReport.operatorNotes && (
                <div className="text-slate-400">
                  <strong className="text-slate-300">Operator:</strong> {activeReport.operatorNotes}
                </div>
              )}
              {activeReport.supervisorRemarks && (
                <div className="text-emerald-400">
                  <strong className="text-emerald-300">Supervisor:</strong> {activeReport.supervisorRemarks}
                </div>
              )}
              {activeReport.managerRemarks && (
                <div className="text-purple-400">
                  <strong className="text-purple-300">Manager:</strong> {activeReport.managerRemarks}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
          No reports found for the selected department. Create a new sheet or scan one with AI OCR.
        </div>
      )}
    </div>
  );
};
