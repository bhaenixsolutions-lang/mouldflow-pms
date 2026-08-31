import React, { useState } from 'react';
import {
  Factory,
  Clock,
  UserCheck,
  Camera,
  Menu,
  X,
  RotateCcw,
  Sliders,
  ChevronDown,
  Sparkles,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  Activity,
  Package,
  Users,
  Calendar,
  BarChart3,
  ShieldCheck,
  CheckCircle,
  Database,
  Cpu,
  Bell,
  User,
  Zap,
  Award,
  BookOpen,
} from 'lucide-react';
import { useApp, ActiveModule } from '../../context/AppContext';
import { UserRole } from '../../types/schema';

interface HeaderProps {
  onOpenOcr: () => void;
  onOpenRoleModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenOcr, onOpenRoleModal }) => {
  const {
    currentUser,
    activeShift,
    shifts,
    setActiveShift,
    activeModule,
    setActiveModule,
    triggerHaptic,
    reports,
    downtimes,
    trainingAssignments,
  } = useApp();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isShiftDropdownOpen, setIsShiftDropdownOpen] = useState(false);

  const pendingApprovalsCount = reports.filter(
    (r) => r.status === 'Submitted' || r.status === 'Verified'
  ).length;

  const activeBreakdownsCount = downtimes.filter((d) => !d.isResolved).length;

  const overdueTrainingsCount = trainingAssignments.filter(
    (a) => a.status === 'Overdue' || a.status === 'Expired'
  ).length;

  const roleColors: Record<UserRole, string> = {
    Operator: 'bg-blue-600/20 text-blue-300 border-blue-500/40',
    Supervisor: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40',
    'Production Supervisor': 'bg-teal-600/20 text-teal-300 border-teal-500/40',
    PPC: 'bg-purple-600/20 text-purple-300 border-purple-500/40',
    'Production Manager': 'bg-amber-600/20 text-amber-300 border-amber-500/40',
    Management: 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40',
    Admin: 'bg-rose-600/20 text-rose-300 border-rose-500/40',
    'Senior Operator': 'bg-cyan-600/20 text-cyan-300 border-cyan-500/40',
    Trainer: 'bg-amber-600/20 text-amber-300 border-amber-500/40',
    'Quality Supervisor': 'bg-purple-600/20 text-purple-300 border-purple-500/40',
    'Maintenance Supervisor': 'bg-orange-600/20 text-orange-300 border-orange-500/40',
  };

  const navCategories: {
    category: string;
    items: { id: ActiveModule; label: string; icon: React.ReactNode; badge?: number }[];
  }[] = [
    {
      category: 'PRODUCTION',
      items: [
        { id: 'dashboard', label: 'Live Dashboard', icon: <Activity className="w-4 h-4" /> },
        { id: 'hourly-reports', label: 'Hourly Production', icon: <FileSpreadsheet className="w-4 h-4" /> },
        { id: 'machines', label: 'Machine Status', icon: <Cpu className="w-4 h-4" /> },
        { id: 'production-planning', label: 'Production Planning', icon: <Calendar className="w-4 h-4 text-cyan-400" /> },
      ],
    },
    {
      category: 'TRAINING & COMPETENCY',
      items: [
        { id: 'training', label: 'Training & Competency', icon: <Award className="w-4 h-4 text-amber-400" />, badge: overdueTrainingsCount },
      ],
    },
    {
      category: 'SHOPFLOOR',
      items: [
        { id: 'hourly-reports', label: 'Log Hour (1-Tap)', icon: <Zap className="w-4 h-4" /> },
        { id: 'downtime', label: 'Stoppage', icon: <Clock className="w-4 h-4" />, badge: activeBreakdownsCount },
        { id: 'rejections', label: 'Scrap', icon: <AlertTriangle className="w-4 h-4" /> },
        { id: 'hourly-reports', label: 'AI OCR Scanner', icon: <Camera className="w-4 h-4" /> },
        { id: 'ai-recommendations', label: 'AI Advisor', icon: <Sparkles className="w-4 h-4 text-amber-300" /> },
      ],
    },
    {
      category: 'REPORTS',
      items: [
        { id: 'daily-summary', label: 'Shift Report', icon: <CheckCircle className="w-4 h-4" /> },
        { id: 'daily-summary', label: 'Daily Report', icon: <Calendar className="w-4 h-4" /> },
        { id: 'product-machine-analysis', label: 'Machine Report', icon: <Layers className="w-4 h-4" /> },
        { id: 'rejections', label: 'Scrap Report', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'approvals', label: 'Approval Workflow', icon: <ShieldCheck className="w-4 h-4" />, badge: pendingApprovalsCount },
      ],
    },
    {
      category: 'MASTER',
      items: [
        { id: 'machines', label: 'Machines', icon: <Cpu className="w-4 h-4" /> },
        { id: 'departments', label: 'Departments', icon: <Factory className="w-4 h-4" /> },
        { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
        { id: 'staff', label: 'Operators & Supervisors', icon: <Users className="w-4 h-4" /> },
        { id: 'shifts', label: 'Shift Configurations', icon: <Clock className="w-4 h-4" /> },
      ],
    },
    {
      category: 'SETTINGS',
      items: [
        { id: 'admin', label: 'Settings & Config', icon: <RotateCcw className="w-4 h-4" /> },
        { id: 'audit-logs', label: 'Audit Logs', icon: <Database className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#070b14]/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg">
        {/* Main Header Bar */}
        <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Left: Drawer Trigger + Brand Logo */}
          <div className="flex items-center gap-2.5">
            <button
              id="btn-open-menu"
              onClick={() => {
                triggerHaptic();
                setIsDrawerOpen(true);
              }}
              className="p-1.5 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg active:scale-95 transition-transform"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => {
                setActiveModule('dashboard');
                triggerHaptic();
              }}
              className="cursor-pointer flex items-center gap-2 group"
            >
              {/* IM Logo Badge */}
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md font-bold text-sm tracking-wider group-hover:scale-105 transition-transform">
                IM
              </div>
              <div className="leading-tight">
                <div className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                  MouldFlow
                </div>
                <div className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase font-mono">
                  INJECTION PMS
                </div>
              </div>
            </div>
          </div>

          {/* Center: Shift Selector Dropdown */}
          <div className="relative">
            <button
              id="btn-shift-selector"
              onClick={() => {
                setIsShiftDropdownOpen(!isShiftDropdownOpen);
                triggerHaptic();
              }}
              className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white whitespace-nowrap">
                {activeShift.code} ({activeShift.startTime} - {activeShift.endTime})
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isShiftDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Shift Dropdown Menu */}
            {isShiftDropdownOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Active Production Shift
                </div>
                {shifts.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveShift(s);
                      setIsShiftDropdownOpen(false);
                      triggerHaptic();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeShift.id === s.id
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 opacity-80" />
                      <span>{s.name} ({s.code})</span>
                    </div>
                    <span className="font-mono text-[11px] opacity-90">{s.startTime} - {s.endTime}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Controls: Live Status + Notification Bell + User Role Button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Live Indicator Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live</span>
            </div>

            {/* Notification Bell with Badge */}
            <button
              id="btn-notifications"
              onClick={() => {
                if (activeBreakdownsCount > 0) {
                  setActiveModule('downtime');
                } else if (pendingApprovalsCount > 0) {
                  setActiveModule('approvals');
                }
                triggerHaptic();
              }}
              className="relative p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {activeBreakdownsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse shadow-md">
                  {activeBreakdownsCount}
                </span>
              )}
            </button>

            {/* User Role Pill */}
            <button
              id="btn-open-role-switcher"
              onClick={() => {
                triggerHaptic();
                onOpenRoleModal();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border shadow-sm transition-all active:scale-95 ${
                roleColors[currentUser.role] || 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
              title="Switch User Role"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold">{currentUser.role}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer (Side Menu) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-[#0b1328] text-slate-100 h-full shadow-2xl flex flex-col z-10 border-r border-slate-800">
            {/* Drawer Top Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#070b14]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm text-white shadow-md">
                  IM
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">MouldFlow PMS</h3>
                  <p className="text-[10px] text-blue-400 uppercase font-mono tracking-wider">Injection Molding System</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current User Info Box */}
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {currentUser.employeeCode} • <span className="text-blue-400 font-semibold">{currentUser.role}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenRoleModal();
                }}
                className="text-[10px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-md font-semibold"
              >
                Switch
              </button>
            </div>

            {/* Menu Sections List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {navCategories.map((section) => (
                <div key={section.category} className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                    {section.category}
                  </div>
                  {section.items.map((item, idx) => {
                    const isActive = activeModule === item.id;
                    return (
                      <button
                        key={`${section.category}-${item.label}-${idx}`}
                        onClick={() => {
                          if (item.label === 'AI OCR Scanner') {
                            setIsDrawerOpen(false);
                            onOpenOcr();
                          } else {
                            setActiveModule(item.id);
                            setIsDrawerOpen(false);
                          }
                          triggerHaptic();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between bg-[#070b14]">
              <span className="font-mono">Shift: {activeShift.code}</span>
              <span className="text-emerald-400 flex items-center gap-1.5 font-mono text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Synced
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
