import React, { useState, useRef } from 'react';
import {
  X,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Building,
  RotateCcw,
  AlertCircle,
  FileText,
  CheckSquare,
} from 'lucide-react';
import { SignatureCanvas } from './SignatureCanvas';
import { useApp } from '../../context/AppContext';
import { TrainingSignOffSession } from '../../types/training';

interface TrainerPreSignModalProps {
  session: TrainingSignOffSession;
  onClose: () => void;
  onSuccess: (session: TrainingSignOffSession) => void;
}

export const TrainerPreSignModal: React.FC<TrainerPreSignModalProps> = ({
  session,
  onClose,
  onSuccess,
}) => {
  const { signTrainerPreTraining, triggerHaptic } = useApp();

  const [signatureData, setSignatureData] = useState<string>(session.trainerSignatureData || '');
  const [trainerRemarks, setTrainerRemarks] = useState<string>(
    session.trainerObservations || 'Training session planned, machine safety protocols and SOP verified.'
  );
  const [confirmedPlan, setConfirmedPlan] = useState<boolean>(true);
  const [hasDrawn, setHasDrawn] = useState<boolean>(!!session.trainerSignatureData);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const now = new Date();
  const todayStr = session.trainingDate || now.toISOString().slice(0, 10);
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSignatureChange = (dataUrl: string) => {
    setSignatureData(dataUrl);
    setHasDrawn(!!dataUrl && dataUrl.length > 50);
    if (errorMessage) setErrorMessage('');
  };

  const handleClearSignature = () => {
    setSignatureData('');
    setHasDrawn(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureData || !hasDrawn) {
      setErrorMessage('Please provide your trainer digital signature on the signature pad.');
      triggerHaptic();
      return;
    }
    if (!confirmedPlan) {
      setErrorMessage('Please confirm that training is planned and ready.');
      triggerHaptic();
      return;
    }

    triggerHaptic();
    signTrainerPreTraining(session.id, signatureData, trainerRemarks);

    const updated: TrainingSignOffSession = {
      ...session,
      trainerPreSigned: true,
      trainerPreSignDate: todayStr,
      trainerPreSignTime: timeStr,
      trainerSignatureData: signatureData,
      trainerSignatureType: 'PRE_TRAINING',
      trainerObservations: trainerRemarks,
      trainerRemarks,
      status: 'Trainer Signed',
      trainingProgress: 'In Progress',
    };

    onSuccess(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-sky-950/50">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Step 1: Trainer Pre-Training Authorization
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                TRAINER PRE-TRAINING SIGN-OFF
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Training & Trainee Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-850 border border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Training Program</span>
              <p className="font-bold text-white text-sm">{session.trainingProgramTitle}</p>
              <p className="text-slate-400 font-mono text-[11px]">{session.trainingProgramCode || session.trainingProgramId}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Operator / Trainee</span>
              <p className="font-bold text-white text-sm">{session.employeeName}</p>
              <p className="text-sky-400 font-mono text-[11px]">ID: {session.employeeCode || session.employeeId}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Designated Trainer</span>
              <p className="font-bold text-slate-200 text-xs">{session.trainerName}</p>
              <p className="text-slate-400 font-mono text-[11px]">ID: {session.trainerEmployeeId || session.trainerId || 'TRN-LEAD'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Machine & Date</span>
              <p className="font-semibold text-slate-200 text-xs">{session.machineCode || 'IMM Cell Line'}</p>
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{todayStr}</span>
                <Clock className="w-3.5 h-3.5 text-slate-400 ml-1" />
                <span>{timeStr}</span>
              </div>
            </div>
          </div>

          {/* Statement of Confirmation */}
          <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="trainer-confirm"
                checked={confirmedPlan}
                onChange={(e) => setConfirmedPlan(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 bg-slate-900"
              />
              <label htmlFor="trainer-confirm" className="text-xs sm:text-sm font-semibold text-sky-100 leading-relaxed cursor-pointer">
                &ldquo;I confirm that the above training has been planned and is ready to be conducted.&rdquo;
              </label>
            </div>
            <p className="text-[11px] text-sky-300/80 pl-7">
              By signing below, the trainer certifies that all pre-training safety prerequisites, work instructions, and machine lockout verification have been completed.
            </p>
          </div>

          {/* Trainer Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Trainer Remarks / Pre-Training Observations
            </label>
            <input
              type="text"
              value={trainerRemarks}
              onChange={(e) => setTrainerRemarks(e.target.value)}
              placeholder="e.g. Safety guards verified, SOP reviewed, machine in manual mode"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Signature Canvas Pad */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-sky-400" />
                Trainer Digital Signature (Sign Below on Touchscreen / Mouse)
              </label>
              {hasDrawn && (
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Signature Captured
                </span>
              )}
            </div>

            <div className="border-2 border-slate-700 hover:border-sky-500/80 rounded-2xl overflow-hidden bg-slate-950 relative shadow-inner">
              <SignatureCanvas
                value={signatureData}
                onChange={handleSignatureChange}
                signerName={session.trainerName}
                role="Trainer"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClearSignature}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Signature
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-black tracking-wide shadow-lg shadow-sky-950/60 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm &amp; Start Training
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
