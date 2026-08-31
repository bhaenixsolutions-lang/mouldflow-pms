import {
  Machine,
  ProductMould,
  ProductionReport,
  Shift,
  User,
  Department,
  DowntimeLogItem,
  RejectionLogItem,
} from '../types/schema';

export type MachineLiveColor = 'green' | 'orange' | 'red' | 'grey';

export interface MachineLiveMetric {
  machine: Machine;
  product?: ProductMould;
  operator?: User;
  supervisor?: User;
  department?: Department;
  shift: Shift;
  report?: ProductionReport;
  
  // Current hour index (1 to 8)
  currentHour: number;
  
  // Core metrics
  targetQty: number;
  actualQty: number;
  achievementPct: number;
  rejectionQty: number;
  rejectionPct: number;
  downtimeMinutes: number;
  
  // OEE Components
  availabilityPct: number;
  performancePct: number;
  qualityPct: number;
  oeePct: number;
  
  // Status logic
  isReportMissing: boolean;
  liveColor: MachineLiveColor;
  statusLabel: string;
  statusReason: string;
  
  // Hourly breakdown for drilldown
  hourlyTrend: {
    hour: number;
    timeSlot: string;
    target: number;
    actual: number;
    reject: number;
    downtimeMin: number;
    achievePct: number;
    oee: number;
    notes?: string;
  }[];
}

export interface ProductMachineComboMetric {
  machineId: string;
  machineCode: string;
  machineName: string;
  productId: string;
  productSku: string;
  productName: string;
  departmentName: string;
  
  totalProduction: number;
  totalTarget: number;
  achievementPct: number;
  totalRejection: number;
  rejectionPct: number;
  totalDowntimeMinutes: number;
  
  availabilityPct: number;
  performancePct: number;
  qualityPct: number;
  oeePct: number;
  
  productionHours: number;
  operators: { id: string; name: string; count: number }[];
  isBestPerformer?: boolean;
  isWorstPerformer?: boolean;
}

export interface OperatorPerformanceMetric {
  operatorId: string;
  operatorName: string;
  employeeCode: string;
  departmentName: string;
  skillLevel: number;
  
  machinesWorked: string[];
  productsHandled: string[];
  
  totalProduction: number;
  totalTarget: number;
  achievementPct: number;
  totalRejection: number;
  rejectionPct: number;
  downtimeMinutes: number;
  
  availabilityPct: number;
  performancePct: number;
  qualityPct: number;
  oeePct: number;
  
  reportsSubmittedCount: number;
  missingReportsCount: number;
  pendingReportsCount: number;
  verifiedReportsCount: number;
  verificationStatusPct: number;
}

export interface SupervisorPerformanceMetric {
  supervisorId: string;
  supervisorName: string;
  employeeCode: string;
  departmentName: string;
  shiftName: string;
  
  machinesSupervisedCount: number;
  machinesList: string[];
  operatorsSupervisedCount: number;
  operatorsList: string[];
  
  totalProduction: number;
  totalTarget: number;
  targetAchievementPct: number;
  rejectionPct: number;
  totalRejection: number;
  totalDowntimeMinutes: number;
  oeePct: number;
  
  reportsVerifiedCount: number;
  reportsPendingCount: number;
  missingReportsCount: number;
  approvalTurnaroundTime: string; // e.g. "14 mins"
}

/**
 * Computes live status and KPI metrics for every machine based on real reports and machine telemetry.
 */
