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

// GET /api/messages/rooms/[roomId] - Get messages for a specific room
export async function GET(req: Request, context: any) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await (context?.params ?? {});
    const { roomId } = params as { roomId: string };

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

    // Get messages
    const messages = await prisma.message.findMany({
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
      orderBy: { createdAt: "asc" },
      take: 100, // Limit to last 100 messages
    });

    return NextResponse.json({
      messages: messages.map((msg) => ({
        id: msg.id,
        senderId: msg.userId,
        sender: {
          id: msg.user.id,
          name: msg.user.name || msg.user.username || "User",
          avatar: msg.user.avatar || msg.user.avatarUrl || "https://github.com/shadcn.png",
        },
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error("Error fetching messages:", e);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/messages/rooms/[roomId] - Send a message to a room
export async function POST(req: Request, context: any) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await (context?.params ?? {});
    const { roomId } = params as { roomId: string };
    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
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

    // Create message
    const message = await prisma.message.create({
      data: {
        roomId,
        userId,
        content: content.trim(),
      },
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
      id: message.id,
      senderId: message.userId,
      sender: {
        id: message.user.id,
        name: message.user.name || message.user.username || "User",
        avatar: message.user.avatar || message.user.avatarUrl || "https://github.com/shadcn.png",
      },
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    });
  } catch (e) {
    console.error("Error sending message:", e);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// PATCH /api/messages/rooms/[roomId] - Update room (rename, etc.)
export async function PATCH(req: Request, context: any) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await (context?.params ?? {});
    const { roomId } = params as { roomId: string };
    const body = await req.json();
    const { name } = body;

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

    // Update room
    const room = await prisma.room.update({
      where: { id: roomId },
      data: { name },
    });

    return NextResponse.json({ room });
  } catch (e) {
    console.error("Error updating room:", e);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}

// DELETE /api/messages/rooms/[roomId] - Leave or delete room
export async function DELETE(req: Request, context: any) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await (context?.params ?? {});
    const { roomId } = params as { roomId: string };

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

    // Get room info
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // If only 2 members or less, delete the entire room
    if (room.members.length <= 2) {
      await prisma.room.delete({
        where: { id: roomId },
      });
      return NextResponse.json({ message: "Room deleted" });
    }

    // Otherwise, just remove this user from the room
    await prisma.roomMember.delete({
      where: {
        id: member.id,
      },
    });

    return NextResponse.json({ message: "Left room" });
  } catch (e) {
    console.error("Error deleting/leaving room:", e);
    return NextResponse.json(
      { error: "Failed to leave room" },
      { status: 500 }
    );
  }
}
