import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const MonthlyAnalyticsView: React.FC = () => {
  const { reports, rejections, downtimes } = useApp();

  // Weekly OEE Trend Data
  const oeeTrendData = [
    { day: 'Mon', oee: 92.4, target: 90 },
    { day: 'Tue', oee: 94.1, target: 90 },
    { day: 'Wed', oee: 89.8, target: 90 },
    { day: 'Thu', oee: 95.2, target: 90 },
    { day: 'Fri', oee: 93.8, target: 90 },
    { day: 'Sat', oee: 96.0, target: 90 },
    { day: 'Sun', oee: 94.5, target: 90 },
  ];

  // Department Production Output
  const deptOutputData = [
    { name: 'Moulding', good: 28400, scrap: 340 },
    { name: 'Assembly', good: 19800, scrap: 180 },
    { name: 'Deflashing', good: 22100, scrap: 95 },
    { name: 'Packing', good: 21500, scrap: 20 },
    { name: 'BDV Test', good: 18400, scrap: 45 },
  ];

  // Downtime Reasons Donut
  const downtimePieData = [
    { name: 'Mold Issue', value: 45, color: '#f43f5e' },
    { name: 'Material Dry', value: 30, color: '#fb923c' },
    { name: 'Changeover', value: 35, color: '#a855f7' },
    { name: 'Electrical', value: 15, color: '#38bdf8' },
    { name: 'Operator Break', value: 12, color: '#94a3b8' },
  ];

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Monthly OEE & Analytics
          </h1>
          <p className="text-xs text-slate-400">Shopfloor trend analysis, scrap Pareto & machine availability</p>
        </div>

        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-200">
          August 2026
        </span>
      </div>

      {/* 1. Daily OEE Trend Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
            7-Day Plant OEE Trend (%)
          </h2>
          <span className="text-xs font-mono text-emerald-400 font-bold">Avg: 93.7%</span>
        </div>

        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={oeeTrendData}>
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis domain={[80, 100]} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }}
              />
              <Line type="monotone" dataKey="oee" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="target" stroke="#10b981" strokeDasharray="3 3" strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Department Throughput vs Scrap */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-xl">
        <h2 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
          Department Good Output vs Scrap
        </h2>

        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptOutputData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }}
              />
              <Bar dataKey="good" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="scrap" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Stoppage Root Causes Donut */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
        <h2 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
          Downtime Loss Breakdown (Minutes)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-2">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={downtimePieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={4}>
                  {downtimePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {downtimePieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-200">{item.value} min</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
