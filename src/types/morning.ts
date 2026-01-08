// 朝の支度アプリの型定義

export interface TaskTemplate {
  id: string;
  name: string;
  defaultMinutes: number;
}

export interface PlanTask {
  id: string;
  templateId: string;
  name: string;
  minutes: number;
  order: number;
}

export interface DayPlan {
  date: string; // YYYY-MM-DD
  leaveTime: string; // HH:mm
  sleepMinutes: number;
  bufferMinutes: number;
  tasks: PlanTask[];
}

export interface RuntimeState {
  activeDate: string;
  isRunning: boolean;
  currentTaskIndex: number;
  remainingSeconds: number;
}

export interface MorningPlanData {
  templates: TaskTemplate[];
  plans: Record<string, DayPlan>;
  runtime: RuntimeState | null;
}

export interface TimelineItem {
  taskId: string;
  taskName: string;
  startTime: Date;
  endTime: Date;
  minutes: number;
  order: number;
}

export interface CalculatedSchedule {
  wakeUpTime: Date;
  sleepTime: Date;
  leaveTime: Date;
  timeline: TimelineItem[];
  totalTaskMinutes: number;
  isOvertime: boolean;
}
