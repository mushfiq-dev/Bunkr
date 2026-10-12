import {
  DayOfWeek,
  DAYS_ORDER,
  RoutineConfig,
  BangladeshHoliday,
  CalendarDayInfo,
  AttendanceRecord,
  CourseAttendanceSummary,
  CourseAssessment,
  GradingScaleTier,
  LabAssessmentItem,
} from '../types';
import {
  GRADING_SCALE,
  getCourseCredits,
  COURSE_CREDITS_MAP,
  isCourseSessional,
  DEFAULT_LAB_ASSESSMENT_ITEMS,
} from '../data/curriculum';

// Helper to convert JS Day (0 = Sunday, 6 = Saturday) to our DayOfWeek
export const jsDayToDayOfWeek = (jsDay: number): DayOfWeek => {
  switch (jsDay) {
    case 6: return 'saturday';
    case 0: return 'sunday';
    case 1: return 'monday';
    case 2: return 'tuesday';
    case 3: return 'wednesday';
    case 4: return 'thursday';
    case 5: return 'friday';
    default: return 'saturday';
  }
};

// Format Date object to YYYY-MM-DD
export const formatDateToKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Parse YYYY-MM-DD to Date in local timezone
export const parseKeyToDate = (key: string): Date => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

// Extract unique list of courses from the weekly schedule
export const getUniqueCourses = (weeklySchedule: Record<DayOfWeek, string[]>): string[] => {
  const set = new Set<string>();
  for (const day of DAYS_ORDER) {
    const list = weeklySchedule[day] || [];
    for (const c of list) {
      const trimmed = c.trim().toUpperCase();
      if (trimmed) set.add(trimmed);
    }
  }
  return Array.from(set).sort();
};

// Calculate weekly frequency of each course
export const getCourseWeeklyFrequencies = (
  weeklySchedule: Record<DayOfWeek, string[]>
): Record<string, number> => {
  const freqs: Record<string, number> = {};
  for (const day of DAYS_ORDER) {
    const list = weeklySchedule[day] || [];
    for (const c of list) {
      const course = c.trim().toUpperCase();
      if (course) {
        freqs[course] = (freqs[course] || 0) + 1;
      }
    }
  }
  return freqs;
};

// Generate calendar days for the 14-week semester
export const generateSemesterCalendar = (
  config: RoutineConfig,
  holidays: BangladeshHoliday[]
): CalendarDayInfo[] => {
  const days: CalendarDayInfo[] = [];
  const startDate = parseKeyToDate(config.semesterStartDate);
  const totalDays = config.totalWeeks * 7;

  // Build quick holiday lookup by YYYY-MM-DD and MM-DD
  const holidayMap = new Map<string, BangladeshHoliday>();
  for (const h of holidays) {
    if (h.enabled) {
      holidayMap.set(h.date, h);
      if (h.date.length === 10) {
        const mmdd = h.date.substring(5);
        holidayMap.set(mmdd, h);
      }
    }
  }

  const todayKey = formatDateToKey(new Date());

  for (let i = 0; i < totalDays; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);

    const dateKey = formatDateToKey(current);
    const mmddKey = dateKey.substring(5);
    const dayOfWeek = jsDayToDayOfWeek(current.getDay());
    const weekNumber = Math.floor(i / 7) + 1;

    const holiday = holidayMap.get(dateKey) || holidayMap.get(mmddKey);
    const scheduledCourses = (config.weeklySchedule[dayOfWeek] || []).map(c => c.trim().toUpperCase());

    const isWeekend = dayOfWeek === 'friday';
    const isClassDay = scheduledCourses.length > 0 && !holiday;

    const monthName = current.toLocaleDateString('en-US', { month: 'short' });

    days.push({
      date: dateKey,
      dayOfWeek,
      dayNumber: current.getDate(),
      monthName,
      year: current.getFullYear(),
      weekNumber,
      courses: scheduledCourses,
      holiday,
      isWeekend,
      isClassDay,
      isToday: dateKey === todayKey,
      isPast: dateKey < todayKey,
    });
  }

  return days;
};

