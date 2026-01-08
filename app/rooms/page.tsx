
// "use client";

// import { useState, useEffect, FC } from "react";
// import { useRouter } from "next/navigation";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { cn } from "@/lib/utils";
// import { Users, Lock, LogIn, Plus, Unlock } from "lucide-react";

// // --- Định nghĩa Types ---
// export interface Room {
// 	id: string;
// 	name: string;
// 	hostId?: string;
// 	hostName?: string;
// 	maxMembers: number;
// 	members?: any[];
// 	isPrivate: boolean; // Field này giờ sẽ luôn đúng từ API
// 	createdAt: string;
// 	_count?: { members: number };
// }

// // --- Component Chính ---
// const StudyRoomPage: FC = () => {
// 	const router = useRouter();
// 	const [rooms, setRooms] = useState<Room[]>([]);
// 	const [loading, setLoading] = useState(true);
// 	const [isCreatingRoom, setIsCreatingRoom] = useState(false);

// 	// State tạo phòng
// 	const [newRoomName, setNewRoomName] = useState("");
// 	const [newRoomType, setNewRoomType] = useState<"STUDY" | "BATTLE">("STUDY");
// 	const [newRoomMax, setNewRoomMax] = useState(4);
// 	const [newRoomPassword, setNewRoomPassword] = useState("");

// 	// State tham gia phòng
// 	const [joinRoomId, setJoinRoomId] = useState<string | null>(null);
// 	const [joinPassword, setJoinPassword] = useState("");

// 	useEffect(() => {
// 		fetchRooms();
// 	}, []);

