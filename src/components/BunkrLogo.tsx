import React from 'react';

interface BunkrLogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  className?: string;
  glow?: boolean;
}

/**
 * Bunkr Custom Brand Logo & Wordmark
 * - Logo Emblem: Custom vortex crescent & radiant compass star (matching 1.jpg)
 * - Brand Name: (BUNKR) heavy brutalist wordmark with parentheses (matching 4.jpg)
 * - Color adjusted to the signature website/app radiant orange (#E85A14) on dark theme.
 */
export const BunkrLogo: React.FC<BunkrLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showSubtitle = false,
  subtitleText = '',
  className = '',
  glow = true,
}) => {
  // Proportional icon dimensions
  const iconSizes = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-20 h-20 sm:w-26 sm:h-26',
    xl: 'w-28 h-28 sm:w-34 sm:h-34',
  };

  // Proportional wordmark heights
  const wordmarkSizes = {
    xs: 'h-4 w-auto',
    sm: 'h-5 w-auto',
    md: 'h-6 sm:h-7 w-auto',
    lg: 'h-10 sm:h-12 w-auto',
    xl: 'h-14 sm:h-16 w-auto',
  };

  /**
   * Emblem SVG matching 1.jpg:
   * Symmetrical vortex swirling crescents + orbit ring + crosshairs + 8-point compass star
   */
  const EmblemSVG = ({ svgClass }: { svgClass?: string }) => (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${svgClass || iconSizes[size]} shrink-0 transition-transform ${
        glow ? 'drop-shadow-[0_0_14px_rgba(232,90,20,0.5)]' : ''
      }`}
      aria-label="Bunkr Custom Logo"
    >
      {/* Crescent Swirl 1 (Counter-clockwise upper vortex sweep) */}
      <path
        d="M 95 38 
           C 107 55, 107 75, 95 92 
           C 80 110, 52 114, 30 100 
           C 12 88, 6 64, 14 42 
           C 22 22, 44 8, 68 8 
           C 86 8, 102 18, 110 32 
           C 112 36, 108 40, 102 38 
           C 94 36, 88 28, 76 24 
           C 58 18, 38 28, 30 44 
           C 22 60, 28 80, 42 90 
           C 58 100, 78 98, 90 86 
           C 100 74, 102 58, 96 44 
           C 94 38, 98 34, 102 36 Z"
        fill="#E85A14"
      />

      {/* Crescent Swirl 2 (Symmetrical lower counter-sweep matching 1.jpg) */}
      <g transform="rotate(180 60 60)">
        <path
          d="M 95 38 
             C 107 55, 107 75, 95 92 
             C 80 110, 52 114, 30 100 
             C 12 88, 6 64, 14 42 
             C 22 22, 44 8, 68 8 
             C 86 8, 102 18, 110 32 
             C 112 36, 108 40, 102 38 
             C 94 36, 88 28, 76 24 
             C 58 18, 38 28, 30 44 
             C 22 60, 28 80, 42 90 
             C 58 100, 78 98, 90 86 
             C 100 74, 102 58, 96 44 
             C 94 38, 98 34, 102 36 Z"
          fill="#E85A14"
          opacity="0.95"
        />
      </g>

      {/* Orbit Ring */}
      <circle
        cx="60"
        cy="60"
        r="23"
        stroke="#E85A14"
        strokeWidth="2.2"
        strokeOpacity="0.85"
      />

      {/* Crosshairs passing through center */}
      <line
        x1="60"
        y1="25"
        x2="60"
        y2="95"
        stroke="#E85A14"
        strokeWidth="1.8"
        strokeOpacity="0.85"
      />
      <line
        x1="25"
        y1="60"
        x2="95"
        y2="60"
        stroke="#E85A14"
        strokeWidth="1.8"
        strokeOpacity="0.85"
      />

      {/* 8-Point Compass Star in Center (matching 1.jpg) */}
      {/* 4 Primary Cardinal Rays */}
      <polygon
        points="60,26 64.5,55 94,60 64.5,65 60,94 55.5,65 26,60 55.5,55"
        fill="#E85A14"
      />

      {/* 4 Diagonal Diamond Rays */}
      <polygon
        points="60,42 65,55 78,60 65,65 60,78 55,65 42,60 55,55"
        fill="#FF7A30"
        opacity="0.95"
      />

      {/* Center Core Dot */}
      <circle
        cx="60"
        cy="60"
        r="3.2"
        fill="#FFA468"
      />
    </svg>
  );

  /**
   * Vector Wordmark matching 4.jpg:
   * (BUNKR) heavy brutalist condensed typography with parentheses
   */
  const WordmarkSVG = ({ svgClass }: { svgClass?: string }) => (
    <svg
      viewBox="0 0 258 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${svgClass || wordmarkSizes[size]} shrink-0 ${
        glow ? 'drop-shadow-[0_0_12px_rgba(232,90,20,0.45)]' : ''
      }`}
      aria-label="(BUNKR)"
    >
      {/* Left Parenthesis '(' */}
      <path
        d="M 15 5 C 6 15 2 22 2 28 C 2 34 6 41 15 51 C 10.5 51 3.5 40 1 34 C -0.5 30.5 -0.5 25.5 1 22 C 3.5 16 10.5 5 15 5 Z"
        fill="#E85A14"
      />

      {/* 'B' */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 23 6 H 49 C 58 6 62 10 62 17 C 62 22 59 25 53 26.5 C 60 28 63 32 63 38 C 63 46 58 50 49 50 H 23 V 6 Z M 34 15 V 23 H 47 C 50.5 23 52 21.5 52 19 C 52 16.5 50.5 15 47 15 H 34 Z M 34 32 V 41 H 48 C 51.5 41 53 39.5 53 36.5 C 53 33.5 51.5 32 48 32 H 34 Z"
        fill="#E85A14"
      />

      {/* 'U' */}
      <path
        d="M 70 6 H 81 V 36 C 81 39.5 83 41 87 41 C 91 41 93 39.5 93 36 V 6 H 104 V 36 C 104 45.5 98 50.5 87 50.5 C 76 50.5 70 45.5 70 36 V 6 Z"
        fill="#E85A14"
      />

      {/* 'N' */}
      <path
        d="M 111 6 H 122 L 138 34 V 6 H 149 V 50 H 138 L 122 22 V 50 H 111 V 6 Z"
        fill="#E85A14"
      />

      {/* 'K' */}
      <path
        d="M 156 6 H 167 V 26 L 186 6 H 199 L 175 29.5 L 200 50 H 186.5 L 167 33 V 50 H 156 V 6 Z"
        fill="#E85A14"
      />

      {/* 'R' */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 206 6 H 230 C 238 6 242 10.5 242 18 C 242 24.5 238 28.5 231 29.5 L 244 50 H 231.5 L 219.5 31 H 217 V 50 H 206 V 6 Z M 217 15 V 23 H 228 C 231 23 232.5 21.5 232.5 19 C 232.5 16.5 231 15 228 15 H 217 Z"
        fill="#E85A14"
      />

      {/* Right Parenthesis ')' */}
      <path
        d="M 243 5 C 252 15 256 22 256 28 C 256 34 252 41 243 51 C 247.5 51 254.5 40 257 34 C 258.5 30.5 258.5 25.5 257 22 C 254.5 16 247.5 5 243 5 Z"
        fill="#E85A14"
      />
    </svg>
  );

  // Variant 1: Icon only (Emblem 1.jpg)
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <EmblemSVG />
      </div>
    );
  }

  // Variant 2: Vertical / Stacked (Emblem on top, (BUNKR) underneath)
  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none gap-2 ${className}`}>
        <div className="flex items-center justify-center">
          <EmblemSVG svgClass={size === 'xl' ? 'w-32 h-32 sm:w-36 sm:h-36' : size === 'lg' ? 'w-24 h-24 sm:w-30 sm:h-30' : 'w-18 h-18 sm:w-20 sm:h-20'} />
        </div>

        <div className="flex items-center justify-center">
          <WordmarkSVG svgClass={size === 'xl' ? 'h-14 sm:h-16' : size === 'lg' ? 'h-10 sm:h-12' : 'h-7 sm:h-8'} />
        </div>

        {showSubtitle && subtitleText && (
          <span className="text-[11px] tracking-widest uppercase font-mono text-neutral-400 font-medium">
            {subtitleText}
          </span>
        )}
      </div>
    );
  }

  // Variant 3: Badge
  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#14151A] border border-[#E85A14]/30 shadow-lg ${className}`}
      >
        <EmblemSVG svgClass="w-6 h-6" />
        <WordmarkSVG svgClass="h-4.5" />
      </div>
    );
  }

  // Variant 4 (Default): Horizontal Lockup (Emblem 1.jpg on left + (BUNKR) 4.jpg next to it)
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      <EmblemSVG svgClass={iconSizes[size]} />
      <WordmarkSVG svgClass={wordmarkSizes[size]} />

      {showSubtitle && subtitleText && (
        <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold ml-1 pl-2 border-l border-neutral-800">
          {subtitleText}
        </span>
      )}
    </div>
  );
};
