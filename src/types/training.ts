import { UserRole } from './schema';

export type TrainingCategory =
  | 'Machine Operation'
  | 'Process Knowledge'
  | 'Quality'
  | 'Safety'
  | '5S'
  | 'Preventive Maintenance Awareness'
  | 'Troubleshooting'
  | 'Defect Identification'
  | 'Production Documentation'
  | 'Emergency Procedure'
  | 'Company / Process SOP'
  | 'Safety & EHS'
  | 'Quality & Defects'
  | 'Process & Moulding SOP'
  | 'Maintenance & Mold Change'
  | 'Material & 5S'
  | 'Supervisor Leadership';

export type TrainingMode =
  | 'Classroom'
  | 'On-the-job Training'
  | 'Practical'
  | 'Video'
  | 'SOP Reading'
  | 'Demonstration'
  | 'Assessment';

export type TrainingStatus = 'Active' | 'Under Revision' | 'Archived';

export type AssignmentStatus =
  | 'Assigned'
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Failed'
  | 'Overdue'
  | 'Expired';

export type AssignmentPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type CompetencyRating = 1 | 2 | 3 | 4 | 5; // 1 = Not Competent, 2 = Needs Improvement, 3 = Competent, 4 = Good, 5 = Excellent

export type CompetencyResult = 'Competent' | 'Conditionally Competent' | 'Not Competent' | 'Needs Supervision';

export type CheckpointStatus = 'OK' | 'Not OK' | 'Needs Improvement' | 'Not Applicable';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Rescheduled';

// 1. Training Master / Library
export interface TrainingMaster {
  id: string;
  code: string; // e.g. TRN-INJ-01
  title: string;
  category: TrainingCategory;
  departmentId?: string; // 'all' or dept id
  applicableRoles?: UserRole[];
  targetRole?: UserRole[];
  machineIds?: string[];
  trainingType: TrainingMode;
  trainerId?: string;
  trainerName?: string;
  durationMinutes: number;
  validityMonths?: number; // e.g. 12 months, 0 = permanent
  validityPeriodMonths?: number;
  revision?: string; // e.g. "v2.0"
  sopVersion?: string;
  objective?: string;
  description?: string;
  sopDocumentNumber?: string;
  learningPoints?: string[];
  learningObjectives?: string[];
  sopInstructions?: string;
  safetyPoints?: string[];
  practicalSteps?: string[];
  practicalCheckpoints?: any[];
  precautions?: string[];
  referenceDocs?: { name: string; type: string }[];
  attachments?: any[];
  passingCriteriaPct?: number; // e.g. 80%
  passingScorePct?: number;
  status?: TrainingStatus;
  isActive?: boolean;
  testId?: string;
  isMachineSpecific?: boolean;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// 2. Test Question Definition
export interface TestQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'true_false' | 'multiple_answer' | 'short_answer';
  options: string[];
  correctAnswer: number | number[] | boolean | string;
  marks: number;
  points?: number;
  topic: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  explanation: string;
}

// 3. Training Test / Assessment Master
export interface TrainingTest {
  id: string;
  trainingId: string;
  trainingTitle?: string;
  title: string;
  instructions: string;
  totalMarks: number;
  passingPct: number;
  passingScorePct?: number;
  timeLimitMinutes: number;
  maxAttempts: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  questions: TestQuestion[];
}

// 4. Test Submission / Result
export interface TestSubmission {
  id: string;
  testId: string;
  trainingId: string;
  trainingTitle: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  submittedAt: string;
  attemptNumber?: number;
  timeSpentSeconds?: number;
  timeTakenSeconds?: number;
  score: number;
  totalScore?: number;
  maxScore?: number;
  percentage: number;
  passingScorePct?: number;
  passMark?: number;
  result: 'PASSED' | 'FAILED';
  correctCount?: number;
  wrongCount?: number;
  unansweredCount?: number;
  userAnswers?: Record<string, any>;
  answers?: any[];
  questionBreakdown?: {
    questionId: string;
    questionText: string;
    userAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
    marksAwarded: number;
    explanation: string;
  }[];
}

