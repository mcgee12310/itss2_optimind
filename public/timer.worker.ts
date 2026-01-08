/**
 * Timer Web Worker
 * Chạy timer logic trên thread riêng, không bị block bởi main thread
 * Gửi tick events cho main thread để cập nhật UI
 */

interface TimerState {
  isRunning: boolean;
  timeRemaining: number; // seconds
  currentMode: "focus" | "break" | "longBreak";
  completedCycles: number;
  timerMode: "pomodoro" | "countdown";
}

interface WorkerConfig {
  focusTime: number; // phút
  breakTime: number; // phút
  longBreakTime: number; // phút
  cycles: number;
  countdownTime: number; // phút
}

let state: TimerState = {
  isRunning: false,
  timeRemaining: 25 * 60,
  currentMode: "focus",
  completedCycles: 0,
  timerMode: "pomodoro",
};

let config: WorkerConfig = {
  focusTime: 25,
  breakTime: 5,
  longBreakTime: 15,
  cycles: 4,
  countdownTime: 10,
};

let intervalId: NodeJS.Timeout | null = null;
let lastTickTime: number = Date.now();

/**
 * Chạy timer tick mỗi 100ms để đảm bảo độ chính xác cao
 */
function startTimer() {
  if (intervalId !== null) return;

  lastTickTime = Date.now();

  intervalId = setInterval(() => {
    const now = Date.now();
    const deltaMs = now - lastTickTime;
    lastTickTime = now;

    // Tính số giây đã qua
    const deltaSeconds = Math.floor(deltaMs / 1000);

    if (deltaSeconds > 0) {
      state.timeRemaining -= deltaSeconds;

      // Gửi tick event tới main thread
      self.postMessage({
        type: "tick",
        timeRemaining: state.timeRemaining,
        currentMode: state.currentMode,
        completedCycles: state.completedCycles,
      });

      // Nếu timer kết thúc
      if (state.timeRemaining <= 0) {
        state.timeRemaining = 0;
        handleTimerComplete();
      }
    }
  }, 100); // Check mỗi 100ms để bắt kịp drift
}

function stopTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
    lastTickTime = Date.now();
  }
}

function handleTimerComplete() {
  stopTimer();

  self.postMessage({
    type: "complete",
    currentMode: state.currentMode,
    completedCycles: state.completedCycles,
  });

  if (state.timerMode === "pomodoro") {
    if (state.currentMode === "focus") {
      const newCompleted = state.completedCycles + 1;
      if (newCompleted >= config.cycles) {
        state.currentMode = "longBreak";
        state.timeRemaining = config.longBreakTime * 60;
        state.completedCycles = 0;
      } else {
        state.currentMode = "break";
        state.timeRemaining = config.breakTime * 60;
        state.completedCycles = newCompleted;
      }
    } else {
      state.currentMode = "focus";
      state.timeRemaining = config.focusTime * 60;
    }
  }
}

/**
 * Message handler từ main thread
 */
self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data;

  switch (type) {
    case "start":
      state.isRunning = true;
      startTimer();
      break;

    case "pause":
      state.isRunning = false;
      stopTimer();
      break;

    case "reset":
      stopTimer();
      state.isRunning = false;
      state.currentMode = "focus";
      state.completedCycles = 0;
      if (state.timerMode === "pomodoro") {
        state.timeRemaining = config.focusTime * 60;
      } else {
        state.timeRemaining = config.countdownTime * 60;
      }
      self.postMessage({
        type: "reset",
        timeRemaining: state.timeRemaining,
        currentMode: state.currentMode,
        completedCycles: state.completedCycles,
      });
      break;

    case "setConfig":
      config = payload;
      break;

    case "setMode":
      state.timerMode = payload.mode;
      state.isRunning = false;
      stopTimer();
      state.currentMode = "focus";
      state.completedCycles = 0;
      if (payload.mode === "pomodoro") {
        state.timeRemaining = config.focusTime * 60;
      } else {
        state.timeRemaining = config.countdownTime * 60;
      }
      self.postMessage({
        type: "modeChanged",
        timeRemaining: state.timeRemaining,
        currentMode: state.currentMode,
        completedCycles: state.completedCycles,
      });
      break;

    case "getState":
      self.postMessage({
        type: "state",
        state: {
          timeRemaining: state.timeRemaining,
          currentMode: state.currentMode,
          completedCycles: state.completedCycles,
          isRunning: state.isRunning,
        },
      });
      break;

    default:
      console.warn(`[TimerWorker] Unknown message type: ${type}`);
  }
};
