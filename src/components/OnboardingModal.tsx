import React, { useState } from 'react';
import { User, Hash, GraduationCap, Calendar, Sparkles } from 'lucide-react';
import { UserProfile, SemesterCurriculum } from '../types';
import { ALL_SEMESTERS_CURRICULUM, getSemesterKeyFromYearSem } from '../data/curriculum';
import { BunkrLogo } from './BunkrLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onSaveProfile: (profile: UserProfile, selectedCurriculum: SemesterCurriculum) => void;
  initialProfile?: UserProfile | null;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onSaveProfile,
  initialProfile,
  onClose,
  canDismiss = false,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md px-3 py-4 sm:p-6 overscroll-contain">
      {/* Viewport Safe Wrapper: items-start prevents any negative Y clipping on Android phones */}
      <div className="min-h-full flex items-start justify-center pt-2 sm:pt-6 pb-12 sm:pb-16">
        <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-[#16171E] border border-amber-500/30 p-4 sm:p-6 shadow-2xl text-neutral-200 space-y-4 relative [&_input]:select-text [&_textarea]:select-text">
          
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Header with Prominent, Perfectly Aligned Bunkr Logo */}
          <div className="text-center space-y-2 pt-1">
            <BunkrLogo variant="vertical" size="lg" glow={true} className="mx-auto" />
            <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
              Department of Computer Science & Engineering (AUST) · Configure student profile & semester tracker
            </p>
          </div>

          {/* Profile Setup Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
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
                placeholder=""
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 select-text"
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
                placeholder=""
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono select-text"
              />
            </div>

            {/* Academic Year Selector */}
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
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                      year === y
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Year {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Semester Selector */}
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
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      semester === s
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Semester {s} ({year}.{s})
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-400 text-center font-medium">
                {error}
              </p>
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
    </div>
  );
};
