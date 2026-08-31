import React from 'react';
import { Factory, FileCode, CheckCircle, Sliders, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DepartmentsView: React.FC = () => {
  const { departments, machines, products, users } = useApp();

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <Factory className="w-5 h-5 text-blue-400" />
            Departments & Report Formats
          </h1>
          <p className="text-xs text-slate-400">Department schemas with specialized production log formats</p>
        </div>

        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-200">
          {departments.length} Depts
        </span>
      </div>

      {/* Departments List */}
      <div className="space-y-3">
        {departments.map((dept) => {
          const deptMachines = machines.filter((m) => m.departmentId === dept.id);
          const deptProducts = products.filter((p) => p.departmentId === dept.id);
          const deptStaff = users.filter((u) => u.departmentId === dept.id);

          return (
            <div
              key={dept.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{dept.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800 font-mono font-bold">
                      {dept.code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{dept.description}</div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                  Format: {dept.reportTemplateType}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Workstations</span>
                  <span className="font-bold text-white font-mono">{deptMachines.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Active SKUs</span>
                  <span className="font-bold text-white font-mono">{deptProducts.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Assigned Staff</span>
                  <span className="font-bold text-white font-mono">{deptStaff.length}</span>
                </div>
              </div>

              {/* Specialized Fields Tag Pill List */}
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Department Form Fields:
                </span>
                <div className="flex flex-wrap gap-1">
                  {dept.customFields?.map((f, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-800 rounded-md text-[10px] text-slate-300 font-mono border border-slate-700/60"
                    >
                      {f.label} ({f.type}) {f.required && <strong className="text-rose-400">*</strong>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
