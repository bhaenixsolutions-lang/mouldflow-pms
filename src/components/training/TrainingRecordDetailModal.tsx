import React, { useRef } from 'react';
import {
  X,
  Printer,
  FileDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Building,
  Award,
  BookOpen,
  FileText,
  History,
  CheckSquare,
  Paperclip,
  ExternalLink,
  Shield,
  Zap,
} from 'lucide-react';
import { TrainingSignOffSession, PracticalChecklistItem, TrainingAttemptRecord, TrainingAuditTimelineEvent } from '../../types/training';
import { useApp } from '../../context/AppContext';

interface TrainingRecordDetailModalProps {
  session: TrainingSignOffSession;
  onClose: () => void;
  onOpenAuditHistory?: () => void;
}

export const TrainingRecordDetailModal: React.FC<TrainingRecordDetailModalProps> = ({
  session,
  onClose,
  onOpenAuditHistory,
}) => {
  const { triggerHaptic } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    triggerHaptic();
    window.print();
  };

  const isPassed = session.testPassed || session.testResult === 'PASSED' || (session.testScorePercentage !== undefined && session.testScorePercentage >= (session.passMark || 80));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
      <div
        ref={printRef}
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 print:border-none print:shadow-none print:max-h-none print:w-full print:bg-white print:text-black"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 print:border-b-2 print:border-black">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg shrink-0 ${
              isPassed
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            } print:border-black print:text-black`}>
              {isPassed ? <Award className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  isPassed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                } print:border-black print:text-black`}>
                  {isPassed ? 'COMPETENT / CERTIFIED' : 'RETRAINING REQUIRED'}
                </span>
                <span className="text-xs text-slate-400 font-mono print:text-black">
                  Record ID: {session.id}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5 print:text-black">
                TRAINING &amp; COMPETENCY RECORD
              </h2>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Record</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Record Body */}
        <div className="p-4 sm:p-7 space-y-6 overflow-y-auto flex-1 text-slate-300 text-xs print:text-black print:overflow-visible">
          {/* Top Summary Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-850 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 print:border-black print:bg-slate-100">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider print:text-gray-600">Operator</span>
              <p className="font-black text-white text-sm print:text-black">{session.employeeName}</p>
              <p className="text-sky-400 font-mono text-xs print:text-black">ID: {session.employeeCode || session.employeeId}</p>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider print:text-gray-600">Training Title</span>
              <p className="font-bold text-white text-sm print:text-black">{session.trainingProgramTitle}</p>
              <p className="text-slate-400 font-mono text-xs print:text-black">{session.trainingProgramCode || 'PRG-SAF-104'}</p>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider print:text-gray-600">Trainer</span>
              <p className="font-bold text-slate-200 text-xs print:text-black">{session.trainerName}</p>
              <p className="text-slate-400 font-mono text-[11px] print:text-black">ID: {session.trainerEmployeeId || 'SUP-007'}</p>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider print:text-gray-600">Assessment Score</span>
              <p className={`font-black text-sm ${isPassed ? 'text-emerald-400' : 'text-rose-400'} print:text-black`}>
                {session.testScorePercentage ?? (session.testPassed ? 100 : 0)}% ({isPassed ? 'PASSED' : 'FAILED'})
              </p>
              <p className="text-slate-400 text-[11px] print:text-black">Pass Mark: {session.passMark || 80}%</p>
            </div>
          </div>

          {/* 1. Training Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 print:text-black">
              <BookOpen className="w-4 h-4 text-sky-400 print:text-black" />
              1. Training Program &amp; Assignment Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 print:border-black print:bg-white">
              <div>
                <span className="text-slate-500 font-bold text-[10px] uppercase">Training Category</span>
                <p className="font-semibold text-slate-200 print:text-black">{session.trainingCategory || 'Safety Training'}</p>
              </div>

              <div>
                <span className="text-slate-500 font-bold text-[10px] uppercase">Training Method</span>
                <p className="font-semibold text-slate-200 print:text-black">{session.trainingMethod || 'Practical + Digital Theory'}</p>
              </div>

              <div>
                <span className="text-slate-500 font-bold text-[10px] uppercase">Target Machine</span>
                <p className="font-semibold text-slate-200 print:text-black">{session.machineCode || 'IMM-01 (Toshiba 180T)'}</p>
              </div>

              <div>
                <span className="text-slate-500 font-bold text-[10px] uppercase">Duration &amp; Validity</span>
                <p className="font-semibold text-slate-200 print:text-black">
                  {session.trainingDuration || 45} mins • {session.validityMonths || 12} Months
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-bold text-[10px] uppercase">Training Date</span>
                <p className="font-semibold text-slate-200 print:text-black">{session.trainingDate || '2026-03-01'}</p>
              </div>

              <div>
                <span className="text-slate-500 font-bold text-[10px] uppercase">Expiry / Renewal Date</span>
                <p className="font-semibold text-slate-200 print:text-black">{session.expiryDate || '2027-03-01'}</p>
              </div>

              <div>
                <span className="text-slate-500 font-bold text-[10px] uppercase">Training Type</span>
                <p className="font-semibold text-slate-200 print:text-black">{session.trainingType || 'Mandatory Skill Initial'}</p>
              </div>

              <div>
                <span className="text-slate-500 font-bold text-[10px] uppercase">Compliance Framework</span>
                <p className="font-semibold text-emerald-400 print:text-black">Audit-Ready Standard</p>
              </div>
            </div>
          </div>

          {/* 2. Practical Training Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 print:text-black">
              <CheckSquare className="w-4 h-4 text-amber-400 print:text-black" />
              2. Practical Training &amp; SOP Execution Checklist
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 print:border-black print:bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  '1. Machine safety explained (Mechanical drop bar & gate interlocks)',
                  '2. Emergency stop demonstrated (Front & rear instantaneous stop)',
                  '3. PPE requirements explained (Thermal Kevlar sleeves & face shield)',
                  '4. Machine start-up procedure demonstrated (Hydraulic pump & heater PID)',
                  '5. Parameter verification explained (Setting card vs HMI cushion)',
                  '6. Mould loading/unloading demonstrated (LPMP mould protection)',
                  '7. First-piece inspection explained (Boundary visual sample review)',
                  '8. Abnormal condition response explained (Heater alarm & drool action)',
                  '9. Shutdown procedure demonstrated (Purge clean & LOTO protocol)',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-300 print:text-black">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 print:text-black" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {session.trainerRemarks && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 print:border-black print:bg-slate-50 print:text-black">
                  <strong className="text-slate-400 font-bold uppercase print:text-black">Trainer Observation: </strong>
                  {session.trainerRemarks}
                </div>
              )}
            </div>
          </div>

          {/* 3 & 4. Dual Signatures (Stage 1 Trainer & Stage 3 Operator) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Trainer Pre-Sign */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 print:border-black print:bg-white">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5 print:text-black">
                  <ShieldCheck className="w-4 h-4" />
                  3. Trainer Pre-Training Authorization
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800 print:border-black print:text-black">
                  PRE_TRAINING
                </span>
              </div>

              <div className="h-24 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden p-2 print:border-black print:bg-white">
                {session.trainerSignatureData ? (
                  <img
                    src={session.trainerSignatureData}
                    alt="Trainer Signature"
                    className="max-h-full object-contain filter invert-0 print:invert"
                  />
                ) : (
                  <span className="text-xs font-serif italic text-sky-300 print:text-black">
                    Signed Electronically: {session.trainerName}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 space-y-0.5 print:text-black">
                <p><strong className="text-slate-300 print:text-black">Trainer:</strong> {session.trainerName} ({session.trainerEmployeeId || 'SUP-007'})</p>
                <p><strong className="text-slate-300 print:text-black">Signed Date:</strong> {session.trainerPreSignDate || session.trainingDate || '2026-03-01'} {session.trainerPreSignTime || '09:30 AM'}</p>
                <p className="text-[10px] text-slate-500 italic print:text-black">&ldquo;I confirm that the above training has been planned and is ready to be conducted.&rdquo;</p>
              </div>
            </div>

            {/* Operator Acknowledgement */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 print:border-black print:bg-white">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 print:text-black">
                  <User className="w-4 h-4" />
                  4. Operator Acknowledgement
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 print:border-black print:text-black">
                  OPERATOR_ACK
                </span>
              </div>

              <div className="h-24 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden p-2 print:border-black print:bg-white">
                {session.operatorSignatureData ? (
                  <img
                    src={session.operatorSignatureData}
                    alt="Operator Signature"
                    className="max-h-full object-contain filter invert-0 print:invert"
                  />
                ) : (
                  <span className="text-xs font-serif italic text-emerald-300 print:text-black">
                    Signed Electronically: {session.employeeName}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 space-y-0.5 print:text-black">
                <p><strong className="text-slate-300 print:text-black">Operator:</strong> {session.employeeName} ({session.employeeCode || session.employeeId})</p>
                <p><strong className="text-slate-300 print:text-black">Signed Date:</strong> {session.operatorAckDate || session.trainingDate || '2026-03-01'} {session.operatorAckTime || '10:15 AM'}</p>
                <p className="text-[10px] text-slate-500 italic print:text-black">&ldquo;I confirm that the training/SOP/practical demonstration has been explained to me and I have understood the training content.&rdquo;</p>
              </div>
            </div>
          </div>

          {/* 5. Assessment Result */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 print:text-black">
              <Award className="w-4 h-4 text-purple-400 print:text-black" />
              5. Digital Theory Assessment Result
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center print:border-black print:bg-white">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Assessment Score</span>
                <p className={`text-lg font-black ${isPassed ? 'text-emerald-400' : 'text-rose-400'} print:text-black`}>
                  {session.testScorePercentage ?? 100}%
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Points Earned</span>
                <p className="text-lg font-bold text-white print:text-black">
                  {session.testPointsEarned || (isPassed ? 100 : 0)} / {session.testTotalPoints || 100}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Required Pass Mark</span>
                <p className="text-lg font-bold text-amber-400 print:text-black">{session.passMark || 80}%</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Decision</span>
                <p className={`text-base font-black ${isPassed ? 'text-emerald-400' : 'text-rose-400'} print:text-black`}>
                  {isPassed ? 'PASSED' : 'FAILED'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Attempt Number</span>
                <p className="text-lg font-bold text-slate-200 print:text-black">{session.currentAttempt || 1}</p>
              </div>
            </div>
          </div>

          {/* 6. Attempt History (If multiple attempts exist) */}
          {session.attemptHistory && session.attemptHistory.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 print:text-black">
                <History className="w-4 h-4 text-sky-400 print:text-black" />
                6. Historical Assessment Attempts
              </h3>

              <div className="space-y-2">
                {session.attemptHistory.map((att) => (
                  <div
                    key={att.attemptNumber}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs print:border-black print:bg-white"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-white print:text-black">Attempt {att.attemptNumber}</span>
                      <p className="text-[11px] text-slate-400 print:text-black">{att.submittedAt}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-300 print:text-black">Score: {att.scorePercentage}%</span>
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                        att.result === 'PASSED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      } print:border-black print:text-black`}>
                        {att.result}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. SOP Documents & Attached Materials */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 print:text-black">
              <Paperclip className="w-4 h-4 text-amber-400 print:text-black" />
              7. SOP Documents &amp; Reference Materials
            </h3>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 print:border-black print:bg-white">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <p className="font-bold text-white text-xs print:text-black">Apex_Machine_Safety_SOP_and_Test_v1.0.pdf</p>
                  <p className="text-[11px] text-slate-400 print:text-black">Standard Operating Procedure &amp; Assessment Question Bank</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold print:hidden">
                Verified Document
              </span>
            </div>
          </div>

          {/* 8. Audit Timeline Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 print:text-black">
                <Clock className="w-4 h-4 text-purple-400 print:text-black" />
                8. Compliance Audit Timeline
              </h3>
              {onOpenAuditHistory && (
                <button
                  type="button"
                  onClick={onOpenAuditHistory}
                  className="text-xs text-sky-400 hover:text-sky-300 font-bold print:hidden"
                >
                  View Full Audit Log &rarr;
                </button>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 print:border-black print:bg-white">
              <div className="flex items-start gap-3 text-xs">
                <span className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-white print:text-black">1. Training Assigned</p>
                  <p className="text-[11px] text-slate-400 print:text-black">Assigned to {session.employeeName} ({session.employeeCode}) by Training Coordinator.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-white print:text-black">2. Trainer Pre-Training Authorization</p>
                  <p className="text-[11px] text-slate-400 print:text-black">Signed by {session.trainerName} ({session.trainerEmployeeId || 'SUP-007'}) on {session.trainerPreSignDate || session.trainingDate}.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-white print:text-black">3. Practical Demonstration &amp; SOP Execution</p>
                  <p className="text-[11px] text-slate-400 print:text-black">9/9 Practical items marked Completed on machine {session.machineCode || 'IMM-01'}.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-white print:text-black">4. Operator Acknowledgement</p>
                  <p className="text-[11px] text-slate-400 print:text-black">Operator {session.employeeName} confirmed comprehension and signed.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isPassed ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <div>
                  <p className="font-bold text-white print:text-black">5. Digital Assessment Graded</p>
                  <p className="text-[11px] text-slate-400 print:text-black">
                    Result: {isPassed ? 'PASSED' : 'FAILED'} (Score: {session.testScorePercentage ?? 100}%, Pass Mark: {session.passMark || 80}%).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Digital Record Cryptographically Sealed • MouldFlow Audit Compliance</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
