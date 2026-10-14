import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  User,
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  ChevronRight,
  Shield,
  Download,
  Edit3,
  Layers,
  X,
} from 'lucide-react';
import { UserProfile, CourseAssessment, ActiveTabType } from '../types';
import { ALL_SEMESTERS_CURRICULUM } from '../data/curriculum';

interface SidebarProps {
  profile: UserProfile | null;
  activeTab: ActiveTabType;
  onSelectTab: (tab: ActiveTabType) => void;
  onOpenEditProfile: () => void;
  onOpenAdmin: () => void;
  onOpenExport: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  cumulativeCGPA?: number;
  assessments: Record<string, CourseAssessment>;
  historicalGPAs: Record<string, number | null>;
  onSelectCourseForForecaster: (courseCode: string) => void;
  currentSemesterKey: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  profile,
  activeTab,
  onSelectTab,
  onOpenEditProfile,
  onOpenAdmin,
  onOpenExport,
  isOpenMobile,
  onCloseMobile,
  cumulativeCGPA,
  assessments,
  historicalGPAs,
  onSelectCourseForForecaster,
  currentSemesterKey,
}) => {
  const currentSemester = ALL_SEMESTERS_CURRICULUM.find(
    (s) => s.key === (profile?.semesterKey || currentSemesterKey)
  ) || ALL_SEMESTERS_CURRICULUM[0];

  // Calculate completed degree credits
  const currentSemIndex = ALL_SEMESTERS_CURRICULUM.findIndex(
    (s) => s.key === (profile?.semesterKey || currentSemesterKey)
  );
  const completedCreditsSoFar = ALL_SEMESTERS_CURRICULUM.slice(0, Math.max(0, currentSemIndex)).reduce(
    (acc, s) => acc + s.totalCredits,
    0
  );
  const totalDegreeCredits = 156.0; // Standard AUST CSE total

  const content = (
    <div className="flex flex-col h-full bg-[#14151A] border-r border-neutral-800/80 text-neutral-200">
      
      {/* 1. Profile Section */}
      <div className="p-4 sm:p-5 border-b border-neutral-800 space-y-3 bg-gradient-to-b from-[#181920] to-[#14151A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/25 via-orange-600/20 to-red-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-neutral-100 truncate">
                {profile?.name || 'Student Profile'}
              </h3>
              <p className="text-[11px] font-mono text-amber-400/90 truncate">
                ID: {profile?.roll || 'Not Configured'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                onOpenEditProfile();
                onCloseMobile();
              }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition-colors"
              title="Edit student profile and year/semester"
              aria-label="Edit Profile"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Close navigation menu"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Academic Status Card */}
        <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2 text-xs shadow-sm">
          <div className="flex items-center justify-between font-mono">
            <span className="text-neutral-400 text-[11px]">Academic Term</span>
            <span className="font-bold text-amber-300">
              Year {profile?.year || 1}, Sem {profile?.semester || 1} ({currentSemester.shortLabel})
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-neutral-500">Department</span>
            <span className="text-neutral-300 truncate max-w-[150px]">CSE (AUST)</span>
          </div>
          {cumulativeCGPA !== undefined && cumulativeCGPA > 0 && (
            <div className="flex items-center justify-between pt-1.5 border-t border-neutral-800/80 text-[11px] font-mono">
              <span className="text-neutral-400">Cumulative CGPA</span>
              <span className="font-bold text-emerald-400">{cumulativeCGPA.toFixed(2)} / 4.00</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Area Sections: Curriculum, Marks Glider, Holidays */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        
        {/* 2. Curriculum (Renamed to only "Curriculum") */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
              Curriculum
            </span>
            <span className="text-[10px] font-mono text-amber-400/80">
              AUST Bulletin
            </span>
          </div>

          <button
            onClick={() => {
              onSelectTab('curriculum');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'curriculum'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-neutral-100 border border-neutral-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <div className="leading-tight font-semibold text-neutral-100">Curriculum</div>
                <div className="text-[10px] text-neutral-400 font-normal">
                  Syllabus outlines, credits & books
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          </button>

          {/* Degree Credits Progress Card */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-neutral-400 text-[10px] uppercase tracking-wider">Degree Progress</span>
              <span className="text-amber-300 font-bold text-[11px]">
                {completedCreditsSoFar.toFixed(2)} / {totalDegreeCredits} Cr
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (completedCreditsSoFar / totalDegreeCredits) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 3. Semester Glider (Section in profile area just like Curriculum) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
              Semester Glider
            </span>
            <span className="text-[10px] font-mono text-amber-400/80">
              Theory & Labs
            </span>
          </div>

          <button
            onClick={() => {
              onSelectTab('glider');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'glider'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shadow-sm'
                : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-neutral-100 border border-neutral-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <div className="leading-tight font-semibold text-neutral-100">Semester Glider</div>
                <div className="text-[10px] text-neutral-400 font-normal">
                  Theory & custom lab marks archive
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          </button>

        </div>

        {/* 4. Holidays (BD Holidays & Off-Days) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
              Academic Calendar
            </span>
            <span className="text-[10px] font-mono text-neutral-500">
              Bangladesh
            </span>
          </div>

          <button
            onClick={() => {
              onSelectTab('holidays');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'holidays'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-neutral-100 border border-neutral-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <div className="leading-tight font-semibold text-neutral-100">Holidays & Off-Days</div>
                <div className="text-[10px] text-neutral-400 font-normal">
                  Pre-loaded national holidays
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          </button>
        </div>

      </div>

      {/* 5. Bottom Settings & Data Tools */}
      <div className="p-3 border-t border-neutral-800 bg-[#121316] flex items-center justify-between gap-2">
        <button
          onClick={() => {
            onOpenAdmin();
            onCloseMobile();
          }}
          className="flex-1 py-1.5 px-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-medium text-neutral-300 hover:text-white hover:border-amber-500/40 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Admin Setup</span>
        </button>

        <button
          onClick={() => {
            onOpenExport();
            onCloseMobile();
          }}
          className="py-1.5 px-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-medium text-neutral-300 hover:text-amber-300 hover:border-amber-500/40 flex items-center justify-center gap-1.5 transition-colors"
          title="Backup & Export Local Database"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Backup</span>
        </button>
      </div>

    </div>
  );

  return (
    <AnimatePresence>
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="relative w-80 max-w-[85vw] h-full z-10 shadow-2xl flex flex-col bg-[#14151A] overflow-hidden"
          >
            {content}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
