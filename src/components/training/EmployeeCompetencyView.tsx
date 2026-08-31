import React, { useState } from 'react';
import {
  Users,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  BookOpen,
  X,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, Machine } from '../../types/schema';
import { PracticalEvaluationModal } from './PracticalEvaluationModal';
import { AssignTrainingModal } from './AssignTrainingModal';

export const EmployeeCompetencyView: React.FC = () => {
  const {
    users,
    machines,
    departments,
    shifts,
    trainingAssignments,
    practicalEvaluations,
    shopfloorMonitoringRecords,
    isOperatorQualifiedForMachine,
    triggerHaptic,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedShift, setSelectedShift] = useState('all');
  const [activeDossierUser, setActiveDossierUser] = useState<User | null>(null);

  // Modals state
  const [evalModalUser, setEvalModalUser] = useState<User | null>(null);
  const [assignModalUser, setAssignModalUser] = useState<User | null>(null);

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (selectedDept !== 'all' && u.departmentId !== selectedDept) return false;
    if (selectedRole !== 'all' && u.role !== selectedRole) return false;
    if (selectedShift !== 'all' && u.shiftId !== selectedShift) return false;
    if (
      searchQuery &&
      !u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getSkillLevelBadge = (level?: number) => {
    const l = level || 1;
    switch (l) {
      case 4:
        return {
          label: 'L4: Master Trainer / Multi-Machine',
          badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          dot: 'bg-purple-400',
        };
      case 3:
        return {
          label: 'L3: Qualified Independent Operator',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400',
        };
      case 2:
        return {
          label: 'L2: Semi-Skilled / Supervised',
          badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          dot: 'bg-cyan-400',
        };
      default:
        return {
          label: 'L1: Trainee / Under Supervision',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400',
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Filter Controls */}
      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Employee Competency & Skill Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Multi-Level Skill Matrix, Machine Qualifications & Operator Authorization Dossiers
            </p>
          </div>

          {/* Quick Stats Pill Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-purple-950/40 border border-purple-500/30 text-purple-300 rounded-full text-xs font-semibold">
              {users.filter((u) => u.skillLevel === 4).length} Master L4
            </span>
            <span className="px-3 py-1 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-semibold">
              {users.filter((u) => u.skillLevel === 3).length} Qualified L3
            </span>
            <span className="px-3 py-1 bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 rounded-full text-xs font-semibold">
              {users.filter((u) => (u.skillLevel || 1) <= 2).length} Trainee/L2
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee name or code..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Roles</option>
            <option value="Operator">Operator</option>
            <option value="Senior Operator">Senior Operator</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Quality Supervisor">Quality Supervisor</option>
            <option value="Trainer">Trainer</option>
          </select>

          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Shifts</option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Competency Matrix Table & Mobile Cards */}
      <div className="bg-slate-850 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3.5 pl-4 min-w-[180px]">Employee / Role</th>
                <th className="p-3.5 min-w-[140px]">Skill Level</th>
                <th className="p-3.5 min-w-[240px]">Machine Qualification Status</th>
                <th className="p-3.5 min-w-[120px]">Monitoring Avg</th>
                <th className="p-3.5 min-w-[110px]">Tests Passed</th>
                <th className="p-3.5 pr-4 text-right min-w-[130px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => {
                const userAssignments = trainingAssignments.filter((a) => a.employeeId === u.id);
                const userPracticals = practicalEvaluations.filter((p) => p.employeeId === u.id);
                const userMonitoring = shopfloorMonitoringRecords.filter((m) => m.employeeId === u.id);

                const passedTests = userAssignments.filter((a) => a.testResult === 'Passed').length;
                const totalTests = userAssignments.filter((a) => a.testTaken).length;

                const avgMonitoring =
                  userMonitoring.length > 0
                    ? Math.round(
                        userMonitoring.reduce((acc, c) => acc + c.monitoringScorePct, 0) / userMonitoring.length
                      )
                    : null;

                const skillInfo = getSkillLevelBadge(u.skillLevel);

                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Employee Info */}
                    <td className="p-3.5 pl-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white leading-tight">{u.name}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono">{u.employeeCode}</span>
                            <span>•</span>
                            <span>{u.role}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Skill Level Badge */}
                    <td className="p-3.5">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${skillInfo.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${skillInfo.dot}`} />
                        {skillInfo.label}
                      </div>
                    </td>

                    {/* Machine Qualification Badges */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {machines.slice(0, 4).map((m) => {
                          const qual = isOperatorQualifiedForMachine(u.id, m.id);
                          const isAssigned = userAssignments.some(
                            (a) => a.machineId === m.id || a.machineCode === m.code
                          );
                          const isCompetent = userPracticals.some(
                            (p) =>
                              (p.machineId === m.id || p.machineCode === m.code) &&
                              p.competencyResult === 'Competent'
                          );

                          return (
                            <span
                              key={m.id}
                              title={qual.reason || (isCompetent ? 'Certified Qualified' : 'General Authorization')}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 border ${
                                !qual.qualified
                                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                                  : isCompetent || (u.skillLevel && u.skillLevel >= 3)
                                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                  : isAssigned
                                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-400'
                              }`}
                            >
                              {!qual.qualified ? (
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                              ) : isCompetent || (u.skillLevel && u.skillLevel >= 3) ? (
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                              ) : (
                                <Clock className="w-2.5 h-2.5 text-amber-400" />
                              )}
                              {m.code}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Monitoring Score */}
                    <td className="p-3.5">
                      {avgMonitoring !== null ? (
                        <span
                          className={`font-mono font-bold ${
                            avgMonitoring >= 85
                              ? 'text-emerald-400'
                              : avgMonitoring >= 70
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {avgMonitoring}%
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">No Audit</span>
                      )}
                    </td>

                    {/* Tests Passed */}
                    <td className="p-3.5">
                      <span className="font-mono font-semibold text-slate-300">
                        {passedTests} / {userAssignments.length || 0} Modules
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            triggerHaptic();
                            setActiveDossierUser(u);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-[11px] flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-cyan-400" /> Dossier
                        </button>
                        <button
                          onClick={() => {
                            triggerHaptic();
                            setEvalModalUser(u);
                          }}
                          title="Evaluate Practical"
                          className="p-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            triggerHaptic();
                            setAssignModalUser(u);
                          }}
                          title="Assign Training"
                          className="p-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300"
                        >
                          <Award className="w-3.5 h-3.5" />
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

      {/* Employee Dossier Modal */}
      {activeDossierUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between p-4 bg-slate-800/90 border-b border-slate-700/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
                  {activeDossierUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    {activeDossierUser.name} — Competency Dossier
                  </h2>
                  <p className="text-xs text-slate-400">
                    Code: {activeDossierUser.employeeCode} • Role: {activeDossierUser.role} • Dept: Moulding
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDossierUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Skill Matrix Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                  <p className="text-[11px] text-slate-400 font-bold uppercase">Skill Level</p>
                  <p className="text-lg font-black text-amber-400 mt-1">Level {activeDossierUser.skillLevel || 1}</p>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                  <p className="text-[11px] text-slate-400 font-bold uppercase">Assigned Plans</p>
                  <p className="text-lg font-black text-white mt-1">
                    {trainingAssignments.filter((a) => a.employeeId === activeDossierUser.id).length}
                  </p>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                  <p className="text-[11px] text-slate-400 font-bold uppercase">Practical Audits</p>
                  <p className="text-lg font-black text-cyan-400 mt-1">
                    {practicalEvaluations.filter((p) => p.employeeId === activeDossierUser.id).length}
                  </p>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                  <p className="text-[11px] text-slate-400 font-bold uppercase">Monitoring Audits</p>
                  <p className="text-lg font-black text-emerald-400 mt-1">
                    {shopfloorMonitoringRecords.filter((m) => m.employeeId === activeDossierUser.id).length}
                  </p>
                </div>
              </div>

              {/* Machine-by-Machine Qualification List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Authorized Machine Matrix
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {machines.map((m) => {
                    const qual = isOperatorQualifiedForMachine(activeDossierUser.id, m.id);
                    const practical = practicalEvaluations.find(
                      (p) => p.employeeId === activeDossierUser.id && (p.machineId === m.id || p.machineCode === m.code)
                    );

                    return (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          !qual.qualified
                            ? 'bg-rose-950/30 border-rose-500/40'
                            : practical?.competencyResult === 'Competent'
                            ? 'bg-emerald-950/30 border-emerald-500/40'
                            : 'bg-slate-800/40 border-slate-700/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{m.code}</span>
                            <span className="text-xs text-slate-400 font-mono">({m.tonnage}T)</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {qual.reason || (practical ? `Score: ${practical.overallScorePct}% (${practical.competencyResult})` : 'Authorized for Operation')}
                          </p>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            !qual.qualified
                              ? 'bg-rose-500/20 text-rose-300'
                              : practical?.competencyResult === 'Competent'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {!qual.qualified ? 'BLOCKED' : practical?.competencyResult === 'Competent' ? 'QUALIFIED' : 'ACTIVE'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Training History Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" /> Training Plan & Records History
                </h3>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {trainingAssignments
                    .filter((a) => a.employeeId === activeDossierUser.id)
                    .map((a) => (
                      <div
                        key={a.id}
                        className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/70 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{a.trainingTitle}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Code: {a.trainingCode} • Mode: {a.trainingMode} • Trainer: {a.trainerName}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              a.status === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : a.status === 'Expired' || a.status === 'Failed'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {a.status}
                          </span>
                          {a.testScorePct !== undefined && (
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                              Quiz: {a.testScorePct}%
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => {
                  setAssignModalUser(activeDossierUser);
                  setActiveDossierUser(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" /> Assign Module
              </button>
              <button
                onClick={() => {
                  setEvalModalUser(activeDossierUser);
                  setActiveDossierUser(null);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Run Practical Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Practical Evaluation Modal Trigger */}
      {evalModalUser && (
        <PracticalEvaluationModal
          preselectedEmployeeId={evalModalUser.id}
          onClose={() => setEvalModalUser(null)}
        />
      )}

      {/* Assign Training Modal Trigger */}
      {assignModalUser && (
        <AssignTrainingModal
          preselectedEmployeeId={assignModalUser.id}
          onClose={() => setAssignModalUser(null)}
        />
      )}
    </div>
  );
};
