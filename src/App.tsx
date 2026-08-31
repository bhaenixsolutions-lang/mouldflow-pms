import React, { useState } from 'react';
import { AppProvider, useApp, ActiveModule } from './context/AppContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { RoleSwitcherModal } from './components/layout/RoleSwitcherModal';
import { MobileDashboard } from './components/dashboard/MobileDashboard';
import { HourlyReportView } from './components/production/HourlyReportView';
import { HourlyEntryModal } from './components/production/HourlyReportModal';
import { NewReportModal } from './components/production/NewReportModal';
import { OCRScannerModal } from './components/ocr/OCRScannerModal';
import { RejectionView } from './components/rejection/RejectionView';
import { LogRejectionModal } from './components/rejection/LogRejectionModal';
import { DowntimeView } from './components/downtime/DowntimeView';
import { LogDowntimeModal } from './components/downtime/LogDowntimeModal';
import { MachinesView } from './components/machines/MachinesView';
import { ProductsView } from './components/products/ProductsView';
import { StaffView } from './components/staff/StaffView';
import { OperatorMonitoringView } from './components/staff/OperatorMonitoringView';
import { SupervisorMonitoringView } from './components/staff/SupervisorMonitoringView';
import { DepartmentsView } from './components/departments/DepartmentsView';
import { ShiftsView } from './components/shifts/ShiftsView';
import { MonthlyPlanningView } from './components/planning/MonthlyPlanningView';
import { MachinePlanningView } from './components/planning/MachinePlanningView';
import { ManpowerPlanningView } from './components/planning/ManpowerPlanningView';
import { InventoryView } from './components/inventory/InventoryView';
import { DailySummaryView } from './components/summary/DailySummaryView';
import { MonthlyAnalyticsView } from './components/analytics/MonthlyAnalyticsView';
import { ProductMachineAnalysisView } from './components/analytics/ProductMachineAnalysisView';
import { AIAdvisorView } from './components/ai/AIAdvisorView';
import { ApprovalsView } from './components/approvals/ApprovalsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { AdminView } from './components/admin/AdminView';
import { TrainingModuleView } from './components/training/TrainingModuleView';

const MainLayout: React.FC = () => {
  const { activeModule, setActiveModule, reports, triggerHaptic } = useApp();

  // Modals state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [isHourlyEntryModalOpen, setIsHourlyEntryModalOpen] = useState(false);
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [isLogRejectionModalOpen, setIsLogRejectionModalOpen] = useState(false);
  const [isLogDowntimeModalOpen, setIsLogDowntimeModalOpen] = useState(false);

  // Selected report for hourly entry editing
  const [selectedReportIdForEntry, setSelectedReportIdForEntry] = useState<string | null>(reports[0]?.id || null);
  const [selectedHourForEntry, setSelectedHourForEntry] = useState<number>(1);
  const [advisorInitialDefect, setAdvisorInitialDefect] = useState<string>('DEF-SHORT-SHOT');

  const handleOpenHourlyEntry = (reportId?: string, hourIndex?: number) => {
    setSelectedReportIdForEntry(reportId || reports[0]?.id || null);
    setSelectedHourForEntry(hourIndex || 1);
    setIsHourlyEntryModalOpen(true);
  };

  const handleOpenDefectAdvisor = (defectCode: string, defectName: string) => {
    setAdvisorInitialDefect(defectCode);
    setActiveModule('ai-recommendations');
  };

  const handleOpenReportDetails = (reportId: string) => {
    setSelectedReportIdForEntry(reportId);
    setActiveModule('hourly-reports');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Industrial Top Header with Shift & Dept Filters */}
      <Header
        onOpenOcr={() => setIsOcrModalOpen(true)}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
      />

      {/* 2. Main Module View Container */}
      <main className="flex-1 overflow-x-hidden pt-1">
        {activeModule === 'dashboard' && (
          <MobileDashboard
            onOpenQuickEntry={() => handleOpenHourlyEntry()}
            onOpenOcr={() => setIsOcrModalOpen(true)}
            onOpenDowntime={() => setIsLogDowntimeModalOpen(true)}
            onOpenRejection={() => setIsLogRejectionModalOpen(true)}
          />
        )}

        {activeModule === 'hourly-reports' && (
          <HourlyReportView
            onOpenNewReportModal={() => setIsNewReportModalOpen(true)}
            onOpenHourlyEntryModal={(repId, hour) => handleOpenHourlyEntry(repId, hour)}
            onOpenOcr={() => setIsOcrModalOpen(true)}
          />
        )}

        {activeModule === 'rejections' && (
          <RejectionView
            onOpenLogRejection={() => setIsLogRejectionModalOpen(true)}
            onOpenDefectAdvisor={handleOpenDefectAdvisor}
          />
        )}

        {activeModule === 'downtime' && (
          <DowntimeView
            onOpenLogDowntime={() => setIsLogDowntimeModalOpen(true)}
          />
        )}

        {activeModule === 'machines' && (
          <MachinesView
            onOpenHourlyEntry={handleOpenHourlyEntry}
            onOpenLogRejection={() => setIsLogRejectionModalOpen(true)}
            onOpenLogDowntime={() => setIsLogDowntimeModalOpen(true)}
          />
        )}
        {activeModule === 'product-machine-analysis' && <ProductMachineAnalysisView />}
        {activeModule === 'operator-monitoring' && <OperatorMonitoringView />}
        {activeModule === 'supervisor-monitoring' && <SupervisorMonitoringView />}
        {activeModule === 'products' && <ProductsView />}
        {activeModule === 'staff' && <StaffView />}
        {activeModule === 'departments' && <DepartmentsView />}
        {activeModule === 'shifts' && <ShiftsView />}
        {activeModule === 'monthly-planning' && <MonthlyPlanningView />}
        {activeModule === 'machine-planning' && <MachinePlanningView />}
        {activeModule === 'manpower-planning' && <ManpowerPlanningView />}
        {activeModule === 'inventory' && <InventoryView />}
        {activeModule === 'daily-summary' && <DailySummaryView />}
        {activeModule === 'monthly-analytics' && <MonthlyAnalyticsView />}
        {activeModule === 'ai-recommendations' && (
          <AIAdvisorView initialDefectCode={advisorInitialDefect} />
        )}
        {activeModule === 'training' && <TrainingModuleView />}
        {activeModule === 'approvals' && (
          <ApprovalsView onOpenReportDetails={handleOpenReportDetails} />
        )}
        {activeModule === 'audit-logs' && <AuditLogsView />}
        {activeModule === 'admin' && <AdminView />}
      </main>

      {/* 3. Bottom Ergonomic Navigation with Role-Tailored Tabs & Center Action Button */}
      <BottomNav
        onOpenQuickEntry={() => handleOpenHourlyEntry()}
        onOpenOcr={() => setIsOcrModalOpen(true)}
      />

      {/* 4. Global Industrial Modals */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      <OCRScannerModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
      />

      <HourlyEntryModal
        isOpen={isHourlyEntryModalOpen}
        onClose={() => setIsHourlyEntryModalOpen(false)}
        reportId={selectedReportIdForEntry}
        hourIndex={selectedHourForEntry}
      />

      <NewReportModal
        isOpen={isNewReportModalOpen}
        onClose={() => setIsNewReportModalOpen(false)}
      />

      <LogRejectionModal
        isOpen={isLogRejectionModalOpen}
        onClose={() => setIsLogRejectionModalOpen(false)}
      />

      <LogDowntimeModal
        isOpen={isLogDowntimeModalOpen}
        onClose={() => setIsLogDowntimeModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
