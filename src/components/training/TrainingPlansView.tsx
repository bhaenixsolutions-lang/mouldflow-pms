import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  FileCheck,
  ShieldCheck,
  Award,
  ChevronRight,
  Sparkles,
  BookOpen,
  User,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TrainingAssignment } from '../../types/training';
import { TakeQuizModal } from './TakeQuizModal';
import { PracticalEvaluationModal } from './PracticalEvaluationModal';
import { AssignTrainingModal } from './AssignTrainingModal';

export const TrainingPlansView: React.FC = () => {
  const {
    trainingAssignments,
    trainingTests,
    trainingMasters,
    departments,
    currentUser,
    markTrainingContentCompleted,
    triggerHaptic,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Active quiz/practical modals
  const [activeQuizAssignment, setActiveQuizAssignment] = useState<TrainingAssignment | null>(null);
  const [activePracticalAssignment, setActivePracticalAssignment] = useState<TrainingAssignment | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const filteredAssignments = trainingAssignments.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && a.priority !== priorityFilter) return false;
    if (roleFilter !== 'all' && a.role !== roleFilter) return false;
    if (
      searchQuery &&
      !a.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.trainingTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.trainingCode.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: TrainingAssignment['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'In Progress':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Overdue':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Expired':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Failed':
        return 'bg-rose-600/20 text-rose-400 border-rose-600/30';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Actions Header */}
      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Assigned Training Plans & Enrollments
            </h2>
            <p className="text-xs text-slate-400">
              Track course progress, online quizzes, supervisor practical sign-offs & certification
            </p>
          </div>

          <button
            onClick={() => {
              triggerHaptic();
              setShowAssignModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Assign New Plan
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plan, employee, module..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Statuses ({trainingAssignments.length})</option>
            <option value="Assigned">Assigned / Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
            <option value="Expired">Expired</option>
            <option value="Failed">Failed (Retest Required)</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Normal">Normal Priority</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Roles</option>
            <option value="Operator">Operator</option>
            <option value="Senior Operator">Senior Operator</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Quality Supervisor">Quality Supervisor</option>
          </select>
        </div>
      </div>

      {/* Training Plans List */}
      <div className="space-y-3">
        {filteredAssignments.map((a) => {
          const test = trainingTests.find((t) => t.trainingId === a.trainingId);

          return (
            <div
              key={a.id}
              className="bg-slate-850 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all shadow-lg"
            >
              {/* Left Details */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                      a.status
                    )}`}
                  >
                    {a.status}
                  </span>

                  {a.priority === 'Critical' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      CRITICAL PRIORITY
                    </span>
                  )}

                  {a.isCorrectiveRetraining && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      CAPA RETRAINING
                    </span>
                  )}

                  <span className="text-xs font-mono text-slate-400 font-bold">
                    {a.trainingCode}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {a.trainingTitle}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                    <span className="font-semibold text-slate-200">{a.employeeName}</span>
                    <span className="font-mono">({a.employeeCode})</span>
                    <span>•</span>
                    <span>{a.role}</span>
                    {a.machineCode && (
                      <>
                        <span>•</span>
                        <span className="text-cyan-400 font-mono font-bold">Target: {a.machineCode}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Indicators Bar */}
                <div className="flex items-center gap-4 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        a.contentCompleted ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                    />
                    <span>SOP Read</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        a.testResult === 'Passed'
                          ? 'bg-emerald-400'
                          : a.testResult === 'Failed'
                          ? 'bg-rose-400'
                          : 'bg-slate-600'
                      }`}
                    />
                    <span>
                      Quiz {a.testScorePct !== undefined ? `(${a.testScorePct}%)` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        a.practicalResult === 'Competent'
                          ? 'bg-emerald-400'
                          : a.practicalResult === 'Not Competent'
                          ? 'bg-rose-400'
                          : 'bg-slate-600'
                      }`}
                    />
                    <span>
                      Practical {a.practicalScorePct !== undefined ? `(${a.practicalScorePct}%)` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Panel */}
              <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between gap-2.5 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                <div className="text-left md:text-right text-xs text-slate-400 font-mono">
                  <span>Due: </span>
                  <strong className="text-amber-400">{a.dueDate}</strong>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {!a.contentCompleted && (
                    <button
                      onClick={() => {
                        triggerHaptic();
                        markTrainingContentCompleted(a.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mark SOP Read
                    </button>
                  )}

                  {test && (
                    <button
                      onClick={() => {
                        triggerHaptic();
                        setActiveQuizAssignment(a);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" /> Take Quiz
                    </button>
                  )}

                  <button
                    onClick={() => {
                      triggerHaptic();
                      setActivePracticalAssignment(a);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Practical Audit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiz Modal */}
      {activeQuizAssignment && (
        <TakeQuizModal
          test={trainingTests.find((t) => t.trainingId === activeQuizAssignment.trainingId)!}
          assignmentId={activeQuizAssignment.id}
          onClose={() => setActiveQuizAssignment(null)}
        />
      )}

      {/* Practical Evaluation Modal */}
      {activePracticalAssignment && (
        <PracticalEvaluationModal
          preselectedEmployeeId={activePracticalAssignment.employeeId}
          preselectedMachineId={activePracticalAssignment.machineId}
          preselectedTrainingId={activePracticalAssignment.trainingId}
          onClose={() => setActivePracticalAssignment(null)}
        />
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <AssignTrainingModal onClose={() => setShowAssignModal(false)} />
      )}
    </div>
  );
};
