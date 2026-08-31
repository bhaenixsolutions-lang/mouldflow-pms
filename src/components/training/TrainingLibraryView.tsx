import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Clock,
  Award,
  Layers,
  FileText,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Video,
  Shield,
  Cpu,
  Zap,
  Play,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TrainingMaster, TrainingCategory } from '../../types/training';
import { TakeQuizModal } from './TakeQuizModal';
import { AssignTrainingModal } from './AssignTrainingModal';

export const TrainingLibraryView: React.FC = () => {
  const {
    trainingMasters,
    trainingTests,
    departments,
    machines,
    addTrainingMaster,
    currentUser,
    triggerHaptic,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDetailModule, setActiveDetailModule] = useState<TrainingMaster | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quizToTake, setQuizToTake] = useState<TrainingMaster | null>(null);
  const [assignModule, setAssignModule] = useState<TrainingMaster | null>(null);

  // New module form state
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState<TrainingCategory>('Machine Operation');
  const [newType, setNewType] = useState<TrainingMaster['trainingType']>('Blended');
  const [newDuration, setNewDuration] = useState(60);
  const [newSopDoc, setNewSopDoc] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSteps, setNewSteps] = useState('1. Inspect machine guards and hydraulic oil level.\n2. Power on heaters and wait for barrel soak temperature.\n3. Verify tool clamp pressure before manual stroke.\n4. Run 3 purge shots to clear residual degraded resin.');

  const categories: TrainingCategory[] = [
    'Machine Operation',
    'Safety & EHS',
    'Quality & Defects',
    'Process & Moulding SOP',
    'Maintenance & Mold Change',
    'Material & 5S',
    'Supervisor Leadership',
  ];

  const filteredMasters = trainingMasters.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCode) return;

    const stepsArray = newSteps.split('\n').filter((s) => s.trim().length > 0);

    addTrainingMaster({
      code: newCode,
      title: newTitle,
      category: newCategory,
      trainingType: newType,
      targetRole: ['Operator', 'Senior Operator'],
      durationMinutes: Number(newDuration) || 60,
      passingScorePct: 80,
      validityPeriodMonths: 12,
      isMachineSpecific: newCategory === 'Machine Operation',
      sopDocumentNumber: newSopDoc || `SOP-MFG-${newCode}`,
      sopVersion: 'v1.0',
      description: newDesc || 'Standard shopfloor operating and safety compliance training.',
      learningObjectives: [
        'Understand safety protocols and emergency stops',
        'Operate machinery within standard tolerance windows',
        'Identify defects and initiate immediate containment',
      ],
      practicalCheckpoints: stepsArray,
      attachments: [
        { id: 'att-1', name: `${newCode} Standard Operating Procedure PDF`, type: 'pdf', url: '#' },
      ],
      isActive: true,
      authorName: currentUser.name,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewCode('');
    setNewDesc('');
  };

  const getCategoryIcon = (cat: TrainingCategory) => {
    switch (cat) {
      case 'Safety & EHS':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'Machine Operation':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'Quality & Defects':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'Process & Moulding SOP':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'Maintenance & Mold Change':
        return <Layers className="w-4 h-4 text-orange-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Actions Bar */}
      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              Standard Training & SOP Library
            </h2>
            <p className="text-xs text-slate-400">
              Interactive Standard Operating Procedures (SOP), Safety Modules, Quality Defect Catalogues & Tests
            </p>
          </div>

          <button
            onClick={() => {
              triggerHaptic();
              setShowCreateModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50"
          >
            <Plus className="w-4 h-4" /> Create New Module
          </button>
        </div>

        {/* Categories Pill Strip & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search training title, SOP number, or keywords..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 sm:w-64"
          >
            <option value="all">All Categories ({trainingMasters.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c} ({trainingMasters.filter((t) => t.category === c).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMasters.map((m) => {
          const test = trainingTests.find((t) => t.trainingId === m.id);

          return (
            <div
              key={m.id}
              className="bg-slate-850 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg group"
            >
              <div className="space-y-3">
                {/* Badge Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
                    {getCategoryIcon(m.category)}
                    <span>{m.category}</span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800">
                    {m.code}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-amber-300 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                {/* SOP Info & Duration */}
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-[11px] grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500 block">SOP Ref:</span>
                    <span className="font-mono font-bold text-slate-200">{m.sopDocumentNumber || 'SOP-01'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duration & Mode:</span>
                    <span className="font-semibold text-slate-200">
                      {m.durationMinutes}m • {m.trainingType}
                    </span>
                  </div>
                </div>

                {/* Checkpoints snippet */}
                {m.practicalCheckpoints && m.practicalCheckpoints.length > 0 && (
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                      Core Checkpoints ({m.practicalCheckpoints.length})
                    </p>
                    <p className="line-clamp-1 italic">
                      • {m.practicalCheckpoints[0]}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    triggerHaptic();
                    setActiveDetailModule(m);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" /> Read SOP
                </button>

                {test && (
                  <button
                    onClick={() => {
                      triggerHaptic();
                      setQuizToTake(m);
                    }}
                    className="py-2 px-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" /> Test ({test.questions.length}Q)
                  </button>
                )}

                <button
                  onClick={() => {
                    triggerHaptic();
                    setAssignModule(m);
                  }}
                  title="Assign to Operator"
                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Module Detail & SOP Reader Modal */}
      {activeDetailModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between p-4 bg-slate-800/90 border-b border-slate-700/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {activeDetailModule.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Code: {activeDetailModule.code} • SOP: {activeDetailModule.sopDocumentNumber} • Version: {activeDetailModule.sopVersion || 'v1.0'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDetailModule(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Objective Banner */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Course & Operational Objective
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {activeDetailModule.description}
                </p>
              </div>

              {/* Learning Objectives List */}
              {activeDetailModule.learningObjectives && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Key Learning Outcomes
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeDetailModule.learningObjectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Step-by-Step SOP Standard Instructions */}
              {activeDetailModule.practicalCheckpoints && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Standard Operating Procedure & Checkpoints
                  </h4>
                  <div className="space-y-2">
                    {activeDetailModule.practicalCheckpoints.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/70 text-xs flex items-start gap-3"
                      >
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-slate-200 font-medium leading-relaxed">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => {
                  setAssignModule(activeDetailModule);
                  setActiveDetailModule(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Assign To Operators
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Module Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between p-4 bg-slate-800/90 border-b border-slate-700/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Create New Training Master
                  </h2>
                  <p className="text-xs text-slate-400">
                    Add new standard operating course, SOP procedure, or safety protocol
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Course Code (e.g. TRN-MOLD-04)
                  </label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="TRN-MOLD-04"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Training Title / SOP Name
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g., Toshiba EC-180SX Fast Mold Clamping & Barrel Soak SOP"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    SOP Number
                  </label>
                  <input
                    type="text"
                    value={newSopDoc}
                    onChange={(e) => setNewSopDoc(e.target.value)}
                    placeholder="SOP-IMM-104"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Training Mode
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Blended">Blended (Theory + Practical)</option>
                    <option value="Online SOP">Online SOP Reading + Quiz</option>
                    <option value="Classroom">Classroom & Lecture</option>
                    <option value="On-the-Job">On-the-Job Practical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Description & Operational Scope
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Outline the operational purpose and mandatory operator qualification standards..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  SOP Steps & Practical Checkpoints (One per line)
                </label>
                <textarea
                  rows={4}
                  value={newSteps}
                  onChange={(e) => setNewSteps(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg"
                >
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {quizToTake && (
        <TakeQuizModal
          test={trainingTests.find((t) => t.trainingId === quizToTake.id)!}
          onClose={() => setQuizToTake(null)}
        />
      )}

      {/* Assign Modal */}
      {assignModule && (
        <AssignTrainingModal
          preselectedTrainingId={assignModule.id}
          onClose={() => setAssignModule(null)}
        />
      )}
    </div>
  );
};
