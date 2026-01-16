"use client";

import { useState, useEffect, useRef, FC } from "react";
import { cn } from "@/lib/utils";
import { useDashboardStats } from "@/hooks/useDashboardStats";

import PomodoroTimer from "@/components/study/timer";
import TaskListWidget from "@/components/study/task-list";
import FocusChartWidget from "@/components/study/focus-chart";
import VideoEngagementAnalyzer from "@/hooks/use-engagement-analyzer";
import { startSilentAudio, stopSilentAudio } from "@/lib/silent-audio";

const StudyPage: FC = () => {
  const [showTasks, setShowTasks] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentFocusScore, setCurrentFocusScore] = useState<number>(0);

  const focusLogsRef = useRef<number[]>([]);
  const { refreshStats } = useDashboardStats();


  useEffect(() => {
    const initSession = async () => {
      if (isRunning && !sessionId) {
        try {
          const res = await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              taskTitle: "Học tập trung",
              pomodoroCount: 1
            }),
          });

          if (res.ok) {
            const data = await res.json();
            setSessionId(data.session.id);
            console.log("Session started:", data.session.id);
          }
        } catch (error) {
          console.error("Failed to start session:", error);
        }
      }
    };

    initSession();
  }, [isRunning, sessionId]);

  useEffect(() => {
    return () => {
      if (sessionId) {
        const avgFocus = focusLogsRef.current.length > 0
          ? Math.round(focusLogsRef.current.reduce((a, b) => a + b, 0) / focusLogsRef.current.length)
          : 0;

        fetch(`/api/sessions/${sessionId}/end`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ focusScore: avgFocus }),
        })
          .then(() => {
            // Refresh dashboard stats sau khi kết thúc session
            refreshStats();
          })
          .catch(err => console.error("Error ending session:", err));
      }
    };
  }, [sessionId, refreshStats]);

  useEffect(() => {
    let logInterval: NodeJS.Timeout | null = null;

    if (isRunning && sessionId) {
      logInterval = setInterval(async () => {
        console.log("[Study] Logging focus score:", currentFocusScore);
        try {
          await fetch(`/api/sessions/${sessionId}/focus-log`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ score: currentFocusScore }),
          });
          focusLogsRef.current.push(currentFocusScore);
          console.log("[Study] Focus score logged successfully");
        } catch (err) {
          console.error("Failed to log focus score:", err);
        }
      }, 5000);
    }

    return () => {
      if (logInterval) clearInterval(logInterval);
    };
  }, [isRunning, sessionId, currentFocusScore]);

  // Start silent background audio to reduce throttling while session runs.
  useEffect(() => {
    if (isRunning) {
      // startSilentAudio may require a user gesture to resume audio context in some browsers
      startSilentAudio().catch(() => { });
    } else {
      stopSilentAudio();
    }

    return () => {
      stopSilentAudio();
    };
  }, [isRunning]);

  return (
    <main className="h-screen w-screen text-white p-6 overflow-hidden">
      <div className="relative w-full h-full">
        {/* === AI Camera Analysis (Hidden but active) === */}
        {isRunning && (
          <div style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            width: 1,
            height: 1,
            overflow: "hidden",
            zIndex: -1,
            pointerEvents: "none"
          }}>
            <VideoEngagementAnalyzer
              onScoreUpdate={setCurrentFocusScore}
              isActive={isRunning}
            />
          </div>
        )}

        {/* === Widgets === */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[900px] px-4",
            "flex flex-col items-center justify-between gap-4 md:gap-8"
          )}
        >
          {/* Live Score (mini) */}
          {/* <div className="absolute top-4 right-4 w-48 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-white z-20">
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  !isRunning ? "bg-gray-600 text-white" : currentFocusScore >= 65 ? "bg-green-500 text-white" : "bg-red-500 text-white"
                )}
              >
                {!isRunning ? "📷 Camera tắt" : currentFocusScore >= 65 ? "🎯 Đang tập trung" : "⚠️ Mất tập trung"}
              </div>
              <div className="text-lg font-bold">
                {isRunning ? `${Math.round(currentFocusScore)}%` : "--%"}
              </div>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  currentFocusScore >= 65 ? "bg-green-500" : "bg-red-500"
                )}
                style={{ width: isRunning ? `${Math.max(0, Math.min(100, currentFocusScore))}%` : "0%" }}
              />
            </div>

            <p className="mt-2 text-xs text-gray-300">
              {isRunning ? "AI phân tích đang chạy — dữ liệu được ghi cho session" : "Bắt đầu session để AI phân tích"}
            </p>
          </div> */}

          {/* Widget 1: Timer */}
          <PomodoroTimer
            showTasks={showTasks}
            onToggleTasks={() => setShowTasks(!showTasks)}
            isRunning={isRunning}
            setIsRunning={setIsRunning}
          />

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full h-auto md:h-80 justify-between pb-16 md:pb-0">
            {/* Widget 2: Task List */}
            <TaskListWidget
              show={showTasks}
              onClose={() => setShowTasks(false)}
            />

            {/* Widget 3: Chart */}
            <FocusChartWidget
              isRunning={isRunning}
              currentFocusScore={Math.max(0, Math.min(100, currentFocusScore))}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default StudyPage;