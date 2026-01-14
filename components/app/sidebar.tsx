// Tên file: app/components/NavSidebar.tsx
"use client";

import React, { FC } from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	LayoutDashboard, // study
	MessageSquare, // chat
	Users, // study-room
	CheckSquare, // task
	Calendar, // calendar
	Star, // gamification
	History, // history
	Trophy, // ranking
	// GHI CHÚ: Đã xóa User và Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link"; // Dùng Link của Next.js

// Hàm tiện ích
const glassEffect =
	"bg-black/40 backdrop-blur-md border border-white/20 rounded-lg shadow-lg";

// --- CẬP NHẬT: Định nghĩa Type cho các ID trang ---
type NavPageId =
	| "/study"
	| "/chat"
	| "/study-room"
	| "/tasks"
	| "/calendar"
	| "/gamification"
	| "/history"
	| "/ranking";

// Định nghĩa Props
interface NavSidebarProps {
	activePage: NavPageId;
	isUiVisible: boolean; // MỚI: Thêm prop
}

// --- MỚI: Tạo mảng dữ liệu cho các Nav Items ---
const navItemsList = [
	{
		id: "dashboard" as NavPageId,
		href: "/study",
		label: "Trang chủ (Học)",
		icon: <LayoutDashboard className="h-7 w-7" />,
	},
	{
		id: "chat" as NavPageId,
		href: "/chat",
		label: "Chat",
		icon: <MessageSquare className="h-7 w-7" />,
	},
	{
		id: "rooms" as NavPageId,
		href: "/rooms",
		label: "Phòng học",
		icon: <Users className="h-7 w-7" />,
	},
	{
		id: "tasks" as NavPageId,
		href: "/tasks",
		label: "Kế hoạch (Tasks)",
		icon: <CheckSquare className="h-7 w-7" />,
	},
	{
		id: "calendar" as NavPageId,
		href: "/calendar",
		label: "Lịch",
		icon: <Calendar className="h-7 w-7" />,
	},
	{
		id: "gamification" as NavPageId,
		href: "/gamification",
		label: "Phần thưởng (Pet)",
		icon: <Star className="h-7 w-7" />,
	},
	{
		id: "history" as NavPageId,
		href: "/history",
		label: "Lịch sử học tập",
		icon: <History className="h-7 w-7" />,
	},
	{
		id: "ranking" as NavPageId,
		href: "/ranking",
		label: "Xếp hạng",
		icon: <Trophy className="h-7 w-7" />,
	},
];

// Component NavItem (Giữ nguyên)
const NavItem: FC<{
	href: string;
	icon: React.ReactNode;
	label: string;
	isActive: boolean;
}> = ({ href, icon, label, isActive }) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<Button
				asChild
				variant={isActive ? "secondary" : "ghost"} // 'secondary' là style active
				size="icon"
				className={cn(
					"h-11 w-11 rounded-full",
					isActive
						? "bg-white/20 text-white"
						: "text-gray-300 hover:bg-white/20 hover:text-white"
				)}
			>
				<Link href={href}>{icon}</Link>
			</Button>
		</TooltipTrigger>
		<TooltipContent side="right">
			<p>{label}</p>
		</TooltipContent>
	</Tooltip>
);

// Component Sidebar Chính
export default function NavSidebar({
	activePage,
	isUiVisible,
}: NavSidebarProps) {
	return (
		<TooltipProvider>
			<nav
				className={cn(
					// Mobile: bottom horizontal bar
					"fixed bottom-0 left-0 right-0 flex flex-row justify-around p-2 z-30",
					// Desktop: vertical sidebar
					"md:absolute md:left-2 md:top-15 md:bottom-auto md:right-auto md:flex-col md:gap-2 md:p-2 md:justify-start",
					glassEffect,
					// MỚI: Thêm hiệu ứng ẩn/hiện
					"transition-all duration-300 ease-in-out",
					isUiVisible
						? "opacity-100 translate-y-0 md:translate-x-0"
						: "opacity-0 translate-y-full md:translate-y-0 md:-translate-x-full"
				)}
			>
				{/* --- CẬP NHẬT: Dùng .map() để render --- */}
				{navItemsList.map((item) => (
					<NavItem
						key={item.id}
						href={item.href}
						icon={item.icon}
						label={item.label}
						isActive={activePage === item.href}
					/>
				))}
			</nav>
		</TooltipProvider>
	);
}
