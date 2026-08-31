import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Cpu,
  Package,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  Save,
  Users,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ProductionPlanRecord } from '../../../types/ppc';

interface PPCPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: ProductionPlanRecord | null;
}

export const PPCPlanModal: React.FC<PPCPlanModalProps> = ({
  isOpen,
  onClose,
  planToEdit,
}) => {
  const {
    machines,
    products,
    shifts,
    currentUser,
    ppcCapacitySettings,
    addProductionPlan,
    updateProductionPlan,
    triggerHaptic,
  } = useApp();

  const [componentName, setComponentName] = useState('');
  const [componentPartNumber, setComponentPartNumber] = useState('');
  const [customer, setCustomer] = useState('Tata Motors Ltd');
  const [customerPartNumber, setCustomerPartNumber] = useState('');
  const [productFamily, setProductFamily] = useState('Automotive Interiors');
  const [productId, setProductId] = useState<string>('');

  const [machineId, setMachineId] = useState<string>('');
  const [mouldCode, setMouldCode] = useState('MLD-AUTO-01');
  const [cavities, setCavities] = useState<number>(2);
  const [cycleTimeSec, setCycleTimeSec] = useState<number>(35);
  const [efficiencyPct, setEfficiencyPct] = useState<number>(85);
  const [scrapAllowancePct, setScrapAllowancePct] = useState<number>(1.5);
  const [changeoverDurationMins, setChangeoverDurationMins] = useState<number>(45);

  const [requiredQuantity, setRequiredQuantity] = useState<number>(10000);
  const [plannedQuantity, setPlannedQuantity] = useState<number>(10000);
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 10 * 86400000).toISOString().substring(0, 10)
  );
  const [plannedStartDate, setPlannedStartDate] = useState<string>(
    new Date().toISOString().substring(0, 10) + ' 06:00'
  );
  const [plannedEndDate, setPlannedEndDate] = useState<string>(
    new Date(Date.now() + 5 * 86400000).toISOString().substring(0, 10) + ' 14:00'
  );
  const [shiftCode, setShiftCode] = useState<string>('Shift A');
  const [polymerMaterial, setPolymerMaterial] = useState('ABS Flame Retardant');
  const [resinGrade, setResinGrade] = useState('PA66 GF30');
  const [masterbatchColor, setMasterbatchColor] = useState('Signal Black 2%');
  const [status, setStatus] = useState<ProductionPlanRecord['status']>('PLANNED');

  // Populate on edit
  useEffect(() => {
    if (planToEdit) {
      setComponentName(planToEdit.componentName);
      setComponentPartNumber(planToEdit.componentPartNumber);
      setCustomer(planToEdit.customer);
      setCustomerPartNumber(planToEdit.customerPartNumber || '');
      setProductFamily(planToEdit.productFamily);
      setProductId(planToEdit.productId || '');
      setMachineId(planToEdit.machineId);
      setMouldCode(planToEdit.mouldCode);
      setCavities(planToEdit.cavities);
      setCycleTimeSec(planToEdit.cycleTimeSec);
      setEfficiencyPct(planToEdit.efficiencyPct);
      setScrapAllowancePct(planToEdit.scrapAllowancePct);
      setChangeoverDurationMins(planToEdit.changeoverDurationMins);
      setRequiredQuantity(planToEdit.requiredQuantity);
      setPlannedQuantity(planToEdit.plannedQuantity);
      setPriority(planToEdit.priority);
      setDueDate(planToEdit.dueDate);
      setPlannedStartDate(planToEdit.plannedStartDate);
      setPlannedEndDate(planToEdit.plannedEndDate);
      setShiftCode(planToEdit.shiftCode || 'Shift A');
      setPolymerMaterial(planToEdit.polymerMaterial);
      setResinGrade(planToEdit.resinGrade || 'Standard Resin');
      setMasterbatchColor(planToEdit.masterbatchColor || 'Signal Black');
      setStatus(planToEdit.status);
    } else {
      // Default to first machine & first product
      if (machines.length > 0) setMachineId(machines[0].id);
      if (products.length > 0) {
        const prod = products[0];
        setProductId(prod.id);
        setComponentName(prod.name);
        setComponentPartNumber(prod.sku);
        setMouldCode(prod.mouldCode || 'MLD-AUTO-01');
        setCavities(prod.cavitiesActive || 2);
        setCycleTimeSec(prod.standardCycleTimeSec || 35);
        setPolymerMaterial(prod.polymerMaterial || 'ABS');
      }
      setEfficiencyPct(ppcCapacitySettings.defaultEfficiencyPct || 85);
      setScrapAllowancePct(ppcCapacitySettings.defaultScrapRatePct || 1.5);
    }
  }, [planToEdit, machines, products, ppcCapacitySettings, isOpen]);

  if (!isOpen) return null;

  // Real-time calculations
  const cyclesPerHour = cycleTimeSec > 0 ? 3600 / cycleTimeSec : 0;
  const expectedRatePerHour = Math.round(cyclesPerHour * cavities * (efficiencyPct / 100));
  const targetPerShift = expectedRatePerHour * 8;
  const targetPerDay = targetPerShift * 3;
  const estimatedHoursRequired = expectedRatePerHour > 0 ? Math.ceil(plannedQuantity / expectedRatePerHour) : 0;
  const estimatedDaysRequired = (estimatedHoursRequired / 22.5).toFixed(1);

  const handleProductSelect = (selectedProdId: string) => {
    setProductId(selectedProdId);
    const prod = products.find((p) => p.id === selectedProdId);
    if (prod) {
      setComponentName(prod.name);
      setComponentPartNumber(prod.sku);
      setMouldCode(prod.mouldCode || 'MLD-AUTO-01');
      setCavities(prod.cavitiesActive || 2);
      setCycleTimeSec(prod.standardCycleTimeSec || 35);
      if (prod.polymerMaterial) setPolymerMaterial(prod.polymerMaterial);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!componentName.trim() || !componentPartNumber.trim() || plannedQuantity <= 0) {
      alert('Please provide valid Component Name, Part Number, and Planned Quantity.');
      return;
    }

    const selectedMach = machines.find((m) => m.id === machineId) || machines[0];

    if (planToEdit) {
      const updated: ProductionPlanRecord = {
        ...planToEdit,
        componentName,
        componentPartNumber,
        customer,
        customerPartNumber,
        productFamily,
        productId,
        machineId: selectedMach.id,
        machineCode: selectedMach.code,
        machineTonnage: selectedMach.tonnage || 180,
        mouldCode,
        cavities,
        cycleTimeSec,
        partsPerCycle: cavities,
        cyclesPerHour,
        expectedProductionRatePerHour: expectedRatePerHour,
        targetPerShift,
        targetPerDay,
        efficiencyPct,
        scrapAllowancePct,
        changeoverDurationMins,
        requiredQuantity,
        plannedQuantity,
        balanceQuantity: Math.max(0, plannedQuantity - (planToEdit.alreadyProduced || 0)),
        priority,
        dueDate,
        plannedStartDate,
        plannedEndDate,
        shiftCode,
        polymerMaterial,
        resinGrade,
        masterbatchColor,
        status,
      };
      updateProductionPlan(updated);
    } else {
      addProductionPlan({
        companyId: 'comp-apex',
        componentName,
        componentPartNumber,
        customer,
        customerPartNumber,
        productFamily,
        productId,
        machineId: selectedMach.id,
        machineCode: selectedMach.code,
        machineTonnage: selectedMach.tonnage || 180,
        mouldCode,
        cavities,
        cycleTimeSec,
        partsPerCycle: cavities,
        cyclesPerHour,
        expectedProductionRatePerHour: expectedRatePerHour,
        targetPerShift,
        targetPerDay,
        efficiencyPct,
        scrapAllowancePct,
        changeoverDurationMins,
        plannedDowntimeMins: 30,
        requiredQuantity,
        plannedQuantity,
        alreadyProduced: 0,
        balanceQuantity: plannedQuantity,
        priority,
        dueDate,
        plannedStartDate,
        plannedEndDate,
        shiftId: 'shift-a',
        shiftCode,
        polymerMaterial,
        resinGrade,
        masterbatchColor,
        status: 'PLANNED',
        planApprovalStatus: 'Approved',
        approvedBy: currentUser.name,
        approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
    }

    triggerHaptic();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl text-slate-100 my-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {planToEdit ? `Edit Production Plan: ${planToEdit.planNumber}` : 'Create New Component Production Plan'}
              </h2>
              <p className="text-xs text-slate-400">
                PPC scheduling engine with automated cycle time & capacity calculations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Quick Preset Selector from Product Master */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-200">Select From Product Master</div>
              <div className="text-[11px] text-slate-400">Auto-fills mould code, standard cycle time, cavities, and polymer</div>
            </div>
            <select
              value={productId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500 w-full sm:w-64"
            >
              <option value="">-- Choose Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section 1: Component & Customer Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <Package className="w-3.5 h-3.5 text-cyan-400" />
              Component & Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Component Name *</label>
                <input
                  type="text"
                  required
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                  placeholder="e.g. Front Bumper Grille Clip"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Part Number / SKU *</label>
                <input
                  type="text"
                  required
                  value={componentPartNumber}
                  onChange={(e) => setComponentPartNumber(e.target.value)}
                  placeholder="e.g. TATA-IM-901"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="e.g. Tata Motors Ltd"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Customer Part No.</label>
                <input
                  type="text"
                  value={customerPartNumber}
                  onChange={(e) => setCustomerPartNumber(e.target.value)}
                  placeholder="e.g. 5442-8819-01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Product Family</label>
                <input
                  type="text"
                  value={productFamily}
                  onChange={(e) => setProductFamily(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Polymer / Material</label>
                <input
                  type="text"
                  value={polymerMaterial}
                  onChange={(e) => setPolymerMaterial(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Machine, Mould & Tooling Parameters */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              Machine, Mould & Cycle Parameters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Assigned Machine *</label>
                <select
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:border-cyan-500"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name} ({m.tonnage}T)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Mould Code</label>
                <input
                  type="text"
                  value={mouldCode}
                  onChange={(e) => setMouldCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Active Cavities</label>
                <input
                  type="number"
                  min="1"
                  max="64"
                  value={cavities}
                  onChange={(e) => setCavities(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Cycle Time (seconds)</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={cycleTimeSec}
                  onChange={(e) => setCycleTimeSec(Math.max(5, parseFloat(e.target.value) || 5))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Efficiency Factor (%)</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={efficiencyPct}
                  onChange={(e) => setEfficiencyPct(Math.min(100, Math.max(50, parseFloat(e.target.value) || 85)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Scrap Allowance (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="15"
                  value={scrapAllowancePct}
                  onChange={(e) => setScrapAllowancePct(parseFloat(e.target.value) || 1.5)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Changeover Time (mins)</label>
                <input
                  type="number"
                  min="0"
                  max="240"
                  value={changeoverDurationMins}
                  onChange={(e) => setChangeoverDurationMins(parseInt(e.target.value) || 45)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Quantity, Priority & Schedule */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Target Quantities, Priority & Due Dates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Required Customer Qty</label>
                <input
                  type="number"
                  min="1"
                  value={requiredQuantity}
                  onChange={(e) => setRequiredQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">PPC Planned Qty (with Scrap)</label>
                <input
                  type="number"
                  min="1"
                  value={plannedQuantity}
                  onChange={(e) => setPlannedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono font-bold text-cyan-400 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:border-cyan-500 font-semibold"
                >
                  <option value="CRITICAL" className="text-rose-400">CRITICAL (Hot Order)</option>
                  <option value="HIGH" className="text-amber-400">HIGH Priority</option>
                  <option value="MEDIUM" className="text-blue-400">MEDIUM Standard</option>
                  <option value="LOW" className="text-slate-400">LOW Buffer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Customer Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Planned Start</label>
                <input
                  type="datetime-local"
                  value={plannedStartDate}
                  onChange={(e) => setPlannedStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:border-cyan-500 text-[11px]"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Planned End</label>
                <input
                  type="datetime-local"
                  value={plannedEndDate}
                  onChange={(e) => setPlannedEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:border-cyan-500 text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Real-time Dynamic Calculation Preview */}
          <div className="bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-indigo-950/40 p-4 rounded-xl border border-cyan-500/30">
            <div className="font-bold text-cyan-300 text-xs mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Automated Shopfloor Target Calculations
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Production Rate</div>
                <div className="text-sm font-bold text-white mt-0.5">{expectedRatePerHour} <span className="text-[10px] font-normal text-slate-400">pcs/hr</span></div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Shift Target (8 hrs)</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">{targetPerShift.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">pcs</span></div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Daily Target (3 shifts)</div>
                <div className="text-sm font-bold text-cyan-400 mt-0.5">{targetPerDay.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">pcs/day</span></div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Est. Time Required</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">{estimatedHoursRequired} hrs <span className="text-[10px] font-normal text-slate-400">({estimatedDaysRequired} d)</span></div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              {planToEdit ? 'Save Plan Changes' : 'Create & Schedule Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
