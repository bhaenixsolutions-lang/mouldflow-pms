import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  User,
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  Building,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  PenTool,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User as UserType } from '../../types/schema';
import { OperatorTrainingPassportModal } from './OperatorTrainingPassportModal';

interface GlobalOperatorSearchProps {
  onSelectOperator?: (operator: UserType) => void;
  onStartDigitalTest?: (sessionId?: string, programId?: string) => void;
  onOpenSignOff?: (sessionId?: string) => void;
  onAssignProgram?: (operatorId: string) => void;
  variant?: 'floating' | 'embedded' | 'compact';
}

export const GlobalOperatorSearch: React.FC<GlobalOperatorSearchProps> = ({
  onSelectOperator,
  onStartDigitalTest,
  onOpenSignOff,
  onAssignProgram,
  variant = 'floating',
}) => {
  const {
    users,
    machines,
    departments,
    companies,
    selectedCompanyId,
    trainingAssignments,
    trainingSignOffSessions,
    isOperatorQualifiedForMachine,
    triggerHaptic,
  } = useApp();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOperatorModal, setSelectedOperatorModal] = useState<UserType | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'QUALIFIED' | 'HOLD' | 'RETRAINING'>('ALL');
  
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter only operators/staff
  const allOperators = useMemo(() => {
    return users.filter(
      (u) =>
        u.role === 'Operator' ||
        u.role === 'Senior Operator' ||
        u.role === 'Supervisor' ||
        u.role === 'Production Supervisor' ||
        u.role === 'Quality Supervisor' ||
        u.role === 'Trainer'
    );
  }, [users]);

  // Search logic: Name, Employee ID, Employee Code, Badge Number
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return allOperators.slice(0, 8); // Return recent operators
    }

    return allOperators.filter((op) => {
      const matchName = op.name.toLowerCase().includes(trimmed);
      const matchId = op.id.toLowerCase().includes(trimmed);
      const matchCode = op.employeeCode ? op.employeeCode.toLowerCase().includes(trimmed) : false;
      const matchBadge = op.badgeNumber ? op.badgeNumber.toLowerCase().includes(trimmed) : false;
      const matchMachine = op.assignedMachineCode
        ? op.assignedMachineCode.toLowerCase().includes(trimmed)
        : false;
      const matchDept = op.departmentId ? op.departmentId.toLowerCase().includes(trimmed) : false;

      return matchName || matchId || matchCode || matchBadge || matchMachine || matchDept;
    });
  }, [allOperators, query]);

  // Filtered by status chip
  const filteredResults = useMemo(() => {
    if (filterType === 'ALL') return searchResults;

    return searchResults.filter((op) => {
      const machineId = op.assignedMachineId || op.assignedMachineCode || 'mach-1';
      const q = isOperatorQualifiedForMachine(op.id, machineId);
      if (filterType === 'QUALIFIED') return q.qualified;
      if (filterType === 'HOLD') return !q.qualified;
      if (filterType === 'RETRAINING') {
        const hasFailed = trainingAssignments.some(
          (a) => a.employeeId === op.id && (a.status === 'Failed' || a.isCorrectiveRetraining)
        );
        return hasFailed || !q.qualified;
      }
      return true;
    });
  }, [searchResults, filterType, isOperatorQualifiedForMachine, trainingAssignments]);

  const handleSelect = (operator: UserType) => {
    triggerHaptic();
    setSelectedOperatorModal(operator);
    if (onSelectOperator) {
      onSelectOperator(operator);
    }
  };

  return (
    <div ref={searchContainerRef} className="relative w-full">
      {/* Search Input Bar */}
      <div className="relative flex items-center w-full">
        <div className="absolute left-3.5 pointer-events-none text-amber-400">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <input
          id="global-operator-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search operator by name or Employee ID… (e.g. Rahul, OP-1023, BDV-01)"
          className="w-full pl-10 sm:pl-11 pr-24 py-2.5 sm:py-3 bg-slate-900/95 hover:bg-slate-900 text-white placeholder-slate-400 text-xs sm:text-sm font-semibold rounded-2xl border-2 border-amber-500/30 hover:border-amber-500/60 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 shadow-lg transition-all"
        />

        {/* Clear & Count Controls inside input */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(true);
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 rounded-md border border-slate-700/60">
              {allOperators.length} Operators
            </span>
          )}
        </div>
      </div>

      {/* Dropdown Live Results */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150 max-h-[75vh] flex flex-col">
          {/* Filter Chips Header */}
          <div className="p-2.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 pl-1 uppercase tracking-wider">
                Filter:
              </span>
              {[
                { id: 'ALL', label: 'All Operators' },
                { id: 'QUALIFIED', label: 'Fully Qualified' },
                { id: 'HOLD', label: 'Qualification Hold' },
                { id: 'RETRAINING', label: 'Retraining Pending' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    filterType === f.id
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-950/40'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 shrink-0 pr-2">
              Found: <strong className="text-white">{filteredResults.length}</strong>
            </span>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {filteredResults.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <p className="text-sm font-semibold">No operators matching "{query}"</p>
                <p className="text-xs text-slate-500">
                  Try searching by employee name (e.g. "Rahul"), employee ID (e.g. "OP-1023"), or station code (e.g. "IMM-01").
                </p>
              </div>
            ) : (
              filteredResults.map((op) => {
                const machine = machines.find(
                  (m) => m.id === op.assignedMachineId || m.code === op.assignedMachineCode
                );
                const dept = departments.find((d) => d.id === op.departmentId);
                const company = companies.find((c) => c.id === op.companyId);
                const q = isOperatorQualifiedForMachine(
                  op.id,
                  machine?.id || op.assignedMachineCode || 'mach-1'
                );

                const opSessions = trainingSignOffSessions.filter(
                  (s) => s.employeeId === op.id || s.employeeCode === op.employeeCode
                );
                const opAssignments = trainingAssignments.filter(
                  (a) => a.employeeId === op.id || a.employeeCode === op.employeeCode
                );
                const latestTest = opSessions.find((s) => s.testCompleted);

                return (
                  <div
                    key={op.id}
                    onClick={() => handleSelect(op)}
                    className="p-3 rounded-xl bg-slate-850/40 hover:bg-slate-800/90 border border-slate-800/60 hover:border-amber-500/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Left: Avatar & Identity */}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-extrabold text-sm shadow-md shrink-0">
                        {op.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-white text-sm group-hover:text-amber-300 transition-colors">
                            {op.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-900 text-amber-400 border border-slate-700">
                            {op.employeeCode || op.id}
                          </span>
                          {op.badgeNumber && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-sky-950 text-sky-300 border border-sky-800/50">
                              Badge: {op.badgeNumber}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              q.qualified
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {q.qualified ? 'Fully Qualified' : 'Qualification Hold'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                          <span>
                            Role: <strong className="text-slate-300">{op.designation || op.role}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Dept: <strong className="text-slate-300">{dept?.name || 'Moulding'}</strong>
                          </span>
                          {op.assignedMachineCode && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                <Cpu className="w-3 h-3" />
                                {op.assignedMachineCode}
                              </span>
                            </>
                          )}
                          {company && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400">{company.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick actions & stats */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {latestTest && (
                        <div className="hidden md:block text-right pr-2">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Latest Test</span>
                          <span className={`text-xs font-black ${latestTest.testResult === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {latestTest.testPercentage}% ({latestTest.testResult})
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(op);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                      >
                        <Award className="w-3.5 h-3.5" /> Passport
                      </button>

                      {onOpenSignOff && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic();
                            const session = opSessions[0];
                            onOpenSignOff(session?.id);
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs"
                          title="Two-Stage Sign-Off Sheet"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onStartDigitalTest && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic();
                            onStartDigitalTest(undefined, opAssignments[0]?.trainingId);
                          }}
                          className="p-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs"
                          title="Launch Digital Test"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Helper Footer */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 px-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Global Operator Search • ISO 9001 / IATF 16949 Compliant
            </span>
            <span className="text-slate-500 font-mono text-[10px]">ESC to close</span>
          </div>
        </div>
      )}

      {/* Operator Passport Modal Popup */}
      {selectedOperatorModal && (
        <OperatorTrainingPassportModal
          operator={selectedOperatorModal}
          onClose={() => setSelectedOperatorModal(null)}
          onStartDigitalTest={onStartDigitalTest}
          onOpenSignOff={onOpenSignOff}
          onAssignProgram={onAssignProgram}
        />
      )}
    </div>
  );
};
