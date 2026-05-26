// Tên file: app/components/FocusChartWidget.tsx
"use client";

import React, { FC, useEffect, useRef, useState } from "react";
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
	focus: number;
}

const glassEffect =
	"bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg";

interface FocusChartWidgetProps {
	isRunning: boolean;
	currentFocusScore?: number;
}


const FocusChartWidget: FC<FocusChartWidgetProps> = ({ isRunning, currentFocusScore }) => {
	const [focusData, setFocusData] = useState<FocusDataPoint[]>([]);
	const startTimeRef = useRef<number | null>(null);
	const currentFocus = focusData.length > 0 ? focusData[focusData.length - 1].focus : 0;
	const latestTime = focusData.length > 0 ? focusData[focusData.length - 1].time : 0;
	const windowStart = Math.max(0, latestTime - 59);
	const focusByTime = new Map<number, number>(
		focusData.map((point) => [point.time, point.focus])
	);
	const chartData: FocusDataPoint[] = Array.from({ length: 60 }, (_, i) => {
		const absTime = windowStart + i;
		return {
			time: i,
			focus: focusByTime.get(absTime) ?? 0,
		};
	});
	const visibleChartData = isRunning ? chartData : [];

	useEffect(() => {
		let focusInterval: NodeJS.Timeout | null = null;
		if (isRunning) {
			if (startTimeRef.current === null) {
				startTimeRef.current = Date.now();
				setFocusData([{ time: 0, focus: 0 }]);
			}
			focusInterval = setInterval(() => {
				const elapsedSec = Math.floor(
					(Date.now() - (startTimeRef.current as number)) / 1000
				);
				const nextFocus =
					typeof currentFocusScore === "number" ? currentFocusScore : 0;
				setFocusData((prev) => {
					const next = [...prev, { time: elapsedSec, focus: nextFocus }];
					const minTime = Math.max(0, elapsedSec - 59);
					return next.filter((point) => point.time >= minTime);
				});
			}, 1000);
		} else {
			startTimeRef.current = null;
			setFocusData([]);
		}
		return () => {
			if (focusInterval) clearInterval(focusInterval);
		};
	}, [isRunning, currentFocusScore]);

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
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default FocusChartWidget;
