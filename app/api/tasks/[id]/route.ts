
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// // Hàm helper để lấy userId (copy từ file route.ts cũ của bạn)
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

// // DELETE: Xóa task
// export async function DELETE(
//   req: Request,
//   { params }: { params: { id: string } } // Next.js 13+ params
// ) {
//   try {
//     const userId = getUserIdFromCookie(req);
//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { id } = await params; // Await params trong Next.js mới nhất nếu cần, hoặc dùng trực tiếp params.id

//     await prisma.task.delete({
//       where: { id: id, userId }, // Thêm userId để đảm bảo chỉ xóa task của chính mình
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Delete task error:", error);
//     return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
//   }
// }

// // PATCH: Cập nhật task (Status, Title, Date...)
// export async function PATCH(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const userId = getUserIdFromCookie(req);
//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { id } = await params; 
//     const body = await req.json();
    
//     // Lọc các trường được phép update
//     const { title, description, status, priority, dueDate, startTime, endTime, tags } = body;

//     const updatedTask = await prisma.task.update({
//       where: { id: id, userId },
//       data: {
//         title,
//         description,
//         status, 
//         priority,
//         dueDate: dueDate ? new Date(dueDate) : undefined,
//         startTime: startTime ? new Date(startTime) : undefined,
//         endTime: endTime ? new Date(endTime) : undefined,
//         tags: tags ? JSON.stringify(tags) : undefined,
//       },
//     });

//     return NextResponse.json(updatedTask);
//   } catch (error) {
//     console.error("Update task error:", error);
//     return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Hàm helper để lấy userId
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
function parseTime(dateStr: string | Date, timeStr: string): Date | null {
  if (!dateStr || !timeStr) return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// DELETE: Xóa task
export async function DELETE(req: Request, context: any) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = await (context?.params ?? {});
    const { id } = params as { id: string };

    await prisma.task.delete({
      where: { id: id, userId }, 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}

// PATCH: Cập nhật task (Status, Title, Date, TimeSlot...)
export async function PATCH(req: Request, context: any) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = await (context?.params ?? {});
    const { id } = params as { id: string };
    const body = await req.json();
    
    // Lấy các trường từ body
    const { title, description, status, priority, dueDate, startTime, endTime, tags, timeSlot } = body;

    // --- 1. Xử lý Thời gian (TimeSlot) ---
    // Nếu có timeSlot (VD: "09:00 - 10:00") thì ưu tiên tính toán lại startTime/endTime
    let derivedStartTime = startTime ? new Date(startTime) : undefined;
    let derivedEndTime = endTime ? new Date(endTime) : undefined;

    if (timeSlot && typeof timeSlot === 'string' && timeSlot.includes("-")) {
        // Cần có ngày để set giờ. Nếu body gửi dueDate thì dùng, nếu không thì dùng ngày hiện tại (hoặc logic lấy từ DB nếu cần chính xác hơn)
        // Lưu ý: Frontend nên gửi kèm dueDate khi update timeSlot
        const baseDate = dueDate ? new Date(dueDate) : new Date(); 
        
        const [startStr, endStr] = timeSlot.split("-").map((s: string) => s.trim());
        const parsedStart = parseTime(baseDate, startStr);
        const parsedEnd = parseTime(baseDate, endStr);

        if (parsedStart && parsedEnd) {
            derivedStartTime = parsedStart;
            derivedEndTime = parsedEnd;
        }
    }

    // --- 2. Xử lý Tags ---
    // Tags có thể là mảng ["Họp"] hoặc chuỗi "Họp". Cần lưu thống nhất là JSON string.
    let formattedTags = undefined;
    if (tags !== undefined && tags !== null) {
        if (Array.isArray(tags)) {
            formattedTags = JSON.stringify(tags);
        } else {
            // Nếu là string single tag, wrap vào mảng rồi stringify
            formattedTags = JSON.stringify([tags]);
        }
    }

    const updatedTask = await prisma.task.update({
      where: { id: id, userId },
      data: {
        title,
        description,
        status, 
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        startTime: derivedStartTime,
        endTime: derivedEndTime,
        tags: formattedTags,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}