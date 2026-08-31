import React from 'react';
import {
  Activity,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  Menu,
  ShieldCheck,
  Calendar,
  Package,
  BarChart3,
  CheckCircle,
  Plus,
  Camera,
  Cpu,
  Award,
} from 'lucide-react';
import { useApp, ActiveModule } from '../../context/AppContext';

interface BottomNavProps {
  onOpenQuickEntry: () => void;
  onOpenOcr: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenQuickEntry, onOpenOcr }) => {
  const { activeModule, setActiveModule, currentUser, triggerHaptic, reports, downtimes, trainingAssignments } = useApp();

  const pendingApprovalsCount = reports.filter(
    (r) => r.status === 'Submitted' || r.status === 'Verified'
  ).length;

  const activeDowntimesCount = downtimes.filter((d) => !d.isResolved).length;

  const overdueTrainingsCount = trainingAssignments.filter(
    (a) => a.status === 'Overdue' || a.status === 'Expired'
  ).length;

  // Adaptive 4 primary tabs based on current role + center action button
  const getTabsForRole = (): { id: ActiveModule; label: string; icon: React.ReactNode; badge?: number }[] => {
    switch (currentUser.role) {
      case 'Trainer':
        return [
          { id: 'dashboard', label: 'Home', icon: <Activity className="w-5 h-5" /> },
          { id: 'training', label: 'Training', icon: <Award className="w-5 h-5" />, badge: overdueTrainingsCount },
          { id: 'staff', label: 'Staff', icon: <Cpu className="w-5 h-5" /> },
          { id: 'hourly-reports', label: 'Reports', icon: <FileSpreadsheet className="w-5 h-5" /> },
        ];
      case 'Operator':
      case 'Senior Operator':
        return [
          { id: 'dashboard', label: 'Home', icon: <Activity className="w-5 h-5" /> },
          { id: 'hourly-reports', label: 'Hourly', icon: <FileSpreadsheet className="w-5 h-5" /> },
          { id: 'training', label: 'Skills', icon: <Award className="w-5 h-5" /> },
          { id: 'downtime', label: 'Stoppage', icon: <Clock className="w-5 h-5" />, badge: activeDowntimesCount },
        ];
      case 'Quality Supervisor':
        return [
          { id: 'dashboard', label: 'Home', icon: <Activity className="w-5 h-5" /> },
          { id: 'rejections', label: 'Quality', icon: <AlertTriangle className="w-5 h-5" /> },
          { id: 'training', label: 'Audits', icon: <Award className="w-5 h-5" /> },
          { id: 'approvals', label: 'Approvals', icon: <ShieldCheck className="w-5 h-5" />, badge: pendingApprovalsCount },
        ];
      case 'Supervisor':
      case 'Maintenance Supervisor':
        return [
          { id: 'dashboard', label: 'Home', icon: <Activity className="w-5 h-5" /> },
          { id: 'approvals', label: 'Approvals', icon: <ShieldCheck className="w-5 h-5" />, badge: pendingApprovalsCount },
          { id: 'machines', label: 'Machines', icon: <Cpu className="w-5 h-5" /> },
          { id: 'training', label: 'Training', icon: <Award className="w-5 h-5" /> },
        ];
      case 'PPC':
        return [
          { id: 'dashboard', label: 'Home', icon: <Activity className="w-5 h-5" /> },
          { id: 'monthly-planning', label: 'Plan', icon: <Calendar className="w-5 h-5" /> },
          { id: 'machine-planning', label: 'Schedule', icon: <Cpu className="w-5 h-5" /> },
          { id: 'inventory', label: 'Stock', icon: <Package className="w-5 h-5" /> },
        ];
      case 'Production Manager':
        return [
          { id: 'dashboard', label: 'Home', icon: <Activity className="w-5 h-5" /> },
          { id: 'training', label: 'Training', icon: <Award className="w-5 h-5" /> },
          { id: 'approvals', label: 'Approvals', icon: <ShieldCheck className="w-5 h-5" />, badge: pendingApprovalsCount },
          { id: 'monthly-analytics', label: 'OEE', icon: <BarChart3 className="w-5 h-5" /> },
        ];
      case 'Management':
        return [
          { id: 'dashboard', label: 'KPIs', icon: <Activity className="w-5 h-5" /> },
          { id: 'monthly-analytics', label: 'OEE Trend', icon: <BarChart3 className="w-5 h-5" /> },
          { id: 'training', label: 'Competency', icon: <Award className="w-5 h-5" /> },
          { id: 'daily-summary', label: 'Closing', icon: <CheckCircle className="w-5 h-5" /> },
        ];
      case 'Admin':
      default:
        return [
          { id: 'dashboard', label: 'Home', icon: <Activity className="w-5 h-5" /> },
          { id: 'training', label: 'Training', icon: <Award className="w-5 h-5" /> },
          { id: 'machines', label: 'Machines', icon: <Cpu className="w-5 h-5" /> },
          { id: 'admin', label: 'Settings', icon: <Menu className="w-5 h-5" /> },
        ];
    }
  };

  const tabs = getTabsForRole();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 shadow-2xl safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Left 2 Tabs */}
        {tabs.slice(0, 2).map((tab) => {
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-btn-${tab.id}`}
              onClick={() => {
                setActiveModule(tab.id);
                triggerHaptic();
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative active:scale-95 transition-all ${
                isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white font-bold text-[9px] rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
              {isActive && <div className="w-4 h-0.5 bg-blue-500 rounded-full mt-0.5" />}
            </button>
          );
        })}

        {/* Center Floating Action Button (FAB) */}
        <div className="px-2 -mt-5">
          <button
            id="fab-quick-action"
            onClick={() => {
              triggerHaptic();
              if (currentUser.role === 'Operator') {
                onOpenQuickEntry();
              } else {
                onOpenOcr();
              }
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 active:scale-90 transition-transform border-2 border-slate-900"
            title={currentUser.role === 'Operator' ? 'Quick Hourly Entry' : 'Scan Physical Sheet with OCR'}
          >
            {currentUser.role === 'Operator' ? (
              <Plus className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <Camera className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* Right 2 Tabs */}
        {tabs.slice(2, 4).map((tab) => {
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-btn-${tab.id}`}
              onClick={() => {
                setActiveModule(tab.id);
                triggerHaptic();
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative active:scale-95 transition-all ${
                isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white font-bold text-[9px] rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
              {isActive && <div className="w-4 h-0.5 bg-blue-500 rounded-full mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