// 5. Training Assignment Record
export interface TrainingAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentId: string;
  designation: string;
  role: UserRole;
  trainingId: string;
  trainingTitle: string;
  trainingCode: string;
  category: TrainingCategory;
  machineId?: string;
  machineCode?: string;
  assignedDate: string;
  scheduledDate?: string;
  dueDate: string;
  completedDate?: string;
  validityExpiryDate?: string;
  priority: AssignmentPriority;
  trainerId?: string;
  trainerName: string;
  trainingMode: TrainingMode;
  status: AssignmentStatus;
  
  // Progress flags
  contentCompleted: boolean;
  contentCompletedAt?: string;
  
  testTaken: boolean;
  testScorePct?: number;
  testResult?: 'Passed' | 'Failed';
  
  practicalCompleted: boolean;
  practicalScorePct?: number;
  practicalResult?: CompetencyResult;
  
  overallResult?: 'Passed' | 'Failed' | 'Pending';
  remarks?: string;
  isCorrectiveRetraining?: boolean;
  triggeredByMonitoringId?: string;
  
  attemptsCount: number;
  historyAttempts?: {
    attemptNumber: number;
    date: string;
    testScorePct?: number;
    practicalScorePct?: number;
    result: string;
    trainerRemarks: string;
  }[];

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// 6. Attendance Record
export interface TrainingAttendance {
  id: string;
  trainingId: string;
  trainingTopic: string;
  trainingDate: string;
  date?: string;
  mode?: string;
  hoursAttended?: number;
  startTime: string;
  endTime: string;
  trainerId: string;
  trainerName: string;
  location: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentId: string;
  attendanceStatus: AttendanceStatus;
  signatureStatus?: string;
  employeeSigned: boolean;
  employeeSignatureTime?: string;
  trainerConfirmed: boolean;
  trainerConfirmedTime?: string;
  remarks?: string;
}

// 7. Practical Competency Evaluation
export interface PracticalCheckpoint {
  key: string;
  label: string;
  description: string;
  category: string;
  rating: CompetencyRating; // 1 to 5
  observation?: string;
  isCritical?: boolean;
}

export type PracticalCriteriaScore = {
  criteriaId?: string;
  criteriaName?: string;
  criteria?: string;
  maxScore: number;
  score: number;
  weightage?: number;
  remarks?: string;
};

export interface PracticalCompetencyEvaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentId: string;
  designation?: string;
  machineId?: string;
  machineCode?: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole?: string;
  evaluationDate: string;
  shiftId?: string;
  checkpoints?: PracticalCheckpoint[];
  criteriaScores?: PracticalCriteriaScore[];
  overallRatingAverage?: number; // 1.0 to 5.0
  overallScorePct: number; // 0 to 100%
  competencyResult: CompetencyResult;
  supervisorComments: string;
  correctiveActionRecommended?: string;
  retrainingRequired: boolean;
  recommendedTrainingId?: string;
  qualificationGranted?: boolean;
  qualificationExpiryDate?: string;
  status?: 'Submitted' | 'Verified' | 'Approved';
  createdAt: string;
  updatedAt: string;
}

// 8. Shopfloor Monitoring Record
export interface MonitoringCheckpoint {
  id: number | string;
  key?: string;
  label?: string;
  category: 'Safety' | 'Quality' | 'Process' | 'Housekeeping' | 'Documentation' | 'Safety & PPE' | 'SOP Compliance' | 'Machine Operation' | 'Quality Checks' | 'Housekeeping & 5S' | string;
  status: CheckpointStatus | 'OK' | 'Deviation' | 'Critical Issue' | 'N/A' | 'Not OK' | string;
  observation?: string;
  photoUrl?: string;
  correctiveAction?: string;
  responsiblePerson?: string;
  targetDate?: string;
  closureStatus?: 'Open' | 'In Progress' | 'Closed';
  isCritical?: boolean;
  checkpoint?: string;
  remarks?: string;
}

export type MonitoringCheckpointItem = MonitoringCheckpoint;

export interface ShopfloorMonitoringRecord {
  id: string;
  date?: string;
  monitoringDate?: string;
  time?: string;
  departmentId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  machineId: string;
  machineCode: string;
  partName?: string;
  shiftId?: string;
  supervisorId: string;
  supervisorName: string;
  monitoringType?: string;
  checkpoints?: MonitoringCheckpoint[];
  items?: MonitoringCheckpoint[];
  monitoringScorePct: number; // e.g. 92%
  scoreStatus: 'EXCELLENT' | 'GOOD' | 'NEEDS IMPROVEMENT' | 'CRITICAL OBSERVATION' | 'Satisfactory' | 'Needs Improvement' | 'Action Required' | string;
  criticalIssuesCount: number;
  deviationsCount?: number;
  retrainingRecommended: boolean;
  retrainingTrainingId?: string;
  retrainingTrainingName?: string;
  retrainingPriority?: AssignmentPriority;
  supervisorSignature?: boolean;
  employeeAcknowledgement?: boolean;
  closureRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

// 9. Corrective Retraining Record
export interface CorrectiveTrainingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentId: string;
  triggerSource: 'Test Failure' | 'Practical Assessment' | 'Monitoring Checkpoint' | 'Safety Incident' | 'Scrap Spike';
  triggerReferenceId: string;
  issueDescription: string;
  rootCause: string;
  requiredTrainingId: string;
  requiredTrainingTitle: string;
  trainerId: string;
  trainerName: string;
  dueDate: string;
  retrainingDate?: string;
  retestScore?: number;
  finalResult?: 'Pending' | 'Completed - Competent' | 'Failed - Re-assign';
  effectivenessVerified?: boolean;
  closureDate?: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt: string;
}

