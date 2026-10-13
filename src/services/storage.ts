import { RoutineConfig, AttendanceRecord, CourseAssessment, BangladeshHoliday, UserProfile } from '../types';
import { OFFICIAL_BANGLADESH_HOLIDAYS } from '../data/defaultHolidays';
import { DEFAULT_REAL_WEEKLY_ROUTINE } from '../data/curriculum';

const DB_NAME = 'EmberStudiesDB';
const DB_VERSION = 1;

const STORES = {
  ROUTINE: 'routine_config',
  ATTENDANCE: 'attendance_records',
  ASSESSMENTS: 'course_assessments',
  HOLIDAYS: 'holidays',
} as const;

// Default initial date: First Saturday of the current academic term or today
const getInitialSemesterStart = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getInitialClassesEnd = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + (14 * 7 - 3));
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DEFAULT_ROUTINE_CONFIG: RoutineConfig = {
  semesterStartDate: getInitialSemesterStart(),
  classesEndDate: getInitialClassesEnd(),
  totalWeeks: 14,
  weeklySchedule: DEFAULT_REAL_WEEKLY_ROUTINE,
  adminPin: '0451',
  semesterName: 'Year 1, Semester 1 (14 Weeks)',
  selectedSemesterKey: 'y1s1',
};

class IndexedDBStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private hasIndexedDB: boolean;

  constructor() {
    this.hasIndexedDB = typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private getDB(): Promise<IDBDatabase> {
    if (!this.hasIndexedDB) {
      return Promise.reject(new Error('IndexedDB not supported'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORES.ROUTINE)) {
            db.createObjectStore(STORES.ROUTINE);
          }
          if (!db.objectStoreNames.contains(STORES.ATTENDANCE)) {
            db.createObjectStore(STORES.ATTENDANCE, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.ASSESSMENTS)) {
            db.createObjectStore(STORES.ASSESSMENTS, { keyPath: 'courseCode' });
          }
          if (!db.objectStoreNames.contains(STORES.HOLIDAYS)) {
            db.createObjectStore(STORES.HOLIDAYS, { keyPath: 'id' });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    return this.dbPromise;
  }

  // --- ROUTINE CONFIG ---
  async getRoutineConfig(): Promise<RoutineConfig> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.ROUTINE, 'readonly');
        const store = tx.objectStore(STORES.ROUTINE);
        const req = store.get('main_config');
        req.onsuccess = () => {
          if (req.result) {
            const conf = req.result;
            if (!conf.adminPin || conf.adminPin === '1234') {
              conf.adminPin = '0451';
            }
            resolve(conf);
          } else {
            // Check fallback in localStorage
            const local = localStorage.getItem('ember_routine_config');
            if (local) {
              try {
                const parsed = JSON.parse(local);
                if (!parsed.adminPin || parsed.adminPin === '1234') {
                  parsed.adminPin = '0451';
                }
                resolve(parsed);
                return;
              } catch (_) {}
            }
            resolve(DEFAULT_ROUTINE_CONFIG);
          }
        };
        req.onerror = () => resolve(DEFAULT_ROUTINE_CONFIG);
      });
    } catch (_) {
      const local = localStorage.getItem('ember_routine_config');
      if (local) {
        try {
          return JSON.parse(local);
        } catch (_) {}
      }
      return DEFAULT_ROUTINE_CONFIG;
    }
  }

  async saveRoutineConfig(config: RoutineConfig): Promise<void> {
    try {
      localStorage.setItem('ember_routine_config', JSON.stringify(config));
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.ROUTINE, 'readwrite');
        const store = tx.objectStore(STORES.ROUTINE);
        const req = store.put(config, 'main_config');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (_) {
      localStorage.setItem('ember_routine_config', JSON.stringify(config));
    }
  }

  // --- ATTENDANCE RECORDS ---
  async getAllAttendanceRecords(): Promise<Record<string, AttendanceRecord>> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.ATTENDANCE, 'readonly');
        const store = tx.objectStore(STORES.ATTENDANCE);
        const req = store.getAll();
        req.onsuccess = () => {
          const result: Record<string, AttendanceRecord> = {};
          if (Array.isArray(req.result) && req.result.length > 0) {
            for (const item of req.result) {
              const key = `${item.date}_${item.courseCode}`;
              result[key] = item;
            }
          } else {
            const local = localStorage.getItem('ember_attendance_records');
            if (local) {
              try {
                return resolve(JSON.parse(local));
              } catch (_) {}
            }
          }
          resolve(result);
        };
        req.onerror = () => resolve({});
      });
    } catch (_) {
      const local = localStorage.getItem('ember_attendance_records');
      if (local) {
        try {
          return JSON.parse(local);
        } catch (_) {}
      }
      return {};
    }
  }

  async saveAttendanceRecord(record: AttendanceRecord): Promise<void> {
    const key = `${record.date}_${record.courseCode}`;
    const itemWithKey = { ...record, id: key, updatedAt: Date.now() };

    // Update localStorage mirror
    try {
      const local = localStorage.getItem('ember_attendance_records');
      const map = local ? JSON.parse(local) : {};
      if (record.status === 'unmarked') {
        delete map[key];
      } else {
        map[key] = itemWithKey;
      }
      localStorage.setItem('ember_attendance_records', JSON.stringify(map));
    } catch (_) {}

    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.ATTENDANCE, 'readwrite');
        const store = tx.objectStore(STORES.ATTENDANCE);
        const req = record.status === 'unmarked' 
          ? store.delete(key) 
          : store.put(itemWithKey);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (_) {
      // localstorage already updated
    }
  }

  // --- COURSE ASSESSMENTS (PASSBAR FORECASTER) ---
  async getAllCourseAssessments(): Promise<Record<string, CourseAssessment>> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.ASSESSMENTS, 'readonly');
        const store = tx.objectStore(STORES.ASSESSMENTS);
        const req = store.getAll();
        req.onsuccess = () => {
          const result: Record<string, CourseAssessment> = {};
          if (Array.isArray(req.result) && req.result.length > 0) {
            for (const item of req.result) {
              result[item.courseCode] = item;
            }
          } else {
            const local = localStorage.getItem('ember_course_assessments');
            if (local) {
              try {
                return resolve(JSON.parse(local));
              } catch (_) {}
            }
          }
          resolve(result);
        };
        req.onerror = () => resolve({});
      });
    } catch (_) {
      const local = localStorage.getItem('ember_course_assessments');
      if (local) {
        try {
          return JSON.parse(local);
        } catch (_) {}
      }
      return {};
    }
  }

  async saveCourseAssessment(assessment: CourseAssessment): Promise<void> {
    try {
      const local = localStorage.getItem('ember_course_assessments');
      const map = local ? JSON.parse(local) : {};
      map[assessment.courseCode] = assessment;
      localStorage.setItem('ember_course_assessments', JSON.stringify(map));
    } catch (_) {}

    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.ASSESSMENTS, 'readwrite');
        const store = tx.objectStore(STORES.ASSESSMENTS);
        const req = store.put(assessment);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (_) {}
  }

  // --- HOLIDAYS ---
  async getHolidays(): Promise<BangladeshHoliday[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.HOLIDAYS, 'readonly');
        const store = tx.objectStore(STORES.HOLIDAYS);
        const req = store.getAll();
        req.onsuccess = () => {
          if (Array.isArray(req.result) && req.result.length > 0) {
            resolve(req.result);
          } else {
            const local = localStorage.getItem('ember_holidays');
            if (local) {
              try {
                return resolve(JSON.parse(local));
              } catch (_) {}
            }
            resolve(OFFICIAL_BANGLADESH_HOLIDAYS);
          }
        };
        req.onerror = () => resolve(OFFICIAL_BANGLADESH_HOLIDAYS);
      });
    } catch (_) {
      const local = localStorage.getItem('ember_holidays');
      if (local) {
        try {
          return JSON.parse(local);
        } catch (_) {}
      }
      return OFFICIAL_BANGLADESH_HOLIDAYS;
    }
  }

  async saveHolidays(holidays: BangladeshHoliday[]): Promise<void> {
    localStorage.setItem('ember_holidays', JSON.stringify(holidays));
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.HOLIDAYS, 'readwrite');
      const store = tx.objectStore(STORES.HOLIDAYS);
      store.clear();
      for (const h of holidays) {
        store.put(h);
      }
    } catch (_) {}
  }

  // --- CUMULATIVE CGPA CONFIG ---
  getCumulativeCGPAConfig(): { previousCGPA: number | null; previousCredits: number | null; includeCurrentSemester: boolean } {
    try {
      const local = localStorage.getItem('ember_cumulative_cgpa_config');
      if (local) {
        return JSON.parse(local);
      }
    } catch (_) {}
    return {
      previousCGPA: null,
      previousCredits: null,
      includeCurrentSemester: true,
    };
  }

  saveCumulativeCGPAConfig(cfg: { previousCGPA: number | null; previousCredits: number | null; includeCurrentSemester: boolean }): void {
    try {
      localStorage.setItem('ember_cumulative_cgpa_config', JSON.stringify(cfg));
    } catch (_) {}
  }

  // --- USER PROFILE & ONBOARDING ---
  getUserProfile(): UserProfile | null {
    try {
      const local = localStorage.getItem('ember_user_profile');
      if (local) {
        return JSON.parse(local);
      }
    } catch (_) {}
    return null;
  }

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem('ember_user_profile', JSON.stringify(profile));
    } catch (_) {}
  }

  // --- HISTORICAL SEMESTERS GPA RECORD ---
  getHistoricalGPAs(): Record<string, number | null> {
    try {
      const local = localStorage.getItem('ember_historical_gpas');
      if (local) {
        return JSON.parse(local);
      }
    } catch (_) {}
    return {};
  }

  saveHistoricalGPAs(map: Record<string, number | null>): void {
    try {
      localStorage.setItem('ember_historical_gpas', JSON.stringify(map));
    } catch (_) {}
  }

  // --- EXPORT & IMPORT BACKUP ---
  async exportFullBackup(): Promise<string> {
    const config = await this.getRoutineConfig();
    const attendance = await this.getAllAttendanceRecords();
    const assessments = await this.getAllCourseAssessments();
    const holidays = await this.getHolidays();
    const profile = this.getUserProfile();
    const historicalGPAs = this.getHistoricalGPAs();

    const backup = {
      version: 2,
      appName: 'EmberStudies',
      exportedAt: new Date().toISOString(),
      config,
      attendance,
      assessments,
      holidays,
      profile,
      historicalGPAs,
    };

    return JSON.stringify(backup, null, 2);
  }

  async importFullBackup(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return false;

      if (data.config) {
        await this.saveRoutineConfig(data.config);
      }
      if (data.attendance) {
        for (const record of Object.values(data.attendance) as AttendanceRecord[]) {
          await this.saveAttendanceRecord(record);
        }
      }
      if (data.assessments) {
        for (const assess of Object.values(data.assessments) as CourseAssessment[]) {
          await this.saveCourseAssessment(assess);
        }
      }
      if (data.holidays && Array.isArray(data.holidays)) {
        await this.saveHolidays(data.holidays);
      }
      if (data.profile) {
        this.saveUserProfile(data.profile);
      }
      if (data.historicalGPAs) {
        this.saveHistoricalGPAs(data.historicalGPAs);
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }

  async clearAllData(): Promise<void> {
    localStorage.removeItem('ember_routine_config');
    localStorage.removeItem('ember_attendance_records');
    localStorage.removeItem('ember_course_assessments');
    localStorage.removeItem('ember_holidays');

    try {
      const db = await this.getDB();
      const tx = db.transaction([STORES.ROUTINE, STORES.ATTENDANCE, STORES.ASSESSMENTS, STORES.HOLIDAYS], 'readwrite');
      tx.objectStore(STORES.ROUTINE).clear();
      tx.objectStore(STORES.ATTENDANCE).clear();
      tx.objectStore(STORES.ASSESSMENTS).clear();
      tx.objectStore(STORES.HOLIDAYS).clear();
    } catch (_) {}
  }
}

export const storageService = new IndexedDBStorage();
