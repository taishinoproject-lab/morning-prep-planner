import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, SkipForward, Plus } from "lucide-react";
import { formatSecondsToMS } from "@/lib/timeUtils";
import type { TimelineItem } from "@/types/morning";
import { cn } from "@/lib/utils";
import Timeline from "@/components/Timeline";

interface TimerProps {
  timeline: TimelineItem[];
  leaveTime: Date;
  onComplete?: () => void;
}

const Timer = ({ timeline, leaveTime, onComplete }: TimerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [now, setNow] = useState(new Date());
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isWakeLockSupported = "wakeLock" in navigator;

  const currentTask = timeline[currentIndex];
  const isLastTask = currentIndex >= timeline.length - 1;
  const totalSeconds = useMemo(
    () => timeline.reduce((sum, task) => sum + task.minutes * 60, 0),
    [timeline]
  );
  const elapsedSeconds = useMemo(() => {
    const completedSeconds = timeline
      .slice(0, currentIndex)
      .reduce((sum, task) => sum + task.minutes * 60, 0);
    if (!currentTask) return completedSeconds;
    const currentTotal = currentTask.minutes * 60;
    return completedSeconds + Math.max(currentTotal - remainingSeconds, 0);
  }, [currentIndex, currentTask, remainingSeconds, timeline]);

  // タスク変更時に残り時間をリセット
  useEffect(() => {
    if (currentTask) {
      setRemainingSeconds(currentTask.minutes * 60);
    }
  }, [currentIndex, currentTask]);

  // タイマーロジック
  useEffect(() => {
    if (!isRunning || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          // 次のタスクへ自動遷移
          if (!isLastTask) {
            setCurrentIndex(i => i + 1);
          } else {
            setIsRunning(false);
            onComplete?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds, isLastTask, onComplete]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!isWakeLockSupported) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch {
      wakeLockRef.current = null;
    }
  }, [isWakeLockSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (!wakeLockRef.current) return;
    try {
      await wakeLockRef.current.release();
    } finally {
      wakeLockRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [isRunning, requestWakeLock, releaseWakeLock]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isRunning) {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isRunning, requestWakeLock]);

  const handleStart = useCallback(() => {
    setIsStarted(true);
    setIsRunning(true);
    if (!currentTask) return;
    setRemainingSeconds(currentTask.minutes * 60);
  }, [currentTask]);

  const handlePauseResume = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (isLastTask) {
      setIsRunning(false);
      onComplete?.();
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [isLastTask, onComplete]);

  const handleAddMinute = useCallback(() => {
    setRemainingSeconds(prev => prev + 60);
  }, []);

  if (!currentTask) {
    return (
      <Card className="bg-card">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">タスクがありません</p>
        </CardContent>
      </Card>
    );
  }

  // 進捗計算
  const taskTotalSeconds = currentTask.minutes * 60;
  const progress = ((taskTotalSeconds - remainingSeconds) / taskTotalSeconds) * 100;
  const overallProgress = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;
  const secondsToLeave = Math.max(0, Math.floor((leaveTime.getTime() - now.getTime()) / 1000));
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}時間${m.toString().padStart(2, "0")}分`;
    if (m > 0) return `${m}分${s.toString().padStart(2, "0")}秒`;
    return `${s}秒`;
  };

  return (
    <Card className="bg-card overflow-hidden">
      {/* プログレスバー */}
      <div className="space-y-1 bg-border/60">
        <div className="h-2 bg-border">
          <div
            className="h-full bg-primary transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="h-1 bg-border">
          <div
            className="h-full bg-emerald-500/80 transition-all duration-1000"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-border/70 p-3">
            <p className="text-xs text-muted-foreground">現在時刻</p>
            <p className="text-base font-semibold">{now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <div className="rounded-lg border border-border/70 p-3">
            <p className="text-xs text-muted-foreground">出発まで</p>
            <p className={cn("text-base font-semibold", secondsToLeave <= 300 && "text-destructive")}
            >{formatDuration(secondsToLeave)}</p>
          </div>
          <div className="rounded-lg border border-border/70 p-3">
            <p className="text-xs text-muted-foreground">全体の進捗</p>
            <p className="text-base font-semibold">{Math.min(100, Math.round(overallProgress))}%</p>
          </div>
          <div className="rounded-lg border border-border/70 p-3">
            <p className="text-xs text-muted-foreground">画面スリープ</p>
            <p className="text-base font-semibold">
              {isWakeLockSupported ? (isRunning ? "防止中" : "停止中") : "非対応"}
            </p>
          </div>
        </div>

        {/* タスク情報 */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} / {timeline.length}
          </p>
          <h2 className="text-2xl font-bold mt-1">{currentTask.taskName}</h2>
        </div>

        {/* タイマー表示 */}
        <div className="text-center">
          <p className={cn(
            "text-6xl font-mono font-bold tracking-tight",
            remainingSeconds <= 60 && isRunning && "text-destructive animate-pulse"
          )}>
            {formatSecondsToMS(remainingSeconds)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            予定時間: {currentTask.minutes}分
          </p>
        </div>

        {/* コントロールボタン */}
        <div className="flex justify-center gap-3">
          {!isStarted ? (
            <Button size="lg" onClick={handleStart} className="gap-2">
              <Play className="w-5 h-5" />
              開始
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={handleAddMinute}
              >
                <Plus className="w-5 h-5" />
              </Button>

              <Button
                size="icon"
                className="h-12 w-12"
                onClick={handlePauseResume}
              >
                {isRunning ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={handleNext}
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {isStarted && (
          <p className="text-center text-sm text-muted-foreground">
            {isRunning ? "タイマー動作中" : "一時停止中"} · +1分 / 一時停止 / 次へ
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>現在のタスク進捗</span>
            <span>{Math.min(100, Math.round(progress))}%</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>全体の進捗</span>
            <span>{Math.min(100, Math.round(overallProgress))}%</span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">今日のタイムライン</h3>
          <Timeline items={timeline} currentTaskIndex={currentIndex} showCurrentIndicator />
        </div>
      </CardContent>
    </Card>
  );
};

export default Timer;
