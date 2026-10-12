# EmberStudies — Cozy Dark University Academic & Attendance Companion

EmberStudies is a web-based university academic tracking dashboard designed with a relaxing, warm "bonfire dark mode" aesthetic. It empowers university students and administrators to manage class schedules across a 14-week semester, track day-to-day course attendance with a 3-state interactive grid, monitor strict 70% attendance requirements with an automatic "Skip Buffer" calculator, forecast final exam passmarks from quizzes and midterms, and work completely offline via IndexedDB and PWA capabilities.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices have been aligned based on your feedback:

- **Confirmed Offline Storage Engine**: High-performance client-side **IndexedDB** with offline PWA installability, ensuring student attendance, routine changes, and forecaster grades are preserved on device without requiring server dependencies.
- **Confirmed Admin vs. Student Separation**: Secure **Admin PIN modal** in the top navigation bar (default `1234`, customizable by the admin) to configure the semester routine (Saturday through Friday), semester start date, and holiday exceptions, keeping the primary view streamlined for students.
- **Confirmed Bangladesh Holidays**: Pre-populated official **Bangladesh National Holidays** (e.g., Shaheed Day / International Mother Language Day Feb 21, Independence Day Mar 26, Eid-ul-Fitr, Pohela Boishakh Apr 14, May Day, Eid-ul-Adha, National Mourning Day Aug 15, Durga Puja, Victory Day Dec 16) with administrative overrides to add university-specific recesses or study breaks.
- **Grading & Passbar Forecaster**: Implements the university continuous evaluation formula: 3 quizzes (10 marks each) taking the **best 2 of 3** (max 20) + Midterm (max 20) = **40 continuous assessment marks**. Subtracted against 40/100 university passing threshold to calculate the exact target score required out of 50 in the Final Exam.

---

### 1. Overview & Core Concept

- **What It Does**:
  1. **Dynamic Routine Setup (Admin)**: Weekly schedule editor (Saturday to Friday) where courses are defined per day. The system calculates weekly frequencies and projects a 14-week semester schedule starting from a chosen date.
  2. **The Visual Calendar Grid**: 14-week visual calendar showcasing class days, Bangladesh public holidays, off-days, and semester milestones with day-inspection drawers.
  3. **The Attendance Tracker (The Grid)**: Interactive clickable attendance matrix cycling through **Blank (Neutral Slate)** ➔ **Attended (Emerald Green)** ➔ **Skipped (Crimson Red)** ➔ **Blank**.
  4. **The Math (70% Skip Buffer)**: Computes total course sessions ($14 \times \text{weekly classes}$), minimum required attendances ($\lceil 0.70 \times \text{Total} \rceil$), current attendance percentage, and the live **Skip Buffer** (exact count of future classes the student can skip without dropping below 70%).
  5. **The Passbar Forecaster**: Strategic grade simulator calculating best 2 of 3 quizzes + midterm, displaying current points secured out of 40 and target marks needed in the 50-mark final exam to pass or reach higher letter grades.
- **Target Persona**: Bangladeshi and international university students wanting stress-free, accurate tracking of attendance regulations and exam safety margins.
- **Atmosphere & Tone**: Cozy dark mode with glowing campfire embers, deep charcoal surfaces, soft amber indicators, and smooth micro-interactions.

---

### 2. User Experience & Visual Design

#### A. Aesthetic Direction & Palette (Cozy Bonfire Dark Mode)
- **Neutral Canvas (60%)**: Deep obsidian and warm charcoal slate (`#121316` base canvas, `#18191E` elevated cards, `#23252E` active panels).
- **Structural Surfaces (30%)**: Hairline borders (`rgba(245, 158, 11, 0.12)` subtle amber sheen) with warm text hierarchy (`#F3F4F6` primary text, `#9CA3AF` body text, `#6B7280` muted metadata).
- **Accent Embers (10%)**:
  - *Warm Amber & Flame*: `#F59E0B` and `#D97706` for highlights, primary badges, and calendar markers.
  - *Attended State*: Emerald moss `#10B981` with subtle soft glow.
  - *Skipped State*: Crimson ruby `#EF4444` with subtle warm halo.
  - *Blank / Neutral*: Charcoal slate `#374151` with soft hover tint.

#### B. Typography & Visual Hierarchy
- **Display & Headings**: `Plus Jakarta Sans` / modern geometric sans for title clarity.
- **Tabular Figures & Metrics**: `font-mono tabular-nums` for attendance counts, percentages, and exam mark calculations.
- **Zero-Pill Restraint**: Metadata rendered with clean unboxed text and dot separators (`14 Weeks · 42 Sessions Total · 3 Remaining Skips`).

