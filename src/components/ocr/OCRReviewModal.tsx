import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Edit3,
  Check,
  Plus,
  Trash2,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  OCRScanResult,
  OCRParsedHourRow,
  REJECTION_CODES_MAP,
  DOWNTIME_CODES_MAP,
} from '../../types/schema';

interface OCRReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanResult: OCRScanResult | null;
  onRescanRequested?: () => void;
}

export const OCRReviewModal: React.FC<OCRReviewModalProps> = ({
  isOpen,
  onClose,
  scanResult,
  onRescanRequested,
}) => {
  const {
    machines,
    products,
    departments,
    currentUser,
    applyOcrResultToReport,
    triggerHaptic,
  } = useApp();

  if (!isOpen || !scanResult) return null;

  // Local state for editable review fields
  const [editedScan, setEditedScan] = useState<OCRScanResult>(() => ({
    ...scanResult,
    parsedHourlyRows: scanResult.parsedHourlyRows.map((r) => ({ ...r })),
  }));

  const [isPhotoZoomed, setIsPhotoZoomed] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'table' | 'header' | 'photo'>('table');
  const [hasVerifiedUncertain, setHasVerifiedUncertain] = useState<boolean>(false);

  // Update header metadata fields
  const handleHeaderChange = (field: keyof OCRScanResult, value: any) => {
    setEditedScan((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update individual hourly row
  const handleHourlyRowChange = (index: number, field: keyof OCRParsedHourRow, value: any) => {
    setEditedScan((prev) => {
      const updatedRows = [...prev.parsedHourlyRows];
      const targetRow = { ...updatedRows[index], [field]: value };

      // If rejection code changed, auto-update rejectReason
      if (field === 'rejectionCode' && value && REJECTION_CODES_MAP[value]) {
        targetRow.rejectReason = REJECTION_CODES_MAP[value].name;
      }

      // If downtime code changed, auto-update downtimeReason
      if (field === 'downtimeCode' && value && DOWNTIME_CODES_MAP[value]) {
        targetRow.downtimeReason = DOWNTIME_CODES_MAP[value].name;
      }

      // Clear uncertain flag when operator manually modifies
      if (targetRow.isUncertain) {
        targetRow.isUncertain = false;
      }

      updatedRows[index] = targetRow;

      const totalActual = updatedRows.reduce((sum, r) => sum + (Number(r.actual) || 0), 0);
      const totalReject = updatedRows.reduce((sum, r) => sum + (Number(r.reject) || 0), 0);
      const totalDowntime = updatedRows.reduce((sum, r) => sum + (Number(r.downtimeMin) || 0), 0);

      return {
        ...prev,
        parsedHourlyRows: updatedRows,
        totalActual,
        totalReject,
        totalDowntime,
      };
    });
  };

  // Add next hour manually if operator wants
  const handleAddNextHour = () => {
    triggerHaptic();
    setEditedScan((prev) => {
      const nextHourNum = prev.parsedHourlyRows.length + 1;
      if (nextHourNum > 8) return prev;

      const startH = (5 + nextHourNum).toString().padStart(2, '0');
      const endH = (6 + nextHourNum).toString().padStart(2, '0');
      const newRow: OCRParsedHourRow = {
        hour: nextHourNum,
        timeSlot: `${startH}:00 - ${endH}:00`,
        target: prev.recognizedTargetPerHour || 650,
        actual: 0,
        reject: 0,
        downtimeMin: 0,
        rejectionCode: '',
        rejectReason: '',
        downtimeCode: '',
        downtimeReason: '',
        runnerWeightGrams: prev.recognizedRunnerWeightGrams || 17.2,
        lumpQuantityKg: 0,
        remarks: '',
        isUncertain: false,
      };

      const updatedRows = [...prev.parsedHourlyRows, newRow];
      return {
        ...prev,
        parsedHourlyRows: updatedRows,
      };
    });
  };

  // Remove hour
  const handleRemoveHour = (index: number) => {
    triggerHaptic();
    setEditedScan((prev) => {
      const updatedRows = prev.parsedHourlyRows.filter((_, idx) => idx !== index);
      const totalActual = updatedRows.reduce((sum, r) => sum + (Number(r.actual) || 0), 0);
      const totalReject = updatedRows.reduce((sum, r) => sum + (Number(r.reject) || 0), 0);
      const totalDowntime = updatedRows.reduce((sum, r) => sum + (Number(r.downtimeMin) || 0), 0);
      return {
        ...prev,
        parsedHourlyRows: updatedRows,
        totalActual,
        totalReject,
        totalDowntime,
      };
    });
  };

  // Submit to Supervisor
  const handleSubmitReport = () => {
    triggerHaptic();
    applyOcrResultToReport(editedScan);
    onClose();
  };

  const uncertainCount = editedScan.parsedHourlyRows.filter((r) => r.isUncertain).length + (editedScan.uncertainFields?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">OCR Verification & Review</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {editedScan.confidenceScore}% AI Confidence
                </span>
                {uncertainCount > 0 && !hasVerifiedUncertain && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    {uncertainCount} Needs Check
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Operator verification: inspect original photo against digitized data before sign-off
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRescanRequested && (
              <button
                type="button"
                onClick={onRescanRequested}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Rescan
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Missing or Uncertain Fields Alert Banner */}
        {(editedScan.missingFields?.length > 0 || (editedScan.uncertainFields?.length > 0 && !hasVerifiedUncertain)) && (
          <div className="bg-amber-950/40 border-b border-amber-800/60 p-2.5 px-4 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold">Attention Required: </span>
                {editedScan.uncertainFields?.length > 0 && (
                  <span className="text-amber-300 font-mono text-[11px]">
                    Uncertain: {editedScan.uncertainFields.join(', ')}.
                  </span>
                )}
                {editedScan.missingFields?.length > 0 && (
                  <span className="text-slate-300 ml-1 text-[11px]">
                    Empty on sheet: {editedScan.missingFields.join(', ')}.
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setHasVerifiedUncertain(true);
              }}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 active:scale-95"
            >
              <Check className="w-3 h-3" />
              Mark as Verified
            </button>
          </div>
        )}

        {/* Tab Selector (For mobile ergonomic view switching) */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-950/80 border-b border-slate-800 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'table'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Hourly Entries ({editedScan.parsedHourlyRows.length} Hrs)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('header')}
            className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'header'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Report Header & Specs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'photo'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Original Photo
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Hourly Entries Table */}
          {activeTab === 'table' && (
            <div className="space-y-3">
              {/* Summary Bar */}
              <div className="grid grid-cols-4 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">Completed Hours</span>
                  <span className="text-sm font-bold text-white font-mono">{editedScan.parsedHourlyRows.length} / 8</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 block">Total Actual</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{editedScan.totalActual} pcs</span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-400 block">Total Rejection</span>
                  <span className="text-sm font-bold text-rose-400 font-mono">{editedScan.totalReject} pcs</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-400 block">Total Downtime</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">{editedScan.totalDowntime} min</span>
                </div>
              </div>

              {/* Notice that only completed hours from the photograph are shown */}
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-blue-950/30 border border-blue-900/40 p-2 rounded-lg">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>
                  Showing {editedScan.parsedHourlyRows.length} filled hours from paper log. Blank future hours are omitted to prevent invented values.
                </span>
              </div>

              {/* Mobile Card / Table List of Extracted Hours */}
              <div className="space-y-2.5">
                {editedScan.parsedHourlyRows.map((row, index) => (
                  <div
                    key={row.hour}
                    className={`p-3 rounded-xl border transition-all ${
                      row.isUncertain
                        ? 'bg-amber-950/20 border-amber-600/80 shadow-amber-950/50 shadow-md'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    {/* Row Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono font-bold text-xs border border-blue-800">
                          Hour {row.hour}
                        </span>
                        <span className="text-slate-300 font-mono text-[11px]">{row.timeSlot}</span>
                        {row.isUncertain && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950 flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Flagged Faint
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveHour(index)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove hour"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Editable Controls Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      {/* Actual Qty */}
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                          Actual Good (pcs)
                        </label>
                        <input
                          type="number"
                          value={row.actual}
                          onChange={(e) => handleHourlyRowChange(index, 'actual', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono font-bold text-sm"
                        />
                      </div>

                      {/* Rejection Qty */}
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                          Rejection Qty
                        </label>
                        <input
                          type="number"
                          value={row.reject}
                          onChange={(e) => handleHourlyRowChange(index, 'reject', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-lg px-2.5 py-1.5 text-rose-400 font-mono font-bold text-sm"
                        />
                      </div>

                      {/* Rejection Code A-M */}
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                          Defect Code (A-M)
                        </label>
                        <select
                          value={row.rejectionCode || ''}
                          onChange={(e) => handleHourlyRowChange(index, 'rejectionCode', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono"
                        >
                          <option value="">None / No Defect</option>
                          {Object.values(REJECTION_CODES_MAP).map((c) => (
                            <option key={c.code} value={c.code}>
                              Code {c.code}: {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Downtime Minutes */}
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                          Downtime (min)
                        </label>
                        <input
                          type="number"
                          value={row.downtimeMin}
                          onChange={(e) => handleHourlyRowChange(index, 'downtimeMin', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-amber-400 font-mono font-bold text-sm"
                        />
                      </div>

                      {/* Downtime Code 1-10 */}
                      <div className="col-span-2 sm:col-span-2">
                        <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                          Downtime Code (1-10)
                        </label>
                        <select
                          value={row.downtimeCode || ''}
                          onChange={(e) => handleHourlyRowChange(index, 'downtimeCode', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono"
                        >
                          <option value="">None / Running Normal</option>
                          {Object.values(DOWNTIME_CODES_MAP).map((d) => (
                            <option key={d.code} value={d.code}>
                              Code {d.code}: {d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Runner Weight (g) */}
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                          Runner Wt (g)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={row.runnerWeightGrams || ''}
                          onChange={(e) => handleHourlyRowChange(index, 'runnerWeightGrams', Number(e.target.value))}
                          placeholder="17.2"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono"
                        />
                      </div>

                      {/* Hourly Remarks */}
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                          Hour Remarks
                        </label>
                        <input
                          type="text"
                          value={row.remarks || ''}
                          onChange={(e) => handleHourlyRowChange(index, 'remarks', e.target.value)}
                          placeholder="Notes"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Next Hour Button */}
              {editedScan.parsedHourlyRows.length < 8 && (
                <button
                  type="button"
                  onClick={handleAddNextHour}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 text-blue-400" />
                  Add Next Completed Hour (Hour {editedScan.parsedHourlyRows.length + 1})
                </button>
              )}
            </div>
          )}

          {/* TAB 2: Header Metadata & Specs */}
          {activeTab === 'header' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Shift & Machine Identifiers
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Date</label>
                    <input
                      type="date"
                      value={editedScan.recognizedDate}
                      onChange={(e) => handleHeaderChange('recognizedDate', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Shift</label>
                    <select
                      value={editedScan.recognizedShift}
                      onChange={(e) => handleHeaderChange('recognizedShift', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 font-mono"
                    >
                      <option value="Shift A">Shift A (06:00 - 14:00)</option>
                      <option value="Shift B">Shift B (14:00 - 22:00)</option>
                      <option value="Shift C">Shift C (22:00 - 06:00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Machine Code</label>
                    <input
                      type="text"
                      value={editedScan.recognizedMachineCode}
                      onChange={(e) => handleHeaderChange('recognizedMachineCode', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Department</label>
                    <select
                      value={editedScan.recognizedDepartment}
                      onChange={(e) => handleHeaderChange('recognizedDepartment', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Operator Name</label>
                    <input
                      type="text"
                      value={editedScan.recognizedOperatorName || ''}
                      onChange={(e) => handleHeaderChange('recognizedOperatorName', e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Supervisor Name</label>
                    <input
                      type="text"
                      value={editedScan.recognizedSupervisorName || ''}
                      onChange={(e) => handleHeaderChange('recognizedSupervisorName', e.target.value)}
                      placeholder="e.g. Vikramaditya Rao"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Product & Injection Moulding Parameters
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Product SKU</label>
                    <input
                      type="text"
                      value={editedScan.recognizedProductSku}
                      onChange={(e) => handleHeaderChange('recognizedProductSku', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Product / Part Name</label>
                    <input
                      type="text"
                      value={editedScan.recognizedProductName || ''}
                      onChange={(e) => handleHeaderChange('recognizedProductName', e.target.value)}
                      placeholder="e.g. ECU Connector"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Material / Resin</label>
                    <input
                      type="text"
                      value={editedScan.recognizedMaterialName || ''}
                      onChange={(e) => handleHeaderChange('recognizedMaterialName', e.target.value)}
                      placeholder="e.g. PBT GF30"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Cycle Time (sec)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editedScan.recognizedCycleTimeSec || ''}
                      onChange={(e) => handleHeaderChange('recognizedCycleTimeSec', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Target / Hr</label>
                    <input
                      type="number"
                      value={editedScan.recognizedTargetPerHour || ''}
                      onChange={(e) => handleHeaderChange('recognizedTargetPerHour', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Cavity Count</label>
                    <input
                      type="number"
                      value={editedScan.recognizedCavityCount || ''}
                      onChange={(e) => handleHeaderChange('recognizedCavityCount', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Runner Weight (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editedScan.recognizedRunnerWeightGrams || ''}
                      onChange={(e) => handleHeaderChange('recognizedRunnerWeightGrams', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Lump / Purge (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editedScan.recognizedLumpQuantityKg || ''}
                      onChange={(e) => handleHeaderChange('recognizedLumpQuantityKg', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 font-mono"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-3">
                    <label className="text-[10px] text-slate-400 block mb-1">Sheet Remarks</label>
                    <input
                      type="text"
                      value={editedScan.recognizedRemarks || ''}
                      onChange={(e) => handleHeaderChange('recognizedRemarks', e.target.value)}
                      placeholder="Handwritten notes on sheet"
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Original Uploaded Photo Inspector */}
          {activeTab === 'photo' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Original Uploaded Physical Sheet</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((prev) => Math.max(0.8, prev - 0.2))}
                    className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[10px]">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.2))}
                    className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 max-h-96 overflow-auto flex items-center justify-center">
                {editedScan.imageThumbnail ? (
                  <img
                    src={editedScan.imageThumbnail}
                    alt="Original Log Sheet"
                    referrerPolicy="no-referrer"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                    className="max-w-full rounded transition-transform"
                  />
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">No image preview available</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Pipeline */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <span>Signing off as:</span>
            <span className="font-bold text-slate-200">{currentUser.name} ({currentUser.role})</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>

            <button
              type="button"
              id="btn-submit-verified-ocr"
              onClick={handleSubmitReport}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              <Zap className="w-4 h-4" />
              Verify & Submit for Supervisor
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
