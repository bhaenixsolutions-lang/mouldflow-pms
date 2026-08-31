import React, { useState } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
  User,
  Shield,
  HelpCircle,
  Clock,
  ArrowRight,
  ListChecks,
  CheckSquare,
  Square,
  MinusCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TrainingSignOffSession, PracticalChecklistItem } from '../../types/training';

interface PracticalTrainingModalProps {
  session: TrainingSignOffSession;
  onClose: () => void;
  onProceedToOperatorAck: (updatedSession: TrainingSignOffSession) => void;
}

const DEFAULT_PRACTICAL_CHECKLIST: Array<{ id: string; label: string; description: string }> = [
  {
    id: 'chk-1',
    label: 'Machine safety explained',
    description: 'Operator briefed on mechanical drop bars, hydraulic safety doors, and interlock operation.',
  },
  {
    id: 'chk-2',
    label: 'Emergency stop demonstrated',
    description: 'Physical location of front/rear E-Stops and immediate motor shutdown demonstrated.',
  },
  {
    id: 'chk-3',
    label: 'PPE requirements explained',
    description: 'Thermal Kevlar gloves, eye protection, and ESD footwear requirements reviewed.',
  },
  {
    id: 'chk-4',
    label: 'Machine start-up procedure demonstrated',
    description: 'Hydraulic pump on, barrel heater zone stabilization, and cooling water manifold valve check.',
  },
  {
    id: 'chk-5',
    label: 'Parameter verification explained',
    description: 'Matching HMI settings against approved Mould Setting Card (Cushion, Injection Pressure, Cycle Time).',
  },
  {
    id: 'chk-6',
    label: 'Mould loading/unloading demonstrated',
    description: 'Clamping toggle alignment, low pressure mould protection (LPMP), and ejector stroke setup.',
  },
  {
    id: 'chk-7',
    label: 'First-piece inspection explained',
    description: 'Sampling 5 consecutive parts, checking critical visual defects (Sink, Short, Flash), and boundary samples.',
  },
  {
    id: 'chk-8',
    label: 'Abnormal condition response explained',
    description: 'Action on heater alarm, nozzle drool, mold jam, and immediate reporting protocol.',
  },
  {
    id: 'chk-9',
    label: 'Shutdown procedure demonstrated',
    description: 'Screw purge with neutral material, heater setback, hydraulic motor stop, and 5S clean-up.',
  },
];

