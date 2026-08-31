import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  HelpCircle,
  Layers,
  Plus,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
  Building,
  Sparkles,
  PenTool,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlobalOperatorSearch } from './GlobalOperatorSearch';
import { TrainingDashboardView } from './TrainingDashboardView';
import { TrainingPlansView } from './TrainingPlansView';
import { TrainingLibraryView } from './TrainingLibraryView';
import { TrainingTestsView } from './TrainingTestsView';
import { EmployeeCompetencyView } from './EmployeeCompetencyView';
import { MonitoringRecordsView } from './MonitoringRecordsView';
import { ExpiryRenewalView } from './ExpiryRenewalView';
import { CorrectiveTrainingView } from './CorrectiveTrainingView';
import { TrainingReportsView } from './TrainingReportsView';
import { CompanyProgramsManagement } from './CompanyProgramsManagement';
import { QuestionPaperOcrStudio } from './QuestionPaperOcrStudio';
import { TwoStageSignOffWorkflow } from './TwoStageSignOffWorkflow';
import { TrainingAuditTrailView } from './TrainingAuditTrailView';
import { DigitalTestEngineModal } from './DigitalTestEngineModal';
import { AssignTrainingModal } from './AssignTrainingModal';
import { LogMonitoringModal } from './LogMonitoringModal';
import { PracticalEvaluationModal } from './PracticalEvaluationModal';

