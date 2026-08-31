/**
 * Injection Moulding Manufacturing Production Management System
 * Core Data Schema & Types Definition
 */

export type UserRole =
  | 'Operator'
  | 'Senior Operator'
  | 'Supervisor'
  | 'Production Supervisor'
  | 'Quality Supervisor'
  | 'Maintenance Supervisor'
  | 'Trainer'
  | 'PPC'
  | 'Production Manager'
  | 'Management'
  | 'Admin';

export type DepartmentType =
  | 'Moulding'
  | 'Insert Assembly'
  | 'Deflashing'
  | 'Packing'
  | 'BDV'
  | 'Custom';

export type MachineStatus =
  | 'Running'
  | 'Idle'
  | 'Breakdown'
  | 'Setup'
  | 'Maintenance';

export type ReportStatus =
  | 'Draft'
  | 'Submitted'
  | 'Verified'
  | 'Approved'
  | 'Locked'
  | 'Rejected';

export interface User {
  id: string;
  name: string;
  employeeCode: string;
  badgeNumber?: string;
  companyId?: string;
  role: UserRole;
  designation?: string;
  departmentId?: string;
  shiftId?: string;
  assignedMachineId?: string;
  assignedMachineCode?: string;
  avatarUrl?: string;
  phone?: string;
  pin: string;
  isActive: boolean;
  skillLevel?: 1 | 2 | 3 | 4; // 1: Trainee, 2: Standard, 3: Senior, 4: Master Technician
  joiningDate?: string;
}

export interface Department {
  id: string;
  name: DepartmentType | string;
  code: string;
  description: string;
  color: string;
  reportTemplateType: DepartmentType;
  customFields: {
    key: string;
    label: string;
    type: 'number' | 'text' | 'boolean' | 'select';
    unit?: string;
    options?: string[];
    required: boolean;
  }[];
  activeMachinesCount?: number;
  totalOperatorsCount?: number;
}

export interface Shift {
  id: string;
  code: string; // Shift A, Shift B, Shift C, General
  name: string;
  startTime: string; // "06:00"
  endTime: string; // "14:00"
  durationHours: number;
  isActive: boolean;
  handoverNotes?: string;
  outgoingSupervisorId?: string;
  incomingSupervisorId?: string;
  handoverTimestamp?: string;
}

export interface Machine {
  id: string;
  code: string; // IMM-01, IMM-02, ASMB-01, BDV-01
  name: string;
  departmentId: string;
  tonnage: number; // e.g. 150 (Tons)
  maker: string; // Demag, Toshiba, Haitian, Engel, Arburg
  modelYear: number;
  status: MachineStatus;
  currentProductId?: string;
  currentOperatorId?: string;
  standardCycleTimeSec: number;
  actualCycleTimeSec?: number;
  totalShotCount: number;
  targetPerHour: number;
  clampingForceKn?: number;
  nozzleTempC?: number;
  barrelTempZones?: number[]; // [Zone1, Zone2, Zone3, Zone4]
  hydraulicPressureBar?: number;
  oilTempC?: number;
  lastMaintenanceDate: string;
  nextMaintenanceDue: string;
}

export interface ProductMould {
  id: string;
  sku: string; // e.g. CON-ABS-8PIN
  name: string;
  mouldCode: string; // e.g. MLD-482-4C
  departmentId: string;
  cavitiesTotal: number; // e.g. 4
  cavitiesActive: number; // e.g. 4
  polymerMaterial: string; // ABS, PP, Polycarbonate, Nylon 66, POM
  resinGrade: string; // e.g. SABIC Cycolac MG47F
  masterbatchColor: string; // e.g. Black 2%, Signal Red
  shotWeightGrams: number; // total shot weight including runner
  partWeightGrams: number; // single part weight
  runnerWeightGrams: number;
  standardCycleTimeSec: number;
  targetPerHour: number;
  standardScrapRatePct: number;
  unitCostCurrency: number;
  customerName: string;
  imageThumbnail?: string;
}