#### C. Core User Flows
1. **Student Daily View**:
   - Arrives at today's date in the visual calendar grid.
   - Courses for today are prominently listed with current status.
   - Student taps course box to cycle: Blank ➔ Attended (Green) ➔ Skipped (Red).
   - "Skip Buffer" cards update in real time with visual safety gauges (Safe, Caution, Critical).
2. **Passbar Forecaster Tab**:
   - Select course ➔ Enter Quiz 1, 2, 3 and Midterm marks.
   - Best 2 quizzes auto-highlighted; subtotal out of 40 instantly displays.
   - Passbar visualizes the exact score needed out of 50 in the Final Exam to pass (40 total) and shows targets for letter grades (A+, A, B, etc.).
3. **Admin Configuration Modal**:
   - Accessed via PIN authentication (`1234`) in the top bar.
   - Intuitive day-by-day course chip manager (Saturday to Friday).
   - Date picker for semester kickoff date; holiday toggle list with Bangladesh public holiday defaults.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side IndexedDB Storage over Server Backend**
  - *Approach*: Leverage native browser IndexedDB wrapped with an async storage helper, alongside local JSON export/import for backups.
  - *Rationale*: Guarantees zero latency, zero server downtime, full privacy, and 100% offline access when on campus or commuting.
- **Decision 2: Skip Buffer Math Formulation**
  - *Total Course Classes*: $T = 14 \times W_{\text{classes}}$ (adjusted for national holidays if class falls on an off-day).
  - *Required Attendance*: $A_{\text{req}} = \lceil 0.70 \times T \rceil$.
  - *Max Allowable Skips*: $S_{\text{max}} = T - A_{\text{req}}$.
  - *Current Skip Buffer*: $\max(0, S_{\text{max}} - S_{\text{taken}})$.
  - *Warning States*: Green if Buffer $\ge 3$, Amber if Buffer is $1$–$2$, Red if Buffer is $0$ (must attend all remaining), Flashing Alert if already below threshold.
- **Decision 3: PWA Compliance with Install Prompt**
  - *Approach*: Web App Manifest, Service Worker caching, and an explicit in-app "Install App" button in the header that hides in standalone mode.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Navigation Bar                              │
│  [EmberStudies Wordmark] ─ [Grid | Attendance | Passbar | Holidays] ─  │
│  [Install App (PWA)] ─ [Admin Mode (PIN)]                              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  Academic Grid View  │  │  Attendance Tracker  │  │  Passbar Forecaster  │
│ 14-Week Calendar     │  │ 3-State Click Cycles │  │ Best 2 of 3 Quizzes  │
│ Class session dots   │  │ Attended/Skipped/Nil │  │ Midterm (20) marks   │
│ Bangladesh holidays  │  │ 70% Rate & Buffer    │  │ Final Exam Need (/50)│
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
    │                               │                               │
    └───────────────────────────────┼───────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                Offline Persistence Layer (IndexedDB Engine)            │
│  - RoutineConfig Store: Days (Sat-Fri), Courses, StartDate, 14 Weeks   │
│  - AttendanceRecords Store: { date, courseId, status: attended|skipped}│
│  - AssessmentMarks Store: { courseId, q1, q2, q3, mid }                │
│  - HolidayExceptions Store: BD Public Holidays + Custom University Off │
└────────────────────────────────────────────────────────────────────────┘
```

#### Data Entities:
```typescript
interface CourseSchedule {
  courseCode: string;
  courseTitle?: string;
  dayOfWeek: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  timeSlot?: string;
}

interface RoutineConfig {
  semesterStartDate: string; // YYYY-MM-DD
  totalWeeks: number; // default 14
  weeklySchedule: Record<DayOfWeek, string[]>; // day -> array of course codes
  adminPin: string;
}

interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  courseCode: string;
  status: 'attended' | 'skipped'; // blank is omitted or 'unmarked'
}

interface CourseAssessment {
  courseCode: string;
  quiz1?: number; // 0-10
  quiz2?: number; // 0-10
  quiz3?: number; // 0-10
  midterm?: number; // 0-20
}
```

---

### 5. Verification Plan

1. **Build & Bundle Verification**: Execute `compile_applet` to ensure zero TypeScript errors or missing modules.
2. **PWA Installability & Service Worker Check**: Validate Web App Manifest metadata and offline service worker caching.
3. **Routine & Grid Generation**: Confirm 14-week generation accurately starts from user-selected date, maps Saturday–Friday correctly, and factors Bangladesh public holidays.
4. **Attendance 3-State Cycling & Skip Buffer Math**: Verify clicking cycles Blank ➔ Attended ➔ Skipped ➔ Blank and calculates $70\%$ requirements and future buffer accurately.
5. **Passbar Calculations**: Test best 2 of 3 quizzes logic (e.g. scores 8, 9, 6 takes 8 + 9 = 17) + midterm (e.g. 15) = 32 out of 40, requiring 8 marks out of 50 to pass (40 total passing line).
