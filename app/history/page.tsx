"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Clock, TrendingUp, CheckSquare, Brain, Zap } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useSearchParams } from "next/navigation";

// Glass effect styles
const glassCard = "bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl";

// --- Types ---
interface StudySession {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  focusScore: number | null;
  coinsEarned: number;
  expEarned: number;
  taskTitle?: string;
}

interface Analytics {
  totalSessions: number;
  totalMinutes: number;
  avgFocusScore: number;
  totalCoins: number;
  totalExp: number;
  streak: number;
  chartData: { date: string; minutes: number; focus: number }[];
}

// --- Main Component ---
export default function HistoryPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState(0);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const periodMap = { day: "day", week: "week", month: "month" };
      const period = periodMap[viewMode];

      const [sessionsRes, analyticsRes] = await Promise.all([
        fetch(`/api/sessions?limit=20`),
        fetch(`/api/sessions/analytics?period=${period}`)
      ]);

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data.sessions || []);
      }

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data.analytics);
        setCompletedTasks(data.analytics?.totalSessions || 0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Mock chart fallback (hooks must be before any early return) ---
  const useMock = searchParams.get("mock") === "1";
  const mockChartData = useMemo(() => {
    const now = new Date();
    const points = viewMode === "month" ? 30 : 7;
    const data = Array.from({ length: points }).map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (points - 1 - i));
      const focus = 50 + Math.round(40 * Math.sin(i / 2) + 10 * Math.random());
      return {
        date: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
        minutes: 25 + Math.round(Math.random() * 60),
        focus: Math.max(0, Math.min(100, focus)),
      };
    });
    return data;
  }, [viewMode]);

  const chartDataToShow = (analytics?.chartData?.length && !useMock)
    ? analytics.chartData
    : mockChartData;

  const chartTitle = useMemo(() => {
    if (viewMode === "month") return "Hoạt động 30 ngày qua (Focus %)";
    if (viewMode === "week") return "Hoạt động 7 ngày qua (Focus %)";
    return "Hoạt động hôm nay (Focus %)";
  }, [viewMode]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        <div className="text-xl">Đang tải dữ liệu...</div>
      </div>
    );
  }

  const totalHours = analytics ? (analytics.totalMinutes / 60).toFixed(1) : "0.0";
  const avgFocus = analytics?.avgFocusScore || 0;
  const avgPerformance = analytics?.avgFocusScore || 0;

  return (
    <main className="h-screen w-screen text-white p-6 transition-all duration-500">
      <div className="relative w-full h-full">
        <div className="absolute top-20 bottom-6 left-24 right-24 flex gap-4">
        {/* LEFT PANEL */}
        <div className={cn(glassCard, "flex-1 p-5 flex flex-col overflow-hidden")}> 
          <h2 className="text-xl font-bold text-white mb-4">Lịch sử học tập</h2>
          
          <div className="flex gap-2 mb-4">
            <TabButton
              active={viewMode === "day"}
              onClick={() => setViewMode("day")}
              icon={<Calendar className="w-4 h-4" />}
              label="Ngày"
            />
            <TabButton
              active={viewMode === "week"}
              onClick={() => setViewMode("week")}
              icon={<Calendar className="w-4 h-4" />}
              label="Tuần"
            />
            <TabButton
              active={viewMode === "month"}
              onClick={() => setViewMode("month")}
              icon={<Calendar className="w-4 h-4" />}
              label="Tháng"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {sessions.length > 0 ? (
              sessions.map((session) => {
                const date = new Date(session.startTime);
                const duration = session.duration ? Math.round(session.duration / 60) : 0;
                const focusPercent = session.focusScore || 0;
                
                return (
                  <div
                    key={session.id}
                    className="bg-black/30 hover:bg-black/40 border border-white/10 rounded-xl p-3 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm">
                            {session.taskTitle || "Học tập tự do"}
                          </h3>
                          <p className="text-white/60 text-xs">
                            {date.toLocaleDateString("vi-VN")} - {date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-base">{duration} phút</div>
                        <div className={cn(
                          "text-xs font-medium",
                          focusPercent >= 80 ? "text-green-400" : 
                          focusPercent >= 50 ? "text-yellow-400" : "text-red-400"
                        )}>
                          {Math.round(focusPercent)}% tập trung
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-white/60 py-12 text-sm">
                Chưa có phiên học nào
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[420px] flex flex-col gap-4">
          <div className={cn(glassCard, "p-5")}>
            <h2 className="text-xl font-bold text-white mb-0.5">Tổng quan (Theo Ngày)</h2>
            <p className="text-white/60 text-xs">Thống kê tổng hợp</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<Clock className="w-4 h-4" />} label="Tổng thời gian học" value={`${totalHours} giờ`} />
            <StatCard icon={<CheckSquare className="w-4 h-4" />} label="Task hoàn thành" value={`${completedTasks} tasks`} />
            <StatCard icon={<Brain className="w-4 h-4" />} label="Độ tập trung TB" value={`${Math.round(avgFocus)}%`} />
            <StatCard icon={<Zap className="w-4 h-4" />} label="Hiệu suất TB" value={`${Math.round(avgPerformance)}%`} />
          </div>

          <div className={cn(glassCard, "p-5 flex-1 flex flex-col overflow-hidden")}> 
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">{chartTitle}</h3>
              <div className="flex gap-1">
                <ChartTabButton active={viewMode === "day"} onClick={() => setViewMode("day")} label="Ngày" />
                <ChartTabButton active={viewMode === "week"} onClick={() => setViewMode("week")} label="Tuần" />
                <ChartTabButton active={viewMode === "month"} onClick={() => setViewMode("month")} label="Tháng" />
              </div>
            </div>
            <div className="flex-1 min-h-0">
              {chartDataToShow && chartDataToShow.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartDataToShow}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.45)" fontSize={11} tick={{ fill: "rgba(255,255,255,0.7)" }} />
                    <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.45)" fontSize={11} tick={{ fill: "rgba(255,255,255,0.7)" }} />
                    <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "white", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="focus" stroke="#60a5fa" strokeWidth={2.5} dot={{ fill: "#60a5fa", r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/60 text-sm">Chưa có dữ liệu</div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}

// Helper Components
function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={cn("px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all font-medium text-sm", active ? "bg-white/20 text-white border border-white/30" : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10")}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ChartTabButton({ active, onClick, label }: any) {
  return (
    <button onClick={onClick} className={cn("px-2.5 py-1 rounded-md transition-all font-medium text-xs", active ? "bg-white/20 text-white" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70")}>
      {label}
    </button>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className={cn(glassCard, "p-3.5")}>
      <div className="flex items-center gap-2 mb-2 text-white/70">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