// 10. Machine Qualification Requirement
export interface MachineQualificationRequirement {
  machineId: string;
  machineCode: string;
  requiredCompetencies: {
    trainingId: string;
    title: string;
    isMandatory: boolean;
  }[];
}

// 11. Multi-Tenant Company Definition
export interface Company {
  id: string;
  name: string;
  code: string; // e.g. "CMP-APEX"
  logo?: string;
  plantLocation: string;
  industry: string;
  isActive: boolean;
  createdAt: string;
}

// 12. Company Custom Training Program Categories
export type CompanyTrainingCategory =
  | 'Operator Training'
  | 'Safety Training'
  | 'Quality Training'
  | 'Machine Training'
  | 'Process Training'
  | 'New Employee Training'
  | 'Refresher Training'
  | 'Skill Upgrade'
  | 'Retraining'
  | 'Company Custom Training';

// 13. Company Custom Training Program Master
export interface CompanyTrainingProgram {
  id: string;
  companyId: string;
  programId: string; // e.g. "PRG-INJ-101"
  programName: string;
  department: string;
  applicableDesignation: string[]; // e.g. ["Operator", "Senior Operator"]
  applicableMachine: string[]; // e.g. ["IMM-01", "IMM-02", "All"]
  trainingCategory: CompanyTrainingCategory;
  trainingDuration: number; // e.g. 45
  durationUnit: 'minutes' | 'hours';
  trainer: string;
  trainerId?: string;
  validity: number; // e.g. 12 (months)
  passingPercentage: number; // e.g. 80
  status: 'Draft' | 'Active' | 'Under Revision' | 'Archived';
  version: string; // e.g. "v1.0", "v2.0"
  createdDate: string;
  createdBy: string;
  description?: string;
  learningObjectives?: string[];
  safetyPoints?: string[];
  practicalSteps?: string[];
  
  // Attached Original Question Paper & Digital Test
  questionPaperId?: string;
  questionPaperName?: string;
  questionPaperVersion?: string;
  originalDocumentName?: string;
  originalDocumentType?: string;
  originalDocumentUrl?: string;
  testId?: string;
  
  updatedAt?: string;
}

// 14. OCR Question Item
export interface ImportedQuestionItem {
  id: string;
  questionNumber: number;
  questionText: string;
  questionTextHindi?: string;
  questionType?: 'Multiple Choice' | 'True/False' | 'Text' | string;
  options?: { key?: string; text?: string; textHindi?: string; label?: string }[];
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  optionAHindi?: string;
  optionBHindi?: string;
  optionCHindi?: string;
  optionDHindi?: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D' | '';
  requiresManualAnswer?: boolean;
  topic?: string;
  marks: number;
  explanation?: string;
  explanationHindi?: string;
  confidence?: number;
  status: 'Draft' | 'AI Extracted' | 'Under Review' | 'Approved' | 'Rejected';
}

export type OCRQuestionItem = ImportedQuestionItem;

// 15. Company Question Paper with Version Control
export interface CompanyQuestionPaper {
  id: string;
  companyId: string;
  trainingProgramId: string;
  programName: string;
  title: string; // e.g. "Operator Competency Test – Injection Moulding Level 1"
  version: string; // e.g. "1.0", "2.0", "3.0"
  
  // Original document preservation
  originalDocumentName: string;
  originalDocumentType: 'pdf' | 'jpg' | 'png' | 'jpeg';
  originalDocumentUrl?: string;
  originalDocumentBase64?: string;
  uploadedAt: string;
  uploadedBy: string;
  
  // AI OCR extraction state & review
  ocrStatus: 'Draft' | 'AI Extracted' | 'Under Review' | 'Approved' | 'Rejected' | 'Published';
  ocrExtractedAt?: string;
  ocrConfidenceScore?: number;
  aiExtractedNoticeShown?: boolean;
  totalQuestions: number;
  passingPercentage: number;
  durationMinutes: number;
  
  // Test Configurations
  questionType: 'Multiple Choice' | 'True/False' | 'Mixed';
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  maxAttempts: number;
  testValidityMonths: number;
  
  // Questions Bank
  questions: ImportedQuestionItem[];
  
  // Approval metadata
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  
  createdAt: string;
  updatedAt: string;
}

// 16. Training Session with Sign-Offs (Trainer Pre-Signature + Operator Acknowledgement)
export interface PracticalChecklistItem {
  id: string;
  label: string;
  description?: string;
  status: 'Completed' | 'Not Completed' | 'Not Applicable';
  completedAt?: string;
  trainerRemarks?: string;
}

