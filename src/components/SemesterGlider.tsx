import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Sliders,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  X,
  FileText,
  FlaskConical,
  GraduationCap,
  Check,
} from 'lucide-react';
import {
  SemesterCurriculum,
  CourseAssessment,
  UserProfile,
  LabAssessmentItem,
  CourseInfo,
} from '../types';
import {
  ALL_SEMESTERS_CURRICULUM,
  getCourseCredits,
  isCourseSessional,
  DEFAULT_LAB_ASSESSMENT_ITEMS,
} from '../data/curriculum';
import {
  calculateBarForecaster,
  getGradeFromScore,
} from '../services/academicMath';

interface SemesterGliderProps {
  currentSemesterKey: string;
  profile: UserProfile | null;
  assessments: Record<string, CourseAssessment>;
  historicalGPAs: Record<string, number | null>;
  onSelectCourseForForecaster?: (courseCode: string) => void;
  onOpenCurriculum?: (semKey: string) => void;
  onSaveAssessment?: (assessment: CourseAssessment) => void;
  compact?: boolean;
}

export const SemesterGlider: React.FC<SemesterGliderProps> = ({
  currentSemesterKey,
  profile,
  assessments,
  historicalGPAs,
  onSelectCourseForForecaster,
  onOpenCurriculum,
  onSaveAssessment,
  compact = false,
}) => {
  // Determine index of student's current semester
  const currentSemIndex = ALL_SEMESTERS_CURRICULUM.findIndex(
    (s) => s.key === (profile?.semesterKey || currentSemesterKey)
  );

  // Default glided semester: previous semester if available, or current
  const initialIndex = currentSemIndex > 0 ? currentSemIndex - 1 : 0;
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex >= 0 ? initialIndex : 0);

  // State for interactive modals
  const [editingLabCourse, setEditingLabCourse] = useState<CourseInfo | null>(null);
  const [editingTheoryCourse, setEditingTheoryCourse] = useState<CourseInfo | null>(null);

  // Draft state for lab editing modal
  const [draftLabItems, setDraftLabItems] = useState<LabAssessmentItem[]>([]);
  const [saveBannerMessage, setSaveBannerMessage] = useState<string>('');

  // Draft state for theory editing modal
  const [draftTheory, setDraftTheory] = useState<{
    quiz1: string;
    quiz2: string;
    quiz3: string;
    midterm: string;
    misc: string;
    finalExam: string;
  }>({
    quiz1: '',
    quiz2: '',
    quiz3: '',
    midterm: '',
    misc: '',
    finalExam: '',
  });

  const activeSemester: SemesterCurriculum =
    ALL_SEMESTERS_CURRICULUM[activeIndex] || ALL_SEMESTERS_CURRICULUM[0];
  const isCurrentActive = activeSemester.key === (profile?.semesterKey || currentSemesterKey);
  const isPrevious = activeIndex < (currentSemIndex >= 0 ? currentSemIndex : 999);

  // Separate Theory Courses and Lab Courses
  const theoryCourses = activeSemester.courses.filter(
    (c) => !c.isSessional && !isCourseSessional(c.code)
  );
  const labCourses = activeSemester.courses.filter(
    (c) => c.isSessional || isCourseSessional(c.code)
  );

  // Calculate theory and lab credits
  const theoryCredits = theoryCourses.reduce((acc, c) => acc + c.credits, 0);
  const labCredits = labCourses.reduce((acc, c) => acc + c.credits, 0);

  // Navigate left and right
  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : ALL_SEMESTERS_CURRICULUM.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < ALL_SEMESTERS_CURRICULUM.length - 1 ? prev + 1 : 0));
  };

  // Get historical GPA or calculate based on course marks
  const recordedGPA = historicalGPAs[activeSemester.key];

  // Calculate GPA based on marks in both Theory and Lab courses
  let totalPoints = 0;
  let totalCredits = 0;
  let coursesWithMarksCount = 0;

  activeSemester.courses.forEach((c) => {
    const isLab = c.isSessional || isCourseSessional(c.code);
    const assess = assessments[c.code];
    if (!assess) return;

    const hasMarks = isLab
      ? !!(assess.labItems && assess.labItems.some((it) => it.marksObtained !== null))
      : (
          assess.quiz1 !== null ||
          assess.quiz2 !== null ||
          assess.quiz3 !== null ||
          assess.midterm !== null ||
          assess.misc !== null ||
          assess.finalExam !== null
        );

    if (hasMarks) {
      const calc = calculateBarForecaster(assess);
      totalPoints += calc.achievedGrade.gradePoint * c.credits;
      totalCredits += c.credits;
      coursesWithMarksCount++;
    }
  });

  const calculatedGPAFromMarks =
    totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : null;
  const displayGPA =
    recordedGPA !== null && recordedGPA !== undefined
      ? recordedGPA.toFixed(2)
      : calculatedGPAFromMarks !== null
      ? calculatedGPAFromMarks.toFixed(2)
      : null;

  // --- LAB MODAL HANDLERS ---
  const handleOpenLabEditor = (course: CourseInfo) => {
    const existing = assessments[course.code];
    const items =
      existing?.labItems && existing.labItems.length > 0
        ? existing.labItems.map((it) => ({ ...it }))
        : DEFAULT_LAB_ASSESSMENT_ITEMS.map((it) => ({ ...it }));

    setDraftLabItems(items);
    setEditingLabCourse(course);
    setSaveBannerMessage('');
  };

  const handleLabItemChange = (
    itemId: string,
    field: 'name' | 'marksObtained' | 'maxMarks',
    val: any
  ) => {
    setDraftLabItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          if (field === 'marksObtained') {
            const num = val === '' ? null : Math.max(0, Number(val));
            return { ...item, marksObtained: num };
          }
          if (field === 'maxMarks') {
            const num = Math.max(1, Number(val) || 1);
            return { ...item, maxMarks: num };
          }
          if (field === 'name') {
            return { ...item, name: String(val) };
          }
        }
        return item;
      })
    );
  };

  const handleAddLabItem = () => {
    const newItem: LabAssessmentItem = {
      id: `lab_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: `Custom Lab Exam ${draftLabItems.length + 1}`,
      marksObtained: null,
      maxMarks: 20,
    };
    setDraftLabItems((prev) => [...prev, newItem]);
  };

  const handleRemoveLabItem = (itemId: string) => {
    setDraftLabItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const handleResetLabToDefault = () => {
    setDraftLabItems(DEFAULT_LAB_ASSESSMENT_ITEMS.map((it) => ({ ...it, marksObtained: null })));
  };

  const handleSaveLabMarksPermanently = () => {
    if (!editingLabCourse || !onSaveAssessment) return;

    const updated: CourseAssessment = {
      ...(assessments[editingLabCourse.code] || {
        courseCode: editingLabCourse.code,
        quiz1: null,
        quiz2: null,
        quiz3: null,
        midterm: null,
        misc: null,
        finalExam: null,
      }),
      courseCode: editingLabCourse.code,
      isLab: true,
      labItems: draftLabItems,
      updatedAt: Date.now(),
    };

    onSaveAssessment(updated);
    setSaveBannerMessage(`✓ Lab marks for ${editingLabCourse.code} permanently saved!`);
    setTimeout(() => {
      setSaveBannerMessage('');
    }, 2500);
  };

  // --- THEORY MODAL HANDLERS ---
  const handleOpenTheoryEditor = (course: CourseInfo) => {
    const existing = assessments[course.code];
    setDraftTheory({
      quiz1: existing?.quiz1 !== null && existing?.quiz1 !== undefined ? String(existing.quiz1) : '',
      quiz2: existing?.quiz2 !== null && existing?.quiz2 !== undefined ? String(existing.quiz2) : '',
      quiz3: existing?.quiz3 !== null && existing?.quiz3 !== undefined ? String(existing.quiz3) : '',
      midterm: existing?.midterm !== null && existing?.midterm !== undefined ? String(existing.midterm) : '',
      misc: existing?.misc !== null && existing?.misc !== undefined ? String(existing.misc) : '',
      finalExam:
        existing?.finalExam !== null && existing?.finalExam !== undefined
          ? String(existing.finalExam)
          : existing?.finalExamScore !== null && existing?.finalExamScore !== undefined
          ? String(existing.finalExamScore)
          : '',
    });
    setEditingTheoryCourse(course);
    setSaveBannerMessage('');
  };

  const handleSaveTheoryMarksPermanently = () => {
    if (!editingTheoryCourse || !onSaveAssessment) return;

    const parseVal = (str: string) => (str.trim() === '' ? null : Math.max(0, Number(str)));

    const updated: CourseAssessment = {
      ...(assessments[editingTheoryCourse.code] || {
        courseCode: editingTheoryCourse.code,
      }),
      courseCode: editingTheoryCourse.code,
      quiz1: parseVal(draftTheory.quiz1),
      quiz2: parseVal(draftTheory.quiz2),
      quiz3: parseVal(draftTheory.quiz3),
      midterm: parseVal(draftTheory.midterm),
      misc: parseVal(draftTheory.misc),
      finalExam: parseVal(draftTheory.finalExam),
      isLab: false,
      updatedAt: Date.now(),
    };

    onSaveAssessment(updated);
    setSaveBannerMessage(`✓ Theory marks for ${editingTheoryCourse.code} permanently saved!`);
    setTimeout(() => {
      setSaveBannerMessage('');
    }, 2500);
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-[#181920] via-[#16171D] to-[#181920] border border-neutral-800/90 shadow-xl flex flex-col justify-between relative overflow-hidden ${
        compact ? 'p-3.5 space-y-3' : 'p-4 sm:p-5 h-full space-y-5'
      }`}
    >
      {/* Subtle ember ambient glow */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Header Bar with Shorter Name and Glide Controls */}
      <div className="space-y-3 pb-3 border-b border-neutral-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-100 tracking-wide truncate">
                  Semester Glider
                </span>
                {isCurrentActive ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 shrink-0 font-semibold">
                    Current Semester
                  </span>
                ) : isPrevious ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/60 shrink-0 font-semibold">
                    Completed Archive
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-neutral-900 text-neutral-400 border border-neutral-800 shrink-0 font-semibold">
                    Upcoming Semester
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 truncate">
                {activeSemester.name} · Theory & Custom Lab Marks Distribution
              </p>
            </div>
          </div>

          {/* Glide Arrows & Active Label */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <div className="flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 rounded-xl p-1">
              <button
                onClick={handlePrev}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-amber-300 transition-colors"
                title="Glide to previous semester"
                aria-label="Previous semester"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-amber-300 px-2 min-w-[2.5rem] text-center">
                {activeSemester.shortLabel}
              </span>
              <button
                onClick={handleNext}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-amber-300 transition-colors"
                title="Glide to next semester"
                aria-label="Next semester"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {onOpenCurriculum && (
              <button
                onClick={() => onOpenCurriculum(activeSemester.key)}
                className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-xs font-medium text-neutral-300 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                title="Inspect syllabus and books in Curriculum"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Curriculum</span>
              </button>
            )}
          </div>
        </div>

        {/* Semester Glide Pills (1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {ALL_SEMESTERS_CURRICULUM.map((sem, idx) => {
            const isSelected = idx === activeIndex;
            const isStudentCurrent = sem.key === (profile?.semesterKey || currentSemesterKey);

            return (
              <button
                key={sem.key}
                onClick={() => setActiveIndex(idx)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                    : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <span>Sem {sem.shortLabel}</span>
                {isStudentCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Your Current Term" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle: Semester Summary Bar */}
      <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-mono block">Semester Total</span>
            <span className="font-bold text-neutral-200 font-mono">
              {activeSemester.totalCredits} Credits · {activeSemester.courses.length} Courses
            </span>
          </div>

          <div className="hidden sm:block w-px h-6 bg-neutral-800" />

          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-lg bg-neutral-800/80 text-neutral-300 font-mono text-[11px] border border-neutral-700/60">
              <strong className="text-amber-400">{theoryCourses.length}</strong> Theory ({theoryCredits} Cr)
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-neutral-800/80 text-neutral-300 font-mono text-[11px] border border-neutral-700/60">
              <strong className="text-amber-400">{labCourses.length}</strong> Lab ({labCredits} Cr)
            </span>
          </div>
        </div>

        <div className="text-right shrink-0 font-mono">
          <span className="text-[10px] text-neutral-500 uppercase block">Term GPA</span>
          <span className="text-sm font-bold text-amber-300">
            {displayGPA ? `${displayGPA} / 4.00` : '—'}
          </span>
        </div>
      </div>

      {/* DUAL SECTIONS CONTAINER: 1. THEORY FIRST, 2. LAB SECOND */}
      <div className="space-y-6 overflow-y-auto pr-1">
        
        {/* ======================================================== */}
        {/* 1. THEORY COURSES SECTION (LISTED FIRST) */}
        {/* ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                Theory Courses (Lectures)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              {theoryCourses.length} Courses · {theoryCredits} Credits (Standard 100 Marks)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {theoryCourses.map((course) => {
              const assess = assessments[course.code];
              const hasMarks =
                assess &&
                (assess.quiz1 !== null ||
                  assess.quiz2 !== null ||
                  assess.quiz3 !== null ||
                  assess.midterm !== null ||
                  assess.misc !== null ||
                  assess.finalExam !== null);
              const calc = assess ? calculateBarForecaster(assess) : null;

              return (
                <div
                  key={course.code}
                  className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                    hasMarks
                      ? 'bg-neutral-900/90 border-neutral-800 hover:border-amber-500/40 shadow-sm'
                      : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* Course Identity */}
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md font-mono font-bold text-amber-300 text-xs bg-amber-500/10 border border-amber-500/20 shrink-0">
                        {course.code}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs text-neutral-200 font-semibold truncate block">
                          {course.title}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {course.credits} Credits · Lecture
                        </span>
                      </div>
                    </div>

                    {/* Total & Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 font-mono text-xs">
                      {calc && hasMarks ? (
                        <div className="flex items-center gap-1.5 mr-1">
                          <span className="text-neutral-300 font-semibold">
                            {calc.totalCourseMarks} <span className="text-[10px] text-neutral-500">/ 100</span>
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {calc.achievedGrade.letterGrade}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-500 mr-1 font-mono">Unmarked</span>
                      )}

                      <button
                        onClick={() => handleOpenTheoryEditor(course)}
                        className="px-2.5 py-1 rounded-lg text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-amber-300 border border-neutral-700 font-sans font-medium transition-colors"
                        title={`Enter or edit theory marks for ${course.code}`}
                      >
                        {hasMarks ? 'Edit Marks' : 'Enter Marks'}
                      </button>

                      {onSelectCourseForForecaster && (
                        <button
                          onClick={() => onSelectCourseForForecaster(course.code)}
                          className="px-2 py-1 rounded-lg text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans transition-colors"
                          title="Open Pass Bar Forecaster simulator"
                        >
                          Simulator
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Marks Detailed Breakdown */}
                  {calc && hasMarks && (
                    <div className="pt-2 border-t border-neutral-800/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400 font-mono">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>
                          Quizzes: <strong className="text-neutral-200">{calc.bestTwoQuizTotal}</strong>/20
                        </span>
                        <span>·</span>
                        <span>
                          Midterm: <strong className="text-neutral-200">{calc.midtermMark}</strong>/20
                        </span>
                        <span>·</span>
                        <span>
                          Misc: <strong className="text-neutral-200">{calc.miscMark}</strong>/10
                        </span>
                        <span>·</span>
                        <span>
                          Final: <strong className="text-neutral-200">{calc.finalExamMark}</strong>/50
                        </span>
                      </div>

                      <div className="text-[10px]">
                        {calc.finalExamPassNeeded === 0 ? (
                          <span className="text-emerald-400 font-semibold">✓ 40% Pass Bar Cleared</span>
                        ) : (
                          <span className="text-amber-400/90">
                            Pass Bar Need: {calc.finalExamPassNeeded}/50
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. LAB & SESSIONAL COURSES SECTION (LISTED SECOND) */}
        {/* ======================================================== */}
        <div className="space-y-3 pt-2 border-t border-neutral-800/80">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                Lab & Sessional Courses (Practicals)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400/90 font-medium">
              Customizable Mark Distribution Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {labCourses.length === 0 ? (
              <div className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800/60 text-center text-xs text-neutral-500 font-mono">
                No sessional / lab courses in this semester.
              </div>
            ) : (
              labCourses.map((course) => {
                const assess = assessments[course.code];
                const labItems =
                  assess?.labItems && assess.labItems.length > 0
                    ? assess.labItems
                    : DEFAULT_LAB_ASSESSMENT_ITEMS;

                const hasMarks = labItems.some((it) => it.marksObtained !== null);
                const calc = calculateBarForecaster(
                  assess || {
                    courseCode: course.code,
                    quiz1: null,
                    quiz2: null,
                    quiz3: null,
                    midterm: null,
                    misc: null,
                    finalExam: null,
                    isLab: true,
                    labItems,
                  }
                );

                return (
                  <div
                    key={course.code}
                    className={`p-3.5 rounded-xl border transition-all text-xs space-y-2.5 ${
                      hasMarks
                        ? 'bg-neutral-900/90 border-neutral-800 hover:border-amber-500/40 shadow-sm'
                        : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      {/* Course Identity */}
                      <div className="min-w-0 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md font-mono font-bold text-amber-300 text-xs bg-amber-500/15 border border-amber-500/30 shrink-0 flex items-center gap-1">
                          <FlaskConical className="w-3 h-3 text-amber-400" />
                          {course.code}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-200 font-semibold truncate">
                              {course.title}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                              LAB
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {course.credits} Credits · {labItems.length} Exam Components
                          </span>
                        </div>
                      </div>

                      {/* Total & Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 font-mono text-xs">
                        {hasMarks ? (
                          <div className="flex items-center gap-1.5 mr-1">
                            <span className="text-neutral-200 font-semibold">
                              {calc.labTotalObtained}{' '}
                              <span className="text-[10px] text-neutral-500">/ {calc.labTotalMax}</span>
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {calc.achievedGrade.letterGrade}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-neutral-500 mr-1 font-mono">Unmarked</span>
                        )}

                        <button
                          onClick={() => handleOpenLabEditor(course)}
                          className="px-2.5 py-1 rounded-lg text-[11px] bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-sans font-medium flex items-center gap-1.5 transition-colors"
                          title={`Customize exam distribution & enter marks for ${course.code}`}
                        >
                          <Sliders className="w-3 h-3 text-amber-400" />
                          <span>Customize & Enter Marks</span>
                        </button>

                        {onSelectCourseForForecaster && (
                          <button
                            onClick={() => onSelectCourseForForecaster(course.code)}
                            className="px-2 py-1 rounded-lg text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-300 border border-neutral-700 font-sans transition-colors"
                            title="Inspect in Bar Forecaster"
                          >
                            Simulator
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Custom Exam Components Breakdown Pills */}
                    <div className="pt-2 border-t border-neutral-800/70 space-y-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {labItems.map((item) => (
                          <div
                            key={item.id}
                            className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono flex items-center gap-1.5 ${
                              item.marksObtained !== null
                                ? 'bg-neutral-900 border-neutral-700 text-neutral-200'
                                : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-500'
                            }`}
                          >
                            <span className="font-sans font-medium">{item.name}:</span>
                            <strong
                              className={
                                item.marksObtained !== null ? 'text-amber-300' : 'text-neutral-500'
                              }
                            >
                              {item.marksObtained !== null ? item.marksObtained : '—'}
                            </strong>
                            <span className="text-neutral-500 text-[9px]">/ {item.maxMarks}</span>
                          </div>
                        ))}
                      </div>

                      {/* Lab Pass Bar Status */}
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-0.5">
                        <span>
                          Official 40% Pass Bar:{' '}
                          <strong className="text-neutral-200">
                            {(0.4 * (calc.labTotalMax || 100)).toFixed(1)} marks
                          </strong>{' '}
                          needed across custom exams
                        </span>

                        <div>
                          {calc.labMarksNeededToPass === 0 ? (
                            <span className="text-emerald-400 font-semibold">
                              ✓ 40% Pass Bar Cleared
                            </span>
                          ) : (
                            <span className="text-amber-400/90">
                              Need {calc.labMarksNeededToPass} more to clear 40% pass
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: LAB CUSTOM EXAMS & MARKS MODAL */}
      {/* ======================================================== */}
      {editingLabCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm px-3 py-4 sm:p-6 overscroll-contain">
          <div className="min-h-full flex items-start justify-center pt-2 sm:pt-6 pb-12 sm:pb-16">
            <div className="w-full max-w-xl rounded-2xl bg-[#16171E] border border-amber-500/30 p-4 sm:p-6 shadow-2xl text-neutral-200 space-y-4 relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                    {editingLabCourse.code} · Lab Assessment Distribution
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {editingLabCourse.title} ({editingLabCourse.credits} Cr)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingLabCourse(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explanation & Instructions */}
            <p className="text-xs text-neutral-400 leading-relaxed bg-neutral-900/60 border border-neutral-800 p-2.5 rounded-xl">
              Lab courses feature a customizable marks distribution. You can configure which exams you have, set how many marks each is out of, and input your scores. The pass bar (40%) and grading scale remain the official standard.
            </p>

            {/* Save Status Confirmation Banner */}
            {saveBannerMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 font-medium flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{saveBannerMessage}</span>
              </div>
            )}

            {/* Exam Items List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {draftLabItems.map((item, idx) => {
                const itemPct =
                  item.marksObtained !== null && item.maxMarks > 0
                    ? Math.round((item.marksObtained / item.maxMarks) * 100)
                    : null;

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleLabItemChange(item.id, 'name', e.target.value)}
                          placeholder={`Exam / Assessment #${idx + 1}`}
                          className="w-full px-2.5 py-1 text-xs font-semibold text-neutral-200 bg-neutral-950 border border-neutral-700 rounded-lg focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {itemPct !== null && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                              itemPct >= 80
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                                : itemPct >= 40
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                                : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                            }`}
                          >
                            {itemPct}%
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveLabItem(item.id)}
                          className="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                          title="Delete this exam component"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-1">
                          Marks Obtained
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={item.maxMarks}
                          step={0.5}
                          value={item.marksObtained ?? ''}
                          onChange={(e) => handleLabItemChange(item.id, 'marksObtained', e.target.value)}
                          placeholder="0"
                          className="w-full py-1.5 px-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 font-mono text-center focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-1">
                          Max Marks (Out Of)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          step={1}
                          value={item.maxMarks}
                          onChange={(e) => handleLabItemChange(item.id, 'maxMarks', e.target.value)}
                          placeholder="20"
                          className="w-full py-1.5 px-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-amber-300 font-mono text-center focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Exam & Reset Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleAddLabItem}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/50 text-xs text-amber-300 font-medium flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Exam Component</span>
              </button>

              <button
                type="button"
                onClick={handleResetLabToDefault}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors font-mono"
              >
                Reset Default
              </button>
            </div>

            {/* Summary & Save Footer */}
            {(() => {
              const totalMax = draftLabItems.reduce((acc, it) => acc + (Number(it.maxMarks) || 0), 0) || 100;
              const totalObtained = draftLabItems.reduce(
                (acc, it) => acc + (it.marksObtained !== null ? Number(it.marksObtained) : 0),
                0
              );
              const pct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
              const grade = getGradeFromScore(pct);
              const passThreshold = 0.4 * totalMax;
              const neededToPass = Math.max(0, Number((passThreshold - totalObtained).toFixed(1)));

              return (
                <div className="pt-3 border-t border-neutral-800 space-y-3">
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">TOTAL SCORE</span>
                      <span className="font-bold text-amber-300 text-sm">
                        {totalObtained} / {totalMax}{' '}
                        <span className="text-neutral-400 text-xs font-normal">
                          ({pct.toFixed(1)}%)
                        </span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 block">GRADE (4.00)</span>
                      <span className="font-bold text-emerald-400 text-sm">
                        {grade.letterGrade} ({grade.gradePoint.toFixed(2)} GP)
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-neutral-400 font-mono text-center">
                    {neededToPass === 0 ? (
                      <span className="text-emerald-400 font-semibold">
                        ✓ 40% Pass Bar Cleared for this Lab
                      </span>
                    ) : (
                      <span>
                        40% Pass Bar: Need <strong className="text-amber-400">{neededToPass}</strong> more marks
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingLabCourse(null)}
                      className="flex-1 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 transition-colors"
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveLabMarksPermanently}
                      className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Marks Permanently</span>
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: THEORY COURSE MARKS INPUT MODAL */}
      {/* ======================================================== */}
      {editingTheoryCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm px-3 py-4 sm:p-6 overscroll-contain">
          <div className="min-h-full flex items-start justify-center pt-2 sm:pt-6 pb-12 sm:pb-16">
            <div className="w-full max-w-lg rounded-2xl bg-[#16171E] border border-amber-500/30 p-4 sm:p-6 shadow-2xl text-neutral-200 space-y-4 relative">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-100">
                    {editingTheoryCourse.code} · Theory Marks
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {editingTheoryCourse.title} ({editingTheoryCourse.credits} Cr)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingTheoryCourse(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveBannerMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{saveBannerMessage}</span>
              </div>
            )}

            <div className="space-y-3.5">
              {/* Quizzes */}
              <div className="space-y-1.5 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-xs font-semibold text-neutral-200 block">
                  1. Three Quizzes (Best 2 Count for 20)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-0.5">Quiz 1 (/10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      value={draftTheory.quiz1}
                      onChange={(e) => setDraftTheory({ ...draftTheory, quiz1: e.target.value })}
                      placeholder="0-10"
                      className="w-full text-center py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-0.5">Quiz 2 (/10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      value={draftTheory.quiz2}
                      onChange={(e) => setDraftTheory({ ...draftTheory, quiz2: e.target.value })}
                      placeholder="0-10"
                      className="w-full text-center py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-0.5">Quiz 3 (/10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      value={draftTheory.quiz3}
                      onChange={(e) => setDraftTheory({ ...draftTheory, quiz3: e.target.value })}
                      placeholder="0-10"
                      className="w-full text-center py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Midterm */}
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-200">2. Midterm Examination</span>
                  <span className="text-neutral-500 font-mono text-[10px]">Max 20</span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.5}
                  value={draftTheory.midterm}
                  onChange={(e) => setDraftTheory({ ...draftTheory, midterm: e.target.value })}
                  placeholder="0 - 20"
                  className="w-full py-1.5 px-3 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Misc */}
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-200">3. Attendance & Misc</span>
                  <span className="text-neutral-500 font-mono text-[10px]">Max 10</span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={draftTheory.misc}
                  onChange={(e) => setDraftTheory({ ...draftTheory, misc: e.target.value })}
                  placeholder="0 - 10"
                  className="w-full py-1.5 px-3 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Final Exam */}
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-200">4. Final Examination</span>
                  <span className="text-neutral-500 font-mono text-[10px]">Max 50</span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  value={draftTheory.finalExam}
                  onChange={(e) => setDraftTheory({ ...draftTheory, finalExam: e.target.value })}
                  placeholder="0 - 50"
                  className="w-full py-1.5 px-3 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingTheoryCourse(null)}
                className="flex-1 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSaveTheoryMarksPermanently}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Marks Permanently</span>
              </button>
            </div>

          </div>
          </div>
        </div>
      )}

    </div>
  );
};