// Calculate attendance metrics and the strict 70% Skip Buffer
export const calculateCourseAttendanceSummary = (
  courseCode: string,
  config: RoutineConfig,
  calendarDays: CalendarDayInfo[],
  attendanceRecords: Record<string, AttendanceRecord>
): CourseAttendanceSummary => {
  const normCode = courseCode.trim().toUpperCase();
  const freqs = getCourseWeeklyFrequencies(config.weeklySchedule);
  const weeklyCount = freqs[normCode] || 0;
  
  // Total classes = 14 * weekly routine count
  const totalPlannedClasses = config.totalWeeks * weeklyCount;

  // University requires strict 70% attendance rate
  const requiredAttendances = Math.ceil(0.70 * totalPlannedClasses);
  const maxAllowedSkips = Math.max(0, totalPlannedClasses - requiredAttendances);

  let attendedCount = 0;
  let skippedCount = 0;

  for (const day of calendarDays) {
    if (day.courses.includes(normCode)) {
      const key = `${day.date}_${normCode}`;
      const record = attendanceRecords[key];
      if (record) {
        if (record.status === 'attended') {
          attendedCount++;
        } else if (record.status === 'skipped') {
          skippedCount++;
        }
      }
    }
  }

  const totalMarkedCount = attendedCount + skippedCount;
  const unmarkedCount = Math.max(0, totalPlannedClasses - totalMarkedCount);

  const currentRate = totalMarkedCount > 0 
    ? Math.round((attendedCount / totalMarkedCount) * 100) 
    : 100;

  const rawBuffer = maxAllowedSkips - skippedCount;
  const skipBuffer = Math.max(0, rawBuffer);
  const isAtRisk = rawBuffer <= 0;

  const canStillRecover = totalPlannedClasses > 0
    ? (attendedCount + unmarkedCount) >= requiredAttendances
    : true;

  return {
    courseCode: normCode,
    credits: getCourseCredits(normCode),
    weeklyCount,
    totalPlannedClasses,
    attendedCount,
    skippedCount,
    unmarkedCount,
    totalMarkedCount,
    currentRate,
    requiredAttendances,
    maxAllowedSkips,
    skipBuffer,
    isAtRisk,
    canStillRecover,
  };
};

export interface TargetGradeForecast {
  letterGrade: string;
  gradePoint: number;
  minScore: number;
  maxScore: number;
  rangeLabel: string;
  neededInFinal: number | null; // out of 50; null if > 50 (unattainable)
  isAlreadySecured: boolean;
  requiredPercentageInFinal: number | null; // needed / 50 * 100
}

export interface BarForecasterResult {
  courseCode: string;
  credits: number;
  quiz1: number | null;
  quiz2: number | null;
  quiz3: number | null;
  midterm: number | null;
  misc: number | null;
  finalExam: number | null;
  sortedQuizzes: { index: number; score: number; isTaken: boolean }[];
  bestTwoQuizTotal: number; // max 20
  midtermMark: number; // max 20
  miscMark: number; // max 10
  finalExamMark: number; // max 50
  continuousAssessmentTotal: number; // Quizzes + Midterm (max 40)
  preFinalTotal: number; // Quizzes + Midterm + Misc (max 50)
  finalExamPassNeeded: number; // marks out of 50 to clear the 40% pass bar
  finalExamMax: number; // 50
  percentageAchievedSoFar: number;
  totalCourseMarks: number; // out of 100
  hasFinalExamEntered: boolean;
  targetGrades: TargetGradeForecast[];
  achievedGrade: GradingScaleTier;
  isLab: boolean;
  labItems?: LabAssessmentItem[];
  labTotalObtained?: number;
  labTotalMax?: number;
  labMarksNeededToPass?: number;
}

// Map any numerical score (out of 100) to the official grading scale
export const getGradeFromScore = (score: number): GradingScaleTier => {
  for (const tier of GRADING_SCALE) {
    if (score >= tier.minScore) {
      return tier;
    }
  }
  return GRADING_SCALE[GRADING_SCALE.length - 1]; // F
};

