import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth-server";
import StreamVideoProvider from "@/hooks/useStream";
import BattleRoom from "@/components/rooms/battle-room";
import StudyRoom from "@/components/rooms/study-room";
import RoomPresence from "@/components/rooms/room-presence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, username: true, email: true },
          },
        },
      },
    },
  });

  if (!room) return (
    <div className="flex items-center justify-center h-screen text-white">
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-10">
        <CardContent>
          <div className="flex flex-col items-center">
            <Lock className="w-12 h-12 text-red-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Phòng không tồn tại</h2>
            <p className="text-white/70">Vui lòng kiểm tra lại liên kết hoặc quay lại danh sách phòng.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const streamUser = {
    id: user.id,
    email: user.email || "",
    username: user.username || "User",
  };

  const glassEffect = "bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg";

  return (
    <StreamVideoProvider user={streamUser}>
      <main className="min-h-screen w-full text-white p-4 md:p-6 transition-all duration-500 overflow-x-hidden">
        <div className="max-w-7xl mx-auto pt-16 md:pt-20 pb-6 space-y-4 md:space-y-6">
          {/* <div className={cn("p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6", glassEffect)}> */}
            {/* Header */}
            {/* <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1 min-w-0 w-full lg:w-auto">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3 truncate" title={room.name}>
                  {room.name}
                </h1>
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                  {room.type === "BATTLE" ? (
                    <Badge variant="destructive" className="gap-1 bg-red-500/70 backdrop-blur-sm shadow-lg px-2 md:px-3 py-1 text-xs md:text-sm">
                      <Lock className="w-3 h-3" /> Thi Đấu
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-blue-500/20 backdrop-blur-sm text-blue-300 border border-blue-500/30 gap-1 shadow-lg px-2 md:px-3 py-1 text-xs md:text-sm">
                      <Unlock className="w-3 h-3" /> Học Tập
                    </Badge>
                  )}
                  {room.isPrivate ? (
                    <Badge variant="destructive" className="gap-1 bg-yellow-500/70 backdrop-blur-sm shadow-lg px-2 md:px-3 py-1 text-xs md:text-sm">
                      <Lock className="w-3 h-3" /> Riêng tư
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-500/20 backdrop-blur-sm text-green-300 border border-green-500/30 gap-1 shadow-lg px-2 md:px-3 py-1 text-xs md:text-sm">
                      <Unlock className="w-3 h-3" /> Công khai
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-white/5 rounded-lg border border-white/10 w-full lg:w-auto lg:ml-6">
                <Users className="w-5 md:w-6 h-5 md:h-6 text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs md:text-sm text-white/60">Thành viên</p>
                  <p className="font-bold text-lg md:text-xl">{room.members.length}</p>
                </div>
              </div>
            </div>

            {/* Danh sách thành viên */}
            {/* <Card className={glassEffect}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
                  <Users className="w-4 md:w-5 h-4 md:h-5" />
                  Thành viên trong phòng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                  {room.members.map((member: any) => (
                    <div 
                      key={member.user.id} 
                      className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-400 shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate text-sm md:text-base">{member.user.username}</p>
                        <p className="text-xs md:text-sm text-white/60 truncate">{member.user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}

            {/* Presence + Main Room */}
            {/* <div>
              <RoomPresence roomId={room.id} />
            </div>
          </div> */}
            
          <div className={cn("p-4 md:p-6 lg:p-8", glassEffect)}>
            {room.type === "BATTLE" ? (
              <BattleRoom roomId={room.id} />
            ) : (
              <StudyRoom roomId={room.id} />
            )}
          </div>
        </div>
      </main>
    </StreamVideoProvider>
  );
}