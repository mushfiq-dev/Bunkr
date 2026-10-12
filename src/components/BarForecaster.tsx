import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Target,
  Flame,
  BookOpen,
  GraduationCap,
  Calculator,
  Check,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  FileText,
  History,
  Layers,
  Save,
  RotateCcw,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Sliders,
  FlaskConical,
} from 'lucide-react';
import { CourseAssessment, RoutineConfig, UserProfile, SemesterCurriculum, LabAssessmentItem } from '../types';
import {
  getUniqueCourses,
  calculateBarForecaster,
  calculateSemesterGPA,
} from '../services/academicMath';
import {
  GRADING_SCALE,
  getCourseCredits,
  ALL_SEMESTERS_CURRICULUM,
  getPriorSemesters,
  isCourseSessional,
  DEFAULT_LAB_ASSESSMENT_ITEMS,
} from '../data/curriculum';
import { storageService } from '../services/storage';

interface BarForecasterProps {
  config: RoutineConfig;
  profile: UserProfile | null;
  assessments: Record<string, CourseAssessment>;
  onSaveAssessment: (assessment: CourseAssessment) => void;
  selectedCourseProp?: string;
}

export const BarForecaster: React.FC<BarForecasterProps> = ({
  config,
  profile,
  assessments,
  onSaveAssessment,
  selectedCourseProp,
}) => {
  const uniqueCourses = getUniqueCourses(config.weeklySchedule);
  
  // Active course
  const [selectedCourse, setSelectedCourse] = useState<string>(
    selectedCourseProp || uniqueCourses[0] || 'CSE1101'
  );

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (selectedCourseProp && selectedCourseProp !== selectedCourse) {
      setSelectedCourse(selectedCourseProp);
    }
  }, [selectedCourseProp]);

  const [showGradingTable, setShowGradingTable] = useState(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string>('All marks are permanently saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Synced');
  const [isSavedBadgeVisible, setIsSavedBadgeVisible] = useState(true);

  // User's current semester key
  const activeSemesterKey = profile?.semesterKey || config.selectedSemesterKey || 'y2s1';
  const currentSemesterInfo = ALL_SEMESTERS_CURRICULUM.find(s => s.key === activeSemesterKey) || ALL_SEMESTERS_CURRICULUM[2];

  // List of prior completed semesters (e.g. if in 2.2 -> 1.1, 1.2, 2.1)
  const priorSemesters = getPriorSemesters(activeSemesterKey);

  // Historical GPAs map: semesterKey -> GPA
  const [historicalGPAs, setHistoricalGPAs] = useState<Record<string, number | null>>({});
  const [includeCurrentSemester, setIncludeCurrentSemester] = useState(true);

  useEffect(() => {
    const saved = storageService.getHistoricalGPAs();
    setHistoricalGPAs(saved);
  }, []);

  const handleUpdateHistoricalGPA = (semKey: string, val: string) => {
    const num = val === '' ? null : Math.min(4.0, Math.max(0, Number(val)));
    const updated = { ...historicalGPAs, [semKey]: num };
    setHistoricalGPAs(updated);
    storageService.saveHistoricalGPAs(updated);
  };

  // Current course assessment or default empty
  const currentAssessment: CourseAssessment = assessments[selectedCourse] || {
    courseCode: selectedCourse,
    quiz1: null,
    quiz2: null,
    quiz3: null,
    midterm: null,
    misc: null,
    finalExam: null,
  };

  const calculation = calculateBarForecaster(currentAssessment);
  const courseCredits = getCourseCredits(selectedCourse);

  // Overall current semester GPA summary
  const gpaSummary = calculateSemesterGPA(uniqueCourses, assessments);

  // Calculate combined previous cumulative CGPA from historical semesters
  let priorTotalCredits = 0;
  let priorWeightedPoints = 0;
  let priorEnteredCount = 0;

  for (const sem of priorSemesters) {
    const gpa = historicalGPAs[sem.key];
    if (gpa !== null && gpa !== undefined && !isNaN(gpa)) {
      priorTotalCredits += sem.totalCredits;
      priorWeightedPoints += sem.totalCredits * gpa;
      priorEnteredCount++;
    }
  }

  const calculatedPreviousCGPA = priorTotalCredits > 0
    ? Number((priorWeightedPoints / priorTotalCredits).toFixed(2))
    : 0.0;

  // Calculate final total cumulative CGPA
  let finalCumulativeCGPA = 0;
  let finalTotalCredits = 0;

  if (includeCurrentSemester) {
    const combinedPoints = priorWeightedPoints + (gpaSummary.projectedGPA * gpaSummary.totalCredits);
    finalTotalCredits = priorTotalCredits + gpaSummary.totalCredits;
    finalCumulativeCGPA = finalTotalCredits > 0
      ? Number((combinedPoints / finalTotalCredits).toFixed(2))
      : gpaSummary.projectedGPA;
  } else {
    finalTotalCredits = priorTotalCredits;
    finalCumulativeCGPA = calculatedPreviousCGPA;
  }

  const cgpaDelta = priorEnteredCount > 0
    ? Number((finalCumulativeCGPA - calculatedPreviousCGPA).toFixed(2))
    : 0;

  // Handle score change (auto-saved)
  const handleInputChange = (
    field: 'quiz1' | 'quiz2' | 'quiz3' | 'midterm' | 'misc' | 'finalExam',
    val: string
  ) => {
    const num = val === '' ? null : Math.max(0, Number(val));
    const updated: CourseAssessment = {
      ...currentAssessment,
      courseCode: selectedCourse,
      [field]: num,
    };
    onSaveAssessment(updated);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedTime(now);
    setSaveStatusMessage('All marks saved permanently to device');
    setIsSavedBadgeVisible(true);
  };

  // Explicit Save Marks Permanently button action
  const handleManualPermanentSave = () => {
    onSaveAssessment(currentAssessment);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedTime(now);
    setSaveStatusMessage(`Marks permanently committed to storage for ${selectedCourse}`);
    setIsSavedBadgeVisible(true);
  };

  const isSelectedCourseLab = isCourseSessional(selectedCourse) || !!currentAssessment.isLab;

  // Handle lab exam component change (auto-saved)
  const handleLabItemChange = (
    itemId: string,
    field: 'name' | 'marksObtained' | 'maxMarks',
    val: any
  ) => {
    const currentItems = currentAssessment.labItems && currentAssessment.labItems.length > 0
      ? currentAssessment.labItems
      : DEFAULT_LAB_ASSESSMENT_ITEMS;

    const updatedItems = currentItems.map((item) => {
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
    });

    const updated: CourseAssessment = {
      ...currentAssessment,
      courseCode: selectedCourse,
      isLab: true,
      labItems: updatedItems,
    };
    onSaveAssessment(updated);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedTime(now);
    setSaveStatusMessage('Lab marks saved permanently');
    setIsSavedBadgeVisible(true);
  };

  const handleAddLabItem = () => {
    const currentItems = currentAssessment.labItems && currentAssessment.labItems.length > 0
      ? currentAssessment.labItems
      : DEFAULT_LAB_ASSESSMENT_ITEMS;

    const newItem: LabAssessmentItem = {
      id: `lab_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: `Lab Assessment ${currentItems.length + 1}`,
      marksObtained: null,
      maxMarks: 20,
    };

    const updated: CourseAssessment = {
      ...currentAssessment,
      courseCode: selectedCourse,
      isLab: true,
      labItems: [...currentItems, newItem],
    };
    onSaveAssessment(updated);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedTime(now);
    setSaveStatusMessage('Added custom exam component');
  };

  const handleRemoveLabItem = (itemId: string) => {
    const currentItems = currentAssessment.labItems && currentAssessment.labItems.length > 0
      ? currentAssessment.labItems
      : DEFAULT_LAB_ASSESSMENT_ITEMS;

    const updated: CourseAssessment = {
      ...currentAssessment,
      courseCode: selectedCourse,
      isLab: true,
      labItems: currentItems.filter((it) => it.id !== itemId),
    };
    onSaveAssessment(updated);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedTime(now);
    setSaveStatusMessage('Exam component removed');
  };

  const handleResetLabDistribution = () => {
    const updated: CourseAssessment = {
      ...currentAssessment,
      courseCode: selectedCourse,
      isLab: true,
      labItems: DEFAULT_LAB_ASSESSMENT_ITEMS.map((it) => ({ ...it, marksObtained: null })),
    };
    onSaveAssessment(updated);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedTime(now);
    setSaveStatusMessage('Reset to default lab distribution');
  };

  // Reset/Clear marks for selected course
  const handleToggleResetConfirm = () => {
    setShowResetConfirm((prev) => !prev);
  };

  const handleExecuteResetMarks = () => {
    if (isSelectedCourseLab) {
      handleResetLabDistribution();
    } else {
      const reset: CourseAssessment = {
        courseCode: selectedCourse,
        quiz1: null,
        quiz2: null,
        quiz3: null,
        midterm: null,
        misc: null,
        finalExam: null,
      };
      onSaveAssessment(reset);
      setSaveStatusMessage(`Marks cleared for ${selectedCourse}`);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(now);
    }
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Course Selection Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#16171D] border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-neutral-100">
                The Bar Forecaster & Academic Target Simulator
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Sem {currentSemesterInfo.shortLabel}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
              3 Quizzes (best 2 count for 20) + Midterm (20) + Misc (10) + Final (50) = 100 Marks. Computes exact score needed in Final Exam to pass 40% (Grade D).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowGradingTable(!showGradingTable)}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-300 hover:text-amber-300 hover:border-amber-500/40 flex items-center gap-1.5 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>{showGradingTable ? 'Hide Grading Scale' : 'Grading Scale'}</span>
            </button>
          </div>
        </div>

        {/* Official Grading Scale Reference Table (Expandable) */}
        {showGradingTable && (
          <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-800">
              <span className="font-semibold text-neutral-200">
                Official University Grading System (Scale 4.00)
              </span>
              <span className="text-amber-400 font-mono text-[11px]">
                Passing Threshold: 40% (Grade D, 2.00 GP)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                    <th className="py-2 px-3">Numerical Score</th>
                    <th className="py-2 px-3 text-center">Letter Grade</th>
                    <th className="py-2 px-3 text-right">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 font-mono">
                  {GRADING_SCALE.map((tier) => (
                    <tr
                      key={tier.letterGrade}
                      className={tier.letterGrade === 'F' ? 'text-rose-400' : 'text-neutral-300'}
                    >
                      <td className="py-1.5 px-3">{tier.rangeLabel}</td>
                      <td className="py-1.5 px-3 text-center font-bold text-amber-300">
                        {tier.letterGrade}
                      </td>
                      <td className="py-1.5 px-3 text-right">{tier.gradePoint.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Course Selection Tabs: Theory Courses First, then Lab Courses */}
        <div className="space-y-2.5">
          {(() => {
            const theoryCoursesInRoutine = uniqueCourses.filter(
              (c) => !isCourseSessional(c) && !assessments[c]?.isLab
            );
            const labCoursesInRoutine = uniqueCourses.filter(
              (c) => isCourseSessional(c) || !!assessments[c]?.isLab
            );

            return (
              <>
                {/* 1. Theory Courses Selection */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1 text-[10px] font-mono text-neutral-400">
                    <span className="uppercase tracking-wider font-semibold">1. Theory Courses (Lecture)</span>
                    <span>{theoryCoursesInRoutine.length} Courses</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {theoryCoursesInRoutine.map((c) => {
                      const assess = assessments[c];
                      const hasData =
                        assess &&
                        (assess.quiz1 !== null ||
                          assess.quiz2 !== null ||
                          assess.quiz3 !== null ||
                          assess.midterm !== null ||
                          assess.misc !== null ||
                          assess.finalExam !== null);
                      const cr = getCourseCredits(c);

                      return (
                        <button
                          key={c}
                          onClick={() => setSelectedCourse(c)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                            selectedCourse === c
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                              : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
                          }`}
                        >
                          <span>{c}</span>
                          <span className="text-[10px] text-neutral-500 font-normal">({cr} Cr)</span>
                          {hasData && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Marks entered" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Lab Courses Selection */}
                {labCoursesInRoutine.length > 0 && (
                  <div className="space-y-1 pt-1.5 border-t border-neutral-800/60">
                    <div className="flex items-center justify-between px-1 text-[10px] font-mono text-amber-400/90">
                      <span className="uppercase tracking-wider font-semibold flex items-center gap-1.5">
                        <FlaskConical className="w-3 h-3 text-amber-400" />
                        2. Lab / Sessional Courses (Custom Mark Distribution)
                      </span>
                      <span>{labCoursesInRoutine.length} Labs</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {labCoursesInRoutine.map((c) => {
                        const assess = assessments[c];
                        const hasData = !!(
                          assess?.labItems &&
                          assess.labItems.some((it) => it.marksObtained !== null)
                        );
                        const cr = getCourseCredits(c);

                        return (
                          <button
                            key={c}
                            onClick={() => setSelectedCourse(c)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                              selectedCourse === c
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
                            }`}
                          >
                            <FlaskConical className="w-3 h-3 text-amber-400" />
                            <span>{c}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/15 text-amber-300 font-sans">
                              Lab
                            </span>
                            <span className="text-[10px] text-neutral-500 font-normal">({cr} Cr)</span>
                            {hasData && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Marks entered" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* 2. Main Grid: Assessment Inputs (Left) & Pass Bar Target (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Assessment Components with Permanent Save Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-[#18191E] border border-neutral-800 space-y-5 shadow-lg">
            
            {/* Component Header & Permanent Storage Action Bar */}
            <div className="space-y-3 pb-3 border-b border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-200 tracking-wide uppercase">
                    Assessment Marks Input
                  </span>
                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    Course: <strong className="text-amber-400">{selectedCourse}</strong> · {courseCredits} Credits
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleResetConfirm}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-rose-300 border border-neutral-800 transition-colors"
                    title="Clear entered marks for this course"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleManualPermanentSave}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Permanently save marks for this exam and course"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Permanently</span>
                  </button>
                </div>
              </div>

              {/* Inline Clear Confirmation */}
              {showResetConfirm && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs">
                  <span className="text-rose-200 text-[11px]">Clear all entered marks for {selectedCourse}?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleExecuteResetMarks}
                      className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-[10px]"
                    >
                      Yes, Clear
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Permanent Save Indicator Pill */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-900/90 border border-neutral-800/90 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{saveStatusMessage}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{lastSavedTime}</span>
                </div>
              </div>
            </div>

            {isSelectedCourseLab ? (
              /* LAB / SESSIONAL COURSE: CUSTOMIZABLE ASSESSMENT DISTRIBUTION */
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      Custom Lab Exam & Assessment Distribution
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300">
                      Total Max: {calculation.labTotalMax || 100} Marks
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Lab & sessional courses have different mark distributions (e.g. Lab reports, viva, performance, lab quizzes, project). Customize exam names, edit maximum marks, and enter your scores below:
                  </p>
                </div>

                {/* List of Custom Lab Assessment Items */}
                <div className="space-y-2.5">
                  {(currentAssessment.labItems && currentAssessment.labItems.length > 0
                    ? currentAssessment.labItems
                    : DEFAULT_LAB_ASSESSMENT_ITEMS
                  ).map((item, idx) => {
                    const itemScore = item.marksObtained;
                    const itemPct = itemScore !== null && item.maxMarks > 0
                      ? Math.round((itemScore / item.maxMarks) * 100)
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
                              className="w-full px-2.5 py-1 text-xs font-semibold text-neutral-200 bg-neutral-950 border border-neutral-700/80 rounded-lg focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
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

                {/* Add Custom Component & Reset Buttons */}
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
                    onClick={handleResetLabDistribution}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors font-mono"
                    title="Reset to default lab distribution (10, 20, 20, 50)"
                  >
                    Reset Breakdown
                  </button>
                </div>
              </div>
            ) : (
              /* THEORY COURSE: STANDARD 4-COMPONENT SYSTEM */
              <div className="space-y-4">
                {/* 1. Three Quizzes (Best 2 Counted) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-200">
                      1. Three Quizzes (Best 2 Counted)
                    </span>
                    <span className="text-amber-400 font-mono text-[11px]">
                      Counted: {calculation.bestTwoQuizTotal} / 20
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Quiz 1 */}
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                      <div className="flex items-center justify-between text-xs">
                        <label className="text-neutral-400 font-medium">Quiz 1</label>
                        <span className="text-[10px] text-neutral-500 font-mono">/10</span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.5}
                        value={currentAssessment.quiz1 ?? ''}
                        onChange={(e) => handleInputChange('quiz1', e.target.value)}
                        placeholder="0 - 10"
                        className="w-full text-center py-2 px-2 rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                      <div className="text-center text-[10px]">
                        {calculation.sortedQuizzes.find((q) => q.index === 1)?.isTaken ? (
                          <span className="text-emerald-400 font-semibold">✓ Counted</span>
                        ) : (
                          <span className="text-neutral-500">Dropped</span>
                        )}
                      </div>
                    </div>

                    {/* Quiz 2 */}
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                      <div className="flex items-center justify-between text-xs">
                        <label className="text-neutral-400 font-medium">Quiz 2</label>
                        <span className="text-[10px] text-neutral-500 font-mono">/10</span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.5}
                        value={currentAssessment.quiz2 ?? ''}
                        onChange={(e) => handleInputChange('quiz2', e.target.value)}
                        placeholder="0 - 10"
                        className="w-full text-center py-2 px-2 rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                      <div className="text-center text-[10px]">
                        {calculation.sortedQuizzes.find((q) => q.index === 2)?.isTaken ? (
                          <span className="text-emerald-400 font-semibold">✓ Counted</span>
                        ) : (
                          <span className="text-neutral-500">Dropped</span>
                        )}
                      </div>
                    </div>

                    {/* Quiz 3 */}
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                      <div className="flex items-center justify-between text-xs">
                        <label className="text-neutral-400 font-medium">Quiz 3</label>
                        <span className="text-[10px] text-neutral-500 font-mono">/10</span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.5}
                        value={currentAssessment.quiz3 ?? ''}
                        onChange={(e) => handleInputChange('quiz3', e.target.value)}
                        placeholder="0 - 10"
                        className="w-full text-center py-2 px-2 rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                      <div className="text-center text-[10px]">
                        {calculation.sortedQuizzes.find((q) => q.index === 3)?.isTaken ? (
                          <span className="text-emerald-400 font-semibold">✓ Counted</span>
                        ) : (
                          <span className="text-neutral-500">Dropped</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Midterm Examination */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-200">
                      2. Midterm Examination
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      Max 20 Marks
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.5}
                      value={currentAssessment.midterm ?? ''}
                      onChange={(e) => handleInputChange('midterm', e.target.value)}
                      placeholder="Enter midterm score (0 - 20)"
                      className="w-full py-2 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-neutral-400 font-mono shrink-0">/ 20</span>
                  </div>
                </div>

                {/* 3. Miscellaneous */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-200">
                      3. Miscellaneous (Attendance, Performance, Assignments)
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      Max 10 Marks
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      value={currentAssessment.misc ?? ''}
                      onChange={(e) => handleInputChange('misc', e.target.value)}
                      placeholder="Enter misc / attendance / assignment score (0 - 10)"
                      className="w-full py-2 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-neutral-400 font-mono shrink-0">/ 10</span>
                  </div>
                </div>

                {/* 4. Final Examination */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-200">
                      4. Final Examination
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      Max 50 Marks
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={0.5}
                      value={currentAssessment.finalExam ?? currentAssessment.finalExamScore ?? ''}
                      onChange={(e) => handleInputChange('finalExam', e.target.value)}
                      placeholder="Enter final exam score (0 - 50)"
                      className="w-full py-2 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-neutral-400 font-mono shrink-0">/ 50</span>
                  </div>
                </div>
              </div>
            )}

            {/* Total Course Score Banner */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                  {isSelectedCourseLab ? 'Total Lab Score' : 'Total Course Score'}
                </span>
                <div className="text-lg font-bold font-mono text-amber-300">
                  {isSelectedCourseLab
                    ? `${calculation.labTotalObtained} / ${calculation.labTotalMax}`
                    : `${calculation.totalCourseMarks} / 100`}
                  <span className="text-neutral-400 text-xs font-normal ml-2">
                    ({calculation.totalCourseMarks}%)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-neutral-400 block text-[10px] uppercase font-mono">Current Letter Grade</span>
                <div className="flex items-center gap-2 justify-end">
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {calculation.achievedGrade.letterGrade}
                  </span>
                  <span className="font-mono text-neutral-300">
                    ({calculation.achievedGrade.gradePoint.toFixed(2)} GP)
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: The Pass Bar Forecaster Target */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#181920] via-neutral-900 to-[#181920] border border-amber-500/30 space-y-5 shadow-xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                  {isSelectedCourseLab
                    ? 'Pass Bar Forecaster (Custom Lab Marks)'
                    : 'Pass Bar Forecaster (Final Exam / 50)'}
                </h3>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                Passing Bar: 40% (Grade D)
              </span>
            </div>

            {/* The Big Pass Bar Highlight */}
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 text-center space-y-2">
              <span className="text-xs text-neutral-400 uppercase tracking-wider">
                {isSelectedCourseLab
                  ? 'Marks Needed Across Remaining Exams to Pass (40%)'
                  : 'Marks Needed in Final to Pass Course'}
              </span>

              <div className="text-4xl font-extrabold font-mono text-amber-400 tracking-tight py-1">
                {isSelectedCourseLab ? calculation.labMarksNeededToPass : calculation.finalExamPassNeeded}{' '}
                <span className="text-lg font-normal text-neutral-400">
                  {isSelectedCourseLab ? `/ ${calculation.labTotalMax || 100} Total` : '/ 50'}
                </span>
              </div>

              <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                {(isSelectedCourseLab ? calculation.labMarksNeededToPass : calculation.finalExamPassNeeded) === 0 ? (
                  <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Pass Bar (40% - Grade D) already secured!
                  </span>
                ) : isSelectedCourseLab ? (
                  <span>
                    You need <strong className="text-amber-300 font-mono">{calculation.labMarksNeededToPass}</strong> more marks across remaining exams to reach the 40% passing threshold ({(0.4 * (calculation.labTotalMax || 100)).toFixed(1)} marks).
                  </span>
                ) : (
                  <span>
                    You need <strong className="text-amber-300 font-mono">{calculation.finalExamPassNeeded}</strong> marks out of 50 in the final exam ({Math.round((calculation.finalExamPassNeeded / 50) * 100)}%) to clear the Pass Bar.
                  </span>
                )}
              </p>
            </div>

            {/* Visual Gauge Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">
                  {isSelectedCourseLab ? 'Marks Secured So Far: ' : 'Pre-Final Continuous Secured: '}
                  <strong className="text-neutral-100 font-mono">
                    {isSelectedCourseLab ? calculation.labTotalObtained : calculation.preFinalTotal}
                  </strong>{' '}
                  / {isSelectedCourseLab ? calculation.labTotalMax || 100 : 50}
                </span>
                <span className="text-amber-400 font-mono font-bold">
                  {isSelectedCourseLab
                    ? `${calculation.totalCourseMarks}% Total`
                    : `${calculation.percentageAchievedSoFar}% of Pre-Final`}
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-neutral-900 overflow-hidden relative border border-neutral-800">
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                  style={{ left: '40%' }}
                  title="Pass Bar (40%)"
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 z-10"
                  style={{ left: '80%' }}
                  title="A+ Grade (80%)"
                />

                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, calculation.totalCourseMarks)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                <span>0</span>
                <span className="text-amber-400 font-semibold">▲ 40 (Pass Bar)</span>
                <span>65 (B+)</span>
                <span className="text-emerald-400">80 (A+)</span>
              </div>
            </div>

            {/* Target Letter Grade Simulation List */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">
                  {isSelectedCourseLab
                    ? 'Marks Needed Across Remaining Exams for Letter Grades'
                    : 'Marks Needed in Final (/50) for Target Letter Grades'}
                </span>
                <span className="text-neutral-500 font-mono text-[11px]">
                  Scale 4.00
                </span>
              </div>

              <div className="space-y-1 text-xs max-h-52 overflow-y-auto pr-1">
                {calculation.targetGrades.map((target) => (
                  <div
                    key={target.letterGrade}
                    className={`p-2 rounded-lg border flex items-center justify-between transition-colors ${
                      target.isAlreadySecured
                        ? 'bg-emerald-950/30 border-emerald-800/40'
                        : target.neededInFinal === null
                        ? 'bg-neutral-900/40 border-neutral-800/60 opacity-60'
                        : 'bg-neutral-900/80 border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-amber-300 w-7">
                        {target.letterGrade}
                      </span>
                      <span className="text-neutral-300">
                        {target.rangeLabel}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        ({target.gradePoint.toFixed(2)} GP)
                      </span>
                    </div>

                    <div className="font-mono text-xs">
                      {target.isAlreadySecured ? (
                        <span className="text-emerald-400 font-semibold text-[11px]">
                          ✓ Secured
                        </span>
                      ) : target.neededInFinal !== null ? (
                        <span className="text-neutral-200">
                          Need <strong className="text-amber-300">{target.neededInFinal}</strong>{' '}
                          {isSelectedCourseLab ? `marks (${target.requiredPercentageInFinal}%)` : `/ 50 (${target.requiredPercentageInFinal}%)`}
                        </span>
                      ) : (
                        <span className="text-neutral-500 text-[11px]">
                          Unattainable
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3. Section: Current Semester CGPA Calculator (Credit-Weighted) */}
      <div className="p-5 rounded-2xl bg-[#16171D] border border-neutral-800 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-500" />
              Current Semester ({currentSemesterInfo.shortLabel}) CGPA Summary
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              GPA calculated from all enrolled courses weighted by credit hours.
            </p>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">Enrolled Credits</div>
              <div className="text-sm font-bold font-mono text-neutral-200">
                {gpaSummary.totalCredits} Cr
              </div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">Current Semester CGPA</div>
              <div className="text-xl font-bold font-mono text-amber-400">
                {gpaSummary.projectedGPA.toFixed(2)}{' '}
                <span className="text-xs font-normal text-neutral-500">/ 4.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                <th className="py-2 px-3">Course</th>
                <th className="py-2 px-3 text-center">Cr</th>
                <th className="py-2 px-3 text-center">Continuous (/40)</th>
                <th className="py-2 px-3 text-center">Misc (/10)</th>
                <th className="py-2 px-3 text-center">Final (/50)</th>
                <th className="py-2 px-3 text-center">Total (/100)</th>
                <th className="py-2 px-3 text-center">Grade</th>
                <th className="py-2 px-3 text-right">GP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 font-mono">
              {gpaSummary.courseDetails.map((detail) => (
                <tr
                  key={detail.courseCode}
                  onClick={() => setSelectedCourse(detail.courseCode)}
                  className={`cursor-pointer transition-colors ${
                    selectedCourse === detail.courseCode
                      ? 'bg-amber-500/10 text-amber-200'
                      : 'text-neutral-300 hover:bg-neutral-900/50'
                  }`}
                >
                  <td className="py-2 px-3 font-bold text-neutral-100 flex items-center gap-1.5">
                    <span>{detail.courseCode}</span>
                    {selectedCourse === detail.courseCode && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </td>
                  <td className="py-2 px-3 text-center text-neutral-400">{detail.credits}</td>
                  <td className="py-2 px-3 text-center text-neutral-200">{detail.continuousScore}</td>
                  <td className="py-2 px-3 text-center text-neutral-200">{detail.miscScore}</td>
                  <td className="py-2 px-3 text-center text-neutral-200">{detail.finalScore}</td>
                  <td className="py-2 px-3 text-center text-amber-300 font-bold">{detail.totalScore}</td>
                  <td className="py-2 px-3 text-center font-bold text-amber-400">{detail.letterGrade}</td>
                  <td className="py-2 px-3 text-right text-neutral-200">{detail.gradePoint.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Section: Historical Semesters & Total Cumulative CGPA Calculation */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#181920] via-neutral-900 to-[#181920] border border-amber-500/30 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" />
              Total University Cumulative CGPA Calculation
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Enter the CGPA you achieved in your previous semesters to compute your overall university standing.
            </p>
          </div>

          {/* Toggle Option: Include current semester or not */}
          <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-neutral-300">
              Include Current Semester ({currentSemesterInfo.shortLabel}):
            </span>
            <button
              type="button"
              onClick={() => setIncludeCurrentSemester(!includeCurrentSemester)}
              className={`p-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                includeCurrentSemester
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {includeCurrentSemester ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Included</span>
                </>
              ) : (
                <span>Excluded</span>
              )}
            </button>
          </div>
        </div>

        {/* Prior Semesters Input Grid */}
        {priorSemesters.length === 0 ? (
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              You are currently in your first semester ({currentSemesterInfo.shortLabel}). No previous semester CGPAs are required.
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300">
                Previous Semester CGPA Inputs (Prior to {currentSemesterInfo.shortLabel})
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">
                {priorSemesters.length} Prior Term{priorSemesters.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {priorSemesters.map((sem) => {
                const val = historicalGPAs[sem.key];

                return (
                  <div
                    key={sem.key}
                    className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold font-mono text-amber-300">
                        Sem {sem.shortLabel}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {sem.totalCredits} Cr
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-400 truncate">
                      {sem.name}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        min={0}
                        max={4}
                        step={0.01}
                        value={val !== null && val !== undefined ? val : ''}
                        onChange={(e) => handleUpdateHistoricalGPA(sem.key, e.target.value)}
                        placeholder="e.g. 3.75"
                        className="w-full py-1.5 px-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[10px] text-neutral-500 font-mono">/4.00</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Final Cumulative Calculation Result Banner */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center items-center">
          
          <div className="p-2 space-y-1">
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">
              Previous Cumulative CGPA
            </span>
            <div className="text-xl font-bold font-mono text-neutral-300">
              {priorTotalCredits > 0 ? calculatedPreviousCGPA.toFixed(2) : '—'}
            </div>
            <div className="text-[10px] text-neutral-500 font-mono">
              {priorTotalCredits.toFixed(2)} Credits Completed
            </div>
          </div>

          <div className="p-2 space-y-1 border-y sm:border-y-0 sm:border-x border-neutral-800">
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">
              Current Semester ({currentSemesterInfo.shortLabel})
            </span>
            <div className="text-xl font-bold font-mono text-amber-300">
              {gpaSummary.projectedGPA.toFixed(2)}
            </div>
            <div className="text-[10px] text-neutral-500 font-mono">
              {gpaSummary.totalCredits} Credits {includeCurrentSemester ? '(Included)' : '(Excluded)'}
            </div>
          </div>

          <div className="p-2 space-y-1">
            <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider font-mono">
              Total Cumulative CGPA
            </span>
            <div className="text-3xl font-extrabold font-mono text-amber-400">
              {finalCumulativeCGPA.toFixed(2)}{' '}
              <span className="text-sm font-normal text-neutral-400">/ 4.00</span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono">
              Total {finalTotalCredits.toFixed(2)} Credits{' '}
              {cgpaDelta !== 0 && priorEnteredCount > 0 && (
                <span className={cgpaDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  ({cgpaDelta > 0 ? `+${cgpaDelta.toFixed(2)}` : cgpaDelta.toFixed(2)})
                </span>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
