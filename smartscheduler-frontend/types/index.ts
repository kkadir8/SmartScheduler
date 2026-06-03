// ── Entity Models ────────────────────────────────────────────────────────────

export interface Instructor {
  id: number;
  name: string;
  title: string;
  department: string;
  email: string;
  courseCount?: number;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  credit: number;
  durationHours: number;
  studentCount: number;
  instructorId: number;
  instructorName?: string | null;
}

export interface Classroom {
  id: number;
  name: string;
  building: string;
  capacity: number;
  hasLab: boolean;
  hasProjector: boolean;
}

export interface Constraint {
  id: number;
  courseId: number;
  classroomId: number;
  courseCode?: string;
  courseName?: string;
  classroomName?: string;
  classroomBuilding?: string;
  notes?: string;
  createdAt?: string;
}

// ── Schedule ─────────────────────────────────────────────────────────────────

export interface ScheduleEntry {
  id: number;
  courseId: number;
  instructorId?: number;
  classroomId: number;
  dayOfWeek: number;
  startHour: number;
  durationHours: number;
  course?: { code: string; name: string };
  classroom?: { name: string };
  instructor?: { name: string };
}

export interface ConflictItem {
  type: "room" | "instructor";
  day: number;
  hour: number;
  courseIds: number[];
  classroomId?: number;
  instructorId?: number;
}

export interface SavedSchedule {
  id: number;
  name: string;
  term: string;
  fitnessPercent: number;
  createdAt: string;
  courseCount: number;
  isActive: boolean;
}

export interface FitnessData {
  fitnessPercent: number;
  conflictCount: number;
  conflicts?: ConflictItem[];
  bestGeneration: number;
  totalGenerations: number;
  fitnessHistory: number[];
  elapsedMs: number;
  stoppedEarly?: boolean;
}

// ── What-If ──────────────────────────────────────────────────────────────────

export interface LockedAssignment {
  courseId: number;
  dayOfWeek: number;
  startHour: number;
}

export interface ScenarioResult extends FitnessData {
  entries: ScheduleEntry[];
}