// Strategic Bar Forecaster logic
export const calculateBarForecaster = (
  assessment: CourseAssessment
): BarForecasterResult => {
  const courseCode = assessment.courseCode;
  const credits = getCourseCredits(courseCode);
  const isLab = !!(assessment.isLab || isCourseSessional(courseCode));

  // Handle Lab / Sessional Courses with custom mark distributions
  if (isLab) {
    const labItems = (assessment.labItems && assessment.labItems.length > 0)
      ? assessment.labItems
      : DEFAULT_LAB_ASSESSMENT_ITEMS;

    const labTotalMax = labItems.reduce((acc, it) => acc + (Number(it.maxMarks) || 0), 0) || 100;
    const labTotalObtained = labItems.reduce((acc, it) => acc + (it.marksObtained !== null ? Number(it.marksObtained) : 0), 0);
    const hasAnyEntered = labItems.some((it) => it.marksObtained !== null);
    const percentage = labTotalMax > 0 ? (labTotalObtained / labTotalMax) * 100 : 0;
    const totalCourseMarks = Number(percentage.toFixed(1));
    const achievedGrade = getGradeFromScore(totalCourseMarks);

    // Official 40% pass bar applied to the custom max marks
    const passThreshold = Number((0.40 * labTotalMax).toFixed(1));
    const labMarksNeededToPass = Math.max(0, Number((passThreshold - labTotalObtained).toFixed(1)));

    // Unentered max marks that student can still score
    const unenteredMaxMarks = labItems
      .filter((it) => it.marksObtained === null)
      .reduce((acc, it) => acc + (Number(it.maxMarks) || 0), 0);

    const targetGrades: TargetGradeForecast[] = GRADING_SCALE
      .filter((t) => t.letterGrade !== 'F')
      .map((tier) => {
        const targetNeeded = (tier.minScore / 100) * labTotalMax;
        const diff = Number((targetNeeded - labTotalObtained).toFixed(1));

        if (diff <= 0) {
          return {
            letterGrade: tier.letterGrade,
            gradePoint: tier.gradePoint,
            minScore: tier.minScore,
            maxScore: tier.maxScore,
            rangeLabel: tier.rangeLabel,
            neededInFinal: 0,
            isAlreadySecured: true,
            requiredPercentageInFinal: 0,
          };
        } else if (diff > unenteredMaxMarks) {
          return {
            letterGrade: tier.letterGrade,
            gradePoint: tier.gradePoint,
            minScore: tier.minScore,
            maxScore: tier.maxScore,
            rangeLabel: tier.rangeLabel,
            neededInFinal: null, // exceeds remaining available marks
            isAlreadySecured: false,
            requiredPercentageInFinal: null,
          };
        } else {
          return {
            letterGrade: tier.letterGrade,
            gradePoint: tier.gradePoint,
            minScore: tier.minScore,
            maxScore: tier.maxScore,
            rangeLabel: tier.rangeLabel,
            neededInFinal: diff,
            isAlreadySecured: false,
            requiredPercentageInFinal: unenteredMaxMarks > 0 ? Math.round((diff / unenteredMaxMarks) * 100) : 100,
          };
        }
      });

    return {
      courseCode,
      credits,
      quiz1: null,
      quiz2: null,
      quiz3: null,
      midterm: null,
      misc: null,
      finalExam: null,
      sortedQuizzes: [],
      bestTwoQuizTotal: 0,
      midtermMark: 0,
      miscMark: 0,
      finalExamMark: 0,
      continuousAssessmentTotal: labTotalObtained,
      preFinalTotal: labTotalObtained,
      finalExamPassNeeded: labMarksNeededToPass,
      finalExamMax: labTotalMax,
      percentageAchievedSoFar: Math.round(percentage),
      totalCourseMarks,
      hasFinalExamEntered: hasAnyEntered,
      targetGrades,
      achievedGrade,
      isLab: true,
      labItems,
      labTotalObtained,
      labTotalMax,
      labMarksNeededToPass,
    };
  }

  const q1 = assessment.quiz1 ?? null;
  const q2 = assessment.quiz2 ?? null;
  const q3 = assessment.quiz3 ?? null;
  const mid = assessment.midterm ?? null;
  const misc = assessment.misc ?? null;
  const finalExamVal = assessment.finalExam ?? assessment.finalExamScore ?? null;

  const quizzes = [
    { index: 1, score: q1 ?? 0, hasValue: q1 !== null },
    { index: 2, score: q2 ?? 0, hasValue: q2 !== null },
    { index: 3, score: q3 ?? 0, hasValue: q3 !== null },
  ];

  // Sort quizzes descending by score to pick the best two
  const sorted = [...quizzes].sort((a, b) => b.score - a.score);
  const bestTwoQuizTotal = Math.min(20, (sorted[0]?.score || 0) + (sorted[1]?.score || 0));

  const sortedQuizzes = quizzes.map((q) => {
    const isTopTwo = sorted.slice(0, 2).some(item => item.index === q.index);
    return {
      index: q.index,
      score: q.score,
      isTaken: isTopTwo,
    };
  });

  const midtermMark = Math.min(20, Math.max(0, mid ?? 0));
  const miscMark = Math.min(10, Math.max(0, misc ?? 0));
  const finalExamMark = Math.min(50, Math.max(0, finalExamVal ?? 0));

  // Continuous assessment total: best 2 quizzes (max 20) + midterm (max 20) = max 40
  const continuousAssessmentTotal = Math.min(40, bestTwoQuizTotal + midtermMark);
  const preFinalTotal = Math.min(50, continuousAssessmentTotal + miscMark);

  // Passing threshold is 40% (Grade D, 2.00)
  // Marks needed in final exam (out of 50) to pass:
  const passNeeded = Math.max(0, 40 - preFinalTotal);
  const finalExamPassNeeded = Math.min(50, passNeeded);

  const percentageAchievedSoFar = Math.round((preFinalTotal / 50) * 100);

  // Total marks out of 100
  const totalCourseMarks = preFinalTotal + finalExamMark;
  const hasFinalExamEntered = finalExamVal !== null && finalExamVal !== undefined;
  const achievedGrade = getGradeFromScore(totalCourseMarks);

  // Evaluate target grades against the official grading system
  const targetGrades: TargetGradeForecast[] = GRADING_SCALE
    .filter((t) => t.letterGrade !== 'F')
    .map((tier) => {
      const diff = tier.minScore - preFinalTotal;

      if (diff <= 0) {
        return {
          letterGrade: tier.letterGrade,
          gradePoint: tier.gradePoint,
          minScore: tier.minScore,
          maxScore: tier.maxScore,
          rangeLabel: tier.rangeLabel,
          neededInFinal: 0,
          isAlreadySecured: true,
          requiredPercentageInFinal: 0,
        };
      } else if (diff > 50) {
        return {
          letterGrade: tier.letterGrade,
          gradePoint: tier.gradePoint,
          minScore: tier.minScore,
          maxScore: tier.maxScore,
          rangeLabel: tier.rangeLabel,
          neededInFinal: null, // exceeds 50 marks of final exam
          isAlreadySecured: false,
          requiredPercentageInFinal: null,
        };
      } else {
        return {
          letterGrade: tier.letterGrade,
          gradePoint: tier.gradePoint,
          minScore: tier.minScore,
          maxScore: tier.maxScore,
          rangeLabel: tier.rangeLabel,
          neededInFinal: Number(diff.toFixed(1)),
          isAlreadySecured: false,
          requiredPercentageInFinal: Math.round((diff / 50) * 100),
        };
      }
    });

  return {
    courseCode,
    credits,
    quiz1: q1,
    quiz2: q2,
    quiz3: q3,
    midterm: mid,
    misc,
    finalExam: finalExamVal,
    sortedQuizzes,
    bestTwoQuizTotal,
    midtermMark,
    miscMark,
    finalExamMark,
    continuousAssessmentTotal,
    preFinalTotal,
    finalExamPassNeeded,
    finalExamMax: 50,
    percentageAchievedSoFar,
    totalCourseMarks,
    hasFinalExamEntered,
    targetGrades,
    achievedGrade,
    isLab: false,
  };
};

