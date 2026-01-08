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

// GET /api/friends/requests - Get pending friend requests
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get friend requests sent TO this user (pending)
    const requests = await prisma.friendship.findMany({
      where: {
        user2Id: userId,
        status: "pending",
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      requests: requests.map((req: {
        id: string;
        user1: {
          id: string;
          name: string | null;
          username: string | null;
          avatar: string | null;
          avatarUrl: string | null;
        };
        createdAt: Date;
      }) => ({
        id: req.id,
        user: {
          id: req.user1.id,
          name: req.user1.name || req.user1.username || "User",
          username: req.user1.username,
          avatar: req.user1.avatar || req.user1.avatarUrl || "https://github.com/shadcn.png",
        },
        createdAt: req.createdAt,
      })),
    });
  } catch (e) {
    console.error("Error fetching friend requests:", e);
    return NextResponse.json({ error: "Failed to fetch friend requests" }, { status: 500 });
  }
}

// POST /api/friends/requests - Accept or decline friend request
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    // Gửi lời mời kết bạn nếu có friendId
    if (body.friendId && !body.requestId && !body.action) {
      const { friendId } = body;
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
    }

    // Xử lý accept/decline nếu có requestId và action
    if (body.requestId && body.action) {
      const { requestId, action } = body;
      // Find the friend request
      const friendship = await prisma.friendship.findUnique({
        where: { id: requestId },
      });
      if (!friendship) {
        return NextResponse.json({ error: "Friend request not found" }, { status: 404 });
      }
      // Verify this request is for current user
      if (friendship.user2Id !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      if (action === "accept") {
        // Accept friend request
        const updated = await prisma.friendship.update({
          where: { id: requestId },
          data: {
            status: "accepted",
            acceptedAt: new Date(),
          },
        });
        return NextResponse.json({
          message: "Friend request accepted",
          friendship: updated,
        });
      } else if (action === "decline") {
        // Decline and delete friend request
        await prisma.friendship.delete({
          where: { id: requestId },
        });
        return NextResponse.json({
          message: "Friend request declined",
        });
      } else {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      }
    }

    // Nếu không đúng định dạng body
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  } catch (e) {
    console.error("Error processing friend request:", e);
    return NextResponse.json({ error: "Failed to process friend request" }, { status: 500 });
  }
}
