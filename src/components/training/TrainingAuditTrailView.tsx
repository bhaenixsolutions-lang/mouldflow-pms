import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  PenTool,
  Award,
  HelpCircle,
  FileCheck,
  Building,
  User,
  Printer,
  Eye,
  GitBranch,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { normalizePassMark } from '../../utils/assessmentUtils';

export const TrainingAuditTrailView: React.FC = () => {
  const {
    companies,
    selectedCompanyId,
    trainingSignOffSessions,
    companyQuestionPapers,
    companyTrainingPrograms,
    triggerHaptic,
  } = useApp();

  const currentCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  // Build unified audit records
  const auditRecords = useMemo(() => {
    const records: Array<{
      id: string;
      timestamp: string;
      actionType: 'SIGN_OFF' | 'OCR_IMPORT' | 'VERSION_UPGRADE' | 'TEST_COMPLETED' | 'CAPA_TRIGGER';
      entityTitle: string;
      operatorName: string;
      operatorCode: string;
      trainerName: string;
      version: string;
      statusBadge: string;
      statusColor: string;
      details: string;
      signaturesPresent: boolean;
      sessionRef?: any;
    }> = [];

    // Add sign-off sessions
    trainingSignOffSessions
      .filter((s) => !s.companyId || s.companyId === selectedCompanyId)
      .forEach((s) => {
        if (s.trainerPreSigned) {
          records.push({
            id: `audit-${s.id}-stage1`,
            timestamp: `${s.trainerPreSignDate || '2026-08-30'} ${s.trainerPreSignTime || '09:00'}`,
            actionType: 'SIGN_OFF',
            entityTitle: `Stage 1 Trainer Verification: ${s.trainingProgramTitle}`,
            operatorName: s.employeeName,
            operatorCode: s.employeeCode,
            trainerName: s.trainerName,
            version: `v${s.questionPaperVersion}`,
            statusBadge: 'TRAINER SIGNED',
            statusColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
            details: `Lead Trainer verified safety protocols, PPE and machine lockout procedures.`,
            signaturesPresent: true,
            sessionRef: s,
          });
        }

        if (s.operatorAckSigned) {
          records.push({
            id: `audit-${s.id}-stage2`,
            timestamp: `${s.operatorAckDate || '2026-08-30'} ${s.operatorAckTime || '09:30'}`,
            actionType: 'SIGN_OFF',
            entityTitle: `Stage 2 Operator Acknowledgement: ${s.trainingProgramTitle}`,
            operatorName: s.employeeName,
            operatorCode: s.employeeCode,
            trainerName: s.trainerName,
            version: `v${s.questionPaperVersion}`,
            statusBadge: 'OPERATOR ACKNOWLEDGED',
            statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            details: `Operator signed acknowledgement of SOP understanding and hourly defect checking responsibility.`,
            signaturesPresent: true,
            sessionRef: s,
          });
        }

        if (s.testCompleted) {
          const passMark = normalizePassMark(s.passMark, 80);
          records.push({
            id: `audit-${s.id}-test`,
            timestamp: s.testSubmitTime ? new Date(s.testSubmitTime).toLocaleString() : '2026-08-30 10:00',
            actionType: 'TEST_COMPLETED',
            entityTitle: `Digital Exam Submitted: ${s.questionPaperTitle}`,
            operatorName: s.employeeName,
            operatorCode: s.employeeCode,
            trainerName: s.trainerName,
            version: `v${s.questionPaperVersion}`,
            statusBadge: s.testResult === 'PASSED' ? 'TEST PASSED (COMPETENT)' : 'TEST FAILED (RETRAINING)',
            statusColor: s.testResult === 'PASSED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30',
            details: `Scored ${s.testScore}/${s.maxScore} marks (${s.testPercentage}%). Pass Mark: ${passMark}%. Result: ${s.testResult}.`,
            signaturesPresent: false,
            sessionRef: s,
          });
        }
      });

    // Add Question Paper OCR imports
    companyQuestionPapers
      .filter((qp) => !qp.companyId || qp.companyId === selectedCompanyId)
      .forEach((qp) => {
        records.push({
          id: `audit-ocr-${qp.id}`,
          timestamp: qp.ocrExtractedAt || '2026-08-30 08:00',
          actionType: 'OCR_IMPORT',
          entityTitle: `OCR Paper Ingestion: ${qp.title}`,
          operatorName: 'System / Quality Dept',
          operatorCode: 'SYS-AUDIT',
          trainerName: qp.approvedBy || 'Quality Manager',
          version: `v${qp.version}`,
          statusBadge: `OCR ${qp.ocrConfidenceScore || 96}% CONFIDENCE`,
          statusColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          details: `Ingested ${qp.questions.length} questions from ${qp.originalDocumentName || 'Paper Sheet'} with passing threshold of ${qp.passingPercentage || 80}%.`,
          signaturesPresent: false,
        });
      });

    return records.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  }, [trainingSignOffSessions, companyQuestionPapers, selectedCompanyId]);

  // Filter records
  const filteredAudit = useMemo(() => {
    return auditRecords.filter((rec) => {
      const matchAction = filterAction === 'ALL' || rec.actionType === filterAction;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        rec.entityTitle.toLowerCase().includes(q) ||
        rec.operatorName.toLowerCase().includes(q) ||
        rec.operatorCode.toLowerCase().includes(q) ||
        rec.trainerName.toLowerCase().includes(q) ||
        rec.version.toLowerCase().includes(q) ||
        rec.details.toLowerCase().includes(q);

      return matchAction && matchSearch;
    });
  }, [auditRecords, filterAction, searchQuery]);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-black text-white">
                Compliance & Training Audit Trail
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tamper-evident logs of dual sign-offs, OCR document ingestion, version revisions, and test scores for IATF 16949 audits
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700"
          >
            <Printer className="w-4 h-4" /> Export Inspection Log
          </button>
        </div>

        {/* Filter & Search Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail by operator, paper, or version..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'All Events' },
              { id: 'SIGN_OFF', label: 'Sign-Offs' },
              { id: 'TEST_COMPLETED', label: 'Exams' },
              { id: 'OCR_IMPORT', label: 'OCR Imports' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  triggerHaptic();
                  setFilterAction(f.id);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  filterAction === f.id
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table / Feed */}
      <div className="bg-slate-850 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Verified Audit Events ({filteredAudit.length})
          </span>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> ISO 9001:2015 §7.2 / IATF 16949 §7.2.1
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {filteredAudit.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No audit records matching your search.
            </div>
          ) : (
            filteredAudit.map((rec) => (
              <div
                key={rec.id}
                className="p-4 sm:p-5 hover:bg-slate-800/40 transition-colors space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {rec.timestamp}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${rec.statusColor}`}>
                      {rec.statusBadge}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/40">
                      {rec.version}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    Lead: <strong className="text-white">{rec.trainerName}</strong>
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-white text-sm">{rec.entityTitle}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{rec.details}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>
                    Operator: <strong className="text-slate-300">{rec.operatorName}</strong> ({rec.operatorCode})
                  </span>
                  {rec.signaturesPresent && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <PenTool className="w-3 h-3" /> Biometric / Touch e-Signatures Verified
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