export interface SemesterGPASummary {
  totalCredits: number;
  projectedCreditsCompleted: number;
  projectedGPA: number;
  minPossibleGPA: number;
  maxPossibleGPA: number;
  courseDetails: {
    courseCode: string;
    credits: number;
    gradePoint: number;
    letterGrade: string;
    continuousScore: number;
    miscScore: number;
    finalScore: number;
    totalScore: number;
  }[];
}

// Calculate projected Semester GPA using official credits and grading scale
export const calculateSemesterGPA = (
  courses: string[],
  assessments: Record<string, CourseAssessment>
): SemesterGPASummary => {
  let totalCredits = 0;
  let weightedPoints = 0;
  let minWeightedPoints = 0;
  let maxWeightedPoints = 0;

  const courseDetails: SemesterGPASummary['courseDetails'] = [];

  for (const c of courses) {
    const cred = getCourseCredits(c);
    totalCredits += cred;

    const assess = assessments[c] || {
      courseCode: c,
      quiz1: null,
      quiz2: null,
      quiz3: null,
      midterm: null,
      misc: null,
      finalExam: null,
    };

    const res = calculateBarForecaster(assess);

    if (res.isLab) {
      const projectedTier = res.achievedGrade;
      const projectedTotal = res.totalCourseMarks;
      minWeightedPoints += cred * res.achievedGrade.gradePoint;
      maxWeightedPoints += cred * (res.hasFinalExamEntered ? res.achievedGrade.gradePoint : 4.0);
      weightedPoints += cred * res.achievedGrade.gradePoint;

      courseDetails.push({
        courseCode: c,
        credits: cred,
        gradePoint: projectedTier.gradePoint,
        letterGrade: projectedTier.letterGrade,
        continuousScore: res.labTotalObtained || 0,
        miscScore: 0,
        finalScore: res.labTotalObtained || 0,
        totalScore: projectedTotal,
      });
      continue;
    }

    const preFinal = res.preFinalTotal;

    // Minimum score: preFinal + 0 final
    const minTier = getGradeFromScore(preFinal);
    minWeightedPoints += cred * minTier.gradePoint;

    // Maximum score: preFinal + 50 final
    const maxTier = getGradeFromScore(Math.min(100, preFinal + 50));
    maxWeightedPoints += cred * maxTier.gradePoint;

    // If final exam entered, use actual score; otherwise project based on continuous
    const finalVal = (assess.finalExam !== null && assess.finalExam !== undefined)
      ? assess.finalExam
      : (assess.finalExamScore !== null && assess.finalExamScore !== undefined)
      ? assess.finalExamScore
      : (preFinal > 0 ? 35 : 0);

    const projectedTotal = preFinal + finalVal;
    const projectedTier = getGradeFromScore(projectedTotal);

    weightedPoints += cred * projectedTier.gradePoint;

    courseDetails.push({
      courseCode: c,
      credits: cred,
      gradePoint: projectedTier.gradePoint,
      letterGrade: projectedTier.letterGrade,
      continuousScore: res.continuousAssessmentTotal,
      miscScore: res.miscMark,
      finalScore: finalVal,
      totalScore: projectedTotal,
    });
  }

  const projectedGPA = totalCredits > 0 ? Number((weightedPoints / totalCredits).toFixed(2)) : 0.00;
  const minPossibleGPA = totalCredits > 0 ? Number((minWeightedPoints / totalCredits).toFixed(2)) : 0.00;
  const maxPossibleGPA = totalCredits > 0 ? Number((maxWeightedPoints / totalCredits).toFixed(2)) : 0.00;

  return {
    totalCredits,
    projectedCreditsCompleted: totalCredits,
    projectedGPA,
    minPossibleGPA,
    maxPossibleGPA,
    courseDetails,
  };
};