export function computeMachinesLiveMetrics(
  machines: Machine[],
  products: ProductMould[],
  users: User[],
  departments: Department[],
  reports: ProductionReport[],
  activeShift: Shift,
  selectedDate: string = '2026-08-25',
  selectedDepartmentId: string = 'all'
): MachineLiveMetric[] {
  const filteredMachines = machines.filter((m) => {
    return selectedDepartmentId === 'all' || m.departmentId === selectedDepartmentId;
  });

  return filteredMachines.map((machine) => {
    const dept = departments.find((d) => d.id === machine.departmentId);
    
    // Find matching shift report for this machine and date
    const report = reports.find(
      (r) =>
        r.machineId === machine.id &&
        (r.shiftId === activeShift.id || !r.shiftId) &&
        (r.date === selectedDate || !r.date)
    );

    const product = products.find((p) => p.id === (report?.productId || machine.currentProductId));
    const operator = users.find((u) => u.id === (report?.operatorId || machine.currentOperatorId));
    const supervisor = users.find((u) => u.id === (report?.supervisorId || 'usr-sup-01'));

    const entries = report?.hourlyEntries || [];
    const loggedHoursCount = entries.length;
    const currentHour = loggedHoursCount > 0 ? Math.min(8, loggedHoursCount) : 1;

    let targetQty = 0;
    let actualQty = 0;
    let rejectionQty = 0;
    let downtimeMinutes = 0;

    const hourlyTrend = [];

    if (entries.length > 0) {
      targetQty = entries.reduce((sum, e) => sum + (e.targetQty || 0), 0);
      actualQty = entries.reduce((sum, e) => sum + (e.actualQty || 0), 0);
      rejectionQty = entries.reduce((sum, e) => sum + (e.rejectQty || 0), 0);
      downtimeMinutes = entries.reduce((sum, e) => sum + (e.downtimeMinutes || 0), 0);

      entries.forEach((e) => {
        const ach = e.targetQty > 0 ? (e.actualQty / e.targetQty) * 100 : 0;
        const opTime = 60;
        const dt = e.downtimeMinutes || 0;
        const avail = Math.max(0, ((opTime - dt) / opTime) * 100);
        const perf = e.targetQty > 0 ? Math.min(100, (e.actualQty / e.targetQty) * 100) : 100;
        const qual = (e.actualQty + (e.rejectQty || 0)) > 0 ? (e.actualQty / (e.actualQty + (e.rejectQty || 0))) * 100 : 100;
        const oee = (avail * perf * qual) / 10000;

        hourlyTrend.push({
          hour: e.hourIndex,
          timeSlot: e.timeSlotLabel,
          target: e.targetQty,
          actual: e.actualQty,
          reject: e.rejectQty || 0,
          downtimeMin: e.downtimeMinutes || 0,
          achievePct: Number(ach.toFixed(1)),
          oee: Number(oee.toFixed(1)),
          notes: e.notes,
        });
      });
    } else {
      // If no report exists, calculate expected target for elapsed hour based on machine rate
      const hourlyTarget = machine.targetPerHour || product?.targetPerHour || 500;
      targetQty = hourlyTarget * currentHour;
      actualQty = 0;
      rejectionQty = 0;
      downtimeMinutes = machine.status === 'Breakdown' ? 120 : machine.status === 'Idle' ? 60 : 0;
    }

    const achievementPct = targetQty > 0 ? (actualQty / targetQty) * 100 : 0;
    const rejectionPct = (actualQty + rejectionQty) > 0 ? (rejectionQty / (actualQty + rejectionQty)) * 100 : 0;

    // Time calculations (Operating planned time in min)
    const plannedOperatingMinutes = Math.max(60, loggedHoursCount * 60);
    const availabilityPct = Math.max(
      0,
      Math.min(100, ((plannedOperatingMinutes - downtimeMinutes) / plannedOperatingMinutes) * 100)
    );
    const performancePct = targetQty > 0 ? Math.min(100, (actualQty / targetQty) * 100) : (machine.status === 'Running' ? 95 : 0);
    const qualityPct = (actualQty + rejectionQty) > 0 ? ((actualQty / (actualQty + rejectionQty)) * 100) : 100;
    const oeePct = (availabilityPct * performancePct * qualityPct) / 10000;

    // Determine Status and Color
    // GREEN = Running / report received and performing well
    // ORANGE = Running but performance below target / pending verification
    // RED = Report missing / machine stopped / critical issue
    // GREY = Machine not active
    const isReportMissing = !report || report.status === 'Draft' && entries.length === 0;

    let liveColor: MachineLiveColor = 'grey';
    let statusLabel: string = machine.status;
    let statusReason = '';

    if (machine.status === 'Maintenance') {
      liveColor = 'grey';
      statusLabel = 'Under Maintenance';
      statusReason = 'Scheduled PM or offline';
    } else if (machine.status === 'Breakdown') {
      liveColor = 'red';
      statusLabel = 'Machine Breakdown';
      statusReason = 'Unscheduled hydraulic/electrical stop';
    } else if (isReportMissing) {
      liveColor = 'red';
      statusLabel = 'HOURLY REPORT MISSING';
      statusReason = `No physical log sheet uploaded for ${activeShift.code}`;
    } else if (report?.status === 'Rejected') {
      liveColor = 'red';
      statusLabel = 'Report Rejected';
      statusReason = 'Supervisor returned report for rescan';
    } else if (report?.status === 'Submitted') {
      liveColor = 'orange';
      statusLabel = 'Pending Verification';
      statusReason = 'Uploaded by operator; awaiting supervisor sign-off';
    } else if (achievementPct < 85 || oeePct < 75) {
      liveColor = 'orange';
      statusLabel = 'Low Performance Warning';
      statusReason = `Achievement at ${achievementPct.toFixed(1)}% (below 85% target)`;
    } else if (machine.status === 'Running') {
      liveColor = 'green';
      statusLabel = 'Running Normal';
      statusReason = `Target achievement: ${achievementPct.toFixed(1)}%, OEE: ${oeePct.toFixed(1)}%`;
    } else {
      liveColor = 'orange';
      statusLabel = machine.status;
      statusReason = 'Setup / Idle standby';
    }

    return {
      machine,
      product,
      operator,
      supervisor,
      department: dept,
      shift: activeShift,
      report,
      currentHour,
      targetQty,
      actualQty,
      achievementPct: Number(achievementPct.toFixed(1)),
      rejectionQty,
      rejectionPct: Number(rejectionPct.toFixed(2)),
      downtimeMinutes,
      availabilityPct: Number(availabilityPct.toFixed(1)),
      performancePct: Number(performancePct.toFixed(1)),
      qualityPct: Number(qualityPct.toFixed(1)),
      oeePct: Number(oeePct.toFixed(1)),
      isReportMissing,
      liveColor,
      statusLabel,
      statusReason,
      hourlyTrend,
    };
  });
}

