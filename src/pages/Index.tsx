import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, ArrowRight, Plus, Calendar } from "lucide-react";
import TimeCard from "@/components/TimeCard";
import BottomNav from "@/components/BottomNav";
import { getPlan, getTemplates } from "@/lib/storage";
import { getTodayStr, getTomorrowStr, formatDateJP, calculateSchedule, formatTime, getSleepTimeLabel } from "@/lib/timeUtils";

const Index = () => {
  const today = getTodayStr();
  const tomorrow = getTomorrowStr();
  
  const todayPlan = getPlan(today);
  const tomorrowPlan = getPlan(tomorrow);
  const templates = getTemplates();

  const tomorrowSchedule = tomorrowPlan ? calculateSchedule(tomorrowPlan) : null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ヘッダー */}
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background pt-safe-top">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Sun className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">朝の支度</h1>
          </div>
          <p className="text-muted-foreground">
            逆算して、余裕のある朝を
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 明日のサマリー */}
        {tomorrowSchedule && tomorrowPlan ? (
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-primary" />
                {formatDateJP(tomorrow)}のプラン
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tomorrowSchedule.isOvertime && (
                <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm">
                  ⚠️ タスク時間が出発時刻を超えています
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-3">
                <TimeCard
                  label="就寝"
                  time={getSleepTimeLabel(tomorrowSchedule.sleepTime, tomorrow)}
                  variant="sleep"
                />
                <TimeCard
                  label="起床"
                  time={formatTime(tomorrowSchedule.wakeUpTime)}
                  variant="wake"
                />
                <TimeCard
                  label="出発"
                  time={formatTime(tomorrowSchedule.leaveTime)}
                  variant="leave"
                />
              </div>

              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/plan">
                    編集する
                  </Link>
                </Button>
                <Button asChild className="flex-1 gap-2">
                  <Link to="/morning">
                    朝の画面へ
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Moon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{formatDateJP(tomorrow)}のプランがありません</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  今夜の就寝時刻と明日の起床時刻を計算しましょう
                </p>
              </div>
              <Button asChild className="gap-2">
                <Link to="/plan">
                  <Plus className="w-4 h-4" />
                  明日のプランを作る
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 今日のプラン */}
        {todayPlan && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">今日のプラン</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">出発 {todayPlan.leaveTime}</p>
                  <p className="text-sm text-muted-foreground">{todayPlan.tasks.length}個のタスク</p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/morning">朝の画面へ</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* クイックアクション */}
        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
            <Link to="/plan">
              <Calendar className="w-5 h-5" />
              <span>プラン作成</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
            <Link to="/templates">
              <Sun className="w-5 h-5" />
              <span>タスク管理</span>
            </Link>
          </Button>
        </div>

        {/* ステータス */}
        <div className="text-center text-sm text-muted-foreground">
          登録済みタスク: {templates.length}個
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