export const PracticalTrainingModal: React.FC<PracticalTrainingModalProps> = ({
  session,
  onClose,
  onProceedToOperatorAck,
}) => {
  const { triggerHaptic } = useApp();

  const [progressStatus, setProgressStatus] = useState<'Not Started' | 'In Progress' | 'Completed'>(
    session.trainingProgress || 'In Progress'
  );

  const [checklist, setChecklist] = useState<Record<string, 'Completed' | 'Not Completed' | 'Not Applicable'>>(() => {
    const initial: Record<string, 'Completed' | 'Not Completed' | 'Not Applicable'> = {};
    DEFAULT_PRACTICAL_CHECKLIST.forEach((item) => {
      initial[item.id] = 'Completed';
    });
    return initial;
  });

  const [trainerRemarks, setTrainerRemarks] = useState<string>(
    session.trainerRemarks || 'Operator demonstrated thorough understanding of safety and operating procedures on the shop floor.'
  );

  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleStatusChange = (id: string, status: 'Completed' | 'Not Completed' | 'Not Applicable') => {
    triggerHaptic();
    setChecklist((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  const handleMarkAllCompleted = () => {
    triggerHaptic();
    const updated: Record<string, 'Completed' | 'Not Completed' | 'Not Applicable'> = {};
    DEFAULT_PRACTICAL_CHECKLIST.forEach((item) => {
      updated[item.id] = 'Completed';
    });
    setChecklist(updated);
    setProgressStatus('Completed');
  };

  const handleSubmit = () => {
    const incompleteCount = Object.values(checklist).filter((st) => st === 'Not Completed').length;
    if (incompleteCount > 0) {
      setErrorMessage(`There are ${incompleteCount} items marked as "Not Completed". Please verify before proceeding.`);
      triggerHaptic();
      return;
    }

    triggerHaptic();

    const practicalItems: PracticalChecklistItem[] = DEFAULT_PRACTICAL_CHECKLIST.map((item) => ({
      id: item.id,
      label: item.label,
      description: item.description,
      status: checklist[item.id] || 'Completed',
      completedAt: new Date().toISOString(),
      trainerRemarks,
    }));

    const updated: TrainingSignOffSession = {
      ...session,
      trainingProgress: 'Completed',
      checklistItemsCompleted: true,
      practicalCheckpointsPassed: true,
      practicalChecklist: practicalItems,
      trainerRemarks,
      status: 'Training Completed',
    };

    onProceedToOperatorAck(updated);
  };

  const completedCount = Object.values(checklist).filter((st) => st === 'Completed').length;
  const totalCount = DEFAULT_PRACTICAL_CHECKLIST.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-amber-950/50">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Step 2: Practical Demonstration &amp; SOP Execution
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                TRAINING SCREEN &amp; SOP CHECKLIST
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[78vh]">
          {/* Header Info Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-850 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Training Title</span>
              <p className="font-bold text-white text-sm truncate">{session.trainingProgramTitle}</p>
              <span className="text-slate-400 font-mono text-[11px]">{session.trainingProgramCode || 'PRG-SAF-104'}</span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Operator &amp; ID</span>
              <p className="font-bold text-white text-sm">{session.employeeName}</p>
              <span className="text-amber-400 font-mono text-[11px]">ID: {session.employeeCode || session.employeeId}</span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Trainer &amp; Machine</span>
              <p className="font-bold text-slate-200 text-xs">{session.trainerName}</p>
              <span className="text-slate-400 text-[11px]">{session.machineCode || 'IMM-01 Cell Line'}</span>
            </div>
          </div>

          {/* SOP Learning Objectives */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400" />
              SOP &amp; Learning Objectives (Shop Floor Demonstration)
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>Verify mechanical, electrical &amp; hydraulic door safety interlocks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>Immediate E-Stop trigger and emergency evacuation path.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>First-piece dimensional verification and boundary sample matching.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>Purge blob handling with 400°C rated Kevlar PPE and face shield.</span>
              </li>
            </ul>
          </div>

          {/* Practical 9-Point Checklist */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-amber-400" />
                  Practical Training Checklist (9-Point Shop Floor Sign-Off)
                </h3>
                <p className="text-xs text-slate-400">
                  Completed: <strong className="text-amber-400">{completedCount}</strong> of {totalCount} items
                </p>
              </div>

              <button
                type="button"
                onClick={handleMarkAllCompleted}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white text-xs font-bold transition-colors self-start sm:self-auto"
              >
                Mark All as Completed
              </button>
            </div>

            <div className="space-y-2.5">
              {DEFAULT_PRACTICAL_CHECKLIST.map((item, idx) => {
                const currentStatus = checklist[item.id] || 'Completed';
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-white">{item.label}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-7">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-7 sm:pl-0">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'Completed')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                          currentStatus === 'Completed'
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'Not Completed')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                          currentStatus === 'Not Completed'
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-950'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <MinusCircle className="w-3 h-3" />
                        Not Completed
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'Not Applicable')}
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          currentStatus === 'Not Applicable'
                            ? 'bg-slate-600 text-white'
                            : 'bg-slate-900 text-slate-500 hover:bg-slate-800'
                        }`}
                      >
                        N/A
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trainer Observations / Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Trainer Remarks on Practical Demonstration
            </label>
            <textarea
              rows={2}
              value={trainerRemarks}
              onChange={(e) => setTrainerRemarks(e.target.value)}
              placeholder="Enter specific practical observations or guidance given to the operator..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-amber-950/60 transition-all flex items-center justify-center gap-2"
            >
              <span>Complete Practical Demonstration &amp; Proceed to Operator Sign-off</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
