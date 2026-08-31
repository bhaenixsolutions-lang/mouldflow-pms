import React, { useState } from 'react';
import { Package, Plus, ArrowDownLeft, ArrowUpRight, AlertTriangle, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryItem } from '../../types/schema';

export const InventoryView: React.FC = () => {
  const { inventory, updateInventoryStock, triggerHaptic } = useApp();
  const [filterCat, setFilterCat] = useState<string>('all');

  const filteredInventory = inventory.filter(
    (i) => filterCat === 'all' || i.itemType === filterCat
  );

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <Package className="w-5 h-5 text-blue-400" />
            Inventory & WIP Bins
          </h1>
          <p className="text-xs text-slate-400">Raw polymer resin, inserts, WIP stage bins & packaging</p>
        </div>

        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-200">
          {inventory.length} Stock Items
        </span>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {['all', 'RawResin', 'InsertComponent', 'Masterbatch', 'WIP', 'FinishedGoods', 'Packaging'].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setFilterCat(cat);
              triggerHaptic();
            }}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterCat === cat
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat === 'all' ? 'All Inventory' : cat}
          </button>
        ))}
      </div>

      {/* Inventory Items List */}
      <div className="space-y-2.5">
        {filteredInventory.map((item) => {
          const isLowStock = item.currentStock <= item.minSafetyStock;

          return (
            <div
              key={item.id}
              className={`p-3.5 bg-slate-900 border rounded-2xl space-y-2 shadow-md ${
                isLowStock ? 'border-amber-700/80 bg-amber-950/20' : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white font-mono">{item.itemCode}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-300 font-semibold">
                      {item.itemType}
                    </span>
                    {isLowStock && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-700 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">{item.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Location: <strong className="text-slate-300">{item.storageLocation}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-white font-mono">
                    {item.currentStock.toLocaleString()} {item.unit}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Safety: {item.minSafetyStock} {item.unit}
                  </div>
                </div>
              </div>

              {/* Quick Stock In / Stock Out Steppers */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 font-mono">Batch: {item.batchLotNo || 'N/A'}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      triggerHaptic();
                      updateInventoryStock(item.id, -25, 'OUT', 'Shopfloor issue');
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-rose-300 rounded-lg text-xs font-mono font-bold border border-slate-700"
                  >
                    -25
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic();
                      updateInventoryStock(item.id, 50, 'IN', 'Stock receipt');
                    }}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-lg text-xs font-mono font-bold"
                  >
                    +50 {item.unit}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