// 	const fetchRooms = async () => {
// 		try {
// 			setLoading(true);
// 			const res = await fetch("/api/rooms", { cache: "no-store" });
// 			if (res.ok) {
// 				const data = await res.json();
// 				setRooms(data.rooms);
// 			}
// 		} catch (error) {
// 			console.error("Failed to fetch rooms:", error);
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const handleCreateRoom = async () => {
// 		if (!newRoomName.trim()) {
// 			alert("Vui lòng nhập tên phòng");
// 			return;
// 		}
// 		try {
// 			const res = await fetch("/api/rooms", {
// 				method: "POST",
// 				headers: { "Content-Type": "application/json" },
// 				body: JSON.stringify({
// 					name: newRoomName,
// 					type: newRoomType,
// 					maxMembers: newRoomMax,
// 					password: newRoomPassword || undefined,
// 				}),
// 			});

// 			if (res.ok) {
// 				const data = await res.json();
// 				if (data.room) {
// 					setRooms([data.room, ...rooms]); // Thêm vào đầu danh sách
// 					setNewRoomName("");
// 					setNewRoomType("STUDY");
// 					setNewRoomMax(4);
// 					setNewRoomPassword("");
// 					setIsCreatingRoom(false);
// 					router.push(`/rooms/room/${data.room.id}`);
// 				}
// 			} else {
// 				const error = await res.json();
// 				alert(`Lỗi: ${error.error}`);
// 			}
// 		} catch (error) {
// 			console.error("Failed to create room:", error);
// 			alert("Không thể tạo phòng");
// 		}
// 	};

// 	const handleJoinRoom = async (roomId: string) => {
// 		try {
// 			const res = await fetch(`/api/rooms/${roomId}/join`, {
// 				method: "POST",
// 				headers: { "Content-Type": "application/json" },
// 				body: JSON.stringify({
// 					password: joinPassword,
// 				}),
// 			});

// 			const data = await res.json();

// 			if (res.ok || data.success) {
// 				setJoinRoomId(null);
// 				setJoinPassword("");
// 				router.push(`/rooms/room/${roomId}`);
// 			} else {
// 				alert(`Lỗi: ${data.error}`);
// 			}
// 		} catch (error) {
// 			console.error("Failed to join room:", error);
// 			alert("Không thể tham gia phòng");
// 		}
// 	};

// 	const glassEffect = "bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg";

// 	return (
// 		<TooltipProvider>
// 			<main className="min-h-screen w-screen text-white transition-all duration-500 overflow-auto">
// 				{/* Background Image */}
// 				<div
// 					className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat -z-10"
// 					style={{
// 						backgroundImage: "url('https://i.pinimg.com/1200x/9e/23/f0/9e23f0e8bacb5f03ad6418a3bdd1727b.jpg')",
// 					}}
// 				/>

// 				{/* Content Container */}
// 				<div className="relative w-full min-h-screen px-6 py-24 md:px-12 lg:px-24">
// 					{/* Header */}
// 					<div className="max-w-7xl mx-auto mb-12">
// 						<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
// 							<div>
// 								<h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
// 									Phòng Học
// 								</h1>
// 								<p className="text-lg text-white/90" style={{ textShadow: "0 1px 5px rgba(0,0,0,0.3)" }}>
// 									Học tập cùng mọi người
// 								</p>
// 							</div>
// 							<Dialog open={isCreatingRoom} onOpenChange={setIsCreatingRoom}>
// 								<DialogTrigger asChild>
// 									<Button className="gap-2 bg-white/90 text-black hover:bg-white shadow-lg px-6 py-6 text-base font-semibold backdrop-blur-sm">
// 										<Plus className="w-5 h-5" /> Tạo Phòng Mới
// 									</Button>
// 								</DialogTrigger>
// 								<DialogContent className={glassEffect}>
// 									<DialogHeader>
// 										<DialogTitle className="text-2xl font-bold">Tạo Phòng Học Mới</DialogTitle>
// 									</DialogHeader>
// 									<div className="space-y-5 py-2">
// 										<div className="space-y-2">
// 											<Label htmlFor="room-name" className="text-white">Tên Phòng</Label>
// 											<Input
// 												id="room-name"
// 												value={newRoomName}
// 												onChange={(e) => setNewRoomName(e.target.value)}
// 												placeholder="VD: Phòng học nhóm Web..."
// 												className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
// 											/>
// 										</div>
// 										<div className="space-y-2">
// 											<Label htmlFor="room-type" className="text-white">Loại Phòng</Label>
// 											<select
// 												id="room-type"
// 												value={newRoomType}
// 												onChange={(e) => setNewRoomType(e.target.value as "STUDY" | "BATTLE")}
// 												className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
// 											>
// 												<option value="STUDY" className="bg-gray-900">📚 Phòng Học Tập</option>
// 												<option value="BATTLE" className="bg-gray-900">⚔️ Phòng Thi Đấu</option>
// 											</select>
// 										</div>
// 										<div className="space-y-2">
// 											<Label htmlFor="room-max" className="text-white">Số Thành Viên Tối Đa</Label>
// 											<Input
// 												id="room-max"
// 												type="number"
// 												min="2"
// 												max="10"
// 												value={newRoomMax || ""}
// 												onChange={(e) => {
// 													const val = parseInt(e.target.value);
// 													setNewRoomMax(isNaN(val) ? 2 : Math.min(Math.max(val, 2), 10));
// 												}}
// 												className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
// 											/>
// 										</div>
// 										<div className="space-y-2">
// 											<Label htmlFor="room-password" className="text-white">Mật Khẩu (Tùy Chọn)</Label>
// 											<Input
// 												id="room-password"
// 												type="password"
// 												value={newRoomPassword}
// 												onChange={(e) => setNewRoomPassword(e.target.value)}
// 												placeholder="Để trống cho phòng công khai"
// 												className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
// 											/>
// 											<p className="text-xs text-white/60">
// 												💡 Nếu đặt mật khẩu, phòng sẽ trở thành riêng tư
// 											</p>
// 										</div>
// 										<Button onClick={handleCreateRoom} className="w-full mt-2 bg-white text-black hover:bg-gray-200">
// 											<Plus className="w-4 h-4 mr-2" />
// 											Tạo Phòng
// 										</Button>
// 									</div>
// 								</DialogContent>
// 							</Dialog>
// 						</div>
// 					</div>

// 					{/* Rooms Grid */}
// 					<div className="max-w-7xl mx-auto">
// 						{loading ? (
// 							<div className="flex items-center justify-center min-h-[400px]">
// 								<div className="text-center space-y-4">
// 									<div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent" />
// 									<p className="text-white/80 text-lg" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
// 										Đang tải danh sách phòng...
// 									</p>
// 								</div>
// 							</div>
// 						) : rooms.length === 0 ? (
// 							<div className={cn("min-h-[400px] flex items-center justify-center", glassEffect)}>
// 								<div className="py-16 text-center px-8">
// 									<Users className="w-24 h-24 mx-auto text-white/40 mb-6" />
// 									<h3 className="text-3xl font-bold mb-4">Chưa có phòng nào</h3>
// 									<p className="text-white/70 mb-8 max-w-md mx-auto text-lg">
// 										Hãy tạo phòng học đầu tiên để bắt đầu học tập và thi đấu cùng bạn bè!
// 									</p>
// 									<Button
// 										onClick={() => setIsCreatingRoom(true)}
// 										className="gap-2 bg-white/90 text-black hover:bg-white shadow-lg px-6 py-6 text-base font-semibold"
// 									>
// 										<Plus className="w-5 h-5" /> Tạo Phòng Ngay
// 									</Button>
// 								</div>
// 							</div>
// 						) : (
// 							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
// 								{rooms.map((room) => (
// 									<Card key={room.id} className={cn(
// 										glassEffect,
// 										"hover:shadow-2xl hover:border-white/40 hover:bg-white/20 transition-all duration-300 relative overflow-hidden group cursor-pointer"
// 									)}>
// 										{/* Badge Private/Public */}
// 										<div className="absolute top-3 right-3 z-10">
// 											{room.isPrivate ? (
// 												<Badge variant="destructive" className="gap-1 bg-red-500/80 backdrop-blur-sm shadow-lg border-0">
// 													<Lock className="w-3 h-3" /> Riêng tư
// 												</Badge>
// 											) : (
// 												<Badge variant="secondary" className="bg-green-500/30 backdrop-blur-sm text-green-100 border border-green-400/40 gap-1 shadow-lg">
// 													<Unlock className="w-3 h-3" /> Công khai
// 												</Badge>
// 											)}
// 										</div>

// 										<CardHeader className="pb-3">
// 											<div className="flex items-start justify-between pr-24">
// 												<CardTitle className="text-xl truncate group-hover:text-white transition-colors font-bold" title={room.name}>
// 													{room.name}
// 												</CardTitle>
// 											</div>
// 										</CardHeader>
// 										<CardContent className="space-y-5">
// 											<div className="space-y-3 pt-2">
// 												<div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
// 													<Users className="w-5 h-5 shrink-0 text-blue-300" />
// 													<div className="flex-1">
// 														<p className="text-sm text-white/60">Thành viên</p>
// 														<p className="font-bold text-lg">
// 															{room._count?.members ?? room.members?.length ?? 0} / {room.maxMembers}
// 														</p>
// 													</div>
// 												</div>
// 												<div className="flex items-center gap-2 text-sm">
// 													<div className="w-2 h-2 rounded-full bg-green-400"></div>
// 													<span className="text-white/60">Chủ phòng:</span>
// 													<span className="font-semibold text-white">{room.hostName || "Unknown"}</span>
// 												</div>
// 											</div>

// 											<Dialog open={joinRoomId === room.id} onOpenChange={(open) => {
// 												if (!open) {
// 													setJoinRoomId(null);
// 													setJoinPassword("");
// 												}
// 											}}>
// 												<DialogTrigger asChild>
// 													<Button
// 														onClick={() => setJoinRoomId(room.id)}
// 														disabled={(room._count?.members ?? 0) >= room.maxMembers}
// 														className={cn(
// 															"w-full gap-2 font-semibold transition-all",
// 															room.isPrivate
// 																? "bg-white/10 hover:bg-white/20 border border-white/30"
// 																: "bg-white/90 text-black hover:bg-white"
// 														)}
// 													>
// 														<LogIn className="w-4 h-4" />
// 														{room.isPrivate ? "Nhập mật khẩu" : "Tham Gia Ngay"}
// 													</Button>
// 												</DialogTrigger>
// 												<DialogContent className={glassEffect}>
// 													<DialogHeader>
// 														<DialogTitle className="text-2xl font-bold">Tham Gia: {room.name}</DialogTitle>
// 													</DialogHeader>

// 													<div className="py-6 space-y-5">
// 														{room.isPrivate ? (
// 															<div className="space-y-4">
// 																<div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg backdrop-blur-sm">
// 																	<Lock className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
// 																	<div>
// 																		<p className="font-semibold text-yellow-400 mb-1">Phòng riêng tư</p>
// 																		<p className="text-sm text-white/80">Phòng này yêu cầu mật khẩu để tham gia</p>
// 																	</div>
// 																</div>
// 																<div className="space-y-2">
// 																	<Label htmlFor="join-room-password" className="text-white">Mật khẩu phòng</Label>
// 																	<Input
// 																		id="join-room-password"
// 																		type="password"
// 																		value={joinPassword}
// 																		onChange={(e) => setJoinPassword(e.target.value)}
// 																		placeholder="Nhập mật khẩu..."
// 																		autoFocus
// 																		className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
// 																	/>
// 																</div>
// 															</div>
// 														) : (
// 															<div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg backdrop-blur-sm">
// 																<Users className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
// 																<div>
// 																	<p className="font-semibold text-blue-400 mb-1">Phòng công khai</p>
// 																	<p className="text-sm text-white/80">Bạn có thể tham gia ngay lập tức mà không cần mật khẩu</p>
// 																</div>
// 															</div>
// 														)}
// 													</div>

// 													<Button
// 														onClick={() => handleJoinRoom(room.id)}
// 														className="w-full bg-white/90 text-black hover:bg-white font-semibold"
// 													>
// 														<LogIn className="w-4 h-4 mr-2" />
// 														Xác Nhận Tham Gia
// 													</Button>
// 												</DialogContent>
// 											</Dialog>
// 										</CardContent>
// 									</Card>
// 								))}
// 							</div>
// 						)}
// 					</div>
// 				</div>
// 			</main>
// 		</TooltipProvider>
// 	);
// };

// export default StudyRoomPage;

"use client";

import { useState, useEffect, FC } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Users, Lock, LogIn, Plus } from "lucide-react";

