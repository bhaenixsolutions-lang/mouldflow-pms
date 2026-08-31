import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Department,
  Shift,
  Machine,
  ProductMould,
  ProductionReport,
  HourlyReportEntry,
  RejectionLogItem,
  DowntimeLogItem,
  MonthlyProductionPlan,
  InventoryItem,
  MachinePlanningSlot,
  ManpowerAllocation,
  DailySummary,
  AuditLogEntry,
  AIRecommendation,
  OCRScanResult,
  RejectionDefectType,
  DowntimeCategoryType,
} from '../types/schema';
import {
  TrainingMaster,
  TrainingTest,
  TrainingAssignment,
  PracticalCompetencyEvaluation,
  ShopfloorMonitoringRecord,
  CorrectiveTrainingRecord,
  TrainingAttendance,
  TestSubmission,
  Company,
  CompanyTrainingProgram,
  CompanyQuestionPaper,
  TrainingSignOffSession,
} from '../types/training';
import {
  PPCRequirementDocument,
  PPCRequirementItem,
  ProductionPlanRecord,
  PPCPlantCapacitySettings,
} from '../types/ppc';
import {
  SEED_PPC_CAPACITY_SETTINGS,
  SEED_PPC_REQUIREMENT_DOCS,
  SEED_PRODUCTION_PLANS,
} from '../data/ppcSeedData';
import {
  SEED_DEPARTMENTS,
  SEED_SHIFTS,
  SEED_USERS,
  SEED_MACHINES,
  SEED_PRODUCTS,
  SEED_DEFECTS,
  SEED_DOWNTIME_CATEGORIES,
  SEED_HOURLY_ENTRIES,
  SEED_REJECTIONS,
  SEED_DOWNTIMES,
  SEED_MONTHLY_PLANS,
  SEED_INVENTORY,
  SEED_MACHINE_SLOTS,
  SEED_MANPOWER,
  SEED_DAILY_SUMMARIES,
  SEED_AUDIT_LOGS,
  SEED_AI_RECOMMENDATIONS,
} from '../data/seedData';
import {
  SEED_TRAINING_MASTERS,
  SEED_TRAINING_TESTS,
  SEED_TRAINING_ASSIGNMENTS,
  SEED_PRACTICAL_EVALUATIONS,
  SEED_SHOPFLOOR_MONITORING,
  SEED_CORRECTIVE_TRAINING,
  SEED_TRAINING_ATTENDANCE,
} from '../data/trainingSeedData';
import {
  SEED_COMPANIES,
  ADDITIONAL_SEED_OPERATORS,
  SEED_COMPANY_TRAINING_PROGRAMS,
  SEED_COMPANY_QUESTION_PAPERS,
  SEED_TRAINING_SIGN_OFF_SESSIONS,
} from '../data/companyTrainingSeedData';
import { normalizePassMark, calculateAssessmentScore } from '../utils/assessmentUtils';

export type ActiveModule =
  | 'dashboard'
  | 'machines'
  | 'products'
  | 'staff'
  | 'departments'
  | 'shifts'
  | 'hourly-reports'
  | 'rejections'
  | 'downtime'
  | 'production-planning'
  | 'monthly-planning'
  | 'inventory'
  | 'machine-planning'
  | 'manpower-planning'
  | 'daily-summary'
  | 'monthly-analytics'
  | 'product-machine-analysis'
  | 'operator-monitoring'
  | 'supervisor-monitoring'
  | 'ai-recommendations'
  | 'approvals'
  | 'audit-logs'
  | 'admin'
  | 'training'
  | 'training-competency';

interface AppContextType {
  // Navigation & Session
  activeModule: ActiveModule;
  setActiveModule: (mod: ActiveModule) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  activeShift: Shift;
  setActiveShift: (shift: Shift) => void;
  selectedDepartmentId: string; // 'all' or departmentId
  setSelectedDepartmentId: (deptId: string) => void;
  
  // Data Collections
  departments: Department[];
  shifts: Shift[];
  users: User[];
  machines: Machine[];
  products: ProductMould[];
  defects: RejectionDefectType[];
  downtimeCategories: DowntimeCategoryType[];
  reports: ProductionReport[];
  rejections: RejectionLogItem[];
  downtimes: DowntimeLogItem[];
  monthlyPlans: MonthlyProductionPlan[];
  inventory: InventoryItem[];
  machineSlots: MachinePlanningSlot[];
  manpower: ManpowerAllocation[];
  dailySummaries: DailySummary[];
  auditLogs: AuditLogEntry[];
  aiRecommendations: AIRecommendation[];
  ocrScanHistory: OCRScanResult[];

  // Training & Competency Collections
  trainingMasters: TrainingMaster[];
  trainingTests: TrainingTest[];
  trainingAssignments: TrainingAssignment[];
  practicalEvaluations: PracticalCompetencyEvaluation[];
  shopfloorMonitoringRecords: ShopfloorMonitoringRecord[];
  correctiveTrainingRecords: CorrectiveTrainingRecord[];
  trainingAttendance: TrainingAttendance[];
  testSubmissions: TestSubmission[];

  // Company Custom Training, OCR Papers & Audit Sessions
  companies: Company[];
  selectedCompanyId: string;
  setSelectedCompanyId: (companyId: string) => void;
  companyTrainingPrograms: CompanyTrainingProgram[];
  companyQuestionPapers: CompanyQuestionPaper[];
  trainingSignOffSessions: TrainingSignOffSession[];

  // Production Planning & PPC Collections
  ppcRequirementDocs: PPCRequirementDocument[];
  productionPlans: ProductionPlanRecord[];
  ppcCapacitySettings: PPCPlantCapacitySettings;
  
  // Actions
  addAuditLog: (action: AuditLogEntry['action'], module: string, entityId: string, description: string, details?: any) => void;
  saveProductionReport: (report: ProductionReport) => void;
  updateReportStatus: (reportId: string, status: ProductionReport['status'], remarks?: string) => void;
  addHourlyEntryToReport: (reportId: string, entry: HourlyReportEntry) => void;
  addRejection: (item: Omit<RejectionLogItem, 'id'>) => void;
  addDowntime: (item: Omit<DowntimeLogItem, 'id'>) => void;
  resolveDowntime: (id: string, actionTaken: string) => void;
  updateMachineStatus: (machineId: string, status: Machine['status']) => void;
  updateInventoryStock: (itemId: string, deltaQty: number, type: 'IN' | 'OUT' | 'ADJUST', remarks?: string) => void;
  updateMonthlyPlan: (plan: MonthlyProductionPlan) => void;
  addMonthlyPlan: (plan: Omit<MonthlyProductionPlan, 'id'>) => void;
  signDailySummary: (summaryId: string, role: 'Supervisor' | 'Production Manager') => void;
  applyOcrResultToReport: (scan: OCRScanResult) => ProductionReport;
  