export interface RejectionDefectType {
  code: string;
  name: string;
  category: 'Dimensional' | 'Cosmetic' | 'Material/Process' | 'Assembly' | 'Electrical';
  departmentId: string;
  isReworkable: boolean;
  commonCauses: string[];
  suggestedAction: string;
}

export interface DowntimeCategoryType {
  code: string;
  name: string;
  group: 'Machine' | 'Mould/Tooling' | 'Material' | 'Manpower' | 'Method/Quality' | 'Utility';
  departmentId: string;
  defaultDurationMin?: number;
}

export interface HourlyReportEntry {
  hourIndex: number; // 1 to 8 (for an 8-hour shift)
  timeSlotLabel: string; // "06:00 - 07:00"
  targetQty: number;
  actualQty: number;
  rejectQty: number;
  rejectionCode?: string; // Code A-M
  rejectReason?: string; // Descriptive reason
  rejectDefectCode?: string; // Legacy support
  downtimeMinutes: number;
  downtimeCode?: string; // Code 1-10
  downtimeReason?: string; // Descriptive reason
  downtimeReasonCode?: string; // Legacy support
  runnerWeightGrams?: number;
  lumpQuantityKg?: number;
  cavityCount?: number;
  remarks?: string;
  notes?: string;
  isUncertain?: boolean; // Flagged by OCR if confidence is low
  uncertainFields?: string[];
  
  // Department-specific parameters
  mouldingFields?: {
    shotCount: number;
    cycleTimeSec: number;
    meltTempC: number;
    cushionMm: number;
    hydraulicPressureBar: number;
    runnerWeightGrams: number;
    lumpKg?: number;
  };
  insertAssemblyFields?: {
    insertLotNo: string;
    insertType: string;
    jigId: string;
    loadedInsertsQty: number;
    assembledOkQty: number;
    misalignedScrap: number;
  };
  deflashingFields?: {
    batchNo: string;
    trimMethod: 'Manual' | 'Cryogenic' | 'Ultrasonic';
    qtyReceived: number;
    flashDefectQty: number;
    gougedScrapQty: number;
  };
  packingFields?: {
    stationId: string;
    cartonNo: string;
    boxCapacity: number;
    polybagVerified: boolean;
    barcodeScanned: boolean;
    boxesPackedQty: number;
  };
  bdvFields?: {
    testBenchId: string;
    testVoltageKV: number;
    leakageCurrentMA: number;
    insulationResistanceMOhms: number;
    sparkBreakdownCount: number;
    passRatePct: number;
  };
}

export interface ProductionReport {
  id: string;
  reportNumber: string; // PR-20260825-IMM01-A
  date: string; // YYYY-MM-DD
  shiftId: string;
  departmentId: string;
  machineId: string;
  productId: string;
  operatorId: string;
  operatorName?: string;
  supervisorId?: string;
  supervisorName?: string;
  partName?: string;
  materialName?: string;
  cycleTimeSec?: number;
  targetPerHour?: number;
  cavityCount?: number;
  runnerWeightGrams?: number;
  lumpQuantityKg?: number;
  status: ReportStatus;
  
  hourlyEntries: HourlyReportEntry[];
  
  // Calculated summaries
  totalTarget: number;
  totalActual: number;
  totalReject: number;
  totalDowntimeMinutes: number;
  efficiencyPct: number; // (actual / target) * 100
  scrapRatePct: number; // (reject / (actual + reject)) * 100
  availabilityPct: number;
  performancePct: number;
  qualityPct: number;
  oeePct: number;
  
  operatorNotes?: string;
  supervisorRemarks?: string;
  managerRemarks?: string;
  
  createdAt: string;
  submittedAt?: string;
  verifiedAt?: string;
  approvedAt?: string;
  
  ocrSourceImage?: string;
  originalImageUrl?: string;
  isOcrGenerated?: boolean;
  ocrConfidenceScore?: number;
  uncertainFields?: string[];
  missingFields?: string[];
}

