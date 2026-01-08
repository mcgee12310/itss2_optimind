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

// POST /api/messages/rooms/[roomId]/members - Add members to room
export async function POST(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = params;
    const body = await req.json();
    const { memberIds } = body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: "memberIds array is required" },
        { status: 400 }
      );
    }

    // Check if user is a member of this room
    const member = await prisma.roomMember.findFirst({
      where: {
        roomId,
        userId,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Not a member of this room" },
        { status: 403 }
      );
    }

    // Add new members (skip if already exists)
    for (const memberId of memberIds) {
      try {
        await prisma.roomMember.create({
          data: {
            roomId,
            userId: memberId,
          },
        });
      } catch (e) {
        // Skip if member already exists
        console.log(`Member ${memberId} already in room`);
      }
    }

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
    console.error("Error adding members:", e);
    return NextResponse.json(
      { error: "Failed to add members" },
      { status: 500 }
    );
  }
}
