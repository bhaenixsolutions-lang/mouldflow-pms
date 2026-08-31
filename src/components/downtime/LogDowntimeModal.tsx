import React, { useState } from 'react';
import { X, Clock, Save, Wrench } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DowntimeLogItem } from '../../types/schema';

interface LogDowntimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogDowntimeModal: React.FC<LogDowntimeModalProps> = ({ isOpen, onClose }) => {
  const {
    reports,
    downtimeCategories,
    machines,
    departments,
    activeShift,
    currentUser,
    addDowntime,
    triggerHaptic,
  } = useApp();

  const [machineId, setMachineId] = useState<string>(machines[0]?.id || '');
  const [categoryCode, setCategoryCode] = useState<string>(downtimeCategories[0]?.code || '');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [hourIndex, setHourIndex] = useState<number>(1);
  const [actionTaken, setActionTaken] = useState<string>('');
  const [isResolved, setIsResolved] = useState<boolean>(true);

  if (!isOpen) return null;

  const selectedMachine = machines.find((m) => m.id === machineId);
  const selectedCategory = downtimeCategories.find((c) => c.code === categoryCode) || downtimeCategories[0];
  const matchingReport = reports.find((r) => r.machineId === machineId && r.shiftId === activeShift.id) || reports[0];

  const handleSave = () => {
    triggerHaptic();

    const newDowntime: Omit<DowntimeLogItem, 'id'> = {
      reportId: matchingReport?.id || 'PR-001',
      date: new Date().toISOString().substring(0, 10),
      shiftId: activeShift.id,
      departmentId: selectedMachine?.departmentId || departments[0]?.id || '',
      machineId,
      hourIndex,
      categoryCode: selectedCategory.code,
      categoryName: selectedCategory.name,
      durationMinutes,
      actionTaken,
      isResolved,
      operatorId: currentUser.id,
    };

    addDowntime(newDowntime);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Log Machine Stoppage / Downtime</h2>
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
                  {m.code} - {m.name} ({m.status})
                </option>
              ))}
            </select>
          </div>

          {/* Downtime Reason Selection */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Stoppage Root Cause:</label>
            <select
              value={categoryCode}
              onChange={(e) => setCategoryCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            >
              {downtimeCategories.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.group})
                </option>
              ))}
            </select>
          </div>

          {/* Duration Minutes Stepper */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-400 font-semibold">Stoppage Duration:</label>
              <span className="font-mono text-amber-400 font-bold">{durationMinutes} mins</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {[5, 10, 15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setDurationMinutes(mins);
                  }}
                  className={`py-1.5 rounded-lg font-mono text-xs font-semibold ${
                    durationMinutes === mins
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 font-mono text-white"
            />
          </div>

          {/* Action Taken */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Technician / Operator Action:</label>
            <input
              type="text"
              placeholder="e.g. Cleared blocked runner, adjusted barrel heater..."
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            />
          </div>

          {/* Status Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="chk-is-resolved"
              checked={isResolved}
              onChange={(e) => setIsResolved(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="chk-is-resolved" className="text-slate-200 font-semibold cursor-pointer">
              Machine issue is resolved and running again
            </label>
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
            id="btn-confirm-log-downtime"
            onClick={handleSave}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
          >
            <Save className="w-4 h-4" />
            Record Stoppage
          </button>
        </div>
      </div>
    </div>
  );
};
