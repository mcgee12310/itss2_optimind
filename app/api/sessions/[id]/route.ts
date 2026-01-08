import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Helper lấy User ID (tái sử dụng)
function getUserIdFromCookie(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const userCookie = cookie.split(";").find((c) => c.trim().startsWith("user_data="));
  if (!userCookie) return null;
  try {
    const value = decodeURIComponent(userCookie.split("=")[1]);
    return JSON.parse(value).id;
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // 1. Lấy thông tin phiên học KÈM FocusLogs
    const session = await prisma.studySession.findUnique({
      where: { id, userId },
      include: {
        focusLogs: {
          orderBy: { timestamp: "asc" }, // Sắp xếp theo thời gian để vẽ biểu đồ
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 2. Phân tích số liệu (Analysis)
    const logs = session.focusLogs || [];
    let highFocusCount = 0; // > 80
    let mediumFocusCount = 0; // 50 - 80
    let lowFocusCount = 0; // < 50

    // Tạo dữ liệu cho biểu đồ
    const chartData = logs.map((log: any) => {
      const score = log.score;
      if (score >= 80) highFocusCount++;
      else if (score >= 50) mediumFocusCount++;
      else lowFocusCount++;

      return {
        time: new Date(log.timestamp).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        score: Math.round(score),
      };
    });

    // Tính phần trăm phân bố chất lượng
    const totalLogs = logs.length || 1;
    const distribution = {
      high: Math.round((highFocusCount / totalLogs) * 100),
      medium: Math.round((mediumFocusCount / totalLogs) * 100),
      low: Math.round((lowFocusCount / totalLogs) * 100),
    };

    return NextResponse.json({
      session,
      analysis: {
        chartData,
        distribution,
      },
    });
  } catch (error) {
    console.error("Error fetching session detail:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}