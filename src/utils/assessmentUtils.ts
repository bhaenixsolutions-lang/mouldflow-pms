/**
 * Assessment & Training Scoring Utilities
 * Provides normalized pass mark evaluation, unified pass/fail decision logic,
 * and automated audit logging payload generation.
 */

export interface AssessmentResult {
  score: number;
  totalScore: number;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  passMark: number;
  originalPassMark: any;
  isPassed: boolean;
  result: 'PASSED' | 'FAILED';
  formattedScoreText: string;
  passMarkText: string;
  requirementMessage: string;
}

/**
 * Normalizes any pass mark value into a safe, valid integer between 0 and 100.
 * Defaults to 80 if missing, null, undefined, NaN, or invalid string.
 */
export const normalizePassMark = (val: any, defaultVal: number = 80): number => {
  if (val === undefined || val === null || val === '') {
    return defaultVal;
  }
  const parsed = typeof val === 'number' ? val : Number(String(val).replace(/[^0-9.]/g, ''));
  if (isNaN(parsed) || !isFinite(parsed)) {
    return defaultVal;
  }
  // Clamp between 0 and 100
  return Math.min(100, Math.max(0, Math.round(parsed)));
};

/**
 * Calculates assessment result given earned points / correct questions and total available.
 * Guarantees that score, percentage, passMark, and pass/fail decision all stem
 * from the exact same normalized computation object.
 */
export const calculateAssessmentScore = (
  earnedScore: number,
  totalScore: number,
  rawPassMark?: any,
  correctCount?: number,
  totalQuestions?: number
): AssessmentResult => {
  const passMark = normalizePassMark(rawPassMark, 80);
  const total = Math.max(0, totalScore || 0);
  const earned = Math.max(0, earnedScore || 0);
  
  const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;
  const isPassed = percentage >= passMark;
  const result: 'PASSED' | 'FAILED' = isPassed ? 'PASSED' : 'FAILED';

  const finalTotalQ = totalQuestions ?? (total > 0 ? total : 1);
  const finalCorrectQ = correctCount ?? (percentage === 100 ? finalTotalQ : Math.round((percentage / 100) * finalTotalQ));

  return {
    score: earned,
    totalScore: total,
    correctCount: finalCorrectQ,
    totalQuestions: finalTotalQ,
    percentage,
    passMark,
    originalPassMark: rawPassMark,
    isPassed,
    result,
    formattedScoreText: `${percentage}% (${earned}/${total})`,
    passMarkText: `${passMark}%`,
    requirementMessage: `Requires minimum ${passMark}% to pass.`,
  };
};

/**
 * Executes and verifies the core test cases for compliance:
 * A) 50/50 with passMark 80 -> PASS (100%)
 * B) 40/50 with passMark 80 -> PASS (80%)
 * C) 39/50 with passMark 80 -> FAIL (78%)
 * D) 5/5 with passMark 80 -> PASS (100%)
 * E) Missing passMark with 5/5 -> PASS using default 80 (100%)
 * F) Missing passMark with 3/5 -> FAIL using default 80 (60%)
 */
export const verifyAssessmentScoringRules = (): { testCase: string; passed: boolean; details: any }[] => {
  const tests = [
    {
      name: 'Case A: 50/50 with passMark 80',
      run: () => calculateAssessmentScore(50, 50, 80, 50, 50),
      expectedResult: 'PASSED',
      expectedPct: 100,
      expectedPassMark: 80,
    },
    {
      name: 'Case B: 40/50 with passMark 80',
      run: () => calculateAssessmentScore(40, 50, 80, 40, 50),
      expectedResult: 'PASSED',
      expectedPct: 80,
      expectedPassMark: 80,
    },
    {
      name: 'Case C: 39/50 with passMark 80',
      run: () => calculateAssessmentScore(39, 50, 80, 39, 50),
      expectedResult: 'FAILED',
      expectedPct: 78,
      expectedPassMark: 80,
    },
    {
      name: 'Case D: 5/5 with passMark 80',
      run: () => calculateAssessmentScore(5, 5, 80, 5, 5),
      expectedResult: 'PASSED',
      expectedPct: 100,
      expectedPassMark: 80,
    },
    {
      name: 'Case E: Missing passMark with 5/5 (default 80)',
      run: () => calculateAssessmentScore(5, 5, undefined, 5, 5),
      expectedResult: 'PASSED',
      expectedPct: 100,
      expectedPassMark: 80,
    },
    {
      name: 'Case F: Missing passMark with 3/5 (default 80)',
      run: () => calculateAssessmentScore(3, 5, undefined, 3, 5),
      expectedResult: 'FAILED',
      expectedPct: 60,
      expectedPassMark: 80,
    },
  ];

  return tests.map((t) => {
    const res = t.run();
    const passed =
      res.result === t.expectedResult &&
      res.percentage === t.expectedPct &&
      res.passMark === t.expectedPassMark;
    return {
      testCase: t.name,
      passed,
      details: res,
    };
  });
};
