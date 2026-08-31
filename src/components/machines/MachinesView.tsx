import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Plus,
  Play,
  Pause,
  AlertOctagon,
  Wrench,
  RotateCcw,
  Sliders,
  ChevronRight,
  Filter,
  Package,
  User,
  ShieldCheck,
  Clock,
  Flame,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MachineStatus } from '../../types/schema';
import {
  computeMachinesLiveMetrics,
  MachineLiveMetric,
  MachineLiveColor,
} from '../../utils/monitoringCalculations';
import { MachineDetailModal } from './MachineDetailModal';

interface MachinesViewProps {
  onOpenHourlyEntry?: (reportId?: string, hourIndex?: number) => void;
  onOpenLogRejection?: () => void;
  onOpenLogDowntime?: () => void;
}

export const MachinesView: React.FC<MachinesViewProps> = ({
  onOpenHourlyEntry,
  onOpenLogRejection,
  onOpenLogDowntime,
}) => {
  const {
    machines,
    departments,
    products,
    users,
    reports,
    activeShift,
    selectedDepartmentId,
    updateMachineStatus,
    triggerHaptic,
  } = useApp();

  const [filterColor, setFilterColor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<MachineLiveMetric | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Compute live real-time metrics for every machine
  const machineMetrics = useMemo(() => {
    return computeMachinesLiveMetrics(
      machines,
      products,
      users,
      departments,
      reports,
      activeShift,
      '2026-08-25',
      selectedDepartmentId
    );
  }, [machines, products, users, departments, reports, activeShift, selectedDepartmentId]);

  // Filter machines based on color and search
  const filteredMetrics = useMemo(() => {
    return machineMetrics.filter((item) => {
      const matchesColor = filterColor === 'all' || item.liveColor === filterColor;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        item.machine.code.toLowerCase().includes(q) ||
        item.machine.name.toLowerCase().includes(q) ||
        (item.product?.sku && item.product.sku.toLowerCase().includes(q)) ||
        (item.operator?.name && item.operator.name.toLowerCase().includes(q));

      return matchesColor && matchesSearch;
    });
  }, [machineMetrics, filterColor, searchQuery]);

  // Color summary counts
  const colorCounts = useMemo(() => {
    return {
      all: machineMetrics.length,
      green: machineMetrics.filter((m) => m.liveColor === 'green').length,
      orange: machineMetrics.filter((m) => m.liveColor === 'orange').length,
      red: machineMetrics.filter((m) => m.liveColor === 'red').length,
      grey: machineMetrics.filter((m) => m.liveColor === 'grey').length,
    };
  }, [machineMetrics]);

  const handleCardClick = (item: MachineLiveMetric) => {
    triggerHaptic();
    setSelectedMetric(item);
    setIsDetailModalOpen(true);
  };

  const colorClasses: Record<
    MachineLiveColor,
    {
      cardBorder: string;
      cardBg: string;
      badgeBg: string;
      badgeText: string;
      dot: string;
      tagBg: string;
    }
  > = {
    green: {
      cardBorder: 'border-emerald-500/40 hover:border-emerald-400',
      cardBg: 'bg-gradient-to-b from-emerald-950/20 via-slate-900 to-slate-900',
      badgeBg: 'bg-emerald-950/80 border-emerald-700',
      badgeText: 'text-emerald-300',
      dot: 'bg-emerald-400',
      tagBg: 'bg-emerald-950/60 text-emerald-300',
    },
    orange: {
      cardBorder: 'border-amber-500/40 hover:border-amber-400',
      cardBg: 'bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-900',
      badgeBg: 'bg-amber-950/80 border-amber-700',
      badgeText: 'text-amber-300',
      dot: 'bg-amber-400',
      tagBg: 'bg-amber-950/60 text-amber-300',
    },
    red: {
      cardBorder: 'border-rose-500/50 hover:border-rose-400',
      cardBg: 'bg-gradient-to-b from-rose-950/30 via-slate-900 to-slate-900',
      badgeBg: 'bg-rose-950/90 border-rose-700',
      badgeText: 'text-rose-300',
      dot: 'bg-rose-500 animate-ping',
      tagBg: 'bg-rose-950/60 text-rose-300',
    },
    grey: {
      cardBorder: 'border-slate-800 hover:border-slate-700',
      cardBg: 'bg-slate-900',
      badgeBg: 'bg-slate-800 border-slate-700',
      badgeText: 'text-slate-400',
      dot: 'bg-slate-500',
      tagBg: 'bg-slate-800/80 text-slate-400',
    },
  };

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* 1. Header & Live Telemetry Fleet Stats */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <Cpu className="w-5 h-5 text-blue-400" />
            Machine Live Monitoring
          </h1>
          <p className="text-xs text-slate-400">
            Real-time station status, OEE and shift compliance
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-200">
            {activeShift.code} Active
          </span>
        </div>
      </div>

      {/* 2. Color Status Legend & Quick Filter Pills */}
      <div className="grid grid-cols-5 gap-1.5 text-xs">
        <button
          onClick={() => {
            setFilterColor('all');
            triggerHaptic();
          }}
          className={`py-1.5 px-2 rounded-xl font-bold flex flex-col items-center justify-center border transition-all ${
            filterColor === 'all'
              ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <span className="text-[10px] text-slate-400 uppercase">All</span>
          <span className="font-mono text-xs">{colorCounts.all}</span>
        </button>

        <button
          onClick={() => {
            setFilterColor('green');
            triggerHaptic();
          }}
          className={`py-1.5 px-2 rounded-xl font-bold flex flex-col items-center justify-center border transition-all ${
            filterColor === 'green'
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
              : 'bg-emerald-950/30 border-emerald-900/60 text-emerald-400 hover:bg-emerald-950/50'
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] uppercase">Normal</span>
          </div>
          <span className="font-mono text-xs">{colorCounts.green}</span>
        </button>

        <button
          onClick={() => {
            setFilterColor('orange');
            triggerHaptic();
          }}
          className={`py-1.5 px-2 rounded-xl font-bold flex flex-col items-center justify-center border transition-all ${
            filterColor === 'orange'
              ? 'bg-amber-600 border-amber-500 text-white shadow-lg'
              : 'bg-amber-950/30 border-amber-900/60 text-amber-400 hover:bg-amber-950/50'
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[10px] uppercase">Review</span>
          </div>
          <span className="font-mono text-xs">{colorCounts.orange}</span>
        </button>

        <button
          onClick={() => {
            setFilterColor('red');
            triggerHaptic();
          }}
          className={`py-1.5 px-2 rounded-xl font-bold flex flex-col items-center justify-center border transition-all ${
            filterColor === 'red'
              ? 'bg-rose-600 border-rose-500 text-white shadow-lg'
              : 'bg-rose-950/40 border-rose-900/80 text-rose-400 hover:bg-rose-950/60'
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[10px] uppercase">Critical</span>
          </div>
          <span className="font-mono text-xs">{colorCounts.red}</span>
        </button>

        <button
          onClick={() => {
            setFilterColor('grey');
            triggerHaptic();
          }}
          className={`py-1.5 px-2 rounded-xl font-bold flex flex-col items-center justify-center border transition-all ${
            filterColor === 'grey'
              ? 'bg-slate-700 border-slate-600 text-white shadow-lg'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span className="text-[10px] uppercase">Offline</span>
          </div>
          <span className="font-mono text-xs">{colorCounts.grey}</span>
        </button>
      </div>

      {/* 3. Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by machine (IMM-01), product SKU, or operator..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* 4. Machine Cards List */}
      <div className="space-y-3.5">
        {filteredMetrics.map((item) => {
          const cfg = colorClasses[item.liveColor];
          const isMissing = item.isReportMissing;

          return (
            <div
              key={item.machine.id}
              onClick={() => handleCardClick(item)}
              className={`p-4 rounded-2xl border ${cfg.cardBorder} ${cfg.cardBg} space-y-3 shadow-xl transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden`}
            >
              {/* TOP HEADER ROW: Machine Number, Model, Status Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    <span className="font-black text-sm text-white font-mono tracking-wide">
                      {item.machine.code}
                    </span>
                    <span className="text-xs text-slate-200 font-semibold truncate max-w-[150px] sm:max-w-xs">
                      {item.machine.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>{item.department?.name || 'Moulding'}</span>
                    <span>•</span>
                    <span>{item.machine.maker || 'IMM'}</span>
                    {item.machine.tonnage > 0 && <span>• {item.machine.tonnage}T</span>}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border ${cfg.badgeBg} ${cfg.badgeText}`}
                  >
                    {item.statusLabel}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    {item.shift.code} • Hr {item.currentHour}/8
                  </div>
                </div>
              </div>

              {/* CRITICAL WARNING BANNER IF HOURLY REPORT MISSING */}
              {isMissing && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-rose-200 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
                    <span>HOURLY REPORT MISSING</span>
                  </div>
                  <span className="text-[10px] text-rose-300 font-mono">No paper log received</span>
                </div>
              )}

              {/* OPERATIONAL CONTEXT ROW: Product, Operator, Supervisor */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <Package className="w-2.5 h-2.5 text-blue-400" /> Part / SKU
                  </span>
                  <strong className="text-slate-100 font-mono text-[11px] truncate block">
                    {item.product?.sku || 'None'}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <User className="w-2.5 h-2.5 text-emerald-400" /> Operator
                  </span>
                  <strong className="text-slate-100 text-[11px] truncate block">
                    {item.operator?.name || 'Unassigned'}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-purple-400" /> Supervisor
                  </span>
                  <strong className="text-slate-100 text-[11px] truncate block">
                    {item.supervisor?.name || 'Vikramaditya Rao'}
                  </strong>
                </div>
              </div>

              {/* TARGET VS ACTUAL QUANTITY & REJECTION METRICS */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-950/90 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Target Qty</span>
                  <span className="font-bold text-white font-mono text-xs">
                    {item.targetQty.toLocaleString()}
                  </span>
                </div>

                <div className="p-2 bg-slate-950/90 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Actual Qty</span>
                  <span className="font-bold text-emerald-400 font-mono text-xs">
                    {item.actualQty.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    {item.achievementPct}%
                  </span>
                </div>

                <div className="p-2 bg-slate-950/90 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Rejection</span>
                  <span className="font-bold text-rose-400 font-mono text-xs">
                    {item.rejectionQty}
                  </span>
                  <span className="text-[9px] text-rose-500 font-mono block">
                    {item.rejectionPct}%
                  </span>
                </div>

                <div className="p-2 bg-slate-950/90 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Downtime</span>
                  <span className="font-bold text-amber-400 font-mono text-xs">
                    {item.downtimeMinutes}m
                  </span>
                </div>
              </div>

              {/* OEE 4-PILLAR BAR (Availability, Performance, Quality, OEE %) */}
              <div className="p-2.5 bg-slate-950/90 rounded-xl border border-slate-800/90 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[11px] font-bold text-slate-300">OEE:</span>
                  <span className="font-mono font-black text-blue-400">{item.oeePct}%</span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>A: <strong className="text-slate-200">{item.availabilityPct}%</strong></span>
                  <span>•</span>
                  <span>P: <strong className="text-slate-200">{item.performancePct}%</strong></span>
                  <span>•</span>
                  <span>Q: <strong className="text-slate-200">{item.qualityPct}%</strong></span>
                </div>

                <div className="flex items-center text-blue-400 text-[11px] font-semibold">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}

        {filteredMetrics.length === 0 && (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <Cpu className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-300 font-bold">No matching machines found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your color filter or search criteria.
            </p>
          </div>
        )}
      </div>

      {/* 5. Detailed Machine Dashboard Modal */}
      <MachineDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        metric={selectedMetric}
        onOpenHourlyEntry={onOpenHourlyEntry}
        onOpenLogRejection={onOpenLogRejection}
        onOpenLogDowntime={onOpenLogDowntime}
      />
    </div>
  );
};