export interface RejectionLogItem {
  id: string;
  reportId: string;
  date: string;
  shiftId: string;
  departmentId: string;
  machineId: string;
  productId: string;
  hourIndex: number;
  defectCode: string;
  defectName: string;
  quantity: number;
  isReworkable: boolean;
  scrapCostTotal: number;
  rootCauseNote?: string;
  operatorId: string;
}

export interface DowntimeLogItem {
  id: string;
  reportId: string;
  date: string;
  shiftId: string;
  departmentId: string;
  machineId: string;
  hourIndex: number;
  categoryCode: string;
  categoryName: string;
  durationMinutes: number;
  startTime?: string;
  endTime?: string;
  technicianAssigned?: string;
  actionTaken?: string;
  isResolved: boolean;
  operatorId: string;
}

export interface MonthlyProductionPlan {
  id: string;
  month: number; // 1-12
  year: number; // 2026
  productId: string;
  departmentId: string;
  mouldCode: string;
  machineId: string;
  targetQuantity: number;
  producedQuantity: number;
  rawResinRequiredKg: number;
  rawResinAllocatedKg: number;
  workingDays: number;
  dailyTargetQty: number;
  status: 'Draft' | 'Active' | 'Completed';
  ppcNotes?: string;
  assignedOperatorsCount: number;
}

export interface InventoryItem {
  id: string;
  itemType: 'RawResin' | 'Masterbatch' | 'InsertComponent' | 'WIP' | 'FinishedGoods' | 'Packaging';
  itemCode: string;
  name: string;
  departmentId: string;
  currentStock: number;
  unit: 'kg' | 'pcs' | 'bags' | 'cartons' | 'boxes';
  minSafetyStock: number;
  maxStock: number;
  batchLotNo: string;
  storageLocation: string; // e.g. Bin-M12, Silo-02
  unitPrice: number;
  lastUpdated: string;
}

export interface MachinePlanningSlot {
  id: string;
  date: string;
  shiftId: string;
  machineId: string;
  productId: string;
  plannedHours: number;
  plannedQty: number;
  isMoldChangeover: boolean;
  changeoverDurationMin: number;
  status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Delayed';
}

export interface ManpowerAllocation {
  id: string;
  date: string;
  shiftId: string;
  departmentId: string;
  machineId: string;
  operatorId: string;
  backupOperatorId?: string;
  skillMatchScore: number; // percentage
  attendanceStatus: 'Present' | 'Absent' | 'Substituted';
}

export interface DailySummary {
  id: string;
  date: string;
  shiftId: string;
  departmentId: string;
  totalPlanned: number;
  totalProduced: number;
  totalGood: number;
  totalScrap: number;
  scrapRatePct: number;
  totalDowntimeMinutes: number;
  oeePct: number;
  availabilityPct: number;
  performancePct: number;
  qualityPct: number;
  supervisorSigned: boolean;
  supervisorSignoffTime?: string;
  managerSigned: boolean;
  managerSignoffTime?: string;
  status: 'Pending' | 'Supervisor-Verified' | 'Manager-Approved';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SUBMIT' | 'VERIFY' | 'APPROVE' | 'REJECT' | 'OCR_EXTRACT' | 'LOCK' | 'EXPORT';
  module: string;
  entityId: string;
  description: string;
  details?: Record<string, any>;
}

export interface OCRParsedHourRow {
  hour: number;
  timeSlot: string;
  target?: number;
  actual: number;
  reject: number;
  rejectionCode?: string; // e.g. A, B, C... M
  rejectReason?: string;
  downtimeMin: number;
  downtimeCode?: string; // e.g. 1, 2, 3... 10
  downtimeReason?: string;
  runnerWeightGrams?: number;
  lumpQuantityKg?: number;
  remarks?: string;
  isUncertain?: boolean;
  uncertainFields?: string[];
}

