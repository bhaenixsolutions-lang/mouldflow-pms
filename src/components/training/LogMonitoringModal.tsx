import React, { useState } from 'react';
import {
  X,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Check,
  Shield,
  Activity,
  Cpu,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MonitoringCheckpointItem } from '../../types/training';

interface LogMonitoringModalProps {
  onClose: () => void;
  preselectedEmployeeId?: string;
  preselectedMachineId?: string;
}

const DEFAULT_MONITORING_ITEMS: { category: MonitoringCheckpointItem['category']; checkpoint: string }[] = [
  { category: 'Safety & PPE', checkpoint: 'Operator wearing complete PPE (Safety goggles, Heat-resistant gloves, Steel-toe shoes)' },
  { category: 'Safety & PPE', checkpoint: 'Safety gate interlock and emergency stop check completed without bypass' },
  { category: 'SOP Compliance', checkpoint: 'Operating procedure displayed, understood and followed sequentially' },
  { category: 'Machine Operation', checkpoint: 'Cycle time within tolerance (±1.5s of target cycle)' },
  { category: 'Machine Operation', checkpoint: 'Cushion position & injection pressure verified against process parameter sheet' },
  { category: 'Quality Checks', checkpoint: 'First-piece & hourly visual inspection performed (No flash, short shot, or sink marks)' },
  { category: 'Quality Checks', checkpoint: 'Part weight recorded on digital scale within tolerance limits' },
  { category: 'Housekeeping & 5S', checkpoint: 'Clean workspace, no oil leakages, runner & purge material segregated in labeled bins' },
];

