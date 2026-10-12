import React, { useState } from 'react';
import { Flame, User, Hash, GraduationCap, Calendar, Check, BookOpen, Sparkles, Layers } from 'lucide-react';
import { UserProfile, SemesterCurriculum } from '../types';
import { ALL_SEMESTERS_CURRICULUM, getSemesterKeyFromYearSem } from '../data/curriculum';
import { BunkrLogo } from './BunkrLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onSaveProfile: (profile: UserProfile, selectedCurriculum: SemesterCurriculum) => void;
  initialProfile?: UserProfile | null;
  onClose?: () => void;
  canDismiss?: boolean;
  onOpenGlider?: () => void;
  onOpenCurriculum?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onSaveProfile,
  initialProfile,
  onClose,
  canDismiss = false,
  onOpenGlider,
  onOpenCurriculum,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [roll, setRoll] = useState(initialProfile?.roll || '');
  const [year, setYear] = useState<number>(initialProfile?.year || 1);
  const [semester, setSemester] = useState<number>(initialProfile?.semester || 1);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentKey = getSemesterKeyFromYearSem(year, semester);
  const selectedCurriculum = ALL_SEMESTERS_CURRICULUM.find(s => s.key === currentKey) || ALL_SEMESTERS_CURRICULUM[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roll.trim()) {
      setError('Please enter your roll / student ID');
      return;
    }

    const profile: UserProfile = {
      name: name.trim(),
      roll: roll.trim(),
      year,
      semester,
      semesterKey: currentKey,
      department: 'Computer Science and Engineering (CSE)',
      institution: 'Ahsanullah University of Science and Technology (AUST)',
      isConfigured: true,
      updatedAt: Date.now(),
    };

    onSaveProfile(profile, selectedCurriculum);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-lg my-8 rounded-3xl bg-[#16171E] border border-amber-500/30 p-6 sm:p-8 shadow-2xl text-neutral-200 space-y-6 relative">
        
        {/* Subtle bonfire glow */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Header with Bunkr Logo */}
        <div className="text-center space-y-3">
          <BunkrLogo variant="vertical" size="lg" glow={true} className="mx-auto" />
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Department of Computer Science & Engineering (AUST) · Configure your student profile to load your exact semester courses and personalized CGPA tracker.
          </p>
        </div>

        {/* Profile Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Mushfiq Hasan Efaz"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Roll / Student ID */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-amber-400" />
              Student ID / Roll Number
            </label>
            <input
              type="text"
              required
              value={roll}
              onChange={(e) => {
                setRoll(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. 20200104001 or 19-01-04-001"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Academic Year Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              Current Academic Year
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                    year === y
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm font-semibold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Year {y}
                </button>
              ))}
            </div>
          </div>

          {/* Academic Semester Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Current Semester
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSemester(s)}
                  className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                    semester === s
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm font-semibold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Semester {s} ({year}.{s})
                </button>
              ))}
            </div>
          </div>

          {/* Live Course Preview Box */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5 font-mono">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                {selectedCurriculum.name} ({selectedCurriculum.shortLabel})
              </span>
              <span className="text-amber-400 font-mono font-bold">
                {selectedCurriculum.totalCredits} Credits Total
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedCurriculum.courses.map((c) => (
                <span
                  key={c.code}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-900 text-neutral-300 border border-neutral-800"
                >
                  {c.code} <span className="text-[10px] text-neutral-500">({c.credits} Cr)</span>
                </span>
              ))}
            </div>
            <p className="text-[10px] text-neutral-500 pt-1">
              The application will automatically initialize your attendance grid, 70% skip buffer, and bar forecaster for these courses.
            </p>
          </div>

          {error && (
            <p className="text-xs text-rose-400 text-center font-medium">
              {error}
            </p>
          )}

          {/* Quick Academic Navigation from Profile */}
          {canDismiss && (onOpenGlider || onOpenCurriculum) && (
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
              {onOpenGlider && (
                <button
                  type="button"
                  onClick={onOpenGlider}
                  className="flex-1 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-xs font-medium text-neutral-300 hover:text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Semester Glider</span>
                </button>
              )}
              {onOpenCurriculum && (
                <button
                  type="button"
                  onClick={onOpenCurriculum}
                  className="flex-1 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-xs font-medium text-neutral-300 hover:text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Curriculum</span>
                </button>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            {canDismiss && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
              >
                Close
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