export interface OCRScanResult {
  scanJobId: string;
  timestamp: string;
  imageThumbnail: string;
  confidenceScore: number;
  recognizedDepartment: string;
  recognizedMachineCode: string;
  recognizedShift: string;
  recognizedDate: string;
  recognizedOperatorName?: string;
  recognizedSupervisorName?: string;
  recognizedProductSku: string;
  recognizedProductName?: string;
  recognizedMaterialName?: string;
  recognizedCycleTimeSec?: number;
  recognizedTargetPerHour?: number;
  recognizedCavityCount?: number;
  recognizedRunnerWeightGrams?: number;
  recognizedLumpQuantityKg?: number;
  recognizedRemarks?: string;
  
  parsedHourlyRows: OCRParsedHourRow[];
  totalActual: number;
  totalReject: number;
  totalDowntime: number;
  
  uncertainFields: string[];
  missingFields: string[];
  rawTextExcerpt?: string;
}

export const REJECTION_CODES_MAP: Record<string, { code: string; name: string; description: string }> = {
  A: { code: 'A', name: 'Short Shot', description: 'Incomplete fill / short moulding' },
  B: { code: 'B', name: 'Flash / Burr', description: 'Parting line excessive material' },
  C: { code: 'C', name: 'Sink Mark', description: 'Surface depression / shrinkage' },
  D: { code: 'D', name: 'Burn Mark', description: 'Dieseling / trapped air burn' },
  E: { code: 'E', name: 'Silver Streaks', description: 'Moisture / splay marks' },
  F: { code: 'F', name: 'Flow Marks', description: 'Weld line / knit line defect' },
  G: { code: 'G', name: 'Warpage', description: 'Dimensional bending / distortion' },
  H: { code: 'H', name: 'Jetting', description: 'Snake lines near gate entrance' },
  I: { code: 'I', name: 'Ejector Pin Mark', description: 'Push mark / white stress mark' },
  J: { code: 'J', name: 'Color Shade Variation', description: 'Masterbatch streak / shade mismatch' },
  K: { code: 'K', name: 'Black Specs', description: 'Foreign contamination / degraded resin' },
  L: { code: 'L', name: 'Dimension Out of Spec', description: 'Tolerance limit breached' },
  M: { code: 'M', name: 'Oil / Grease Mark', description: 'Tool pin lubrication contamination' },
};

export const DOWNTIME_CODES_MAP: Record<string, { code: string; name: string; description: string }> = {
  '1': { code: '1', name: 'Mould / Tooling Breakdown', description: 'Core/cavity damage, pin broken, water leak' },
  '2': { code: '2', name: 'Machine Breakdown', description: 'Hydraulic leak, electrical trip, screw motor' },
  '3': { code: '3', name: 'Material Shortage / Dryer', description: 'Hopper empty, resin drying delay, loader jam' },
  '4': { code: '4', name: 'Heater Band / Temp Fault', description: 'Thermocouple failure, barrel zone alarm' },
  '5': { code: '5', name: 'No Operator / Relief Break', description: 'Absenteeism, lunch rotation gap' },
  '6': { code: '6', name: 'Quality Hold / First Piece', description: 'QA sample approval pending, dimension audit' },
  '7': { code: '7', name: 'Utility Failure', description: 'Power grid trip, chilled water, air pressure' },
  '8': { code: '8', name: 'Mould / Color Changeover', description: 'Planned tool setup, barrel purging' },
  '9': { code: '9', name: 'Robot / Automation Jam', description: 'Conveyor fault, parts picker error' },
  '10': { code: '10', name: 'Startup Scrap / Tuning', description: 'Parameter stabilization, purging' },
};

export interface AIRecommendation {
  id: string;
  title: string;
  department: string;
  machineCode: string;
  defectTrigger: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  analysis: string;
  parameterAdjustments: {
    parameter: string;
    currentValue: string;
    suggestedValue: string;
    reason: string;
  }[];
  preventiveAction: string;
  timestamp: string;
}