/**
 * Calculates Product + Machine performance matrix for every combination.
 */
export function computeProductMachinePerformance(
  machines: Machine[],
  products: ProductMould[],
  reports: ProductionReport[],
  users: User[],
  departments: Department[]
): ProductMachineComboMetric[] {
  const map = new Map<string, ProductMachineComboMetric>();

  // Initialize combinations from machines with their current or reported products
  machines.forEach((m) => {
    const defaultProd = products.find((p) => p.id === m.currentProductId);
    const dept = departments.find((d) => d.id === m.departmentId);

    if (defaultProd) {
      const key = `${m.id}__${defaultProd.id}`;
      if (!map.has(key)) {
        map.set(key, {
          machineId: m.id,
          machineCode: m.code,
          machineName: m.name,
          productId: defaultProd.id,
          productSku: defaultProd.sku,
          productName: defaultProd.name,
          departmentName: dept?.name || 'Moulding',
          totalProduction: 0,
          totalTarget: 0,
          achievementPct: 0,
          totalRejection: 0,
          rejectionPct: 0,
          totalDowntimeMinutes: 0,
          availabilityPct: 100,
          performancePct: 100,
          qualityPct: 100,
          oeePct: 0,
          productionHours: 0,
          operators: [],
        });
      }
    }
  });

  // Aggregate actual production reports
  reports.forEach((rep) => {
    const mach = machines.find((m) => m.id === rep.machineId);
    const prod = products.find((p) => p.id === rep.productId);
    const dept = departments.find((d) => d.id === rep.departmentId);
    const op = users.find((u) => u.id === rep.operatorId);

    if (!mach || !prod) return;

    const key = `${mach.id}__${prod.id}`;
    let item = map.get(key);

    if (!item) {
      item = {
        machineId: mach.id,
        machineCode: mach.code,
        machineName: mach.name,
        productId: prod.id,
        productSku: prod.sku,
        productName: prod.name,
        departmentName: dept?.name || 'Moulding',
        totalProduction: 0,
        totalTarget: 0,
        achievementPct: 0,
        totalRejection: 0,
        rejectionPct: 0,
        totalDowntimeMinutes: 0,
        availabilityPct: 100,
        performancePct: 100,
        qualityPct: 100,
        oeePct: 0,
        productionHours: 0,
        operators: [],
      };
      map.set(key, item);
    }

    item.totalProduction += rep.totalActual || 0;
    item.totalTarget += rep.totalTarget || (mach.targetPerHour * (rep.hourlyEntries?.length || 8));
    item.totalRejection += rep.totalReject || 0;
    item.totalDowntimeMinutes += rep.totalDowntimeMinutes || 0;
    item.productionHours += rep.hourlyEntries?.length || 8;

    if (op) {
      const existingOp = item.operators.find((o) => o.id === op.id);
      if (existingOp) {
        existingOp.count += 1;
      } else {
        item.operators.push({ id: op.id, name: op.name, count: 1 });
      }
    }
  });

  const results: ProductMachineComboMetric[] = Array.from(map.values()).map((combo) => {
    const ach = combo.totalTarget > 0 ? (combo.totalProduction / combo.totalTarget) * 100 : 0;
    const rejPct = (combo.totalProduction + combo.totalRejection) > 0
      ? (combo.totalRejection / (combo.totalProduction + combo.totalRejection)) * 100
      : 0;

    const totalOpMinutes = Math.max(60, combo.productionHours * 60);
    const avail = Math.max(0, Math.min(100, ((totalOpMinutes - combo.totalDowntimeMinutes) / totalOpMinutes) * 100));
    const perf = combo.totalTarget > 0 ? Math.min(100, (combo.totalProduction / combo.totalTarget) * 100) : 95;
    const qual = (combo.totalProduction + combo.totalRejection) > 0
      ? (combo.totalProduction / (combo.totalProduction + combo.totalRejection)) * 100
      : 100;
    const oee = (avail * perf * qual) / 10000;

    return {
      ...combo,
      achievementPct: Number(ach.toFixed(1)),
      rejectionPct: Number(rejPct.toFixed(2)),
      availabilityPct: Number(avail.toFixed(1)),
      performancePct: Number(perf.toFixed(1)),
      qualityPct: Number(qual.toFixed(1)),
      oeePct: Number(oee.toFixed(1)),
    };
  });

  // Identify Best and Worst
  if (results.length > 0) {
    const sortedByOee = [...results].sort((a, b) => b.oeePct - a.oeePct);
    sortedByOee[0].isBestPerformer = true;
    if (sortedByOee.length > 1) {
      sortedByOee[sortedByOee.length - 1].isWorstPerformer = true;
    }
  }

  return results;
}

