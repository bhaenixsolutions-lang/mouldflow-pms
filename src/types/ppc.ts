/**
 * MouldFlow PMS - Production Planning & PPC Module Types
 * Specifically designed for Injection Moulding manufacturing plant workflows
 */

export type PPCPriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

export type PPCComponentStatus =
  | 'NOT PLANNED'
  | 'PLANNED'
  | 'RUNNING'
  | 'PARTIALLY COMPLETED'
  | 'COMPLETED'
  | 'DELAYED'
  | 'SHORTFALL'
  | 'ON HOLD'
  | 'CANCELLED';

export type PPCPlanApprovalStatus = 'Draft' | 'Under Review' | 'Approved' | 'Rejected';

export type PPCPeriodType = 'SHIFT' | 'DAY' | 'WEEK' | 'FORTNIGHT' | 'MONTH';
export type PPCDisplayFormat = 'LIST' | 'COMPONENT' | 'MACHINE' | 'GANTT';

export type WeekDaysConfig = 6 | 7;
export type FortnightDaysConfig = 14 | 15;
export type MonthDaysConfig = 26 | 30; // 26 Working Days or 30 Calendar Days

export interface PPCShiftTimingConfig {
  shiftId: string;
  shiftCode: string; // Shift A, Shift B, Shift C
  shiftName: string;
  startTime: string; // "06:00"
  endTime: string; // "14:00"
  durationHours: number; // 8
  isActive: boolean;
}

export interface PPCPlantCapacitySettings {
  id: string;
  companyId: string;
  plantName: string;
  departmentId: string;
  workingDaysPerWeek: WeekDaysConfig;
  fortnightDays: FortnightDaysConfig;
  monthlyDays: MonthDaysConfig;
  workingHoursPerDay: number; // 24 for 3 shifts
  shiftTimings: PPCShiftTimingConfig[];
  weeklyOffDays: string[]; // ['Sunday']
  holidays: { date: string; name: string }[];
  plannedMaintenanceHoursPerWeek: number;
  defaultEfficiencyPct: number; // default 85%
  defaultScrapRatePct: number; // default 1.5%
  defaultChangeoverTimeMins: number; // default 45 mins
}

export interface PPCRequirementItem {
  id: string;
  requirementDocId: string;
  partNumber: string;
  componentName: string;
  customer: string;
  customerPartNumber?: string;
  productFamily?: string;
  requiredQuantity: number;
  dueDate: string; // YYYY-MM-DD
  priority: PPCPriority;
  matchedProductId?: string;
  matchedProductName?: string;
  matchedMouldCode?: string;
  matchedCavities?: number;
  matchedCycleTimeSec?: number;
  matchedMachineId?: string;
  matchedMachineCode?: string;
  rawExtractedText?: string;
  confidence?: number;
  notes?: string;
  isApproved: boolean;
  status: 'Matched' | 'Unmatched' | 'Needs Review';
}

export interface PPCRequirementDocument {
  id: string;
  companyId: string;
  documentNumber: string; // PO-2026-SEP-001
  title: string; // "Customer Requirement September 2026"
  customerName: string;
  uploadedAt: string;
  uploadedBy: string;
  fileUrl?: string;
  fileType: 'pdf' | 'jpg' | 'jpeg' | 'png' | 'camera';
  originalFileName: string;
  version: string; // "v1.0", "v1.1", "v2.0"
  status: 'Uploaded' | 'OCR Processed' | 'Reviewed' | 'Approved' | 'Archived';
  ocrConfidence: number;
  totalRequirementQty: number;
  itemsCount: number;
  extractedItems: PPCRequirementItem[];
  approvedBy?: string;
  approvedAt?: string;
  auditTrail: {
    action: string;
    timestamp: string;
    user: string;
    details?: string;
  }[];
}

export interface ProductionPlanRecord {
  id: string;
  companyId: string;
  planNumber: string; // PLN-202609-001
  requirementDocId?: string;
  requirementDocVersion?: string;
  requirementItemId?: string;
  
  // Component & Product Info
  componentPartNumber: string; // CP-1001 / BRK-PCABS-01
  componentName: string; // Housing Front
  customer: string; // ABC Plastics / Schneider Electric
  customerPartNumber?: string;
  productFamily: string; // Automotive / Switchgear / Enclosures
  productId?: string;
  
