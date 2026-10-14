# Ambient Amber Illumination & Precision Logo Light Beam

A refined aesthetic upgrade that envelops the app in a deep, subtle amber gradient reacting smoothly to scroll depth, while framing the Bunkr logo and name with a smooth, ultra-thin glowing amber light beam tracing around its contour.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The design preferences confirmed in Phase 1 have been directly integrated:
> - **Ambient Background Glow**: Deep, cohesive amber gradient that smoothly shifts in luminosity as the user scrolls, creating warmth across empty gutters and wide displays without harsh orb artifacts.
> - **Logo Border Glow**: Replaces the previous spinning conic block with a high-end, smooth, ultra-thin glowing amber light beam that continuously traces the rounded contour of the Bunkr logo and name.

- **Confirmed Decision 1**: Smooth scroll-linked gradient opacity and luminosity transform using Framer Motion's `useScroll` and `useTransform` tied to the scroll container.
- **Confirmed Decision 2**: Precision SVG or border-tracing light beam around the logo badge container with a focused amber glow filter and smooth perpetual loop.

---

## 1. Overview & Core Concept

- **What It Delivers**: Transforms the backdrop from a flat, stark dark slate into an atmospheric studio aesthetic with warm amber undertones that breathe and brighten as the user explores the semester tracker. Elevates the central brand mark (`Bunkr`) with a refined, jewel-like light beam tracing its perimeter.
- **Target Audience / Mood**: AUST CSE students using Bunkr daily for attendance tracking and GPA forecasting—delivering a calm, focused, developer-grade cyber-editorial atmosphere.
- **Key Value**: Eliminates the "bland empty space" on wide laptop and desktop monitors while ensuring zero visual noise or distraction during routine academic logging.

---

## 2. User Experience & Visual Design

### Ambient Background Glow Flow
- **At Rest (Top of Page)**: The background displays a deep, soft amber radial vignette centered behind the header and top cards (`rgba(245, 158, 11, 0.04)` to `rgba(217, 119, 6, 0.02)`), gently illuminating wide screen gutters.
- **During Scroll**: As the user scrolls through the 14-week attendance grid or course cards, the ambient warmth smoothly intensifies to `rgba(245, 158, 11, 0.075)` and shifts spatial center, dynamically responding to scroll speed and direction without lag.
- **Gutter Comfort**: The left and right empty spaces on widescreen viewports feel unified and intentional, eliminating dead black emptiness.

### Precision Logo Light Beam
- **Contour Tracing**: The logo badge container maintains a clean, dark surface (`#121316`) framed by a subtle border (`border-neutral-800`).
- **Circulating Beam**: An ultra-thin, bright amber light ray (`#F59E0B` with `drop-shadow` diffusion) continuously glides around the rounded rectangular perimeter of the logo badge.
- **Interactive State**: On hover, the beam brightens slightly and the logo scales subtly (`scale-[1.01]`), reinforcing its role as the home navigation trigger without jarring visual spikes.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Viewport Mesh Gradient vs. Floating Circle Orbs**
  - *Chosen Approach*: Continuous radial mesh gradient background with CSS `radial-gradient` modulated via Framer Motion transform on scroll.
  - *Why*: Floating colored circles produce visible clipping edges, banding, and jarring contrasts on varying screen aspect ratios. A smooth radial mesh gradient creates an organic glow that naturally envelopes the viewport.
  - *Alternatives Considered*: Multiple blurred divs moving at different speeds (discarded because it creates an uneven, distracting patchwork).

- **Decision 2: SVG Path Light Beam vs. Infinite Conic Gradient Mask**
  - *Chosen Approach*: Precision path / border ray with masked linear gradient or SVG perimeter animation that restricts the light strictly to a razor-thin border track.
  - *Why*: Eliminates the previous bulky spinning fan effect, producing a sleek, bespoke hairline glow that looks intentional and executive.

---

## 4. Technical Architecture & System Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                      App.tsx Root Viewport                      │
├─────────────────────────────────────────────────────────────────┤
│  [Ambient Scroll-Linked Mesh Gradient Layer] (fixed, z-0)       │
│  - useScroll() + useTransform() opacity & radial position       │
│  - Deep amber tones (#F59E0B / #D97706 at 3% - 8% alpha)        │
├─────────────────────────────────────────────────────────────────┤
│  [Navbar Component] (sticky top-0, z-40)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Logo Button Container (relative, rounded-2xl)             │  │
│  │ ┌───────────────────────────────────────────────────────┐ │  │
│  │ │ Smooth Circulating Amber Light Beam Ray (SVG/Path)   │ │  │
│  │ │ BunkrLogo (Emblem + Bunkr Wordmark)                  │ │  │
│  │ └───────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  [Main Layout Container] (relative z-10)                        │
│  - Attendance Grid & 70% Skip Math KPI Cards                    │
│  - Academic Semester Banner & Routine Timetable                 │
│  - Calendar View & Forecaster Views                             │
│  - Footer with Social Contact Links                             │
└─────────────────────────────────────────────────────────────────┘
```

### Planned File Adjustments
1. **`src/App.tsx`**:
   - Reconfigure background layer to use a unified scroll-responsive amber gradient atmosphere that smoothly interpolates opacity and glow radius across the scroll range.
2. **`src/components/Navbar.tsx`**:
   - Replace the previous conic rotation block with a dedicated hairline light-beam container framing the `BunkrLogo`.
3. **`src/index.css`**:
   - Add specialized keyframes/utility for border-beam movement if required, guaranteeing butter-smooth 60fps GPU acceleration.
