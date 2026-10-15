import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Archive,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  RoutineConfig,
  CalendarDayInfo,
  AttendanceRecord,
  DAY_SHORT_NAMES,
} from '../types';
import {
  getUniqueCourses,
  calculateCourseAttendanceSummary,
  formatDateToKey,
} from '../services/academicMath';

interface AttendanceGridProps {
  config: RoutineConfig;
  calendarDays: CalendarDayInfo[];
  attendanceRecords: Record<string, AttendanceRecord>;
  onToggleAttendance?: (date: string, courseCode: string) => void;
  onSelectDateDetails?: (day: CalendarDayInfo) => void;
}

export const AttendanceGrid: React.FC<AttendanceGridProps> = ({
  config,
  calendarDays,
  attendanceRecords,
}) => {

  const uniqueCourses = getUniqueCourses(config.weeklySchedule);
  const todayKey = formatDateToKey(new Date());

  // Calculate summaries for all courses (The Math: 70% Skip Buffer)
  const courseSummaries = useMemo(() => {
    return uniqueCourses.map((c) =>
      calculateCourseAttendanceSummary(c, config, calendarDays, attendanceRecords)
    );
  }, [uniqueCourses, config, calendarDays, attendanceRecords]);

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

  // Sorted list of week numbers based on auto-reorder rule: incomplete on top, completed at bottom
  const displayWeekGroups = useMemo(() => {
    return {
      active: incompleteWeekNumbers,
      completed: completedWeekNumbers,
    };
  }, [incompleteWeekNumbers, completedWeekNumbers]);

  // Render a single week's matrix row
  const renderWeekCard = (weekNum: number, isCompleted: boolean) => {
    const daysInWeek = allWeeksMap.get(weekNum) || [];
    const { totalClasses, loggedClasses } = getWeekLoggingStatus(weekNum);

    return (
      <div
        key={weekNum}
        className={`p-5 sm:p-7 rounded-3xl border transition-all space-y-5 shadow-xl ${
          isCompleted
            ? 'bg-[#14151B]/90 border-emerald-950/60 hover:border-emerald-900/70'
            : 'bg-[#161720] border-neutral-800 hover:border-neutral-700/80'
        }`}
      >
        {/* Week Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-neutral-800/80">
          <div className="flex items-center gap-3 flex-wrap">
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
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-800/50">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>All Classes Logged</span>
              </span>
            ) : (
              <span className="text-xs sm:text-sm text-neutral-400 font-medium font-mono">
                {loggedClasses} of {totalClasses} classes logged
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {/* Progress Bar for Week */}
            <div className="flex items-center gap-2">
              <div className="w-24 sm:w-32 h-2 sm:h-2.5 rounded-full bg-neutral-800 overflow-hidden">
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
          </div>
        </div>

        {/* 7 Days in Week Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5 sm:gap-4">
          {daysInWeek.map((day) => {
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

                {/* Read-Only Course Status Badges (Schedule and Attendance Display) */}
                <div className="space-y-2 pt-2">
                  {day.courses.length === 0 && !hasHoliday && !day.isWeekend && (
                    <div className="text-xs text-neutral-600 py-1">
                      No classes
                    </div>
                  )}

                  {day.courses.map((course) => {
                    const recordKey = `${day.date}_${course}`;
                    const status = attendanceRecords[recordKey]?.status || 'unmarked';

                    return (
                      <div
                        key={course}
                        className={`w-full py-2.5 px-3 sm:py-3 sm:px-3.5 rounded-xl flex items-center justify-between font-mono text-xs sm:text-sm font-semibold transition-all select-none shadow-sm ${
                          status === 'attended'
                            ? 'bg-emerald-950/70 border border-emerald-500/70 text-emerald-100'
                            : status === 'skipped'
                            ? 'bg-rose-950/70 border border-rose-500/70 text-rose-100'
                            : 'bg-neutral-800/80 border border-neutral-700/80 text-neutral-300'
                        }`}
                        title={`${course} on ${day.date} — Status: ${status}. Modify attendance via Today's Fast-Log or the Calendar tab.`}
                      >
                        <span className="break-words text-wrap leading-tight">{course}</span>
                        
                        <span className="text-xs sm:text-sm font-bold shrink-0 ml-2 flex items-center gap-1.5">
                          {status === 'attended' && <span className="text-emerald-400 font-bold">✓</span>}
                          {status === 'skipped' && <span className="text-rose-400 font-bold">✕</span>}
                          {status === 'unmarked' && <span className="text-neutral-500 text-base leading-none">·</span>}
                        </span>
                      </div>
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

      {/* 2. The 14-Week Attendance Matrix */}
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
