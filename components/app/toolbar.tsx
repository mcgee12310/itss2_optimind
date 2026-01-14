// Tên file: app/components/ControlToolbar.tsx
"use client";

import React, { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
// MỚI: Import Dialog components
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
	Video,
	VideoOff,
	Music,
	Waves,
	Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCamera } from "@/hooks/useCamera";
import { useMusicContext } from "@/hooks/useMusic";
import BackgroundSelector from "./background-selector";
import MusicPlayer from "./music-selector";

// MỚI: Import các Widget Popup (Giả định đã có)

// Hàm tiện ích
const glassEffect =
	"bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg";

// Danh sách ảnh nền (chỉ để lấy currentBg, logic chính trong BackgroundSelector)
const backgrounds = [
	"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop",
];

// Định nghĩa Props
interface ControlToolbarProps {
	onChangeBackground: (url: string) => void;
	isUiVisible: boolean;
}

// Định nghĩa kiểu cho một Nút
type ToolbarButtonType = {
	id: string;
	label: string;
	icon: React.ReactNode;
	className: string;
	onClick: () => void;
};

// Component con cho Nút (để tái sử dụng Tooltip)
const ToolbarButton: FC<ToolbarButtonType> = ({
	label,
	icon,
	className,
	onClick,
}) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<Button
				onClick={onClick}
				variant="ghost"
				size="icon"
				className={cn(
					"h-12 w-12 rounded-full hover:bg-white/20",
					className
				)}
			>
				{icon}
			</Button>
		</TooltipTrigger>
		<TooltipContent side="left">
			<p>{label}</p>
		</TooltipContent>
	</Tooltip>
);

// Component Toolbar Chính
const ControlToolbar: FC<ControlToolbarProps> = ({
	onChangeBackground,
	isUiVisible,
}) => {
	const { isWidgetVisible, setIsWidgetVisible } = useCamera(); // Lấy context camera
	const { isPlaying, isPlayerVisible, togglePlayerVisibility } =
		useMusicContext();

	// State quản lý Background Selector (vẫn cục bộ)
	const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
	const [currentFilter, setCurrentFilter] = useState<"MP3" | "YouTube">("MP3");

	// Lấy URL nền hiện tại (Giả lập)
	const [currentBg, setCurrentBg] = useState(backgrounds[0]);

	// Xử lý chung cho Background
	const handleBackgroundChange = (url: string) => {
		onChangeBackground(url); // Cập nhật background trong Layout
		setCurrentBg(url); // Cập nhật state cục bộ
	};

	// MỚI: Hàm xử lý toggle chung (Đã sửa lỗi tham chiếu)
	const handleToggleWidget = (
		widgetId: "music" | "background" | "camera" | "sound"
	) => {
		if (widgetId === "music") {
			setCurrentFilter("MP3");
			togglePlayerVisibility(true); // Luôn mở
			setShowBackgroundSelector(false); // Đóng cái khác
		} else if (widgetId === "sound") {
			setCurrentFilter("YouTube");
			togglePlayerVisibility(true); // Luôn mở
			setShowBackgroundSelector(false);
		} else if (widgetId === "background") {
			setShowBackgroundSelector((prev) => !prev);
			togglePlayerVisibility(false); // Đóng cái khác
		} else if (widgetId === "camera") {
			setIsWidgetVisible(!isWidgetVisible); // MỚI: Chỉ ẩn/hiện widget
			setShowBackgroundSelector(false);
			togglePlayerVisibility(false);
		}
	};

	// Tạo mảng dữ liệu cho các nút
	const toolbarButtons: ToolbarButtonType[] = [
		{
			id: "camera",
			// Hiển thị trạng thái widget (có đang hiển thị trên màn hình không)
			label: isWidgetVisible ? "Ẩn Camera" : "Hiện Camera",
			icon: isWidgetVisible ? (
				<VideoOff className="h-6 w-6" />
			) : (
				<Video className="h-6 w-6" />
			),
			// Màu sắc chỉ báo cam đang active (stream đang chạy)
			className: isWidgetVisible ? "text-blue-300" : "text-white",
			onClick: () => handleToggleWidget("camera"),
		},
		{
			id: "music",
			label: "Nhạc nền",
			icon: <Music className="h-6 w-6" />,
			className:
				isPlaying || isPlayerVisible
					? "text-yellow-400 bg-white/20"
					: "text-white",
			onClick: () => handleToggleWidget("music"),
		},
		{
			id: "waves",
			label: "Âm thanh",
			icon: <Waves className="h-6 w-6" />,
			className: "text-white",
			onClick: () => handleToggleWidget("sound"),
		},
		{
			id: "background",
			label: "Đổi hình nền",
			icon: <ImageIcon className="h-6 w-6" />,
			className: showBackgroundSelector
				? "text-blue-300 bg-white/20"
				: "text-white",
			onClick: () => handleToggleWidget("background"),
		},
	];

	return (
		<TooltipProvider>
			<div
				className={cn(
					// Mobile: bottom right, above the bottom nav bar
					"fixed right-2 bottom-16 flex flex-row gap-2 p-2 z-30",
					// Desktop: right side, vertical centered
					"md:absolute md:right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:flex-col md:gap-3 md:p-3",
					glassEffect,
					"transition-all duration-300 ease-in-out",
					isUiVisible
						? "opacity-100 translate-x-0"
						: "opacity-0 translate-x-full"
				)}
			>
				{/* Dùng .map() để render các nút */}
				{toolbarButtons.map((button) => (
					<ToolbarButton
						key={button.id}
						id={button.id}
						label={button.label}
						icon={button.icon}
						className={button.className}
						onClick={button.onClick}
					/>
				))}
			</div>

			{/* === WIDGET POPUP (ĐỔI HÌNH NỀN) === */}
			{showBackgroundSelector && (
				<BackgroundSelector
					currentBackground={currentBg}
					onChange={handleBackgroundChange}
					onClose={() => setShowBackgroundSelector(false)}
				/>
			)}

			{/* === WIDGET POPUP (NGHE NHẠC) === */}
			<MusicPlayer filterType={currentFilter} />
		</TooltipProvider>
	);
};

export default ControlToolbar;
