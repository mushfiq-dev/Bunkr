import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Lock,
  Unlock,
  Archive,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  RoutineConfig,
  CalendarDayInfo,
  AttendanceRecord,
  AttendanceStatus,
  DAY_SHORT_NAMES,
} from '../types';
import {
  getUniqueCourses,
  calculateCourseAttendanceSummary,
  formatDateToKey,
} from '../services/academicMath';
import { useTouchGuard } from '../hooks/useTouchGuard';

interface AttendanceGridProps {
  config: RoutineConfig;
  calendarDays: CalendarDayInfo[];
  attendanceRecords: Record<string, AttendanceRecord>;
  onToggleAttendance: (date: string, courseCode: string) => void;
  onSelectDateDetails?: (day: CalendarDayInfo) => void;
}

export const AttendanceGrid: React.FC<AttendanceGridProps> = ({
  config,
  calendarDays,
  attendanceRecords,
  onToggleAttendance,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'ALL'>('ALL');
  // Track which completed weeks are explicitly unlocked by the user to prevent accidental misclicks
  const [unlockedCompletedWeeks, setUnlockedCompletedWeeks] = useState<Record<number, boolean>>({});

  const { touchProps, guardClick } = useTouchGuard();

  const uniqueCourses = getUniqueCourses(config.weeklySchedule);
  const todayKey = formatDateToKey(new Date());

  // Calculate summaries for all courses (The Math: 70% Skip Buffer)
  const courseSummaries = useMemo(() => {
    return uniqueCourses.map((c) =>
      calculateCourseAttendanceSummary(c, config, calendarDays, attendanceRecords)
    );
  }, [uniqueCourses, config, calendarDays, attendanceRecords]);

  // Next attendance state cycling helper
  const getNextStatusLabel = (current: AttendanceStatus): string => {
    switch (current) {
      case 'unmarked': return 'Attended';
      case 'attended': return 'Skipped';
      case 'skipped': return 'Blank';
    }
  };

  // Group all calendar days by week
  const allWeeksMap = useMemo(() => {
    const map = new Map<number, CalendarDayInfo[]>();
    for (const day of calendarDays) {
      if (!map.has(day.weekNumber)) {
        map.set(day.weekNumber, []);
      }
      map.get(day.weekNumber)!.push(day);
    }
    return map;
  }, [calendarDays]);

  const allWeekNumbers = useMemo(() => {
    return Array.from(allWeeksMap.keys()).sort((a, b) => a - b);
  }, [allWeeksMap]);

  // Helper to check if every single scheduled class in a week has been logged (attended or skipped)
  const getWeekLoggingStatus = (weekNum: number) => {
    const days = allWeeksMap.get(weekNum) || [];
    let totalClasses = 0;
    let loggedClasses = 0;

    for (const day of days) {
      for (const course of day.courses) {
        totalClasses++;
        const key = `${day.date}_${course}`;
        const status = attendanceRecords[key]?.status;
        if (status === 'attended' || status === 'skipped') {
          loggedClasses++;
        }
      }
    }

    const isFullyLogged = totalClasses > 0 && loggedClasses === totalClasses;
    return { totalClasses, loggedClasses, isFullyLogged };
  };

  // Calculate week categories for ordering:
  // Active/incomplete weeks stay at top in chronological order
  // Fully logged weeks move to the bottom below week 14 (to prevent scrolling and misclicks)
  const { incompleteWeekNumbers, completedWeekNumbers } = useMemo(() => {
    const incomplete: number[] = [];
    const completed: number[] = [];

    for (const weekNum of allWeekNumbers) {
      const { isFullyLogged } = getWeekLoggingStatus(weekNum);
      if (isFullyLogged) {
        completed.push(weekNum);
      } else {
        incomplete.push(weekNum);
      }
    }

    return {
      incompleteWeekNumbers: incomplete,
      completedWeekNumbers: completed,
    };
  }, [allWeekNumbers, allWeeksMap, attendanceRecords]);

  // Final sorted list of week numbers based on user selection or auto-reorder rule
  const displayWeekGroups = useMemo(() => {
    if (selectedWeekFilter !== 'ALL') {
      return {
        active: [selectedWeekFilter],
        completed: [] as number[],
      };
    }

    return {
      active: incompleteWeekNumbers,
      completed: completedWeekNumbers,
    };
  }, [selectedWeekFilter, incompleteWeekNumbers, completedWeekNumbers]);

  const toggleUnlockWeek = (weekNum: number) => {
    setUnlockedCompletedWeeks((prev) => ({
      ...prev,
      [weekNum]: !prev[weekNum],
    }));
  };

  // Render a single week's matrix row
  const renderWeekCard = (weekNum: number, isCompleted: boolean) => {
    const daysInWeek = allWeeksMap.get(weekNum) || [];
    const { totalClasses, loggedClasses } = getWeekLoggingStatus(weekNum);
    const isUnlocked = !!unlockedCompletedWeeks[weekNum];

    return (
      <div
        key={weekNum}
        className={`p-6 sm:p-8 rounded-3xl border transition-all space-y-6 shadow-xl ${
          isCompleted
            ? 'bg-[#14151B]/90 border-emerald-950/60 hover:border-emerald-900/70'
            : 'bg-[#161720] border-neutral-800 hover:border-neutral-700/80'
        }`}
      >
        {/* Week Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800/80">
          <div className="flex items-center gap-3.5 flex-wrap">
            <span
              className={`text-sm sm:text-base font-bold font-mono px-3.5 py-1.5 rounded-xl tracking-wider shadow-sm ${
                isCompleted
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              WEEK {weekNum}
            </span>

            {isCompleted ? (
              <span className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-950/40 px-3.5 py-1.5 rounded-xl border border-emerald-800/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All Classes Logged · Moved to Bottom</span>
              </span>
            ) : (
              <span className="text-xs sm:text-sm text-neutral-400 font-medium font-mono">
                {loggedClasses} of {totalClasses} classes logged
              </span>
            )}
          </div>

          <div className="flex items-center gap-3.5 text-xs font-mono">
            {/* Progress Bar for Week */}
            <div className="hidden md:flex items-center gap-2.5">
              <div className="w-32 h-2.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${totalClasses > 0 ? (loggedClasses / totalClasses) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-xs text-neutral-400 font-medium">
                {totalClasses > 0 ? Math.round((loggedClasses / totalClasses) * 100) : 0}%
              </span>
            </div>

            {/* Safety lock toggle for completed weeks to prevent accidental misclicks */}
            {isCompleted && (
              <button
                type="button"
                onClick={() => toggleUnlockWeek(weekNum)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-sans font-medium transition-colors cursor-pointer ${
                  isUnlocked
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                    : 'bg-neutral-800/80 border-neutral-700/80 text-neutral-300 hover:text-white hover:bg-neutral-700'
                }`}
                title={isUnlocked ? 'Lock week to prevent misclicks' : 'Unlock week to edit past records'}
              >
                {isUnlocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Unlocked (Editing Active)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Locked (No Misclicks)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 7 Days in Week Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5 sm:gap-4">
          {daysInWeek.map((day) => {
            const displayedCourses =
              selectedCourseFilter === 'ALL'
                ? day.courses
                : day.courses.filter((c) => c === selectedCourseFilter);

            const isToday = day.date === todayKey;
            const hasHoliday = !!day.holiday;

            return (
              <div
                key={day.date}
                className={`p-4 sm:p-4.5 rounded-2xl border transition-all flex flex-col justify-between min-h-[140px] shadow-sm ${
                  isToday
                    ? 'bg-amber-950/25 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                    : hasHoliday
                    ? 'bg-neutral-900/50 border-amber-900/30'
                    : 'bg-neutral-900/80 border-neutral-800/80 hover:border-neutral-750'
                }`}
              >
                {/* Day Header */}
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                    <span className="font-bold text-neutral-200">
                      {DAY_SHORT_NAMES[day.dayOfWeek]}
                    </span>
                    {isToday ? (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Today
                      </span>
                    ) : (
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {DAY_SHORT_NAMES[day.dayOfWeek]}
                      </span>
                    )}
                  </div>

                  {/* Holiday Marker */}
                  {hasHoliday && (
                    <div
                      className="text-[11px] text-amber-400/95 font-medium truncate mb-2"
                      title={day.holiday?.name}
                    >
                      ★ {day.holiday?.name}
                    </div>
                  )}

                  {/* Weekend Notice */}
                  {day.isWeekend && day.courses.length === 0 && !hasHoliday && (
                    <div className="text-xs text-neutral-500 italic py-1">
                      Weekend
                    </div>
                  )}
                </div>

                {/* Interactive Clickable Course Boxes */}
                <div className="space-y-2 pt-2">
                  {displayedCourses.length === 0 && day.courses.length > 0 && (
                    <div className="text-xs text-neutral-500 italic py-1">
                      Filtered out
                    </div>
                  )}

                  {displayedCourses.length === 0 && day.courses.length === 0 && !hasHoliday && !day.isWeekend && (
                    <div className="text-xs text-neutral-600 py-1">
                      No classes
                    </div>
                  )}

                  {displayedCourses.map((course) => {
                    const recordKey = `${day.date}_${course}`;
                    const status = attendanceRecords[recordKey]?.status || 'unmarked';
                    // If week is completed and currently locked, clicking is disabled to prevent misclicks
                    const isClickDisabled = isCompleted && !isUnlocked;

                    return (
                      <button
                        key={course}
                        type="button"
                        disabled={isClickDisabled}
                        {...touchProps}
                        onClick={
                          isClickDisabled
                            ? undefined
                            : guardClick(() => onToggleAttendance(day.date, course))
                        }
                        className={`w-full py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-xl flex items-center justify-between text-left font-mono text-xs sm:text-sm font-semibold transition-all select-none touch-manipulation ${
                          isClickDisabled
                            ? status === 'attended'
                              ? 'bg-emerald-700/80 text-white cursor-default opacity-90'
                              : status === 'skipped'
                              ? 'bg-rose-700/80 text-white cursor-default opacity-90'
                              : 'bg-neutral-800 text-neutral-400 cursor-default opacity-75'
                            : status === 'attended'
                            ? 'bg-emerald-600 text-white shadow-md hover:bg-emerald-500 active:scale-[0.98] cursor-pointer'
                            : status === 'skipped'
                            ? 'bg-rose-600 text-white shadow-md hover:bg-rose-500 active:scale-[0.98] cursor-pointer'
                            : 'bg-neutral-800/90 text-neutral-200 hover:bg-neutral-700 active:scale-[0.98] border border-neutral-700/80 cursor-pointer'
                        }`}
                        title={
                          isClickDisabled
                            ? `${course} — Locked (click 'Unlock' on Week ${weekNum} header to edit)`
                            : `${course} on ${day.date} — Currently: ${status}. Tap to switch to ${getNextStatusLabel(status)}`
                        }
                      >
                        <span className="break-words text-wrap leading-tight text-center">{course}</span>
                        
                        <span className="text-xs sm:text-sm font-bold shrink-0 ml-1.5">
                          {status === 'attended' && '✓'}
                          {status === 'skipped' && '✕'}
                          {status === 'unmarked' && '·'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 sm:space-y-12">

      {/* 1. The Math: 70% Skip Buffer KPI Dashboard (Spacious, Roomy, Clean) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Attendance Policies & Skip Math</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              The Math: 70% Attendance Rate & Skip Buffer
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xl">
              Live calculation of total classes, required attendances, and safe skip buffer for each course.
            </p>
          </div>

          <div className="text-xs text-amber-400 font-mono bg-amber-500/10 px-4 py-2.5 rounded-2xl border border-amber-500/20 shrink-0 shadow-sm self-start sm:self-auto">
            Strict University Minimum: 70%
          </div>
        </div>

        {/* Course KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {courseSummaries.map((summary) => {
            const isBufferZero = summary.skipBuffer === 0;
            const isCaution = summary.skipBuffer > 0 && summary.skipBuffer <= 2;
            const isSafe = summary.skipBuffer > 2;

            return (
              <div
                key={summary.courseCode}
                className={`p-6 sm:p-7 rounded-3xl border transition-all space-y-5 shadow-lg ${
                  !summary.canStillRecover
                    ? 'bg-rose-950/20 border-rose-800/50'
                    : isBufferZero
                    ? 'bg-rose-950/15 border-rose-900/40'
                    : isCaution
                    ? 'bg-amber-950/15 border-amber-900/40'
                    : 'bg-[#161720] border-neutral-800 hover:border-neutral-700/80'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl font-extrabold font-mono text-neutral-100 tracking-tight">
                        {summary.courseCode}
                      </span>
                      {summary.credits && (
                        <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-neutral-800 text-amber-300 border border-neutral-700/80">
                          {summary.credits} Cr
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 mt-1.5 font-medium">
                      {summary.weeklyCount} class{summary.weeklyCount > 1 ? 'es' : ''} / week
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-2xl sm:text-3xl font-black font-mono tabular-nums ${
                        summary.currentRate >= 70 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {summary.currentRate}%
                    </span>
                    <div className="text-[11px] text-neutral-500 font-mono mt-0.5">Current Rate</div>
                  </div>
                </div>

                {/* Progress Bar Visual */}
                <div className="space-y-2">
                  <div className="h-2.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        summary.currentRate >= 70 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, summary.currentRate))}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-neutral-800/60 font-mono divide-x divide-neutral-800">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-500 uppercase">Attended</span>
                      <strong className="text-neutral-200 text-sm">{summary.attendedCount}</strong>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-500 uppercase">Skipped</span>
                      <strong className="text-neutral-200 text-sm">{summary.skippedCount}</strong>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-500 uppercase">Total Planned</span>
                      <strong className="text-neutral-200 text-sm">{summary.totalPlannedClasses}</strong>
                    </div>
                  </div>
                </div>

                {/* Skip Buffer Stat Pod */}
                <div className="p-4 sm:p-4.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-neutral-400 uppercase font-mono tracking-wider">
                      Skip Buffer
                    </div>
                    <div className="text-sm sm:text-base font-bold font-mono mt-0.5">
                      {summary.skipBuffer > 0 ? (
                        <span className={isSafe ? 'text-emerald-400' : 'text-amber-400'}>
                          {summary.skipBuffer} more class{summary.skipBuffer > 1 ? 'es' : ''}
                        </span>
                      ) : (
                        <span className="text-rose-400">0 skips left</span>
                      )}
                    </div>
                  </div>

                  <div>
                    {!summary.canStillRecover ? (
                      <span className="text-xs text-rose-400 flex items-center gap-1.5 bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-800/50">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Below 70%
                      </span>
                    ) : isBufferZero ? (
                      <span className="text-xs text-rose-300 flex items-center gap-1.5 bg-rose-950/30 px-3 py-1.5 rounded-xl border border-rose-800/40">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Must Attend All
                      </span>
                    ) : isCaution ? (
                      <span className="text-xs text-amber-300 flex items-center gap-1.5 bg-amber-950/30 px-3 py-1.5 rounded-xl border border-amber-800/40">
                        Low Buffer
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-300 flex items-center gap-1.5 bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-800/40">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Safe Margin
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="text-xs text-neutral-400 flex justify-between pt-2 border-t border-neutral-800/60 font-mono">
                  <span>
                    Need to Attend: <strong className="text-neutral-200">{summary.requiredAttendances}</strong>
                  </span>
                  <span>
                    Max Skips: <strong className="text-neutral-200">{summary.maxAllowedSkips}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Controls Bar: Spacious Filters & Interactive Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 sm:p-6 rounded-3xl bg-[#161720] border border-neutral-800 shadow-md">
        {/* Course Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs sm:text-sm text-neutral-400 mr-1 flex items-center gap-2 shrink-0 font-medium">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Course:</span>
          </span>

          <button
            onClick={() => setSelectedCourseFilter('ALL')}
            className={`px-4 py-2 text-xs sm:text-sm rounded-xl font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCourseFilter === 'ALL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850 border border-transparent'
            }`}
          >
            All Courses
          </button>

          {uniqueCourses.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCourseFilter(c)}
              className={`px-4 py-2 text-xs sm:text-sm font-mono rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCourseFilter === c
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850 border border-transparent'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Interactive State Legend */}
        <div className="flex items-center gap-3.5 sm:gap-5 text-xs sm:text-sm text-neutral-400 shrink-0 font-medium">
          <span className="text-neutral-500 font-mono text-xs">Tap Box:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-md bg-neutral-750 border border-neutral-600 inline-block shadow-inner" />
            <span>Blank</span>
          </span>
          <span className="text-neutral-600">➔</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-4 h-4 rounded-md bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold text-[10px] shadow-sm">✓</span>
            <span>Attended</span>
          </span>
          <span className="text-neutral-600">➔</span>
          <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <span className="w-4 h-4 rounded-md bg-rose-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">✕</span>
            <span>Skipped</span>
          </span>
        </div>
      </div>

      {/* 3. The 14-Week Attendance Matrix */}
      <div className="space-y-8">
        
        {/* Section A: Active / Incomplete Weeks (Right at the top so no scrolling needed!) */}
        {displayWeekGroups.active.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-bold text-neutral-100">
                  Current & Upcoming Weeks
                </h3>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {displayWeekGroups.active.length} active week{displayWeekGroups.active.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-6">
              {displayWeekGroups.active.map((weekNum) => renderWeekCard(weekNum, false))}
            </div>
          </div>
        )}

        {/* Section B: Completed Weeks (Automatically moved to the bottom below week 14) */}
        {displayWeekGroups.completed.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-neutral-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Archive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-emerald-300">
                    Completed Weeks (Archived to Bottom)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    All classes in these weeks have been logged. Moved below week 14 to prevent misclicks.
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/50 shrink-0">
                {displayWeekGroups.completed.length} week{displayWeekGroups.completed.length > 1 ? 's' : ''} completed ✓
              </span>
            </div>

            <div className="space-y-6">
              {displayWeekGroups.completed.map((weekNum) => renderWeekCard(weekNum, true))}
            </div>
          </div>
        )}

        {/* If all weeks are completed banner */}
        {displayWeekGroups.active.length === 0 && displayWeekGroups.completed.length > 0 && (
          <div className="p-8 text-center rounded-3xl bg-emerald-950/20 border border-emerald-800/50 space-y-2">
            <div className="text-3xl">🎉</div>
            <h4 className="text-lg font-bold text-emerald-300">
              Incredible! All 14 Weeks Completed & Logged
            </h4>
            <p className="text-sm text-neutral-400 max-w-md mx-auto">
              Every single lecture and lab for the semester has been marked. Check your Bar Forecaster tab for exam projections!
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
