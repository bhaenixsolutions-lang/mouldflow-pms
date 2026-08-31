import React, { useState } from 'react';
import { X, AlertTriangle, Plus, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RejectionLogItem } from '../../types/schema';

interface LogRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogRejectionModal: React.FC<LogRejectionModalProps> = ({ isOpen, onClose }) => {
  const {
    reports,
    defects,
    machines,
    products,
    departments,
    shifts,
    activeShift,
    currentUser,
    addRejection,
    triggerHaptic,
  } = useApp();

  const [machineId, setMachineId] = useState<string>(machines[0]?.id || '');
  const [defectCode, setDefectCode] = useState<string>(defects[0]?.code || '');
  const [quantity, setQuantity] = useState<number>(5);
  const [hourIndex, setHourIndex] = useState<number>(1);
  const [rootCauseNote, setRootCauseNote] = useState<string>('');

  if (!isOpen) return null;

  const selectedMachine = machines.find((m) => m.id === machineId);
  const selectedProduct = products.find((p) => p.id === selectedMachine?.currentProductId) || products[0];
  const selectedDefect = defects.find((d) => d.code === defectCode) || defects[0];
  const matchingReport = reports.find((r) => r.machineId === machineId && r.shiftId === activeShift.id) || reports[0];

  const handleSave = () => {
    triggerHaptic();

    const newRejection: Omit<RejectionLogItem, 'id'> = {
      reportId: matchingReport?.id || 'PR-001',
      date: new Date().toISOString().substring(0, 10),
      shiftId: activeShift.id,
      departmentId: selectedMachine?.departmentId || departments[0]?.id || '',
      machineId,
      productId: selectedProduct.id,
      hourIndex,
      defectCode: selectedDefect.code,
      defectName: selectedDefect.name,
      quantity,
      isReworkable: selectedDefect.isReworkable,
      scrapCostTotal: quantity * selectedProduct.unitCostCurrency,
      rootCauseNote,
      operatorId: currentUser.id,
    };

    addRejection(newRejection);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h2 className="text-sm font-bold text-white">Log Rejection / Scrap</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 text-xs">
          {/* Machine Selection */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Machine / Line:</label>
            <select
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Defect Type Selection */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Defect Type / Root Cause:</label>
            <select
              value={defectCode}
              onChange={(e) => setDefectCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            >
              {defects.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.category})
                </option>
              ))}
            </select>
          </div>

          {/* Hour Slot & Quantity */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Hour Slot:</label>
              <select
                value={hourIndex}
                onChange={(e) => setHourIndex(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                  <option key={h} value={h}>
                    Hour {h}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Scrap Quantity (Pcs):</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold"
              />
            </div>
          </div>

          {/* Root Cause Notes */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Observations / Root Cause:</label>
            <input
              type="text"
              placeholder="e.g. Temperature drop on nozzle zone 3..."
              value={rootCauseNote}
              onChange={(e) => setRootCauseNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-log-rejection"
            onClick={handleSave}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
          >
            <Save className="w-4 h-4" />
            Record Scrap
          </button>
        </div>
      </div>
    </div>
  );
};