  // Quantities
  requiredQuantity: number; // 25,000
  alreadyProduced: number; // 8,500
  balanceQuantity: number; // 16,500
  plannedQuantity: number; // 16,500
  
  // Priorities & Scheduling
  priority: PPCPriority;
  dueDate: string; // 2026-09-05
  plannedStartDate: string; // 2026-09-01 06:00
  plannedEndDate: string; // 2026-09-04 14:00
  actualStartDate?: string;
  actualEndDate?: string;
  shiftId?: string;
  shiftCode?: string; // Shift A
  
  // Tooling & Machine
  machineId: string; // mach-imm-03
  machineCode: string; // IMM-03
  machineTonnage: number; // 200T
  mouldCode: string; // M-103 / MLD-HSG-2C
  cavities: number; // 2
  cycleTimeSec: number; // 32 sec
  
  // Output & Rates (Calculated)
  partsPerCycle: number; // cavities
  cyclesPerHour: number; // 3600 / cycleTimeSec
  expectedProductionRatePerHour: number; // (3600 / cycleTimeSec) * cavities * (efficiency / 100)
  targetPerShift: number; // expected hourly rate * shift hours
  targetPerDay: number; // expected shift rate * shifts per day
  
  // Process Parameters
  polymerMaterial: string; // ABS Flame Retardant
  resinGrade?: string;
  masterbatchColor?: string; // Signal Black 2%
  assignedOperatorId?: string;
  assignedOperatorName?: string;
  
  // OEE & Buffers
  efficiencyPct: number; // 85%
  scrapAllowancePct: number; // 1.5%
  changeoverDurationMins: number; // 45 mins
  plannedDowntimeMins: number; // 30 mins
  
  // Status & Audit
  status: PPCComponentStatus;
  planApprovalStatus: PPCPlanApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Breakdown Impact Flag
  isImpactedByBreakdown?: boolean;
  breakdownMachineCode?: string;
  breakdownImpactNote?: string;
}

export interface PPCMachineLoadingMetric {
  machineId: string;
  machineCode: string;
  tonnage: number;
  maker: string;
  status: 'Running' | 'Idle' | 'Breakdown' | 'Setup' | 'Maintenance';
  activeProductId?: string;
  activePlanId?: string;
  activeComponentName?: string;
  totalPlannedHours: number;
  totalAvailableHours: number;
  loadingPercentage: number; // (planned / available) * 100
  isOverloaded: boolean; // loading > 100%
  assignedPlans: ProductionPlanRecord[];
  plannedMaintenanceSlots?: {
    startTime: string;
    endTime: string;
    reason: string;
  }[];
}

export interface PPCGanttTimeSlot {
  timeLabel: string; // "06:00", "08:00", "10:00"
  type: 'Production' | 'Setup' | 'Changeover' | 'Maintenance' | 'Breakdown' | 'Idle';
  planId?: string;
  componentName?: string;
  partNumber?: string;
  quantity?: number;
  color?: string;
  durationMins?: number;
}

export interface PPCMachineTimeline {
  machineId: string;
  machineCode: string;
  tonnage: number;
  status: 'Running' | 'Idle' | 'Breakdown' | 'Setup' | 'Maintenance';
  slots: PPCGanttTimeSlot[];
}

export interface PPCShortfallAnalysis {
  planId: string;
  componentName: string;
  partNumber: string;
  requiredQuantity: number;
  availableCapacity: number;
  shortfallQuantity: number;
  dueDate: string;
  projectedCompletionDate: string;
  hoursShortfall: number;
  recommendedSolutions: {
    type: 'ADD_SHIFT' | 'ALTERNATE_MACHINE' | 'ALTERNATE_MOULD' | 'INCREASE_DAYS' | 'SPLIT_PRODUCTION';
    title: string;
    description: string;
    impactBenefit: string;
    actionLabel: string;
    targetMachineId?: string;
  }[];
}

export interface PPCPlanVsActualVariance {
  planId: string;
  machineCode: string;
  componentName: string;
  partNumber: string;
  plannedQty: number;
  actualQty: number;
  varianceQty: number; // actual - planned
  variancePct: number;
  rejectionQty: number;
  downtimeMinutes: number;
  downtimeReason?: string;
  status: 'ON TRACK' | 'DELAYED' | 'AHEAD' | 'SHORTFALL' | 'CRITICAL';
}
