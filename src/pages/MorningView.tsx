import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sun, CheckCircle } from "lucide-react";
import TimeCard from "@/components/TimeCard";
import Timeline from "@/components/Timeline";
import Timer from "@/components/Timer";
import BottomNav from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";
import { getPlan, getAllPlans } from "@/lib/storage";
import { 
  getTodayStr, 
  getTomorrowStr,
  formatDateJP, 
  calculateSchedule, 
  formatTime, 
} from "@/lib/timeUtils";

const MorningView = () => {
  const today = getTodayStr();
  const tomorrow = getTomorrowStr();
  
  // 利用可能な日付を取得
  const allPlans = getAllPlans();
  const availableDates = Object.keys(allPlans).sort();
  
  // 今日のプランがあれば今日、なければ明日、それもなければ最初の日付
  const defaultDate = allPlans[today] ? today : allPlans[tomorrow] ? tomorrow : availableDates[0] || today;
  
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [showTimer, setShowTimer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const plan = getPlan(selectedDate);
  const schedule = plan ? calculateSchedule(plan) : null;

  const handleComplete = () => {
    setIsCompleted(true);
    setShowTimer(false);
    toast({ title: "おつかれさまでした！🎉" });
  };

  if (!plan || !schedule) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-10 bg-card border-b border-border">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">朝の実行</h1>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6">
          <Card className="bg-card">
            <CardContent className="p-6 text-center space-y-4">
              <Sun className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <h2 className="text-lg font-semibold">プランがありません</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  まずはプランを作成してください
                </p>
              </div>
              <Button asChild>
                <Link to="/plan">プランを作る</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <BottomNav />
      </div>
    );
  }

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
          <h1 className="text-lg font-semibold flex-1">朝の実行</h1>
          
          {availableDates.length > 1 && (
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map(date => (
                  <SelectItem key={date} value={date}>
                    {formatDateJP(date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 完了画面 */}
        {isCompleted ? (
          <Card className="bg-primary/10">
            <CardContent className="p-8 text-center space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">完了！</h2>
              <p className="text-muted-foreground">
                すべてのタスクが終わりました。<br />
                いってらっしゃい！ 🚀
              </p>
              <Button onClick={() => setIsCompleted(false)} variant="outline">
                タイムラインに戻る
              </Button>
            </CardContent>
          </Card>
        ) : showTimer ? (
          /* タイマーモード */
          <Timer timeline={schedule.timeline} leaveTime={schedule.leaveTime} onComplete={handleComplete} />
        ) : (
          /* タイムライン表示 */
          <>
            {/* サマリー */}
            <div className="grid grid-cols-3 gap-3">
              <TimeCard
                label="起床"
                time={formatTime(schedule.wakeUpTime)}
                variant="wake"
              />
              <TimeCard
                label="現在"
                time={formatTime(new Date())}
                variant="default"
              />
              <TimeCard
                label="出発"
                time={formatTime(schedule.leaveTime)}
                variant="leave"
              />
            </div>

            {/* 開始ボタン */}
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => setShowTimer(true)}
            >
              <Sun className="w-5 h-5 mr-2" />
              タイマーを開始する
            </Button>

            {/* タイムライン */}
            <Card className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">今日のタイムライン</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline 
                  items={schedule.timeline} 
                  showCurrentIndicator={true}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MorningView;