export interface TrainingAttemptRecord {
  attemptNumber: number;
  date: string;
  score: number;
  maxScore: number;
  scorePercent: number;
  correctAnswers: number;
  wrongAnswers: number;
  passMark: number;
  result: 'PASSED' | 'FAILED';
  trainerName?: string;
  operatorName?: string;
  details?: string;
}

export interface TrainingAuditTimelineEvent {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details?: string;
}

export interface TrainingAttachmentDoc {
  id: string;
  name: string;
  type: 'SOP' | 'Work Instruction' | 'Training Material' | 'PDF' | 'Image';
  version: string;
  revision?: string;
  uploadedBy: string;
  uploadDate: string;
  url?: string;
  size?: string;
}

export interface TrainingSignOffSession {
  id: string;
  companyId: string;
  trainingProgramId: string;
  trainingProgramCode?: string;
  trainingProgramTitle: string;
  category?: string;
  trainingType?: 'Initial Training' | 'Refresher Training' | 'Machine-Specific Training' | 'Safety Training' | 'Quality Training' | 'Corrective Training (CAPA)' | 'Skill Upgrade';
  trainingMethod?: 'Classroom' | 'Shop Floor' | 'Practical Demonstration' | 'SOP Review' | 'Video / Digital' | 'Combination';
  trainingDuration?: number;
  trainingDate?: string;
  dueDate?: string;
  expiryDate?: string;
  validityExpiryDate?: string;
  validityMonths?: number;
  status?: 'Assigned' | 'Trainer Signed' | 'In Training' | 'Training Completed' | 'Operator Acknowledged' | 'Test In Progress' | 'Competent' | 'Retraining Required' | 'Expired';
  trainingCategory?: string;
  testPointsEarned?: number;
  testTotalPoints?: number;
  testScorePercentage?: number;
  testPassed?: boolean;
  currentAttempt?: number;
  attemptHistory?: TrainingAttemptRecord[];
  
  // Question paper version used for this exact session
  questionPaperId?: string;
  questionPaperTitle?: string;
  questionPaperVersion?: string;
  originalDocumentName?: string;
  originalDocumentUrl?: string;

  // Trainee details
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation?: string;
  departmentId?: string;
  departmentName?: string;
  shiftId?: string;
  machineId?: string;
  machineCode?: string;

  // Trainer details
  trainerId: string;
  trainerName: string;
  trainerEmployeeId?: string;

  // 1. Trainer Pre-Training Sign-Off
  trainerPreSigned?: boolean;
  trainerPreSignDate?: string;
  trainerPreSignTime?: string;
  trainerSignatureData?: string; // canvas drawing data URL
  trainerSignatureType?: 'PRE_TRAINING';
  
  // 2. Training Session Checklist & Observations
  trainingProgress?: 'Not Started' | 'In Progress' | 'Completed';
  checklistItemsCompleted?: boolean;
  practicalCheckpointsPassed?: boolean;
  practicalChecklist?: PracticalChecklistItem[];
  trainerObservations?: string;
  trainerRemarks?: string;
  sopMaterialTitle?: string;
  sopMaterialUrl?: string;
  learningObjectives?: string[];

  // 3. Operator Training Acknowledgement Signature
  operatorAckSigned?: boolean;
  operatorAckDate?: string;
  operatorAckTime?: string;
  operatorSignatureData?: string; // canvas drawing data URL
  operatorSignatureType?: 'OPERATOR_ACKNOWLEDGEMENT';
  operatorRemarks?: string;

  // 4. Digital Test Submission
  testCompleted?: boolean;
  testStartTime?: string;
  testSubmitTime?: string;
  testScore?: number;
  maxScore?: number;
  testPercentage?: number;
  passMark?: number;
  testResult?: 'PASSED' | 'FAILED';
  attemptNumber?: number;
  competencyResult?: 'Competent' | 'Not Competent' | 'Retraining Required';

  // Attempts History
  attempts?: TrainingAttemptRecord[];

  // Audit Timeline
  auditTimeline?: TrainingAuditTimelineEvent[];

  // Document attachments
  attachments?: TrainingAttachmentDoc[];

  // Exact attempted questions with answers for audit
  questionsAttempted?: {
    questionNumber: number;
    questionText: string;
    options: { key: string; text: string }[];
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    marks: number;
    topic: string;
  }[];

  // Corrective action link if failed
  retrainingTriggered?: boolean;
  retrainingRecordId?: string;

  createdAt: string;
  updatedAt: string;
}

// 17. Operator Training Filter State
export interface OperatorSearchFilterState {
  department: string;
  shift: string;
  machine: string;
  designation: string;
  trainer: string;
  trainingStatus: string;
  competencyStatus: string;
  testStatus: string;
  trainingDue: string; // 'All' | 'Due 30 Days' | 'Overdue'
  onlyOverdue: boolean;
}

