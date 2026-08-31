import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, FileText, UserCheck, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ShiftsView: React.FC = () => {
  const { shifts, activeShift, setActiveShift, currentUser, triggerHaptic } = useApp();

  const [handoverNote, setHandoverNote] = useState<string>(
    'Shift A handover: IMM-01 ran smoothly. Resin hopper topped up with PBT-GF30. IMM-03 mold changeover scheduled for 14:30.'
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveHandover = () => {
    triggerHaptic();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 pb-20 p-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-blue-400" />
            Shifts & Electronic Handover
          </h1>
          <p className="text-xs text-slate-400">Shift schedules, changeover logs & supervisor sign-off</p>
        </div>

        <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-mono font-bold">
          Active: {activeShift.code}
        </span>
      </div>

      {/* Shifts Card Grid */}
      <div className="space-y-2.5">
        {shifts.map((s) => {
          const isActive = activeShift.id === s.id;
          return (
            <div
              key={s.id}
              onClick={() => {
                setActiveShift(s);
                triggerHaptic();
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-950/50 border-blue-500 ring-1 ring-blue-500 shadow-md'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`}
                  />
                  <div>
                    <div className="font-bold text-sm text-white">{s.name}</div>
                    <div className="text-xs text-slate-400 font-mono">
                      {s.startTime} - {s.endTime} ({s.durationHours} Hours)
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {isActive ? 'Current Running' : 'Select'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Electronic Shift Handover Log */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
              {activeShift.code} Handover Notes to Incoming Shift
            </h2>
          </div>
          <span className="text-[10px] text-slate-400">Digital Sign-off</span>
        </div>

        <textarea
          rows={4}
          value={handoverNote}
          onChange={(e) => setHandoverNote(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            Logged by: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.role})
          </div>

          <button
            onClick={handleSaveHandover}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 shadow-md"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Sign & Save Handover
          </button>
        </div>

        {savedSuccess && (
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Handover notes saved and synchronized with next shift supervisor!
          </div>
        )}
      </div>
    </div>
  );
};
