import { redirect } from "next/navigation";
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/utils/auth-server"; 
import StreamVideoProvider from "@/hooks/useStream";
import BattleRoom from "@/components/rooms/battle-room";
import StudyRoom from "@/components/rooms/study-room";

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

  if (!room) return <div>Phòng không tồn tại</div>;


  const streamUser = {
    id: user.id,
    email: user.email || "",
    username: user.username || "User",
  };


  return (
    <StreamVideoProvider user={streamUser}>
      {room.type === "BATTLE" ? (
        <BattleRoom roomId={room.id} />
      ) : (
        <StudyRoom roomId={room.id} />
      )}
    </StreamVideoProvider>
  );
}