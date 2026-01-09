// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// function getUserIdFromCookie(req: Request): string | null {
//   const cookie = req.headers.get("cookie") || "";
//   const userCookie = cookie.split(";").find((c) => c.trim().startsWith("user_data="));
//   if (!userCookie) return null;
//   try {
//     const value = decodeURIComponent(userCookie.split("=")[1]);
//     const user = JSON.parse(value);
//     return user.id;
//   } catch {
//     return null;
//   }
// }

// // GET /api/sessions/analytics - Get analytics
// export async function GET(req: Request) {
//   try {
//     const userId = getUserIdFromCookie(req);
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const period = searchParams.get("period") || "week"; // week, month, year

//     const now = new Date();
//     let startDate = new Date();

//     if (period === "week") {
//       startDate.setDate(now.getDate() - 7);
//     } else if (period === "month") {
//       startDate.setMonth(now.getMonth() - 1);
//     } else if (period === "year") {
//       startDate.setFullYear(now.getFullYear() - 1);
//     }

//     const sessions = await prisma.studySession.findMany({
//       where: {
//         userId,
//         startTime: { gte: startDate },
//         endTime: { not: null },
//       },
//       include: {
//         focusLogs: {
//           select: { score: true },
//         },
//       },
//       orderBy: { startTime: "asc" },
//     });

//     // Calculate stats
//     const totalSessions = sessions.length;
//     const totalMinutes = sessions.reduce((sum: number, s: any) => sum + (s.duration || 0) / 60, 0);
//     const avgFocusScore =
//       sessions.length > 0
//         ? sessions.reduce((sum: number, s: any) => sum + (s.focusScore || 0), 0) / sessions.length
//         : 0;
//     const totalCoins = sessions.reduce((sum: number, s: any) => sum + s.coinsEarned, 0);
//     const totalExp = sessions.reduce((sum: number, s: any) => sum + s.expEarned, 0);

//     return NextResponse.json({
//       analytics: {
//         period,
//         totalSessions,
//         totalMinutes: Math.round(totalMinutes),
//         avgFocusScore: Math.round(avgFocusScore * 10) / 10,
//         totalCoins,
//         totalExp,
//         sessions: sessions.map((s: any) => ({
//           date: s.startTime,
//           duration: s.duration,
//           focusScore: s.focusScore,
//         })),
//       },
//     });
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
//   }
// }
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
  const t1 = new Date(d1).setHours(0,0,0,0);
  const t2 = new Date(d2).setHours(0,0,0,0);
  return Math.floor((t1 - t2) / (24 * 60 * 60 * 1000));
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "week";

    // 1. Lọc thời gian
    const now = new Date();
    let startDate = new Date();
    // Normalize start of today for 'day'
    if (period === "day") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    } else if (period === "week") {
      // last 7 days including today
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "month") {
      // last 30 days including today
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "all") {
      startDate.setFullYear(2000);
      startDate.setHours(0, 0, 0, 0);
    }

    // 2. Lấy dữ liệu Sessions
    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        startTime: { gte: startDate },
        endTime: { not: null },
      },
      orderBy: { startTime: "asc" },
    });

    // 3. Tính toán thống kê cơ bản
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum: number, s: { duration?: number | null }) => sum + (s.duration || 0) / 60, 0);
    const avgFocusScore = totalSessions > 0
      ? sessions.reduce((sum: number, s: { focusScore?: number | null }) => sum + (s.focusScore || 0), 0) / totalSessions
      : 0;
    const totalCoins = sessions.reduce((sum: number, s: { coinsEarned?: number | null }) => sum + (s.coinsEarned || 0), 0);
    const totalExp = sessions.reduce((sum: number, s: { expEarned?: number | null }) => sum + (s.expEarned || 0), 0);

    // 4. Tính Streak (Chuỗi ngày liên tục)
    const allSessionsForStreak = await prisma.studySession.findMany({
      where: { userId, endTime: { not: null } },
      select: { startTime: true },
      orderBy: { startTime: "desc" }
    });

    let currentStreak = 0;
    if (allSessionsForStreak.length > 0) {
      const today = new Date();
      // Nhóm theo ngày (YYYY-MM-DD)
      const uniqueDays = Array.from(new Set(allSessionsForStreak.map((s: any) => 
        new Date(s.startTime).toISOString().split('T')[0]
      ))) as string[];
      uniqueDays.sort();
      uniqueDays.reverse();

      const lastStudyDate = new Date(uniqueDays[0] as string);
      // Nếu ngày học cuối là hôm nay hoặc hôm qua thì mới tính streak
      if (getDayDiff(today, lastStudyDate) <= 1) {
        currentStreak = 1;
        for (let i = 0; i < uniqueDays.length - 1; i++) {
          if (getDayDiff(new Date(uniqueDays[i] as string), new Date(uniqueDays[i+1] as string)) === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // 5. Chuẩn bị dữ liệu cho biểu đồ
    let chartData: { date: string; minutes: number; focus: number }[] = [];

    if (period === "day") {
      // Hiển thị theo phiên học trong ngày (mỗi điểm là một session)
      chartData = sessions.map((s: any) => ({
        date: new Date(s.startTime as string | number | Date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        minutes: Math.round(((s.duration || 0) / 60)),
        focus: Math.round(s.focusScore || 0),
      }));
    } else {
      // Gộp theo ngày cho tuần/tháng
      const chartMap = new Map<string, { date: string; duration: number; focus: number; count: number }>();
      sessions.forEach((s: any) => {
        const dateStr = new Date(s.startTime as string | number | Date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        if (!chartMap.has(dateStr)) {
          chartMap.set(dateStr, { date: dateStr, duration: 0, focus: 0, count: 0 });
        }
        const entry = chartMap.get(dateStr)!;
        entry.duration += (s.duration || 0) / 60;
        entry.focus += (s.focusScore || 0);
        entry.count += 1;
      });
      chartData = Array.from(chartMap.values()).map((item: any) => ({
        date: item.date,
        minutes: Math.round(item.duration),
        focus: Math.round(item.focus / Math.max(1, item.count)),
      }));
    }

    return NextResponse.json({
      analytics: {
        totalSessions,
        totalMinutes: Math.round(totalMinutes),
        avgFocusScore: Math.round(avgFocusScore),
        totalCoins,
        totalExp,
        streak: currentStreak,
        chartData
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}