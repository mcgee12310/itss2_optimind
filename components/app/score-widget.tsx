"use client";

import React, { FC, useState, useEffect, useRef } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScore } from "@/hooks/useScore";

const glassEffect =
	"bg-black/40 backdrop-blur-md border border-white/20 rounded-xl shadow-lg";

interface ScoreWidgetProps {
	isUiVisible: boolean;
}

const ScoreWidget: FC<ScoreWidgetProps> = ({ isUiVisible }) => {
	const { stats } = useScore();
	const [showBonus, setShowBonus] = useState(false);
	const prevPointsRef = useRef(stats.totalPoints);

	// Flash animation khi điểm tăng
	useEffect(() => {
		if (stats.totalPoints > prevPointsRef.current) {
			setShowBonus(true);
			const t = setTimeout(() => setShowBonus(false), 800);
			prevPointsRef.current = stats.totalPoints;
			return () => clearTimeout(t);
		}
		prevPointsRef.current = stats.totalPoints;
	}, [stats.totalPoints]);

	return (
		<div
			className={cn(
				"absolute top-2 left-2 z-30",
				glassEffect,
				"transition-all duration-300 ease-in-out",
				"flex items-center gap-2 px-4 py-2",
				isUiVisible
					? "opacity-100 translate-y-0"
					: "opacity-0 -translate-y-full pointer-events-none"
			)}
		>
			<Zap
				className={cn(
					"w-5 h-5 transition-colors duration-300",
					showBonus ? "text-yellow-300" : "text-white/70"
				)}
			/>
			<span
				className={cn(
					"text-2xl font-extrabold tracking-tight transition-all duration-300",
					showBonus ? "text-yellow-300 scale-110" : "text-white"
				)}
			>
				{stats.totalPoints}
			</span>
			<span className="text-sm text-white/50 font-medium">điểm</span>
		</div>
	);
};

export default ScoreWidget;
