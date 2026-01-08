import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/timeUtils";
import type { TimelineItem } from "@/types/morning";

interface TimelineProps {
  items: TimelineItem[];
  currentTaskIndex?: number;
  showCurrentIndicator?: boolean;
}

const Timeline = ({ items, currentTaskIndex = -1, showCurrentIndicator = false }: TimelineProps) => {
  const now = new Date();

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isCurrent = showCurrentIndicator && index === currentTaskIndex;
        const isPast = now > item.endTime;
        const isActive = now >= item.startTime && now <= item.endTime;

        return (
          <div
            key={item.taskId}
            className={cn(
              "relative flex items-center gap-3 rounded-lg p-3 transition-all",
              isCurrent && "bg-primary/20 ring-2 ring-primary",
              isActive && !isCurrent && "bg-accent",
              isPast && !isCurrent && "opacity-60",
              !isPast && !isActive && !isCurrent && "bg-card"
            )}
          >
            {/* 時刻 */}
            <div className="flex flex-col items-center min-w-[60px]">
              <span className="text-lg font-mono font-semibold text-foreground">
                {formatTime(item.startTime)}
              </span>
              <span className="text-xs text-muted-foreground">
                ～{formatTime(item.endTime)}
              </span>
            </div>

            {/* 縦線とドット */}
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  isCurrent || isActive ? "bg-primary" : "bg-border"
                )}
              />
              {index < items.length - 1 && (
                <div className="absolute top-3 w-0.5 h-full bg-border" />
              )}
            </div>

            {/* タスク情報 */}
            <div className="flex-1">
              <p className={cn(
                "font-medium",
                isCurrent && "text-primary"
              )}>
                {item.taskName}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.minutes}分
              </p>
            </div>

            {/* 現在のタスクマーカー */}
            {(isCurrent || isActive) && (
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
