import React, { useState, useMemo, useRef } from 'react';
import {
  Activity,
  Cpu,
  TrendingUp,
  AlertTriangle,
  Clock,
  Download,
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronRight,
  Zap,
  Camera,
  Layers,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Check,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
  FileSpreadsheet,
  Upload,
  Grid,
  Tv,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MachineDetailModal } from '../machines/MachineDetailModal';
import { computeMachinesLiveMetrics, MachineLiveMetric } from '../../utils/monitoringCalculations';
import { IndustrialMachineTile, MachineTelemetrySpec } from './IndustrialMachineTile';
import { TVMatrixBoard } from './TVMatrixBoard';

interface MobileDashboardProps {
  onOpenQuickEntry: () => void;
  onOpenOcr: () => void;
  onOpenDowntime: () => void;
  onOpenRejection: () => void;
}

// Comprehensive telemetry specs for all factory machines matching industrial injection moulding plant data
const MACHINE_TELEMETRY_SPECS: Record<string, MachineTelemetrySpec> = {
  // Moulding Department (IMM-01 to IMM-12)
  'IMM-01': { target: 750, actual: 718, achPct: '95.7%', rejects: 7, rejPct: '0.97%', oeePct: '94.2%', cycleTime: 45.2, downtimeMin: 12, stoppages: 1, lastUpdated: '08:32:45' },
  'IMM-02': { target: 750, actual: 702, achPct: '93.6%', rejects: 6, rejPct: '0.85%', oeePct: '92.8%', cycleTime: 46.0, downtimeMin: 18, stoppages: 2, lastUpdated: '08:32:41' },
  'IMM-03': { target: 700, actual: 665, achPct: '95.0%', rejects: 5, rejPct: '0.75%', oeePct: '93.1%', cycleTime: 43.8, downtimeMin: 10, stoppages: 1, lastUpdated: '08:32:39' },
  'IMM-04': { target: 800, actual: 0, achPct: '0.0%', rejects: 0, rejPct: '0.00%', oeePct: '0.0%', cycleTime: 0.0, downtimeMin: 0, stoppages: 0, lastUpdated: '08:31:12' },
  'IMM-05': { target: 900, actual: 0, achPct: '0.0%', rejects: 0, rejPct: '0.00%', oeePct: '0.0%', cycleTime: 0.0, downtimeMin: 65, stoppages: 1, lastUpdated: '08:28:05' },
  'IMM-06': { target: 650, actual: 612, achPct: '94.2%', rejects: 4, rejPct: '0.65%', oeePct: '92.5%', cycleTime: 42.1, downtimeMin: 8, stoppages: 0, lastUpdated: '08:32:48' },
  'IMM-07': { target: 850, actual: 808, achPct: '95.1%', rejects: 9, rejPct: '1.11%', oeePct: '93.4%', cycleTime: 45.6, downtimeMin: 14, stoppages: 1, lastUpdated: '08:32:46' },
  'IMM-08': { target: 600, actual: 572, achPct: '95.3%', rejects: 3, rejPct: '0.52%', oeePct: '94.0%', cycleTime: 41.3, downtimeMin: 6, stoppages: 0, lastUpdated: '08:32:47' },
  'IMM-09': { target: 750, actual: 0, achPct: '0.0%', rejects: 0, rejPct: '0.00%', oeePct: '0.0%', cycleTime: 0.0, downtimeMin: 22, stoppages: 1, lastUpdated: '08:30:10' },
  'IMM-10': { target: 700, actual: 668, achPct: '95.4%', rejects: 6, rejPct: '0.90%', oeePct: '94.1%', cycleTime: 44.7, downtimeMin: 9, stoppages: 0, lastUpdated: '08:32:50' },
  'IMM-11': { target: 630, actual: 598, achPct: '94.9%', rejects: 5, rejPct: '0.83%', oeePct: '93.3%', cycleTime: 42.9, downtimeMin: 7, stoppages: 0, lastUpdated: '08:32:44' },
  'IMM-12': { target: 900, actual: 0, achPct: '0.0%', rejects: 0, rejPct: '0.00%', oeePct: '0.0%', cycleTime: 0.0, downtimeMin: 0, stoppages: 0, lastUpdated: '08:31:05' },

  // Insert Assembly Department (ASM-01 to ASM-03)
  'ASM-01': { target: 340, actual: 328, achPct: '96.5%', rejects: 3, rejPct: '0.91%', oeePct: '95.2%', cycleTime: 10.5, downtimeMin: 5, stoppages: 0, lastUpdated: '08:32:52' },
  'ASM-02': { target: 300, actual: 285, achPct: '95.0%', rejects: 2, rejPct: '0.70%', oeePct: '94.1%', cycleTime: 12.0, downtimeMin: 9, stoppages: 1, lastUpdated: '08:32:49' },
  'ASM-03': { target: 400, actual: 0, achPct: '0.0%', rejects: 0, rejPct: '0.00%', oeePct: '0.0%', cycleTime: 0.0, downtimeMin: 15, stoppages: 1, lastUpdated: '08:30:25' },

  // Deflashing Department (DFL-01 to DFL-02)
  'DFL-01': { target: 1200, actual: 1150, achPct: '95.8%', rejects: 8, rejPct: '0.69%', oeePct: '94.8%', cycleTime: 300.0, downtimeMin: 10, stoppages: 0, lastUpdated: '08:32:51' },
  'DFL-02': { target: 500, actual: 482, achPct: '96.4%', rejects: 4, rejPct: '0.82%', oeePct: '95.6%', cycleTime: 60.0, downtimeMin: 6, stoppages: 0, lastUpdated: '08:32:48' },

  // Packing Department (PCK-01 to PCK-02)
  'PCK-01': { target: 700, actual: 675, achPct: '96.4%', rejects: 2, rejPct: '0.30%', oeePct: '96.1%', cycleTime: 5.2, downtimeMin: 4, stoppages: 0, lastUpdated: '08:32:50' },
  'PCK-02': { target: 450, actual: 430, achPct: '95.6%', rejects: 1, rejPct: '0.23%', oeePct: '95.0%', cycleTime: 8.0, downtimeMin: 8, stoppages: 0, lastUpdated: '08:32:47' },

  // BDV Testing Department (BDV-01 to BDV-02)
  'BDV-01': { target: 420, actual: 405, achPct: '96.4%', rejects: 2, rejPct: '0.49%', oeePct: '95.8%', cycleTime: 8.2, downtimeMin: 5, stoppages: 0, lastUpdated: '08:32:52' },
  'BDV-02': { target: 380, actual: 362, achPct: '95.3%', rejects: 3, rejPct: '0.82%', oeePct: '94.5%', cycleTime: 9.0, downtimeMin: 7, stoppages: 0, lastUpdated: '08:32:46' },

  // Custom / Toolroom (TLR-01)
  'TLR-01': { target: 50, actual: 48, achPct: '96.0%', rejects: 0, rejPct: '0.00%', oeePct: '95.0%', cycleTime: 120.0, downtimeMin: 0, stoppages: 0, lastUpdated: '08:32:30' },
};

