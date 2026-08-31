import React, { useState } from 'react';
import { Layers, Plus, Search, Filter, Cpu, DollarSign, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProductsView: React.FC = () => {
  const { products, departments, selectedDepartmentId, triggerHaptic } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesDept = selectedDepartmentId === 'all' || p.departmentId === selectedDepartmentId;
    const matchesSearch =
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.polymerMaterial.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <Layers className="w-5 h-5 text-blue-400" />
            Products & Moulds
          </h1>
          <p className="text-xs text-slate-400">SKU catalog, cavity configurations & polymer grades</p>
        </div>

        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-200">
          {products.length} SKUs
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by SKU, part name, or resin grade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {filteredProducts.map((p) => {
          const dept = departments.find((d) => d.id === p.departmentId);
          return (
            <div
              key={p.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white font-mono">{p.sku}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                      {p.cavitiesTotal} Cavities
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-300 mt-0.5">{p.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {dept?.name} • Mould ID: <span className="font-mono text-slate-300">{p.mouldCode}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    {p.targetPerHour} pcs/hr
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    ₹{p.unitCostCurrency}/unit
                  </div>
                </div>
              </div>

              {/* Polymer & Weight Technical Breakdown */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Material Grade</span>
                  <span className="font-bold text-amber-300 text-[11px] truncate block">
                    {p.polymerMaterial}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Part / Shot Wt</span>
                  <span className="font-bold text-slate-200">
                    {p.partWeightGrams}g / {p.shotWeightGrams}g
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Std Cycle Time</span>
                  <span className="font-bold text-slate-200">{p.standardCycleTimeSec}s</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
