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
      requests: requests.map((req) => ({
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
    const { requestId, action } = body; // action: "accept" or "decline"

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "requestId and action are required" },
        { status: 400 }
      );
    }

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
  } catch (e) {
    console.error("Error processing friend request:", e);
    return NextResponse.json({ error: "Failed to process friend request" }, { status: 500 });
  }
}
