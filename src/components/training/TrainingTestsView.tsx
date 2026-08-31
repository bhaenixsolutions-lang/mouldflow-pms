import React, { useState } from 'react';
import {
  HelpCircle,
  Play,
  Plus,
  Clock,
  Award,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Edit3,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TrainingTest, TestQuestion } from '../../types/training';
import { TakeQuizModal } from './TakeQuizModal';
import { normalizePassMark } from '../../utils/assessmentUtils';

export const TrainingTestsView: React.FC = () => {
  const {
    trainingTests,
    trainingMasters,
    saveTrainingTest,
    triggerHaptic,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuizTest, setActiveQuizTest] = useState<TrainingTest | null>(null);
  const [editingTest, setEditingTest] = useState<TrainingTest | null>(null);

  // Filter tests
  const filteredTests = trainingTests.filter((t) => {
    if (
      searchQuery &&
      !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.trainingTitle.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Competency Test & Question Bank
            </h2>
            <p className="text-xs text-slate-400">
              Standardized multiple-choice, true/false & scenario tests for operator qualification
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search competency tests..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className="bg-slate-850 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {normalizePassMark(test.passingPct ?? test.passingScorePct, 80)}% PASS MARK
                </span>
                <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{test.timeLimitMinutes} Mins</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{test.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Linked ID: <span className="text-slate-300 font-medium">{test.trainingTitle || test.trainingId}</span>
                </p>
              </div>

              {/* Questions Sample */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  <span>Questions in Bank ({test.questions.length})</span>
                  <span className="text-cyan-400">Total Marks: {test.questions.reduce((a, q) => a + (q.marks || q.points || 10), 0)}</span>
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  {test.questions.slice(0, 2).map((q, idx) => (
                    <p key={q.id} className="line-clamp-1">
                      <span className="text-amber-400 font-bold">{idx + 1}.</span> {q.question}
                    </p>
                  ))}
                  {test.questions.length > 2 && (
                    <p className="text-[11px] text-slate-500 italic">
                      + {test.questions.length - 2} more questions in bank
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  triggerHaptic();
                  setEditingTest(test);
                }}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400" /> Review Questions
              </button>

              <button
                onClick={() => {
                  triggerHaptic();
                  setActiveQuizTest(test);
                }}
                className="py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-950/50"
              >
                <Play className="w-3.5 h-3.5" /> Launch Quiz Mode
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Modal */}
      {activeQuizTest && (
        <TakeQuizModal
          test={activeQuizTest}
          onClose={() => setActiveQuizTest(null)}
        />
      )}

      {/* Question Bank Viewer Modal */}
      {editingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between p-4 bg-slate-800/90 border-b border-slate-700/80 shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {editingTest.title}
                </h2>
                <p className="text-xs text-slate-400">
                  {editingTest.questions.length} Questions • Time: {editingTest.timeLimitMinutes}m • Pass: {normalizePassMark(editingTest.passingScorePct ?? editingTest.passingPct, 80)}%
                </p>
              </div>
              <button
                onClick={() => setEditingTest(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {editingTest.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2 font-bold text-white">
                    <span>
                      {idx + 1}. {q.question}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-700 font-mono text-cyan-300">
                      +{q.points || 10} pts
                    </span>
                  </div>

                  <div className="space-y-1.5 pl-2">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect =
                        Array.isArray(q.correctAnswer)
                          ? q.correctAnswer.includes(optIdx)
                          : q.correctAnswer === optIdx;

                      return (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-lg border flex items-center gap-2 ${
                            isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-semibold'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                          {isCorrect && <span className="text-[10px] text-emerald-400 font-bold ml-auto">(Correct)</span>}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <p className="text-slate-400 italic bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      💡 <strong>Standard Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => {
                  setActiveQuizTest(editingTest);
                  setEditingTest(null);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> Start Test Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
