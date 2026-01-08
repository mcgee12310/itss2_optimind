"use client";

import DraggableCamera from "@/components/app/camera";
import UserHeader from "@/components/app/header";
import LogoHeader from "@/components/app/logo-header";
import NavSidebar from "@/components/app/sidebar";
import ControlToolbar from "@/components/app/toolbar";
import { CameraProvider } from "@/hooks/useCamera";
import { MusicProvider } from "@/hooks/useMusic";
import { DashboardStatsProvider, useDashboardStats } from "@/hooks/useDashboardStats";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

type NavPageId =
	| "/study"
	| "/chat"
	| "/study-room"
	| "/tasks"
	| "/calendar"
	| "/gamification"
	| "/history"
	| "/ranking";

// Component con để sử dụng hook
const AppLayoutContent = ({ children }: { children: React.ReactNode }) => {
	const [backgroundUrl, setBackgroundUrl] = useState<string>(
		"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop"
	);
	const activePage = usePathname() as NavPageId;
	const { stats, loading } = useDashboardStats();

	// MỚI: State cho việc ẩn/hiện UI
	const [isUiVisible, setIsUiVisible] = useState<boolean>(true);
	const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

	// --- MỚI: Logic ẩn/hiện UI ---
	const resetUiTimer = useCallback(() => {
		// 1. Hiển thị UI
		setIsUiVisible(true);

		// 2. Xóa timer cũ (nếu có)
		if (inactivityTimerRef.current) {
			clearTimeout(inactivityTimerRef.current);
		}

		// 3. Đặt timer mới để ẩn UI sau 5 giây
		inactivityTimerRef.current = setTimeout(() => {
			setIsUiVisible(false);
		}, 10000); // 5 giây
	}, []);

	// Effect để gắn listener cho mousemove
	useEffect(() => {
		// Gắn listener
		window.addEventListener("mousemove", resetUiTimer);

		// Bắt đầu timer ngay khi tải trang
		resetUiTimer();

		// Dọn dẹp
		return () => {
			window.removeEventListener("mousemove", resetUiTimer);
			if (inactivityTimerRef.current) {
				clearTimeout(inactivityTimerRef.current);
			}
		};
	}, [resetUiTimer]);

	return (
		<div>
			<MusicProvider>
				<CameraProvider>
					<div
						className="h-screen w-screen text-white transition-all duration-500 overflow-hidden"
						style={{
							backgroundImage: `url(${backgroundUrl})`,
							backgroundSize: "cover",
							backgroundPosition: "center",
						}}
					>
						{/* Logo Header */}
						<LogoHeader isUiVisible={isUiVisible} />
						{/* === 1. Sidebar Trái === */}
						<NavSidebar
							activePage={activePage}
							isUiVisible={isUiVisible}
						/>

						{/* === 2. Toolbar Phải === */}
						<ControlToolbar
							onChangeBackground={(url: string) =>
								setBackgroundUrl(url)
							}
							isUiVisible={isUiVisible}
						/>

						{/* === 3. Header Người dùng === */}
						<UserHeader
							streak={stats.streak}
							studyHoursToday={stats.studyHoursToday}
							isUiVisible={isUiVisible}
						/>

						{/* === 4. Camera Di động === */}
						<DraggableCamera />
						{children}
					</div>
				</CameraProvider>
			</MusicProvider>
		</div>
	);
};

// Component chính bọc Provider
export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<DashboardStatsProvider>
			<AppLayoutContent>{children}</AppLayoutContent>
		</DashboardStatsProvider>
	);
}
