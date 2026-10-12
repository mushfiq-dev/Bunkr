import React, { useState } from 'react';
import {
  Flame,
  Shield,
  Download,
  Calendar,
  CheckSquare,
  Sparkles,
  BookOpen,
  ArrowDownToLine,
  Menu,
  User,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { UserProfile, ActiveTabType } from '../types';
import { BunkrLogo } from './BunkrLogo';

interface NavbarProps {
  activeTab: ActiveTabType;
  onSelectTab: (tab: ActiveTabType) => void;
  onOpenAdmin: () => void;
  onExportData: () => void;
  isAdminUnlocked: boolean;
  onToggleSidebar?: () => void;
  userProfile?: UserProfile | null;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAdmin,
  onExportData,
  isAdminUnlocked,
  onToggleSidebar,
  userProfile,
  onOpenProfile,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#121316]/95 backdrop-blur-md border-b border-amber-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Zone 1: Brand Wordmark & Sidebar Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-xl text-neutral-400 hover:text-amber-300 hover:bg-neutral-850 lg:hidden transition-colors"
                title="Toggle Sidebar"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <BunkrLogo variant="horizontal" size="md" showSubtitle subtitleText="CSE AUST" />
          </div>

          {/* Zone 2: Navigation Links (Desktop) - Strictly Attendance, Calendar, Bar Forecaster */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-[#18191E] border border-neutral-800/80 rounded-xl">
            <button
              onClick={() => onSelectTab('attendance')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'attendance'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Attendance</span>
            </button>

            <button
              onClick={() => onSelectTab('calendar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'calendar'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => onSelectTab('forecaster')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'forecaster'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bar Forecaster</span>
            </button>
          </nav>

          {/* Zone 3: Profile Badge & Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Student Profile Quick Chip */}
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 text-xs font-medium transition-colors"
                title="View & Edit Student Profile"
              >
                <div className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                  <User className="w-3 h-3" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[11px] font-semibold text-neutral-200 truncate max-w-[100px]">
                    {userProfile?.name ? userProfile.name.split(' ')[0] : 'Profile'}
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono">
                    {userProfile ? `Y${userProfile.year}.S${userProfile.semester}` : 'Configure'}
                  </div>
                </div>
              </button>
            )}

            {/* PWA Install Button */}
            {isInstallable && !isInstalled && (
              <button
                onClick={install}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
                title="Install offline app on your device"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}

            {isIOS && !isInstalled && (
              <button
                onClick={() => setShowIOSModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Add to Home</span>
              </button>
            )}

            {/* Export Backup Button */}
            <button
              onClick={onExportData}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
              title="Backup & Export local database"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Admin PIN Toggle */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-medium transition-all ${
                isAdminUnlocked
                  ? 'bg-amber-600 text-white shadow-sm hover:bg-amber-500'
                  : 'bg-[#1F212A] text-neutral-300 hover:text-white border border-neutral-700/80 hover:border-amber-500/50'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{isAdminUnlocked ? 'Admin Routine' : 'Admin'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar - Strictly Attendance, Calendar, Bar Forecaster */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-neutral-800/60 overflow-x-auto gap-2">
          <button
            onClick={() => onSelectTab('attendance')}
            className={`flex-1 py-1 text-xs rounded-lg text-center whitespace-nowrap transition-colors ${
              activeTab === 'attendance' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-neutral-400'
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => onSelectTab('calendar')}
            className={`flex-1 py-1 text-xs rounded-lg text-center whitespace-nowrap transition-colors ${
              activeTab === 'calendar' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-neutral-400'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => onSelectTab('forecaster')}
            className={`flex-1 py-1 text-xs rounded-lg text-center whitespace-nowrap transition-colors ${
              activeTab === 'forecaster' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-neutral-400'
            }`}
          >
            Bar Forecaster
          </button>
        </div>
      </div>

      {/* iOS Install Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#18191E] border border-neutral-800 p-6 shadow-2xl text-neutral-200">
            <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Install Bunkr on iOS
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-neutral-400">
              To install on iPhone / iPad for offline access:
            </p>
            <ol className="mt-2 text-xs text-neutral-300 space-y-2 list-decimal list-inside bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
              <li>Tap the <strong className="text-amber-300">Share</strong> button in Safari toolbar</li>
              <li>Scroll down and tap <strong className="text-amber-300">Add to Home Screen</strong></li>
              <li>Tap <strong className="text-amber-300">Add</strong> in top right</li>
            </ol>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 py-2.5 text-xs font-medium text-neutral-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
