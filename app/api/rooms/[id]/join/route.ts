import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth-server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: roomId } = await params;
    const body = await req.json().catch(() => ({})); 
    const { password = "" } = body;

    console.log("Join room attempt:", { roomId, userId: user.id });

    await prisma.roomMember.deleteMany({
      where: {
        userId: user.id,
        roomId: { not: roomId }, 
      },
    });

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    if (!room.isActive) return NextResponse.json({ error: "Room is not active" }, { status: 400 });
    if (room._count.members >= room.maxMembers) {
      const existing = await prisma.roomMember.findUnique({
        where: { roomId_userId: { roomId, userId: user.id } }
      });
      if (!existing) {
        return NextResponse.json({ error: "Room is full" }, { status: 400 });
      }
    }

    if (room.password && room.password.length > 0 && room.password !== password) {
      return NextResponse.json({ error: "Wrong password" }, { status: 403 });
    }

    const member = await prisma.roomMember.upsert({
      where: {
        roomId_userId: {
          roomId,
          userId: user.id,
        },
      },
      update: {
        joinedAt: new Date(),
      },
      create: {
        roomId,
        userId: user.id,
      },
      include: {
        user: {
          select: { id: true, username: true, email: true, avatarUrl: true },
        },
      },
    });

    console.log("Successfully joined room:", { roomId, userId: user.id, memberId: member.id });

    return NextResponse.json({ member, success: true });
  } catch (e: any) {
    console.error("Join room error:", e);
    return NextResponse.json(
      { error: "Failed to join room - " + e.message },
      { status: 500 }
    );
  }
}