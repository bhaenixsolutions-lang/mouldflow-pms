import React, { useState } from 'react';
import { X, Plus, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductionReport } from '../../types/schema';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewReportModal: React.FC<NewReportModalProps> = ({ isOpen, onClose }) => {
  const {
    departments,
    machines,
    products,
    shifts,
    users,
    activeShift,
    currentUser,
    saveProductionReport,
    triggerHaptic,
  } = useApp();

  const [departmentId, setDepartmentId] = useState<string>(departments[0]?.id || '');
  const [machineId, setMachineId] = useState<string>(machines[0]?.id || '');
  const [productId, setProductId] = useState<string>(products[0]?.id || '');
  const [shiftId, setShiftId] = useState<string>(activeShift.id);
  const [operatorId, setOperatorId] = useState<string>(currentUser.id);
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));

  if (!isOpen) return null;

  const filteredMachines = machines.filter((m) => m.departmentId === departmentId);
  const deptProducts = products.filter((p) => p.departmentId === departmentId);

  const selectedProduct = products.find((p) => p.id === productId);
  const targetPerShift = (selectedProduct?.targetPerHour || 650) * 8;

  const handleCreate = () => {
    triggerHaptic();

    const newReport: ProductionReport = {
      id: `rep-${Date.now()}`,
      reportNumber: `PR-${date.replace(/-/g, '')}-${machines.find((m) => m.id === machineId)?.code || 'M'}-${Date.now().toString().slice(-3)}`,
      date,
      shiftId,
      departmentId,
      machineId,
      productId,
      operatorId,
      status: 'Draft',
      hourlyEntries: [],
      totalTarget: targetPerShift,
      totalActual: 0,
      totalReject: 0,
      totalDowntimeMinutes: 0,
      efficiencyPct: 0,
      scrapRatePct: 0,
      availabilityPct: 100,
      performancePct: 0,
      qualityPct: 100,
      oeePct: 0,
      createdAt: new Date().toISOString(),
    };

    saveProductionReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Create New Production Sheet</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 text-xs">
          {/* Department */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Department:</label>
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                const m = machines.filter((x) => x.departmentId === e.target.value)[0];
                if (m) setMachineId(m.id);
                const p = products.filter((x) => x.departmentId === e.target.value)[0];
                if (p) setProductId(p.id);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.reportTemplateType})
                </option>
              ))}
            </select>
          </div>

          {/* Machine */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Machine / Line:</label>
            <select
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            >
              {(filteredMachines.length > 0 ? filteredMachines : machines).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name} ({m.tonnage > 0 ? `${m.tonnage}T` : 'Manual/Bench'})
                </option>
              ))}
            </select>
          </div>

          {/* Product SKU */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Product SKU / Mould:</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            >
              {(deptProducts.length > 0 ? deptProducts : products).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name} ({p.cavitiesTotal} Cavities)
                </option>
              ))}
            </select>
          </div>

          {/* Shift & Date */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Shift:</label>
              <select
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              >
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} ({s.startTime})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          {/* Operator */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Assigned Operator:</label>
            <select
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.employeeCode} • {u.role})
                </option>
              ))}
            </select>
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
            id="btn-confirm-create-report"
            onClick={handleCreate}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Initialize Sheet
          </button>
        </div>
      </div>
    </div>
  );
};
