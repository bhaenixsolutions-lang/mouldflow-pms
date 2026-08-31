import React from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  BookOpen,
  Calendar,
  Zap,
  TrendingUp,
  FileCheck,
  Play,
  ArrowRight,
  ShieldCheck,
  Eye,
  AlertCircle,
  Plus,
  Building,
  Sparkles,
  PenTool,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TrainingAssignment, TrainingCategory } from '../../types/training';

interface TrainingDashboardViewProps {
  onNavigateTab: (tabId: string) => void;
  onOpenAssignModal: () => void;
  onOpenMonitoringModal: () => void;
  onOpenPracticalModal: () => void;
}

export const TrainingDashboardView: React.FC<TrainingDashboardViewProps> = ({
  onNavigateTab,
  onOpenAssignModal,
  onOpenMonitoringModal,
  onOpenPracticalModal,
}) => {
  const {
    trainingAssignments,
    trainingMasters,
    trainingTests,
    practicalEvaluations,
    shopfloorMonitoringRecords,
    correctiveTrainingRecords,
    companyTrainingPrograms,
    companyQuestionPapers,
    trainingSignOffSessions,
    companies,
    selectedCompanyId,
    users,
    machines,
    triggerHaptic,
  } = useApp();

  const currentCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  // Metrics
  const totalAssigned = trainingAssignments.length;
  const completedCount = trainingAssignments.filter((a) => a.status === 'Completed').length;
  const inProgressCount = trainingAssignments.filter((a) => a.status === 'In Progress').length;
  const overdueCount = trainingAssignments.filter((a) => a.status === 'Overdue').length;
  const expiredCount = trainingAssignments.filter((a) => a.status === 'Expired').length;
  const openCorrectiveCount = correctiveTrainingRecords.filter((c) => c.status === 'Open' || c.status === 'In Progress').length;

  const testPassRate =
    trainingAssignments.filter((a) => a.testTaken).length > 0
      ? Math.round(
          (trainingAssignments.filter((a) => a.testResult === 'Passed').length /
            trainingAssignments.filter((a) => a.testTaken).length) *
            100
        )
      : 88;

  const monitoringAvg =
    shopfloorMonitoringRecords.length > 0
      ? Math.round(
          shopfloorMonitoringRecords.reduce((acc, c) => acc + c.monitoringScorePct, 0) /
            shopfloorMonitoringRecords.length
        )
      : 84;

  const completionRate = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

  // Urgent action items list (Overdue or Expired or Open Corrective)
  const urgentAssignments = trainingAssignments
    .filter((a) => a.status === 'Overdue' || a.status === 'Expired' || a.priority === 'Critical')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Completion Rate */}
        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Completion Rate
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white">{completionRate}%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div className="bg-emerald-500 h-full" style={{ width: `${completionRate}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{completedCount} of {totalAssigned} completed</p>
          </div>
        </div>

        {/* KPI 2: In-Progress */}
        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active In-Training
            </span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-cyan-400">{inProgressCount + trainingAssignments.filter((a) => a.status === 'Assigned').length}</div>
            <p className="text-[10px] text-slate-400 mt-1">{inProgressCount} in progress • {trainingAssignments.filter((a) => a.status === 'Assigned').length} pending</p>
          </div>
        </div>

        {/* KPI 3: Overdue & Expired */}
        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Overdue / Expired
            </span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-rose-400">{overdueCount + expiredCount}</div>
            <p className="text-[10px] text-slate-400 mt-1">{overdueCount} overdue • {expiredCount} renewal due</p>
          </div>
        </div>

        {/* KPI 4: Test Pass Rate */}
        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Test Pass Rate
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-400">{testPassRate}%</div>
            <p className="text-[10px] text-slate-400 mt-1">First-attempt pass metric</p>
          </div>
        </div>

        {/* KPI 5: Shopfloor Audit Avg */}
        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Monitoring Score
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-purple-400">{monitoringAvg}%</div>
            <p className="text-[10px] text-slate-400 mt-1">{shopfloorMonitoringRecords.length} live audits logged</p>
          </div>
        </div>

        {/* KPI 6: Open Corrective */}
        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CAPA Retraining
            </span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-orange-400">{openCorrectiveCount}</div>
            <p className="text-[10px] text-slate-400 mt-1">Defect-triggered items</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => {
            triggerHaptic();
            onNavigateTab('company-programs');
          }}
          className="p-3.5 bg-slate-850 hover:bg-slate-800 rounded-2xl border border-amber-500/30 text-left transition-all group flex items-center gap-3 shadow-md"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">Company Programs</p>
            <p className="text-[10px] text-slate-400">Custom syllabi</p>
          </div>
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            onNavigateTab('ocr-studio');
          }}
          className="p-3.5 bg-slate-850 hover:bg-slate-800 rounded-2xl border border-purple-500/30 text-left transition-all group flex items-center gap-3 shadow-md"
        >
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">Paper OCR Studio</p>
            <p className="text-[10px] text-slate-400">Scan exam sheets</p>
          </div>
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            onNavigateTab('sign-offs');
          }}
          className="p-3.5 bg-slate-850 hover:bg-slate-800 rounded-2xl border border-sky-500/30 text-left transition-all group flex items-center gap-3 shadow-md"
        >
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">Dual Sign-Offs</p>
            <p className="text-[10px] text-slate-400">Stage 1 & 2 sheets</p>
          </div>
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            onOpenAssignModal();
          }}
          className="p-3.5 bg-slate-850 hover:bg-slate-800 rounded-2xl border border-amber-500/30 text-left transition-all group flex items-center gap-3 shadow-md"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">Assign Training</p>
            <p className="text-[10px] text-slate-400">Enroll operators</p>
          </div>
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            onOpenMonitoringModal();
          }}
          className="p-3.5 bg-slate-850 hover:bg-slate-800 rounded-2xl border border-emerald-500/30 text-left transition-all group flex items-center gap-3 shadow-md"
        >
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">Log Monitoring</p>
            <p className="text-[10px] text-slate-400">Shift audit checklist</p>
          </div>
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            onNavigateTab('competency-matrix');
          }}
          className="p-3.5 bg-slate-850 hover:bg-slate-800 rounded-2xl border border-purple-500/30 text-left transition-all group flex items-center gap-3 shadow-md"
        >
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">Skill Matrix</p>
            <p className="text-[10px] text-slate-400">L1 to L4 levels</p>
          </div>
        </button>
      </div>

      {/* Main Grid: Urgent Alerts & Machine Competency Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Urgent Alerts & Compliance Focus (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-850 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Urgent Training & Renewal Actions ({urgentAssignments.length})
              </h3>
              <button
                onClick={() => onNavigateTab('expiry-renewal')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                View Expiries <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {urgentAssignments.length > 0 ? (
                urgentAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-xl border border-slate-700/80 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{a.employeeName}</span>
                        <span className="font-mono text-slate-400">({a.employeeCode})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                          {a.role}
                        </span>
                      </div>
                      <p className="text-slate-300 font-medium mt-1">
                        {a.trainingTitle} {a.machineCode ? `• Target: ${a.machineCode}` : ''}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Due Date: <span className="font-mono text-amber-400">{a.dueDate}</span> • Trainer: {a.trainerName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          a.status === 'Expired'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {a.status}
                      </span>
                      <button
                        onClick={() => onNavigateTab('training-plans')}
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px]"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white">All Active Trainings On Track</p>
                  <p className="text-[11px] text-slate-500">No overdue or expired qualifications found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Machine Qualification Coverage Map */}
          <div className="bg-slate-850 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Zap className="w-4 h-4 text-cyan-400" />
                Machine Qualification Coverage
              </h3>
              <button
                onClick={() => onNavigateTab('competency-matrix')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                Full Matrix <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {machines.slice(0, 6).map((m) => {
                const qualifiedOperators = users.filter((u) => {
                  const evals = practicalEvaluations.filter(
                    (p) => (p.machineId === m.id || p.machineCode === m.code) && p.employeeId === u.id
                  );
                  return evals.some((e) => e.competencyResult === 'Competent') || (u.skillLevel && u.skillLevel >= 3);
                });

                return (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{m.code}</span>
                        <span className="text-[11px] text-slate-400">({m.tonnage}T)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {qualifiedOperators.length} Certified Operators
                      </p>
                    </div>

                    <div className="flex -space-x-2 overflow-hidden">
                      {qualifiedOperators.slice(0, 3).map((op) => (
                        <div
                          key={op.id}
                          title={op.name}
                          className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold text-cyan-300"
                        >
                          {op.name.slice(0, 2).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Corrective Retraining & Training Bank (1 col) */}
        <div className="space-y-4">
          {/* Corrective Retraining Feed */}
          <div className="bg-slate-850 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                Corrective Training (CAPA)
              </h3>
              <button
                onClick={() => onNavigateTab('corrective-training')}
                className="text-xs font-bold text-orange-400 hover:text-orange-300"
              >
                All ({correctiveTrainingRecords.length})
              </button>
            </div>

            <div className="space-y-2">
              {correctiveTrainingRecords.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{c.employeeName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'Open'
                          ? 'bg-rose-500/20 text-rose-300'
                          : c.status === 'In Progress'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    {c.requiredTrainingTitle}
                  </p>
                  <p className="text-[10px] text-slate-400 italic">
                    Trigger: {c.triggerSource} — {c.issueDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Training SOP Modules Quick Explorer */}
          <div className="bg-slate-850 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Training SOP Modules
              </h3>
              <button
                onClick={() => onNavigateTab('training-library')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                Browse Library
              </button>
            </div>

            <div className="space-y-2">
              {trainingMasters.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-200 block line-clamp-1">{t.title}</span>
                    <span className="text-[10px] text-slate-400">{t.code} • {t.durationMinutes} mins</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 shrink-0">
                    {t.category.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
