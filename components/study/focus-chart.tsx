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
	const currentFocus = focusData.length > 0 ? focusData[focusData.length - 1].focus : 0;

	useEffect(() => {
		let focusInterval: NodeJS.Timeout | null = null;
		if (isRunning) {
			focusInterval = setInterval(() => {
				setFocusData((prev) => [
					...prev,
					{ time: prev.length + 1, focus: typeof currentFocusScore === 'number' ? currentFocusScore : 0 },
				]);
			}, 1000);
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
						data={focusData}
						margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
						<XAxis
							dataKey="time"
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
