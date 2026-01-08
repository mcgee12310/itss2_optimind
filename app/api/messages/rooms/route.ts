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

// GET /api/messages/rooms - Get all chat rooms for current user
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all rooms where user is a member
    const roomMembers = await prisma.roomMember.findMany({
      where: {
        userId,
      },
      include: {
        room: {
          include: {
            members: {
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
            },
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    const rooms = roomMembers.map((rm) => ({
      id: rm.room.id,
      name: rm.room.name,
      type: rm.room.type,
      isGroup: rm.room.type === "group",
      avatar: null, // Can be customized later
      lastMessage: rm.room.messages[0]
        ? `${rm.room.messages[0].user.name}: ${rm.room.messages[0].content}`
        : "Chưa có tin nhắn",
      members: rm.room.members.map((m) => ({
        id: m.user.id,
        name: m.user.name || m.user.username || "User",
        avatar: m.user.avatar || m.user.avatarUrl || "https://github.com/shadcn.png",
      })),
    }));

    return NextResponse.json({ rooms });
  } catch (e) {
    console.error("Error fetching rooms:", e);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

// POST /api/messages/rooms - Create a new chat room (group or 1-1)
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, memberIds, isGroup } = body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length < 1) {
      return NextResponse.json(
        { error: "At least one member is required" },
        { status: 400 }
      );
    }

    // If it's a 1-1 chat, check if room already exists
    if (!isGroup && memberIds.length === 1) {
      const otherUserId = memberIds[0];
      
      // Find existing 1-1 room between these two users
      const existingRoom = await prisma.room.findFirst({
        where: {
          type: "direct",
          members: {
            every: {
              userId: {
                in: [userId, otherUserId],
              },
            },
          },
        },
        include: {
          members: {
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
          },
        },
      });

      if (existingRoom && existingRoom.members.length === 2) {
        return NextResponse.json({
          id: existingRoom.id,
          name: existingRoom.name,
          type: existingRoom.type,
          members: existingRoom.members.map((m) => ({
            id: m.user.id,
            name: m.user.name || m.user.username || "User",
            avatar: m.user.avatar || m.user.avatarUrl || "https://github.com/shadcn.png",
          })),
        });
      }
    }

    // Get other user's info for 1-1 chat name
    let roomName = name;
    if (!isGroup && memberIds.length === 1) {
      const otherUser = await prisma.user.findUnique({
        where: { id: memberIds[0] },
        select: { name: true, username: true },
      });
      roomName = otherUser?.name || otherUser?.username || "Chat";
    }

    // Create new room
    const room = await prisma.room.create({
      data: {
        name: roomName || "Nhóm mới",
        type: isGroup ? "group" : "direct",
        members: {
          create: [
            { userId },
            ...memberIds.map((id: string) => ({ userId: id })),
          ],
        },
      },
      include: {
        members: {
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
        },
      },
    });

    return NextResponse.json({
      id: room.id,
      name: room.name,
      type: room.type,
      members: room.members.map((m) => ({
        id: m.user.id,
        name: m.user.name || m.user.username || "User",
        avatar: m.user.avatar || m.user.avatarUrl || "https://github.com/shadcn.png",
      })),
    });
  } catch (e) {
    console.error("Error creating room:", e);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
