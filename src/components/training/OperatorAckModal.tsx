import React, { useState } from 'react';
import {
  X,
  UserCheck,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { SignatureCanvas } from './SignatureCanvas';
import { useApp } from '../../context/AppContext';
import { TrainingSignOffSession } from '../../types/training';

interface OperatorAckModalProps {
  session: TrainingSignOffSession;
  onClose: () => void;
  onSuccess: (updatedSession: TrainingSignOffSession) => void;
}

export const OperatorAckModal: React.FC<OperatorAckModalProps> = ({
  session,
  onClose,
  onSuccess,
}) => {
  const { signOperatorAcknowledgement, triggerHaptic } = useApp();

  const [signatureData, setSignatureData] = useState<string>(session.operatorSignatureData || '');
  const [operatorRemarks, setOperatorRemarks] = useState<string>(
    session.operatorRemarks || 'I have completed the practical demonstration and understood the machine SOP.'
  );
  const [confirmedUnderstanding, setConfirmedUnderstanding] = useState<boolean>(true);
  const [hasDrawn, setHasDrawn] = useState<boolean>(!!session.operatorSignatureData);
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
      setErrorMessage('Please provide your operator signature on the signature pad.');
      triggerHaptic();
      return;
    }
    if (!confirmedUnderstanding) {
      setErrorMessage('Please check the box confirming you have understood the training content.');
      triggerHaptic();
      return;
    }

    triggerHaptic();
    signOperatorAcknowledgement(session.id, signatureData);

    const updated: TrainingSignOffSession = {
      ...session,
      operatorAckSigned: true,
      operatorAckDate: todayStr,
      operatorAckTime: timeStr,
      operatorSignatureData: signatureData,
      operatorSignatureType: 'OPERATOR_ACKNOWLEDGEMENT',
      operatorRemarks,
      status: 'Operator Acknowledged',
    };

    onSuccess(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/50">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Step 3: Operator Acknowledgement
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                OPERATOR TRAINING ACKNOWLEDGEMENT
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
          {/* Training & Trainee Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-850 border border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Training Program</span>
              <p className="font-bold text-white text-sm">{session.trainingProgramTitle}</p>
              <p className="text-slate-400 font-mono text-[11px]">{session.trainingProgramCode || session.trainingProgramId}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Operator (Trainee)</span>
              <p className="font-bold text-white text-sm">{session.employeeName}</p>
              <p className="text-emerald-400 font-mono text-[11px]">ID: {session.employeeCode || session.employeeId}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Trainer</span>
              <p className="font-bold text-slate-200 text-xs">{session.trainerName}</p>
              <p className="text-slate-400 text-[11px]">Machine: {session.machineCode || 'IMM-01'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Date &amp; Time</span>
              <div className="flex items-center gap-2 text-slate-200 text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{todayStr}</span>
                <Clock className="w-3.5 h-3.5 text-slate-400 ml-1" />
                <span>{timeStr}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">Stage 1 Pre-Sign Completed</span>
            </div>
          </div>

          {/* Acknowledgement Statement */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="operator-confirm"
                checked={confirmedUnderstanding}
                onChange={(e) => setConfirmedUnderstanding(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 bg-slate-900"
              />
              <label htmlFor="operator-confirm" className="text-xs sm:text-sm font-semibold text-emerald-100 leading-relaxed cursor-pointer">
                &ldquo;I confirm that the training/SOP/practical demonstration has been explained to me and I have understood the training content.&rdquo;
              </label>
            </div>
            <p className="text-[11px] text-emerald-300/80 pl-7">
              By signing below, I certify that I have observed the safety procedures and am ready to proceed to the digital theory assessment.
            </p>
          </div>

          {/* Operator Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Operator Remarks (Optional)
            </label>
            <input
              type="text"
              value={operatorRemarks}
              onChange={(e) => setOperatorRemarks(e.target.value)}
              placeholder="e.g. All machine safety doors and emergency stop controls understood."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Signature Canvas Pad */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Operator Digital Signature (Sign Below on Touchscreen / Mouse)
              </label>
              {hasDrawn && (
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Signature Captured
                </span>
              )}
            </div>

            <div className="border-2 border-slate-700 hover:border-emerald-500/80 rounded-2xl overflow-hidden bg-slate-950 relative shadow-inner">
              <SignatureCanvas
                value={signatureData}
                onChange={handleSignatureChange}
                signerName={session.employeeName}
                role="Operator"
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
                className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm &amp; Continue to Test
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
