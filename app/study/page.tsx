"use client";

import { useState, FC } from "react";
import { cn } from "@/lib/utils";
import { useFocusScoring } from "@/hooks/useScore";
import { useRef, useCallback, useState as useReactState } from "react";

import PomodoroTimer from "@/components/study/timer";
import TaskListWidget from "@/components/study/task-list";
import FocusChartWidget from "@/components/study/focus-chart";
import CameraWidget from "@/components/study/camera-widget";

type FocusSample = { score: number; ts: number };

const StudyPage: FC = () => {
  const [showTasks, setShowTasks] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(true);
  const [focusScore, setFocusScore] = useReactState<number>(0);
  const [focusSample, setFocusSample] = useReactState<FocusSample | null>(null);

  useFocusScoring(isRunning, isFocusMode);

  // Callback to receive score from camera
  const handleScoreUpdate = useCallback((sample: FocusSample) => {
    setFocusScore(sample.score);
    setFocusSample(sample);
  }, []);

  return (
    <main className="h-screen w-screen text-white p-6 overflow-hidden">
      <div className="relative w-full h-full">
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[900px] px-4",
            "flex flex-col items-center justify-between gap-4 md:gap-8"
          )}
        >
          {/* Widget 1: Timer + Camera cùng hàng */}
          <div className="flex flex-row items-center gap-4">
            <PomodoroTimer
              showTasks={showTasks}
              onToggleTasks={() => setShowTasks(!showTasks)}
              isRunning={isRunning}
              setIsRunning={setIsRunning}
              onFocusModeChange={setIsFocusMode}
            />
            <CameraWidget onScoreUpdate={handleScoreUpdate} />
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full h-auto md:h-80 justify-between pb-16 md:pb-0">
            {/* Widget 2: Task List */}
            <TaskListWidget
              show={showTasks}
              onClose={() => setShowTasks(false)}
            />

            {/* Widget 3: Chart */}
            <FocusChartWidget
              isRunning={isRunning}
              sample={focusSample}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default StudyPage;
