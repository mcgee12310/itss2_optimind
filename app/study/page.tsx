"use client";

import { useState, useEffect, useRef, FC } from "react";
import { cn } from "@/lib/utils";
import { useDashboardStats } from "@/hooks/useDashboardStats";

import PomodoroTimer from "@/components/study/timer";
import TaskListWidget from "@/components/study/task-list";
import FocusChartWidget from "@/components/study/focus-chart";
import VideoEngagementAnalyzer from "@/hooks/use-engagement-analyzer";

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

  return (
    <main className="h-screen w-screen text-white p-6 transition-all duration-500 overflow-hidden">
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
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px]",
            "flex flex-col items-center justify-between gap-8"
          )}
        >
          {/* Widget 1: Timer */}
          <PomodoroTimer
            showTasks={showTasks}
            onToggleTasks={() => setShowTasks(!showTasks)}
            isRunning={isRunning}
            setIsRunning={setIsRunning}
          />

          <div className="flex gap-6 w-full h-80 justify-between">
            {/* Widget 2: Task List */}
            <TaskListWidget
              show={showTasks}
              onClose={() => setShowTasks(false)}
            />

            {/* Widget 3: Chart */}
            <FocusChartWidget 
              isRunning={isRunning}
              currentFocusScore={currentFocusScore}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default StudyPage;