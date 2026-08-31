import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Award,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Filter,
  Search,
  Calendar,
  Layers,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TrainingReportsView: React.FC = () => {
  const {
    trainingAssignments,
    trainingMasters,
    trainingAttendance,
    practicalEvaluations,
    shopfloorMonitoringRecords,
    users,
    machines,
    departments,
    triggerHaptic,
  } = useApp();

  const [selectedReportType, setSelectedReportType] = useState<
    'compliance' | 'machine-qualification' | 'attendance' | 'audit-log'
  >('compliance');
  const [selectedDept, setSelectedDept] = useState('all');

  const exportCSV = () => {
    triggerHaptic();
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (selectedReportType === 'compliance') {
      csvContent += 'Employee Name,Code,Department,Training Code,Training Title,Status,Test Result,Score Pct,Practical Result,Due Date,Expiry Date\n';
      trainingAssignments.forEach((a) => {
        csvContent += `"${a.employeeName}","${a.employeeCode}","${a.departmentId}","${a.trainingCode}","${a.trainingTitle}","${a.status}","${a.testResult || 'N/A'}","${a.testScorePct ?? 'N/A'}","${a.practicalResult || 'N/A'}","${a.dueDate}","${a.validityExpiryDate || 'N/A'}"\n`;
      });
    } else if (selectedReportType === 'attendance') {
      csvContent += 'Date,Topic,Trainer,Employee,Code,Department,Mode,Hours,Signoff Status\n';
      trainingAttendance.forEach((att) => {
        const d = att.trainingDate || att.date || '2025-02-20';
        const m = att.mode || 'Classroom / Practical';
        const h = att.hoursAttended || 1.5;
        const s = att.signatureStatus || (att.employeeSigned ? 'Signed' : 'Pending');
        csvContent += `"${d}","${att.trainingTopic}","${att.trainerName}","${att.employeeName}","${att.employeeCode}","${att.departmentId}","${m}","${h}","${s}"\n`;
      });
    } else {
      csvContent += 'Machine,Employee,Status,Practical Score,Evaluation Date,Expiry Date\n';
      practicalEvaluations.forEach((p) => {
        csvContent += `"${p.machineCode || 'N/A'}","${p.employeeName}","${p.competencyResult}","${p.overallScorePct}%","${p.evaluationDate}","${p.qualificationExpiryDate || 'N/A'}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MouldFlow_${selectedReportType}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    triggerHaptic();
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Header & Export Bar */}
      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Training & Competency Compliance Reports
            </h2>
            <p className="text-xs text-slate-400">
              Audit-ready training logs, qualification matrix summaries & statutory attendance export
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Report
            </button>
          </div>
        </div>

        {/* Report Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setSelectedReportType('compliance')}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedReportType === 'compliance'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Training Compliance Matrix
          </button>
          <button
            onClick={() => setSelectedReportType('machine-qualification')}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedReportType === 'machine-qualification'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Machine Qualification Audits
          </button>
          <button
            onClick={() => setSelectedReportType('attendance')}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedReportType === 'attendance'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Classroom & SOP Attendance
          </button>
          <button
            onClick={() => setSelectedReportType('audit-log')}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedReportType === 'audit-log'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Shopfloor Observation Trends
          </button>
        </div>
      </div>

      {/* Report Table Display */}
      <div className="bg-slate-850 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {selectedReportType === 'compliance' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="p-3.5 pl-4">Employee</th>
                  <th className="p-3.5">Training Module</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Quiz Score</th>
                  <th className="p-3.5">Practical Eval</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5 pr-4">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {trainingAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 pl-4">
                      <span className="font-bold text-white block">{a.employeeName}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{a.employeeCode} • {a.role}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-200 block">{a.trainingTitle}</span>
                      <span className="text-amber-400 font-mono text-[10px]">{a.trainingCode}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono">
                      {a.testScorePct !== undefined ? (
                        <span className={a.testResult === 'Passed' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {a.testScorePct}% ({a.testResult})
                        </span>
                      ) : (
                        <span className="text-slate-500">Pending</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono">
                      {a.practicalScorePct !== undefined ? (
                        <span className={a.practicalResult === 'Competent' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {a.practicalScorePct}% ({a.practicalResult})
                        </span>
                      ) : (
                        <span className="text-slate-500">Pending</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{a.dueDate}</td>
                    <td className="p-3.5 pr-4 font-mono text-slate-300">{a.validityExpiryDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReportType === 'attendance' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="p-3.5 pl-4">Date</th>
                  <th className="p-3.5">Training Topic</th>
                  <th className="p-3.5">Trainer</th>
                  <th className="p-3.5">Attendee Employee</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5 pr-4">Signoff Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {trainingAttendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 pl-4 font-mono text-slate-300">{att.trainingDate || att.date || '2025-02-20'}</td>
                    <td className="p-3.5 font-bold text-white">{att.trainingTopic}</td>
                    <td className="p-3.5 text-slate-300">{att.trainerName}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-200 block">{att.employeeName}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{att.employeeCode}</span>
                    </td>
                    <td className="p-3.5 font-mono text-cyan-400">
                      {att.hoursAttended || 1.5} hrs ({att.mode || 'Practical'})
                    </td>
                    <td className="p-3.5 pr-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {att.signatureStatus || (att.employeeSigned ? 'Signed' : 'Pending')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReportType === 'machine-qualification' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="p-3.5 pl-4">Target Machine</th>
                  <th className="p-3.5">Operator Candidate</th>
                  <th className="p-3.5">Evaluator</th>
                  <th className="p-3.5">Practical Score</th>
                  <th className="p-3.5">Decision</th>
                  <th className="p-3.5 pr-4">Audit Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {practicalEvaluations.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 pl-4 font-mono font-bold text-cyan-300">{p.machineCode || 'ALL-IMM'}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-white block">{p.employeeName}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{p.employeeCode}</span>
                    </td>
                    <td className="p-3.5 text-slate-300">{p.evaluatorName}</td>
                    <td className="p-3.5 font-mono font-bold text-amber-400">{p.overallScorePct}%</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.competencyResult === 'Competent'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {p.competencyResult}
                      </span>
                    </td>
                    <td className="p-3.5 pr-4 font-mono text-slate-300">{p.evaluationDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReportType === 'audit-log' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="p-3.5 pl-4">Date</th>
                  <th className="p-3.5">Operator</th>
                  <th className="p-3.5">Machine</th>
                  <th className="p-3.5">Auditor</th>
                  <th className="p-3.5">Compliance Score</th>
                  <th className="p-3.5 pr-4">Deviations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shopfloorMonitoringRecords.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 pl-4 font-mono text-slate-300">{m.monitoringDate || m.date}</td>
                    <td className="p-3.5 font-bold text-white">{m.employeeName}</td>
                    <td className="p-3.5 font-mono text-cyan-300">{m.machineCode}</td>
                    <td className="p-3.5 text-slate-300">{m.supervisorName}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">{m.monitoringScorePct}% ({m.scoreStatus})</td>
                    <td className="p-3.5 pr-4 font-mono text-rose-400">
                      {m.criticalIssuesCount} Critical • {m.deviationsCount || 0} Dev
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
