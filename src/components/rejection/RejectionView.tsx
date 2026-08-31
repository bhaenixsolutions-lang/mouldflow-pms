import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  TrendingDown,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  DollarSign,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RejectionLogItem } from '../../types/schema';

interface RejectionViewProps {
  onOpenLogRejection: () => void;
  onOpenDefectAdvisor: (defectCode: string, defectName: string) => void;
}

export const RejectionView: React.FC<RejectionViewProps> = ({
  onOpenLogRejection,
  onOpenDefectAdvisor,
}) => {
  const {
    rejections,
    defects,
    machines,
    products,
    departments,
    selectedDepartmentId,
    triggerHaptic,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredRejections = rejections.filter(
    (r) => selectedDepartmentId === 'all' || r.departmentId === selectedDepartmentId
  );

  const totalScrapQty = filteredRejections.reduce((sum, r) => sum + r.quantity, 0);
  const totalScrapCost = filteredRejections.reduce((sum, r) => sum + r.scrapCostTotal, 0);
  const reworkableQty = filteredRejections.filter((r) => r.isReworkable).reduce((sum, r) => sum + r.quantity, 0);

  // Group by defect for Pareto ranking
  const defectCounts: Record<string, { name: string; qty: number; cost: number; isReworkable: boolean }> = {};
  filteredRejections.forEach((r) => {
    if (!defectCounts[r.defectCode]) {
      defectCounts[r.defectCode] = {
        name: r.defectName,
        qty: 0,
        cost: 0,
        isReworkable: r.isReworkable,
      };
    }
    defectCounts[r.defectCode].qty += r.quantity;
    defectCounts[r.defectCode].cost += r.scrapCostTotal;
  });

  const paretoDefects = Object.entries(defectCounts).sort((a, b) => b[1].qty - a[1].qty);

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Rejection & Scrap Management
          </h1>
          <p className="text-xs text-slate-400">Defect tracking, rework classification & financial loss</p>
        </div>

        <button
          onClick={() => {
            triggerHaptic();
            onOpenLogRejection();
          }}
          className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Scrap</span>
        </button>
      </div>

      {/* High-Level Metric Tiles */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Total Scrap</div>
          <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">{totalScrapQty} pcs</div>
          <div className="text-[10px] text-slate-500 mt-1">Shift Rejections</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Scrap Cost</div>
          <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">₹{totalScrapCost.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1">Material + Cycle</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Reworkable</div>
          <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{reworkableQty} pcs</div>
          <div className="text-[10px] text-slate-500 mt-1">Recoverable Yield</div>
        </div>
      </div>

      {/* Pareto Defect Ranking Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <h2 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
              Top Defect Root Causes (Pareto)
            </h2>
          </div>
          <span className="text-[10px] text-slate-400">Ranked by Volume</span>
        </div>

        <div className="space-y-2.5">
          {paretoDefects.map(([code, item]) => {
            const pct = totalScrapQty > 0 ? ((item.qty / totalScrapQty) * 100).toFixed(1) : '0';
            return (
              <div key={code} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({code})</span>
                    {item.isReworkable && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                        Reworkable
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-rose-400">{item.qty} pcs</span>
                    <span className="text-[10px] text-slate-400">({pct}%)</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, Number(pct))}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                  <span>Scrap Loss: ₹{item.cost.toLocaleString()}</span>
                  <button
                    onClick={() => {
                      triggerHaptic();
                      onOpenDefectAdvisor(code, item.name);
                    }}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3 h-3" />
                    AI Tuning Advice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rejection Detailed Log Entries */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Recent Scrap Records ({filteredRejections.length})
        </div>

        <div className="space-y-2">
          {filteredRejections.map((item) => {
            const mach = machines.find((m) => m.id === item.machineId);
            const prod = products.find((p) => p.id === item.productId);
            const dept = departments.find((d) => d.id === item.departmentId);

            return (
              <div
                key={item.id}
                className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{item.defectName}</span>
                      <span className="text-[10px] text-rose-400 font-mono">({item.defectCode})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {mach?.code} • {prod?.sku} ({dept?.name})
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-rose-400 font-mono">{item.quantity} pcs</div>
                    <div className="text-[10px] text-amber-400 font-mono">₹{item.scrapCostTotal}</div>
                  </div>
                </div>

                {item.rootCauseNote && (
                  <div className="text-[11px] text-slate-400 bg-slate-950 p-1.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500">Root cause:</span> {item.rootCauseNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
