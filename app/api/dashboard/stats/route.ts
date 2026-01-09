import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper lấy userId từ cookie
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

// Helper tính khoảng cách ngày
const getDayDiff = (d1: Date, d2: Date) => {
  const t1 = new Date(d1).setHours(0, 0, 0, 0);
  const t2 = new Date(d2).setHours(0, 0, 0, 0);
  return Math.floor((t1 - t2) / (24 * 60 * 60 * 1000));
};

// GET /api/dashboard/stats - Lấy thông tin nhanh cho dashboard header
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Tính study hours hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySessions = await prisma.studySession.findMany({
      where: {
        userId,
        startTime: { gte: today, lt: tomorrow },
        endTime: { not: null },
      },
      select: { duration: true },
    });

    const totalMinutesToday = todaySessions.reduce(
      (sum: number, s: { duration?: number | null }) => sum + (s.duration || 0) / 60,
      0
    );
    const studyHoursToday = Math.round(totalMinutesToday / 60 * 10) / 10; // Làm tròn 1 chữ số

    // 2. Tính streak (chuỗi ngày liên tục)
    const allSessions = await prisma.studySession.findMany({
      where: { userId, endTime: { not: null } },
      select: { startTime: true },
      orderBy: { startTime: "desc" },
    });

    let streak = 0;
    if (allSessions.length > 0) {
      // Nhóm theo ngày (YYYY-MM-DD)
      const uniqueDays = Array.from(
        new Set(
          allSessions.map((s: { startTime: Date }) =>
            new Date(s.startTime).toISOString().split("T")[0]
          )
        )
      ) as string[];
      uniqueDays.sort((a, b) => b.localeCompare(a)); // Sắp xếp giảm dần

      const lastStudyDate = new Date(uniqueDays[0]);
      // Nếu ngày học cuối là hôm nay hoặc hôm qua thì mới tính streak
      if (getDayDiff(today, lastStudyDate) <= 1) {
        streak = 1;
        for (let i = 0; i < uniqueDays.length - 1; i++) {
          const diff = getDayDiff(
            new Date(uniqueDays[i]),
            new Date(uniqueDays[i + 1])
          );
          if (diff === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    return NextResponse.json({
      streak,
      studyHoursToday,
    });
  } catch (e) {
    console.error("Error fetching dashboard stats:", e);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
