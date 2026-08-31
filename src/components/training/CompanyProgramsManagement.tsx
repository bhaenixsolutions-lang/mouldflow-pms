import React, { useState, useMemo } from 'react';
import {
  Building,
  Plus,
  BookOpen,
  Award,
  Layers,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Edit3,
  Trash2,
  HelpCircle,
  FileText,
  Upload,
  Camera,
  Cpu,
  ShieldCheck,
  Zap,
  Filter,
  Search,
  ChevronRight,
  GitBranch,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CompanyTrainingProgram, CompanyTrainingCategory } from '../../types/training';

interface CompanyProgramsManagementProps {
  onOpenOcrStudio?: (programId?: string) => void;
  onOpenSignOff?: (programId?: string) => void;
  onOpenDigitalTest?: (programId?: string) => void;
}

export const CompanyProgramsManagement: React.FC<CompanyProgramsManagementProps> = ({
  onOpenOcrStudio,
  onOpenSignOff,
  onOpenDigitalTest,
}) => {
  const {
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    companyTrainingPrograms,
    companyQuestionPapers,
    trainingSignOffSessions,
    addCompanyTrainingProgram,
    updateCompanyTrainingProgram,
    deleteCompanyTrainingProgram,
    createNewPaperVersion,
    triggerHaptic,
    machines,
    departments,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<CompanyTrainingProgram | null>(null);

  // New Version Modal
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionTargetProgram, setVersionTargetProgram] = useState<CompanyTrainingProgram | null>(null);
  const [newVersionInput, setNewVersionInput] = useState('1.1');
  const [versionNotesInput, setVersionNotesInput] = useState('');

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    programId: '',
    programName: '',
    trainingCategory: 'Operator Training' as CompanyTrainingCategory,
    department: 'dept-moulding',
    description: '',
    version: 'v1.0',
    applicableMachine: ['IMM-01', 'IMM-02', 'All'],
    applicableDesignation: ['Operator', 'Senior Operator'],
    trainingDuration: 45,
    durationUnit: 'minutes' as 'minutes' | 'hours',
    trainer: 'Rajesh Sharma',
    validity: 12,
    passingPercentage: 80,
  });

  // Current company
  const currentCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  // Filter programs by company and search query
  const filteredPrograms = useMemo(() => {
    return companyTrainingPrograms.filter((p) => {
      const matchCompany = !p.companyId || p.companyId === selectedCompanyId;
      const matchCategory = selectedCategory === 'ALL' || p.trainingCategory === selectedCategory;
      const matchSearch =
        !searchQuery ||
        p.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.programId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCompany && matchCategory && matchSearch;
    });
  }, [companyTrainingPrograms, selectedCompanyId, selectedCategory, searchQuery]);

  const categories: CompanyTrainingCategory[] = [
    'Operator Training',
    'Safety Training',
    'Quality Training',
    'Machine Training',
    'Process Training',
    'New Employee Training',
    'Refresher Training',
    'Skill Upgrade',
    'Retraining',
    'Company Custom Training',
  ];

  const handleOpenCreate = () => {
    setEditingProgram(null);
    setFormData({
      programId: `CP-${currentCompany.code}-${Math.floor(100 + Math.random() * 900)}`,
      programName: '',
      trainingCategory: 'Operator Training',
      department: 'dept-moulding',
      description: '',
      version: 'v1.0',
      applicableMachine: ['IMM-01', 'IMM-02'],
      applicableDesignation: ['Operator', 'Senior Operator'],
      trainingDuration: 45,
      durationUnit: 'minutes',
      trainer: 'Rajesh Sharma',
      validity: 12,
      passingPercentage: 80,
    });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (program: CompanyTrainingProgram) => {
    setEditingProgram(program);
    setFormData({
      programId: program.programId,
      programName: program.programName,
      trainingCategory: program.trainingCategory,
      department: program.department,
      description: program.description || '',
      version: program.version,
      applicableMachine: program.applicableMachine || [],
      applicableDesignation: program.applicableDesignation || [],
      trainingDuration: program.trainingDuration,
      durationUnit: program.durationUnit || 'minutes',
      trainer: program.trainer,
      validity: program.validity,
      passingPercentage: program.passingPercentage,
    });
    setShowCreateModal(true);
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.programName) return;

    if (editingProgram) {
      updateCompanyTrainingProgram(editingProgram.id, {
        programName: formData.programName,
        trainingCategory: formData.trainingCategory,
        department: formData.department,
        description: formData.description,
        applicableMachine: formData.applicableMachine,
        applicableDesignation: formData.applicableDesignation,
        trainingDuration: Number(formData.trainingDuration),
        durationUnit: formData.durationUnit,
        trainer: formData.trainer,
        validity: Number(formData.validity),
        passingPercentage: Number(formData.passingPercentage),
      });
    } else {
      addCompanyTrainingProgram({
        companyId: selectedCompanyId,
        programId: formData.programId,
        programName: formData.programName,
        trainingCategory: formData.trainingCategory,
        department: formData.department,
        description: formData.description,
        version: formData.version,
        applicableMachine: formData.applicableMachine,
        applicableDesignation: formData.applicableDesignation,
        trainingDuration: Number(formData.trainingDuration),
        durationUnit: formData.durationUnit,
        trainer: formData.trainer,
        validity: Number(formData.validity),
        passingPercentage: Number(formData.passingPercentage),
        status: 'Active',
        createdBy: 'Quality Dept',
      });
    }

    setShowCreateModal(false);
    triggerHaptic();
  };

  const handleCreateVersionSubmit = () => {
    if (!versionTargetProgram || !versionTargetProgram.questionPaperId) return;
    try {
      createNewPaperVersion(
        versionTargetProgram.questionPaperId,
        newVersionInput,
        `${versionTargetProgram.programName} Assessment Paper (Rev ${newVersionInput})`
      );
      setShowVersionModal(false);
      triggerHaptic();
    } catch (err) {
      console.error('Failed to create new version', err);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Company Switcher Banner */}
      <div className="bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-black text-white">
                Company Custom Training Programs & SOPs
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict multi-tenant company data isolation • Version-controlled question papers & custom syllabi
            </p>
          </div>

          {/* Company Picker */}
          <div className="flex items-center gap-3 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80">
            <span className="text-xs font-bold text-slate-400 pl-2">Organization:</span>
            <div className="flex items-center gap-1">
              {companies.map((cmp) => {
                const isSelected = selectedCompanyId === cmp.id;
                return (
                  <button
                    key={cmp.id}
                    onClick={() => {
                      triggerHaptic();
                      setSelectedCompanyId(cmp.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cmp.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search programs in ${currentCompany.name}...`}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/40"
            >
              <Plus className="w-4 h-4" /> Create Company Program
            </button>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({companyTrainingPrograms.filter((p) => !p.companyId || p.companyId === selectedCompanyId).length})
          </button>
          {categories.map((cat) => {
            const count = companyTrainingPrograms.filter(
              (p) => (!p.companyId || p.companyId === selectedCompanyId) && p.trainingCategory === cat
            ).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPrograms.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-slate-850 rounded-2xl border border-slate-800 text-slate-400 space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-slate-500" />
            <p className="font-bold text-sm">No training programs found for {currentCompany.name}</p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md"
            >
              + Create First Company Training Program
            </button>
          </div>
        ) : (
          filteredPrograms.map((prog) => {
            const linkedPaper = companyQuestionPapers.find(
              (qp) => qp.id === prog.questionPaperId || qp.trainingProgramId === prog.id
            );

            const progSessions = trainingSignOffSessions.filter(
              (s) => s.trainingProgramId === prog.id
            );
            const trainedCount = progSessions.filter((s) => s.competencyResult === 'Competent').length;

            return (
              <div
                key={prog.id}
                className="bg-slate-850 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 space-y-4 shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar with Badge and Version */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-slate-900 text-amber-400 border border-slate-700">
                        {prog.programId}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-950/70 text-purple-300 border border-purple-800/50 flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        {prog.version}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {prog.trainingCategory}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(prog)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Edit Program Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete training program "${prog.programName}"?`)) {
                            deleteCompanyTrainingProgram(prog.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete Program"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-2.5">
                    <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
                      {prog.programName}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{prog.description}</p>
                  </div>

                  {/* Program Specs Metadata */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs mt-3">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">Duration</span>
                      <span className="font-extrabold text-white">{prog.trainingDuration} {prog.durationUnit}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">Pass Criteria</span>
                      <span className="font-extrabold text-emerald-400">{prog.passingPercentage}% Min</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">Validity</span>
                      <span className="font-extrabold text-slate-300">{prog.validity} Months</span>
                    </div>
                  </div>

                  {/* Linked Question Paper Status */}
                  <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-[11px]">
                            {linkedPaper ? linkedPaper.title : 'No Question Paper Linked'}
                          </span>
                          {linkedPaper && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-900/40 text-purple-300 border border-purple-700/40">
                              v{linkedPaper.version}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {linkedPaper
                            ? `${linkedPaper.questions.length} Questions extracted • Status: ${linkedPaper.ocrStatus}`
                            : 'Upload physical test sheet or PDF to extract via OCR'}
                        </p>
                      </div>
                    </div>

                    {linkedPaper && (
                      <button
                        onClick={() => {
                          setVersionTargetProgram(prog);
                          setNewVersionInput(
                            (parseFloat(linkedPaper.version) + 0.1).toFixed(1)
                          );
                          setShowVersionModal(true);
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold text-purple-300 bg-purple-950/60 hover:bg-purple-900/60 rounded-lg border border-purple-800/60 flex items-center gap-1 shrink-0"
                      >
                        <GitBranch className="w-3 h-3" /> New Rev
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400">
                    Trained: <strong className="text-white">{trainedCount}</strong> operators
                  </span>

                  <div className="flex items-center gap-2">
                    {onOpenOcrStudio && (
                      <button
                        onClick={() => {
                          triggerHaptic();
                          onOpenOcrStudio(prog.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-purple-950/40"
                      >
                        <Upload className="w-3.5 h-3.5" /> Paper OCR
                      </button>
                    )}

                    {onOpenSignOff && (
                      <button
                        onClick={() => {
                          triggerHaptic();
                          onOpenSignOff(prog.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-950/40"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Sign-Off
                      </button>
                    )}

                    {onOpenDigitalTest && (
                      <button
                        onClick={() => {
                          triggerHaptic();
                          onOpenDigitalTest(prog.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-sky-950/40"
                      >
                        <HelpCircle className="w-3.5 h-3.5" /> Test Engine
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Program Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">
                  {editingProgram ? 'Edit Company Training Program' : 'Create Custom Training Program'}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Program ID / Code</label>
                  <input
                    type="text"
                    required
                    value={formData.programId}
                    onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.trainingCategory}
                    onChange={(e) => setFormData({ ...formData, trainingCategory: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
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
                <label className="block font-bold text-slate-300 mb-1">Program Name / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Injection Moulding Machine Operation & Safety SOP"
                  value={formData.programName}
                  onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  placeholder="Describe prerequisites, machine safety procedures, and competency milestones..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.trainingDuration}
                    onChange={(e) => setFormData({ ...formData, trainingDuration: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Passing Score (%)</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={formData.passingPercentage}
                    onChange={(e) => setFormData({ ...formData, passingPercentage: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Validity (Months)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.validity}
                    onChange={(e) => setFormData({ ...formData, validity: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Attach Question Paper via Vision OCR</h5>
                    <p className="text-[11px] text-slate-400">Scan printed/handwritten test sheets or upload PDF/JPG with bilingual translations</p>
                  </div>
                </div>
                {onOpenOcrStudio && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      onOpenOcrStudio(editingProgram?.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" /> Import Question Paper
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg"
                >
                  {editingProgram ? 'Save Changes' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Version Revision Modal */}
      {showVersionModal && versionTargetProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-extrabold text-white">
                Create Question Paper Revision
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Generate a new revision of the question paper for <strong>{versionTargetProgram.programName}</strong>. Old attempts will stay linked to previous versions for compliance.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">New Version Number</label>
                <input
                  type="text"
                  value={newVersionInput}
                  onChange={(e) => setNewVersionInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Revision Changelog Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Added 2 questions on IATF 16949 visual check protocols..."
                  value={versionNotesInput}
                  onChange={(e) => setVersionNotesInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowVersionModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateVersionSubmit}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg"
              >
                Confirm Revision {newVersionInput}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
