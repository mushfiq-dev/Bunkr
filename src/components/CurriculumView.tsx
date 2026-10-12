import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Layers,
  Award,
  Sparkles,
  Search,
  Book,
  Clock,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ALL_SEMESTERS_CURRICULUM, GRADING_SCALE } from '../data/curriculum';
import { SemesterCurriculum, CourseInfo } from '../types';

interface CurriculumViewProps {
  currentSemesterKey: string;
  onApplySemesterToRoutine: (sem: SemesterCurriculum) => void;
  isAdminUnlocked: boolean;
  onOpenAdmin: () => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  currentSemesterKey,
  onApplySemesterToRoutine,
  isAdminUnlocked,
  onOpenAdmin,
}) => {
  const [selectedSemKey, setSelectedSemKey] = useState<string>(
    currentSemesterKey || 'y2s1'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCourseCode, setExpandedCourseCode] = useState<string | null>(null);

  const selectedSemester = ALL_SEMESTERS_CURRICULUM.find(
    (s) => s.key === selectedSemKey
  ) || ALL_SEMESTERS_CURRICULUM[0];

  const totalCurriculumCredits = ALL_SEMESTERS_CURRICULUM.reduce(
    (acc, sem) => acc + sem.totalCredits,
    0
  );

  const toggleCourseExpand = (code: string) => {
    setExpandedCourseCode((prev) => (prev === code ? null : code));
  };

  // Filtered courses based on search query
  const displayedCourses = selectedSemester.courses.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* 1. Header & CSE Bulletin Degree Summary */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#16171D] border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <h2 className="text-base sm:text-lg font-bold text-neutral-100">
                AUST CSE Bulletin — Undergraduate Curriculum
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Official B.Sc. in Computer Science and Engineering syllabus, credit structures, contact hours, prerequisites, and textbook outlines according to the AUST CSE Academic Bulletin.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
            <div className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300">
              <span className="text-neutral-500 text-[10px] uppercase block">Total Degree Credits</span>
              <strong className="text-amber-400 text-sm">156.0 Credits</strong>
            </div>
          </div>
        </div>

        {/* Degree Breakdown Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-800/80 text-xs">
          <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-0.5">
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Basic Sciences & Math</span>
            <div className="font-bold font-mono text-neutral-200">21.0 Credits</div>
            <p className="text-[10px] text-neutral-500">PHY, CHEM, MATH</p>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-0.5">
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Humanities & Social</span>
            <div className="font-bold font-mono text-neutral-200">12.0 Credits</div>
            <p className="text-[10px] text-neutral-500">HUM (English, Econ, Society)</p>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-0.5">
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Core CSE Theory & Labs</span>
            <div className="font-bold font-mono text-amber-400">104.25 Credits</div>
            <p className="text-[10px] text-neutral-500">Algorithms, DB, OS, Networks</p>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-0.5">
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Basic Engineering</span>
            <div className="font-bold font-mono text-neutral-200">8.25 Credits</div>
            <p className="text-[10px] text-neutral-500">EEE & ME Foundation</p>
          </div>
        </div>
      </div>

      {/* 2. Semester Selector Navigation Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {ALL_SEMESTERS_CURRICULUM.map((sem) => {
          const isSelected = sem.key === selectedSemKey;
          const isCurrentActive = sem.key === currentSemesterKey;

          return (
            <button
              key={sem.key}
              onClick={() => {
                setSelectedSemKey(sem.key);
                setExpandedCourseCode(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/50 shadow-sm'
                  : 'bg-[#18191E] border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className={isSelected ? 'font-bold text-amber-300' : 'text-neutral-300'}>
                  Y{sem.year} S{sem.semester} ({sem.shortLabel})
                </span>
                {isCurrentActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Active in Routine" />
                )}
              </div>
              <div className="text-[11px] font-semibold text-neutral-100 mt-1 truncate">
                {sem.name}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                {sem.totalCredits} Cr · {sem.courses.length} Courses
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Selected Semester Header, Search & Action Bar */}
      <div className="p-5 rounded-2xl bg-[#18191E] border border-neutral-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-100 font-mono">
                {selectedSemester.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {selectedSemester.totalCredits} Credits
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Theory: {selectedSemester.courses.filter((c) => !c.isSessional).length} Courses ({selectedSemester.theoryHours || 15} hrs/wk) · Sessional Labs: {selectedSemester.courses.filter((c) => c.isSessional).length} Courses ({selectedSemester.labHours || 9} hrs/wk)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 w-44"
              />
            </div>

            {/* Load into routine CTA */}
            {isAdminUnlocked ? (
              <button
                onClick={() => onApplySemesterToRoutine(selectedSemester)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Load Into Weekly Routine</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdmin}
                className="px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <span>Unlock Admin to Load</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. Course Cards Grid with Expandable Syllabus & Textbook Outlines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {displayedCourses.map((course) => {
            const isExpanded = expandedCourseCode === course.code;

            return (
              <div
                key={course.code}
                className={`rounded-2xl border transition-all duration-200 ${
                  isExpanded
                    ? 'bg-neutral-950/90 border-amber-500/40 shadow-lg ring-1 ring-amber-500/20'
                    : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Course Main Card Header */}
                <div
                  onClick={() => toggleCourseExpand(course.code)}
                  className="p-4 cursor-pointer select-none space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-amber-300">
                        {course.code}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {course.credits} Credits
                      </span>
                      {course.isSessional ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                          Sessional Lab
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                          Theory
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <span className="text-[10px] font-mono text-neutral-500">
                        {isExpanded ? 'Collapse' : 'Details'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-neutral-100 leading-snug">
                    {course.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-neutral-400 font-mono pt-1">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      Hours: {course.hours || (course.isSessional ? '0-3' : '3-0')}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Prereq: <strong className="text-neutral-300">{course.prerequisite || 'Nil'}</strong>
                    </span>
                  </div>
                </div>

                {/* Expandable Syllabus & Textbook Bulletin Section */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-neutral-800/80 space-y-3.5 text-xs">
                    
                    {/* Course Syllabus Outline */}
                    {course.syllabus && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-400 text-[11px] uppercase tracking-wider">
                          <FileText className="w-3 h-3" />
                          <span>CSE Bulletin Syllabus Outline</span>
                        </div>
                        <p className="text-neutral-300 leading-relaxed bg-neutral-900/90 p-3 rounded-xl border border-neutral-800 font-sans text-xs">
                          {course.syllabus}
                        </p>
                      </div>
                    )}

                    {/* Prescribed Books & References */}
                    {course.books && course.books.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 font-semibold text-neutral-300 text-[11px] uppercase tracking-wider">
                          <Book className="w-3 h-3 text-amber-400" />
                          <span>Prescribed Textbooks & References</span>
                        </div>
                        <ul className="space-y-1 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                          {course.books.map((b, idx) => (
                            <li key={idx} className="text-neutral-300 flex items-start gap-2 text-xs">
                              <span className="text-amber-500 font-mono text-[10px] mt-0.5">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Examination Evaluation Weight */}
                    <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-neutral-400">Exam Scheme:</span>
                      <span className="text-amber-300 font-medium">
                        {course.isSessional
                          ? 'Continuous Lab Performance + Report + Viva (100%)'
                          : 'Quizzes (20) + Midterm (20) + Misc (10) + Final (50)'}
                      </span>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {displayedCourses.length === 0 && (
          <div className="p-8 text-center text-xs text-neutral-500">
            No courses found matching "{searchQuery}".
          </div>
        )}
      </div>

      {/* 5. Official Grading System Matrix */}
      <div className="p-5 rounded-2xl bg-[#16171D] border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              AUST Official Grading Scale (Scale 4.00)
            </h3>
          </div>
          <span className="text-xs text-amber-400 font-mono">
            40% Minimum Passing Bar (Grade D, 2.00 GP)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono">
          {GRADING_SCALE.map((tier) => (
            <div
              key={tier.letterGrade}
              className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                tier.letterGrade === 'F'
                  ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-amber-300">
                  {tier.letterGrade}
                </span>
                <span className="text-xs font-semibold text-neutral-300">
                  {tier.gradePoint.toFixed(2)} GP
                </span>
              </div>
              <div className="text-[11px] text-neutral-400">
                {tier.rangeLabel}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
