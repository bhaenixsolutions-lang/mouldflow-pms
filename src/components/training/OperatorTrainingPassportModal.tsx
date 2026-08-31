import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  UserCheck,
  Calendar,
  PenTool,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Building,
  HelpCircle,
  Eye,
  Zap,
  ArrowUpRight,
  Printer,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types/schema';

interface OperatorTrainingPassportModalProps {
  operator: User;
  onClose: () => void;
  onStartDigitalTest?: (sessionId?: string, programId?: string) => void;
  onOpenSignOff?: (sessionId?: string) => void;
  onAssignProgram?: (operatorId: string) => void;
}

export const OperatorTrainingPassportModal: React.FC<OperatorTrainingPassportModalProps> = ({
  operator,
  onClose,
  onStartDigitalTest,
  onOpenSignOff,
  onAssignProgram,
}) => {
  const {
    companies,
    companyTrainingPrograms,
    companyQuestionPapers,
    trainingSignOffSessions,
    trainingAssignments,
    practicalEvaluations,
    shopfloorMonitoringRecords,
    correctiveTrainingRecords,
    isOperatorQualifiedForMachine,
    machines,
    departments,
    triggerHaptic,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'programs' | 'signoffs' | 'practicals' | 'capa' | 'tests'>('programs');

  // Filter records specifically for this operator
  const operatorSignOffs = trainingSignOffSessions.filter(
    (s) => s.employeeId === operator.id || s.employeeCode === operator.employeeCode
  );

  const operatorAssignments = trainingAssignments.filter(
    (a) => a.employeeId === operator.id || a.employeeCode === operator.employeeCode
  );

  const operatorPracticals = practicalEvaluations.filter(
    (p) => p.employeeId === operator.id || p.employeeCode === operator.employeeCode
  );

  const operatorAudits = shopfloorMonitoringRecords.filter(
    (m) => m.employeeId === operator.id || m.employeeCode === operator.employeeCode
  );

  const operatorCAPAs = correctiveTrainingRecords.filter(
    (c) => c.employeeId === operator.id || c.employeeCode === operator.employeeCode
  );

  const operatorCompany = companies.find((c) => c.id === operator.companyId) || companies[0];
  const operatorDept = departments.find((d) => d.id === operator.departmentId);
  const operatorMachine = machines.find((m) => m.id === operator.assignedMachineId || m.code === operator.assignedMachineCode);

  // Machine qualification test
  const qualification = operatorMachine
    ? isOperatorQualifiedForMachine(operator.id, operatorMachine.id)
    : { qualified: true };

  // Calculate stats
  const totalProgramsEnrolled = operatorAssignments.length + operatorSignOffs.length;
  const passedTests = operatorSignOffs.filter((s) => s.testResult === 'PASSED').length;
  const certifiedPrograms = operatorAssignments.filter((a) => a.status === 'Completed').length;
  const openCAPACount = operatorCAPAs.filter((c) => c.status === 'Open' || c.status === 'In Progress').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Operator Info */}
        <div className="p-4 sm:p-6 bg-slate-850 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold text-xl shadow-lg shrink-0">
              {operator.avatar ? (
                <img src={operator.avatar} alt={operator.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                operator.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">{operator.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-800 text-amber-300 border border-slate-700">
                  {operator.employeeCode || operator.badgeNumber || operator.id}
                </span>
                {operator.badgeNumber && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-950/60 text-sky-300 border border-sky-800/60">
                    Badge: {operator.badgeNumber}
                  </span>
                )}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    qualification.qualified
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {qualification.qualified ? 'Fully Qualified' : 'Qualification Hold'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {operatorCompany?.name || 'Apex Precision Polymer'}
                </span>
                <span>•</span>
                <span>Role: <strong className="text-slate-200">{operator.designation || operator.role}</strong></span>
                <span>•</span>
                <span>Dept: <strong className="text-slate-200">{operatorDept?.name || 'Moulding'}</strong></span>
                {operatorMachine && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Cpu className="w-3.5 h-3.5" />
                      Station: {operatorMachine.code} ({operatorMachine.name})
                    </span>
                  </>
                )}
                {operator.joiningDate && (
                  <>
                    <span>•</span>
                    <span>Joined: {operator.joiningDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Print Operator Passport"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Qualification / Disqualification Banner if not qualified */}
        {!qualification.qualified && (
          <div className="bg-rose-500/15 border-b border-rose-500/30 px-6 py-2.5 flex items-center justify-between gap-3 text-rose-300 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{qualification.reason || 'Operator has unfulfilled or failed certification criteria for this machine.'}</span>
            </div>
            {onAssignProgram && (
              <button
                onClick={() => {
                  triggerHaptic();
                  onAssignProgram(operator.id);
                }}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs shrink-0"
              >
                Assign Retraining
              </button>
            )}
          </div>
        )}

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/60 border-b border-slate-800 text-xs">
          <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Enrolled Programs</p>
              <p className="text-base font-extrabold text-white">{totalProgramsEnrolled}</p>
            </div>
          </div>

          <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Tests Passed</p>
              <p className="text-base font-extrabold text-emerald-400">{passedTests}</p>
            </div>
          </div>

          <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Two-Stage Sign-Offs</p>
              <p className="text-base font-extrabold text-amber-300">
                {operatorSignOffs.filter((s) => s.trainerPreSigned && s.operatorAckSigned).length} / {operatorSignOffs.length}
              </p>
            </div>
          </div>

          <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Open CAPA Retraining</p>
              <p className={`text-base font-extrabold ${openCAPACount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                {openCAPACount}
              </p>
            </div>
          </div>
        </div>

        {/* Sub-tabs navigation */}
        <div className="flex items-center gap-2 px-4 pt-3 bg-slate-900 border-b border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'programs', label: 'Assigned Programs & Modules', icon: Award, count: operatorAssignments.length },
            { id: 'signoffs', label: 'Two-Stage Sign-Off Sessions', icon: PenTool, count: operatorSignOffs.length },
            { id: 'practicals', label: 'Practical Evaluations', icon: UserCheck, count: operatorPracticals.length },
            { id: 'tests', label: 'Test History & Version Logs', icon: HelpCircle, count: operatorSignOffs.filter((s) => s.testCompleted).length },
            { id: 'capa', label: 'CAPA Corrective Actions', icon: Zap, count: operatorCAPAs.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic();
                  setActiveSubTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Programs Tab */}
          {activeSubTab === 'programs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Training Assignments & Competency Status</h3>
                {onAssignProgram && (
                  <button
                    onClick={() => {
                      triggerHaptic();
                      onAssignProgram(operator.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/40"
                  >
                    + Enroll in New Program
                  </button>
                )}
              </div>

              {operatorAssignments.length === 0 ? (
                <div className="text-center py-10 bg-slate-850/50 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  No standard assignments found for this operator yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {operatorAssignments.map((asg) => (
                    <div
                      key={asg.id}
                      className="bg-slate-850 p-4 rounded-xl border border-slate-800 hover:border-slate-700 space-y-3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-800 text-amber-300">
                              {asg.trainingCode}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                asg.status === 'Completed'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : asg.status === 'Failed' || asg.status === 'Expired'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {asg.status}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-white text-sm mt-1">{asg.trainingTitle}</h4>
                          <p className="text-[11px] text-slate-400">{asg.category}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Assigned</span>
                          <span className="font-semibold text-slate-300">{asg.assignedDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Due Date</span>
                          <span className="font-semibold text-slate-300">{asg.dueDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Test Score</span>
                          <span className={`font-black ${asg.testScorePct && asg.testScorePct >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {asg.testScorePct ? `${asg.testScorePct}%` : 'Pending'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                        <span className="text-slate-400 text-[11px]">Trainer: {asg.trainerName || 'Assigned Lead'}</span>
                        {onStartDigitalTest && (
                          <button
                            onClick={() => {
                              triggerHaptic();
                              onStartDigitalTest(undefined, asg.trainingId);
                            }}
                            className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold rounded-lg border border-sky-500/30 text-[11px] flex items-center gap-1"
                          >
                            Launch Test <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sign-Off Sessions Tab */}
          {activeSubTab === 'signoffs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Two-Stage Training Sign-Off Sessions</h3>
                  <p className="text-xs text-slate-400">
                    Mandatory dual verification by Trainer (Pre-training) & Operator (Acknowledgement & Understanding)
                  </p>
                </div>
              </div>

              {operatorSignOffs.length === 0 ? (
                <div className="text-center py-10 bg-slate-850/50 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  No sign-off sessions recorded for this operator.
                </div>
              ) : (
                <div className="space-y-3">
                  {operatorSignOffs.map((session) => (
                    <div
                      key={session.id}
                      className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-800 text-sky-400">
                              {session.trainingProgramCode}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-950/60 text-purple-300 border border-purple-800/40">
                              Paper Version: {session.questionPaperVersion}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                session.competencyResult === 'Competent'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {session.competencyResult}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-white text-sm mt-1">{session.trainingProgramTitle}</h4>
                        </div>

                        {onOpenSignOff && (
                          <button
                            onClick={() => {
                              triggerHaptic();
                              onOpenSignOff(session.id);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0"
                          >
                            <PenTool className="w-3.5 h-3.5" /> Sign-Off Sheet
                          </button>
                        )}
                      </div>

                      {/* Dual Signatures Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {/* Stage 1: Trainer */}
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Stage 1: Trainer Pre-Training Sign-Off
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black ${
                                session.trainerPreSigned ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {session.trainerPreSigned ? 'SIGNED & AUDITED' : 'PENDING'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            Trainer: <strong className="text-white">{session.trainerName}</strong>
                          </p>
                          {session.trainerPreSignDate && (
                            <p className="text-[10px] text-slate-400">
                              Signed at: {session.trainerPreSignDate} {session.trainerPreSignTime}
                            </p>
                          )}
                          {session.trainerSignatureData && (
                            <div className="h-14 bg-slate-950 rounded-lg p-1 border border-slate-800 flex items-center justify-center">
                              <img
                                src={session.trainerSignatureData}
                                alt="Trainer Sign"
                                className="max-h-full object-contain filter invert opacity-80"
                              />
                            </div>
                          )}
                        </div>

                        {/* Stage 2: Operator */}
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              Stage 2: Operator Acknowledgement
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black ${
                                session.operatorAckSigned ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {session.operatorAckSigned ? 'SIGNED & AUDITED' : 'PENDING'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            Operator: <strong className="text-white">{session.employeeName}</strong> ({session.employeeCode})
                          </p>
                          {session.operatorAckDate && (
                            <p className="text-[10px] text-slate-400">
                              Signed at: {session.operatorAckDate} {session.operatorAckTime}
                            </p>
                          )}
                          {session.operatorSignatureData && (
                            <div className="h-14 bg-slate-950 rounded-lg p-1 border border-slate-800 flex items-center justify-center">
                              <img
                                src={session.operatorSignatureData}
                                alt="Operator Sign"
                                className="max-h-full object-contain filter invert opacity-80"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Test Result summary if taken */}
                      {session.testCompleted && (
                        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-400">
                            Digital Test Score on {session.questionPaperTitle}:
                          </span>
                          <span className="font-extrabold text-white flex items-center gap-2">
                            <span>{session.testScore} / {session.maxScore} marks ({session.testPercentage}%)</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${session.testResult === 'PASSED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                              {session.testResult}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Practical Evaluations Tab */}
          {activeSubTab === 'practicals' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Shopfloor Practical Machine Evaluations</h3>
              {operatorPracticals.length === 0 ? (
                <div className="text-center py-10 bg-slate-850/50 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  No practical evaluations recorded for this operator.
                </div>
              ) : (
                <div className="space-y-3">
                  {operatorPracticals.map((evalItem) => (
                    <div
                      key={evalItem.id}
                      className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-amber-300">
                            {evalItem.machineCode || 'IMM Machine'} - Practical Skill Evaluation
                          </span>
                          <p className="text-[11px] text-slate-400">
                            Evaluated by: <strong className="text-slate-200">{evalItem.evaluatorName}</strong> on {evalItem.evaluationDate}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            evalItem.competencyResult === 'Competent'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {evalItem.competencyResult} ({evalItem.overallScorePct}%)
                        </span>
                      </div>

                      {/* Checkpoint ratings */}
                      {evalItem.checkpoints && evalItem.checkpoints.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                          {evalItem.checkpoints.map((c, i) => (
                            <div key={i} className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                              <span className="text-slate-400 block truncate">{c.label}</span>
                              <span className="font-extrabold text-white">Rating: Level {c.rating}/5</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {evalItem.supervisorComments && (
                        <p className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded-lg border border-slate-800/80 italic">
                          "{evalItem.supervisorComments}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Test History & Version Logs */}
          {activeSubTab === 'tests' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Digital Test Attempts & Paper Version History</h3>
              <div className="space-y-3">
                {operatorSignOffs.filter((s) => s.testCompleted).map((s) => (
                  <div key={s.id} className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{s.questionPaperTitle}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-900/40 text-purple-300 border border-purple-700/40">
                            Version {s.questionPaperVersion}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Attempted on: {s.testSubmitTime ? new Date(s.testSubmitTime).toLocaleString() : 'Recent'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-black ${s.testResult === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {s.testPercentage}%
                        </span>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">{s.testResult}</span>
                      </div>
                    </div>

                    {s.questionsAttempted && s.questionsAttempted.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <p className="text-xs font-bold text-slate-300">Question Item Breakdown:</p>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                          {s.questionsAttempted.map((qa: any, idx: number) => (
                            <div key={idx} className="p-2 bg-slate-900 rounded-lg text-xs flex items-center justify-between gap-2 border border-slate-800">
                              <span className="text-slate-300 truncate">Q{idx + 1}: {qa.questionText || `Question #${idx + 1}`}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-slate-400 font-mono text-[11px]">Selected: {qa.selectedAnswer}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${qa.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                  {qa.isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CAPA Retraining Tab */}
          {activeSubTab === 'capa' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">CAPA Closed-Loop Corrective Retraining Records</h3>
              {operatorCAPAs.length === 0 ? (
                <div className="text-center py-10 bg-slate-850/50 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  No corrective retraining records / CAPAs issued for this operator.
                </div>
              ) : (
                <div className="space-y-3">
                  {operatorCAPAs.map((capa) => (
                    <div
                      key={capa.id}
                      className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Trigger: {capa.triggerSource}
                          </span>
                          <h4 className="font-extrabold text-white text-sm mt-1">{capa.requiredTrainingTitle}</h4>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            capa.status === 'Closed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {capa.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <strong>Issue / Defect:</strong> {capa.issueDescription}
                      </p>
                      {capa.rootCause && (
                        <p className="text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          <strong>Root Cause:</strong> {capa.rootCause}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
                        <span>Trainer: {capa.trainerName}</span>
                        <span>Due: {capa.dueDate}</span>
                        <span>Final Result: <strong className="text-white">{capa.finalResult}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            IATF 16949 / ISO 9001 Audited Competency Passport
          </div>
          <div className="flex items-center gap-2">
            {onStartDigitalTest && (
              <button
                onClick={() => {
                  triggerHaptic();
                  onStartDigitalTest();
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-950/40"
              >
                <HelpCircle className="w-4 h-4" /> Start Digital Test
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              Close Passport
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