export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  onOpenQuickEntry,
  onOpenOcr,
  onOpenDowntime,
  onOpenRejection,
}) => {
  const {
    machines,
    departments,
    products,
    users,
    reports,
    activeShift,
    triggerHaptic,
  } = useApp();

  const selectedDate = '2026-08-25';

  // Local state for department tab selection, search, view mode, and modal
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'tiles' | 'tv-matrix' | 'table'>('tiles');
  const [selectedMetricForModal, setSelectedMetricForModal] = useState<MachineLiveMetric | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
  const [isExportSuccess, setIsExportSuccess] = useState(false);

  // Hidden input refs for camera / gallery
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Visible column configuration for table view
  const [visibleColumns, setVisibleColumns] = useState({
    machineName: true,
    status: true,
    partName: true,
    target: true,
    actual: true,
    achPct: true,
    rejects: true,
    rejectPct: true,
    oeePct: true,
    cycleTime: true,
    downtime: true,
    stoppage: true,
    lastUpdated: true,
  });

  // Calculate live machine metrics for full system
  const liveMetrics = useMemo(() => {
    return computeMachinesLiveMetrics(
      machines,
      products,
      users,
      departments,
      reports,
      activeShift,
      selectedDate,
      'all'
    );
  }, [machines, products, users, departments, reports, activeShift, selectedDate]);

  // Department Tabs definition matching specification
  const departmentTabs = [
    { id: 'all', label: 'All Departments', deptId: 'all' },
    { id: 'moulding', label: 'Moulding', deptId: 'dept-moulding' },
    { id: 'insert-assembly', label: 'Insert Assembly', deptId: 'dept-insert-assembly' },
    { id: 'deflashing', label: 'Deflashing', deptId: 'dept-deflashing' },
    { id: 'packing', label: 'Packing', deptId: 'dept-packing' },
    { id: 'bdv', label: 'BDV', deptId: 'dept-bdv' },
    { id: 'custom', label: 'Custom', deptId: 'dept-toolroom' },
  ];

  // Helper to count machines per department
  const getDeptMachineCount = (deptId: string) => {
    if (deptId === 'all') return machines.length;
    if (deptId === 'dept-toolroom') {
      return machines.filter((m) => m.departmentId === 'dept-toolroom' || m.departmentId === 'dept-custom').length;
    }
    return machines.filter((m) => m.departmentId === deptId).length;
  };

  // Filter machines based on selected department tab and search query
  const filteredMachines = useMemo(() => {
    return machines.filter((m) => {
      // Department Filter
      if (selectedDeptFilter !== 'all') {
        if (selectedDeptFilter === 'moulding' && m.departmentId !== 'dept-moulding') return false;
        if (selectedDeptFilter === 'insert-assembly' && m.departmentId !== 'dept-insert-assembly') return false;
        if (selectedDeptFilter === 'deflashing' && m.departmentId !== 'dept-deflashing') return false;
        if (selectedDeptFilter === 'packing' && m.departmentId !== 'dept-packing') return false;
        if (selectedDeptFilter === 'bdv' && m.departmentId !== 'dept-bdv') return false;
        if (selectedDeptFilter === 'custom' && m.departmentId !== 'dept-toolroom' && m.departmentId !== 'dept-custom') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const prod = products.find((p) => p.id === m.currentProductId);
        const matchCode = m.code.toLowerCase().includes(q);
        const matchName = m.name.toLowerCase().includes(q);
        const matchPart = prod?.name.toLowerCase().includes(q) || prod?.sku.toLowerCase().includes(q);
        const matchStatus = m.status.toLowerCase().includes(q);
        return matchCode || matchName || matchPart || matchStatus;
      }

      return true;
    });
  }, [machines, products, selectedDeptFilter, searchQuery]);

  // Open modal for a specific machine
  const handleOpenMachineDetail = (machineId: string) => {
    triggerHaptic();
    const metric = liveMetrics.find((m) => m.machine.id === machineId);
    if (metric) {
      setSelectedMetricForModal(metric);
      setIsDetailModalOpen(true);
    } else {
      // Fallback metric synthesis if needed
      const mach = machines.find((m) => m.id === machineId);
      if (mach) {
        const prod = products.find((p) => p.id === mach.currentProductId);
        const dept = departments.find((d) => d.id === mach.departmentId);
        const spec = MACHINE_TELEMETRY_SPECS[mach.code] || {
          target: mach.targetPerHour,
          actual: mach.status === 'Running' ? Math.round(mach.targetPerHour * 0.95) : 0,
          achPct: mach.status === 'Running' ? '95.0%' : '0.0%',
          rejects: 0,
          rejPct: '0.00%',
          oeePct: mach.status === 'Running' ? '93.5%' : '0.0%',
          cycleTime: mach.actualCycleTimeSec || mach.standardCycleTimeSec || 0,
          downtimeMin: mach.status === 'Breakdown' ? 65 : 0,
          stoppages: mach.status === 'Breakdown' ? 1 : 0,
          lastUpdated: '08:32:45',
        };

        const fallback: MachineLiveMetric = {
          machine: mach,
          product: prod,
          department: dept,
          shift: activeShift,
          currentHour: 1,
          targetQty: spec.target,
          actualQty: spec.actual,
          achievementPct: parseFloat(spec.achPct.replace('%', '')) || 0,
          rejectionQty: spec.rejects,
          rejectionPct: parseFloat(spec.rejPct.replace('%', '')) || 0,
          downtimeMinutes: spec.downtimeMin,
          availabilityPct: mach.status === 'Running' ? 96 : 0,
          performancePct: mach.status === 'Running' ? 95 : 0,
          qualityPct: 99,
          oeePct: parseFloat(spec.oeePct.replace('%', '')) || 0,
          isReportMissing: false,
          liveColor: mach.status === 'Running' ? 'green' : mach.status === 'Breakdown' ? 'red' : 'orange',
          statusLabel: mach.status,
          statusReason: `${mach.status} status on ${mach.code}`,
          hourlyTrend: [],
        };
        setSelectedMetricForModal(fallback);
        setIsDetailModalOpen(true);
      }
    }
  };

  // Find breakdown machine for alert banner (IMM-05)
  const breakdownMachine = machines.find((m) => m.code === 'IMM-05' || m.status === 'Breakdown');

  // Export handler
  const handleExportData = () => {
    triggerHaptic();
    setIsExportSuccess(true);
    setTimeout(() => setIsExportSuccess(false), 3000);
  };

  // Calculate high-level summary KPIs
  const totalMachinesCount = filteredMachines.length;
  const onlineMachinesCount = filteredMachines.filter((m) => m.status === 'Running' || m.status === 'Setup').length;
  const offlineMachinesCount = filteredMachines.filter((m) => m.status === 'Breakdown' || m.status === 'Idle' || m.status === 'Maintenance').length;

  // Helper for status badge styling (for table view)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Running':
        return 'bg-emerald-950/80 border-emerald-700 text-emerald-400';
      case 'Idle':
        return 'bg-amber-950/80 border-amber-700 text-amber-400';
      case 'Breakdown':
        return 'bg-rose-950/90 border-rose-700 text-rose-300 animate-pulse';
      case 'Setup':
        return 'bg-blue-950/80 border-blue-700 text-blue-400';
      case 'Maintenance':
        return 'bg-purple-950/80 border-purple-700 text-purple-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-400';
    }
  };

  return (
    <div className="space-y-3.5 pb-24 p-2.5 sm:p-4 max-w-[1700px] mx-auto">
      {/* 1. INDUSTRIAL PRODUCTION MONITORING BOARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#080d1a] border border-slate-800/90 rounded-2xl p-3.5 sm:p-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-600/30">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-wide uppercase font-mono">
                Live Production Monitoring Board
              </h1>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block shadow-[0_0_8px_#34d399]" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time machine status &amp; operational telemetry across shopfloor
            </p>
          </div>
        </div>

        {/* View Mode Switcher + Export Button */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-[#0d1527] border border-slate-800 p-1 rounded-xl">
            <button
              id="view-mode-tiles"
              onClick={() => {
                setViewMode('tiles');
                triggerHaptic();
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'tiles'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Industrial Machine Tiles"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tiles</span>
            </button>
            <button
              id="view-mode-tv"
              onClick={() => {
                setViewMode('tv-matrix');
                triggerHaptic();
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'tv-matrix'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Factory TV Screen Matrix"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden md:inline">TV Matrix</span>
            </button>
            <button
              id="view-mode-table"
              onClick={() => {
                setViewMode('table');
                triggerHaptic();
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Data Table View"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Table</span>
            </button>
          </div>

          {/* Export Button */}
          <button
            id="btn-export-overview"
            onClick={handleExportData}
            className="flex items-center gap-1.5 bg-[#0f172a] hover:bg-slate-800 border border-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            {isExportSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-emerald-300">Exported</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-300" />
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. HORIZONTALLY SCROLLABLE DEPARTMENT SELECTOR */}
      <div className="bg-[#080d1a]/95 border border-slate-800/90 rounded-2xl p-2 sm:p-2.5 shadow-lg">
        <div className="overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-2 min-w-max">
            {departmentTabs.map((tab) => {
              const isActive = selectedDeptFilter === tab.id;
              const count = getDeptMachineCount(tab.deptId);
              return (
                <button
                  key={tab.id}
                  id={`dept-tab-${tab.id}`}
                  onClick={() => {
                    setSelectedDeptFilter(tab.id);
                    triggerHaptic();
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400'
                      : 'bg-[#0e1628] text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. COMPACT SUMMARY KPIS (Strictly 4 Compact Widgets, No Large Total Card) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* KPI 1: TOTAL MACHINES (Blue) */}
        <div className="bg-[#090f1e] border border-blue-900/40 rounded-xl p-3 sm:p-3.5 shadow-md flex flex-col justify-between hover:border-blue-700/60 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-blue-400 uppercase font-mono">
              TOTAL MACHINES
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-1 sm:my-1.5">
            <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
              {totalMachinesCount}
            </div>
          </div>
          <div className="text-[11px] font-medium flex items-center gap-2.5 font-mono">
            <span className="text-emerald-400">Online: {onlineMachinesCount}</span>
            <span className="text-slate-500">•</span>
            <span className="text-rose-400">Offline: {offlineMachinesCount}</span>
          </div>
        </div>

        {/* KPI 2: PLANT OEE (Purple) */}
        <div className="bg-[#120d24] border border-purple-900/40 rounded-xl p-3 sm:p-3.5 shadow-md flex flex-col justify-between hover:border-purple-700/60 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-purple-400 uppercase font-mono">
              PLANT OEE
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-1 sm:my-1.5">
            <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
              93.5%
            </div>
          </div>
          <div className="text-[11px] text-purple-300/80 font-medium font-mono">
            Target: &gt; 90% (World Class)
          </div>
        </div>

        {/* KPI 3: SCRAP RATE (Amber) */}
        <div className="bg-[#1c1209] border border-amber-900/40 rounded-xl p-3 sm:p-3.5 shadow-md flex flex-col justify-between hover:border-amber-700/60 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-amber-400 uppercase font-mono">
              SCRAP RATE
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-1 sm:my-1.5">
            <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
              1.24%
            </div>
          </div>
          <div className="text-[11px] text-amber-300/80 font-medium font-mono">
            108 pcs / Under 2% Max
          </div>
        </div>

        {/* KPI 4: TOTAL DOWNTIME (Cyan) */}
        <div className="bg-[#091724] border border-cyan-900/40 rounded-xl p-3 sm:p-3.5 shadow-md flex flex-col justify-between hover:border-cyan-700/60 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-cyan-400 uppercase font-mono">
              TOTAL DOWNTIME
            </span>
            <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-1 sm:my-1.5">
            <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
              2h 47m
            </div>
          </div>
          <div className="text-[11px] text-cyan-300/80 font-medium font-mono">
            18 events / 94.8% Avail
          </div>
        </div>
      </div>

      {/* 4. STOPPAGE ALERT BANNER (IMM-05 Breakdown Alert) */}
      {breakdownMachine && (
        <div
          id="banner-stoppage-alert"
          onClick={() => handleOpenMachineDetail(breakdownMachine.id)}
          className="p-3 sm:p-3.5 bg-rose-950/40 border border-rose-600/80 hover:bg-rose-950/60 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all shadow-lg group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-rose-200 flex items-center gap-2">
                <span className="font-mono bg-rose-900/60 px-1.5 py-0.5 rounded text-[10px] border border-rose-700">
                  ⚠ STOPPAGE ALERT
                </span>
                <span>IMM-05 — Arburg Allrounder 650T Gold</span>
              </div>
              <div className="text-[11px] text-rose-300/90 mt-0.5">
                Machine status: <strong className="font-mono text-rose-200">BREAKDOWN</strong>. Tap to view diagnosis or log repair action.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold shrink-0">
            <span className="hidden sm:inline">View Details</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      )}

      {/* 5. QUICK SHOPFLOOR ACTIONS (Touch-Friendly 4-Button Grid) */}
      <div className="bg-[#080d1a]/95 border border-slate-800/90 rounded-2xl p-3 sm:p-3.5 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
              QUICK SHOPFLOOR ACTIONS
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">1-Tap Operators Flow</span>
        </div>

        {/* Hidden Camera-Only Input */}
        <input
          ref={cameraInputRef}
          id="dashboard-camera-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) onOpenOcr();
          }}
          className="hidden"
        />

        {/* Hidden Gallery-Only Input */}
        <input
          ref={galleryInputRef}
          id="dashboard-gallery-input"
          type="file"
          accept="image/*,image/jpeg,image/png,image/webp,application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) onOpenOcr();
          }}
          className="hidden"
        />

        {/* 2 x 2 Action Buttons Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5">
          {/* Button 1: TAKE REPORT PHOTO */}
          <button
            id="btn-quick-take-photo"
            onClick={() => {
              triggerHaptic();
              cameraInputRef.current?.click();
            }}
            className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-left shadow-lg shadow-blue-600/25 border border-blue-400/30 active:scale-[0.98] transition-all group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Take Photo
              </div>
              <div className="text-[10px] text-blue-200 font-normal mt-0.5">
                Camera Snap
              </div>
            </div>
          </button>

          {/* Button 2: UPLOAD REPORT */}
          <button
            id="btn-quick-upload-report"
            onClick={() => {
              triggerHaptic();
              galleryInputRef.current?.click();
            }}
            className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-[#0e1628] hover:bg-slate-800 text-white font-bold text-left shadow-md border border-slate-700/80 active:scale-[0.98] transition-all group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 group-hover:scale-105 transition-transform">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-xs sm:text-sm font-bold text-slate-100 tracking-tight">
                Upload Log
              </div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                Gallery / PDF
              </div>
            </div>
          </button>

          {/* Button 3: LOG HOUR */}
          <button
            id="btn-quick-log-hour"
            onClick={() => {
              triggerHaptic();
              onOpenQuickEntry();
            }}
            className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-[#0e1628] hover:bg-slate-800 text-white font-bold text-left shadow-md border border-slate-700/80 active:scale-[0.98] transition-all group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-xs sm:text-sm font-bold text-slate-100 tracking-tight">
                Log Hour
              </div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                Hourly Entry
              </div>
            </div>
          </button>

          {/* Button 4: AI OCR */}
          <button
            id="btn-quick-ai-ocr"
            onClick={() => {
              triggerHaptic();
              onOpenOcr();
            }}
            className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-[#0e1628] hover:bg-slate-800 text-white font-bold text-left shadow-md border border-slate-700/80 active:scale-[0.98] transition-all group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-xs sm:text-sm font-bold text-slate-100 tracking-tight">
                AI Vision
              </div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                OCR Scanner
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 6. MAIN PRODUCTION MONITORING SECTION & SEARCH TOOLBAR */}
      <div className="bg-[#080d1a]/95 border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden space-y-3 p-3 sm:p-4">
        {/* Section Header with Search & Live Telemetry Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide font-mono">
                {departmentTabs.find((d) => d.id === selectedDeptFilter)?.label.toUpperCase()} MACHINES
              </h2>
              <span className="text-xs font-mono font-bold bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                {filteredMachines.length} units
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status, part targets, OEE &amp; rejection breakdown
            </p>
          </div>

          {/* Search Input & Action Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Machine / Part..."
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-sans"
              />
            </div>

            {/* Refresh Button */}
            <button
              id="btn-refresh-telemetry"
              onClick={() => triggerHaptic()}
              className="p-2 bg-[#0f172a] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors"
              title="Refresh telemetry"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 7. MACHINE MONITORING GRID — 3 DISPLAY MODES */}
        {filteredMachines.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Cpu className="w-8 h-8 mx-auto text-slate-600" />
            <div className="text-sm font-semibold">No machines found</div>
            <div className="text-xs text-slate-500">
              Try selecting "All Departments" or clearing your search query.
            </div>
          </div>
        ) : viewMode === 'tiles' ? (
          /* PRIMARY VIEW: RESPONSIVE INDUSTRIAL MACHINE TILE GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-3.5">
            {filteredMachines.map((m) => {
              const prod = products.find((p) => p.id === m.currentProductId);
              const spec = MACHINE_TELEMETRY_SPECS[m.code] || {
                target: m.targetPerHour,
                actual: m.status === 'Running' ? Math.round(m.targetPerHour * 0.95) : 0,
                achPct: m.status === 'Running' ? '95.0%' : '0.0%',
                rejects: 0,
                rejPct: '0.00%',
                oeePct: m.status === 'Running' ? '93.5%' : '0.0%',
                cycleTime: m.actualCycleTimeSec || m.standardCycleTimeSec || 0,
                downtimeMin: m.status === 'Breakdown' ? 65 : 0,
                stoppages: m.status === 'Breakdown' ? 1 : 0,
                lastUpdated: '08:32:45',
              };

              return (
                <IndustrialMachineTile
                  key={m.id}
                  machine={m}
                  product={prod}
                  spec={spec}
                  onClick={() => handleOpenMachineDetail(m.id)}
                />
              );
            })}
          </div>
        ) : viewMode === 'tv-matrix' ? (
          /* SECONDARY VIEW: FACTORY TV MATRIX BOARD (Ref Image 1) */
          <TVMatrixBoard
            machines={filteredMachines}
            products={products}
            specs={MACHINE_TELEMETRY_SPECS}
            onSelectMachine={handleOpenMachineDetail}
          />
        ) : (
          /* TERTIARY VIEW: DATA TABLE VIEW */
          <div className="overflow-x-auto no-scrollbar border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#070b14] border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider whitespace-nowrap">
                  <th className="sticky left-0 bg-[#070b14] z-20 px-3.5 py-3 border-r border-slate-800">
                    Machine No.
                  </th>
                  <th className="px-3.5 py-3">Machine Name</th>
                  <th className="px-3.5 py-3">Status</th>
                  <th className="px-3.5 py-3">Part Name</th>
                  <th className="px-3.5 py-3 text-right">Target</th>
                  <th className="px-3.5 py-3 text-right">Actual</th>
                  <th className="px-3.5 py-3 text-right">Ach %</th>
                  <th className="px-3.5 py-3 text-right">Rejects</th>
                  <th className="px-3.5 py-3 text-right">OEE %</th>
                  <th className="px-3.5 py-3 text-right">Cycle</th>
                  <th className="px-3.5 py-3 text-right">Downtime</th>
                  <th className="px-3.5 py-3 text-center">Stops</th>
                  <th className="px-3.5 py-3 text-right">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredMachines.map((m) => {
                  const prod = products.find((p) => p.id === m.currentProductId);
                  const spec = MACHINE_TELEMETRY_SPECS[m.code] || {
                    target: m.targetPerHour,
                    actual: m.status === 'Running' ? Math.round(m.targetPerHour * 0.95) : 0,
                    achPct: m.status === 'Running' ? '95.0%' : '0.0%',
                    rejects: 0,
                    rejPct: '0.00%',
                    oeePct: m.status === 'Running' ? '93.5%' : '0.0%',
                    cycleTime: m.actualCycleTimeSec || m.standardCycleTimeSec || 0,
                    downtimeMin: m.status === 'Breakdown' ? 65 : 0,
                    stoppages: m.status === 'Breakdown' ? 1 : 0,
                    lastUpdated: '08:32:45',
                  };

                  return (
                    <tr
                      key={m.id}
                      id={`machine-row-${m.code}`}
                      onClick={() => handleOpenMachineDetail(m.id)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors active:bg-slate-800 group"
                    >
                      <td className="sticky left-0 bg-[#090f1d] group-hover:bg-[#121c38] z-10 px-3.5 py-3 font-mono font-bold text-white border-r border-slate-800 whitespace-nowrap shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <span>{m.code}</span>
                          <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-slate-300 whitespace-nowrap font-medium">
                        {m.name}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(m.status)}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-slate-200 whitespace-nowrap font-medium">
                        {prod ? prod.name : 'Component'}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono text-slate-300 whitespace-nowrap">
                        {spec.target}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono font-bold text-white whitespace-nowrap">
                        {spec.actual}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono font-semibold whitespace-nowrap">
                        <span className={parseFloat(spec.achPct) >= 90 ? 'text-emerald-400' : parseFloat(spec.achPct) > 0 ? 'text-amber-400' : 'text-slate-500'}>
                          {spec.achPct}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono text-rose-300 whitespace-nowrap">
                        {spec.rejects}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono font-bold text-blue-400 whitespace-nowrap">
                        {spec.oeePct}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono text-slate-300 whitespace-nowrap">
                        {spec.cycleTime > 0 ? `${spec.cycleTime.toFixed(1)}s` : '-'}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono text-amber-400 whitespace-nowrap">
                        {spec.downtimeMin > 0 ? `${spec.downtimeMin}m` : '-'}
                      </td>
                      <td className="px-3.5 py-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-mono ${spec.stoppages > 0 ? 'bg-amber-950 text-amber-300 border border-amber-700' : 'text-slate-500'}`}>
                          {spec.stoppages}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {spec.lastUpdated}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info line */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-semibold font-mono">{filteredMachines.length}</span> machines in <span className="text-blue-400 font-semibold">{departmentTabs.find((d) => d.id === selectedDeptFilter)?.label}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Running ({filteredMachines.filter((m) => m.status === 'Running').length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Idle/Setup ({filteredMachines.filter((m) => m.status === 'Idle' || m.status === 'Setup').length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Breakdown ({filteredMachines.filter((m) => m.status === 'Breakdown').length})
            </span>
          </div>
        </div>
      </div>

      {/* Machine Detail Modal */}
      <MachineDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        metric={selectedMetricForModal}
        onOpenHourlyEntry={onOpenQuickEntry}
        onOpenLogRejection={onOpenRejection}
        onOpenLogDowntime={onOpenDowntime}
      />
    </div>
  );
};
