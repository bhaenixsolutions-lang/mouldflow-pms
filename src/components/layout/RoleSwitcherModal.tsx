import React from 'react';
import { X, ShieldCheck, Check, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/schema';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchRole, triggerHaptic } = useApp();

  if (!isOpen) return null;

  const rolesConfig: {
    role: UserRole;
    title: string;
    description: string;
    badgeColor: string;
    sampleStaff: string;
    permissions: string[];
  }[] = [
    {
      role: 'Operator',
      title: 'Machine & Assembly Operator',
      description: 'Quick hourly logging, cycle time monitoring, stoppage logging & scrap reporting.',
      badgeColor: 'bg-blue-600',
      sampleStaff: 'Ramesh Kumar (OP-104)',
      permissions: ['1-Tap Hourly Count', 'Log Downtime Stoppages', 'Log Rejection Scrap', 'My Machine View'],
    },
    {
      role: 'Senior Operator',
      title: 'Senior Operator (L3 / L4)',
      description: 'Independent multi-machine operation, junior operator mentoring & self-inspection.',
      badgeColor: 'bg-cyan-600',
      sampleStaff: 'Manoj Verma (OP-108)',
      permissions: ['Independent Press Authorization', 'SOP Quiz Completion', 'Assist Onboarding', 'Line Balancing'],
    },
    {
      role: 'Trainer',
      title: 'Technical Trainer & Competency Auditor',
      description: 'Assign SOP training, conduct test quizzes, machine practical signoffs & skill matrix management.',
      badgeColor: 'bg-amber-600',
      sampleStaff: 'Rajesh Sharma (TRN-001)',
      permissions: ['Assign Training Modules', 'Practical Machine Audits', 'Skill Level Matrix L1-L4', 'Refresher Renewal'],
    },
    {
      role: 'Quality Supervisor',
      title: 'Quality Assurance & Defect Inspector',
      description: 'Incoming & in-process quality inspection, shopfloor audit checklists & defect CAPA triggers.',
      badgeColor: 'bg-purple-600',
      sampleStaff: 'Pooja Deshmukh (QC-001)',
      permissions: ['Shopfloor Observation Audits', 'Defect Scrap Analysis', 'Trigger Corrective Retraining', 'Signoff CAPA'],
    },
    {
      role: 'Supervisor',
      title: 'Shift Production Supervisor',
      description: 'Line balancing, verification of hourly entries, scrap authorization & mold changeover tracking.',
      badgeColor: 'bg-emerald-600',
      sampleStaff: 'Vikramaditya Rao (SUP-002)',
      permissions: ['Verify Hourly Reports', 'Downtime Root Cause Signoff', 'Shift Handover Notes', 'Line OEE Check'],
    },
    {
      role: 'PPC',
      title: 'Production Planning & Control',
      description: 'Monthly production scheduling, resin inventory balancing & machine capacity matrix.',
      badgeColor: 'bg-purple-600',
      sampleStaff: 'Pooja Sharma (PPC-001)',
      permissions: ['Monthly Target Setting', 'Machine Allocation Matrix', 'Raw Material & Resin Demand', 'WIP Balancing'],
    },
    {
      role: 'Production Manager',
      title: 'Plant Production Manager',
      description: 'Daily shift closing approvals, bottleneck resolution, OEE metrics & plant yield analysis.',
      badgeColor: 'bg-amber-600',
      sampleStaff: 'Rajeev Singhania (MGR-001)',
      permissions: ['Daily Summary Signoff', 'OEE & Yield Drilldown', 'Manager Approval Gate', 'AI Process Tuning'],
    },
    {
      role: 'Management',
      title: 'Executive / VP Operations',
      description: 'High-level business analytics, scrap financial impact & plant utilization radar.',
      badgeColor: 'bg-indigo-600',
      sampleStaff: 'Sunil Deshmukh (EXEC-001)',
      permissions: ['Executive Dashboard', 'Scrap Financial Impact', 'Plant OEE Trends', 'Multi-Dept Throughput'],
    },
    {
      role: 'Admin',
      title: 'System Administrator',
      description: 'Master data configuration, departments & report template schemas, shifts & audit logs.',
      badgeColor: 'bg-rose-600',
      sampleStaff: 'System Admin (ADM-001)',
      permissions: ['Department Schema Builder', 'Shift Master Scheduling', 'Audit Trail Ledger', 'Database Reset / Seed'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">Select Role (RBAC Simulation)</h2>
              <p className="text-[11px] text-slate-400">Switch persona to test role-tailored workflows</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Roles List */}
        <div className="p-3 overflow-y-auto space-y-2.5 flex-1">
          {rolesConfig.map((item) => {
            const isSelected = currentUser.role === item.role;
            return (
              <div
                key={item.role}
                id={`role-card-${item.role}`}
                onClick={() => {
                  switchRole(item.role);
                  onClose();
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500 shadow-md'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold text-white ${item.badgeColor}`}>
                      {item.role}
                    </span>
                    <span className="text-xs font-medium text-slate-200">{item.title}</span>
                  </div>
                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">{item.sampleStaff}</span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{item.description}</p>

                {/* Permissions tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.permissions.map((perm, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900/80 text-slate-300 border border-slate-700/50"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            Current: <strong className="text-slate-200">{currentUser.name}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
