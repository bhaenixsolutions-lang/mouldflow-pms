import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  Package,
  Calendar,
  Layers,
  ArrowUpDown,
  Download,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ProductionPlanRecord } from '../../../types/ppc';

interface PPCComponentPlansTabProps {
  onOpenCreatePlan: () => void;
  onEditPlan: (plan: ProductionPlanRecord) => void;
}

export const PPCComponentPlansTab: React.FC<PPCComponentPlansTabProps> = ({
  onOpenCreatePlan,
  onEditPlan,
}) => {
  const {
    productionPlans,
    machines,
    currentUser,
    approveProductionPlan,
    rejectProductionPlan,
    deleteProductionPlan,
    triggerHaptic,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('ALL');
  const [selectedMachine, setSelectedMachine] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [rejectModalPlanId, setRejectModalPlanId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Extract unique customers
  const customers = Array.from(new Set(productionPlans.map((p) => p.customer).filter(Boolean)));

  // Filter plans
  const filteredPlans紧 = productionPlans.filter((plan) => {
    const matchesSearch =
      plan.componentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.componentPartNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.planNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.customerPartNumber && plan.customerPartNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCustomer喧 = selectedCustomer === 'ALL' || plan.customer === selectedCustomer;
    const matchesMachine = selectedMachine === 'ALL' || plan.machineCode === selectedMachine;
    const matchesStatus = selectedStatus === 'ALL' || plan.status === selectedStatus;
    const matchesPriority = selectedPriority === 'ALL' || plan.priority === selectedPriority;

    return matchesSearch && matchesCustomer喧 && matchesMachine && matchesStatus && matchesPriority;
  });

  const handleApprove = (planId: string) => {
    approveProductionPlan(planId, currentUser.name);
    triggerHaptic();
  };

  const handleOpenReject = (planId: string) => {
    setRejectModalPlanId(planId);
    setRejectReason('');
  };

  const handleConfirmReject = () => {
    if (!rejectModalPlanId || !rejectReason.trim()) return;
    rejectProductionPlan(rejectModalPlanId, rejectReason);
    setRejectModalPlanId(null);
    setRejectReason('');
    triggerHaptic();
  };

  const handleDelete = (planId: string) => {
    if (window.confirm('Are you sure you want to delete this production plan?')) {
      deleteProductionPlan(planId);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Plan Number',
      'Component Name',
      'Part Number',
      'Customer',
      'Machine',
      'Mould Code',
      'Cavities',
      'Cycle Time (s)',
      'Rate/Hr',
      'Planned Qty',
      'Produced Qty',
      'Balance Qty',
      'Due Date',
      'Priority',
      'Status',
      'Approval',
    ];

    const rows = filteredPlans紧.map((p) => [
      p.planNumber,
      `"${p.componentName}"`,
      p.componentPartNumber,
      `"${p.customer}"`,
      p.machineCode,
      p.mouldCode,
      p.cavities,
      p.cycleTimeSec,
      p.expectedProductionRatePerHour,
      p.plannedQuantity,
      p.alreadyProduced || 0,
      p.balanceQuantity,
      p.dueDate,
      p.priority,
      p.status,
      p.planApprovalStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link進 = document.createElement('a');
    link進.setAttribute('href', encodedUri);
    link進.setAttribute('download', `PPC_Production_Plan_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link進);
    link進.click();
    document.body.removeChild(link進);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search component name, part #, plan number, customer..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic();
                onOpenCreatePlan();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Plan</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Customer</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-cyan-500"
            >
              <option value="ALL">All Customers</option>
              {customers.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Machine</label>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-cyan-500"
            >
              <option value="ALL">All Machines</option>
              {machines.map((m) => (
                <option key={m.id} value={m.code}>{m.code} ({m.tonnage}T)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PLANNED">PLANNED</option>
              <option value="RUNNING">RUNNING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="DELAYED">DELAYED</option>
              <option value="ON HOLD">ON HOLD</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-cyan-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL (Hot)</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plans List Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="font-bold text-slate-300">
            Component Plans ({filteredPlans紧.length})
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Showing component-wise targets and shopfloor loading
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-3">Plan Details</th>
                <th className="py-3 px-3">Customer & Part</th>
                <th className="py-3 px-3">Machine & Mould</th>
                <th className="py-3 px-3">Cycle & Targets</th>
                <th className="py-3 px-3">Planned vs Produced</th>
                <th className="py-3 px-3">Due Date & Priority</th>
                <th className="py-3 px-3">Workflow Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPlans紧.map((plan) => {
                const completionPct = plan.plannedQuantity > 0 ? Math.round(((plan.alreadyProduced || 0) / plan.plannedQuantity) * 100) : 0;
                const isOverdue = new Date(plan.dueDate) < new Date() && plan.balanceQuantity > 0;

                const priorityColors = {
                  CRITICAL: 'bg-rose-600/20 text-rose-300 border-rose-500/40',
                  HIGH: 'bg-amber-600/20 text-amber-300 border-amber-500/40',
                  MEDIUM: 'bg-blue-600/20 text-blue-300 border-blue-500/40',
                  LOW: 'bg-slate-700 text-slate-300 border-slate-600',
                }[plan.priority] || 'bg-slate-800 text-slate-300 border-slate-700';

                return (
                  <tr key={plan.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Plan Details */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-cyan-400">{plan.planNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Start: {plan.plannedStartDate.substring(0, 10)}
                      </div>
                      {plan.isImpactedByBreakdown && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          Re-routed from {plan.breakdownMachineCode}
                        </div>
                      )}
                    </td>

                    {/* Customer & Part */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-100">{plan.componentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{plan.componentPartNumber}</div>
                      <div className="text-[10px] text-blue-400 font-medium mt-0.5">{plan.customer}</div>
                    </td>

                    {/* Machine & Mould */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold text-[11px]">
                          {plan.machineCode}
                        </span>
                        <span className="text-[11px] text-slate-400">({plan.machineTonnage}T)</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Mould: <span className="text-slate-200">{plan.mouldCode}</span> ({plan.cavities} cav)
                      </div>
                    </td>

                    {/* Cycle & Targets */}
                    <td className="py-3 px-3 font-mono">
                      <div className="text-slate-200">
                        <span className="font-bold text-emerald-400">{plan.expectedProductionRatePerHour}</span> pcs/hr
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Shift: {plan.targetPerShift.toLocaleString()} pcs
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Cycle: {plan.cycleTimeSec}s @ {plan.efficiencyPct}% eff
                      </div>
                    </td>

                    {/* Planned vs Produced */}
                    <td className="py-3 px-3 min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="text-slate-200 font-bold">{plan.alreadyProduced || 0}</span>
                        <span className="text-slate-400">/ {plan.plannedQuantity.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            completionPct >= 100 ? 'bg-emerald-500' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${Math.min(100, completionPct)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono mt-0.5 flex items-center justify-between">
                        <span>Bal: {plan.balanceQuantity.toLocaleString()}</span>
                        <span>{completionPct}%</span>
                      </div>
                    </td>

                    {/* Due Date & Priority */}
                    <td className="py-3 px-3">
                      <div className={`font-mono text-xs font-semibold ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                        {plan.dueDate}
                      </div>
                      <div className="mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityColors}`}>
                          {plan.priority}
                        </span>
                      </div>
                    </td>

                    {/* Workflow Status */}
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            plan.status === 'RUNNING'
                              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                              : plan.status === 'PLANNED'
                              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                              : plan.status === 'COMPLETED'
                              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {plan.status}
                        </span>

                        <div className="text-[10px]">
                          {plan.planApprovalStatus === 'Approved' ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          ) : plan.planApprovalStatus === 'Rejected' ? (
                            <span className="text-rose-400 flex items-center gap-1 font-semibold">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          ) : (
                            <div className="flex items-center gap-1 mt-1">
                              <button
                                onClick={() => handleApprove(plan.id)}
                                className="p-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[10px] font-bold"
                                title="Approve Plan"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenReject(plan.id)}
                                className="p-1 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-[10px] font-bold"
                                title="Reject Plan"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditPlan(plan)}
                          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Plan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectModalPlanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-slate-100">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              Reject Production Plan
            </h3>
            <p className="text-xs text-slate-400">
              Please specify the reason for rejecting this PPC plan (e.g. Mould unavailability, material lead-time, capacity overload):
            </p>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection justification..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-hidden focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setRejectModalPlanId(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