/**
 * Computes live Operator Performance metrics.
 */
export function computeOperatorPerformance(
  users: User[],
  reports: ProductionReport[],
  machines: Machine[],
  products: ProductMould[],
  departments: Department[],
  activeShift: Shift
): OperatorPerformanceMetric[] {
  const operators = users.filter((u) => u.role === 'Operator' || u.role === 'Admin');

  return operators.map((op) => {
    const dept = departments.find((d) => d.id === op.departmentId);
    const opReports = reports.filter((r) => r.operatorId === op.id);

    const machinesWorkedSet = new Set<string>();
    const productsHandledSet = new Set<string>();

    let totalProduction = 0;
    let totalTarget = 0;
    let totalRejection = 0;
    let downtimeMinutes = 0;
    let productionHours = 0;

    let submittedCount = opReports.length;
    let verifiedCount = 0;
    let pendingCount = 0;

    opReports.forEach((r) => {
      totalProduction += r.totalActual || 0;
      totalTarget += r.totalTarget || 0;
      totalRejection += r.totalReject || 0;
      downtimeMinutes += r.totalDowntimeMinutes || 0;
      productionHours += r.hourlyEntries?.length || 8;

      const mach = machines.find((m) => m.id === r.machineId);
      if (mach) machinesWorkedSet.add(mach.code);

      const prod = products.find((p) => p.id === r.productId);
      if (prod) productsHandledSet.add(prod.sku);

      if (r.status === 'Verified' || r.status === 'Approved') {
        verifiedCount++;
      } else if (r.status === 'Submitted') {
        pendingCount++;
      }
    });

    // Also check currently assigned machine
    const assignedMach = machines.find((m) => m.currentOperatorId === op.id);
    if (assignedMach) {
      machinesWorkedSet.add(assignedMach.code);
      if (assignedMach.currentProductId) {
        const p = products.find((prod) => prod.id === assignedMach.currentProductId);
        if (p) productsHandledSet.add(p.sku);
      }
    }

    // Missing reports: if operator has assigned machine but 0 reports in active shift
    const missingReportsCount = assignedMach && opReports.length === 0 ? 1 : 0;

    const achievementPct = totalTarget > 0 ? (totalProduction / totalTarget) * 100 : 0;
    const rejectionPct = (totalProduction + totalRejection) > 0
      ? (totalRejection / (totalProduction + totalRejection)) * 100
      : 0;

    const opTimeMin = Math.max(60, productionHours * 60);
    const avail = Math.max(0, Math.min(100, ((opTimeMin - downtimeMinutes) / opTimeMin) * 100));
    const perf = totalTarget > 0 ? Math.min(100, (totalProduction / totalTarget) * 100) : 95;
    const qual = (totalProduction + totalRejection) > 0
      ? (totalProduction / (totalProduction + totalRejection)) * 100
      : 100;
    const oee = (avail * perf * qual) / 10000;
    const verificationStatusPct = submittedCount > 0 ? (verifiedCount / submittedCount) * 100 : 100;

    return {
      operatorId: op.id,
      operatorName: op.name,
      employeeCode: op.employeeCode,
      departmentName: dept?.name || 'Moulding',
      skillLevel: op.skillLevel || 3,
      machinesWorked: Array.from(machinesWorkedSet),
      productsHandled: Array.from(productsHandledSet),
      totalProduction,
      totalTarget,
      achievementPct: Number(achievementPct.toFixed(1)),
      totalRejection,
      rejectionPct: Number(rejectionPct.toFixed(2)),
      downtimeMinutes,
      availabilityPct: Number(avail.toFixed(1)),
      performancePct: Number(perf.toFixed(1)),
      qualityPct: Number(qual.toFixed(1)),
      oeePct: Number(oee.toFixed(1)),
      reportsSubmittedCount: submittedCount,
      missingReportsCount,
      pendingReportsCount: pendingCount,
      verifiedReportsCount: verifiedCount,
      verificationStatusPct: Number(verificationStatusPct.toFixed(0)),
    };
  });
}

