import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Star,
  Check,
  Cpu,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PracticalCompetencyEvaluation, PracticalCriteriaScore } from '../../types/training';

interface PracticalEvaluationModalProps {
  onClose: () => void;
  preselectedEmployeeId?: string;
  preselectedMachineId?: string;
  preselectedTrainingId?: string;
}

const DEFAULT_CRITERIA: { criteria: string; weightage: number; maxScore: number }[] = [
  { criteria: 'Pre-Start Checks & Safety Guard Interlocks', weightage: 20, maxScore: 5 },
  { criteria: 'Correct Parameter Verification (Barrel Temp, Mold Temp, Clamping)', weightage: 20, maxScore: 5 },
  { criteria: 'Defect Identification & Part Visual Quality Inspection', weightage: 20, maxScore: 5 },
  { criteria: 'Standard Operating Procedure (SOP) Compliance & Cycle Rhythm', weightage: 20, maxScore: 5 },
  { criteria: 'Workstation 5S, Safe Scrap Segregation & Hourly Log Entry', weightage: 20, maxScore: 5 },
];

export const PracticalEvaluationModal: React.FC<PracticalEvaluationModalProps> = ({
  onClose,
  preselectedEmployeeId,
  preselectedMachineId,
  preselectedTrainingId,
}) => {
  const {
    users,
    machines,
    departments,
    trainingMasters,
    currentUser,
    submitPracticalEvaluation,
    triggerHaptic,
  } = useApp();

  const [employeeId, setEmployeeId] = useState(preselectedEmployeeId || users[0]?.id || '');
  const [machineId, setMachineId] = useState(preselectedMachineId || machines[0]?.id || '');
  const [trainingId, setTrainingId] = useState(
    preselectedTrainingId || trainingMasters.find((t) => t.isMachineSpecific)?.id || trainingMasters[0]?.id || ''
  );
  const [evaluationDate, setEvaluationDate] = useState(new Date().toISOString().slice(0, 10));
  const [scores, setScores] = useState<Record<number, number>>({
    0: 4,
    1: 4,
    2: 4,
    3: 5,
    4: 4,
  });
  const [evaluatorComments, setEvaluatorComments] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [recommendedTrainingId, setRecommendedTrainingId] = useState('');

  const selectedEmp = users.find((u) => u.id === employeeId);
  const selectedMachine = machines.find((m) => m.id === machineId);
  const selectedTraining = trainingMasters.find((t) => t.id === trainingId);

  // Calculate weighted score
  const totalMaxPoints = DEFAULT_CRITERIA.length * 5;
  const scoreArray: number[] = Object.values(scores);
  const currentTotalPoints = scoreArray.reduce((acc: number, curr: number) => acc + (Number(curr) || 0), 0);
  const calculatedPercentage = Math.round((currentTotalPoints / (totalMaxPoints || 1)) * 100);

  // Determine competency recommendation
  const defaultCompetency = calculatedPercentage >= 80 ? 'Competent' : calculatedPercentage >= 65 ? 'Needs Supervision' : 'Not Competent';
  const [competencyResult, setCompetencyResult] = useState<'Competent' | 'Needs Supervision' | 'Not Competent'>(defaultCompetency);

  const handleScoreChange = (index: number, val: number) => {
    triggerHaptic();
    const newScores: Record<number, number> = { ...scores, [index]: val };
    setScores(newScores);

    const valuesList: number[] = Object.values(newScores);
    const totalPts = valuesList.reduce((acc: number, curr: number) => acc + (Number(curr) || 0), 0);
    const pct = Math.round((totalPts / (totalMaxPoints || 1)) * 100);
    if (pct >= 80) setCompetencyResult('Competent');
    else if (pct >= 65) setCompetencyResult('Needs Supervision');
    else setCompetencyResult('Not Competent');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const criteriaList: PracticalCriteriaScore[] = DEFAULT_CRITERIA.map((crit, idx) => ({
      criteria: crit.criteria,
      score: scores[idx] || 3,
      maxScore: crit.maxScore,
      weightage: crit.weightage,
      remarks: scores[idx] < 3 ? 'Improvement needed during trial run' : 'Demonstrated correctly',
    }));

    // Next expiry (1 year for competent)
    const expiryDate =
      competencyResult === 'Competent'
        ? new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10)
        : undefined;

    submitPracticalEvaluation({
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.name,
      employeeCode: selectedEmp.employeeCode,
      departmentId: selectedEmp.departmentId || 'dept-moulding',
      machineId: selectedMachine?.id,
      machineCode: selectedMachine?.code,
      evaluatorId: currentUser.id,
      evaluatorName: currentUser.name,
      evaluationDate,
      criteriaScores: criteriaList,
      overallScorePct: calculatedPercentage,
      competencyResult,
      supervisorComments: evaluatorComments || 'Evaluated standard operating run under live production.',
      retrainingRequired: competencyResult === 'Not Competent',
      recommendedTrainingId: competencyResult === 'Not Competent' ? recommendedTrainingId || trainingId : undefined,
      correctiveActionRecommended: correctiveAction,
      qualificationExpiryDate: expiryDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800/90 border-b border-slate-700/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Practical Competency Assessment
              </h2>
              <p className="text-xs text-slate-400">
                Machine Operation Skill Audit & Qualification Sign-off
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
          {/* Target Candidate & Machine Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Candidate / Operator
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-medium"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.employeeCode}) - {u.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Machine Qualification
              </label>
              <select
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-medium"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.name} ({m.tonnage}T)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Related Training Module
              </label>
              <select
                value={trainingId}
                onChange={(e) => setTrainingId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-medium"
              >
                {trainingMasters.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} - {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Evaluation Date
              </label>
              <input
                type="date"
                value={evaluationDate}
                onChange={(e) => setEvaluationDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>
          </div>

          {/* Practical Checkpoints Rubric */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Assessment Checkpoints (Rate 1 to 5)
              </h3>
              <span className="text-xs text-slate-400 font-medium">1 = Poor, 5 = Excellent</span>
            </div>

            <div className="space-y-2.5">
              {DEFAULT_CRITERIA.map((crit, idx) => {
                const currentScore = scores[idx] || 0;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-200">
                        {idx + 1}. {crit.criteria}
                      </p>
                      <span className="text-[11px] text-slate-400 font-mono">Weightage: {crit.weightage}%</span>
                    </div>

                    {/* Rating buttons 1..5 */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleScoreChange(idx, num)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            currentScore === num
                              ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 font-black shadow-md shadow-cyan-900/40'
                              : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Calculated Score Card */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Overall Practical Competency Score
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-cyan-400">{calculatedPercentage}%</span>
                <span className="text-xs text-slate-400">
                  ({currentTotalPoints} / {totalMaxPoints} total points)
                </span>
              </div>
            </div>

            {/* Competency result selector */}
            <div className="text-right">
              <label className="block text-[11px] text-slate-400 mb-1">Supervisor Decision</label>
              <select
                value={competencyResult}
                onChange={(e) => setCompetencyResult(e.target.value as any)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none ${
                  competencyResult === 'Competent'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : competencyResult === 'Needs Supervision'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                    : 'bg-rose-950/60 border-rose-500 text-rose-300'
                }`}
              >
                <option value="Competent">Competent (Qualified)</option>
                <option value="Needs Supervision">Needs Supervision (Level 2)</option>
                <option value="Not Competent">Not Competent (Retraining)</option>
              </select>
            </div>
          </div>

          {/* Comments & Retraining Section */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Evaluator Observations & Notes
              </label>
              <textarea
                rows={2}
                value={evaluatorComments}
                onChange={(e) => setEvaluatorComments(e.target.value)}
                placeholder="Observed cycle speed, safety gate handling, and quality gauge measurement accuracy..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {competencyResult === 'Not Competent' && (
              <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl space-y-2.5 animate-fadeIn">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" /> Trigger Automated Corrective Retraining
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">
                    Select Retraining Module
                  </label>
                  <select
                    value={recommendedTrainingId}
                    onChange={(e) => setRecommendedTrainingId(e.target.value)}
                    className="w-full bg-slate-900 border border-rose-500/30 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="">-- Choose Module --</option>
                    {trainingMasters.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.code} - {t.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">
                    Corrective Recommendation
                  </label>
                  <input
                    type="text"
                    value={correctiveAction}
                    onChange={(e) => setCorrectiveAction(e.target.value)}
                    placeholder="E.g., Complete 3 supervised trial runs on Mold Loading"
                    className="w-full bg-slate-900 border border-rose-500/30 rounded-lg p-2 text-xs text-slate-200"
                  />
                </div>
              </div>
            )}
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
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold shadow-lg shadow-cyan-950/50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Submit Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
