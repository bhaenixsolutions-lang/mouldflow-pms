import React, { useState } from 'react';
import { Calendar, Plus, Package, TrendingUp, Filter, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MonthlyPlanningView: React.FC = () => {
  const { monthlyPlans, products, departments, triggerHaptic } = useApp();

  const totalTargetQty = monthlyPlans.reduce((sum, p) => sum + p.targetQuantity, 0);
  const totalProducedQty = monthlyPlans.reduce((sum, p) => sum + p.producedQuantity, 0);
  const totalResinDemandKg = monthlyPlans.reduce((sum, p) => sum + p.rawResinRequiredKg, 0);

  const overallProgressPct = totalTargetQty > 0 ? ((totalProducedQty / totalTargetQty) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <Calendar className="w-5 h-5 text-purple-400" />
            Monthly Production Planning (PPC)
          </h1>
          <p className="text-xs text-slate-400">Target volume allocation & raw material resin requirements</p>
        </div>

        <span className="px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded-lg text-xs font-mono font-bold">
          {monthlyPlans[0]?.month || '2026-08'}
        </span>
      </div>

      {/* Aggregate KPI Tiles */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Plan Target</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">
            {totalTargetQty.toLocaleString()} pcs
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Monthly Demand</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Produced</div>
          <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
            {totalProducedQty.toLocaleString()} pcs
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{overallProgressPct}% Completed</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Resin Demand</div>
          <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
            {totalResinDemandKg.toLocaleString()} kg
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Raw Polymer</div>
        </div>
      </div>

      {/* Plans by SKU */}
      <div className="space-y-3">
        {monthlyPlans.map((plan) => {
          const prod = products.find((p) => p.id === plan.productId);
          const dept = departments.find((d) => d.id === plan.departmentId);
          const pct = ((plan.producedQuantity / plan.targetQuantity) * 100).toFixed(1);

          return (
            <div
              key={plan.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white font-mono">{prod?.sku}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${plan.status === 'Active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                      {plan.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">{prod?.name} ({dept?.name})</div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-purple-400 font-mono">{pct}%</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {plan.producedQuantity} / {plan.targetQuantity} pcs
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, Number(pct))}%` }}
                />
              </div>

              {/* PPC Material Calculation Details */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Raw Resin Required</span>
                  <span className="font-bold text-amber-300">{plan.rawResinRequiredKg} kg</span>
                  <span className="text-[10px] text-slate-500 block font-sans">({prod?.polymerMaterial})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Run Rate / Balance</span>
                  <span className="font-bold text-slate-200">
                    {(plan.targetQuantity - plan.producedQuantity).toLocaleString()} pcs remaining
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
