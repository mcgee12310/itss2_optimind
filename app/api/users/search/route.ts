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

// GET /api/users/search - Search for users to add as friends
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";

    // Search users by name or username (excluding current user)
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: userId, // Exclude current user
            },
          },
          {
            OR: [
              {
                name: {
                  contains: query,
                },
              },
              {
                username: {
                  contains: query,
                },
              },
              {
                email: {
                  contains: query,
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        avatarUrl: true,
      },
      take: 20, // Limit results
    });

    // Get current user's friends to mark them
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
    });

    // Create a map of friend statuses
    const friendStatusMap = new Map<string, 'pending' | 'accepted'>();
    friendships.forEach((f: any) => {
      const friendId = f.user1Id === userId ? f.user2Id : f.user1Id;
      friendStatusMap.set(friendId, f.status as 'pending' | 'accepted');
    });

    // Map results with friend status
    const results = users.map((user: any) => {
      const friendStatus = friendStatusMap.get(user.id);
      return {
        id: user.id,
        name: user.name || user.username || "Unknown",
        username: user.username,
        email: user.email,
        avatar: user.avatar || user.avatarUrl || "https://github.com/shadcn.png",
        isFriend: friendStatus === 'accepted',
        friendStatus: friendStatus || 'none',
      };
    });

    return NextResponse.json({ users: results });
  } catch (e) {
    console.error("Error searching users:", e);
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
}
