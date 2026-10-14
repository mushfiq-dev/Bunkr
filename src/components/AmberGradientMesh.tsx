import React, { useEffect } from 'react';
import { motion, useTransform, useMotionValue, useSpring, MotionValue } from 'framer-motion';

export interface AmberGradientMeshProps {
  /**
   * Optional external scroll progress (0: top, 1: bottom) passed from App.tsx
   */
  scrollYProgress?: MotionValue<number>;
  /**
   * Optional scrollable container ref (for desktop dual/container scrolling)
   */
  containerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * AmberGradientMesh
 * A persistent, subtle ambient amber gradient mesh background.
 * Accepts scrollYProgress from App.tsx and uses Framer Motion's useTransform
 * to dynamically shift the scale, opacity, position, and hue of the background blobs
 * as the user scrolls deeper into the semester.
 */
export const AmberGradientMesh: React.FC<AmberGradientMeshProps> = ({
  scrollYProgress: externalScrollProgress,
  containerRef,
}) => {
  // Fallback internal progress if no external MotionValue is passed
  const internalProgress = useMotionValue(0);

  useEffect(() => {
    if (externalScrollProgress) return;

    const updateProgress = () => {
      const container = containerRef?.current;
      if (container && container.scrollHeight > container.clientHeight) {
        const maxScroll = container.scrollHeight - container.clientHeight;
        const progress = Math.min(1, Math.max(0, container.scrollTop / maxScroll));
        internalProgress.set(progress);
        return;
      }

      const maxWindowScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxWindowScroll > 0) {
        const progress = Math.min(1, Math.max(0, window.scrollY / maxWindowScroll));
        internalProgress.set(progress);
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    const container = containerRef?.current;
    if (container) {
      container.addEventListener('scroll', updateProgress, { passive: true });
    }

    updateProgress();

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      if (container) {
        container.removeEventListener('scroll', updateProgress);
      }
    };
  }, [externalScrollProgress, containerRef, internalProgress]);

  // Use external MotionValue when supplied, otherwise fallback to internal
  const activeProgress = externalScrollProgress || internalProgress;

  // Butter-smooth spring damping for silky, organic transitions
  const smoothProgress = useSpring(activeProgress, {
    stiffness: 45,
    damping: 24,
    mass: 0.8,
  });

  // 1. Primary Warm Amber Blob (Top Center/Left)
  // Dynamically shifts opacity and scale with scroll depth (whisper subtle)
  const orb1Opacity = useTransform(smoothProgress, [0, 0.35, 0.7, 1], [0.06, 0.10, 0.08, 0.04]);
  const orb1Scale = useTransform(smoothProgress, [0, 0.5, 1], [1.0, 1.18, 1.05]);
  const orb1Y = useTransform(smoothProgress, [0, 1], ['-8%', '32%']);
  const orb1X = useTransform(smoothProgress, [0, 1], ['-4%', '16%']);

  // 2. Burnt Orange / Ember Glow Blob (Mid-Right)
  // Deepens gently at mid-scroll
  const orb2Opacity = useTransform(smoothProgress, [0, 0.4, 0.8, 1], [0.04, 0.08, 0.06, 0.03]);
  const orb2Scale = useTransform(smoothProgress, [0, 0.5, 1], [0.95, 1.20, 1.08]);
  const orb2Y = useTransform(smoothProgress, [0, 1], ['12%', '-18%']);
  const orb2X = useTransform(smoothProgress, [0, 1], ['8%', '-12%']);

  // 3. Deep Honey / Golden Ochre Blob (Bottom-Left)
  // Soft ambient presence near bottom
  const orb3Opacity = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.03, 0.06, 0.08, 0.04]);
  const orb3Scale = useTransform(smoothProgress, [0, 0.6, 1], [0.90, 1.12, 1.20]);
  const orb3Y = useTransform(smoothProgress, [0, 1], ['38%', '8%']);
  const orb3X = useTransform(smoothProgress, [0, 1], ['-12%', '6%']);

  // 4. Subtle overall hue rotation across warm ember spectrum (0deg -> 22deg)
  const hueDegrees = useTransform(smoothProgress, [0, 1], ['0deg', '22deg']);
  const filterStyle = useTransform(hueDegrees, (deg) => `hue-rotate(${deg})`);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#0E0F12]"
    >
      {/* Dynamic Animated Gradient Mesh Layer */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{ filter: filterStyle }}
      >
        {/* Blob 1: Warm Amber Radiance */}
        <motion.div
          className="absolute -top-[12%] left-[18%] w-[580px] h-[580px] sm:w-[850px] sm:h-[850px] rounded-full"
          style={{
            x: orb1X,
            y: orb1Y,
            scale: orb1Scale,
            opacity: orb1Opacity,
            background:
              'radial-gradient(circle, rgba(245,158,11,0.6) 0%, rgba(232,90,20,0.35) 42%, rgba(180,83,9,0) 72%)',
            filter: 'blur(100px)',
          }}
        />

        {/* Blob 2: Burnt Orange / Ember Glow */}
        <motion.div
          className="absolute top-[28%] -right-[8%] w-[520px] h-[520px] sm:w-[780px] sm:h-[780px] rounded-full"
          style={{
            x: orb2X,
            y: orb2Y,
            scale: orb2Scale,
            opacity: orb2Opacity,
            background:
              'radial-gradient(circle, rgba(232,90,20,0.55) 0%, rgba(217,119,6,0.3) 45%, rgba(120,53,15,0) 74%)',
            filter: 'blur(110px)',
          }}
        />

        {/* Blob 3: Deep Honey / Golden Ochre */}
        <motion.div
          className="absolute bottom-[8%] -left-[10%] w-[480px] h-[480px] sm:w-[720px] sm:h-[720px] rounded-full"
          style={{
            x: orb3X,
            y: orb3Y,
            scale: orb3Scale,
            opacity: orb3Opacity,
            background:
              'radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(245,158,11,0.25) 48%, rgba(0,0,0,0) 76%)',
            filter: 'blur(115px)',
          }}
        />
      </motion.div>

      {/* Atmospheric depth vignette to preserve high card contrast & zero eye strain */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_30%,_#0E0F12_95%)] opacity-85" />
    </div>
  );
};
