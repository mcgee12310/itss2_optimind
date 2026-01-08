

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

// // GET /api/tasks - Get tasks
// export async function GET(req: Request) {
//   try {
//     const userId = getUserIdFromCookie(req);
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const status = searchParams.get("status");
//     const date = searchParams.get("date"); // YYYY-MM-DD

//     const where: any = { userId };
    
//     if (status) {
//       where.status = status;
//     }
    
//     // Logic lọc theo ngày: Lấy cả task có dueDate trong ngày HOẶC startTime trong ngày
//     if (date) {
//       const targetDate = new Date(date);
//       const nextDay = new Date(targetDate);
//       nextDay.setDate(nextDay.getDate() + 1);

//       where.OR = [
//         {
//           dueDate: {
//             gte: targetDate,
//             lt: nextDay,
//           },
//         },
//         {
//           startTime: {
//             gte: targetDate,
//             lt: nextDay,
//           },
//         }
//       ];
//     }

//     const tasks = await prisma.task.findMany({
//       where,
//       orderBy: [{ startTime: "asc" }, { dueDate: "asc" }], 
//     });

//     return NextResponse.json({ tasks });
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
//   }
// }

// // POST /api/tasks - Create task
// export async function POST(req: Request) {
//   try {
//     const userId = getUserIdFromCookie(req);
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await req.json();
//     const { title, description, priority, tags, dueDate, startTime, endTime, status } = body;

//     if (!title) {
//       return NextResponse.json({ error: "Title is required" }, { status: 400 });
//     }

//     // Xử lý tags: Nếu là mảng thì stringify, nếu là null/undefined thì để null
//     const tagsString = Array.isArray(tags) ? JSON.stringify(tags) : tags;

//     const task = await prisma.task.create({
//       data: {
//         userId,
//         title,
//         description,
//         priority: priority || "medium",
//         tags: tagsString, 
//         status: status || "todo",
//         dueDate: dueDate ? new Date(dueDate) : null,
//         startTime: startTime ? new Date(startTime) : null,
//         endTime: endTime ? new Date(endTime) : null,
//       },
//     });

//     return NextResponse.json({ task });
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
//   }
// }

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

// Hàm helper: Chuyển "HH:mm" thành Date dựa trên ngày
function parseTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !timeStr) return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Hàm helper: Chuyển Date thành "HH:mm"
function formatTime(date: Date): string {
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// GET /api/tasks
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const date = searchParams.get("date"); 

    const where: any = { userId };
    if (status) where.status = status;
    
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.OR = [
        { dueDate: { gte: targetDate, lt: nextDay } },
        { startTime: { gte: targetDate, lt: nextDay } }
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ startTime: "asc" }, { dueDate: "asc" }], 
    });

    // --- SỬA LỖI: Map dữ liệu trả về ---
    const formattedTasks = tasks.map((task: any) => {
      // 1. Tự động tạo timeSlot từ startTime/endTime nếu có
      let timeSlot = "09:00 - 10:00"; // Mặc định
      if (task.startTime && task.endTime) {
        timeSlot = `${formatTime(task.startTime)} - ${formatTime(task.endTime)}`;
      }

      // 2. Xử lý Tags (DB lưu chuỗi JSON hoặc string raw)
      let parsedTags = [];
      try {
        // Thử parse nếu là JSON array string
        parsedTags = task.tags ? JSON.parse(task.tags) : [];
        if (!Array.isArray(parsedTags)) parsedTags = [task.tags]; 
      } catch {
        // Nếu không phải JSON, nó là string thường
        parsedTags = task.tags ? [task.tags] : [];
      }

      return {
        ...task,
        timeSlot, // Trả về trường timeSlot cho frontend
        tags: parsedTags
      };
    });

    return NextResponse.json({ tasks: formattedTasks });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, description, priority, tags, dueDate, timeSlot, status } = body;

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    // --- SỬA LỖI: Parse timeSlot ("09:00 - 10:00") thành startTime/endTime ---
    let startTime = null;
    let endTime = null;
    
    if (dueDate && timeSlot && timeSlot.includes("-")) {
      const [startStr, endStr] = timeSlot.split("-").map((s: string) => s.trim());
      startTime = parseTime(dueDate, startStr);
      endTime = parseTime(dueDate, endStr);
    }

    // Xử lý tags: Lưu mảng thành chuỗi JSON hoặc lấy phần tử đầu tiên
    // Ở đây ta lưu tag đầu tiên dưới dạng string để đơn giản hóa cho Calendar
    const tagToSave = Array.isArray(tags) ? tags[0] : (tags?.name || tags); 

    const task = await prisma.task.create({
      data: {
        userId,
        title,
        description,
        priority: priority || "medium",
        tags: tagToSave ? JSON.stringify([tagToSave]) : null, // Lưu dưới dạng mảng JSON
        status: status || "todo",
        dueDate: dueDate ? new Date(dueDate) : null,
        startTime,
        endTime,
      },
    });

    return NextResponse.json({ task });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}