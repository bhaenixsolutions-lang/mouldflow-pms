import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sparkles,
  BookOpen,
  Filter,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AssignTrainingModalProps {
  onClose: () => void;
  preselectedEmployeeId?: string;
  preselectedTrainingId?: string;
}

export const AssignTrainingModal: React.FC<AssignTrainingModalProps> = ({
  onClose,
  preselectedEmployeeId,
  preselectedTrainingId,
}) => {
  const {
    users,
    departments,
    machines,
    trainingMasters,
    currentUser,
    assignTraining,
    triggerHaptic,
  } = useApp();

  const [assignmentMode, setAssignmentMode] = useState<'individual' | 'batch'>('individual');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    preselectedEmployeeId ? [preselectedEmployeeId] : []
  );
  const [selectedTrainingId, setSelectedTrainingId] = useState(
    preselectedTrainingId || trainingMasters[0]?.id || ''
  );
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Critical'>('Normal');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );
  const [trainerName, setTrainerName] = useState(currentUser.name);
  const [triggerType, setTriggerType] = useState<
    'Onboarding' | 'Machine Qualification' | 'Quality Issue' | 'Safety Mandatory' | 'Annual Refresher'
  >('Machine Qualification');
  const [notes, setNotes] = useState('');

  // Filtered employees list for batch selection
  const candidateUsers = users.filter((u) => {
    if (departmentFilter !== 'all' && u.departmentId !== departmentFilter) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  const handleToggleEmployee = (id: string) => {
    triggerHaptic();
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter((e) => e !== id));
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
  };

  const handleSelectAllFiltered = () => {
    triggerHaptic();
    const allFilteredIds一眼 = candidateUsers.map((u) => u.id);
    if (selectedEmployees.length === allFilteredIds一眼.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(allFilteredIds一眼);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmployees.length === 0 || !selectedTrainingId) return;

    const matchedMaster = trainingMasters.find((t) => t.id === selectedTrainingId);
    if (!matchedMaster) return;

    const matchedMachine = machines.find((m) => m.id === selectedMachineId);
    const now = new Date().toISOString().slice(0, 10);

    const assignmentsToCreate = selectedEmployees.map((empId) => {
      const emp = users.find((u) => u.id === empId);
      return {
        employeeId: emp?.id || empId,
        employeeName: emp?.name || 'Unknown',
        employeeCode: emp?.employeeCode || 'EMP-00',
        departmentId: emp?.departmentId || 'dept-moulding',
        designation: emp?.role,
        role: emp?.role || 'Operator',
        trainingId: matchedMaster.id,
        trainingTitle: matchedMaster.title,
        trainingCode: matchedMaster.code,
        category: matchedMaster.category,
        machineId: matchedMachine?.id,
        machineCode: matchedMachine?.code,
        assignedDate: now,
        dueDate,
        priority,
        trainerName,
        trainingMode: matchedMaster.trainingType,
        status: 'Assigned' as const,
        contentCompleted: false,
        testTaken: false,
        practicalCompleted: false,
        attemptsCount: 0,
        remarks: notes ? `${triggerType}: ${notes}` : triggerType,
        createdBy: currentUser.name,
      };
    });

    assignTraining(assignmentsToCreate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800/90 border-b border-slate-700/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Assign Training & Competency Plan
              </h2>
              <p className="text-xs text-slate-400">
                Enroll shopfloor operators & supervisors in standard qualification modules
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
          {/* Assignment Mode Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setAssignmentMode('individual')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                assignmentMode === 'individual'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Individual Assignment
            </button>
            <button
              type="button"
              onClick={() => setAssignmentMode('batch')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                assignmentMode === 'batch'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Batch / Department Assignment
            </button>
          </div>

          {/* Module Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Select Training Module
            </label>
            <select
              value={selectedTrainingId}
              onChange={(e) => setSelectedTrainingId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-medium"
            >
              {trainingMasters.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.category}] {t.code} - {t.title} ({t.durationMinutes} mins)
                </option>
              ))}
            </select>
          </div>

          {/* Optional Machine Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Machine (Optional)
              </label>
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- General / Not Machine Specific --</option>
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.name} ({m.tonnage}T)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Trigger Reason
              </label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Machine Qualification">Machine Qualification</option>
                <option value="Onboarding">New Hire Onboarding</option>
                <option value="Quality Issue">Quality Rejection / Scrap Trigger</option>
                <option value="Safety Mandatory">Safety & Compliance Mandatory</option>
                <option value="Annual Refresher">Annual Refresher / Renewal</option>
              </select>
            </div>
          </div>

          {/* Employee Selection Section */}
          {assignmentMode === 'individual' ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Employee
              </label>
              <select
                value={selectedEmployees[0] || ''}
                onChange={(e) => setSelectedEmployees([e.target.value])}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="">-- Select Candidate --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.employeeCode}) - {u.role}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-800/40 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Filters:</span>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300"
                >
                  {selectedEmployees.length === candidateUsers.length ? 'Deselect All' : 'Select All Filtered'}
                </button>
              </div>

              {/* Employee Candidate Checkboxes */}
              <div className="max-h-44 overflow-y-auto space-y-1.5 bg-slate-850 p-2 rounded-xl border border-slate-800">
                {candidateUsers.map((u) => {
                  const isChecked = selectedEmployees.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleToggleEmployee(u.id)}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'bg-amber-500/20 text-white border border-amber-500/40'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center ${
                            isChecked ? 'bg-amber-500 text-slate-950' : 'border border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-semibold">{u.name}</span>
                        <span className="text-slate-400 font-mono">({u.employeeCode})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-700/60 text-[10px] text-slate-300">
                        {u.role}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 font-mono text-right">
                {selectedEmployees.length} employees selected for enrollment
              </p>
            </div>
          )}

          {/* Due Date & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Critical">Critical (Overdue Risk)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Trainer / In-Charge
              </label>
              <input
                type="text"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Instructions & Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Complete SOP reading and pass online quiz before practical shift evaluation."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
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
              disabled={selectedEmployees.length === 0}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-lg shadow-amber-950/50 flex items-center gap-2 disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm Assignment ({selectedEmployees.length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
