import React from 'react';
import {
  Calendar,
  CheckSquare,
  Sparkles,
  Menu,
} from 'lucide-react';
import { UserProfile, ActiveTabType } from '../types';
import { BunkrLogo } from './BunkrLogo';

interface NavbarProps {
  activeTab: ActiveTabType;
  onSelectTab: (tab: ActiveTabType) => void;
  onOpenAdmin?: () => void;
  onExportData?: () => void;
  isAdminUnlocked?: boolean;
  onToggleSidebar?: () => void;
  userProfile?: UserProfile | null;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onToggleSidebar,
}) => {
  const tabs: {
    id: ActiveTabType;
    label: string;
    mobileLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'attendance', label: 'Attendance', mobileLabel: 'Attendance', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', mobileLabel: 'Calendar', icon: Calendar },
    { id: 'forecaster', label: 'Bar Forecaster', mobileLabel: 'Forecaster', icon: Sparkles },
  ];

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <header className="sticky top-0 z-40 bg-[#121316]/95 backdrop-blur-md border-b border-amber-950/30">
      <div className="max-w-[1600px] w-[96%] mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-5">
        
        {/* Top Row: Centered Logo and Brand Name (Protected spacing so hamburger never overlaps) */}
        <div className="relative flex items-center justify-center min-h-[44px] sm:min-h-[52px]">
          {/* Universal Sidebar Hamburger Toggle (Anchored on the left) */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="absolute left-0 p-2 sm:p-2.5 rounded-2xl text-neutral-400 hover:text-amber-300 hover:bg-neutral-800/60 transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              title="Toggle Menu / Sidebar"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </button>
          )}

          {/* Centered Website Branding: Logo and Name */}
          <div className="flex items-center justify-center px-11 sm:px-0">
            <button
              onClick={() => onSelectTab('attendance')}
              className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-2xl p-1 transition-transform active:scale-95 cursor-pointer"
              aria-label="Bunkr Home"
              title="Bunkr"
            >
              <BunkrLogo
                variant="horizontal"
                size="lg"
                glow={true}
                showSubtitle={false}
                className="transition-transform group-hover:scale-[1.02]"
              />
            </button>
          </div>
        </div>

        {/* Bottom Row: Spacious, Smooth Slider for Attendance, Calendar, Bar Forecaster */}
        <div className="mt-3.5 sm:mt-5 flex justify-center">
          <div className="relative w-full max-w-lg sm:max-w-xl bg-[#181920] border border-neutral-800 p-1.5 rounded-2xl shadow-lg">
            {/* Smooth Sliding Pill Indicator */}
            <div
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-500/20 border border-amber-500/40 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
              style={{
                width: `calc((100% - 12px) / 3)`,
                left: 6,
                transform: activeIndex !== -1 ? `translateX(${activeIndex * 100}%)` : undefined,
                opacity: activeIndex !== -1 ? 1 : 0,
              }}
            />

            {/* Interactive Tab Buttons */}
            <div className="relative grid grid-cols-3 z-10">
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeIndex === idx;

                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectTab(tab.id)}
                    className={`relative py-2 sm:py-2.5 px-1 sm:px-3 text-[11px] sm:text-xs md:text-sm font-semibold tracking-tight sm:tracking-normal rounded-xl flex items-center justify-center gap-1 sm:gap-2 transition-colors duration-200 select-none ${
                      isActive
                        ? 'text-amber-300'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${
                        isActive ? 'text-amber-400' : 'text-neutral-400'
                      }`}
                    />
                    <span className="whitespace-nowrap">
                      <span className="sm:hidden">{tab.mobileLabel}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
