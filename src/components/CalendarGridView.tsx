import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Flame,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
  BookOpen,
  X,
  Check,
  Circle,
} from 'lucide-react';
import {
  CalendarDayInfo,
  RoutineConfig,
  AttendanceRecord,
  DAY_SHORT_NAMES,
  DAY_NAMES,
} from '../types';
import { getCourseCredits } from '../data/curriculum';
import { useTouchGuard } from '../hooks/useTouchGuard';

interface CalendarGridViewProps {
  calendarDays: CalendarDayInfo[];
  config: RoutineConfig;
  attendanceRecords: Record<string, AttendanceRecord>;
  onToggleAttendance: (date: string, courseCode: string) => void;
}

export const CalendarGridView: React.FC<CalendarGridViewProps> = ({
  calendarDays,
  config,
  attendanceRecords,
  onToggleAttendance,
}) => {
  const [selectedDay, setSelectedDay] = useState<CalendarDayInfo | null>(null);
  const [activeWeekIndex, setActiveWeekIndex] = useState<number | 'ALL'>('ALL');
  const { touchProps, guardClick } = useTouchGuard();

  // Group days by month or display as full 14-week schedule
  const totalWeeks = config.totalWeeks;
  const holidaysInTerm = calendarDays.filter((d) => d.holiday);

  // Group by week numbers for structured overview
  const weekGroups = new Map<number, CalendarDayInfo[]>();
  for (const day of calendarDays) {
    if (!weekGroups.has(day.weekNumber)) {
      weekGroups.set(day.weekNumber, []);
    }
    weekGroups.get(day.weekNumber)!.push(day);
  }

  const visibleWeeks = activeWeekIndex === 'ALL'
    ? Array.from(weekGroups.keys())
    : [activeWeekIndex];

  return (
    <div className="space-y-6">
      
      {/* Visual Grid Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#161720] border border-neutral-800">
        <div>
          <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-amber-500" />
            14-Week Academic Calendar Grid
          </h2>
          <p className="text-xs text-neutral-400">
            Commencing {config.semesterStartDate} · Highlights daily course sessions & Bangladesh national holidays.
          </p>
        </div>

        {/* Quick Week Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveWeekIndex('ALL')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors shrink-0 ${
              activeWeekIndex === 'ALL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            All 14 Weeks
          </button>

          {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
            <button
              key={w}
              onClick={() => setActiveWeekIndex(w)}
              className={`px-2.5 py-1.5 text-xs font-mono rounded-lg transition-colors shrink-0 ${
                activeWeekIndex === w
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              W{w}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-neutral-400">Semester Span</div>
          <div className="text-base font-bold text-neutral-100 font-mono mt-0.5">
            {totalWeeks} Weeks <span className="text-xs font-normal text-neutral-500">({totalWeeks * 7} Days)</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-neutral-400">Class Days</div>
          <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
            {calendarDays.filter((d) => d.courses.length > 0).length} Days
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-neutral-400">BD Public Holidays</div>
          <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
            {holidaysInTerm.length} Observed
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-neutral-400">Weekly Offs (Fridays)</div>
          <div className="text-base font-bold text-neutral-300 font-mono mt-0.5">
            {totalWeeks} Days
          </div>
        </div>
      </div>

      {/* Week-by-Week Visual Calendar Cards */}
      <div className="space-y-6">
        {visibleWeeks.map((weekNum) => {
          const days = weekGroups.get(weekNum) || [];

          return (
            <div
              key={weekNum}
              className="p-5 sm:p-7 rounded-3xl bg-[#161720] border border-neutral-800/90 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-mono text-amber-400">
                  WEEK {weekNum} of {totalWeeks}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  {days[0]?.date} ➔ {days[days.length - 1]?.date}
                </span>
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5">
                {days.map((day) => {
                  const hasHoliday = !!day.holiday;
                  const isClassDay = day.courses.length > 0;
                  const isWeekend = day.isWeekend;
                  const isSelected = selectedDay?.date === day.date;

                  return (
                    <div
                      key={day.date}
                      {...touchProps}
                      onClick={guardClick(() => setSelectedDay(day))}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between min-h-[120px] ${
                        isSelected
                          ? 'ring-2 ring-amber-500 bg-neutral-900 border-amber-500'
                          : day.isToday
                          ? 'bg-amber-950/20 border-amber-500/60 shadow-sm'
                          : hasHoliday
                          ? 'bg-amber-950/15 border-amber-900/40 hover:border-amber-700/60'
                          : isWeekend
                          ? 'bg-neutral-900/30 border-neutral-800/60 hover:border-neutral-700'
                          : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {/* Day Header */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-neutral-200">
                            {DAY_SHORT_NAMES[day.dayOfWeek]}
                          </span>
                          <span
                            className={`font-mono text-[11px] ${
                              day.isToday ? 'text-amber-400 font-bold' : 'text-neutral-400'
                            }`}
                          >
                            {day.dayNumber} {day.monthName}
                          </span>
                        </div>

                        {/* Holiday Marker */}
                        {hasHoliday && (
                          <div className="text-[10px] text-amber-400 line-clamp-2 mt-0.5 font-medium leading-tight">
                            ★ {day.holiday?.name}
                          </div>
                        )}

                        {/* Weekend note */}
                        {isWeekend && !hasHoliday && (
                          <div className="text-[10px] text-neutral-500 italic mt-0.5">
                            Weekend (Off)
                          </div>
                        )}
                      </div>

                      {/* Course Indicators */}
                      <div className="mt-2 space-y-1">
                        {day.courses.map((course) => {
                          const key = `${day.date}_${course}`;
                          const status = attendanceRecords[key]?.status || 'unmarked';

                          return (
                            <div
                              key={course}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center justify-between ${
                                status === 'attended'
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                                  : status === 'skipped'
                                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
                                  : 'bg-neutral-800 text-neutral-300 border border-neutral-700/60'
                              }`}
                            >
                              <span className="truncate">{course}</span>
                              <span className="text-[9px] shrink-0">
                                {status === 'attended' && '✓'}
                                {status === 'skipped' && '✕'}
                              </span>
                            </div>
                          );
                        })}

                        {day.courses.length === 0 && !hasHoliday && !isWeekend && (
                          <div className="text-[10px] text-neutral-600">
                            No classes
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Date Inspection Drawer / Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm px-3 py-4 sm:p-6 overscroll-contain">
          <div className="min-h-full flex items-start justify-center pt-2 sm:pt-6 pb-12 sm:pb-16">
            <div className="w-full max-w-md rounded-2xl bg-[#18191E] border border-amber-900/50 p-5 sm:p-6 shadow-2xl text-neutral-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
              <div>
                <span className="text-xs font-mono text-amber-400">
                  Week {selectedDay.weekNumber} · {DAY_NAMES[selectedDay.dayOfWeek]}
                </span>
                <h3 className="text-lg font-bold text-neutral-100 font-sans mt-0.5">
                  {selectedDay.date}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Holiday Notice if present */}
            {selectedDay.holiday && (
              <div className="my-3 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs space-y-1">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <span>★ Public Holiday:</span>
                  <span>{selectedDay.holiday.name}</span>
                </div>
                {selectedDay.holiday.nameBangla && (
                  <div className="text-amber-400/80 font-medium">
                    {selectedDay.holiday.nameBangla}
                  </div>
                )}
                {selectedDay.holiday.description && (
                  <div className="text-neutral-400 text-[11px]">
                    {selectedDay.holiday.description}
                  </div>
                )}
              </div>
            )}

            {/* Classes Scheduled on this day */}
            <div className="my-4 space-y-2">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Scheduled Courses ({selectedDay.courses.length})
              </span>

              {selectedDay.courses.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-2">
                  No courses scheduled for {DAY_NAMES[selectedDay.dayOfWeek]}.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDay.courses.map((course) => {
                    const recordKey = `${selectedDay.date}_${course}`;
                    const status = attendanceRecords[recordKey]?.status || 'unmarked';

                    return (
                      <div
                        key={course}
                        className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-neutral-100">
                              {course}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-amber-300 border border-neutral-700">
                              {getCourseCredits(course)} Cr
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            Status: <span className="capitalize font-medium text-amber-300">{status}</span>
                          </div>
                        </div>

                        {/* Direct 3-State Toggle button */}
                        <button
                          {...touchProps}
                          onClick={guardClick(() => onToggleAttendance(selectedDay.date, course))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all select-none touch-manipulation active:scale-[0.98] ${
                            status === 'attended'
                              ? 'bg-emerald-600 text-white'
                              : status === 'skipped'
                              ? 'bg-rose-600 text-white'
                              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                          }`}
                        >
                          {status === 'attended' && <Check className="w-3.5 h-3.5" />}
                          {status === 'skipped' && <X className="w-3.5 h-3.5" />}
                          {status === 'unmarked' && <Circle className="w-3 h-3 text-neutral-500" />}
                          <span>Cycle State</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setSelectedDay(null)}
                className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200"
              >
                Close
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};