// --- Định nghĩa Types ---
export interface Room {
    id: string;
    name: string;
    hostId: string;
    hostName?: string;
    maxMembers: number;
    members?: any[];
    isPrivate: boolean;
    createdAt: string;
}

export type RoomType = Room;

// --- Component Chính ---
const StudyRoomPage: FC = () => {
    const router = useRouter();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [newRoomType, setNewRoomType] = useState<"STUDY" | "BATTLE">("STUDY");
    const [newRoomMax, setNewRoomMax] = useState(4);
    const [newRoomPassword, setNewRoomPassword] = useState("");
    const [joinRoomId, setJoinRoomId] = useState<string | null>(null);
    const [joinPassword, setJoinPassword] = useState("");

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/rooms");
            if (res.ok) {
                const data = await res.json();
                setRooms(data.rooms);
            }
        } catch (error) {
            console.error("Failed to fetch rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async () => {
        if (!newRoomName.trim()) {
            alert("Vui lòng nhập tên phòng");
            return;
        }
        try {
            const res = await fetch("/api/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newRoomName,
                    type: newRoomType,
                    maxMembers: newRoomMax,
                    password: newRoomPassword || undefined,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.room) {
                    setRooms([...rooms, data.room]);
                    setNewRoomName("");
                    setNewRoomType("STUDY");
                    setNewRoomMax(4);
                    setNewRoomPassword("");
                    setIsCreatingRoom(false);
                    alert("Phòng tạo thành công!");
                    router.push(`/rooms/room/${data.room.id}`);
                }
            } else {
                const error = await res.json();
                alert(`Lỗi: ${error.error}`);
            }
        } catch (error) {
            console.error("Failed to create room:", error);
            alert("Không thể tạo phòng");
        }
    };

    const handleJoinRoom = async (roomId: string) => {
        try {
            const res = await fetch(`/api/rooms/${roomId}/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    password: joinPassword || undefined,
                }),
            });

            const data = await res.json();

            if (res.ok || data.success) {
                alert("Đã tham gia phòng thành công!");
                setJoinRoomId(null);
                setJoinPassword("");
                router.push(`/rooms/room/${roomId}`);
            } else {
                alert(`Lỗi: ${data.error}`);
            }
        } catch (error) {
            console.error("Failed to join room:", error);
            alert("Không thể tham gia phòng");
        }
    };

    // Tối ưu Glass Effect: nền đậm hơn một chút để tương phản tốt với chữ trắng
    const glassEffect = "bg-black/40 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl";

    return (
        <TooltipProvider>
            <main className="h-screen w-screen text-white p-6 transition-all duration-500 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">Phòng Học</h1>
                            <p className="text-gray-300 font-medium">Học tập cùng mọi người</p>
                        </div>
                        <Dialog open={isCreatingRoom} onOpenChange={setIsCreatingRoom}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg">
                                    <Plus className="w-4 h-4" /> Tạo Phòng Mới
                                </Button>
                            </DialogTrigger>
                            <DialogContent className={cn(glassEffect, "text-white border-white/30")}>
                                <DialogHeader>
                                    <DialogTitle className="text-xl text-white">Tạo Phòng Học Mới</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label className="text-white">Tên Phòng</Label>
                                        <Input
                                            value={newRoomName}
                                            onChange={(e) => setNewRoomName(e.target.value)}
                                            placeholder="Nhập tên phòng"
                                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white">Loại Phòng</Label>
                                        <select
                                            value={newRoomType}
                                            onChange={(e) => setNewRoomType(e.target.value as "STUDY" | "BATTLE")}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="STUDY" className="bg-slate-900">Phòng Học Tập</option>
                                            <option value="BATTLE" className="bg-slate-900">Phòng Thi Đấu</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white">Số Thành Viên Tối Đa</Label>
                                        <Input
                                            type="number"
                                            min="2"
                                            max="10"
                                            value={newRoomMax}
                                            onChange={(e) => setNewRoomMax(parseInt(e.target.value))}
                                            className="bg-white/10 border-white/20 text-white focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white">Mật Khẩu (Tùy Chọn)</Label>
                                        <Input
                                            type="password"
                                            value={newRoomPassword}
                                            onChange={(e) => setNewRoomPassword(e.target.value)}
                                            placeholder="Để trống nếu không cần"
                                            className="bg-white/10 border-white/20 text-white focus:border-indigo-500"
                                        />
                                    </div>
                                    <Button onClick={handleCreateRoom} className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2 shadow-md">
                                        Tạo Phòng
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Rooms Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    ) : rooms.length === 0 ? (
                        <Card className={cn(glassEffect, "border-dashed")}>
                            <CardContent className="py-16 text-center">
                                <Users className="w-16 h-16 mx-auto text-white/20 mb-4" />
                                <p className="text-gray-300 text-lg">Chưa có phòng học nào hoạt động.</p>
                                <p className="text-gray-400">Hãy là người đầu tiên tạo phòng!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rooms.map((room) => (
                                <Card key={room.id} className={cn(glassEffect, "group hover:bg-black/50 transition-all duration-300 border-white/10 hover:border-indigo-500/50")}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                                                {room.name}
                                            </CardTitle>
                                            {room.isPrivate ? (
                                                <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/10">
                                                    <Lock className="w-3 h-3 mr-1" /> Khóa
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                                                    Công khai
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center text-white/90">
                                                <Users className="w-4 h-4 mr-3 text-indigo-400" />
                                                <span className="text-sm font-semibold">
                                                    {room.members?.length || 0} <span className="text-white/60 font-normal">/</span> {room.maxMembers} thành viên
                                                </span>
                                            </div>
                                            {/* <div className="flex items-center text-white/90">
                                                <div className="w-4 h-4 mr-3 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                                </div>

                                            </div> */}
                                        </div>

                                        <Dialog open={joinRoomId === room.id} onOpenChange={(open) => {
                                            if (!open) setJoinRoomId(null);
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    onClick={() => setJoinRoomId(room.id)}
                                                    disabled={(room.members?.length || 0) >= room.maxMembers}
                                                    className={cn(
                                                        "w-full gap-2 font-bold shadow-md transition-all",
                                                        (room.members?.length || 0) >= room.maxMembers 
                                                        ? "bg-white/5 text-white/20" 
                                                        : "bg-white text-black hover:bg-indigo-500 hover:text-white"
                                                    )}
                                                >
                                                    <LogIn className="w-4 h-4" /> 
                                                    {(room.members?.length || 0) >= room.maxMembers ? "Phòng Đầy" : "Tham Gia Ngay"}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className={cn(glassEffect, "text-white border-white/30")}>
                                                <DialogHeader>
                                                    <DialogTitle className="text-white">Tham Gia Phòng: {room.name}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 pt-4">
                                                    {room.isPrivate && (
                                                        <div className="space-y-2">
                                                            <Label className="text-white">Mật Khẩu Truy Cập</Label>
                                                            <Input
                                                                type="password"
                                                                value={joinPassword}
                                                                onChange={(e) => setJoinPassword(e.target.value)}
                                                                placeholder="Nhập mật khẩu phòng"
                                                                className="bg-white/10 border-white/20 text-white focus:border-indigo-500"
                                                                autoFocus
                                                            />
                                                        </div>
                                                    )}
                                                    <Button
                                                        onClick={() => handleJoinRoom(room.id)}
                                                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                                                    >
                                                        Xác Nhận Tham Gia
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </TooltipProvider>
    );
};

export default StudyRoomPage;