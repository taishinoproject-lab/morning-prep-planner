import type { MorningPlanData, TaskTemplate, DayPlan, RuntimeState } from "@/types/morning";

const STORAGE_KEY = "morning_plans_v1";

// デフォルトのタスクテンプレート
const DEFAULT_TEMPLATES: TaskTemplate[] = [
  { id: "wash-face", name: "顔洗う", defaultMinutes: 3 },
  { id: "brush-teeth", name: "歯磨き", defaultMinutes: 3 },
  { id: "change-clothes", name: "着替え", defaultMinutes: 7 },
  { id: "breakfast", name: "朝ごはん", defaultMinutes: 12 },
  { id: "cleanup", name: "片付け", defaultMinutes: 3 },
  { id: "prepare-leave", name: "出発準備（荷物/鍵）", defaultMinutes: 5 },
  { id: "prepare-school", name: "通学準備（コート/手袋等）", defaultMinutes: 3 },
];

const getDefaultData = (): MorningPlanData => ({
  templates: DEFAULT_TEMPLATES,
  plans: {},
  runtime: null,
});

export const loadData = (): MorningPlanData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultData();
    
    const parsed = JSON.parse(stored) as MorningPlanData;
    // テンプレートが空の場合はデフォルトを使用
    if (!parsed.templates || parsed.templates.length === 0) {
      parsed.templates = DEFAULT_TEMPLATES;
    }
    return parsed;
  } catch {
    return getDefaultData();
  }
};

export const saveData = (data: MorningPlanData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// テンプレート操作
export const getTemplates = (): TaskTemplate[] => {
  return loadData().templates;
};

export const saveTemplates = (templates: TaskTemplate[]): void => {
  const data = loadData();
  data.templates = templates;
  saveData(data);
};

export const addTemplate = (template: TaskTemplate): void => {
  const data = loadData();
  data.templates.push(template);
  saveData(data);
};

export const updateTemplate = (id: string, updates: Partial<TaskTemplate>): void => {
  const data = loadData();
  const index = data.templates.findIndex(t => t.id === id);
  if (index !== -1) {
    data.templates[index] = { ...data.templates[index], ...updates };
    saveData(data);
  }
};

export const deleteTemplate = (id: string): void => {
  const data = loadData();
  data.templates = data.templates.filter(t => t.id !== id);
  saveData(data);
};

// プラン操作
export const getPlan = (date: string): DayPlan | null => {
  const data = loadData();
  return data.plans[date] || null;
};

export const savePlan = (plan: DayPlan): void => {
  const data = loadData();
  data.plans[plan.date] = plan;
  saveData(data);
};

export const deletePlan = (date: string): void => {
  const data = loadData();
  delete data.plans[date];
  saveData(data);
};

export const getAllPlans = (): Record<string, DayPlan> => {
  return loadData().plans;
};

// ランタイム状態操作
export const getRuntime = (): RuntimeState | null => {
  return loadData().runtime;
};

export const saveRuntime = (runtime: RuntimeState | null): void => {
  const data = loadData();
  data.runtime = runtime;
  saveData(data);
};
