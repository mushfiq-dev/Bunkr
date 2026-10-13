/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  Flame,
  Calendar,
  CheckSquare,
  Sparkles,
  Shield,
  Download,
  Upload,
  RefreshCw,
  BookOpen,
  Info,
  Check,
  X,
  FileText,
  User,
  GraduationCap,
  Award,
  Edit3,
  Clock,
  Layers,
} from 'lucide-react';
import {
  RoutineConfig,
  AttendanceRecord,
  CourseAssessment,
  BangladeshHoliday,
  CalendarDayInfo,
  AttendanceStatus,
  SemesterCurriculum,
  DayOfWeek,
  UserProfile,
  ActiveTabType,
} from './types';
import { storageService, DEFAULT_ROUTINE_CONFIG } from './services/storage';
import {
  generateSemesterCalendar,
  getUniqueCourses,
  calculateCourseAttendanceSummary,
  calculateSemesterGPA,
} from './services/academicMath';
import { ALL_SEMESTERS_CURRICULUM, getPriorSemesters, SEMESTER_ROUTINE_PRESETS } from './data/curriculum';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OnboardingModal } from './components/OnboardingModal';
import { CalendarGridView } from './components/CalendarGridView';
import { AttendanceGrid } from './components/AttendanceGrid';
import { BarForecaster } from './components/BarForecaster';
import { CurriculumView } from './components/CurriculumView';
import { HolidaysManager } from './components/HolidaysManager';
import { DailyAttendanceBanner } from './components/DailyAttendanceBanner';
import { SemesterGlider } from './components/SemesterGlider';
import { AdminModal } from './components/AdminModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BunkrLogo } from './components/BunkrLogo';

