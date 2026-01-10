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

// GET /api/leaderboards - Get leaderboards
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "global";
    const limit = parseInt(url.searchParams.get("limit") || "50");

    let users;
    let friendIds: string[] = [];

    if (type === "friends") {
      // Get user's friends
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { user1Id: userId, status: "accepted" },
            { user2Id: userId, status: "accepted" },
          ],
        },
      });

      friendIds = friendships.map((f: any) =>
        f.user1Id === userId ? f.user2Id : f.user1Id
      );

      // Get leaderboard for friends + user
      users = await prisma.user.findMany({
        where: {
          id: { in: [...friendIds, userId] },
        },
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          level: true,
          exp: true,
          coins: true,
        },
        orderBy: [{ level: "desc" }, { exp: "desc" }],
        take: limit,
      });
    } else {
      // Global leaderboard
      users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          level: true,
          exp: true,
          coins: true,
        },
        orderBy: [{ level: "desc" }, { exp: "desc" }],
        take: limit,
      });
    }

    // Compute study hours per user and order by studyHours desc.
    // Use aggregated studySession durations to determine top users by hours.
    let orderedUserIds: string[] = [];
    const durationMap: Record<string, number> = {};

    if (type === "friends") {
      // Consider only friends + current user
      const targetIds = [...friendIds, userId];

      const sessionsGrouped = await prisma.studySession.groupBy({
        by: ["userId"],
        where: { userId: { in: targetIds }, endTime: { not: null } },
        _sum: { duration: true },
        orderBy: { _sum: { duration: "desc" } },
        take: limit,
      });

      sessionsGrouped.forEach((s: any) => {
        durationMap[s.userId] = s._sum?.duration || 0;
      });

      orderedUserIds = sessionsGrouped.map((s: any) => s.userId);

      // If not enough users with sessions, fill with remaining friends ordered by level/exp
      if (orderedUserIds.length < limit) {
        const remaining = targetIds.filter((id) => !orderedUserIds.includes(id));
        const extra = await prisma.user.findMany({
          where: { id: { in: remaining } },
          select: { id: true, level: true, exp: true },
          orderBy: [{ level: "desc" }, { exp: "desc" }],
          take: limit - orderedUserIds.length,
        });
        orderedUserIds.push(...extra.map((u: any) => u.id));
      }
    } else {
      // Global: rank users by total study duration across all sessions
      const sessionsGrouped = await prisma.studySession.groupBy({
        by: ["userId"],
        where: { endTime: { not: null } },
        _sum: { duration: true },
        orderBy: { _sum: { duration: "desc" } },
        take: limit,
      });

      sessionsGrouped.forEach((s: any) => {
        durationMap[s.userId] = s._sum?.duration || 0;
      });

      orderedUserIds = sessionsGrouped.map((s: any) => s.userId);

      // Fill with top users by level/exp if still under limit
      if (orderedUserIds.length < limit) {
        const extra = await prisma.user.findMany({
          where: { id: { notIn: orderedUserIds } },
          select: { id: true, level: true, exp: true },
          orderBy: [{ level: "desc" }, { exp: "desc" }],
          take: limit - orderedUserIds.length,
        });
        orderedUserIds.push(...extra.map((u: any) => u.id));
      }
    }

    // Fetch user details for the ordered ids
    const usersById = await prisma.user.findMany({
      where: { id: { in: orderedUserIds } },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        level: true,
        exp: true,
        coins: true,
      },
    });

    const userMap = new Map(usersById.map((u: any) => [u.id, u]));

    const leaderboard = orderedUserIds.map((id, index) => {
      const user = userMap.get(id) || { id, username: null, email: "", avatarUrl: null, level: 0, exp: 0, coins: 0 };
      // durations are stored in seconds; convert to hours
      const seconds = durationMap[id] || 0;
      const hours = Math.round((seconds / 3600) * 10) / 10;
      return {
        ...user,
        rank: index + 1,
        studyHours: hours,
      };
    });

    return NextResponse.json({ leaderboard });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
