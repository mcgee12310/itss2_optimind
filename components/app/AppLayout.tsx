"use client";

import ScoreWidget from "@/components/app/score-widget";
import { ScoreProvider } from "@/hooks/useScore";
import React, { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_BACKGROUND = "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop";

const AppLayoutContent = ({ children }: { children: React.ReactNode }) => {
	const [isUiVisible, setIsUiVisible] = useState<boolean>(true);
	const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

	const resetUiTimer = useCallback(() => {
		setIsUiVisible(true);
		if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
		inactivityTimerRef.current = setTimeout(() => setIsUiVisible(false), 10000);
	}, []);

	useEffect(() => {
		window.addEventListener("mousemove", resetUiTimer);
		resetUiTimer();
		return () => {
			window.removeEventListener("mousemove", resetUiTimer);
			if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
		};
	}, [resetUiTimer]);

	return (
		<div
			className="h-screen w-screen text-white overflow-hidden"
			style={{
				backgroundImage: `url(${DEFAULT_BACKGROUND})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			{/* === Score Widget (góc trái — thay logo) === */}
			<ScoreWidget isUiVisible={isUiVisible} />

			{children}
		</div>
	);
};

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<ScoreProvider>
			<AppLayoutContent>{children}</AppLayoutContent>
		</ScoreProvider>
	);
}