  // Training & Competency Actions
  addTrainingMaster: (training: Omit<TrainingMaster, 'id' | 'createdAt' | 'updatedAt'>) => TrainingMaster;
  updateTrainingMaster: (id: string, updates: Partial<TrainingMaster>) => void;
  deleteTrainingMaster: (id: string) => void;
  assignTraining: (assignments: Omit<TrainingAssignment, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  updateTrainingAssignment: (id: string, updates: Partial<TrainingAssignment>) => void;
  markTrainingContentCompleted: (assignmentId: string) => void;
  submitTestResult: (submission: Omit<TestSubmission, 'id' | 'submittedAt'>) => TestSubmission;
  submitPracticalEvaluation: (evalData: Omit<PracticalCompetencyEvaluation, 'id' | 'createdAt' | 'updatedAt'>) => PracticalCompetencyEvaluation;
  submitShopfloorMonitoring: (monitoringData: Omit<ShopfloorMonitoringRecord, 'id' | 'createdAt' | 'updatedAt'>) => ShopfloorMonitoringRecord;
  addCorrectiveTraining: (record: Omit<CorrectiveTrainingRecord, 'id' | 'createdAt' | 'updatedAt'>) => CorrectiveTrainingRecord;
  updateCorrectiveTraining: (id: string, updates: Partial<CorrectiveTrainingRecord>) => void;
  saveTrainingAttendance: (attendance: Omit<TrainingAttendance, 'id'>) => void;
  saveTrainingTest: (test: TrainingTest) => void;
  isOperatorQualifiedForMachine: (operatorId: string, machineId: string) => { qualified: boolean; reason?: string };

  // Company Training & Versioned Question Paper Actions
  addCompanyTrainingProgram: (program: Omit<CompanyTrainingProgram, 'id' | 'createdDate'>) => CompanyTrainingProgram;
  updateCompanyTrainingProgram: (id: string, updates: Partial<CompanyTrainingProgram>) => void;
  deleteCompanyTrainingProgram: (id: string) => void;
  importCompanyQuestionPaper: (paper: Omit<CompanyQuestionPaper, 'id' | 'createdAt' | 'updatedAt'>) => CompanyQuestionPaper;
  updateCompanyQuestionPaper: (id: string, updates: Partial<CompanyQuestionPaper>) => void;
  approveQuestionPaper: (id: string, approvedBy: string) => void;
  createNewPaperVersion: (basePaperId: string, newVersion: string, title?: string) => CompanyQuestionPaper;
  
  // Sign-Offs & Audit Sessions
  createTrainingSignOffSession: (sessionData: Omit<TrainingSignOffSession, 'id' | 'createdAt' | 'updatedAt'>) => TrainingSignOffSession;
  signTrainerPreTraining: (sessionId: string, signatureData: string, observations?: string) => void;
  signOperatorAcknowledgement: (sessionId: string, signatureData: string) => void;
  submitSessionDigitalTest: (
    sessionId: string,
    score: number,
    maxScore: number,
    percentage: number,
    result: 'PASSED' | 'FAILED',
    answers: any[],
    passMark?: number
  ) => TrainingSignOffSession;

  // PPC Actions
  addPPCRequirementDoc: (doc: Omit<PPCRequirementDocument, 'id' | 'uploadedAt'>) => PPCRequirementDocument;
  updatePPCRequirementDoc: (doc: PPCRequirementDocument) => void;
  deletePPCRequirementDoc: (id: string) => void;
  addProductionPlan: (plan: Omit<ProductionPlanRecord, 'id' | 'createdAt' | 'updatedAt' | 'planNumber'>) => ProductionPlanRecord;
  updateProductionPlan: (plan: ProductionPlanRecord) => void;
  deleteProductionPlan: (id: string) => void;
  approveProductionPlan: (id: string, approverName: string) => void;
  rejectProductionPlan: (id: string, reason: string) => void;
  updatePPCCapacitySettings: (settings: PPCPlantCapacitySettings) => void;
  replanForMachineBreakdown: (machineCode: string, alternateMachineId: string) => void;
  generatePlansFromRequirementDoc: (docId: string, itemIds?: string[]) => ProductionPlanRecord[];

  triggerHaptic: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'im_mfg_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Filter States
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('all');

  // Load or Seed Users (Merged with Additional Shopfloor Operators)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}users`);
    if (saved) {
      const parsed: User[] = JSON.parse(saved);
      // Ensure all seed operators are present
      const missing = ADDITIONAL_SEED_OPERATORS.filter((ao) => !parsed.some((u) => u.id === ao.id));
      if (missing.length > 0) {
        return [...parsed, ...missing];
      }
      return parsed;
    }
    return [...SEED_USERS, ...ADDITIONAL_SEED_OPERATORS];
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem(`${STORAGE_PREFIX}currentUserId`);
    const found = users.find((u) => u.id === savedId);
    return found || users[0]; // Default to Operator (Ramesh Kumar)
  });

  // Multi-Tenant Companies
  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}companies`);
    return saved ? JSON.parse(saved) : SEED_COMPANIES;
  });

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}selectedCompanyId`);
    return saved || 'cmp-apex';
  });

  // Shifts
  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}shifts`);
    return saved ? JSON.parse(saved) : SEED_SHIFTS;
  });

  const [activeShift, setActiveShift] = useState<Shift>(() => {
    return shifts.find((s) => s.isActive) || shifts[0];
  });

  // Departments
  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}departments`);
    return saved ? JSON.parse(saved) : SEED_DEPARTMENTS;
  });

  // Machines
  const [machines, setMachines] = useState<Machine[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}machines`);
    return saved ? JSON.parse(saved) : SEED_MACHINES;
  });

  // Products
  const [products, setProducts] = useState<ProductMould[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}products`);
    return saved ? JSON.parse(saved) : SEED_PRODUCTS;
  });

  // Defects & Downtimes Catalog
  const [defects] = useState<RejectionDefectType[]>(SEED_DEFECTS);
  const [downtimeCategories] = useState<DowntimeCategoryType[]>(SEED_DOWNTIME_CATEGORIES);

  // Production Reports
  const [reports, setReports] = useState<ProductionReport[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}reports`);
    return saved ? JSON.parse(saved) : SEED_HOURLY_ENTRIES;
  });

  // Rejections
  const [rejections, setRejections] = useState<RejectionLogItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}rejections`);
    return saved ? JSON.parse(saved) : SEED_REJECTIONS;
  });

  // Downtimes
  const [downtimes, setDowntimes] = useState<DowntimeLogItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}downtimes`);
    return saved ? JSON.parse(saved) : SEED_DOWNTIMES;
  });

  // Monthly Plans
  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyProductionPlan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}monthlyPlans`);
    return saved ? JSON.parse(saved) : SEED_MONTHLY_PLANS;
  });

  // Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}inventory`);
    return saved ? JSON.parse(saved) : SEED_INVENTORY;
  });

  // Machine Slots
  const [machineSlots, setMachineSlots] = useState<MachinePlanningSlot[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}machineSlots`);
    return saved ? JSON.parse(saved) : SEED_MACHINE_SLOTS;
  });

  // Manpower
  const [manpower, setManpower] = useState<ManpowerAllocation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}manpower`);
    return saved ? JSON.parse(saved) : SEED_MANPOWER;
  });

  // Daily Summaries
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}dailySummaries`);
    return saved ? JSON.parse(saved) : SEED_DAILY_SUMMARIES;
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}auditLogs`);
    return saved ? JSON.parse(saved) : SEED_AUDIT_LOGS;
  });

  // AI Recommendations
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}aiRecs`);
    return saved ? JSON.parse(saved) : SEED_AI_RECOMMENDATIONS;
  });

  // OCR History
  const [ocrScanHistory, setOcrScanHistory] = useState<OCRScanResult[]>([]);

  // Training & Competency States
  const [trainingMasters, setTrainingMasters] = useState<TrainingMaster[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}trainingMasters`);
    return saved ? JSON.parse(saved) : SEED_TRAINING_MASTERS;
  });

  const [trainingTests, setTrainingTests] = useState<TrainingTest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}trainingTests`);
    return saved ? JSON.parse(saved) : SEED_TRAINING_TESTS;
  });

  const [trainingAssignments, setTrainingAssignments] = useState<TrainingAssignment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}trainingAssignments`);
    return saved ? JSON.parse(saved) : SEED_TRAINING_ASSIGNMENTS;
  });

  const [practicalEvaluations, setPracticalEvaluations] = useState<PracticalCompetencyEvaluation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}practicalEvaluations`);
    return saved ? JSON.parse(saved) : SEED_PRACTICAL_EVALUATIONS;
  });

  const [shopfloorMonitoringRecords, setShopfloorMonitoringRecords] = useState<ShopfloorMonitoringRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}shopfloorMonitoring`);
    return saved ? JSON.parse(saved) : SEED_SHOPFLOOR_MONITORING;
  });

  const [correctiveTrainingRecords, setCorrectiveTrainingRecords] = useState<CorrectiveTrainingRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}correctiveTraining`);
    return saved ? JSON.parse(saved) : SEED_CORRECTIVE_TRAINING;
  });

  const [trainingAttendance, setTrainingAttendance] = useState<TrainingAttendance[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}trainingAttendance`);
    return saved ? JSON.parse(saved) : SEED_TRAINING_ATTENDANCE;
  });

  const [testSubmissions, setTestSubmissions] = useState<TestSubmission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}testSubmissions`);
    return saved ? JSON.parse(saved) : [];
  });

  // Company Training Programs, Question Papers & Sign-Off Sessions
  const [companyTrainingPrograms, setCompanyTrainingPrograms] = useState<CompanyTrainingProgram[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}companyTrainingPrograms`);
    return saved ? JSON.parse(saved) : SEED_COMPANY_TRAINING_PROGRAMS;
  });

  const [companyQuestionPapers, setCompanyQuestionPapers] = useState<CompanyQuestionPaper[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}companyQuestionPapers`);
    return saved ? JSON.parse(saved) : SEED_COMPANY_QUESTION_PAPERS;
  });

  const [trainingSignOffSessions, setTrainingSignOffSessions] = useState<TrainingSignOffSession[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}trainingSignOffSessions`);
    return saved ? JSON.parse(saved) : SEED_TRAINING_SIGN_OFF_SESSIONS;
  });

  // Production Planning & PPC States
  const [ppcRequirementDocs, setPpcRequirementDocs] = useState<PPCRequirementDocument[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}ppcRequirementDocs`);
    return saved ? JSON.parse(saved) : SEED_PPC_REQUIREMENT_DOCS;
  });

  const [productionPlans, setProductionPlans] = useState<ProductionPlanRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}productionPlans`);
    return saved ? JSON.parse(saved) : SEED_PRODUCTION_PLANS;
  });

  const [ppcCapacitySettings, setPpcCapacitySettings] = useState<PPCPlantCapacitySettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}ppcCapacitySettings`);
    return saved ? JSON.parse(saved) : SEED_PPC_CAPACITY_SETTINGS;
  });

  // Persistent storage sync for PPC
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}ppcRequirementDocs`, JSON.stringify(ppcRequirementDocs));
  }, [ppcRequirementDocs]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}productionPlans`, JSON.stringify(productionPlans));
  }, [productionPlans]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}ppcCapacitySettings`, JSON.stringify(ppcCapacitySettings));
  }, [ppcCapacitySettings]);

  // Persistent storage sync
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}trainingMasters`, JSON.stringify(trainingMasters));
  }, [trainingMasters]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}trainingTests`, JSON.stringify(trainingTests));
  }, [trainingTests]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}trainingAssignments`, JSON.stringify(trainingAssignments));
  }, [trainingAssignments]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}practicalEvaluations`, JSON.stringify(practicalEvaluations));
  }, [practicalEvaluations]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}shopfloorMonitoring`, JSON.stringify(shopfloorMonitoringRecords));
  }, [shopfloorMonitoringRecords]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}correctiveTraining`, JSON.stringify(correctiveTrainingRecords));
  }, [correctiveTrainingRecords]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}trainingAttendance`, JSON.stringify(trainingAttendance));
  }, [trainingAttendance]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}testSubmissions`, JSON.stringify(testSubmissions));
  }, [testSubmissions]);

  // Persistent storage sync for Company Training
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}companies`, JSON.stringify(companies));
  }, [companies]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}selectedCompanyId`, selectedCompanyId);
  }, [selectedCompanyId]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}companyTrainingPrograms`, JSON.stringify(companyTrainingPrograms));
  }, [companyTrainingPrograms]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}companyQuestionPapers`, JSON.stringify(companyQuestionPapers));
  }, [companyQuestionPapers]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}trainingSignOffSessions`, JSON.stringify(trainingSignOffSessions));
  }, [trainingSignOffSessions]);

  // Persistent storage sync
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}currentUserId`, currentUser.id);
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}shifts`, JSON.stringify(shifts));
  }, [shifts]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}departments`, JSON.stringify(departments));
  }, [departments]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}machines`, JSON.stringify(machines));
  }, [machines]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}products`, JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}reports`, JSON.stringify(reports));
  }, [reports]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}rejections`, JSON.stringify(rejections));
  }, [rejections]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}downtimes`, JSON.stringify(downtimes));
  }, [downtimes]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}monthlyPlans`, JSON.stringify(monthlyPlans));
  }, [monthlyPlans]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}inventory`, JSON.stringify(inventory));
  }, [inventory]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}dailySummaries`, JSON.stringify(dailySummaries));
  }, [dailySummaries]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}auditLogs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Haptic feedback trigger for mobile touch
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch (e) {
        // ignore
      }
    }
  };

  // Audit logging utility
  const addAuditLog = (
    action: AuditLogEntry['action'],
    module: string,
    entityId: string,
    description: string,
    details?: any
  ) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action,
      module,
      entityId,
      description,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Quick switch role
  const switchRole = (role: UserRole) => {
    const match = users.find((u) => u.role === role);
    if (match) {
      setCurrentUser(match);
      addAuditLog('UPDATE', 'Auth / RBAC', match.id, `User switched profile to role: ${role}`);
      triggerHaptic();
    }
  };

  // Helper to re-calculate production report metrics
  const calculateReportMetrics = (report: ProductionReport): ProductionReport => {
    const totalTarget = report.hourlyEntries.reduce((sum, h) => sum + (h.targetQty || 0), 0);
    const totalActual = report.hourlyEntries.reduce((sum, h) => sum + (h.actualQty || 0), 0);
    const totalReject = report.hourlyEntries.reduce((sum, h) => sum + (h.rejectQty || 0), 0);
    const totalDowntimeMinutes = report.hourlyEntries.reduce((sum, h) => sum + (h.downtimeMinutes || 0), 0);

    const efficiencyPct = totalTarget > 0 ? Number(((totalActual / totalTarget) * 100).toFixed(1)) : 0;
    const totalProductionAll = totalActual + totalReject;
    const scrapRatePct = totalProductionAll > 0 ? Number(((totalReject / totalProductionAll) * 100).toFixed(2)) : 0;

    const shiftPlannedMinutes = report.hourlyEntries.length * 60;
    const operatingMinutes = Math.max(0, shiftPlannedMinutes - totalDowntimeMinutes);
    const availabilityPct = shiftPlannedMinutes > 0 ? Number(((operatingMinutes / shiftPlannedMinutes) * 100).toFixed(1)) : 100;
    const performancePct = efficiencyPct;
    const qualityPct = totalProductionAll > 0 ? Number(((totalActual / totalProductionAll) * 100).toFixed(1)) : 100;
    const oeePct = Number(((availabilityPct / 100) * (performancePct / 100) * (qualityPct / 100) * 100).toFixed(1));

    return {
      ...report,
      totalTarget,
      totalActual,
      totalReject,
      totalDowntimeMinutes,
      efficiencyPct,
      scrapRatePct,
      availabilityPct,
      performancePct,
      qualityPct,
      oeePct,
    };
  };

  // Save / Update production report
  const saveProductionReport = (report: ProductionReport) => {
    const updated = calculateReportMetrics(report);
    setReports((prev) => {
      const exists = prev.some((r) => r.id === updated.id);
      if (exists) {
        return prev.map((r) => (r.id === updated.id ? updated : r));
      }
      return [updated, ...prev];
    });
    addAuditLog('UPDATE', 'Hourly Reports', updated.id, `Saved production report ${updated.reportNumber}`);
  };

  // Update report approval status
  const updateReportStatus = (reportId: string, status: ProductionReport['status'], remarks?: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        const updated: ProductionReport = {
          ...r,
          status,
          ...(status === 'Submitted' ? { submittedAt: now, operatorNotes: remarks || r.operatorNotes } : {}),
          ...(status === 'Verified' ? { verifiedAt: now, supervisorId: currentUser.id, supervisorRemarks: remarks || r.supervisorRemarks } : {}),
          ...(status === 'Approved' ? { approvedAt: now, managerRemarks: remarks || r.managerRemarks } : {}),
        };
        return updated;
      })
    );
    addAuditLog(status === 'Approved' ? 'APPROVE' : status === 'Verified' ? 'VERIFY' : 'UPDATE', 'Approvals', reportId, `Report ${reportId} status updated to ${status}${remarks ? ` (${remarks})` : ''}`);
    triggerHaptic();
  };

  // Add hourly entry to existing report
  const addHourlyEntryToReport = (reportId: string, entry: HourlyReportEntry) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        const existingIdx = r.hourlyEntries.findIndex((h) => h.hourIndex === entry.hourIndex);
        let newEntries = [...r.hourlyEntries];
        if (existingIdx >= 0) {
          newEntries[existingIdx] = entry;
        } else {
          newEntries.push(entry);
          newEntries.sort((a, b) => a.hourIndex - b.hourIndex);
        }
        return calculateReportMetrics({ ...r, hourlyEntries: newEntries });
      })
    );
    addAuditLog('UPDATE', 'Hourly Reports', reportId, `Logged Hour ${entry.hourIndex} (${entry.actualQty} pcs)`);
  };

  // Add Rejection Log
  const addRejection = (item: Omit<RejectionLogItem, 'id'>) => {
    const newId = `rej-${Date.now()}`;
    const newItem: RejectionLogItem = { ...item, id: newId };
    setRejections((prev) => [newItem, ...prev]);
    addAuditLog('CREATE', 'Rejections', newId, `Logged rejection: ${item.quantity} pcs of ${item.defectName}`);
    triggerHaptic();
  };

  // Add Downtime Log
  const addDowntime = (item: Omit<DowntimeLogItem, 'id'>) => {
    const newId = `dt-${Date.now()}`;
    const newItem: DowntimeLogItem = { ...item, id: newId };
    setDowntimes((prev) => [newItem, ...prev]);
    
    // Update machine status if ongoing
    if (!item.isResolved) {
      updateMachineStatus(item.machineId, 'Breakdown');
    }
    
    addAuditLog('CREATE', 'Downtime', newId, `Logged downtime: ${item.durationMinutes} mins (${item.categoryName})`);
    triggerHaptic();
  };

  // Resolve downtime
  const resolveDowntime = (id: string, actionTaken: string) => {
    setDowntimes((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        return {
          ...d,
          isResolved: true,
          actionTaken,
          endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      })
    );
    addAuditLog('UPDATE', 'Downtime', id, `Downtime resolved: ${actionTaken}`);
  };

  // Update machine status
  const updateMachineStatus = (machineId: string, status: Machine['status']) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id !== machineId) return m;
        return { ...m, status };
      })
    );
    addAuditLog('UPDATE', 'Machines', machineId, `Machine status updated to ${status}`);
    triggerHaptic();
  };

  // Update Inventory
  const updateInventoryStock = (itemId: string, deltaQty: number, type: 'IN' | 'OUT' | 'ADJUST', remarks?: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const newStock = type === 'OUT' ? Math.max(0, item.currentStock - deltaQty) : item.currentStock + deltaQty;
        return {
          ...item,
          currentStock: newStock,
          lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
      })
    );
    addAuditLog('UPDATE', 'Inventory', itemId, `Inventory ${type}: ${deltaQty} units ${remarks ? `(${remarks})` : ''}`);
    triggerHaptic();
  };

  // Monthly Plans
  const updateMonthlyPlan = (plan: MonthlyProductionPlan) => {
    setMonthlyPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p)));
    addAuditLog('UPDATE', 'PPC Planning', plan.id, `Updated monthly plan for product ${plan.productId}`);
  };

  const addMonthlyPlan = (plan: Omit<MonthlyProductionPlan, 'id'>) => {
    const newId = `plan-${Date.now()}`;
    const newPlan: MonthlyProductionPlan = { ...plan, id: newId };
    setMonthlyPlans((prev) => [newPlan, ...prev]);
    addAuditLog('CREATE', 'PPC Planning', newId, `Created new monthly target: ${plan.targetQuantity} units`);
    triggerHaptic();
  };

  // Sign daily summary
  const signDailySummary = (summaryId: string, role: 'Supervisor' | 'Production Manager') => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setDailySummaries((prev) =>
      prev.map((ds) => {
        if (ds.id !== summaryId) return ds;
        if (role === 'Supervisor') {
          return {
            ...ds,
            supervisorSigned: true,
            supervisorSignoffTime: now,
            status: ds.managerSigned ? 'Manager-Approved' : 'Supervisor-Verified',
          };
        } else {
          return {
            ...ds,
            managerSigned: true,
            managerSignoffTime: now,
            status: 'Manager-Approved',
          };
        }
      })
    );
    addAuditLog('APPROVE', 'Daily Summary', summaryId, `${role} signed daily shift closing report`);
    triggerHaptic();
  };

  // Apply OCR scan result to a production report
  const applyOcrResultToReport = (scan: OCRScanResult): ProductionReport => {
    const matchedMachine = machines.find((m) => m.code.toUpperCase() === scan.recognizedMachineCode.toUpperCase()) || machines[0];
    const matchedProduct = products.find((p) => p.sku.toUpperCase() === scan.recognizedProductSku.toUpperCase()) || products[0];
    const matchedDept = departments.find((d) => d.name.toLowerCase() === scan.recognizedDepartment.toLowerCase()) || departments[0];

    const hourlyEntries: HourlyReportEntry[] = scan.parsedHourlyRows.map((row) => ({
      hourIndex: row.hour,
      timeSlotLabel: row.timeSlot,
      targetQty: row.target || matchedProduct.targetPerHour || 500,
      actualQty: row.actual,
      rejectQty: row.reject,
      rejectionCode: row.rejectionCode,
      rejectReason: row.rejectReason,
      rejectDefectCode: row.rejectReason,
      downtimeMinutes: row.downtimeMin,
      downtimeCode: row.downtimeCode,
      downtimeReason: row.downtimeReason,
      downtimeReasonCode: row.downtimeReason,
      runnerWeightGrams: row.runnerWeightGrams || scan.recognizedRunnerWeightGrams,
      lumpQuantityKg: row.lumpQuantityKg || scan.recognizedLumpQuantityKg,
      cavityCount: scan.recognizedCavityCount,
      remarks: row.remarks,
      notes: row.remarks,
      isUncertain: row.isUncertain || (row.uncertainFields && row.uncertainFields.length > 0),
      uncertainFields: row.uncertainFields || [],
      mouldingFields: {
        shotCount: row.actual / (scan.recognizedCavityCount || 4),
        cycleTimeSec: scan.recognizedCycleTimeSec || 22.0,
        meltTempC: 245,
        cushionMm: 11.5,
        hydraulicPressureBar: 140,
        runnerWeightGrams: row.runnerWeightGrams || 17.2,
        lumpKg: row.lumpQuantityKg || 0,
      },
    }));

    const newReport: ProductionReport = {
      id: `rep-ocr-${Date.now()}`,
      reportNumber: `PR-${scan.recognizedDate.replace(/-/g, '')}-${matchedMachine.code}-${activeShift.code.replace('Shift ', '')}`,
      date: scan.recognizedDate,
      shiftId: activeShift.id,
      departmentId: matchedDept.id,
      machineId: matchedMachine.id,
      productId: matchedProduct.id,
      operatorId: currentUser.id,
      operatorName: scan.recognizedOperatorName || currentUser.name,
      supervisorName: scan.recognizedSupervisorName,
      partName: scan.recognizedProductName || matchedProduct.name,
      materialName: scan.recognizedMaterialName || matchedProduct.polymerResin,
      cycleTimeSec: scan.recognizedCycleTimeSec,
      targetPerHour: scan.recognizedTargetPerHour || matchedProduct.targetPerHour,
      cavityCount: scan.recognizedCavityCount,
      runnerWeightGrams: scan.recognizedRunnerWeightGrams,
      lumpQuantityKg: scan.recognizedLumpQuantityKg,
      status: scan.uncertainFields && scan.uncertainFields.length > 0 ? 'Draft' : 'Submitted',
      hourlyEntries,
      totalTarget: 0,
      totalActual: 0,
      totalReject: 0,
      totalDowntimeMinutes: 0,
      efficiencyPct: 0,
      scrapRatePct: 0,
      availabilityPct: 0,
      performancePct: 0,
      qualityPct: 0,
      oeePct: 0,
      operatorNotes: scan.recognizedRemarks || `AI/OCR extracted from physical production sheet. Confidence: ${scan.confidenceScore}%`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      ocrSourceImage: scan.imageThumbnail,
      isOcrGenerated: true,
      ocrConfidenceScore: scan.confidenceScore,
      uncertainFields: scan.uncertainFields || [],
      missingFields: scan.missingFields || [],
    };

    const calculated = calculateReportMetrics(newReport);
    setReports((prev) => [calculated, ...prev]);
    setOcrScanHistory((prev) => [scan, ...prev]);

    // Also auto-create corresponding rejection logs & downtime logs from OCR
    scan.parsedHourlyRows.forEach((r) => {
      if (r.reject > 0) {
        addRejection({
          reportId: calculated.id,
          date: scan.recognizedDate,
          shiftId: activeShift.id,
          departmentId: matchedDept.id,
          machineId: matchedMachine.id,
          productId: matchedProduct.id,
          hourIndex: r.hour,
          defectCode: r.rejectionCode ? `DEF-CODE-${r.rejectionCode}` : (r.rejectReason || 'DEF-SHORT-SHOT'),
          defectName: r.rejectReason ? `[Code ${r.rejectionCode || 'A'}] ${r.rejectReason}` : 'OCR Extracted Scrap',
          quantity: r.reject,
          isReworkable: false,
          scrapCostTotal: r.reject * (matchedProduct.unitCostCurrency || 10),
          rootCauseNote: `Hour ${r.hour} Log: ${r.remarks || 'Extracted via paper log sheet scan'}`,
          operatorId: currentUser.id,
        });
      }
      if (r.downtimeMin > 0) {
        addDowntime({
          reportId: calculated.id,
          date: scan.recognizedDate,
          shiftId: activeShift.id,
          departmentId: matchedDept.id,
          machineId: matchedMachine.id,
          hourIndex: r.hour,
          categoryCode: r.downtimeCode ? `DT-CODE-${r.downtimeCode}` : (r.downtimeReason || 'DT-MOLD-BD'),
          categoryName: r.downtimeReason ? `[Code ${r.downtimeCode || '1'}] ${r.downtimeReason}` : 'OCR Extracted Downtime',
          durationMinutes: r.downtimeMin,
          actionTaken: r.remarks || 'Extracted via paper log sheet scan',
          isResolved: true,
          operatorId: currentUser.id,
        });
      }
    });

    addAuditLog('OCR_EXTRACT', 'AI & OCR', calculated.id, `Extracted production sheet with ${scan.confidenceScore}% confidence (${scan.parsedHourlyRows.length} hours recorded)`);
    return calculated;
  };

  // Training & Competency Handlers
  const addTrainingMaster = (trainingData: Omit<TrainingMaster, 'id' | 'createdAt' | 'updatedAt'>): TrainingMaster => {
    const newMaster: TrainingMaster = {
      ...trainingData,
      id: `trn-custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTrainingMasters((prev) => [newMaster, ...prev]);
    addAuditLog('CREATE', 'Training Master', newMaster.id, `Created training: ${newMaster.code} - ${newMaster.title}`);
    triggerHaptic();
    return newMaster;
  };

  const updateTrainingMaster = (id: string, updates: Partial<TrainingMaster>) => {
    setTrainingMasters((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
    addAuditLog('UPDATE', 'Training Master', id, `Updated training master config`);
    triggerHaptic();
  };

  const deleteTrainingMaster = (id: string) => {
    setTrainingMasters((prev) => prev.filter((t) => t.id !== id));
    addAuditLog('DELETE', 'Training Master', id, `Deleted training record`);
    triggerHaptic();
  };

  const assignTraining = (assignmentsList: Omit<TrainingAssignment, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const now = new Date().toISOString();
    const created: TrainingAssignment[] = assignmentsList.map((asg, idx) => ({
      ...asg,
      id: `asg-${Date.now()}-${idx}`,
      createdAt: now,
      updatedAt: now,
    }));
    setTrainingAssignments((prev) => [...created, ...prev]);
    addAuditLog('CREATE', 'Training Assignment', created[0]?.id || 'bulk', `Assigned ${created.length} training items`);
    triggerHaptic();
  };

  const updateTrainingAssignment = (id: string, updates: Partial<TrainingAssignment>) => {
    setTrainingAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
    triggerHaptic();
  };

  const markTrainingContentCompleted = (assignmentId: string) => {
    const now = new Date().toISOString();
    setTrainingAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId) {
          const status = a.status === 'Assigned' || a.status === 'Scheduled' ? 'In Progress' : a.status;
          return {
            ...a,
            contentCompleted: true,
            contentCompletedAt: now,
            status,
            updatedAt: now,
          };
        }
        return a;
      })
    );
    addAuditLog('UPDATE', 'Training Plan', assignmentId, `Employee completed training content material`);
    triggerHaptic();
  };

  const submitTestResult = (submissionData: Omit<TestSubmission, 'id' | 'submittedAt'>): TestSubmission => {
    const now = new Date().toISOString();
    const rawPassMark = submissionData.passMark ?? submissionData.passingScorePct ?? 80;
    const normalizedPassMark = normalizePassMark(rawPassMark, 80);

    const evaluated = calculateAssessmentScore(
      submissionData.score,
      submissionData.totalScore || 100,
      normalizedPassMark
    );

    const submission: TestSubmission = {
      ...submissionData,
      id: `sub-${Date.now()}`,
      submittedAt: now,
      score: evaluated.score,
      totalScore: evaluated.totalScore,
      percentage: evaluated.percentage,
      passMark: evaluated.passMark,
      passingScorePct: evaluated.passMark,
      result: evaluated.result,
    };
    setTestSubmissions((prev) => [submission, ...prev]);

    // Update assignment status
    setTrainingAssignments((prev) =>
      prev.map((a) => {
        if (a.trainingId === submission.trainingId && a.employeeId === submission.employeeId) {
          const isPassed = submission.result === 'PASSED';
          const newStatus = isPassed ? (a.practicalCompleted ? 'Completed' : 'In Progress') : 'Failed';
          const overall = isPassed ? (a.practicalCompleted ? 'Passed' : 'Pending') : 'Failed';
          return {
            ...a,
            testTaken: true,
            testScorePct: submission.percentage,
            testResult: isPassed ? 'Passed' : 'Failed',
            status: newStatus,
            overallResult: overall,
            attemptsCount: (a.attemptsCount || 0) + 1,
            completedDate: isPassed && a.practicalCompleted ? now.slice(0, 10) : a.completedDate,
            updatedAt: now,
          };
        }
        return a;
      })
    );

    // Automated audit log trigger recording original passMark, calculated score, and pass/fail decision
    addAuditLog(
      'SUBMIT',
      'Assessment',
      submission.id,
      `Assessment submitted for ${submission.employeeName} (${submission.employeeCode || 'N/A'}) - Score: ${submission.percentage}% (${submission.score}/${submission.totalScore}), Pass Mark: ${evaluated.passMark}%, Result: ${evaluated.result}`,
      {
        assessmentType: 'Training Test / Quiz',
        trainingTitle: submission.trainingTitle,
        employeeId: submission.employeeId,
        employeeName: submission.employeeName,
        originalPassMark: rawPassMark,
        passMark: evaluated.passMark,
        calculatedScore: submission.score,
        totalScore: submission.totalScore,
        scorePercent: submission.percentage,
        decision: evaluated.result,
        isPassed: evaluated.isPassed,
      }
    );
    triggerHaptic();
    return submission;
  };

  const submitPracticalEvaluation = (
    evalData: Omit<PracticalCompetencyEvaluation, 'id' | 'createdAt' | 'updatedAt'>
  ): PracticalCompetencyEvaluation => {
    const now = new Date().toISOString();
    const newEval: PracticalCompetencyEvaluation = {
      ...evalData,
      id: `pe-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setPracticalEvaluations((prev) => [newEval, ...prev]);

    // Update matched assignment
    setTrainingAssignments((prev) =>
      prev.map((a) => {
        if (a.employeeId === newEval.employeeId && (!newEval.machineId || a.machineId === newEval.machineId)) {
          const isCompetent = newEval.competencyResult === 'Competent';
          const newStatus = isCompetent ? (a.testTaken ? 'Completed' : 'In Progress') : (newEval.competencyResult === 'Not Competent' ? 'Failed' : a.status);
          return {
            ...a,
            practicalCompleted: true,
            practicalScorePct: newEval.overallScorePct,
            practicalResult: newEval.competencyResult,
            status: newStatus,
            overallResult: isCompetent && a.testResult === 'Passed' ? 'Passed' : 'Pending',
            validityExpiryDate: newEval.qualificationExpiryDate || a.validityExpiryDate,
            completedDate: isCompetent ? now.slice(0, 10) : a.completedDate,
            updatedAt: now,
          };
        }
        return a;
      })
    );

    // If retraining required, automatically trigger corrective training!
    if (newEval.retrainingRequired && newEval.recommendedTrainingId) {
      const recMaster = trainingMasters.find((t) => t.id === newEval.recommendedTrainingId);
      addCorrectiveTraining({
        employeeId: newEval.employeeId,
        employeeName: newEval.employeeName,
        employeeCode: newEval.employeeCode,
        departmentId: newEval.departmentId,
        triggerSource: 'Practical Assessment',
        triggerReferenceId: newEval.id,
        issueDescription: newEval.supervisorComments || 'Practical competency below threshold',
        rootCause: newEval.correctiveActionRecommended || 'Practical technique deficiency',
        requiredTrainingId: newEval.recommendedTrainingId,
        requiredTrainingTitle: recMaster?.title || 'Corrective Retraining',
        trainerId: newEval.evaluatorId,
        trainerName: newEval.evaluatorName,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        finalResult: 'Pending',
        status: 'Open',
      });
    }

    addAuditLog('SUBMIT', 'Practical Evaluation', newEval.id, `Evaluated ${newEval.employeeName} - Score: ${newEval.overallScorePct}% (${newEval.competencyResult})`);
    triggerHaptic();
    return newEval;
  };

  const submitShopfloorMonitoring = (
    monitoringData: Omit<ShopfloorMonitoringRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): ShopfloorMonitoringRecord => {
    const now = new Date().toISOString();
    const newRecord: ShopfloorMonitoringRecord = {
      ...monitoringData,
      id: `mon-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setShopfloorMonitoringRecords((prev) => [newRecord, ...prev]);

    // Automatically trigger retraining recommendation if critical issue or score < 75%
    if (newRecord.retrainingRecommended && newRecord.retrainingTrainingId) {
      addCorrectiveTraining({
        employeeId: newRecord.employeeId,
        employeeName: newRecord.employeeName,
        employeeCode: newRecord.employeeCode,
        departmentId: newRecord.departmentId,
        triggerSource: 'Monitoring Checkpoint',
        triggerReferenceId: newRecord.id,
        issueDescription: `Monitoring Score: ${newRecord.monitoringScorePct}% with ${newRecord.criticalIssuesCount} critical observations on ${newRecord.machineCode}.`,
        rootCause: newRecord.closureRemarks || 'Shopfloor audit deviation',
        requiredTrainingId: newRecord.retrainingTrainingId,
        requiredTrainingTitle: newRecord.retrainingTrainingName || 'Corrective Training',
        trainerId: newRecord.supervisorId,
        trainerName: newRecord.supervisorName,
        dueDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
        finalResult: 'Pending',
        status: 'Open',
      });
    }

    addAuditLog('CREATE', 'Shopfloor Monitoring', newRecord.id, `Logged monitoring for ${newRecord.employeeName} on ${newRecord.machineCode}: ${newRecord.monitoringScorePct}% (${newRecord.scoreStatus})`);
    triggerHaptic();
    return newRecord;
  };

  const addCorrectiveTraining = (
    record: Omit<CorrectiveTrainingRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): CorrectiveTrainingRecord => {
    const now = new Date().toISOString();
    const newRecord: CorrectiveTrainingRecord = {
      ...record,
      id: `cor-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setCorrectiveTrainingRecords((prev) => [newRecord, ...prev]);

    // Also create or flag assignment
    const emp = users.find((u) => u.id === record.employeeId);
    const master = trainingMasters.find((t) => t.id === record.requiredTrainingId);
    if (emp && master) {
      assignTraining([
        {
          employeeId: emp.id,
          employeeName: emp.name,
          employeeCode: emp.employeeCode,
          departmentId: emp.departmentId || 'dept-moulding',
          designation: emp.role,
          role: emp.role,
          trainingId: master.id,
          trainingTitle: master.title,
          trainingCode: master.code,
          category: master.category,
          assignedDate: now.slice(0, 10),
          dueDate: record.dueDate,
          priority: 'High',
          trainerName: record.trainerName,
          trainingMode: master.trainingType,
          status: 'Assigned',
          contentCompleted: false,
          testTaken: false,
          practicalCompleted: false,
          attemptsCount: 0,
          isCorrectiveRetraining: true,
          triggeredByMonitoringId: record.triggerReferenceId,
          remarks: `Corrective Retraining: ${record.issueDescription}`,
          createdBy: currentUser.name,
        },
      ]);
    }

    addAuditLog('CREATE', 'Corrective Training', newRecord.id, `Triggered corrective retraining for ${newRecord.employeeName}: ${newRecord.requiredTrainingTitle}`);
    return newRecord;
  };

  const updateCorrectiveTraining進 = (id: string, updates: Partial<CorrectiveTrainingRecord>) => {
    setCorrectiveTrainingRecords((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
    triggerHaptic();
  };

  const saveTrainingAttendance = (attendance: Omit<TrainingAttendance, 'id'>) => {
    const newAtt: TrainingAttendance = {
      ...attendance,
      id: `att-${Date.now()}`,
    };
    setTrainingAttendance((prev) => [newAtt, ...prev]);
    addAuditLog('CREATE', 'Training Attendance', newAtt.id, `Recorded attendance for ${newAtt.employeeName} - ${newAtt.trainingTopic}`);
    triggerHaptic();
  };

  const saveTrainingTest = (test: TrainingTest) => {
    setTrainingTests((prev) => {
      const idx提高 = prev.findIndex((t) => t.id === test.id || t.trainingId === test.trainingId);
      if (idx提高 >= 0) {
        const copy = [...prev];
        copy[idx提高] = test;
        return copy;
      }
      return [test, ...prev];
    });
    addAuditLog('UPDATE', 'Training Test', test.id, `Updated test: ${test.title} (${test.questions.length} questions)`);
    triggerHaptic();
  };

  const isOperatorQualifiedForMachine = (
    operatorId: string,
    machineId: string
  ): { qualified: boolean; reason?: string } => {
    const matchedMachine = machines.find((m) => m.id === machineId || m.code === machineId);
    if (!matchedMachine) return { qualified: true };

    // Check assignments / evaluations for this employee on this machine
    const relatedAssignments = trainingAssignments.filter(
      (a) => a.employeeId === operatorId && (!a.machineId || a.machineId === matchedMachine.id || a.machineCode === matchedMachine.code)
    );

    const practicals = practicalEvaluations.filter(
      (p) => p.employeeId === operatorId && (!p.machineId || p.machineId === matchedMachine.id || p.machineCode === matchedMachine.code)
    );

    // Look for expired qualification
    const expiredAsg = relatedAssignments.find((a) => a.status === 'Expired');
    if (expiredAsg) {
      return {
        qualified: false,
        reason: `Qualification expired for ${expiredAsg.trainingTitle} on ${matchedMachine.code}. Renewal required.`,
      };
    }

    const failedAsg = relatedAssignments.find((a) => a.status === 'Failed');
    if (failedAsg) {
      return {
        qualified: false,
        reason: `Failed recent competency test on ${matchedMachine.code}. Retraining required.`,
      };
    }

    // Check practical competency
    const latestPractical = practicals[0];
    if (latestPractical && latestPractical.competencyResult === 'Not Competent') {
      return {
        qualified: false,
        reason: `Practical competency scored Not Competent (${latestPractical.overallScorePct}%). Retraining pending.`,
      };
    }

    return { qualified: true };
  };

  // Company Custom Training Program Actions
  const addCompanyTrainingProgram = (
    programData: Omit<CompanyTrainingProgram, 'id' | 'createdDate'>
  ): CompanyTrainingProgram => {
    const now = new Date().toISOString();
    const newProgram: CompanyTrainingProgram = {
      ...programData,
      id: `cprg-${Date.now()}`,
      createdDate: now.slice(0, 10),
      updatedAt: now,
    };
    setCompanyTrainingPrograms((prev) => [newProgram, ...prev]);
    addAuditLog(
      'CREATE',
      'Training Program',
      newProgram.id,
      `Created custom company training program: ${newProgram.programName} (${newProgram.programId})`
    );
    triggerHaptic();
    return newProgram;
  };

  const updateCompanyTrainingProgram = (id: string, updates: Partial<CompanyTrainingProgram>) => {
    const now = new Date().toISOString();
    setCompanyTrainingPrograms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: now } : p))
    );
    addAuditLog('UPDATE', 'Training Program', id, `Updated training program: ${updates.programName || id}`);
    triggerHaptic();
  };

  const deleteCompanyTrainingProgram = (id: string) => {
    setCompanyTrainingPrograms((prev) => prev.filter((p) => p.id !== id));
    addAuditLog('DELETE', 'Training Program', id, `Deleted company training program`);
    triggerHaptic();
  };

  // Question Paper OCR & Version Actions
  const importCompanyQuestionPaper = (
    paperData: Omit<CompanyQuestionPaper, 'id' | 'createdAt' | 'updatedAt'>
  ): CompanyQuestionPaper => {
    const now = new Date().toISOString();
    const newPaper: CompanyQuestionPaper = {
      ...paperData,
      id: `cqp-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setCompanyQuestionPapers((prev) => [newPaper, ...prev]);

    // Also link back to program if program exists
    if (newPaper.trainingProgramId) {
      setCompanyTrainingPrograms((prev) =>
        prev.map((p) =>
          p.id === newPaper.trainingProgramId
            ? {
                ...p,
                questionPaperId: newPaper.id,
                questionPaperName: newPaper.title,
                questionPaperVersion: newPaper.version,
                originalDocumentName: newPaper.originalDocumentName,
                originalDocumentType: newPaper.originalDocumentType,
                originalDocumentUrl: newPaper.originalDocumentUrl,
                updatedAt: now,
              }
            : p
        )
      );
    }

    addAuditLog(
      'CREATE',
      'Question Paper OCR',
      newPaper.id,
      `Imported question paper for ${newPaper.programName}: ${newPaper.title} (${newPaper.questions.length} questions extracted)`
    );
    triggerHaptic();
    return newPaper;
  };

  const updateCompanyQuestionPaper = (id: string, updates: Partial<CompanyQuestionPaper>) => {
    const now = new Date().toISOString();
    setCompanyQuestionPapers((prev) =>
      prev.map((qp) => (qp.id === id ? { ...qp, ...updates, updatedAt: now } : qp))
    );
    triggerHaptic();
  };

  const approveQuestionPaper = (id: string, approvedBy: string) => {
    const now = new Date().toISOString();
    setCompanyQuestionPapers((prev) =>
      prev.map((qp) => {
        if (qp.id === id) {
          const approvedQuestions = qp.questions.map((q) => ({
            ...q,
            status: 'Approved' as const,
          }));
          return {
            ...qp,
            ocrStatus: 'Approved',
            questions: approvedQuestions,
            approvedAt: now,
            approvedBy,
            updatedAt: now,
          };
        }
        return qp;
      })
    );
    addAuditLog('VERIFY', 'Question Paper', id, `Approved question paper by ${approvedBy}`);
    triggerHaptic();
  };

  const createNewPaperVersion = (
    basePaperId: string,
    newVersion: string,
    title?: string
  ): CompanyQuestionPaper => {
    const basePaper = companyQuestionPapers.find((qp) => qp.id === basePaperId);
    if (!basePaper) throw new Error('Base question paper not found');

    const now = new Date().toISOString();
    const newPaper: CompanyQuestionPaper = {
      ...basePaper,
      id: `cqp-${Date.now()}`,
      version: newVersion,
      title: title || `${basePaper.title.replace(/Version\s*[\d.]+/i, '')} Version ${newVersion}`.trim(),
      ocrStatus: 'Under Review',
      approvedAt: undefined,
      approvedBy: undefined,
      createdAt: now,
      updatedAt: now,
      questions: basePaper.questions.map((q, idx) => ({
        ...q,
        id: `q-rev-${Date.now()}-${idx}`,
        status: 'Under Review',
      })),
    };

    setCompanyQuestionPapers((prev) => [newPaper, ...prev]);

    // Update parent program's current active version
    setCompanyTrainingPrograms((prev) =>
      prev.map((p) =>
        p.id === basePaper.trainingProgramId
          ? {
              ...p,
              version: `v${newVersion}`,
              questionPaperId: newPaper.id,
              questionPaperName: newPaper.title,
              questionPaperVersion: newVersion,
              updatedAt: now,
            }
          : p
      )
    );

    addAuditLog('CREATE', 'Question Paper Version', newPaper.id, `Created revision Version ${newVersion} for ${basePaper.programName}`);
    triggerHaptic();
    return newPaper;
  };

  // Sign-Offs & Audit Sessions
  const createTrainingSignOffSession = (
    sessionData: Omit<TrainingSignOffSession, 'id' | 'createdAt' | 'updatedAt'>
  ): TrainingSignOffSession => {
    const now = new Date().toISOString();
    const newSession: TrainingSignOffSession = {
      ...sessionData,
      id: `tss-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setTrainingSignOffSessions((prev) => [newSession, ...prev]);
    addAuditLog(
      'CREATE',
      'Training Sign-Off Session',
      newSession.id,
      `Initiated training session for ${newSession.employeeName} - ${newSession.trainingProgramTitle}`
    );
    triggerHaptic();
    return newSession;
  };

  const signTrainerPreTraining = (
    sessionId: string,
    signatureData: string,
    observations?: string
  ) => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTrainingSignOffSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            trainerPreSigned: true,
            trainerPreSignDate: dateStr,
            trainerPreSignTime: timeStr,
            trainerSignatureData: signatureData,
            trainerObservations: observations || s.trainerObservations,
            checklistItemsCompleted: true,
            updatedAt: now.toISOString(),
          };
        }
        return s;
      })
    );
    addAuditLog('SUBMIT', 'Trainer Pre-Sign', sessionId, `Trainer completed pre-training sign-off`);
    triggerHaptic();
  };

  const signOperatorAcknowledgement = (sessionId: string, signatureData: string) => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTrainingSignOffSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            operatorAckSigned: true,
            operatorAckDate: dateStr,
            operatorAckTime: timeStr,
            operatorSignatureData: signatureData,
            updatedAt: now.toISOString(),
          };
        }
        return s;
      })
    );
    addAuditLog('SUBMIT', 'Operator Ack Sign', sessionId, `Operator completed training acknowledgement`);
    triggerHaptic();
  };

  const submitSessionDigitalTest = (
    sessionId: string,
    score: number,
    maxScore: number,
    percentage: number,
    result: 'PASSED' | 'FAILED',
    answers: any[],
    passMark?: number
  ): TrainingSignOffSession => {
    const now = new Date().toISOString();
    let updatedSession: TrainingSignOffSession | null = null;
    const existingSession = trainingSignOffSessions.find((s) => s.id === sessionId);
    const rawPassMark = passMark ?? existingSession?.passMark ?? 80;
    const normalizedPassMark = normalizePassMark(rawPassMark, 80);

    const evaluated = calculateAssessmentScore(score, maxScore, normalizedPassMark);
    const finalResult = evaluated.result;
    const finalPercentage = evaluated.percentage;

    setTrainingSignOffSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const isPassed = finalResult === 'PASSED';
          const compResult = isPassed ? 'Competent' : 'Retraining Required';
          const sessionObj: TrainingSignOffSession = {
            ...s,
            testCompleted: true,
            testSubmitTime: now,
            testScore: evaluated.score,
            maxScore: evaluated.totalScore,
            testPercentage: finalPercentage,
            passMark: normalizedPassMark,
            testResult: finalResult,
            competencyResult: compResult,
            questionsAttempted: answers,
            updatedAt: now,
          };
          updatedSession = sessionObj;
          return sessionObj;
        }
        return s;
      })
    );

    // If failed, trigger automatic Corrective Training / Retraining CAPA record
    if (finalResult === 'FAILED') {
      const session = existingSession || updatedSession;
      if (session) {
        addCorrectiveTraining({
          employeeId: (session as TrainingSignOffSession).employeeId,
          employeeName: (session as TrainingSignOffSession).employeeName,
          employeeCode: (session as TrainingSignOffSession).employeeCode,
          departmentId: (session as TrainingSignOffSession).departmentId,
          triggerSource: 'Test Failure',
          triggerReferenceId: sessionId,
          issueDescription: `Failed test on ${(session as TrainingSignOffSession).questionPaperTitle || (session as TrainingSignOffSession).trainingProgramTitle} (Score: ${finalPercentage}%, Pass Mark: ${normalizedPassMark}%).`,
          rootCause: 'Knowledge gap identified during version-controlled digital test',
          requiredTrainingId: (session as TrainingSignOffSession).trainingProgramId,
          requiredTrainingTitle: (session as TrainingSignOffSession).trainingProgramTitle,
          trainerId: (session as TrainingSignOffSession).trainerId,
          trainerName: (session as TrainingSignOffSession).trainerName,
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          finalResult: 'Pending',
          status: 'Open',
        });
      }
    }

    // Automated audit log trigger recording original passMark, calculated score, and pass/fail decision
    addAuditLog(
      'SUBMIT',
      'Assessment',
      sessionId,
      `Assessment submitted for ${existingSession?.employeeName || 'Operator'} (${existingSession?.employeeCode || 'N/A'}) - Score: ${finalPercentage}% (${evaluated.score}/${evaluated.totalScore}), Pass Mark: ${normalizedPassMark}%, Result: ${finalResult}`,
      {
        assessmentType: 'Digital Competency Assessment',
        sessionId,
        paperTitle: existingSession?.questionPaperTitle || existingSession?.trainingProgramTitle,
        employeeId: existingSession?.employeeId,
        employeeName: existingSession?.employeeName,
        originalPassMark: rawPassMark,
        passMark: normalizedPassMark,
        calculatedScore: evaluated.score,
        totalScore: evaluated.totalScore,
        scorePercent: finalPercentage,
        decision: finalResult,
        isPassed: evaluated.isPassed,
      }
    );
    triggerHaptic();
    return updatedSession!;
  };

  // PPC Actions
  const addPPCRequirementDoc = (docData: Omit<PPCRequirementDocument, 'id' | 'uploadedAt'>): PPCRequirementDocument => {
    const newDoc: PPCRequirementDocument = {
      ...docData,
      id: `req-doc-${Date.now()}`,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      auditTrail: [
        {
          action: 'DOCUMENT_UPLOAD',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: currentUser.name,
          details: `Uploaded ${docData.title} with ${docData.itemsCount} extracted items.`,
        },
      ],
    };

    setPpcRequirementDocs((prev) => [newDoc, ...prev]);
    addAuditLog(
      'OCR_EXTRACT',
      'PPC Production Planning',
      newDoc.id,
      `PPC Requirement document uploaded: ${newDoc.title} (${newDoc.customerName})`,
      { itemsCount: newDoc.itemsCount, totalQty: newDoc.totalRequirementQty }
    );
    triggerHaptic();
    return newDoc;
  };

  const updatePPCRequirementDoc = (doc: PPCRequirementDocument) => {
    setPpcRequirementDocs((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
    triggerHaptic();
  };

  const deletePPCRequirementDoc = (id: string) => {
    setPpcRequirementDocs((prev) => prev.filter((d) => d.id !== id));
    addAuditLog('DELETE', 'PPC Production Planning', id, 'Deleted PPC requirement document');
    triggerHaptic();
  };

  const addProductionPlan = (
    planData: Omit<ProductionPlanRecord, 'id' | 'createdAt' | 'updatedAt' | 'planNumber'>
  ): ProductionPlanRecord => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const newPlan: ProductionPlanRecord = {
      ...planData,
      id: `plan-${Date.now()}`,
      planNumber: `PLN-${dateStr}-${randomSuffix}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setProductionPlans((prev) => [newPlan, ...prev]);
    addAuditLog(
      'CREATE',
      'PPC Production Planning',
      newPlan.id,
      `Created Production Plan ${newPlan.planNumber} for ${newPlan.componentName} on ${newPlan.machineCode}`,
      { plannedQty: newPlan.plannedQuantity, machine: newPlan.machineCode, dueDate: newPlan.dueDate }
    );
    triggerHaptic();
    return newPlan;
  };

  const updateProductionPlan = (plan: ProductionPlanRecord) => {
    const updatedPlan: ProductionPlanRecord = {
      ...plan,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setProductionPlans((prev) => prev.map((p) => (p.id === plan.id ? updatedPlan : p)));
    triggerHaptic();
  };

  const deleteProductionPlan = (id: string) => {
    setProductionPlans((prev) => prev.filter((p) => p.id !== id));
    addAuditLog('DELETE', 'PPC Production Planning', id, 'Deleted production plan');
    triggerHaptic();
  };

  const approveProductionPlan = (id: string, approverName: string) => {
    setProductionPlans((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            planApprovalStatus: 'Approved',
            approvedBy: approverName,
            approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: p.status === 'NOT PLANNED' ? 'PLANNED' : p.status,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          };
        }
        return p;
      })
    );
    addAuditLog('APPROVE', 'PPC Production Planning', id, `Production Plan approved by ${approverName}`);
    triggerHaptic();
  };

  const rejectProductionPlan = (id: string, reason: string) => {
    setProductionPlans((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            planApprovalStatus: 'Rejected',
            rejectionReason: reason,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          };
        }
        return p;
      })
    );
    addAuditLog('REJECT', 'PPC Production Planning', id, `Production Plan rejected: ${reason}`);
    triggerHaptic();
  };

  const updatePPCCapacitySettings = (settings: PPCPlantCapacitySettings) => {
    setPpcCapacitySettings(settings);
    addAuditLog('UPDATE', 'PPC Plant Settings', settings.id, 'Updated shift timings and plant capacity settings');
    triggerHaptic();
  };

  const replanForMachineBreakdown = (machineCode: string, alternateMachineId: string) => {
    const targetMachine = machines.find((m) => m.id === alternateMachineId || m.code === alternateMachineId);
    if (!targetMachine) return;

    setProductionPlans((prev) =>
      prev.map((plan) => {
        if (plan.machineCode === machineCode && (plan.status === 'RUNNING' || plan.status === 'PLANNED' || plan.status === 'DELAYED')) {
          const newCycleSec = plan.cycleTimeSec || targetMachine.standardCycleTimeSec || 35;
          const cyclesPerHour = 3600 / newCycleSec;
          const expectedRate = Math.round(cyclesPerHour * (plan.cavities || 2) * (plan.efficiencyPct / 100));

          return {
            ...plan,
            machineId: targetMachine.id,
            machineCode: targetMachine.code,
            machineTonnage: targetMachine.tonnage,
            cycleTimeSec: newCycleSec,
            cyclesPerHour,
            expectedProductionRatePerHour: expectedRate,
            isImpactedByBreakdown: true,
            breakdownMachineCode: machineCode,
            breakdownImpactNote: `Re-routed automatically from ${machineCode} due to breakdown to ${targetMachine.code} (${targetMachine.tonnage}T).`,
            status: 'PLANNED',
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          };
        }
        return plan;
      })
    );

    addAuditLog(
      'UPDATE',
      'PPC Production Planning',
      machineCode,
      `Re-scheduled all active plans from broken machine ${machineCode} to alternate machine ${targetMachine.code}`
    );
    triggerHaptic();
  };

  const generatePlansFromRequirementDoc = (docId: string, itemIds?: string[]): ProductionPlanRecord[] => {
    const doc = ppcRequirementDocs.find((d) => d.id === docId);
    if (!doc) return [];

    const itemsToPlan = itemIds && itemIds.length > 0
      ? doc.extractedItems.filter((i) => itemIds.includes(i.id))
      : doc.extractedItems;

    const createdPlans: ProductionPlanRecord[] = itemsToPlan.map((item, idx) => {
      // Find matching product
      const matchedProd = products.find(
        (p) =>
          p.sku.toLowerCase() === item.partNumber.toLowerCase() ||
          p.name.toLowerCase().includes(item.componentName.toLowerCase()) ||
          (item.matchedProductId && p.id === item.matchedProductId)
      );

      // Find compatible machine
      const matchedMach = machines.find(
        (m) =>
          (item.matchedMachineId && m.id === item.matchedMachineId) ||
          (item.matchedMachineCode && m.code === item.matchedMachineCode) ||
          m.departmentId === 'dept-moulding'
      ) || machines[0];

      const cavities = item.matchedCavities || matchedProd?.cavitiesActive || 2;
      const cycleSec = item.matchedCycleTimeSec || matchedProd?.standardCycleTimeSec || 35;
      const efficiency = ppcCapacitySettings.defaultEfficiencyPct || 85;
      const cyclesPerHour = 3600 / cycleSec;
      const expectedRate = Math.round(cyclesPerHour * cavities * (efficiency / 100));
      const targetPerShift = expectedRate * 8;
      const targetPerDay = targetPerShift * 3;

      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');

      const plan: ProductionPlanRecord = {
        id: `plan-gen-${Date.now()}-${idx}`,
        companyId: doc.companyId || 'comp-apex',
        planNumber: `PLN-${dateStr}-${randomSuffix}`,
        requirementDocId: doc.id,
        requirementDocVersion: doc.version,
        requirementItemId: item.id,
        componentPartNumber: item.partNumber,
        componentName: item.componentName,
        customer: item.customer || doc.customerName,
        customerPartNumber: item.customerPartNumber,
        productFamily: item.productFamily || 'Injection Moulding Components',
        productId: matchedProd?.id,
        requiredQuantity: item.requiredQuantity,
        alreadyProduced: 0,
        balanceQuantity: item.requiredQuantity,
        plannedQuantity: item.requiredQuantity,
        priority: item.priority,
        dueDate: item.dueDate,
        plannedStartDate: new Date().toISOString().substring(0, 10) + ' 06:00',
        plannedEndDate: item.dueDate + ' 14:00',
        shiftId: 'shift-a',
        shiftCode: 'Shift A',
        machineId: matchedMach.id,
        machineCode: matchedMach.code,
        machineTonnage: matchedMach.tonnage || 180,
        mouldCode: item.matchedMouldCode || matchedProd?.mouldCode || 'MLD-AUTO-01',
        cavities,
        cycleTimeSec: cycleSec,
        partsPerCycle: cavities,
        cyclesPerHour,
        expectedProductionRatePerHour: expectedRate,
        targetPerShift,
        targetPerDay,
        polymerMaterial: matchedProd?.polymerMaterial || 'ABS Flame Retardant',
        resinGrade: matchedProd?.resinGrade || 'Standard Resin',
        masterbatchColor: matchedProd?.masterbatchColor || 'Signal Black 2%',
        efficiencyPct: efficiency,
        scrapAllowancePct: ppcCapacitySettings.defaultScrapRatePct || 1.5,
        changeoverDurationMins: ppcCapacitySettings.defaultChangeoverTimeMins || 45,
        plannedDowntimeMins: 30,
        status: 'PLANNED',
        planApprovalStatus: 'Approved',
        approvedBy: currentUser.name,
        approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };

      return plan;
    });

    setProductionPlans((prev) => [...createdPlans, ...prev]);
    addAuditLog(
      'CREATE',
      'PPC Production Planning',
      doc.id,
      `Generated ${createdPlans.length} production plans from document ${doc.documentNumber}`,
      { docTitle: doc.title, plansGenerated: createdPlans.length }
    );
    triggerHaptic();
    return createdPlans;
  };

  // Reset all to seed data
  const resetAllData = () => {
    localStorage.clear();
    setDepartments(SEED_DEPARTMENTS);
    setShifts(SEED_SHIFTS);
    setUsers([...SEED_USERS, ...ADDITIONAL_SEED_OPERATORS]);
    setCurrentUser(SEED_USERS[0]);
    setCompanies(SEED_COMPANIES);
    setSelectedCompanyId('cmp-apex');
    setMachines(SEED_MACHINES);
    setProducts(SEED_PRODUCTS);
    setReports(SEED_HOURLY_ENTRIES);
    setRejections(SEED_REJECTIONS);
    setDowntimes(SEED_DOWNTIMES);
    setMonthlyPlans(SEED_MONTHLY_PLANS);
    setInventory(SEED_INVENTORY);
    setMachineSlots(SEED_MACHINE_SLOTS);
    setManpower(SEED_MANPOWER);
    setDailySummaries(SEED_DAILY_SUMMARIES);
    setAuditLogs(SEED_AUDIT_LOGS);
    setAiRecommendations(SEED_AI_RECOMMENDATIONS);
    setOcrScanHistory([]);
    setTrainingMasters(SEED_TRAINING_MASTERS);
    setTrainingTests(SEED_TRAINING_TESTS);
    setTrainingAssignments(SEED_TRAINING_ASSIGNMENTS);
    setPracticalEvaluations(SEED_PRACTICAL_EVALUATIONS);
    setShopfloorMonitoringRecords(SEED_SHOPFLOOR_MONITORING);
    setCorrectiveTrainingRecords(SEED_CORRECTIVE_TRAINING);
    setTrainingAttendance(SEED_TRAINING_ATTENDANCE);
    setTestSubmissions([]);
    setCompanyTrainingPrograms(SEED_COMPANY_TRAINING_PROGRAMS);
    setCompanyQuestionPapers(SEED_COMPANY_QUESTION_PAPERS);
    setTrainingSignOffSessions(SEED_TRAINING_SIGN_OFF_SESSIONS);
    setPpcRequirementDocs(SEED_PPC_REQUIREMENT_DOCS);
    setProductionPlans(SEED_PRODUCTION_PLANS);
    setPpcCapacitySettings(SEED_PPC_CAPACITY_SETTINGS);
    triggerHaptic();
  };

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,
        currentUser,
        setCurrentUser,
        switchRole,
        activeShift,
        setActiveShift,
        selectedDepartmentId,
        setSelectedDepartmentId,
        departments,
        shifts,
        users,
        machines,
        products,
        defects,
        downtimeCategories,
        reports,
        rejections,
        downtimes,
        monthlyPlans,
        inventory,
        machineSlots,
        manpower,
        dailySummaries,
        auditLogs,
        aiRecommendations,
        ocrScanHistory,
        trainingMasters,
        trainingTests,
        trainingAssignments,
        practicalEvaluations,
        shopfloorMonitoringRecords,
        correctiveTrainingRecords,
        trainingAttendance,
        testSubmissions,
        companies,
        selectedCompanyId,
        setSelectedCompanyId,
        companyTrainingPrograms,
        companyQuestionPapers,
        trainingSignOffSessions,
        ppcRequirementDocs,
        productionPlans,
        ppcCapacitySettings,
        addAuditLog,
        saveProductionReport,
        updateReportStatus,
        addHourlyEntryToReport,
        addRejection,
        addDowntime,
        resolveDowntime,
        updateMachineStatus,
        updateInventoryStock,
        updateMonthlyPlan,
        addMonthlyPlan,
        signDailySummary,
        applyOcrResultToReport,
        addTrainingMaster,
        updateTrainingMaster,
        deleteTrainingMaster,
        assignTraining,
        updateTrainingAssignment,
        markTrainingContentCompleted,
        submitTestResult,
        submitPracticalEvaluation,
        submitShopfloorMonitoring,
        addCorrectiveTraining,
        updateCorrectiveTraining,
        saveTrainingAttendance,
        saveTrainingTest,
        isOperatorQualifiedForMachine,
        addCompanyTrainingProgram,
        updateCompanyTrainingProgram,
        deleteCompanyTrainingProgram,
        importCompanyQuestionPaper,
        updateCompanyQuestionPaper,
        approveQuestionPaper,
        createNewPaperVersion,
        createTrainingSignOffSession,
        signTrainerPreTraining,
        signOperatorAcknowledgement,
        submitSessionDigitalTest,
        addPPCRequirementDoc,
        updatePPCRequirementDoc,
        deletePPCRequirementDoc,
        addProductionPlan,
        updateProductionPlan,
        deleteProductionPlan,
        approveProductionPlan,
        rejectProductionPlan,
        updatePPCCapacitySettings,
        replanForMachineBreakdown,
        generatePlansFromRequirementDoc,
        triggerHaptic,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
