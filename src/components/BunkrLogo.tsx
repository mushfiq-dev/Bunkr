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
 * Bunkr Streetwear Brand Logo Component
 * Recreates the custom orange vortex emblem with central radiant compass star
 * and stylized gothic blackletter typography on transparent/app-matched dark background.
 */
export const BunkrLogo: React.FC<BunkrLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showSubtitle = false,
  subtitleText = 'Academic Engine',
  className = '',
  glow = true,
}) => {
  // Sizing maps
  const iconSizes = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-5xl',
  };

  // Dedicated SVG for the vortex & radiant compass star emblem
  const EmblemSVG = ({ svgClass }: { svgClass?: string }) => (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${svgClass || iconSizes[size]} shrink-0 transition-transform ${glow ? 'drop-shadow-[0_0_12px_rgba(232,90,20,0.35)]' : ''}`}
      aria-label="Bunkr Vortex Star Emblem"
    >
      {/* Outer Vortex / Spiral Crescent Arm */}
      {/* Sweeps counter-clockwise with a dynamic tapered hook */}
      <path
        d="M 126 54 
           C 134 76, 126 102, 106 118 
           C 86 134, 58 134, 38 120 
           C 18 106, 12 80, 20 58 
           C 28 36, 48 22, 72 20 
           C 92 18, 114 26, 122 42 
           C 126 50, 122 56, 114 54 
           C 106 52, 98 42, 86 38 
           C 68 32, 48 40, 40 56 
           C 32 72, 38 92, 52 102 
           C 66 112, 86 112, 100 100 
           C 112 90, 116 74, 112 60 
           C 110 52, 116 46, 122 48 
           C 126 50, 126 52, 126 54 Z"
        fill="#E85A14"
      />

      {/* Secondary Dynamic Swoosh Curve (Upper Taper) */}
      <path
        d="M 62 20 
           C 90 18, 120 30, 128 58 
           C 132 72, 128 86, 120 98 
           C 118 96, 120 86, 118 76 
           C 116 60, 106 44, 92 34 
           C 80 26, 68 22, 54 22 
           C 48 22, 56 20, 62 20 Z"
        fill="#E85A14"
      />

      {/* Central Thin Concentric Orbit Ring */}
      <circle
        cx="72"
        cy="72"
        r="28"
        stroke="#E85A14"
        strokeWidth="2"
        strokeOpacity="0.85"
      />

      {/* Fine Crosshairs (Passing through the star) */}
      <line
        x1="72"
        y1="34"
        x2="72"
        y2="110"
        stroke="#E85A14"
        strokeWidth="1.6"
        strokeOpacity="0.75"
      />
      <line
        x1="34"
        y1="72"
        x2="110"
        y2="72"
        stroke="#E85A14"
        strokeWidth="1.6"
        strokeOpacity="0.75"
      />

      {/* Radiant 4-Point Compass Star with Diagonal Diamond Rays */}
      {/* 1. Main 4 Long Sharp Diamond Points */}
      <polygon
        points="72,36 76,66 108,72 76,78 72,108 68,78 36,72 68,66"
        fill="#E85A14"
      />

      {/* 2. Secondary Diagonal 4 Diamond Points */}
      <polygon
        points="72,52 77,67 92,72 77,77 72,92 67,77 52,72 67,67"
        fill="#E85A14"
        opacity="0.9"
      />

      {/* Tiny 8-Ray Star Core Highlights */}
      <polygon
        points="72,46 74,70 98,72 74,74 72,98 70,74 46,72 70,70"
        fill="#FF7A30"
        opacity="0.6"
      />

      {/* Center Core Dot */}
      <circle
        cx="72"
        cy="72"
        r="3"
        fill="#FFA468"
      />
    </svg>
  );

  // If icon-only variant
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <EmblemSVG />
      </div>
    );
  }

  // If vertical/stacked variant (matches the exact layout of the uploaded logo image!)
  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        {/* Emblem on top */}
        <EmblemSVG svgClass={size === 'xl' ? 'w-28 h-28' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14'} />

        {/* Wordmark below in Gothic typography */}
        <span
          className={`font-gothic text-[#E85A14] font-bold tracking-normal leading-none mt-1 ${
            size === 'xl' ? 'text-5xl' : size === 'lg' ? 'text-4xl' : 'text-2xl'
          } ${glow ? 'drop-shadow-[0_0_15px_rgba(232,90,20,0.4)]' : ''}`}
          style={{ fontFamily: "'UnifrakturMaguntia', cursive, serif" }}
        >
          Bunkr
        </span>

        {showSubtitle && (
          <span className="text-[10px] tracking-widest uppercase font-mono text-neutral-400 mt-2 font-medium">
            {subtitleText}
          </span>
        )}
      </div>
    );
  }

  // If badge variant
  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#14151A] border border-[#E85A14]/30 shadow-lg ${className}`}
      >
        <EmblemSVG svgClass="w-5 h-5" />
        <span
          className="font-gothic text-[#E85A14] font-bold text-lg tracking-normal leading-none"
          style={{ fontFamily: "'UnifrakturMaguntia', cursive, serif" }}
        >
          Bunkr
        </span>
      </div>
    );
  }

  // Default: Horizontal variant (perfect for top navbar and headers)
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <EmblemSVG svgClass={iconSizes[size]} />

      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-2">
          <span
            className={`font-gothic text-[#E85A14] font-bold tracking-normal leading-none ${textSizes[size]} ${
              glow ? 'drop-shadow-[0_0_12px_rgba(232,90,20,0.35)]' : ''
            }`}
            style={{ fontFamily: "'UnifrakturMaguntia', cursive, serif" }}
          >
            Bunkr
          </span>

          {showSubtitle && (
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-normal">
              {subtitleText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