export interface CumulativeCGPAResult {
  cumulativeCGPA: number;
  totalCumulativeCredits: number;
  previousCGPA: number;
  previousCredits: number;
  currentSemesterGPA: number;
  currentSemesterCredits: number;
  includeCurrentSemester: boolean;
  cgpaDelta: number; // difference from previous CGPA
}

// Total Cumulative CGPA Calculation incorporating previous CGPA and current semester
export const calculateCumulativeCGPA = (
  previousCGPA: number | null,
  previousCredits: number | null,
  currentSemesterGPA: number,
  currentSemesterCredits: number,
  includeCurrentSemester: boolean
): CumulativeCGPAResult => {
  const prevCG = previousCGPA ?? 0;
  const prevCr = previousCredits ?? 0;

  if (!includeCurrentSemester) {
    return {
      cumulativeCGPA: prevCG,
      totalCumulativeCredits: prevCr,
      previousCGPA: prevCG,
      previousCredits: prevCr,
      currentSemesterGPA,
      currentSemesterCredits,
      includeCurrentSemester: false,
      cgpaDelta: 0,
    };
  }

  const totalWeightedPoints = (prevCG * prevCr) + (currentSemesterGPA * currentSemesterCredits);
  const totalCumulativeCredits = prevCr + currentSemesterCredits;

  const cumulativeCGPA = totalCumulativeCredits > 0
    ? Number((totalWeightedPoints / totalCumulativeCredits).toFixed(2))
    : currentSemesterGPA;

  const cgpaDelta = Number((cumulativeCGPA - prevCG).toFixed(2));

  return {
    cumulativeCGPA,
    totalCumulativeCredits,
    previousCGPA: prevCG,
    previousCredits: prevCr,
    currentSemesterGPA,
    currentSemesterCredits,
    includeCurrentSemester: true,
    cgpaDelta,
  };
};
