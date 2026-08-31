import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Zap,
  Printer,
  QrCode,
  Building,
  Languages,
  CheckSquare,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CompanyQuestionPaper } from '../../types/training';
import { normalizePassMark, calculateAssessmentScore } from '../../utils/assessmentUtils';

interface DigitalTestEngineModalProps {
  sessionId?: string;
  questionPaperId?: string;
  programId?: string;
  onClose: () => void;
  onCompleted?: () => void;
  onViewRecord?: (sessionId: string) => void;
}

export const DigitalTestEngineModal: React.FC<DigitalTestEngineModalProps> = ({
  sessionId,
  questionPaperId,
  programId,
  onClose,
  onCompleted,
  onViewRecord,
}) => {
  const {
    companyQuestionPapers,
    companyTrainingPrograms,
    trainingSignOffSessions,
    submitSessionDigitalTest,
    triggerHaptic,
  } = useApp();

  // Find relevant session if provided
  const session = useMemo(() => {
    if (sessionId) {
      return trainingSignOffSessions.find((s) => s.id === sessionId);
    }
    return null;
  }, [sessionId, trainingSignOffSessions]);

  // Find matching question paper
  const questionPaper = useMemo<CompanyQuestionPaper | undefined>(() => {
    if (questionPaperId) {
      return companyQuestionPapers.find((qp) => qp.id === questionPaperId);
    }
    if (session?.questionPaperId) {
      return companyQuestionPapers.find((qp) => qp.id === session.questionPaperId);
    }
    if (programId) {
      return companyQuestionPapers.find((qp) => qp.trainingProgramId === programId);
    }
    return companyQuestionPapers[0];
  }, [questionPaperId, session, programId, companyQuestionPapers]);

  const questions = questionPaper?.questions || [];

  // State
  const [languageMode, setLanguageMode] = useState<'en' | 'hi' | 'both'>('both');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showUnansweredWarning, setShowUnansweredWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 mins
  const [certificateId, setCertificateId] = useState('');

  // Countdown timer
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          executeSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectAnswer = (optionLabel: string) => {
    triggerHaptic();
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionLabel,
    }));
  };

  // Normalized pass mark & scoring
  const scoreResult = useMemo(() => {
    const rawPassMark = questionPaper?.passingPercentage ?? session?.passMark ?? 80;
    const normalizedPass = normalizePassMark(rawPassMark, 80);

    if (questions.length === 0) {
      return {
        score: 0,
        total: 0,
        totalScore: 0,
        percentage: 0,
        passMark: normalizedPass,
        passed: false,
        isPassed: false,
        result: 'FAILED' as const,
        correctCount: 0,
        wrongCount: 0,
        attemptedList: [],
      };
    }

    let earnedMarks = 0;
    let totalMarks = 0;
    let correctCount = 0;

    const attemptedList = questions.map((q, idx) => {
      const selected = answers[idx];
      const isCorrect = selected === q.correctAnswer;
      const marks = q.marks || 20;
      totalMarks += marks;
      if (isCorrect) {
        earnedMarks += marks;
        correctCount += 1;
      }
      return {
        questionId: q.id,
        questionNumber: q.questionNumber || idx + 1,
        questionText: q.questionText,
        questionTextHindi: q.questionTextHindi,
        selectedAnswer: selected || 'None',
        correctAnswer: q.correctAnswer,
        isCorrect,
        marksAwarded: isCorrect ? marks : 0,
        explanation: q.explanation,
        explanationHindi: q.explanationHindi,
      };
    });

    const evaluated = calculateAssessmentScore(
      earnedMarks,
      totalMarks,
      normalizedPass,
      correctCount,
      questions.length
    );

    return {
      score: evaluated.score,
      total: evaluated.totalScore,
      totalScore: evaluated.totalScore,
      percentage: evaluated.percentage,
      passMark: evaluated.passMark,
      passed: evaluated.isPassed,
      isPassed: evaluated.isPassed,
      result: evaluated.result,
      correctCount,
      wrongCount: questions.length - correctCount,
      attemptedList,
    };
  }, [answers, questions, questionPaper, session]);

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const handleAttemptSubmit = () => {
    if (answeredCount < questions.length) {
      setShowUnansweredWarning(true);
      triggerHaptic();
      return;
    }
    executeSubmit();
  };

  const executeSubmit = () => {
    setShowUnansweredWarning(false);
    triggerHaptic();
    setIsSubmitted(true);
    const certNumber = `CERT-COMP-${Math.floor(100000 + Math.random() * 900000)}`;
    setCertificateId(certNumber);

    if (session) {
      submitSessionDigitalTest(
        session.id,
        scoreResult.score,
        scoreResult.total,
        scoreResult.percentage,
        scoreResult.passed ? 'PASSED' : 'FAILED',
        scoreResult.attemptedList,
        scoreResult.passMark
      );
    }

    if (onCompleted) {
      onCompleted();
    }
  };

  const handleRetakeTest = () => {
    triggerHaptic();
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setTimeRemaining(1800);
  };

  const currentQ = questions[currentQuestionIndex];

  // Helper to resolve options for current question
  const currentOptions = useMemo(() => {
    if (!currentQ) return [];
    if (currentQ.options && currentQ.options.length > 0) {
      return currentQ.options.map((opt, idx) => {
        const label = opt.key || opt.label || ['A', 'B', 'C', 'D'][idx];
        return {
          label,
          text: opt.text || '',
          textHindi: opt.textHindi || '',
        };
      });
    }

    const opts = [];
    if (currentQ.optionA) opts.push({ label: 'A', text: currentQ.optionA, textHindi: currentQ.optionAHindi });
    if (currentQ.optionB) opts.push({ label: 'B', text: currentQ.optionB, textHindi: currentQ.optionBHindi });
    if (currentQ.optionC) opts.push({ label: 'C', text: currentQ.optionC, textHindi: currentQ.optionCHindi });
    if (currentQ.optionD) opts.push({ label: 'D', text: currentQ.optionD, textHindi: currentQ.optionDHindi });
    return opts;
  }, [currentQ]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black shadow-lg">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {questionPaper?.title || 'Digital Competency Assessment'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                  v{questionPaper?.version || '1.0'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {session ? `Operator: ${session.employeeName} (${session.employeeCode})` : 'Digital Assessment Engine'} • Pass Mark: {scoreResult.passMark}%
              </p>
            </div>
          </div>

          {/* Top Right Language & Close Controls */}
          <div className="flex items-center gap-2.5">
            {/* Bilingual Selector */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setLanguageMode('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  languageMode === 'en'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode('hi')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  languageMode === 'hi'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode('both')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  languageMode === 'both'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN + हिन्दी
              </button>
            </div>

            {!isSubmitted && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-400">
                <Clock className="w-4 h-4" />
                {formatTime(timeRemaining)}
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Test Body */}
        {!isSubmitted ? (
          <div className="p-4 sm:p-7 flex-1 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div>
              {/* Question Progress Bar & Question Jumpers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>
                    Question <strong className="text-white">{currentQuestionIndex + 1}</strong> of{' '}
                    <strong className="text-white">{questions.length}</strong>
                  </span>
                  <span>
                    Answered: <strong className="text-amber-400">{answeredCount}</strong> / {questions.length}
                    {unansweredCount > 0 && (
                      <span className="text-slate-500 ml-2">({unansweredCount} pending)</span>
                    )}
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>

                {/* Quick Question Jumper Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {questions.map((q, idx) => {
                    const isAnswered = answers[idx] !== undefined;
                    const isCurrent = idx === currentQuestionIndex;
                    return (
                      <button
                        key={q.id || idx}
                        type="button"
                        onClick={() => {
                          triggerHaptic();
                          setCurrentQuestionIndex(idx);
                        }}
                        className={`w-8 h-8 rounded-xl font-bold text-xs shrink-0 transition-all flex items-center justify-center ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 shadow-md'
                            : isAnswered
                            ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Question Box */}
              {currentQ ? (
                <div className="space-y-4 pt-3">
                  <div className="p-4 sm:p-6 bg-slate-850 rounded-2xl border border-slate-800 shadow-md space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300">
                        {currentQ.topic || 'Machine Safety'} • {currentQ.marks || 20} Marks
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Q#{currentQuestionIndex + 1}</span>
                    </div>

                    {/* Question text in chosen language */}
                    <div className="space-y-1.5">
                      {(languageMode === 'en' || languageMode === 'both') && (
                        <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                          {currentQ.questionText}
                        </h3>
                      )}
                      {(languageMode === 'hi' || languageMode === 'both') && currentQ.questionTextHindi && (
                        <h3 className={`text-sm sm:text-base font-semibold text-purple-200 leading-relaxed ${languageMode === 'both' ? 'pt-1 border-t border-slate-700/60' : ''}`}>
                          {currentQ.questionTextHindi}
                        </h3>
                      )}
                    </div>
                  </div>

                  {/* Options Large Radio Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    {currentOptions.map((opt) => {
                      const isSelected = answers[currentQuestionIndex] === opt.label;
                      return (
                        <div
                          key={opt.label}
                          onClick={() => handleSelectAnswer(opt.label)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-950/40 text-white'
                              : 'bg-slate-850/80 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 shadow-md'
                                : 'bg-slate-900 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {opt.label}
                          </div>

                          <div className="space-y-0.5 flex-1">
                            {(languageMode === 'en' || languageMode === 'both') && (
                              <p className="text-sm font-semibold leading-normal">{opt.text}</p>
                            )}
                            {(languageMode === 'hi' || languageMode === 'both') && opt.textHindi && (
                              <p className={`text-xs text-purple-200 font-medium leading-normal ${languageMode === 'both' ? 'text-slate-400' : ''}`}>
                                {opt.textHindi}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">No questions loaded for this paper.</div>
              )}
            </div>

            {/* Bottom Nav Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-3">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => {
                  triggerHaptic();
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() => {
                    triggerHaptic();
                    setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1));
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/40"
                >
                  Next Question <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleAttemptSubmit}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xl shadow-emerald-950/50"
                >
                  <CheckCircle2 className="w-4 h-4" /> Submit &amp; Grade Assessment
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Results View & Permanent Record Trigger */
          <div className="p-4 sm:p-8 flex-1 overflow-y-auto space-y-6">
            {/* Score Banner */}
            <div
              className={`p-6 rounded-3xl border-2 text-center space-y-3 shadow-2xl ${
                scoreResult.passed
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center border-2 shadow-lg">
                {scoreResult.passed ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-rose-400" />
                )}
              </div>

              <div>
                <span
                  className={`inline-block px-3.5 py-1 text-xs font-black uppercase tracking-widest rounded-full mb-2 ${
                    scoreResult.passed
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-950'
                      : 'bg-rose-500 text-white font-black shadow-lg shadow-rose-950'
                  }`}
                >
                  {scoreResult.passed ? '✓ TEST PASSED' : '✕ TEST FAILED'}
                </span>
                <h3 className="text-2xl font-black text-white">
                  {scoreResult.passed ? 'Competency Test Passed • Certified Competent' : 'Passing Mark Not Achieved • Retraining Required'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {scoreResult.passed
                    ? `Score of ${scoreResult.percentage}% meets competency threshold (Pass Mark: ${scoreResult.passMark}%).`
                    : `Score of ${scoreResult.percentage}% is below required ${scoreResult.passMark}%. Automated retraining action triggered.`}
                </p>
              </div>

              {/* Score Breakdown Card */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 grid grid-cols-4 gap-2 text-center max-w-xl mx-auto text-xs">
                <div>
                  <p className="text-slate-400 font-semibold">Score</p>
                  <p className={`text-xl font-black ${scoreResult.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {scoreResult.percentage}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Points</p>
                  <p className="text-xl font-bold text-white">
                    {scoreResult.score} / {scoreResult.total}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Pass Mark</p>
                  <p className="text-xl font-bold text-amber-400">
                    {scoreResult.passMark}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Correct / Wrong</p>
                  <p className="text-base font-bold text-slate-200">
                    <span className="text-emerald-400">{scoreResult.correctCount}</span> / <span className="text-rose-400">{scoreResult.wrongCount}</span>
                  </p>
                </div>
              </div>

              {!scoreResult.passed && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 max-w-md mx-auto flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Requires minimum {scoreResult.passMark}% to pass. Retraining ticket logged in audit timeline.</span>
                </div>
              )}
            </div>

            {/* Questions Review & Explanations */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Assessment Question Review &amp; Explanations
              </h4>

              <div className="space-y-2.5">
                {scoreResult.attemptedList.map((item, idx) => (
                  <div
                    key={item.questionId || idx}
                    className={`p-4 rounded-2xl border text-xs space-y-2 ${
                      item.isCorrect
                        ? 'bg-emerald-950/10 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/10 border-rose-500/30 text-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white">Q{item.questionNumber}: {item.questionText}</span>
                        {item.questionTextHindi && (
                          <p className="text-[11px] text-slate-400">{item.questionTextHindi}</p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] shrink-0 ${
                        item.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {item.isCorrect ? '✓ CORRECT (+20)' : '✕ INCORRECT (0)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] pt-1 border-t border-slate-800/80">
                      <span>Your Answer: <strong className={item.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{item.selectedAnswer}</strong></span>
                      <span>Correct Answer: <strong className="text-emerald-400">{item.correctAnswer}</strong></span>
                    </div>

                    {item.explanation && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                        💡 {item.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              {!scoreResult.passed ? (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRetakeTest}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                  >
                    <RefreshCw className="w-4 h-4" /> Schedule Re-Test (Attempt 2)
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Training Record &amp; Competency Certification generated successfully.</span>
                </div>
              )}

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {session && onViewRecord && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewRecord(session.id);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-md"
                  >
                    <FileText className="w-4 h-4" /> View Full Training Record
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unanswered Questions Warning Modal */}
      {showUnansweredWarning && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">Unanswered Questions Warning</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You have answered <strong className="text-amber-400">{answeredCount}</strong> of <strong className="text-white">{questions.length}</strong> questions.
                There are <strong className="text-rose-400">{unansweredCount} unanswered questions</strong>.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Unanswered questions will receive 0 marks. Do you want to submit anyway?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUnansweredWarning(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Go Back &amp; Review
              </button>
              <button
                type="button"
                onClick={executeSubmit}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-950"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
