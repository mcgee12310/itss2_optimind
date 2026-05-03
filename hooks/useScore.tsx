"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	useRef,
	ReactNode,
} from "react";

// === Hệ thống điểm ===
// Điểm tích theo thời gian tập trung thực sự (chỉ tính khi đang focus, không tính break)
// 1 điểm / 30 giây tập trung
// Bonus khi hoàn thành Pomodoro cycle

export interface ScoreStats {
	totalPoints: number;
	totalFocusSeconds: number; // tổng giây đã tập trung phiên này
	currentStreak: number; // chuỗi phiên liên tiếp (session-level)
	completedPomodoros: number;
	level: number; // cấp độ (mỗi 500 điểm lên 1 cấp)
	levelName: string;
}

interface ScoreContextType {
	stats: ScoreStats;
	addFocusSeconds: (seconds: number) => void;
	addPomodoroBonus: () => void;
	resetSession: () => void;
}

const POINTS_PER_30S = 1;
const POMODORO_BONUS = 25;

const LEVELS = [
	{ min: 0, name: "Người mới" },
	{ min: 100, name: "Học viên" },
	{ min: 300, name: "Tập trung" },
	{ min: 600, name: "Chuyên cần" },
	{ min: 1000, name: "Siêu tập trung" },
	{ min: 1500, name: "Bậc thầy" },
	{ min: 2500, name: "Huyền thoại" },
];

function getLevelInfo(points: number): { level: number; levelName: string } {
	let level = 0;
	let levelName = LEVELS[0].name;
	for (let i = 0; i < LEVELS.length; i++) {
		if (points >= LEVELS[i].min) {
			level = i;
			levelName = LEVELS[i].name;
		}
	}
	return { level, levelName };
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export function ScoreProvider({ children }: { children: ReactNode }) {
	const [stats, setStats] = useState<ScoreStats>(() => {
		const { level, levelName } = getLevelInfo(0);
		return {
			totalPoints: 0,
			totalFocusSeconds: 0,
			currentStreak: 0,
			completedPomodoros: 0,
			level,
			levelName,
		};
	});

	// Tích lũy giây tập trung → điểm
	const addFocusSeconds = useCallback((seconds: number) => {
		setStats((prev) => {
			const newFocusSecs = prev.totalFocusSeconds + seconds;
			// Mỗi 30 giây mới = +1 điểm
			const prevIntervals = Math.floor(prev.totalFocusSeconds / 30);
			const newIntervals = Math.floor(newFocusSecs / 30);
			const pointsEarned = (newIntervals - prevIntervals) * POINTS_PER_30S;
			const newPoints = prev.totalPoints + pointsEarned;
			const { level, levelName } = getLevelInfo(newPoints);
			return {
				...prev,
				totalFocusSeconds: newFocusSecs,
				totalPoints: newPoints,
				level,
				levelName,
			};
		});
	}, []);

	// Bonus khi hoàn thành 1 chu kỳ Pomodoro focus
	const addPomodoroBonus = useCallback(() => {
		setStats((prev) => {
			const newPoints = prev.totalPoints + POMODORO_BONUS;
			const { level, levelName } = getLevelInfo(newPoints);
			return {
				...prev,
				totalPoints: newPoints,
				completedPomodoros: prev.completedPomodoros + 1,
				level,
				levelName,
			};
		});
	}, []);

	const resetSession = useCallback(() => {
		const { level, levelName } = getLevelInfo(0);
		setStats({
			totalPoints: 0,
			totalFocusSeconds: 0,
			currentStreak: 0,
			completedPomodoros: 0,
			level,
			levelName,
		});
	}, []);

	return (
		<ScoreContext.Provider value={{ stats, addFocusSeconds, addPomodoroBonus, resetSession }}>
			{children}
		</ScoreContext.Provider>
	);
}

export function useScore() {
	const ctx = useContext(ScoreContext);
	if (!ctx) throw new Error("useScore must be inside ScoreProvider");
	return ctx;
}

// Hook tiện ích — tự động tích điểm mỗi giây khi isRunning=true và isFocusMode=true
export function useFocusScoring(isRunning: boolean, isFocusMode: boolean) {
	const { addFocusSeconds } = useScore();
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		if (isRunning && isFocusMode) {
			intervalRef.current = setInterval(() => {
				addFocusSeconds(1);
			}, 1000);
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		}
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isRunning, isFocusMode, addFocusSeconds]);
}
