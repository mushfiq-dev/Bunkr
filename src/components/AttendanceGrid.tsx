import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Circle,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Check,
  X,
  Filter,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
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

interface AttendanceGridProps {
  config: RoutineConfig;
  calendarDays: CalendarDayInfo[];
  attendanceRecords: Record<string, AttendanceRecord>;
  onToggleAttendance: (date: string, courseCode: string) => void;
  onSelectDateDetails: (day: CalendarDayInfo) => void;
}

export const AttendanceGrid: React.FC<AttendanceGridProps> = ({
  config,
  calendarDays,
  attendanceRecords,
  onToggleAttendance,
  onSelectDateDetails,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'ALL'>('ALL');

  const uniqueCourses = getUniqueCourses(config.weeklySchedule);
  const todayKey = formatDateToKey(new Date());

  // Find today's calendar info if within range
  const todayInfo = calendarDays.find((d) => d.date === todayKey);

  // Calculate summaries for all courses
  const courseSummaries = uniqueCourses.map((c) =>
    calculateCourseAttendanceSummary(c, config, calendarDays, attendanceRecords)
  );

  // Next attendance state cycling helper
  const getNextStatusLabel = (current: AttendanceStatus): string => {
    switch (current) {
      case 'unmarked': return 'Attended';
      case 'attended': return 'Skipped';
      case 'skipped': return 'Blank';
    }
  };

  // Filter calendar days based on selected week
  const filteredDays = selectedWeekFilter === 'ALL'
    ? calendarDays
    : calendarDays.filter((d) => d.weekNumber === selectedWeekFilter);

  // Group filtered days by week
  const weeksMap = new Map<number, CalendarDayInfo[]>();
  for (const day of filteredDays) {
    if (!weeksMap.has(day.weekNumber)) {
      weeksMap.set(day.weekNumber, []);
    }
    weeksMap.get(day.weekNumber)!.push(day);
  }

  const sortedWeekNumbers = Array.from(weeksMap.keys()).sort((a, b) => a - b);

  return (
    <div className="space-y-6">

      {/* The Math: 70% Skip Buffer KPI Dashboard */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              The Math: 70% Attendance Rate & Skip Buffer
            </h2>
            <p className="text-xs text-neutral-400">
              Live calculation of total classes (14 × weekly routine), required attendances, and maximum allowable future skips.
            </p>
          </div>

          <div className="text-xs text-neutral-400 font-mono hidden sm:block">
            Strict University Minimum: 70%
          </div>
        </div>

        {/* Course KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {courseSummaries.map((summary) => {
            const isBufferZero = summary.skipBuffer === 0;
            const isCaution = summary.skipBuffer > 0 && summary.skipBuffer <= 2;
            const isSafe = summary.skipBuffer > 2;

            return (
              <div
                key={summary.courseCode}
                className={`p-4 rounded-xl border transition-all ${
                  !summary.canStillRecover
                    ? 'bg-rose-950/20 border-rose-800/50'
                    : isBufferZero
                    ? 'bg-rose-950/15 border-rose-900/40'
                    : isCaution
                    ? 'bg-amber-950/15 border-amber-900/40'
                    : 'bg-[#18191E] border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold font-mono text-neutral-100">
                        {summary.courseCode}
                      </span>
                      {summary.credits && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-amber-300 border border-neutral-700">
                          {summary.credits} Cr
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      {summary.weeklyCount} class{summary.weeklyCount > 1 ? 'es' : ''}/wk
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-bold font-mono tabular-nums ${
                        summary.currentRate >= 70
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {summary.currentRate}%
                    </span>
                    <div className="text-[10px] text-neutral-500">Current Rate</div>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="mt-3 space-y-1">
                  <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (summary.attendedCount / (summary.totalPlannedClasses || 1)) * 100
                        )}%`,
                      }}
                      title={`${summary.attendedCount} Attended`}
                    />
                    <div
                      className="bg-rose-500 h-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (summary.skippedCount / (summary.totalPlannedClasses || 1)) * 100
                        )}%`,
                      }}
                      title={`${summary.skippedCount} Skipped`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span className="text-emerald-400">
                      {summary.attendedCount} attended
                    </span>
                    <span className="text-rose-400">
                      {summary.skippedCount} skipped
                    </span>
                    <span className="text-neutral-500">
                      {summary.totalPlannedClasses} total
                    </span>
                  </div>
                </div>

                {/* Skip Buffer Highlight */}
                <div className="mt-3.5 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-neutral-400 uppercase tracking-wide">
                      Skip Buffer
                    </div>
                    <div className="text-sm font-semibold flex items-center gap-1 font-mono">
                      {summary.skipBuffer > 0 ? (
                        <span className={isSafe ? 'text-emerald-400' : 'text-amber-400'}>
                          {summary.skipBuffer} more class{summary.skipBuffer > 1 ? 'es' : ''}
                        </span>
                      ) : (
                        <span className="text-rose-400">0 skips left</span>
                      )}
                    </div>
                  </div>

                  {/* Buffer Status Capsule */}
                  <div>
                    {!summary.canStillRecover ? (
                      <span className="text-[10px] text-rose-400 flex items-center gap-1 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/50">
                        <AlertTriangle className="w-3 h-3" />
                        Below 70%
                      </span>
                    ) : isBufferZero ? (
                      <span className="text-[10px] text-rose-300 flex items-center gap-1 bg-rose-950/30 px-2 py-0.5 rounded border border-rose-800/40">
                        <AlertTriangle className="w-3 h-3" />
                        Must Attend All
                      </span>
                    ) : isCaution ? (
                      <span className="text-[10px] text-amber-300 flex items-center gap-1 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-800/40">
                        Low Buffer
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-300 flex items-center gap-1 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-800/40">
                        <ShieldCheck className="w-3 h-3" />
                        Safe Margin
                      </span>
                    )}
                  </div>
                </div>

                {/* Required attendance footnote */}
                <div className="mt-2 text-[10px] text-neutral-500 flex justify-between">
                  <span>Need to Attend: <strong className="text-neutral-300 font-mono">{summary.requiredAttendances}</strong></span>
                  <span>Max Allowed Skips: <strong className="text-neutral-300 font-mono">{summary.maxAllowedSkips}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The Visual Grid of Clickable Boxes */}
      <div className="space-y-4 pt-2">
        {/* Controls bar: Filters & Legend */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
          
          {/* Course filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-neutral-400 mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Course:
            </span>

            <button
              onClick={() => setSelectedCourseFilter('ALL')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCourseFilter === 'ALL'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              All Courses
            </button>

            {uniqueCourses.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCourseFilter(c)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedCourseFilter === c
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Interactive State Legend */}
          <div className="flex items-center gap-3 text-xs text-neutral-400 shrink-0">
            <span className="text-[11px] text-neutral-500">Tap Box:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-neutral-700/80 border border-neutral-600 inline-block" />
              <span>Blank</span>
            </span>
            <span className="text-neutral-600">➔</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold text-[9px]">✓</span>
              <span>Attended</span>
            </span>
            <span className="text-neutral-600">➔</span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3.5 h-3.5 rounded bg-rose-500 text-white flex items-center justify-center font-bold text-[9px]">✕</span>
              <span>Skipped</span>
            </span>
          </div>
        </div>

        {/* 14-Week Matrix Grid */}
        <div className="space-y-4">
          {sortedWeekNumbers.map((weekNum) => {
            const daysInWeek = weeksMap.get(weekNum) || [];

            return (
              <div
                key={weekNum}
                className="p-4 rounded-xl bg-[#16171D] border border-neutral-800/90 space-y-3"
              >
                {/* Week Header - No fixed dates next to Week X to accommodate prep leave fluctuations */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-amber-400 tracking-wider">
                      WEEK {weekNum}
                    </span>
                  </div>

                  <span className="text-[11px] text-neutral-400 font-mono">
                    {daysInWeek.filter((d) => d.courses.length > 0).length} class days
                  </span>
                </div>

                {/* 7 Days in Week Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {daysInWeek.map((day) => {
                    const displayedCourses = selectedCourseFilter === 'ALL'
                      ? day.courses
                      : day.courses.filter((c) => c === selectedCourseFilter);

                    const isToday = day.isToday;
                    const hasHoliday = !!day.holiday;

                    return (
                      <div
                        key={day.date}
                        className={`p-2.5 rounded-lg border transition-all flex flex-col justify-between min-h-[110px] ${
                          isToday
                            ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                            : hasHoliday
                            ? 'bg-neutral-900/40 border-amber-900/30'
                            : 'bg-neutral-900/80 border-neutral-800'
                        }`}
                      >
                        {/* Day Title without rigid dates */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-neutral-200">
                              {DAY_SHORT_NAMES[day.dayOfWeek]}
                            </span>
                            {isToday ? (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                Today
                              </span>
                            ) : (
                              <span className="text-[10px] text-neutral-500 font-mono capitalize">
                                {DAY_SHORT_NAMES[day.dayOfWeek]}
                              </span>
                            )}
                          </div>

                          {/* Holiday marker */}
                          {hasHoliday && (
                            <div
                              className="text-[10px] text-amber-400/90 truncate mb-1.5"
                              title={day.holiday?.name}
                            >
                              ★ {day.holiday?.name}
                            </div>
                          )}

                          {/* Weekend notice if no courses */}
                          {day.isWeekend && day.courses.length === 0 && !hasHoliday && (
                            <div className="text-[10px] text-neutral-500 italic py-1">
                              Weekend
                            </div>
                          )}
                        </div>

                        {/* Interactive Clickable Course Boxes */}
                        <div className="space-y-1.5 pt-1">
                          {displayedCourses.length === 0 && day.courses.length > 0 && (
                            <div className="text-[10px] text-neutral-500 italic">
                              Filtered out
                            </div>
                          )}

                          {displayedCourses.length === 0 && day.courses.length === 0 && !hasHoliday && !day.isWeekend && (
                            <div className="text-[10px] text-neutral-600">
                              No classes
                            </div>
                          )}

                          {displayedCourses.map((course) => {
                            const recordKey = `${day.date}_${course}`;
                            const status = attendanceRecords[recordKey]?.status || 'unmarked';

                            return (
                              <button
                                key={course}
                                type="button"
                                onClick={() => onToggleAttendance(day.date, course)}
                                className={`w-full py-1 px-1.5 rounded-md flex items-center justify-between text-left font-mono text-[11px] transition-all cursor-pointer ${
                                  status === 'attended'
                                    ? 'bg-emerald-600 text-white font-semibold shadow-xs hover:bg-emerald-500'
                                    : status === 'skipped'
                                    ? 'bg-rose-600 text-white font-semibold shadow-xs hover:bg-rose-500'
                                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700/80 border border-neutral-700/80'
                                }`}
                                title={`${course} on ${day.date} — Currently: ${status}. Click to change to ${getNextStatusLabel(status)}`}
                              >
                                <span className="truncate">{course}</span>
                                
                                <span className="text-[10px] shrink-0 ml-1">
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
          })}
        </div>
      </div>
    </div>
  );
};