/**
 * Computes live Supervisor Performance metrics.
 */
export function computeSupervisorPerformance(
  users: User[],
  reports: ProductionReport[],
  machines: Machine[],
  departments: Department[],
  shifts: Shift[],
  activeShift: Shift
): SupervisorPerformanceMetric[] {
  const supervisors = users.filter((u) => u.role === 'Supervisor' || u.role === 'Production Manager');

  return supervisors.map((sup) => {
    const dept = departments.find((d) => d.id === sup.departmentId);
    const shift = shifts.find((s) => s.id === sup.shiftId) || activeShift;

    // Reports under this supervisor or department/shift
    const supReports = reports.filter(
      (r) => r.supervisorId === sup.id || (r.departmentId === sup.departmentId && r.shiftId === shift.id)
    );

    const machinesSupervisedSet = new Set<string>();
    const operatorsSupervisedSet = new Set<string>();

    let totalProduction = 0;
    let totalTarget = 0;
    let totalRejection = 0;
    let totalDowntimeMinutes = 0;
    let verifiedCount = 0;
    let pendingCount = 0;

    supReports.forEach((r) => {
      totalProduction += r.totalActual || 0;
      totalTarget += r.totalTarget || 0;
      totalRejection += r.totalReject || 0;
      totalDowntimeMinutes += r.totalDowntimeMinutes || 0;

      const mach = machines.find((m) => m.id === r.machineId);
      if (mach) machinesSupervisedSet.add(mach.code);

      const op = users.find((u) => u.id === r.operatorId);
      if (op) operatorsSupervisedSet.add(op.name);

      if (r.status === 'Verified' || r.status === 'Approved') {
        verifiedCount++;
      } else if (r.status === 'Submitted') {
        pendingCount++;
      }
    });

    // Machines in their department
    const deptMachines = machines.filter((m) => !sup.departmentId || m.departmentId === sup.departmentId);
    deptMachines.forEach((m) => machinesSupervisedSet.add(m.code));

    // Operators in their department
    const deptOps = users.filter((u) => u.role === 'Operator' && (!sup.departmentId || u.departmentId === sup.departmentId));
    deptOps.forEach((o) => operatorsSupervisedSet.add(o.name));

    // Missing reports = machines in department without a verified/submitted report
    const reportedMachineIds = new Set(supReports.map((r) => r.machineId));
    const missingReportsCount = deptMachines.filter((m) => !reportedMachineIds.has(m.id)).length;

    const ach = totalTarget > 0 ? (totalProduction / totalTarget) * 100 : 0;
    const rejPct = (totalProduction + totalRejection) > 0
      ? (totalRejection / (totalProduction + totalRejection)) * 100
      : 0;

    const plannedOpMinutes = Math.max(60, deptMachines.length * 480);
    const avail = Math.max(0, Math.min(100, ((plannedOpMinutes - totalDowntimeMinutes) / plannedOpMinutes) * 100));
    const perf = totalTarget > 0 ? Math.min(100, (totalProduction / totalTarget) * 100) : 94.5;
    const qual = (totalProduction + totalRejection) > 0
      ? (totalProduction / (totalProduction + totalRejection)) * 100
      : 100;
    const oee = (avail * perf * qual) / 10000;

    return {
      supervisorId: sup.id,
      supervisorName: sup.name,
      employeeCode: sup.employeeCode,
      departmentName: dept?.name || 'Plant Shopfloor',
      shiftName: shift.name,
      machinesSupervisedCount: machinesSupervisedSet.size,
      machinesList: Array.from(machinesSupervisedSet),
      operatorsSupervisedCount: operatorsSupervisedSet.size,
      operatorsList: Array.from(operatorsSupervisedSet),
      totalProduction,
      totalTarget,
      targetAchievementPct: Number(ach.toFixed(1)),
      rejectionPct: Number(rejPct.toFixed(2)),
      totalRejection,
      totalDowntimeMinutes,
      oeePct: Number(oee.toFixed(1)),
      reportsVerifiedCount: verifiedCount,
      reportsPendingCount: pendingCount,
      missingReportsCount,
      approvalTurnaroundTime: verifiedCount > 0 ? '12 - 18 mins' : 'Pending',
    };
  });
}
