import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Clock, AlertTriangle, FileSpreadsheet, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductionReport } from '../../types/schema';

interface ApprovalsViewProps {
  onOpenReportDetails: (reportId: string) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ onOpenReportDetails }) => {
  const {
    reports,
    machines,
    products,
    departments,
    currentUser,
    updateReportStatus,
    triggerHaptic,
  } = useApp();

  const [filterType, setFilterType] = useState<'pending' | 'all'>('pending');

  const pendingReports = reports.filter((r) => r.status === 'Submitted' || r.status === 'Verified');
  const displayReports = filterType === 'pending' ? pendingReports : reports;

  const handleVerify = (reportId: string) => {
    triggerHaptic();
    updateReportStatus(reportId, 'Verified', 'Supervisor verified shift hours and rejections');
  };

  const handleApprove = (reportId: string) => {
    triggerHaptic();
    updateReportStatus(reportId, 'Approved', 'Manager authorized shift closing');
  };

  const handleReject = (reportId: string) => {
    triggerHaptic();
    updateReportStatus(reportId, 'Rejected', 'Sent back to operator for correction');
  };

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            Approval Workflow
          </h1>
          <p className="text-xs text-slate-400">Multi-gate verification: Operator → Supervisor → Manager</p>
        </div>

        <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded-lg text-xs font-mono font-bold">
          {pendingReports.length} Pending
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => {
            setFilterType('pending');
            triggerHaptic();
          }}
          className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
            filterType === 'pending'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          Pending Sign-Off ({pendingReports.length})
        </button>
        <button
          onClick={() => {
            setFilterType('all');
            triggerHaptic();
          }}
          className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
            filterType === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          All Reports ({reports.length})
        </button>
      </div>

      {/* Reports Queue */}
      <div className="space-y-3">
        {displayReports.length > 0 ? (
          displayReports.map((r) => {
            const mach = machines.find((m) => m.id === r.machineId);
            const prod = products.find((p) => p.id === r.productId);
            const dept = departments.find((d) => d.id === r.departmentId);

            return (
              <div
                key={r.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white font-mono">{r.reportNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                        {r.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 mt-1 font-semibold">
                      {mach?.code} • {prod?.sku} ({dept?.name})
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">Date: {r.date}</div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-emerald-400">{r.totalActual} pcs</div>
                    <div className="text-[10px] text-rose-400">Rej: {r.totalReject}</div>
                    <div className="text-[10px] text-amber-400">DT: {r.totalDowntimeMinutes}m</div>
                  </div>
                </div>

                {/* Action Buttons for Sign-Off */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenReportDetails(r.id)}
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Review Sheet
                  </button>

                  <div className="flex gap-1.5">
                    {r.status === 'Submitted' && (
                      <>
                        <button
                          onClick={() => handleReject(r.id)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg text-xs font-semibold border border-slate-700"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleVerify(r.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold active:scale-95 shadow-md"
                        >
                          Supervisor Verify
                        </button>
                      </>
                    )}

                    {r.status === 'Verified' && (
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold active:scale-95 shadow-md flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Manager Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No reports in queue requiring approval. All shifts are up to date!
          </div>
        )}
      </div>
    </div>
  );
};
