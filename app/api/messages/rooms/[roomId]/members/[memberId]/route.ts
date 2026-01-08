import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function getUserIdFromCookie(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const userCookie = cookie.split(";").find((c) => c.trim().startsWith("user_data="));
  if (!userCookie) return null;
  try {
    const value = decodeURIComponent(userCookie.split("=")[1]);
    const user = JSON.parse(value);
    return user.id;
  } catch {
    return null;
  }
}

// DELETE /api/messages/rooms/[roomId]/members/[memberId] - Remove member from room
export async function DELETE(
  req: Request,
  { params }: { params: { roomId: string; memberId: string } }
) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, memberId } = params;

    // Check if user is a member of this room
    const requesterMember = await prisma.roomMember.findFirst({
      where: {
        roomId,
        userId,
      },
    });

    if (!requesterMember) {
      return NextResponse.json(
        { error: "Not a member of this room" },
        { status: 403 }
      );
    }

    // Find the member to remove
    const memberToRemove = await prisma.roomMember.findFirst({
      where: {
        roomId,
        userId: memberId,
      },
    });

    if (!memberToRemove) {
      return NextResponse.json(
        { error: "Member not found in this room" },
        { status: 404 }
      );
    }

    // Remove the member
    await prisma.roomMember.delete({
      where: {
        id: memberToRemove.id,
      },
    });

    // Get updated member list
    const updatedMembers = await prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      members: updatedMembers.map((m) => ({
        id: m.user.id,
        name: m.user.name || m.user.username || "User",
        avatar: m.user.avatar || m.user.avatarUrl || "https://github.com/shadcn.png",
      })),
    });
  } catch (e) {
    console.error("Error removing member:", e);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