export default function App() {
  const [config, setConfig] = useState<RoutineConfig>(DEFAULT_ROUTINE_CONFIG);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [assessments, setAssessments] = useState<Record<string, CourseAssessment>>({});
  const [holidays, setHolidays] = useState<BangladeshHoliday[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => storageService.getUserProfile());
  const [historicalGPAs, setHistoricalGPAs] = useState<Record<string, number | null>>({});
  const [selectedForecasterCourse, setSelectedForecasterCourse] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<ActiveTabType>('attendance');

  // Modals & drawer state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load persistent state from IndexedDB on initial mount
  useEffect(() => {
    async function loadData() {
      try {
        const [loadedConfig, loadedAttendance, loadedAssessments, loadedHolidays] = await Promise.all([
          storageService.getRoutineConfig(),
          storageService.getAllAttendanceRecords(),
          storageService.getAllCourseAssessments(),
          storageService.getHolidays(),
        ]);

        const savedProfile = storageService.getUserProfile();
        const savedGPAs = storageService.getHistoricalGPAs();

        setUserProfile(savedProfile);
        setHistoricalGPAs(savedGPAs);

        // If user profile is not configured, open onboarding modal on start
        if (!savedProfile || !savedProfile.isConfigured) {
          setIsOnboardingOpen(true);
        }

        setConfig(loadedConfig);
        setAttendanceRecords(loadedAttendance);
        setAssessments(loadedAssessments);
        setHolidays(loadedHolidays);
      } catch (err) {
        console.error('Failed to load local DB data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Show transient toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dynamically generated 14-week calendar based on start date and routine
  const calendarDays = useMemo(() => {
    return generateSemesterCalendar(config, holidays);
  }, [config, holidays]);

  // Unique course codes in the active routine
  const uniqueCourses = useMemo(() => {
    return getUniqueCourses(config.weeklySchedule);
  }, [config.weeklySchedule]);

  // Calculate Cumulative CGPA for the profile display
  const activeSemesterKey = userProfile?.semesterKey || config.selectedSemesterKey || 'y2s1';
  const currentSemesterCurriculum = ALL_SEMESTERS_CURRICULUM.find(s => s.key === activeSemesterKey) || ALL_SEMESTERS_CURRICULUM[2];

  const priorSemesters = useMemo(() => {
    return getPriorSemesters(activeSemesterKey);
  }, [activeSemesterKey]);

  const cumulativeCGPA = useMemo(() => {
    let priorTotalCredits = 0;
    let priorWeightedPoints = 0;

    for (const sem of priorSemesters) {
      const gpa = historicalGPAs[sem.key];
      if (gpa !== null && gpa !== undefined && !isNaN(gpa)) {
        priorTotalCredits += sem.totalCredits;
        priorWeightedPoints += sem.totalCredits * gpa;
      }
    }

    const currentGpaSummary = calculateSemesterGPA(uniqueCourses, assessments);
    const combinedPoints = priorWeightedPoints + (currentGpaSummary.projectedGPA * currentGpaSummary.totalCredits);
    const totalCredits = priorTotalCredits + currentGpaSummary.totalCredits;

    return totalCredits > 0 ? Number((combinedPoints / totalCredits).toFixed(2)) : currentGpaSummary.projectedGPA;
  }, [priorSemesters, historicalGPAs, uniqueCourses, assessments]);

  // Cycle attendance state: unmarked ➔ attended ➔ skipped ➔ unmarked
  const handleToggleAttendance = async (date: string, courseCode: string) => {
    const key = `${date}_${courseCode}`;
    const current = attendanceRecords[key]?.status || 'unmarked';
    let nextStatus: AttendanceStatus;

    if (current === 'unmarked') {
      nextStatus = 'attended';
    } else if (current === 'attended') {
      nextStatus = 'skipped';
    } else {
      nextStatus = 'unmarked';
    }

    const newRecord: AttendanceRecord = {
      date,
      courseCode,
      status: nextStatus,
      updatedAt: Date.now(),
    };

    // Optimistic UI update
    setAttendanceRecords((prev) => {
      const nextMap = { ...prev };
      if (nextStatus === 'unmarked') {
        delete nextMap[key];
      } else {
        nextMap[key] = newRecord;
      }
      return nextMap;
    });

    // Save to IndexedDB
    try {
      await storageService.saveAttendanceRecord(newRecord);
    } catch (e) {
      console.error('Failed to save attendance:', e);
    }
  };

  // Save new routine config from Admin
  const handleSaveRoutineConfig = async (newConfig: RoutineConfig) => {
    setConfig(newConfig);
    await storageService.saveRoutineConfig(newConfig);
    showToast('Routine configuration updated successfully!');
  };

  // Apply a semester curriculum directly into the weekly routine
  const handleApplySemesterToRoutine = async (sem: SemesterCurriculum) => {
    const preset = SEMESTER_ROUTINE_PRESETS[sem.key];
    let newSchedule: Record<DayOfWeek, string[]>;

    if (preset) {
      newSchedule = {
        saturday: preset.saturday || [],
        sunday: preset.sunday || [],
        monday: preset.monday || [],
        tuesday: preset.tuesday || [],
        wednesday: preset.wednesday || [],
        thursday: preset.thursday || [],
        friday: preset.friday || [],
      };
    } else {
      const weekdays: DayOfWeek[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'];
      const theory = sem.courses.filter((c) => !c.isSessional);
      const labs = sem.courses.filter((c) => c.isSessional);

      newSchedule = {
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      // Distribute theory courses (2 sessions each per week)
      theory.forEach((c, idx) => {
        const day1 = weekdays[idx % weekdays.length];
        const day2 = weekdays[(idx + 2) % weekdays.length];
        newSchedule[day1].push(c.code);
        newSchedule[day2].push(c.code);
      });

      // Distribute lab courses (1 session each per week)
      labs.forEach((c, idx) => {
        const day = weekdays[(idx + 1) % weekdays.length];
        newSchedule[day].push(c.code);
      });
    }

    const updatedConfig: RoutineConfig = {
      ...config,
      selectedSemesterKey: sem.key,
      semesterName: `${sem.name} (${sem.shortLabel}) — 14 Weeks`,
      weeklySchedule: newSchedule,
    };

    setConfig(updatedConfig);
    await storageService.saveRoutineConfig(updatedConfig);
    showToast(`Loaded ${sem.name} (${sem.totalCredits} Credits) into routine!`);
  };

  // Onboarding profile save
  const handleSaveProfile = async (profile: UserProfile, selectedCurriculum: SemesterCurriculum) => {
    setUserProfile(profile);
    storageService.saveUserProfile(profile);
    setIsOnboardingOpen(false);

    // Apply courses of the selected semester to the active routine
    await handleApplySemesterToRoutine(selectedCurriculum);
    showToast(`Welcome, ${profile.name}! Dashboard loaded for ${selectedCurriculum.name}.`);
  };

  // Save course assessments permanently (Bar Forecaster marks)
  const handleSaveAssessment = async (assessment: CourseAssessment) => {
    const updated = { ...assessment, updatedAt: Date.now() };
    setAssessments((prev) => ({
      ...prev,
      [assessment.courseCode]: updated,
    }));
    await storageService.saveCourseAssessment(updated);
  };

  // Save holidays changes
  const handleUpdateHolidays = async (updatedHolidays: BangladeshHoliday[]) => {
    setHolidays(updatedHolidays);
    await storageService.saveHolidays(updatedHolidays);
    showToast('Holidays list updated.');
  };

  // Export full JSON database backup
  const handleExportBackup = async () => {
    const json = await storageService.exportFullBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bunkr_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded successfully!');
  };

  // Import JSON database backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = await storageService.importFullBackup(content);
        if (ok) {
          const [loadedConfig, loadedAttendance, loadedAssessments, loadedHolidays] = await Promise.all([
            storageService.getRoutineConfig(),
            storageService.getAllAttendanceRecords(),
            storageService.getAllCourseAssessments(),
            storageService.getHolidays(),
          ]);
          const savedProfile = storageService.getUserProfile();
          const savedGPAs = storageService.getHistoricalGPAs();
          setUserProfile(savedProfile);
          setHistoricalGPAs(savedGPAs);
          setConfig(loadedConfig);
          setAttendanceRecords(loadedAttendance);
          setAssessments(loadedAssessments);
          setHolidays(loadedHolidays);
          setIsBackupModalOpen(false);
          showToast('Data imported and restored successfully!');
        } else {
          showToast('Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#121316] text-[#F3F4F6] flex flex-col font-sans selection:bg-amber-600/30 selection:text-amber-200">
      
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onExportData={() => setIsBackupModalOpen(true)}
        isAdminUnlocked={isAdminUnlocked}
        onToggleSidebar={() => setIsMobileSidebarOpen(true)}
        userProfile={userProfile}
        onOpenProfile={() => setIsOnboardingOpen(true)}
      />

      {/* Main Layout: Desktop Sidebar + Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex gap-6">
        
        {/* Left Sidebar with Profile, Curriculum, Semester Glider, BD Holidays */}
        <Sidebar
          profile={userProfile}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenEditProfile={() => setIsOnboardingOpen(true)}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onOpenExport={() => setIsBackupModalOpen(true)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          cumulativeCGPA={cumulativeCGPA}
          assessments={assessments}
          historicalGPAs={historicalGPAs}
          onSelectCourseForForecaster={(courseCode) => {
            setSelectedForecasterCourse(courseCode);
            setActiveTab('forecaster');
          }}
          currentSemesterKey={activeSemesterKey}
        />

        {/* Right Main Dashboard Area */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {/* Daily Attendance Fast-Log Section - Right below top bar as requested */}
          <DailyAttendanceBanner
            config={config}
            calendarDays={calendarDays}
            attendanceRecords={attendanceRecords}
            onToggleAttendance={handleToggleAttendance}
            onOpenAttendanceTab={() => setActiveTab('attendance')}
            onOpenAdmin={() => setIsAdminModalOpen(true)}
          />

          {/* Academic Semester Info Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#181920] via-[#1E1B18] to-[#181920] border border-amber-950/60 p-4 sm:p-5 shadow-xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <BunkrLogo variant="icon" size="sm" />
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-100">
                    {config.semesterName || 'Academic Semester (14 Weeks)'}
                  </h1>
                </div>
                <p className="text-xs text-neutral-400 max-w-xl">
                  {userProfile?.name ? (
                    <span>
                      Enrolled: <strong className="text-neutral-200">{userProfile.name}</strong> ({userProfile.roll}) · Year {userProfile.year}, Sem {userProfile.semester} ({currentSemesterCurriculum.shortLabel}) · 70% Skip Buffer Active
                    </span>
                  ) : (
                    <span>
                      University Academic Companion · 70% attendance buffer math & Bar Forecaster exam simulator.
                    </span>
                  )}
                </p>
              </div>

              {/* Quick Summary Pills */}
              <div className="flex items-center gap-2 shrink-0 text-xs flex-wrap font-mono">
                <div className="px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-300">
                  <span className="text-neutral-500 text-[10px] block">Start Date</span>
                  <span className="font-semibold text-amber-300">{config.semesterStartDate}</span>
                </div>
                {config.classesEndDate && (
                  <div className="px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-300">
                    <span className="text-neutral-500 text-[10px] block">Classes End</span>
                    <span className="font-semibold text-neutral-200">{config.classesEndDate}</span>
                  </div>
                )}
                <div className="px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-300">
                  <span className="text-neutral-500 text-[10px] block">Length</span>
                  <span className="font-semibold text-neutral-200">{config.totalWeeks} Wks</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-300">
                  <span className="text-neutral-500 text-[10px] block">Courses</span>
                  <span className="font-semibold text-amber-400">{uniqueCourses.length} Enrolled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Tab Views */}
          {isLoading ? (
            <div className="p-12 text-center text-neutral-400 text-sm flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
              Loading offline database...
            </div>
          ) : (
            <div>
              {activeTab === 'attendance' && (
                <AttendanceGrid
                  config={config}
                  calendarDays={calendarDays}
                  attendanceRecords={attendanceRecords}
                  onToggleAttendance={handleToggleAttendance}
                  onSelectDateDetails={(day) => {
                    setActiveTab('calendar');
                  }}
                />
              )}

              {activeTab === 'calendar' && (
                <CalendarGridView
                  calendarDays={calendarDays}
                  config={config}
                  attendanceRecords={attendanceRecords}
                  onToggleAttendance={handleToggleAttendance}
                />
              )}

              {activeTab === 'forecaster' && (
                <BarForecaster
                  config={config}
                  profile={userProfile}
                  assessments={assessments}
                  onSaveAssessment={handleSaveAssessment}
                  selectedCourseProp={selectedForecasterCourse}
                />
              )}

              {activeTab === 'curriculum' && (
                <CurriculumView
                  currentSemesterKey={config.selectedSemesterKey || userProfile?.semesterKey || 'y2s1'}
                  onApplySemesterToRoutine={handleApplySemesterToRoutine}
                  isAdminUnlocked={isAdminUnlocked}
                  onOpenAdmin={() => setIsAdminModalOpen(true)}
                />
              )}

              {activeTab === 'holidays' && (
                <HolidaysManager
                  holidays={holidays}
                  onUpdateHolidays={handleUpdateHolidays}
                  isAdminUnlocked={isAdminUnlocked}
                  onOpenAdmin={() => setIsAdminModalOpen(true)}
                />
              )}

              {activeTab === 'glider' && (
                <SemesterGlider
                  currentSemesterKey={activeSemesterKey}
                  profile={userProfile}
                  assessments={assessments}
                  historicalGPAs={historicalGPAs}
                  onSelectCourseForForecaster={(courseCode) => {
                    setSelectedForecasterCourse(courseCode);
                    setActiveTab('forecaster');
                  }}
                  onOpenCurriculum={() => {
                    setActiveTab('curriculum');
                  }}
                  onSaveAssessment={handleSaveAssessment}
                  compact={false}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Footer: Strictly only logo and name next to it, and below it Created by Mushfiq Hasan Efaz */}
      <footer className="mt-auto border-t border-neutral-900 bg-[#0E0F12] py-6 px-4 sm:px-6 lg:px-8 text-neutral-400">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center gap-2.5">
          <BunkrLogo variant="horizontal" size="sm" showSubtitle={false} />
          <p className="text-xs text-neutral-400 font-medium tracking-wide">
            Created by Mushfiq Hasan Efaz
          </p>
        </div>
      </footer>

      {/* Onboarding & Profile Setup Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onSaveProfile={handleSaveProfile}
        initialProfile={userProfile}
        canDismiss={Boolean(userProfile && userProfile.isConfigured)}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Admin Routine Setup Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveRoutineConfig}
        isAdminUnlocked={isAdminUnlocked}
        setIsAdminUnlocked={setIsAdminUnlocked}
      />

      {/* Backup Export / Import Modal */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm px-3 py-4 sm:p-6 overscroll-contain">
          <div className="min-h-full flex items-start sm:items-center justify-center pt-2 sm:pt-6 pb-12 sm:pb-16">
            <div className="w-full max-w-md rounded-2xl bg-[#18191E] border border-neutral-800 p-5 sm:p-6 shadow-2xl text-neutral-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Data Backup & Transfer
                </h3>
                <button
                  onClick={() => setIsBackupModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                All your routine schedules, attendance clicks, quiz marks, and holiday records are saved safely in your browser's IndexedDB. You can export a snapshot to transfer to your phone or restore anytime.
              </p>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleExportBackup}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download JSON Backup File
                </button>

                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    id="backup-import-input"
                    className="hidden"
                  />
                  <label
                    htmlFor="backup-import-input"
                    className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors border border-neutral-700"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    Restore / Import JSON File
                  </label>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-neutral-500 text-center">
                Restoring replaces current local database with the backup file data.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 border border-amber-500/40 text-amber-200 text-xs font-medium shadow-2xl backdrop-blur-md">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Offline Connectivity Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
