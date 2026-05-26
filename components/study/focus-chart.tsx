// Tên file: app/components/FocusChartWidget.tsx
"use client";

import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

export interface FocusDataPoint {
	time: number;
	focus: number | null;
}

interface FocusSample {
	score: number;
	ts: number;
}

const glassEffect =
	"bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg";

interface FocusChartWidgetProps {
	isRunning: boolean;
	sample?: FocusSample | null;
}


const FocusChartWidget: FC<FocusChartWidgetProps> = ({ isRunning, sample }) => {
	const [focusBySecond, setFocusBySecond] = useState<Map<number, number>>(new Map());
	const [latestSecond, setLatestSecond] = useState<number>(0);
	const sessionStartTsRef = useRef<number | null>(null);

	const currentFocus = useMemo(() => {
		const value = focusBySecond.get(latestSecond);
		return typeof value === "number" ? value : 0;
	}, [focusBySecond, latestSecond]);

	useEffect(() => {
		if (!isRunning) {
			sessionStartTsRef.current = null;
			setFocusBySecond(new Map());
			setLatestSecond(0);
			return;
		}
		if (!sample) return;

		if (sessionStartTsRef.current === null) {
			sessionStartTsRef.current = sample.ts;
		}

		const second = Math.max(
			0,
			Math.floor((sample.ts - sessionStartTsRef.current) / 1000)
		);
		setLatestSecond(second);
		setFocusBySecond((prev) => {
			const next = new Map(prev);
			next.set(second, sample.score);
			const minSecond = Math.max(0, second - 59);
			for (const key of next.keys()) {
				if (key < minSecond) next.delete(key);
			}
			return next;
		});
	}, [isRunning, sample]);

	const windowStart = Math.max(0, latestSecond - 59);
	const chartData: FocusDataPoint[] = useMemo(() => {
		let carry: number | null = null;
		const data: FocusDataPoint[] = [];
		for (let i = 0; i < 60; i++) {
			const second = windowStart + i;
			const value = focusBySecond.get(second);
			if (typeof value === "number") carry = value;
			data.push({ time: i, focus: carry });
		}
		return data;
	}, [focusBySecond, windowStart]);

	return (
		<div className={cn("w-full h-full px-4 pt-3 flex flex-col", glassEffect)}>
			<div className="flex justify-between items-center mb-1">
				<p className="font-semibold text-gray-200">Độ tập trung</p>
				<p
					className="text-xl font-bold"
					style={{ color: currentFocus > 70 ? "#4ADE80" : "#F87171" }}
				>
					{currentFocus}%
				</p>
			</div>

			<div className="flex-1">
				<ResponsiveContainer width="100%" height="90%">
					<LineChart
						data={visibleChartData}
						margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
						<XAxis
							dataKey="time"
							type="number"
							domain={[0, 59]}
							ticks={[0, 10, 20, 30, 40, 50, 59]}
							stroke="#ffffff80"
							fontSize={10}
							tickLine={false}
							axisLine={false}
							tickFormatter={(val) => `${val}s`}
							tickMargin={10}
						/>
						<YAxis
							stroke="#ffffff80"
							fontSize={10}
							unit="%"
							domain={[0, 100]}
							tickLine={false}
							axisLine={false}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(0, 0, 0, 0.7)",
								border: "1px solid #ffffff44",
								borderRadius: "4px",
								color: "#fff",
							}}
							labelFormatter={(val) => `Thời gian: ${val}s`}
							formatter={(value) => [`${value}%`]}
						/>
						<Line
							type="monotone"
							dataKey="focus"
							stroke="#3b82f6"
							strokeWidth={2}
							dot={false}
							connectNulls={false}
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default FocusChartWidget;
