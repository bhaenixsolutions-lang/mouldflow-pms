import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
  Sparkles,
  Check,
  FileCheck,
} from 'lucide-react';
import { TrainingTest, TestSubmission } from '../../types/training';
import { useApp } from '../../context/AppContext';
import { normalizePassMark, calculateAssessmentScore } from '../../utils/assessmentUtils';

interface TakeQuizModalProps {
  test: TrainingTest;
  assignmentId?: string;
  onClose: () => void;
  onSuccess?: (submission: TestSubmission) => void;
}

export const TakeQuizModal: React.FC<TakeQuizModalProps> = ({
  test,
  assignmentId,
  onClose,
  onSuccess,
}) => {
  const { currentUser, submitTestResult, triggerHaptic } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | number[]>>({});
  const [timeLeftSec, setTimeLeftSec] = useState<number>(test.timeLimitMinutes * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<TestSubmission | null>(null);
  const [showReview, setShowReview] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (isFinished || timeLeftSec <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished, timeLeftSec]);

  const currentQ = test.questions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
    triggerHaptic();
    if (!currentQ) return;
    if (currentQ.type === 'Multiple') {
      const prev = (selectedAnswers[currentQ.id] as number[]) || [];
      if (prev.includes(optIndex)) {
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQ.id]: prev.filter((i) => i !== optIndex),
        });
      } else {
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQ.id]: [...prev, optIndex],
        });
      }
    } else {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQ.id]: optIndex,
      });
    }
  };

  const normalizedPassMark = normalizePassMark(test.passingScorePct ?? test.passingPct, 80);

  const calculateScore = () => {
    let earnedPoints = 0;
    let totalPoints = 0;
    let correctCount = 0;
    const userAnswersList: any[] = [];

    test.questions.forEach((q) => {
      const qPoints = q.points || q.marks || 10;
      totalPoints += qPoints;
      const userAns = selectedAnswers[q.id];
      let isCorrect = false;

      if (q.type === 'Multiple') {
        const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
        const userArr = Array.isArray(userAns) ? userAns : [];
        if (
          correctArr.length === userArr.length &&
          correctArr.every((v) => userArr.includes(v))
        ) {
          isCorrect = true;
          earnedPoints += qPoints;
          correctCount += 1;
        }
      } else {
        if (userAns === q.correctAnswer) {
          isCorrect = true;
          earnedPoints += qPoints;
          correctCount += 1;
        }
      }

      userAnswersList.push({
        questionId: q.id,
        selectedOption: userAns ?? -1,
        isCorrect,
        pointsEarned: isCorrect ? qPoints : 0,
      });
    });

    const evaluated = calculateAssessmentScore(
      earnedPoints,
      totalPoints,
      normalizedPassMark,
      correctCount,
      test.questions.length
    );

    return {
      earnedPoints: evaluated.score,
      totalPoints: evaluated.totalScore,
      percentage: evaluated.percentage,
      passMark: evaluated.passMark,
      passed: evaluated.isPassed,
      result: evaluated.result,
      userAnswersList,
    };
  };

  const handleSubmitQuiz = () => {
    const { earnedPoints, totalPoints, percentage, passed, passMark, userAnswersList } = calculateScore();
    const submission = submitTestResult({
      testId: test.id,
      trainingId: test.trainingId,
      trainingTitle: test.title,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeCode: currentUser.employeeCode,
      score: earnedPoints,
      totalScore: totalPoints,
      percentage,
      passingScorePct: passMark,
      passMark,
      result: passed ? 'PASSED' : 'FAILED',
      timeSpentSeconds: test.timeLimitMinutes * 60 - timeLeftSec,
      answers: userAnswersList,
    });

    setSubmissionResult(submission);
    setIsFinished(true);
    if (onSuccess) onSuccess(submission);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = test.questions.length;
  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {test.title}
              </h2>
              <p className="text-xs text-slate-400">
                Pass Mark: {normalizedPassMark}% • {totalQuestions} Questions • Candidate: {currentUser.name} ({currentUser.employeeCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {!isFinished ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Quiz Info Strip */}
            <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-semibold text-white">Question {currentIndex + 1}</span> of {totalQuestions}
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400">{answeredCount}/{totalQuestions} Answered</span>
              </div>
              <div
                className={`flex items-center gap-1.5 font-mono font-bold px-2.5 py-1 rounded-lg ${
                  timeLeftSec < 120
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                    : 'bg-slate-700/80 text-amber-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Question Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>

            {/* Active Question Card */}
            {currentQ && (
              <div className="space-y-4">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/70">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-slate-700 text-slate-300">
                      {currentQ.type === 'Multiple' ? 'Multiple Choice' : currentQ.type === 'TrueFalse' ? 'True / False' : 'Single Choice'}
                    </span>
                    <span className="text-xs text-amber-400 font-medium">+{currentQ.points || 10} Points</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed">
                    {currentQ.question}
                  </h3>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected =
                      currentQ.type === 'Multiple'
                        ? ((selectedAnswers[currentQ.id] as number[]) || []).includes(idx)
                        : selectedAnswers[currentQ.id] === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-950/30'
                            : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 border ${
                            isSelected
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                              : 'border-slate-600 text-slate-400'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-sm sm:text-base leading-snug flex-1 font-medium">
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Question Quick Jump Badges */}
            <div className="pt-2 border-t border-slate-800">
              <p className="text-xs text-slate-400 mb-2 font-medium">Question Navigator:</p>
              <div className="flex flex-wrap gap-1.5">
                {test.questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? 'ring-2 ring-emerald-400 bg-slate-800 text-white'
                          : isAnswered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Result Screen */
          <div className="flex-1 overflow-y-auto p-6 text-center space-y-6">
            <div className="max-w-md mx-auto space-y-4">
              <div
                className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center border-2 ${
                  submissionResult?.result === 'PASSED'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-xl shadow-emerald-950/50'
                    : 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-xl shadow-rose-950/50'
                }`}
              >
                {submissionResult?.result === 'PASSED' ? (
                  <Sparkles className="w-10 h-10 animate-bounce" />
                ) : (
                  <AlertTriangle className="w-10 h-10" />
                )}
              </div>

              <div>
                <span
                  className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full mb-2 ${
                    submissionResult?.result === 'PASSED'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-rose-500 text-white font-bold'
                  }`}
                >
                  {submissionResult?.result === 'PASSED' ? 'TEST PASSED' : 'TEST FAILED'}
                </span>
                <h3 className="text-2xl font-black text-white">
                  {submissionResult?.result === 'PASSED'
                    ? 'Competency Test Passed!'
                    : 'Passing Mark Not Achieved'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {submissionResult?.result === 'PASSED'
                    ? `Your test score meets standard manufacturing compliance requirements (Pass Mark: ${submissionResult?.passingScorePct ?? normalizedPassMark}%).`
                    : `Requires minimum ${submissionResult?.passingScorePct ?? normalizedPassMark}% to pass. A refresher or re-test is recommended.`}
                </p>
              </div>

              {/* Score Breakdown Card */}
              <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/80 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-slate-400">Score</p>
                  <p className={`text-xl font-black ${submissionResult?.result === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {submissionResult?.percentage}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Points</p>
                  <p className="text-xl font-bold text-white">
                    {submissionResult?.score} / {submissionResult?.totalScore}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Pass Mark</p>
                  <p className="text-xl font-bold text-amber-400">
                    {submissionResult?.passingScorePct ?? normalizedPassMark}%
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setShowReview(!showReview)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  {showReview ? 'Hide Question Review' : 'Review Answer Key'}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40"
                >
                  Done & Continue
                </button>
              </div>

              {/* Question Review Section */}
              {showReview && submissionResult && (
                <div className="text-left space-y-4 pt-4 border-t border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Question-by-Question Analysis
                  </h4>
                  <div className="space-y-3">
                    {test.questions.map((q, qIdx) => {
                      const userAnsRec = submissionResult.answers.find((a) => a.questionId === q.id);
                      const isCorrect = userAnsRec?.isCorrect;

                      return (
                        <div
                          key={q.id}
                          className={`p-3.5 rounded-xl border text-xs ${
                            isCorrect
                              ? 'bg-emerald-950/20 border-emerald-500/30'
                              : 'bg-rose-950/20 border-rose-500/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 font-semibold text-slate-200 mb-2">
                            <span>
                              {qIdx + 1}. {q.question}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded font-mono font-bold ${
                                isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {isCorrect ? '+10' : '0'}
                            </span>
                          </div>
                          <div className="space-y-1 text-slate-300">
                            <p>
                              <span className="text-slate-400">Correct Answer:</span>{' '}
                              <strong className="text-emerald-400">
                                {Array.isArray(q.correctAnswer)
                                  ? q.correctAnswer.map((i) => q.options[i]).join(', ')
                                  : q.options[q.correctAnswer]}
                              </strong>
                            </p>
                            {q.explanation && (
                              <p className="text-slate-400 italic bg-slate-900/60 p-2 rounded mt-1 border border-slate-800">
                                💡 {q.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        {!isFinished && (
          <div className="p-4 bg-slate-800/80 border-t border-slate-700/80 flex items-center justify-between shrink-0">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-all"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="px-6 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all"
              >
                Submit Test <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
