# Bunkr: PWA Modernization, SPA Fallback Routing & Mobile Touch Shield

Comprehensive implementation plan to replace the legacy manual service worker with `vite-plugin-pwa` for automated asset-hash precaching, configure static SPA routing fallbacks for direct URLs across hosting providers, and add touch-movement detection to prevent accidental attendance state changes while scrolling on mobile devices.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed during requirements clarification:
> - **Accidental Mobile Taps Prevention**: Touch-movement detection algorithm. Taps on attendance boxes are cancelled if the user's finger moves more than 8 pixels or if scrolling activity is detected, preserving instant single-tap responsiveness while eliminating accidental toggles during scrolling.
> - **PWA Service Worker Update Behavior**: Auto-update immediately in the background (`registerType: 'autoUpdate'`), ensuring seamless offline cache updates without intrusive reload popups.
> - **Static SPA Fallback Routing**: Multi-platform configuration supporting Vercel (`vercel.json`) and Netlify (`_redirects` / `public/_redirects`), routing all direct route paths back to `index.html`.

- **Confirmed Decision 1**: Touch-movement thresholding over long-press to preserve fast single-tap efficiency without scroll interruption.
- **Confirmed Decision 2**: Modernized workbox precaching via `vite-plugin-pwa` replacing static `sw.js` with full support for Vite's content-hashed production bundles.
- **Confirmed Decision 3**: Multi-platform SPA fallback routing rules preventing 404s on hard refreshes.

---

### 1. Overview & Core Concept

- **What It Does**: Upgrades Bunkr's progressive web app infrastructure to dynamically track Vite asset hashes for bulletproof offline reliability; provides native host rewrites for Vercel and Netlify to allow direct route refreshes; and adds a touch shield to attendance grid cells so students can scroll through 14 weeks on smartphones without accidentally changing attendance records.
- **Target Audience / Persona**: University students tracking complex 14-week class routines, public holiday schedules, and 70% attendance buffers on mobile phones and laptops in both connected and offline environments.
- **Key Value**: Guarantees zero corrupted attendance data from mobile thumb-scrolling, eliminates blank 404 screens on direct links or page reloads, and provides automated, zero-maintenance offline caching across app updates.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  - *Mobile Scrolling Flow*: A student rapidly flicks or drags down through the 14-week routine on Android/iOS. Finger contact with class cells scrolls smoothly without toggling attendance. When the student lifts and deliberately taps a cell without dragging, the box instantly cycles between Blank, Attended (Green Checkmark), and Skipped (Red Cross).
  - *Offline Launch Flow*: A student opens Bunkr in airplane mode or with poor campus connectivity. The service worker serves cached HTML, CSS, JavaScript, icons, and web fonts immediately with zero latency.
  - *Direct URL Refresh Flow*: A student bookmarks or refreshes a sub-path or deep link on Vercel or Netlify; the static host rewrites the request to `index.html`, which immediately bootstraps the client application.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Dark academia with cozy midnight tones, warm amber accents, and crisp gothic typography.
  - *Color Palette & Mood*: Deep obsidian base (`#121316`), elevated card surface (`#16171D` / `#18191E`), warm amber highlights (`#F59E0B`), attendance success emerald (`#10B981`), and skip danger rose (`#F43F5E`).
  - *Typography & Hierarchy*: Bold Gothic UnifrakturMaguntia display wordmark, JetBrains Mono for course codes, dates, and buffer percentages, and Plus Jakarta Sans for UI labels.
  - *Component Styling & Layout*: Clean hairline borders (`border-neutral-800`), rounded containers (`rounded-xl`), and tactile button states with active press feedback.

- **Interactive Feedback & Motion**:
  - Class cells provide subtle active scale reduction (`active:scale-95`) only on valid, stationary taps.
  - Dragged touches provide continuous scroll inertia without registering button activation states.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Touch Movement Delta Detection vs. Long-Press**
  - *Chosen Approach*: Record `clientX` / `clientY` on touch start; compute Euclidean distance during touch move; if delta $> 8\text{px}$ or duration $> 600\text{ms}$ with movement, flag gesture as a scroll and suppress the state toggle.
  - *Why*: Long-press forces students to wait 350-500ms on every attendance check, slowing down bulk entry after class. Touch delta detection maintains instantaneous single-tap speed while completely preventing scroll misfires.
  - *Alternatives Considered*: Long-press (too slow for rapid logging), double-tap (unintuitive for rapid multi-course marking).

- **Decision 2: vite-plugin-pwa vs. Custom Handcrafted Service Worker**
  - *Chosen Approach*: Adopt `vite-plugin-pwa` with `registerType: 'autoUpdate'`, Workbox asset precaching, and virtual register support.
  - *Why*: Vite generates hashed filenames for JavaScript chunks and CSS (`assets/index-[hash].js`). Manual service workers hardcode static asset arrays that break immediately upon new builds. `vite-plugin-pwa` compiles the dynamic manifest at build time and precaches exact production bundles.
  - *Alternatives Considered*: Custom build script to inject hashes into `sw.js` (fragile and prone to drift).

- **Decision 3: Multi-Platform SPA Rewrites**
  - *Chosen Approach*: Deliver both `vercel.json` rewrites and `public/_redirects` rules for Netlify and static hosting engines.
  - *Why*: Guarantees hosting compatibility regardless of where the repository is cloned, deployed, or shared.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Bunkr Web Application                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌─────────────────┐
│ Vite-PWA     │       │ Attendance   │       │ SPA Fallback    │
│ Service      │       │ Touch-Shield │       │ Routing Configs │
│ Worker       │       │ Handler      │       │                 │
└──────┬───────┘       └──────┬───────┘       └────────┬────────┘
       │                      │                        │
       ▼                      ▼                        ▼
┌──────────────┐       ┌──────────────┐       ┌─────────────────┐
│ Workbox      │       │ Touch Delta  │       │ Vercel Rewrites │
│ Precache     │       │ Filter       │       │ & Netlify       │
│ Hashes       │       │ (< 8px = Tap)│       │ _redirects      │
└──────┬───────┘       └──────┬───────┘       └─────────────────┘
       │                      │
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│ Offline      │       │ Attendance   │
│ Cache & IDB  │       │ State Cycle  │
│ Storage      │       │ (Next Status)│
└──────────────┘       └──────────────┘
```

- **Data Model & State**:
  - `TouchTracker`: Records `startX`, `startY`, `startTime`, and `isScrolling` flag per interaction.
  - `AttendanceRecord`: Stores `{ status: 'attended' | 'skipped' | 'unmarked', timestamp: string }` mapped by `${date}_${courseCode}`.
  - `PWA Manifest`: Standardized standalone manifest with icon definitions, name, and theme tokens.

- **Interactive Component & State Mapping**:
  - `AttendanceGrid`: Wraps each course toggle button with touch delta tracking (`onTouchStart`, `onTouchMove`, `onTouchEnd`, `onClick`).
  - `vite.config.ts`: Configured with `VitePWA` specifying manifest metadata, automatic registration, and workbox glob patterns.
  - `vercel.json` & `public/_redirects`: Declares `/* -> /index.html 200` rewrite rules.
  - `tsconfig.json`: Adds `vite-plugin-pwa/client` type reference for clean compilation.
