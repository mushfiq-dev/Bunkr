export type DayOfWeek = 
  | 'saturday' 
  | 'sunday' 
  | 'monday' 
  | 'tuesday' 
  | 'wednesday' 
  | 'thursday' 
  | 'friday';

export const DAYS_ORDER: DayOfWeek[] = [
  'saturday',
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday'
];

export const DAY_NAMES: Record<DayOfWeek, string> = {
  saturday: 'Saturday',
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday'
};

export const DAY_SHORT_NAMES: Record<DayOfWeek, string> = {
  saturday: 'Sat',
  sunday: 'Sun',
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri'
};

export type AttendanceStatus = 'unmarked' | 'attended' | 'skipped';

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  courseCode: string;
  status: AttendanceStatus;
  updatedAt?: number;
}

export interface CourseInfo {
  code: string;
  credits: number;
  title: string;
  hours?: string; // e.g. "3-0" or "0-3"
  prerequisite?: string;
  isSessional?: boolean;
  syllabus?: string;
  books?: string[];
}

export interface SemesterCurriculum {
  key: string; // e.g. 'y1s1', 'y1s2', 'y2s1', 'y2s2', 'y3s1', 'y3s2', 'y4s1', 'y4s2'
  name: string; // e.g. 'Year 1, Semester 1'
  shortLabel: string; // e.g. '1.1'
  year: number;
  semester: number;
  totalCredits: number;
  theoryHours?: number;
  labHours?: number;
  courses: CourseInfo[];
}

export interface UserProfile {
  name: string;
  roll: string;
  year: number;
  semester: number;
  semesterKey: string;
  department: string;
  institution: string;
  isConfigured: boolean;
  updatedAt?: number;
}

export interface HistoricalSemesterRecord {
  semesterKey: string;
  shortLabel: string;
  name: string;
  credits: number;
  gpa: number | null; // e.g. 3.75
}

export interface RoutineConfig {
  semesterStartDate: string; // YYYY-MM-DD
  classesEndDate?: string; // YYYY-MM-DD (when will the classes end before preparatory leave)
  totalWeeks: number; // default 14
  weeklySchedule: Record<DayOfWeek, string[]>; // day -> course code list
  adminPin: string;
  semesterName?: string;
  selectedSemesterKey?: string;
}

export interface BangladeshHoliday {
  id: string;
  date: string; // YYYY-MM-DD or MM-DD for recurring
  name: string;
  nameBangla?: string;
  description?: string;
  isOfficial: boolean;
  enabled: boolean;
}

export interface LabAssessmentItem {
  id: string;
  name: string; // e.g. "Lab Quiz 1", "Lab Report", "Viva / Performance", "Final Lab Exam", "Project"
  marksObtained: number | null;
  maxMarks: number; // e.g. 10, 20, 30, 50
}

export interface CourseAssessment {
  courseCode: string;
  quiz1: number | null;
  quiz2: number | null;
  quiz3: number | null;
  midterm: number | null;
  misc: number | null; // Attendance/Assignment out of 10
  finalExam: number | null; // Final exam out of 50
  finalExamScore?: number | null; // backwards compatibility
  targetGrade?: string;
  isLab?: boolean;
  labItems?: LabAssessmentItem[];
  updatedAt?: number;
}

export interface CumulativeCGPAConfig {
  previousCGPA: number | null;
  previousCredits: number | null;
  includeCurrentSemester: boolean;
}

export interface CalendarDayInfo {
  date: string; // YYYY-MM-DD
  dayOfWeek: DayOfWeek;
  dayNumber: number;
  monthName: string;
  year: number;
  weekNumber: number; // 1 to 14
  courses: string[];
  holiday?: BangladeshHoliday;
  isWeekend: boolean;
  isClassDay: boolean;
  isToday: boolean;
  isPast: boolean;
}

export interface CourseAttendanceSummary {
  courseCode: string;
  credits?: number;
  weeklyCount: number;
  totalPlannedClasses: number;
  attendedCount: number;
  skippedCount: number;
  unmarkedCount: number;
  totalMarkedCount: number;
  currentRate: number; // 0 to 100
  requiredAttendances: number; // ceil(0.7 * totalPlannedClasses)
  maxAllowedSkips: number; // totalPlannedClasses - requiredAttendances
  skipBuffer: number; // max(0, maxAllowedSkips - skippedCount)
  isAtRisk: boolean;
  canStillRecover: boolean;
}

export interface GradingScaleTier {
  minScore: number;
  maxScore: number;
  letterGrade: string;
  gradePoint: number;
  rangeLabel: string;
}

export type ActiveTabType = 'calendar' | 'attendance' | 'forecaster' | 'curriculum' | 'holidays' | 'glider';
