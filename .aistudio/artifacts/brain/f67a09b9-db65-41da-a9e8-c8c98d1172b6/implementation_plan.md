# Mobile & Desktop UI Decongestion & Workflow Streamlining

Streamline the attendance and academic forecasting views by removing redundant badges, eliminating horizontal slider bottlenecks, centralizing attendance logging exclusively to Today's Daily Fast-Log and the Calendar, and giving cards breathing room to resolve interface congestion.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following design decisions were confirmed via interactive clarification:
> - **Cross-Platform Scope**: Layout simplifications and congestion fixes will apply across both mobile and desktop views to maintain consistent ergonomics and visual clarity.
> - **Bar Forecaster Course Layout**: The horizontal slider pills are replaced with a vertical stack of spacious, full-width course cards with high-contrast active states.
> - **Read-Only Weekly Class Cards**: Weekly schedule cards in the Attendance tab will serve purely as clean visual status badges showing schedule and attendance history; attendance changes can only be logged via Today's Daily Fast-Log or the Calendar tab.

---

### 1. Overview & Core Concept

- **The Problem**: User feedback revealed that the mobile experience felt cramped and congested. Having attendance toggle affordances on every weekly box led to accidental taps and visual clutter. In addition, horizontal scrolling sliders in Bar Forecaster and redundant metadata badges (`Sem 2.1`, `Grading Scale`, course credits, `Total Max: 100 Marks`) crowded out essential inputs.
- **The Solution**: 
  1. Make Today's Daily Fast-Log the dedicated focal point for recording today's classes, removing the day switcher pills and the "14-Wk Grid" button.
  2. Transform weekly schedule cards in the Attendance tab into read-only status badges so users can easily see their full semester timeline without accidental logs.
  3. Remove the course filter tabs and tap-box legend strip above the weekly cards.
  4. Redesign course selection in Bar Forecaster into a vertical list of full-width cards with ample spacing.
  5. Clean up redundant badges (`Sem 2.1`, `Grading Scale`, `· X Credits`, and `Total Max: 100 Marks`).

---

### 2. User Experience & Visual Design

#### A. Daily Attendance Fast-Log (`DailyAttendanceBanner.tsx`)
- **Focused on Today**: The top header clearly displays "Today's Attendance Fast-Log" with the formatted device date.
- **Removed Elements**: 
  - The `14-Wk Grid →` link button is removed.
  - The multi-day routine selector (`Sat`, `Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`) is removed; the fast log directly displays today's scheduled classes.
- **Logging Flow**: Users tap class buttons for today directly to cycle `Blank` → `Attended (✓)` → `Skipped (✕)`. To edit past or future days, a clear prompt directs them to the **Calendar** tab.

#### B. Attendance 14-Week Schedule Grid (`AttendanceGrid.tsx`)
- **Clean Read-Only Status Badges**: Class pills inside week cards are rendered as clean, non-interactive status badges (no click handlers, no cursor-pointer, no accidental taps). They clearly show the course name and current status (`✓`, `✕`, `·`).
- **Removed Filter & Legend Section**: The filter bar ("Course: All Courses...") and the interactive "Tap Box: Blank ➔ Attended ➔ Skipped" legend row are removed, eliminating visual noise.
- **Decongested Spacing**: Week cards receive generous padding (`p-5 sm:p-6`) and comfortable vertical gaps (`gap-4`) between days and weeks.

#### C. Bar Forecaster (`BarForecaster.tsx`)
- **Header Clean-up**: 
  - Removed the yellow `Sem 2.1` badge.
  - Removed the `Grading Scale` toggle button.
- **Vertical Course Selection List**:
  - Theory and Lab courses are listed vertically as individual full-width cards rather than horizontal scroll strips.
  - Each course card displays the course code, course title, and an indicator badge showing whether marks have been entered, with an active border highlight when selected.
- **Assessment Marks Input**:
  - Removed `· X Credits` next to the course name in the input header.
  - Removed the `Total Max: 100 Marks` badge from the Custom Lab Exam distribution header.
  - Increased input field padding and gap sizing to prevent cramped mobile input.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Centralizing Attendance Modifications to Today Fast-Log & Calendar**
  - *Chosen Approach*: The Attendance tab's weekly cards become read-only schedule viewers. Users modify attendance for today in the Daily Fast-Log banner and for any past/future date in the Calendar tab.
  - *Why*: Eliminates accidental tap modifications on mobile while scrolling through weeks, and establishes a single intuitive paradigm: fast-log for today, calendar for historical changes.
- **Decision 2: Vertical Course Cards over Horizontal Slider in Bar Forecaster**
  - *Chosen Approach*: Expand courses into a clean vertical list of cards with ample tap targets.
  - *Why*: Horizontal sliders on mobile require awkward horizontal thumb swiping and often hide courses off-screen. Vertical stacking flows naturally with mobile scrolling.
- **Decision 3: Removing Redundant Metadata Badges**
  - *Chosen Approach*: Strip out `Sem 2.1`, `Grading Scale` button, `· Credits`, and `Total Max: 100 Marks`.
  - *Why*: These elements added cognitive noise without functional value. The current semester is already established in onboarding/profile, grading math runs automatically, and credits are already factored into weighted CGPA calculations.

---

### 4. Technical Architecture & Data Strategy (Technical Reference)

```
┌─────────────────────────────────────────────────────────────┐
│                       Top Navigation                        │
│             [ Attendance ]  [ Calendar ]  [ Forecaster ]    │
└──────────────┬──────────────────────┬───────────────────────┘
               │                      │
       ATTENDANCE TAB           CALENDAR TAB         FORECASTER TAB
               │                      │                      │
  ┌────────────┴────────────┐         │          ┌───────────┴───────────┐
  │ Today's Daily Fast-Log  │         │          │ Header (Cleaned)      │
  │ • Today's classes ONLY  │         │          │ • No Sem / Grade scale│
  │ • Live interactive logs │         │          └───────────┬───────────┘
  └────────────┬────────────┘         │                      │
               │                      │          ┌───────────┴───────────┐
  ┌────────────┴────────────┐         │          │ Vertical Course Cards │
  │ 14-Week Schedule        │         │          │ • Full-width cards    │
  │ • Read-Only Badges      │         │          │ • Theory & Lab lists  │
  │ • No click-logging      │         │          └───────────┬───────────┘
  │ • No filter/legend strip│         │                      │
  └─────────────────────────┘         │          ┌───────────┴───────────┐
                                      │          │ Marks Input (Cleaned) │
                         Full Date Attendance    │ • No Credits / Max 100│
                         Log & Historic Edit     │ • Pass Bar Highlight  │
                                                 └───────────────────────┘
```

#### Component & Props Updates:
1. `src/components/DailyAttendanceBanner.tsx`:
   - Remove `onOpenAttendanceTab` button and day tabs mapping (`DAYS_ORDER`).
   - Fix `selectedDay` to `todayDayOfWeek`.
2. `src/components/AttendanceGrid.tsx`:
   - Remove the `selectedCourseFilter` controls bar and Tap Box legend block.
   - Render class items in week cards as non-interactive `div` elements (with status styling: emerald for attended, rose for skipped, neutral for blank) instead of clickable toggle buttons.
3. `src/components/BarForecaster.tsx`:
   - Remove `Sem {currentSemesterInfo.shortLabel}` badge and `Grading Scale` button.
   - Replace `overflow-x-auto` course strips with a responsive vertical list (`space-y-2`) of spacious cards.
   - Remove `{courseCredits} Credits` and `Total Max: {calculation.labTotalMax || 100} Marks` badges.
