import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Save,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductionReport, HourlyReportEntry } from '../../types/schema';

interface HourlyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string | null;
  hourIndex?: number;
}

export const HourlyEntryModal: React.FC<HourlyEntryModalProps> = ({
  isOpen,
  onClose,
  reportId,
  hourIndex = 1,
}) => {
  const {
    reports,
    machines,
    products,
    departments,
    defects,
    downtimeCategories,
    addHourlyEntryToReport,
    addRejection,
    addDowntime,
    currentUser,
    activeShift,
    triggerHaptic,
  } = useApp();

  const report = reports.find((r) => r.id === reportId) || reports[0];
  const department = departments.find((d) => d.id === report?.departmentId);
  const machine = machines.find((m) => m.id === report?.machineId);
  const product = products.find((p) => p.id === report?.productId);

  // Existing hour row if editing
  const existingEntry = report?.hourlyEntries.find((h) => h.hourIndex === hourIndex);

  // Form states
  const [actualQty, setActualQty] = useState<number>(existingEntry?.actualQty || product?.targetPerHour || 500);
  const [rejectQty, setRejectQty] = useState<number>(existingEntry?.rejectQty || 0);
  const [rejectDefectCode, setRejectDefectCode] = useState<string>(existingEntry?.rejectDefectCode || defects[0]?.code || '');
  const [downtimeMinutes, setDowntimeMinutes] = useState<number>(existingEntry?.downtimeMinutes || 0);
  const [downtimeReasonCode, setDowntimeReasonCode] = useState<string>(existingEntry?.downtimeReasonCode || '');
  const [notes, setNotes] = useState<string>(existingEntry?.notes || '');

  // Department-specific parameters
  const [shotCount, setShotCount] = useState<number>(existingEntry?.mouldingFields?.shotCount || 160);
  const [cycleTimeSec, setCycleTimeSec] = useState<number>(existingEntry?.mouldingFields?.cycleTimeSec || product?.standardCycleTimeSec || 22.0);
  const [meltTempC, setMeltTempC] = useState<number>(existingEntry?.mouldingFields?.meltTempC || 245);
  const [runnerWeightGrams, setRunnerWeightGrams] = useState<number>(existingEntry?.mouldingFields?.runnerWeightGrams || product?.runnerWeightGrams || 17.2);
  const [cushionMm, setCushionMm] = useState<number>(existingEntry?.mouldingFields?.cushionMm || 5.0);

  // Insert assembly
  const [insertLotNo, setInsertLotNo] = useState<string>(existingEntry?.insertAssemblyFields?.insertLotNo || 'LOT-BRASS-982');
  const [insertType, setInsertType] = useState<string>(existingEntry?.insertAssemblyFields?.insertType || 'Brass Pin');
  const [jigId, setJigId] = useState<string>(existingEntry?.insertAssemblyFields?.jigId || 'JIG-ASM-01');

  // Deflashing
  const [batchNo, setBatchNo] = useState<string>(existingEntry?.deflashingFields?.batchNo || 'BATCH-DFL-101');
  const [trimMethod, setTrimMethod] = useState<'Manual' | 'Cryogenic' | 'Ultrasonic'>(existingEntry?.deflashingFields?.trimMethod || 'Cryogenic');

  // Packing
  const [cartonNo, setCartonNo] = useState<string>(existingEntry?.packingFields?.cartonNo || 'CTN-2026-88');
  const [barcodeScanned, setBarcodeScanned] = useState<boolean>(existingEntry?.packingFields?.barcodeScanned ?? true);

  // BDV
  const [testVoltageKV, setTestVoltageKV] = useState<number>(existingEntry?.bdvFields?.testVoltageKV || 3.75);
  const [leakageCurrentMA, setLeakageCurrentMA] = useState<number>(existingEntry?.bdvFields?.leakageCurrentMA || 0.85);

  useEffect(() => {
    if (existingEntry) {
      setActualQty(existingEntry.actualQty);
      setRejectQty(existingEntry.rejectQty);
      setDowntimeMinutes(existingEntry.downtimeMinutes);
      setNotes(existingEntry.notes || '');
    } else {
      setActualQty(product?.targetPerHour || 500);
      setRejectQty(0);
      setDowntimeMinutes(0);
      setNotes('');
    }
  }, [existingEntry, product]);

  if (!isOpen || !report) return null;

  const targetQty = product?.targetPerHour || 500;
  const timeSlotLabel = `0${5 + hourIndex}:00 - 0${6 + hourIndex}:00`;

  const handleSave = () => {
    triggerHaptic();

    const entry: HourlyReportEntry = {
      hourIndex,
      timeSlotLabel,
      targetQty,
      actualQty,
      rejectQty,
      downtimeMinutes,
      downtimeReasonCode: downtimeMinutes > 0 ? downtimeReasonCode : undefined,
      rejectDefectCode: rejectQty > 0 ? rejectDefectCode : undefined,
      notes,
    };

    if (department?.reportTemplateType === 'Moulding') {
      entry.mouldingFields = {
        shotCount,
        cycleTimeSec,
        meltTempC,
        cushionMm,
        hydraulicPressureBar: 140,
        runnerWeightGrams,
      };
    } else if (department?.reportTemplateType === 'Insert Assembly') {
      entry.insertAssemblyFields = {
        insertLotNo,
        insertType,
        jigId,
        loadedInsertsQty: actualQty * (product?.cavitiesTotal || 4),
        assembledOkQty: actualQty,
        misalignedScrap: rejectQty,
      };
    } else if (department?.reportTemplateType === 'Deflashing') {
      entry.deflashingFields = {
        batchNo,
        trimMethod,
        qtyReceived: actualQty + rejectQty,
        flashDefectQty: rejectQty,
        gougedScrapQty: 0,
      };
    } else if (department?.reportTemplateType === 'Packing') {
      entry.packingFields = {
        stationId: 'PCK-STN-01',
        cartonNo,
        boxCapacity: 250,
        polybagVerified: true,
        barcodeScanned,
        boxesPackedQty: Math.floor(actualQty / 250),
      };
    } else if (department?.reportTemplateType === 'BDV') {
      entry.bdvFields = {
        testBenchId: 'BDV-01',
        testVoltageKV,
        leakageCurrentMA,
        insulationResistanceMOhms: 1250,
        sparkBreakdownCount: rejectQty,
        passRatePct: actualQty + rejectQty > 0 ? Number(((actualQty / (actualQty + rejectQty)) * 100).toFixed(2)) : 100,
      };
    }

    addHourlyEntryToReport(report.id, entry);

    // If rejection logged, add to rejection ledger
    if (rejectQty > 0) {
      const def = defects.find((d) => d.code === rejectDefectCode) || defects[0];
      addRejection({
        reportId: report.id,
        date: report.date,
        shiftId: report.shiftId,
        departmentId: report.departmentId,
        machineId: report.machineId,
        productId: report.productId,
        hourIndex,
        defectCode: def.code,
        defectName: def.name,
        quantity: rejectQty,
        isReworkable: def.isReworkable,
        scrapCostTotal: rejectQty * (product?.unitCostCurrency || 15),
        rootCauseNote: notes || 'Logged during hourly entry',
        operatorId: currentUser.id,
      });
    }

    // If downtime logged, add to downtime ledger
    if (downtimeMinutes > 0) {
      const dt = downtimeCategories.find((d) => d.code === downtimeReasonCode) || downtimeCategories[0];
      addDowntime({
        reportId: report.id,
        date: report.date,
        shiftId: report.shiftId,
        departmentId: report.departmentId,
        machineId: report.machineId,
        hourIndex,
        categoryCode: dt.code,
        categoryName: dt.name,
        durationMinutes: downtimeMinutes,
        actionTaken: notes || 'Logged during hourly entry',
        isResolved: true,
        operatorId: currentUser.id,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 font-bold text-xs flex items-center justify-center font-mono">
                H{hourIndex}
              </span>
              <h2 className="text-sm font-bold text-white">Log Hour {hourIndex} Production</h2>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {machine?.code} • {product?.sku} ({timeSlotLabel})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Form */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Target Reference */}
          <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Standard Hourly Target:</span>
            <span className="font-bold text-slate-200 font-mono">{targetQty} pcs</span>
          </div>

          {/* Actual Produced Counter with Stepper Controls */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex justify-between">
              <span>Actual Good Output (Pcs)</span>
              <span className="text-emerald-400 font-mono font-bold">{actualQty} pcs</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                id="input-actual-qty"
                type="number"
                value={actualQty}
                onChange={(e) => setActualQty(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-lg font-bold font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Quick Touch Stepper Buttons */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[-10, 10, 50, 100].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setActualQty((prev) => Math.max(0, prev + delta));
                  }}
                  className="py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-blue-600 rounded-lg text-xs font-mono font-semibold text-slate-200"
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>
          </div>

          {/* Rejections Counter */}
          <div className="p-3 bg-rose-950/20 border border-rose-900/60 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-rose-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Rejection / Scrap Count
              </span>
              <span className="font-mono text-xs font-bold text-rose-400">{rejectQty} pcs</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setRejectQty((prev) => Math.max(0, prev - 1));
                }}
                className="w-10 h-10 rounded-xl bg-rose-900/50 text-rose-200 flex items-center justify-center font-bold text-lg active:scale-90"
              >
                -
              </button>
              <input
                id="input-reject-qty"
                type="number"
                value={rejectQty}
                onChange={(e) => setRejectQty(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 bg-slate-950 border border-rose-800 rounded-xl px-3 py-2 text-center font-mono font-bold text-rose-300 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setRejectQty((prev) => prev + 1);
                }}
                className="w-10 h-10 rounded-xl bg-rose-900/50 text-rose-200 flex items-center justify-center font-bold text-lg active:scale-90"
              >
                +
              </button>
            </div>

            {rejectQty > 0 && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Defect Cause:</label>
                <select
                  value={rejectDefectCode}
                  onChange={(e) => setRejectDefectCode(e.target.value)}
                  className="w-full bg-slate-950 border border-rose-800/80 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                >
                  {defects.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name} ({d.category})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Downtime Stoppage */}
          <div className="p-3 bg-amber-950/20 border border-amber-900/60 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Stoppage / Downtime (Minutes)
              </span>
              <span className="font-mono text-xs font-bold text-amber-400">{downtimeMinutes} mins</span>
            </div>

            <div className="flex gap-1.5">
              {[0, 5, 15, 30, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setDowntimeMinutes(mins);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                    downtimeMinutes === mins
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mins === 0 ? 'None' : `${mins}m`}
                </button>
              ))}
            </div>

            {downtimeMinutes > 0 && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Stoppage Reason:</label>
                <select
                  value={downtimeReasonCode}
                  onChange={(e) => setDowntimeReasonCode(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-800/80 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="">Select Reason...</option>
                  {downtimeCategories.map((dt) => (
                    <option key={dt.code} value={dt.code}>
                      {dt.name} ({dt.group})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Department-Specific Custom Fields */}
          {department?.reportTemplateType === 'Moulding' && (
            <div className="p-3 bg-blue-950/20 border border-blue-900/60 rounded-xl space-y-2 text-xs">
              <span className="font-semibold text-blue-300 block">Moulding Process Parameters</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block">Shot Count</label>
                  <input
                    type="number"
                    value={shotCount}
                    onChange={(e) => setShotCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Cycle Time (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cycleTimeSec}
                    onChange={(e) => setCycleTimeSec(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Melt Temp (°C)</label>
                  <input
                    type="number"
                    value={meltTempC}
                    onChange={(e) => setMeltTempC(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Runner Wt (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={runnerWeightGrams}
                    onChange={(e) => setRunnerWeightGrams(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 font-mono text-white text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Operator Hour Remarks</label>
            <input
              type="text"
              placeholder="e.g. Resin hopper topped up, normal cycle..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Modal Footer Save Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
          >
            Cancel
          </button>
          <button
            id="btn-save-hourly-entry"
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 transition-transform"
          >
            <Save className="w-4 h-4" />
            Save Hour {hourIndex}
          </button>
        </div>
      </div>
    </div>
  );
};
