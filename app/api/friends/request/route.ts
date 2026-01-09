import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

// POST /api/friends/request - Send friend request
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json({ error: "friendId is required" }, { status: 400 });
    }

    if (userId === friendId) {
      return NextResponse.json({ error: "Cannot send friend request to yourself" }, { status: 400 });
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: friendId },
          { user1Id: friendId, user2Id: userId },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json(
        { error: "Friendship already exists or pending" },
        { status: 400 }
      );
    }

    // Create friend request
    const friendship = await prisma.friendship.create({
      data: {
        user1Id: userId,
        user2Id: friendId,
        status: "pending",
      },
      include: {
        user2: {
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
      id: friendship.id,
      status: friendship.status,
      friend: {
        id: friendship.user2.id,
        name: friendship.user2.name || friendship.user2.username || "User",
        avatar: friendship.user2.avatar || friendship.user2.avatarUrl || "https://github.com/shadcn.png",
      },
    });
  } catch (e) {
    console.error("Error sending friend request:", e);
    return NextResponse.json({ error: "Failed to send friend request" }, { status: 500 });
  }
}