export const TrainingModuleView: React.FC = () => {
  const {
    trainingAssignments,
    correctiveTrainingRecords,
    trainingSignOffSessions,
    triggerHaptic,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Global modals & Active Session Targets
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMonitoringModal, setShowMonitoringModal] = useState(false);
  const [showPracticalModal, setShowPracticalModal] = useState(false);
  const [activeTestSessionId, setActiveTestSessionId] = useState<string | null>(null);
  const [activeTestProgramId, setActiveTestProgramId] = useState<string | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);

  // Target program for OCR Studio
  const [ocrTargetProgramId, setOcrTargetProgramId] = useState<string | undefined>(undefined);

  const urgentCount = trainingAssignments.filter(
    (a) => a.status === 'Overdue' || a.status === 'Expired'
  ).length;

  const openCAPACount = correctiveTrainingRecords.filter(
    (c) => c.status === 'Open' || c.status === 'In Progress'
  ).length;

  const pendingSignOffCount = trainingSignOffSessions.filter(
    (s) => !s.trainerPreSigned || !s.operatorAckSigned
  ).length;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'company-programs', label: 'Company Programs', icon: Building },
    { id: 'ocr-studio', label: 'Paper OCR Studio', icon: Sparkles },
    {
      id: 'sign-offs',
      label: 'Two-Stage Sign-Off',
      icon: PenTool,
      badge: pendingSignOffCount > 0 ? pendingSignOffCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    { id: 'competency-matrix', label: 'Competency Matrix', icon: Award },
    { id: 'training-plans', label: 'Training Plans', icon: Calendar },
    { id: 'training-library', label: 'SOP Library', icon: BookOpen },
    { id: 'training-tests', label: 'Tests & Quizzes', icon: HelpCircle },
    { id: 'monitoring-records', label: 'Shopfloor Audits', icon: Eye },
    { id: 'audit-trail', label: 'Audit History', icon: History },
    {
      id: 'expiry-renewal',
      label: 'Expiries',
      icon: Clock,
      badge: urgentCount > 0 ? urgentCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'corrective-training',
      label: 'CAPA Retraining',
      icon: Zap,
      badge: openCAPACount > 0 ? openCAPACount : undefined,
      badgeColor: 'bg-orange-500 text-slate-950',
    },
    { id: 'training-reports', label: 'Reports', icon: FileText },
  ];

  const handleLaunchDigitalTest = (sessionId?: string, programId?: string) => {
    setActiveTestSessionId(sessionId || null);
    setActiveTestProgramId(programId || null);
    setShowTestModal(true);
  };

  const handleOpenOcrStudio = (programId?: string) => {
    setOcrTargetProgramId(programId);
    setActiveTab('ocr-studio');
  };

  const handleOpenSignOff = (sessionId?: string) => {
    setActiveTab('sign-offs');
  };

  return (
    <div className="p-3 sm:p-5 max-w-[1600px] mx-auto space-y-5 pb-24">
      {/* Top Banner with Header & Global Operator Search */}
      <div className="bg-slate-850 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow-lg shadow-amber-950/40 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Training & Competency Management
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ISO / IATF 16949
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Operator certification, machine-specific skill levels, supervisor practical sign-offs & closed-loop CAPA
              </p>
            </div>
          </div>

          {/* Quick Header Launchers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic();
                handleOpenOcrStudio();
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-950/50"
            >
              <Sparkles className="w-4 h-4" /> Paper OCR
            </button>
            <button
              onClick={() => {
                triggerHaptic();
                setShowAssignModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/50"
            >
              <Plus className="w-4 h-4" /> Enroll
            </button>
            <button
              onClick={() => {
                triggerHaptic();
                setShowMonitoringModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50"
            >
              <Eye className="w-4 h-4" /> Audit
            </button>
          </div>
        </div>

        {/* Global Operator Search Bar */}
        <div className="pt-2 border-t border-slate-800/80">
          <GlobalOperatorSearch
            onStartDigitalTest={handleLaunchDigitalTest}
            onOpenSignOff={handleOpenSignOff}
            onAssignProgram={() => setShowAssignModal(true)}
          />
        </div>

        {/* Scrollable Navigation Pill Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/30 font-extrabold'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Tab Component */}
      {activeTab === 'dashboard' && (
        <TrainingDashboardView
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenAssignModal={() => setShowAssignModal(true)}
          onOpenMonitoringModal={() => setShowMonitoringModal(true)}
          onOpenPracticalModal={() => setShowPracticalModal(true)}
        />
      )}

      {activeTab === 'company-programs' && (
        <CompanyProgramsManagement
          onOpenOcrStudio={handleOpenOcrStudio}
          onOpenSignOff={handleOpenSignOff}
          onOpenDigitalTest={handleLaunchDigitalTest}
        />
      )}

      {activeTab === 'ocr-studio' && (
        <QuestionPaperOcrStudio
          initialProgramId={ocrTargetProgramId}
          onOpenDigitalTest={handleLaunchDigitalTest}
        />
      )}

      {activeTab === 'sign-offs' && (
        <TwoStageSignOffWorkflow
          onOpenDigitalTest={handleLaunchDigitalTest}
        />
      )}

      {activeTab === 'audit-trail' && <TrainingAuditTrailView />}
      {activeTab === 'training-plans' && <TrainingPlansView />}
      {activeTab === 'training-library' && <TrainingLibraryView />}
      {activeTab === 'competency-matrix' && <EmployeeCompetencyView />}
      {activeTab === 'training-tests' && <TrainingTestsView />}
      {activeTab === 'monitoring-records' && <MonitoringRecordsView />}
      {activeTab === 'expiry-renewal' && <ExpiryRenewalView />}
      {activeTab === 'corrective-training' && <CorrectiveTrainingView />}
      {activeTab === 'training-reports' && <TrainingReportsView />}

      {/* Global Modals */}
      {showAssignModal && <AssignTrainingModal onClose={() => setShowAssignModal(false)} />}
      {showMonitoringModal && <LogMonitoringModal onClose={() => setShowMonitoringModal(false)} />}
      {showPracticalModal && <PracticalEvaluationModal onClose={() => setShowPracticalModal(false)} />}

      {/* Digital Test Modal */}
      {showTestModal && (
        <DigitalTestEngineModal
          sessionId={activeTestSessionId || undefined}
          programId={activeTestProgramId || undefined}
          onClose={() => {
            setShowTestModal(false);
            setActiveTestSessionId(null);
            setActiveTestProgramId(null);
          }}
        />
      )}
    </div>
  );
};

