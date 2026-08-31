import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  UserCheck,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  User,
  BookOpen,
  HelpCircle,
  Award,
  Plus,
  ArrowRight,
  Filter,
  CheckSquare,
  Square,
  Printer,
  ChevronRight,
  Play,
  RotateCcw,
  FileText,
  History,
  Sparkles,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SignatureCanvas } from './SignatureCanvas';
import { TrainingSignOffSession } from '../../types/training';
import { TrainerPreSignModal } from './TrainerPreSignModal';
import { PracticalTrainingModal } from './PracticalTrainingModal';
import { OperatorAckModal } from './OperatorAckModal';
import { DigitalTestEngineModal } from './DigitalTestEngineModal';
import { TrainingRecordDetailModal } from './TrainingRecordDetailModal';

interface TwoStageSignOffWorkflowProps {
  initialSessionId?: string;
  initialProgramId?: string;
  onOpenDigitalTest?: (sessionId: string) => void;
}

export const TwoStageSignOffWorkflow: React.FC<TwoStageSignOffWorkflowProps> = ({
  initialSessionId,
  initialProgramId,
  onOpenDigitalTest,
}) => {
  const {
    companies,
    selectedCompanyId,
    companyTrainingPrograms,
    companyQuestionPapers,
    trainingSignOffSessions,
    users,
    currentUser,
    createTrainingSignOffSession,
    signTrainerPreTraining,
    signOperatorAcknowledgement,
    triggerHaptic,
  } = useApp();

  const currentCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  // Active Session selection
  const [activeSessionId, setActiveSessionId] = useState<string>(
    initialSessionId || trainingSignOffSessions[0]?.id || ''
  );

  // Workflow Dialog Modals State
  const [showTrainerModal, setShowTrainerModal] = useState<boolean>(false);
  const [showPracticalModal, setShowPracticalModal] = useState<boolean>(false);
  const [showOperatorModal, setShowOperatorModal] = useState<boolean>(false);
  const [showDigitalTestModal, setShowDigitalTestModal] = useState<boolean>(false);
  const [showRecordModal, setShowRecordModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Filter State
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Session Form State
  const [newProgramId, setNewProgramId] = useState<string>(
    initialProgramId || companyTrainingPrograms[0]?.id || ''
  );
  const [newEmployeeId, setNewEmployeeId] = useState<string>('');
  const [newTrainerId, setNewTrainerId] = useState<string>(currentUser?.id || 'usr-sup-qa');
  const [newMachineCode, setNewMachineCode] = useState<string>('IMM-01 (Toshiba 180T)');

  const activeSession = useMemo(() => {
    return trainingSignOffSessions.find((s) => s.id === activeSessionId) || trainingSignOffSessions[0];
  }, [trainingSignOffSessions, activeSessionId]);

  const filteredSessions = useMemo(() => {
    return trainingSignOffSessions.filter((s) => {
      const matchCompany = !s.companyId || s.companyId === selectedCompanyId;
      if (!matchCompany) return false;

      if (statusFilter !== 'All') {
        const sStatus = String(s.status);
        if (statusFilter === 'Completed' && sStatus !== 'Competent' && sStatus !== 'Training Completed') return false;
        if (statusFilter === 'Pending Pre-Sign' && sStatus !== 'Assigned') return false;
        if (statusFilter === 'Pending Test' && sStatus !== 'Operator Acknowledged') return false;
        if (statusFilter === 'Failed' && sStatus !== 'Retraining Required') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.employeeName?.toLowerCase().includes(q);
        const matchesCode = s.employeeCode?.toLowerCase().includes(q);
        const matchesProg = s.trainingProgramTitle?.toLowerCase().includes(q);
        const matchesMach = s.machineCode?.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesProg && !matchesMach) return false;
      }

      return true;
    });
  }, [trainingSignOffSessions, selectedCompanyId, statusFilter, searchQuery]);

  const operatorsList = useMemo(() => {
    return users.filter(
      (u) =>
        u.role === 'Operator' ||
        u.role === 'Senior Operator'
    );
  }, [users]);

  const trainersList = useMemo(() => {
    return users.filter(
      (u) =>
        u.role === 'Quality Supervisor' ||
        u.role === 'Supervisor' ||
        u.role === 'Trainer' ||
        u.role === 'Admin' ||
        u.role === 'Production Manager' ||
        u.role === 'Maintenance Supervisor'
    );
  }, [users]);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();

    const selectedProg = companyTrainingPrograms.find((p) => p.id === newProgramId);
    const selectedOp = users.find((u) => u.id === newEmployeeId);
    const selectedTrn = users.find((u) => u.id === newTrainerId);

    if (!selectedProg || !selectedOp) {
      alert('Please select both a Training Program and an Operator.');
      return;
    }

    const newId = createTrainingSignOffSession({
      companyId: selectedCompanyId,
      trainingProgramId: selectedProg.id,
      trainingProgramTitle: selectedProg.programName,
      trainingProgramCode: selectedProg.programId,
      questionPaperId: selectedProg.questionPaperId,
      employeeId: selectedOp.id,
      employeeName: selectedOp.name,
      employeeCode: selectedOp.employeeCode || selectedOp.badgeNumber || 'OP-104',
      trainerId: selectedTrn?.id || 'usr-sup-qa',
      trainerName: selectedTrn?.name || 'Priyanka Roy (Lead Trainer & QA Lead)',
      trainerEmployeeId: selectedTrn?.employeeCode || 'SUP-007',
      machineId: selectedOp.assignedMachineId || 'm-imm-01',
      machineCode: newMachineCode || selectedOp.assignedMachineCode || 'IMM-01 (Toshiba 180T)',
      trainingDuration: selectedProg.trainingDuration || 45,
      passMark: selectedProg.passingPercentage || 80,
      trainingCategory: selectedProg.trainingCategory || 'Safety Training',
      trainingMethod: 'Combination',
      status: 'Assigned',
      trainingDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      expiryDate: new Date(Date.now() + (selectedProg.validity || 12) * 30 * 86400000).toISOString().slice(0, 10),
    });

    setActiveSessionId(newId);
    setShowCreateModal(false);
  };

  // Workflow Stage Helpers
  const stageStatus = useMemo(() => {
    if (!activeSession) return { stage1: false, stage2: false, stage3: false, stage4: false, stage5: false };

    const stage1 = Boolean(activeSession.trainerPreSigned || activeSession.trainerSignatureData);
    const stage2 = Boolean(activeSession.checklistItemsCompleted || activeSession.trainingProgress === 'Completed');
    const stage3 = Boolean(activeSession.operatorAckSigned || activeSession.operatorSignatureData);
    const stage4 = Boolean(activeSession.testCompleted || activeSession.testScorePercentage !== undefined);
    const stage5 = Boolean(activeSession.testPassed || activeSession.status === 'Completed' || activeSession.status === 'Certified Competent');

    return { stage1, stage2, stage3, stage4, stage5 };
  }, [activeSession]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Full 5-Stage Audit Workflow
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentCompany.name} ({currentCompany.code})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              TRAINING, SIGN-OFF &amp; COMPETENCY WORKFLOW
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Step-by-step digital compliance: Assign Training &rarr; Trainer Pre-Sign &rarr; Practical Demonstration &rarr; Operator Sign-Off &rarr; Bilingual Digital Assessment &rarr; Permanent Audit Record.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                triggerHaptic();
                setShowCreateModal(true);
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs tracking-wide shadow-lg shadow-purple-950/60 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Training</span>
            </button>
          </div>
        </div>

        {/* 5-Step Visual Flow Stepper Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Step 1 */}
            <div className={`p-3 rounded-2xl border transition-all ${
              stageStatus.stage1
                ? 'bg-sky-950/30 border-sky-500/50 text-sky-300'
                : 'bg-slate-850/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                <span>1. Assign &amp; Trainer Sign</span>
                {stageStatus.stage1 ? <CheckCircle2 className="w-4 h-4 text-sky-400" /> : <Clock className="w-4 h-4 text-slate-500" />}
              </div>
              <p className="text-xs font-bold text-white mt-1 truncate">Trainer Pre-Sign</p>
            </div>

            {/* Step 2 */}
            <div className={`p-3 rounded-2xl border transition-all ${
              stageStatus.stage2
                ? 'bg-amber-950/30 border-amber-500/50 text-amber-300'
                : 'bg-slate-850/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                <span>2. Practical / SOP</span>
                {stageStatus.stage2 ? <CheckCircle2 className="w-4 h-4 text-amber-400" /> : <Clock className="w-4 h-4 text-slate-500" />}
              </div>
              <p className="text-xs font-bold text-white mt-1 truncate">9-Point Checklist</p>
            </div>

            {/* Step 3 */}
            <div className={`p-3 rounded-2xl border transition-all ${
              stageStatus.stage3
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-850/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                <span>3. Operator Sign</span>
                {stageStatus.stage3 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-slate-500" />}
              </div>
              <p className="text-xs font-bold text-white mt-1 truncate">Acknowledgement</p>
            </div>

            {/* Step 4 */}
            <div className={`p-3 rounded-2xl border transition-all ${
              stageStatus.stage4
                ? 'bg-purple-950/30 border-purple-500/50 text-purple-300'
                : 'bg-slate-850/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                <span>4. Theory Test</span>
                {stageStatus.stage4 ? <CheckCircle2 className="w-4 h-4 text-purple-400" /> : <Clock className="w-4 h-4 text-slate-500" />}
              </div>
              <p className="text-xs font-bold text-white mt-1 truncate">Bilingual Exam</p>
            </div>

            {/* Step 5 */}
            <div className={`p-3 rounded-2xl border transition-all col-span-2 sm:col-span-1 ${
              stageStatus.stage5
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-850/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                <span>5. Certification</span>
                {stageStatus.stage5 ? <Award className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-slate-500" />}
              </div>
              <p className="text-xs font-bold text-white mt-1 truncate">Permanent Record</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sessions List & Filters (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Training Sessions ({filteredSessions.length})
              </h3>
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by operator, ID, machine..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {['All', 'Pending Pre-Sign', 'Pending Test', 'Completed', 'Failed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                    statusFilter === st
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Sessions Scrollable List */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredSessions.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No training sessions match your filter.
                </div>
              ) : (
                filteredSessions.map((s) => {
                  const isSelected = s.id === activeSession?.id;
                  const isPassed = s.testPassed || s.status === 'Completed' || s.status === 'Certified Competent';
                  const isFailed = s.status === 'Test Failed' || s.status === 'Retraining Required';

                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        triggerHaptic();
                        setActiveSessionId(s.id);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-purple-950/20 border-purple-500/80 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500'
                          : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white text-xs leading-snug">{s.employeeName}</p>
                          <span className="text-[11px] text-purple-300 font-mono">ID: {s.employeeCode || s.employeeId}</span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isPassed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isFailed
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {s.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 font-semibold truncate">{s.trainingProgramTitle}</p>
                      
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>Machine: {s.machineCode || 'IMM-01'}</span>
                        <span>Pass Mark: {s.passMark || 80}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Session Workflow Execution (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {activeSession ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
              {/* Active Session Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-850 border border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Active Training Session
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Session ID: {activeSession.id}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white">{activeSession.trainingProgramTitle}</h2>
                  <p className="text-xs text-slate-300">
                    Operator: <strong className="text-white">{activeSession.employeeName}</strong> ({activeSession.employeeCode}) • Trainer: <strong className="text-slate-200">{activeSession.trainerName}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    onClick={() => {
                      triggerHaptic();
                      setShowRecordModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-4 h-4" /> Full Record
                  </button>
                </div>
              </div>

              {/* Step-by-Step Action Cards */}
              <div className="space-y-4">
                {/* STAGE 1: Trainer Pre-Training Sign-Off */}
                <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  stageStatus.stage1
                    ? 'bg-sky-950/15 border-sky-500/30'
                    : 'bg-slate-850/60 border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        stageStatus.stage1
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        <ShieldCheck className="w-5 h-5" />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white">Stage 1: Trainer Pre-Training Authorization</h3>
                          {stageStatus.stage1 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300">
                              SIGNED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {stageStatus.stage1
                            ? `Signed by ${activeSession.trainerName} on ${activeSession.trainerPreSignDate || activeSession.trainingDate}`
                            : 'Requires trainer signature confirming training plan & pre-safety prerequisites.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic();
                        setShowTrainerModal(true);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                        stageStatus.stage1
                          ? 'bg-slate-800 text-sky-300 hover:bg-slate-700'
                          : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-md shadow-sky-950/60'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>{stageStatus.stage1 ? 'Re-Sign / View Pre-Sign' : 'Open Trainer Sign-Off'}</span>
                    </button>
                  </div>
                </div>

                {/* STAGE 2: Practical Training Demonstration & SOP */}
                <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  stageStatus.stage2
                    ? 'bg-amber-950/15 border-amber-500/30'
                    : 'bg-slate-850/60 border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        stageStatus.stage2
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        <BookOpen className="w-5 h-5" />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white">Stage 2: Practical Training &amp; SOP Execution</h3>
                          {stageStatus.stage2 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                              COMPLETED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {stageStatus.stage2
                            ? '9-Point Practical checklist items verified on shop floor machine.'
                            : 'Perform machine walkthrough, E-Stop check, and parameter verification.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic();
                        setShowPracticalModal(true);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                        stageStatus.stage2
                          ? 'bg-slate-850 text-amber-300 hover:bg-slate-800'
                          : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-md shadow-amber-950/60'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{stageStatus.stage2 ? 'View Practical Checklist' : 'Start Practical Checklist'}</span>
                    </button>
                  </div>
                </div>

                {/* STAGE 3: Operator Acknowledgement */}
                <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  stageStatus.stage3
                    ? 'bg-emerald-950/15 border-emerald-500/30'
                    : 'bg-slate-850/60 border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        stageStatus.stage3
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        <UserCheck className="w-5 h-5" />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white">Stage 3: Operator Acknowledgement</h3>
                          {stageStatus.stage3 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                              ACKNOWLEDGED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {stageStatus.stage3
                            ? `Signed by ${activeSession.employeeName} on ${activeSession.operatorAckDate || activeSession.trainingDate}`
                            : 'Operator signs confirming understanding before unlocking digital assessment.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic();
                        setShowOperatorModal(true);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                        stageStatus.stage3
                          ? 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-md shadow-emerald-950/60'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>{stageStatus.stage3 ? 'View Operator Signature' : 'Open Operator Sign-Off'}</span>
                    </button>
                  </div>
                </div>

                {/* STAGE 4: Digital Theory Assessment */}
                <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  stageStatus.stage4
                    ? activeSession.testPassed || activeSession.testScorePercentage! >= (activeSession.passMark || 80)
                      ? 'bg-purple-950/15 border-purple-500/30'
                      : 'bg-rose-950/15 border-rose-500/30'
                    : 'bg-slate-850/60 border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        stageStatus.stage4
                          ? activeSession.testPassed
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        <HelpCircle className="w-5 h-5" />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white">Stage 4: Theory Assessment (Bilingual English + हिन्दी)</h3>
                          {stageStatus.stage4 && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              activeSession.testPassed || activeSession.testScorePercentage! >= (activeSession.passMark || 80)
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {activeSession.testScorePercentage}% ({activeSession.testPassed ? 'PASSED' : 'FAILED'})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {stageStatus.stage4
                            ? `Completed. Pass Mark: ${activeSession.passMark || 80}%. Total Points: ${activeSession.testPointsEarned || 100}/${activeSession.testTotalPoints || 100}.`
                            : `Multiple choice evaluation. Pass Mark: ${activeSession.passMark || 80}%.`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic();
                        setShowDigitalTestModal(true);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                        stageStatus.stage4
                          ? 'bg-purple-600 hover:bg-purple-500 text-white'
                          : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-md shadow-purple-950/60'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{stageStatus.stage4 ? 'View / Retake Assessment' : 'Launch Digital Test Engine'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Audit Timeline Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <History className="w-4 h-4 text-purple-400" />
                    Session Audit Trail &amp; Verification Events
                  </h4>
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Immutable Audit Log
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Training Program Assigned</p>
                      <p className="text-[11px] text-slate-400">{activeSession.trainingDate} • Target: {activeSession.machineCode || 'IMM-01'}</p>
                    </div>
                  </div>

                  {activeSession.trainerPreSigned && (
                    <div className="flex items-start gap-2.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-white">Trainer Pre-Sign Completed (PRE_TRAINING)</p>
                        <p className="text-[11px] text-slate-400">Signed by {activeSession.trainerName} ({activeSession.trainerEmployeeId || 'SUP-007'})</p>
                      </div>
                    </div>
                  )}

                  {activeSession.checklistItemsCompleted && (
                    <div className="flex items-start gap-2.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-white">9-Point Practical Demonstration Verified</p>
                        <p className="text-[11px] text-slate-400">All machine safety protocols &amp; SOP checkpoints confirmed.</p>
                      </div>
                    </div>
                  )}

                  {activeSession.operatorAckSigned && (
                    <div className="flex items-start gap-2.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-white">Operator Acknowledgement Signed (OPERATOR_ACKNOWLEDGEMENT)</p>
                        <p className="text-[11px] text-slate-400">Signed by {activeSession.employeeName} ({activeSession.employeeCode})</p>
                      </div>
                    </div>
                  )}

                  {activeSession.testCompleted && (
                    <div className="flex items-start gap-2.5 text-slate-300">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${activeSession.testPassed ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <div>
                        <p className="font-semibold text-white">
                          Digital Assessment Evaluated: {activeSession.testScorePercentage}% ({activeSession.testPassed ? 'PASSED' : 'FAILED'})
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Pass Mark: {activeSession.passMark || 80}% • Attempt: {activeSession.currentAttempt || 1}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              Select a training session on the left or create a new session to begin.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Trainer Pre-Training Signature */}
      {showTrainerModal && activeSession && (
        <TrainerPreSignModal
          session={activeSession}
          onClose={() => setShowTrainerModal(false)}
          onSuccess={(updated) => {
            setShowTrainerModal(false);
            setShowPracticalModal(true);
          }}
        />
      )}

      {/* MODAL 2: Practical Demonstration & SOP */}
      {showPracticalModal && activeSession && (
        <PracticalTrainingModal
          session={activeSession}
          onClose={() => setShowPracticalModal(false)}
          onProceedToOperatorAck={(updated) => {
            setShowPracticalModal(false);
            setShowOperatorModal(true);
          }}
        />
      )}

      {/* MODAL 3: Operator Acknowledgement */}
      {showOperatorModal && activeSession && (
        <OperatorAckModal
          session={activeSession}
          onClose={() => setShowOperatorModal(false)}
          onSuccess={(updated) => {
            setShowOperatorModal(false);
            setShowDigitalTestModal(true);
          }}
        />
      )}

      {/* MODAL 4: Digital Theory Assessment */}
      {showDigitalTestModal && activeSession && (
        <DigitalTestEngineModal
          sessionId={activeSession.id}
          questionPaperId={activeSession.questionPaperId}
          programId={activeSession.trainingProgramId}
          onClose={() => setShowDigitalTestModal(false)}
          onCompleted={() => {
            // Keep test engine open so operator sees their score and certificate
          }}
          onViewRecord={(sid) => {
            setShowDigitalTestModal(false);
            setShowRecordModal(true);
          }}
        />
      )}

      {/* MODAL 5: Permanent Training Record Detail */}
      {showRecordModal && activeSession && (
        <TrainingRecordDetailModal
          session={activeSession}
          onClose={() => setShowRecordModal(false)}
        />
      )}

      {/* CREATE NEW TRAINING SESSION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
            <div className="p-5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Assign Training &amp; Initialize Workflow</h2>
                  <p className="text-xs text-slate-400">{currentCompany.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
              >
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-5 space-y-4 text-xs">
              {/* Select Program */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Training Program</label>
                <select
                  value={newProgramId}
                  onChange={(e) => setNewProgramId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-purple-500"
                >
                  {companyTrainingPrograms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.programName} ({p.programId}) • Pass: {p.passingPercentage || 80}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Operator */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Operator (Trainee)</label>
                <select
                  value={newEmployeeId}
                  onChange={(e) => {
                    setNewEmployeeId(e.target.value);
                    const op = users.find((u) => u.id === e.target.value);
                    if (op?.assignedMachineCode) {
                      setNewMachineCode(op.assignedMachineCode);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="">-- Select Operator --</option>
                  {operatorsList.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name} ({op.employeeCode || op.badgeNumber || 'OP-104'}) • {op.designation || 'Operator'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Trainer */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Authorized Trainer</label>
                <select
                  value={newTrainerId}
                  onChange={(e) => setNewTrainerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-purple-500"
                >
                  {trainersList.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.name} ({tr.employeeCode || 'SUP-007'}) • {tr.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Machine Assignment */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Target Injection Moulding Machine</label>
                <input
                  type="text"
                  value={newMachineCode}
                  onChange={(e) => setNewMachineCode(e.target.value)}
                  placeholder="e.g. IMM-01 (Toshiba 180T)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black shadow-lg"
                >
                  Create &amp; Start Step 1
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
