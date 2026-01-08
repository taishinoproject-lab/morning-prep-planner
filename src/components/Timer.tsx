import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, SkipForward, Plus } from "lucide-react";
import { formatSecondsToMS } from "@/lib/timeUtils";
import type { TimelineItem } from "@/types/morning";
import { cn } from "@/lib/utils";

interface TimerProps {
  timeline: TimelineItem[];
  onComplete?: () => void;
}

const Timer = ({ timeline, onComplete }: TimerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const currentTask = timeline[currentIndex];
  const isLastTask = currentIndex >= timeline.length - 1;

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
  const totalSeconds = currentTask.minutes * 60;
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

  return (
    <Card className="bg-card overflow-hidden">
      {/* プログレスバー */}
      <div className="h-2 bg-border">
        <div 
          className="h-full bg-primary transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <CardContent className="p-6 space-y-6">
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
      </CardContent>
    </Card>
  );
};

export default Timer;