export const LogMonitoringModal: React.FC<LogMonitoringModalProps> = ({
  onClose,
  preselectedEmployeeId,
  preselectedMachineId,
}) => {
  const {
    users,
    machines,
    departments,
    shifts,
    trainingMasters,
    currentUser,
    submitShopfloorMonitoring,
    triggerHaptic,
  } = useApp();

  const [employeeId, setEmployeeId] = useState(preselectedEmployeeId || users[0]?.id || '');
  const [machineId, setMachineId] = useState(preselectedMachineId || machines[0]?.id || '');
  const [shiftId, setShiftId] = useState(shifts[0]?.id || 'shift-a');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [monitoringType, setMonitoringType] = useState<'Routine' | 'Random Spot-Check' | 'Post-Incident' | 'Post-Training' | 'Quality Audit'>('Routine');

  const [checklist, setChecklist] = useState<Record<number, { status: 'OK' | 'Deviation' | 'Critical Issue' | 'N/A'; remarks: string }>>({
    0: { status: 'OK', remarks: '' },
    1: { status: 'OK', remarks: '' },
    2: { status: 'OK', remarks: '' },
    3: { status: 'OK', remarks: '' },
    4: { status: 'OK', remarks: '' },
    5: { status: 'OK', remarks: '' },
    6: { status: 'OK', remarks: '' },
    7: { status: 'OK', remarks: '' },
  });

  const [closureRemarks, setClosureRemarks] = useState('');
  const [retrainingTrainingId, setRetrainingTrainingId] = useState('');

  const selectedEmp = users.find((u) => u.id === employeeId);
  const selectedMachine = machines.find((m) => m.id === machineId);

  // Scoring calculation
  let okCount = 0;
  let deviationCount = 0;
  let criticalCount = 0;
  let totalAudited = 0;

  Object.values(checklist).forEach((item: { status: 'OK' | 'Deviation' | 'Critical Issue' | 'N/A'; remarks: string }) => {
    if (item.status === 'OK') {
      okCount++;
      totalAudited++;
    } else if (item.status === 'Deviation') {
      deviationCount++;
      totalAudited++;
    } else if (item.status === 'Critical Issue') {
      criticalCount++;
      totalAudited++;
    }
  });

  const rawScorePct = totalAudited > 0 ? Math.round(((okCount + deviationCount * 0.5) / totalAudited) * 100) : 100;
  const scorePct = criticalCount > 0 ? Math.min(rawScorePct, 65) : rawScorePct;

  const scoreStatus: 'Satisfactory' | 'Needs Improvement' | 'Action Required' =
    criticalCount > 0 || scorePct < 70
      ? 'Action Required'
      : scorePct < 85
      ? 'Needs Improvement'
      : 'Satisfactory';

  const isRetrainingRecommended = scoreStatus === 'Action Required' || scorePct < 75;

  const handleStatusChange = (index: number, newStatus: 'OK' | 'Deviation' | 'Critical Issue' | 'N/A') => {
    triggerHaptic();
    setChecklist((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        status: newStatus,
      },
    }));
  };

  const handleRemarkChange = (index: number, text: string) => {
    setChecklist((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        remarks: text,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const formattedItems: MonitoringCheckpointItem[] = DEFAULT_MONITORING_ITEMS.map((item, idx) => ({
      id: `chk-${idx}`,
      category: item.category,
      checkpoint: item.checkpoint,
      status: checklist[idx]?.status || 'OK',
      remarks: checklist[idx]?.remarks,
    }));

    const matchedMaster = trainingMasters.find((t) => t.id === retrainingTrainingId);

    submitShopfloorMonitoring({
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.name,
      employeeCode: selectedEmp.employeeCode,
      departmentId: selectedEmp.departmentId || 'dept-moulding',
      shiftId,
      machineId: selectedMachine?.id || 'm-imm-01',
      machineCode: selectedMachine?.code || 'GEN-IMM',
      supervisorId: currentUser.id,
      supervisorName: currentUser.name,
      date,
      time: new Date().toTimeString().slice(0, 5),
      monitoringDate: date,
      monitoringType,
      checkpoints: formattedItems,
      items: formattedItems,
      monitoringScorePct: scorePct,
      scoreStatus,
      criticalIssuesCount: criticalCount,
      deviationsCount: deviationCount,
      retrainingRecommended: isRetrainingRecommended,
      retrainingTrainingId: isRetrainingRecommended ? retrainingTrainingId || trainingMasters[0]?.id : undefined,
      retrainingTrainingName: matchedMaster?.title,
      closureRemarks: closureRemarks || 'Live shopfloor audit completed.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800/90 border-b border-slate-700/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Log Shopfloor Monitoring Audit
              </h2>
              <p className="text-xs text-slate-400">
                Live Operator Quality, Safety & SOP Adherence Check
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Monitored Employee
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.employeeCode}) - {u.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Active Machine
              </label>
              <select
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Audit Type
              </label>
              <select
                value={monitoringType}
                onChange={(e) => setMonitoringType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Routine">Routine Shift Audit</option>
                <option value="Random Spot-Check">Random Spot-Check</option>
                <option value="Quality Audit">Quality Audit</option>
                <option value="Post-Incident">Post-Incident Check</option>
                <option value="Post-Training">Post-Training Verification</option>
              </select>
            </div>
          </div>

          {/* Checkpoints Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" /> Operational Checkpoints
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {okCount} OK • {deviationCount} Deviations • {criticalCount} Critical
              </span>
            </div>

            <div className="space-y-2.5">
              {DEFAULT_MONITORING_ITEMS.map((item, idx) => {
                const cur = checklist[idx] || { status: 'OK', remarks: '' };

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all ${
                      cur.status === 'Critical Issue'
                        ? 'bg-rose-950/30 border-rose-500/50'
                        : cur.status === 'Deviation'
                        ? 'bg-amber-950/30 border-amber-500/50'
                        : 'bg-slate-800/60 border-slate-700/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-700 text-slate-300">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-200">
                          {item.checkpoint}
                        </p>
                      </div>

                      {/* Status Pills */}
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(idx, 'OK')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            cur.status === 'OK'
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                              : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                          }`}
                        >
                          OK
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(idx, 'Deviation')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            cur.status === 'Deviation'
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/50'
                              : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                          }`}
                        >
                          Deviation
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(idx, 'Critical Issue')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            cur.status === 'Critical Issue'
                              ? 'bg-rose-500 text-white shadow-md shadow-rose-950/50'
                              : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                          }`}
                        >
                          Critical
                        </button>
                      </div>
                    </div>

                    {/* Optional remarks when issue or deviation occurs */}
                    {(cur.status === 'Deviation' || cur.status === 'Critical Issue') && (
                      <input
                        type="text"
                        value={cur.remarks}
                        onChange={(e) => handleRemarkChange(idx, e.target.value)}
                        placeholder="Detail the observed deviation or immediate correction..."
                        className="w-full mt-2 bg-slate-900/80 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monitoring Score & Retraining Bar */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Shopfloor Compliance Score
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  className={`text-2xl font-black ${
                    scorePct >= 85
                      ? 'text-emerald-400'
                      : scorePct >= 70
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {scorePct}%
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    scoreStatus === 'Satisfactory'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : scoreStatus === 'Needs Improvement'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300 animate-pulse'
                  }`}
                >
                  {scoreStatus}
                </span>
              </div>
            </div>

            {isRetrainingRecommended && (
              <div className="sm:max-w-xs w-full">
                <label className="block text-[11px] text-amber-300 font-bold mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Auto Corrective Retraining
                </label>
                <select
                  value={retrainingTrainingId}
                  onChange={(e) => setRetrainingTrainingId(e.target.value)}
                  className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-2 text-xs text-amber-200"
                >
                  <option value="">-- Choose Retraining Module --</option>
                  {trainingMasters.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.code} - {t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Overall Supervisor Remarks & Action Summary
            </label>
            <textarea
              rows={2}
              value={closureRemarks}
              onChange={(e) => setClosureRemarks(e.target.value)}
              placeholder="Summary of coaching provided, operator response, and follow-up timeline..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Monitoring Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
