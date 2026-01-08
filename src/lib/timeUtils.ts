import type { DayPlan, CalculatedSchedule, TimelineItem, PlanTask } from "@/types/morning";
import { format, parse, subMinutes, isValid } from "date-fns";

// 日付文字列をDate型に変換（日付 + 時刻）
export const parseTimeToDate = (dateStr: string, timeStr: string): Date => {
  const dateTime = parse(`${dateStr} ${timeStr}`, "yyyy-MM-dd HH:mm", new Date());
  return dateTime;
};

// HH:mm形式で時刻をフォーマット
export const formatTime = (date: Date): string => {
  if (!isValid(date)) return "--:--";
  return format(date, "HH:mm");
};

// 分数を時間:分形式に変換
export const formatMinutesToHM = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
};

// 秒数をmm:ss形式に変換
export const formatSecondsToMS = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// スケジュールを逆算計算
export const calculateSchedule = (plan: DayPlan): CalculatedSchedule => {
  const leaveTime = parseTimeToDate(plan.date, plan.leaveTime);
  
  // タスクをorder順でソート
  const sortedTasks = [...plan.tasks].sort((a, b) => a.order - b.order);
  
  // タスク合計時間
  const totalTaskMinutes = sortedTasks.reduce((sum, task) => sum + task.minutes, 0);
  
  // 起床時刻 = 出発時刻 - (タスク合計 + バッファ)
  const wakeUpTime = subMinutes(leaveTime, totalTaskMinutes + plan.bufferMinutes);
  
  // 就寝時刻 = 起床時刻 - 睡眠時間
  const sleepTime = subMinutes(wakeUpTime, plan.sleepMinutes);
  
  // タイムライン作成
  const timeline: TimelineItem[] = [];
  let currentTime = wakeUpTime;
  
  for (const task of sortedTasks) {
    const startTime = new Date(currentTime);
    const endTime = new Date(currentTime.getTime() + task.minutes * 60 * 1000);
    
    timeline.push({
      taskId: task.id,
      taskName: task.name,
      startTime,
      endTime,
      minutes: task.minutes,
      order: task.order,
    });
    
    currentTime = endTime;
  }
  
  // 超過チェック（タスク終了がleaveTimeを超える場合）
  const lastEndTime = timeline.length > 0 
    ? timeline[timeline.length - 1].endTime 
    : wakeUpTime;
  const isOvertime = lastEndTime.getTime() + plan.bufferMinutes * 60 * 1000 > leaveTime.getTime();
  
  return {
    wakeUpTime,
    sleepTime,
    leaveTime,
    timeline,
    totalTaskMinutes,
    isOvertime,
  };
};

// 今日の日付を取得 (YYYY-MM-DD)
export const getTodayStr = (): string => {
  return format(new Date(), "yyyy-MM-dd");
};

// 明日の日付を取得 (YYYY-MM-DD)
export const getTomorrowStr = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return format(tomorrow, "yyyy-MM-dd");
};

// 日付を日本語表示用にフォーマット
export const formatDateJP = (dateStr: string): string => {
  try {
    const date = parse(dateStr, "yyyy-MM-dd", new Date());
    const today = getTodayStr();
    const tomorrow = getTomorrowStr();
    
    if (dateStr === today) return "今日";
    if (dateStr === tomorrow) return "明日";
    
    return format(date, "M月d日(E)");
  } catch {
    return dateStr;
  }
};

// 就寝時刻のラベル（前日かどうかを判定）
export const getSleepTimeLabel = (sleepTime: Date, targetDate: string): string => {
  const sleepDateStr = format(sleepTime, "yyyy-MM-dd");
  const targetDateObj = parse(targetDate, "yyyy-MM-dd", new Date());
  const prevDate = new Date(targetDateObj);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevDateStr = format(prevDate, "yyyy-MM-dd");
  
  if (sleepDateStr === prevDateStr) {
    return `前日 ${formatTime(sleepTime)}`;
  }
  return formatTime(sleepTime);
};

// タスクIDを生成
export const generateTaskId = (): string => {
  return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// テンプレートIDを生成
export const generateTemplateId = (): string => {
  return `tmpl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};
