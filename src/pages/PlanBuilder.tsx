import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Copy, AlertTriangle } from "lucide-react";
import TimeCard from "@/components/TimeCard";
import Timeline from "@/components/Timeline";
import TaskSelector from "@/components/TaskSelector";
import BottomNav from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";
import { getPlan, savePlan, getTemplates } from "@/lib/storage";
import { 
  getTomorrowStr, 
  formatDateJP, 
  calculateSchedule, 
  formatTime, 
  getSleepTimeLabel,
  formatMinutesToHM,
  generateTaskId
} from "@/lib/timeUtils";
import type { DayPlan, PlanTask } from "@/types/morning";

const BUFFER_OPTIONS = [0, 5, 10, 15, 20];
const SLEEP_PRESETS = [
  { label: "6時間", minutes: 360 },
  { label: "6時間30分", minutes: 390 },
  { label: "7時間", minutes: 420 },
  { label: "7時間30分", minutes: 450 },
  { label: "8時間", minutes: 480 },
  { label: "8時間30分", minutes: 510 },
  { label: "9時間", minutes: 540 },
];

const PlanBuilder = () => {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");
  
  const [targetDate, setTargetDate] = useState(dateParam || getTomorrowStr());
  const [leaveTime, setLeaveTime] = useState("08:00");
  const [sleepMinutes, setSleepMinutes] = useState(450); // 7時間30分
  const [bufferMinutes, setBufferMinutes] = useState(10);
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  
  const templates = getTemplates();

  // 既存プランの読み込み
  useEffect(() => {
    const existingPlan = getPlan(targetDate);
    if (existingPlan) {
      setLeaveTime(existingPlan.leaveTime);
      setSleepMinutes(existingPlan.sleepMinutes);
      setBufferMinutes(existingPlan.bufferMinutes);
      setTasks(existingPlan.tasks);
    } else {
      // デフォルト値にリセット
      setLeaveTime("08:00");
      setSleepMinutes(450);
      setBufferMinutes(10);
      setTasks([]);
    }
  }, [targetDate]);

  // リアルタイム計算
  const schedule = useMemo(() => {
    if (tasks.length === 0) return null;
    
    const plan: DayPlan = {
      date: targetDate,
      leaveTime,
      sleepMinutes,
      bufferMinutes,
      tasks,
    };
    
    return calculateSchedule(plan);
  }, [targetDate, leaveTime, sleepMinutes, bufferMinutes, tasks]);

  // 保存処理
  const handleSave = () => {
    if (!leaveTime) {
      toast({ title: "出発時刻を入力してください", variant: "destructive" });
      return;
    }
    if (tasks.length === 0) {
      toast({ title: "タスクを1つ以上選択してください", variant: "destructive" });
      return;
    }

    const plan: DayPlan = {
      date: targetDate,
      leaveTime,
      sleepMinutes,
      bufferMinutes,
      tasks,
    };

    savePlan(plan);
    toast({ title: "プランを保存しました！" });
  };

  // 前日プランから複製
  const handleCopyFromYesterday = () => {
    const yesterday = new Date(targetDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    
    const yesterdayPlan = getPlan(yesterdayStr);
    if (!yesterdayPlan) {
      toast({ title: "前日のプランがありません", variant: "destructive" });
      return;
    }

    // IDを新規発行しつつタスクをコピー
    const copiedTasks = yesterdayPlan.tasks.map(t => ({
      ...t,
      id: generateTaskId(),
    }));

    setLeaveTime(yesterdayPlan.leaveTime);
    setSleepMinutes(yesterdayPlan.sleepMinutes);
    setBufferMinutes(yesterdayPlan.bufferMinutes);
    setTasks(copiedTasks);
    
    toast({ title: "前日のプランをコピーしました" });
  };

  // 日付選択肢を生成（今日から7日間）
  const dateOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    for (let i = 0; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      options.push({ value: dateStr, label: formatDateJP(dateStr) });
    }
    return options;
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold flex-1">プラン作成</h1>
          <Button variant="outline" size="sm" onClick={handleCopyFromYesterday}>
            <Copy className="w-4 h-4 mr-1" />
            複製
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 日付選択 */}
        <div className="space-y-2">
          <Label>対象日</Label>
          <Select value={targetDate} onValueChange={setTargetDate}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 出発時刻 */}
        <div className="space-y-2">
          <Label>家を出る時間</Label>
          <Input
            type="time"
            value={leaveTime}
            onChange={(e) => setLeaveTime(e.target.value)}
            className="text-lg"
          />
        </div>

        {/* 睡眠時間 */}
        <div className="space-y-2">
          <Label>睡眠時間</Label>
          <Select 
            value={sleepMinutes.toString()} 
            onValueChange={(v) => setSleepMinutes(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SLEEP_PRESETS.map(opt => (
                <SelectItem key={opt.minutes} value={opt.minutes.toString()}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* バッファ時間 */}
        <div className="space-y-2">
          <Label>バッファ時間（余裕）</Label>
          <Select 
            value={bufferMinutes.toString()} 
            onValueChange={(v) => setBufferMinutes(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUFFER_OPTIONS.map(min => (
                <SelectItem key={min} value={min.toString()}>
                  {min}分
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* タスク選択 */}
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">朝のタスク</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskSelector
              templates={templates}
              selectedTasks={tasks}
              onTasksChange={setTasks}
            />
          </CardContent>
        </Card>

        {/* 計算結果 */}
        {schedule && (
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">計算結果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedule.isOvertime && (
                <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    タスク時間が出発時刻を超えています！
                  </span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <TimeCard
                  label="就寝"
                  time={getSleepTimeLabel(schedule.sleepTime, targetDate)}
                  variant="sleep"
                />
                <TimeCard
                  label="起床"
                  time={formatTime(schedule.wakeUpTime)}
                  variant="wake"
                />
                <TimeCard
                  label="出発"
                  time={formatTime(schedule.leaveTime)}
                  variant="leave"
                />
              </div>

              <div className="text-center text-sm text-muted-foreground">
                タスク合計: {formatMinutesToHM(schedule.totalTaskMinutes)} + 
                バッファ: {bufferMinutes}分
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium mb-3">タイムライン</p>
                <Timeline items={schedule.timeline} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default PlanBuilder;
