import React, { useState } from 'react';
import { Users, ShieldCheck, UserCheck, Award, Cpu, Search, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/schema';
import { OperatorMonitoringView } from './OperatorMonitoringView';
import { SupervisorMonitoringView } from './SupervisorMonitoringView';

export const StaffView: React.FC = () => {
  const { users, machines, departments, triggerHaptic } = useApp();
  const [activeTab, setActiveTab] = useState<'operators' | 'supervisors' | 'directory'>('operators');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(q) ||
      u.employeeCode.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const roleColors: Record<UserRole, string> = {
    Operator: 'bg-blue-900/60 text-blue-300 border-blue-700',
    'Senior Operator': 'bg-cyan-900/60 text-cyan-300 border-cyan-700',
    Supervisor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
    'Production Supervisor': 'bg-teal-900/60 text-teal-300 border-teal-700',
    'Quality Supervisor': 'bg-purple-900/60 text-purple-300 border-purple-700',
    'Maintenance Supervisor': 'bg-orange-900/60 text-orange-300 border-orange-700',
    Trainer: 'bg-amber-900/60 text-amber-300 border-amber-700',
    PPC: 'bg-purple-900/60 text-purple-300 border-purple-700',
    'Production Manager': 'bg-amber-900/60 text-amber-300 border-amber-700',
    Management: 'bg-indigo-900/60 text-indigo-300 border-indigo-700',
    Admin: 'bg-rose-900/60 text-rose-300 border-rose-700',
  };

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Top Tab Bar Switcher */}
      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => {
            triggerHaptic();
            setActiveTab('operators');
          }}
          className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'operators'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Operator Performance
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            setActiveTab('supervisors');
          }}
          className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'supervisors'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Supervisor Shifts
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            setActiveTab('directory');
          }}
          className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'directory'
              ? 'bg-slate-800 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          All Staff
        </button>
      </div>

      {/* Render Selected View */}
      {activeTab === 'operators' && <OperatorMonitoringView />}
      {activeTab === 'supervisors' && <SupervisorMonitoringView />}

      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <Users className="w-5 h-5 text-blue-400" />
                Staff Directory & Skills
              </h2>
              <p className="text-xs text-slate-400">Personnel records, roles & station access</p>
            </div>

            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-200">
              {users.length} Total
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, employee code (OP-104), role..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {['all', 'Operator', 'Supervisor', 'PPC', 'Production Manager', 'Management', 'Admin'].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setFilterRole(r);
                  triggerHaptic();
                }}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterRole === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {r === 'all' ? 'All Roles' : r}
              </button>
            ))}
          </div>

          {/* Users List */}
          <div className="space-y-2.5">
            {filteredUsers.map((u) => {
              const dept = departments.find((d) => d.id === u.departmentId);
              const mach = machines.find((m) => m.currentOperatorId === u.id);

              return (
                <div
                  key={u.id}
                  className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-2 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                      {u.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{u.name}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${roleColors[u.role]}`}>
                          {u.role}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {u.employeeCode} • {dept?.name || 'Multi-Dept'}
                      </div>

                      {mach && (
                        <div className="text-[10px] text-blue-400 font-mono mt-0.5">
                          Assigned: {mach.code} ({mach.name})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skill Badge */}
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950 text-amber-400 border border-slate-800 font-bold flex items-center gap-1 font-mono">
                      <Award className="w-3 h-3 text-amber-400" />
                      L{u.skillLevel || 2}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-1">PIN: {u.pin}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
